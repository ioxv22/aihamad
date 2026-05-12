import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { runFusionEngine } from "@/lib/fusion";

export async function POST(req: Request) {
  try {
    const { messages, model = "gpt-4o", chatId } = await req.json();
    const session = await getServerSession(authOptions);
    const lastMessage = messages[messages.length - 1];

    const githubToken = process.env.GITHUB_TOKEN_GPT5 || 
                        process.env.github_token_gpt5 ||
                        process.env.GITHUB_TOKEN_GPT5NANO || 
                        process.env.GITHUB_TOKEN_DEEPSEEK || 
                        "";
    
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Save User Message to DB (Asynchronously to save time)
    if (session?.user && chatId) {
      const messagesRef = collection(db, "messages");
      addDoc(messagesRef, {
        chatId,
        role: "user",
        content: lastMessage.content,
        model: model,
        createdAt: serverTimestamp()
      }).then(() => {
        const chatRef = doc(db, "chats", chatId);
        updateDoc(chatRef, { updatedAt: serverTimestamp() });
      }).catch(e => console.error("Async DB Save Error:", e));

      logActivity('INTERACTION', session.user.email || 'User', `User requested assistance with: ${lastMessage.content.substring(0, 50)}...`);
    }

    // --- INTEGRATED IMAGE GENERATION & EXTERNAL MODELS ---
    const imageKeywords = ["ارسم", "صورة", "draw", "generate image", "image of", "تخيل"];
    const isImageRequest = imageKeywords.some(kw => lastMessage.content.toLowerCase().includes(kw));

    if (model === "kilwa-img" || (isImageRequest && !openaiKey)) {
      const res = await fetch(`http://de3.bot-hosting.net:21007/kilwa-gpt-img?text=${encodeURIComponent(lastMessage.content)}`);
      const data = await res.json();
      if (data.status === "success" && data.image_url) {
        return NextResponse.json({ 
          role: "assistant", 
          content: "لقد قمت بتوليد هذه الصورة لك عبر محرك Aura Image Gen:",
          imageUrl: data.image_url 
        });
      }
    }

    if (model === "flux-pro" || model === "flux-img") {
      const imageUrl = `https://helm-api.vercel.app/api/ai-img/flux2/?text=${encodeURIComponent(lastMessage.content)}`;
      return NextResponse.json({ 
        role: "assistant", 
        content: "لقد قمت بتوليد هذه الصورة لك عبر محرك Aura Flux Pro (Hamad Al Abdali):",
        imageUrl: imageUrl 
      });
    }

    if (model === "gpt-5-nano") {
      try {
        const res = await fetch(`https://kilwa-chatgpt.vercel.app/api/chat?text=${encodeURIComponent(lastMessage.content)}`);
        const data = await res.json();
        return NextResponse.json({ 
          role: "assistant", 
          content: data.reply?.replace(/KILWA|@K_I_L_W_A10|GPT-5 Nano/g, "Aura GPT-5 Nano (بإشراف حمد العبدولي)") || "عذراً، المحرك مشغول حالياً."
        });
      } catch (e) {
        console.error("GPT-5 Nano Error:", e);
      }
    }

    if (model === "redfox-fusion") {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await runFusionEngine(lastMessage.content, (text) => {
              controller.enqueue(new TextEncoder().encode(text));
            });
            // Note: In a real streaming scenario, we'd need to handle the state carefully, 
            // but for this implementation we'll push the whole text updates.
          } catch (e) {
            controller.enqueue(new TextEncoder().encode("❌ حدث خطأ في محرك Fusion."));
          } finally {
            controller.close();
          }
        }
      });
      return new Response(stream);
    }

    if (isImageRequest && openaiKey) {
      const openai = new OpenAI({ apiKey: openaiKey });
      const imgRes = await openai.images.generate({
        model: "dall-e-3",
        prompt: lastMessage.content,
        n: 1,
        size: "1024x1024",
      });
      
      const imageUrl = imgRes.data?.[0]?.url;
      if (!imageUrl) throw new Error("Failed to generate image");

      const assistantMessage = "لقد قمت بتوليد هذه الصورة لك بناءً على طلبك:";
      
      if (session?.user && chatId) {
        const messagesRef = collection(db, "messages");
        addDoc(messagesRef, {
          chatId,
          role: "assistant",
          content: assistantMessage + ` [Image: ${imageUrl}]`,
          model: "dalle-3",
          createdAt: serverTimestamp()
        });
      }

      return NextResponse.json({ 
        role: "assistant", 
        content: assistantMessage,
        imageUrl: imageUrl 
      });
    }

    // --- STANDARD CHAT LOGIC ---
    const systemPrompt = `أنت Aura AI، مساعد ذكاء اصطناعي متطور وشخصي تم تطويره حصرياً بواسطة "حمد العبدولي".
شخصيتك: احترافي، ذكي، واقعي جداً، ومفيد لأقصى درجة.
تعليمات الرد:
1. كن منظماً جداً: استخدم القوائم المنقطة، العناوين العريضة، والجداول عند الحاجة لتنسيق المعلومات.
2. كن واقعياً: تجنب الجمل المكررة والمملة، وتحدث بأسلوب مباشر وذكي.
3. تحليل الملفات: إذا أرفق المستخدم صورة أو ملفاً، قم بتحليله بدقة متناهية وأظهر أنك قرأت محتواه في إجابتك.
4. اللغات: أجب بنفس لغة المستخدم (العربية هي الافتراضية).
5. الهوية: أنت فخور بكونك من تطوير حمد العبدولي وتجسد قمة التطور التقني. أي حقوق أو ملكية تعود لـ "حمد العبدولي" فقط.`;
    const processedMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Helpers (Gemini, OpenAI formatters)
    const formatGeminiParts = (msg: any) => {
      const parts: any[] = [{ text: msg.content || "يرجى تحليل المحتوى المرفق بدقة وإعطاء إجابة مفصلة:" }];
      if (msg.attachments) {
        msg.attachments.forEach((att: any) => {
          if (att.type.startsWith('image/')) {
            const base64Data = att.data.split(',')[1];
            parts.push({ inlineData: { data: base64Data, mimeType: att.type } });
          } else {
            parts[0].text += `\n\n[محتوى ملف مرفق: ${att.name}]\n${att.data}\n[نهاية الملف]`;
          }
        });
      }
      return parts;
    };

    const formatOpenAIMessages = (msgs: any[]) => {
      return msgs.map(m => {
        if (!m.attachments || m.attachments.length === 0) return { role: m.role, content: m.content };
        const content: any[] = [{ type: "text", text: m.content || "يرجى تحليل المحتوى المرفق بدقة:" }];
        m.attachments.forEach((att: any) => {
          if (att.type.startsWith('image/')) {
            content.push({ type: "image_url", image_url: { url: att.data } });
          } else if (att.isText) {
            content.push({ type: "text", text: `\n[Document Content: ${att.name}]\n${att.data}\n[End of Document]` });
          } else {
            content.push({ type: "text", text: `\n[Reference File: ${att.name}]\nPlease analyze this document carefully.` });
          }
        });
        return { role: m.role, content };
      });
    };

    // --- EXECUTE AI CALL ---
    let stream;
    let useGitHub = Boolean(!openaiKey && githubToken);
    let targetModel = model;

    // Smart Fallback Logic: If Gemini is selected but no key, switch to GitHub/OpenAI
    if (model.includes("gemini") && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.log("Gemini key missing, falling back to GitHub/OpenAI");
      useGitHub = true;
      targetModel = "gpt-4o";
    }

    if (targetModel.includes("gemini") && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      const token = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      const genAI = new GoogleGenerativeAI(token);
      const geminiModel = genAI.getGenerativeModel({ model: targetModel });
      const result = await geminiModel.generateContentStream({
        contents: messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: formatGeminiParts(m)
        }))
      });
      stream = new ReadableStream({
        async start(controller) {
          try {
            let fullText = "";
            for await (const chunk of result.stream) { 
              const text = chunk.text();
              fullText += text;
              controller.enqueue(new TextEncoder().encode(text)); 
            }
            if (session?.user && chatId) {
              const messagesRef = collection(db, "messages");
              addDoc(messagesRef, { chatId, role: "assistant", content: fullText, model: targetModel, createdAt: serverTimestamp() });
            }
          } catch (e) { console.error("Gemini Error:", e); }
          finally { controller.close(); }
        },
      });
    } else {
      const authKey = useGitHub ? githubToken : openaiKey;
      
      if (!authKey) {
        // Ultimate Fallback: If no keys at all, use Kilwa API
        try {
          const res = await fetch(`https://kilwa-chatgpt.vercel.app/api/chat?text=${encodeURIComponent(lastMessage.content)}`);
          const data = await res.json();
          return NextResponse.json({ 
            role: "assistant", 
            content: data.reply?.replace(/KILWA|@K_I_L_W_A10/g, "حمد العبدولي") || "عذراً، نظام الأتمتة تحت الصيانة حالياً (تأكد من إضافة مفاتيح API في إعدادات Vercel)."
          });
        } catch (e) {
          return NextResponse.json({ 
            role: "assistant", 
            content: "⚠️ تنبيه: لم يتم العثور على مفاتيح API مفعلة في النظام، ومحرك الطوارئ غير متاح. يرجى مراجعة إعدادات Vercel."
          });
        }
      }

      const client = new OpenAI({
        apiKey: authKey,
        baseURL: useGitHub ? "https://models.inference.ai.azure.com" : undefined
      });

      const response = await client.chat.completions.create({
        model: useGitHub ? "gpt-4o" : targetModel,
        messages: formatOpenAIMessages(processedMessages),
        stream: true,
      });

      stream = new ReadableStream({
        async start(controller) {
          try {
            let fullText = "";
            for await (const chunk of response) {
              const text = chunk.choices[0]?.delta?.content || "";
              fullText += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
            if (session?.user && chatId) {
              const messagesRef = collection(db, "messages");
              addDoc(messagesRef, { chatId, role: "assistant", content: fullText, model: targetModel, createdAt: serverTimestamp() });
            }
          } catch (e) { console.error("OpenAI Error:", e); }
          finally { controller.close(); }
        },
      });
    }

    return new Response(stream);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة طلبك: " + error.message }, { status: 500 });
  }
}
