import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef, 
      where("userId", "==", session.user.id),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    const chats = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title = "محادثة جديدة" } = await req.json();
    
    const chatsRef = collection(db, "chats");
    const chatDoc = await addDoc(chatsRef, {
      userId: session.user.id,
      title: title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Log the activity to Firebase (non-blocking)
    logActivity('SESSION_START', session.user.email || 'User', `بداية جلسة محادثة جديدة: ${title}`);

    return NextResponse.json({ id: chatDoc.id, title });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}
