import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import { auth, db } from "./firebase";

export type ChatMessage = {
  id: string;
  text?: string;
  senderId?: string | null;
  senderName?: string | null;
  timestamp?: { seconds?: number; nanoseconds?: number } | null;
  system?: boolean;
};

export type ChatConversation = {
  id: string;
  name: string;
  role: string;
  online?: boolean;
};

type MessagesSnapshot = {
  docs: QueryDocumentSnapshot<DocumentData>[];
};

export function subscribeMessages(callback: (messages: ChatMessage[]) => void) {
  return onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "asc")), (snapshot: MessagesSnapshot) => {
    callback(snapshot.docs.map((document) => ({ id: document.id, ...(document.data() as Omit<ChatMessage, "id">) })));
  });
}

export async function sendMessage(text: string, senderName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Vui lòng đăng nhập lại.");

  await addDoc(collection(db, "messages"), {
    text,
    senderId: user.uid,
    senderName,
    timestamp: serverTimestamp(),
  });
}
