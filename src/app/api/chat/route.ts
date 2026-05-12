import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

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

      logActivity('NEW_MESSAGE', session.user.email || 'Unknown', `أرسل رسالة جديدة: ${lastMessage.content.substring(0, 50)}...`);
    }

    // --- INTEGRATED IMAGE GENERATION ---
    const imageKeywords = ["ارسم", "صورة", "draw", "generate image", "image of", "تخيل"];
    if (imageKeywords.some(kw => lastMessage.content.toLowerCase().includes(kw)) && openaiKey) {
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
    const systemPrompt = `أنت Aura AI، نظام ذكاء اصطناعي فائق من تطوير "حمد العبدولي".
عند إرفاق ملفات أو صور، يجب عليك تحليلها بدقة متناهية وإعطاء الأولوية للمعلومات الموجودة فيها عند الإجابة.`;
    const processedMessages = [{ role: "system", content: systemPrompt }, ...messages];

    // Helpers (Gemini, OpenAI formatters)
    const formatGeminiParts = (msg: any) => {
      const parts: any[] = [{ text: msg.content || "يرجى تحليل المحتوى المرفق بدقة:" }];
      if (msg.attachments) {
        msg.attachments.forEach((att: any) => {
          const base64Data = att.data.split(',')[1];
          parts.push({ inlineData: { data: base64Data, mimeType: att.type } });
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

    if (model.includes("gemini")) {
      const token = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!token) {
        return NextResponse.json({ error: "عذراً، مفتاح Gemini غير متوفر حالياً." }, { status: 400 });
      }
      
      const genAI = new GoogleGenerativeAI(token);
      const geminiModel = genAI.getGenerativeModel({ model });
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
              addDoc(messagesRef, {
                chatId, role: "assistant", content: fullText, model, createdAt: serverTimestamp()
              });
            }
          } catch (e) { console.error("Gemini Error:", e); }
          finally { controller.close(); }
        },
      });
    } else {
      const isGitHub = !openaiKey && githubToken;
      const finalKey = isGitHub ? githubToken : openaiKey;

      if (!finalKey) {
        return NextResponse.json({ error: "عذراً، لا يوجد مفتاح تشغيل متاح." }, { status: 400 });
      }

      const client = new OpenAI({
        apiKey: finalKey,
        baseURL: isGitHub ? "https://models.inference.ai.azure.com" : undefined
      });

      const response = await client.chat.completions.create({
        model: isGitHub ? "gpt-4o" : model,
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
          } finally {
            controller.close();
          }
        },
      });
    }

    return new Response(stream);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء معالجة طلبك: " + error.message }, { status: 500 });
  }
}
