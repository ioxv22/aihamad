import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title = "محادثة جديدة" } = await req.json();
    const chat = await prisma.chat.create({
      data: {
        userId: session.user.id,
        title: title,
      }
    });

    // Log the activity to Firebase
    await logActivity('NEW_CHAT', session.user.email || 'Unknown', `قام ببدء محادثة جديدة: ${title}`);

    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
