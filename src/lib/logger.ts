import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, doc, getDoc, setDoc, increment } from 'firebase/firestore';

export interface AppLog {
  action: string;
  user: string;
  details: string;
  location?: string;
  timestamp: any;
  plan?: string;
}

export async function logActivity(action: string, user: string, details: string, plan: string = 'FREE') {
  try {
    const logsRef = collection(db, 'logs');
    await addDoc(logsRef, {
      action,
      user,
      details,
      plan,
      timestamp: serverTimestamp(),
      location: 'Saudi Arabia' // Placeholder for real IP geolocation if needed
    });

    // Update global stats
    const statsRef = doc(db, 'admin', 'stats');
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      await setDoc(statsRef, {
        users: 1,
        chats: 0,
        messages: 0,
        revenue: 0
      });
    } else {
        if (action === 'SIGNUP') {
            await setDoc(statsRef, { users: increment(1) }, { merge: true });
        } else if (action === 'NEW_CHAT') {
            await setDoc(statsRef, { chats: increment(1) }, { merge: true });
        } else if (action === 'NEW_MESSAGE') {
            await setDoc(statsRef, { messages: increment(1) }, { merge: true });
        }
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getRecentLogs(count: number = 10) {
  try {
    const logsRef = collection(db, 'logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

export async function getAdminStats() {
    try {
      const statsRef = doc(db, 'admin', 'stats');
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        return statsDoc.data();
      }
      return { users: 0, chats: 0, messages: 0, revenue: 0 };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { users: 0, chats: 0, messages: 0, revenue: 0 };
    }
}
