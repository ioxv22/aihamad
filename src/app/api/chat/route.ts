import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const { messages, model = "gpt-4o", chatId } = await req.json();
    const session = await getServerSession(authOptions);
    const lastMessage = messages[messages.length - 1];

    const githubToken = process.env.GITHUB_TOKEN_GPT5 || process.env.GITHUB_TOKEN_GPT5NANO || process.env.GITHUB_TOKEN_DEEPSEEK || "";
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Save User Message to DB (if chatId and session exist)
    if (session?.user && chatId) {
      await prisma.message.create({
        data: {
          chatId,
          role: "user",
          content: lastMessage.content,
          model: model,
        }
      });
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
      
      const assistantMessage = "لقد قمت بتوليد هذه الصورة لك بناءً على طلبك:";
      
      if (session?.user && chatId) {
        await prisma.message.create({
          data: {
            chatId,
            role: "assistant",
            content: assistantMessage + ` [Image: ${imgRes.data[0].url}]`,
            model: "dalle-3",
          }
        });
      }

      return NextResponse.json({ 
        role: "assistant", 
        content: assistantMessage,
        imageUrl: imgRes.data[0].url 
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
      const genAI = new GoogleGenerativeAI(token || "");
      const geminiModel = genAI.getGenerativeModel({ model });
      const result = await geminiModel.generateContentStream({
        contents: messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "model",
          parts: formatGeminiParts(m)
        }))
      });
      stream = new ReadableStream({
        async start(controller) {
          let fullText = "";
          for await (const chunk of result.stream) { 
            const text = chunk.text();
            fullText += text;
            controller.enqueue(new TextEncoder().encode(text)); 
          }
          // Save Assistant Message to DB
          if (session?.user && chatId) {
            await prisma.message.create({
              data: { chatId, role: "assistant", content: fullText, model }
            });
          }
          controller.close();
        },
      });
    } else {
      const isGitHub = !openaiKey && githubToken;
      const client = new OpenAI({
        apiKey: isGitHub ? githubToken : openaiKey,
        baseURL: isGitHub ? "https://models.inference.ai.azure.com" : undefined
      });

      let actualModel = model;
      if (isGitHub) {
        if (model.includes("gpt-5") || model === "gpt-4o") actualModel = "gpt-4o";
        else if (model.includes("deepseek")) actualModel = "DeepSeek-R1";
      }

      const response = await client.chat.completions.create({
        model: actualModel,
        messages: formatOpenAIMessages(processedMessages),
        stream: true,
      });

      stream = new ReadableStream({
        async start(controller) {
          let fullText = "";
          for await (const chunk of response) {
            const text = chunk.choices[0]?.delta?.content || "";
            fullText += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
          // Save Assistant Message to DB
          if (session?.user && chatId) {
            await prisma.message.create({
              data: { chatId, role: "assistant", content: fullText, model }
            });
          }
          controller.close();
        },
      });
    }

    return new Response(stream);

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
