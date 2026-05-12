import { OpenAI } from "openai";

const REDFOX_HEADERS = {
    "User-Agent"      : "Mozilla/5.0 (Linux; Android 16; SM-A165F)",
    "Accept"          : "text/event-stream, application/json",
    "Content-Type"    : "application/json",
    "x-id-token"      : "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiMzZhYjQxYTczOTJlMTRlNjM1ZmRlM2M2YWYwOWZlYmFhM2YyZDYiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUmVkRm94IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lhc3QycGQ1MXhTS0xpbm9MdlgxWDdwenQ1NUpRU3J6MlZvNzA5a1lYUFZoakc0UT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbSJ6ZW5lYXRoLWFpIiwiYXVkIjoiemVuZWF0aC1haSIsImF1dGhfdGltZSI6MTc3NzkxNDc0OSwidXNlcl9pZCI6IjRqU0luTWl1R1ZoaGdkS3dobkNIamxGM25hdTEiLCJzdWIiOiI0alNJbk1pdUdWaGhnZEt3aG5DSGpsRjNuYXUxIiwiaWF0IjoxNzc3OTE1OTU1LCJleHAiOjE3Nzc5MTk1NTUsImVtYWlsIjoicmVkZm94ZGV2ZW1haWw3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA2NjE1MDQzNjg1NjQxMDA3MzM4Il0sImVtYWlsIjpbInJlZGZveGRldmVtYWlsN0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.f0geyRFHYfKdIYwSn54mkYTbWYovH2FLINa3DqX1h2fEP8hewy_Mt9sekEN3GML-P11SC7ZORUnz9Nki97344m0nujelLXCB-K_hSg--9AYzdFAdVjqVyiZ-tQpQWAcYrLiVdPz6pJA2Wyh3zmJ-Kzqu3aX5a1kAgdBJoCQozfwYYj6wzbG8OhpTvhLppn9k9P9BlgFKcoNqxOnGRxOVXM1teVUR9cOu70denp792aPg9P8xfPQ_75s4vPD2RK-9L4R-geaNb53AMwQ8ZR9FsgkMRafrNcHC61_Vpepb_SpNNIdahUjhqvtOqsqR-L5elQ8zokQtQS0fncTqq3QMFA",
    "authorization"   : "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjJiMzZhYjQxYTczOTJlMTRlNjM1ZmRlM2M2YWYwOWZlYmFhM2YyZDYiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUmVkRm94IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0lhc3QycGQ1MXhTS0xpbm9MdlgxWDdwenQ1NUpRU3J6MlZvNzA5a1lYUFZoakc0UT1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbSJ6ZW5lYXRoLWFpIiwiYXVkIjoiemVuZWF0aC1haSIsImF1dGhfdGltZSI6MTc3NzkxNDc0OSwidXNlcl9pZCI6IjRqU0luTWl1R1ZoaGdkS3dobkNIamxGM25hdTEiLCJzdWIiOiI0alNJbk1pdUdWaGhnZEt3aG5DSGpsRjNuYXUxIiwiaWF0IjoxNzc3OTE1OTU1LCJleHAiOjE3Nzc5MTk1NTUsImVtYWlsIjoicmVkZm94ZGV2ZW1haWw3QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTA2NjE1MDQzNjg1NjQxMDA3MzM4Il0sImVtYWlsIjpbInJlZGZveGRldmVtYWlsN0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJjdXN0b20ifX0.f0geyRFHYfKdIYwSn54mkYTbWYovH2FLINa3DqX1h2fEP8hewy_Mt9sekEN3GML-P11SC7ZORUnz9Nki97344m0nujelLXCB-K_hSg--9AYzdFAdVjqVyiZ-tQpQWAcYrLiVdPz6pJA2Wyh3zmJ-Kzqu3aX5a1kAgdBJoCQozfwYYj6wzbG8OhpTvhLppn9k9P9BlgFKcoNqxOnGRxOVXM1teVUR9cOu70denp792aPg9P8xfPQ_75s4vPD2RK-9L4R-geaNb53AMwQ8ZR9FsgkMRafrNcHC61_Vpepb_SpNNIdahUjhqvtOqsqR-L5elQ8zokQtQS0fncTqq3QMFA",
    "x-requested-with": "com.vectorion.ai",
    "origin"          : "https://zeneath.vectorion.in",
};

const API_URL = "https://zeneath.vectorion.in/app/newapi/api2.php";

async function callRedFoxModel(modelKey: string, prompt: string) {
    try {
        console.log(`Calling RedFox ${modelKey}...`);
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: REDFOX_HEADERS,
            body: JSON.stringify({
                action: "query",
                aiKey: modelKey,
                messages: [{ role: "user", content: prompt }],
                uid: "4jSInMiuGVhhgdKwhnCHjlF3nau1",
                email: "redfoxdevemail7@gmail.com",
                useSearch: false,
                skipDeduction: true
            })
        });
        
        if (!res.ok) throw new Error(`API returned ${res.status}`);

        const reader = res.body?.getReader();
        let result = "";
        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            result += data.choices[0]?.delta?.content || "";
                        } catch (e) {}
                    }
                }
            }
        }
        return result || "(لم يتم الحصول على رد من هذا الموديل)";
    } catch (e) {
        console.error(`RedFox ${modelKey} Error:`, e);
        return `(خطأ في المرحلة: ${modelKey})`;
    }
}

export async function runFusionEngine(userRequest: string, onUpdate: (text: string) => void) {
    onUpdate("🔮 جاري بدء محرك RedFox Fusion Engine...\n\n");

    // Stage 1: Planning
    onUpdate("📋 المرحلة 1: التخطيط... (Grok 4.1)\n");
    const plan = await callRedFoxModel("grok-4.1-fast-reasoning", `حلل الطلب وأنتج خطة تقنية مختصرة: ${userRequest}`);
    
    // Stage 2: Writing
    onUpdate("✍️ المرحلة 2: الكتابة... (DeepSeek v3.2)\n");
    const rawCode = await callRedFoxModel("deepseek-v3.2", `اكتب الكود الكامل بناءً على الخطة: ${plan}\nالطلب: ${userRequest}`);

    // Stage 3: Reviewing
    onUpdate("🔍 المرحلة 3: المراجعة... (Grok 4.2)\n");
    const review = await callRedFoxModel("grok-4.2-reasoning", `راجع هذا الكود وأبلّغ عن الأخطاء: ${rawCode}`);

    // Stage 4: Fixing
    onUpdate("🔧 المرحلة 4: التصحيح... (DeepSeek R1)\n");
    const fixedCode = await callRedFoxModel("deepseek-r1", `صحح الكود بناءً على المراجعة: ${review}\nالكود: ${rawCode}`);

    // Stage 5: Optimizing
    onUpdate("✨ المرحلة 5: التحسين... (Kimi K2)\n");
    const optimizedCode = await callRedFoxModel("kimi-k2", `حسن أداء وجودة هذا الكود: ${fixedCode}`);

    // Stage 6: Documentation
    onUpdate("📝 المرحلة 6: التوثيق... (Claude Sonnet 4.6)\n\n");
    const doc = await callRedFoxModel("claude-sonnet-4.6", `اكتب شرحاً وكيفية استخدام لهذا الكود: ${optimizedCode}`);

    onUpdate(`✅ تم اكتمال المعالجة عبر 6 مراحل ذكاء اصطناعي (بواسطة حمد العبدولي).\n\n${optimizedCode}\n\n${doc}`);
}
