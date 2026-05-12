import { db } from "@/lib/firebase";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { chatId } = params;
    const chatRef = doc(db, "chats", chatId);
    
    // Check if chat exists and belongs to user
    const chatDoc = await getDoc(chatRef);
    if (!chatDoc.exists()) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chatDoc.data().userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized access to this chat" }, { status: 403 });
    }

    await deleteDoc(chatRef);

    return NextResponse.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
