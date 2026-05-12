import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message, rating = 5, userId } = await req.json();

    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        message,
        rating,
        userId: userId || null
      }
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
