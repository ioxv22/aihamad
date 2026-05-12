import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message, rating = 5, userId } = await req.json();

    const feedbackRef = collection(db, "feedback");
    const feedbackDoc = await addDoc(feedbackRef, {
      name,
      email,
      message,
      rating,
      userId: userId || null,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ success: true, id: feedbackDoc.id });
  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const feedbackRef = collection(db, "feedback");
    const q = query(feedbackRef, orderBy("createdAt", "desc"), limit(6));
    const querySnapshot = await getDocs(q);
    const feedbacks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
