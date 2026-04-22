import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export interface NotificationData {
  userId: string;
  user_email?: string;
  senderId: string;
  senderName: string;
  title: string;
  message: string;
  type: 'assignment' | 'quiz' | 'grade' | 'admin' | 'submission' | 'support';
  icon: string;
  link?: string;
  isRead: boolean;
  createdAt: any;
}

/**
 * Creates a notification in Firestore.
 */
export async function createNotification(data: Omit<NotificationData, 'createdAt' | 'isRead'>) {
  try {
    await addDoc(collection(db, "notifications"), {
      ...data,
      isRead: false,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    console.error("Error creating notification:", err);
    return false;
  }
}

/**
 * Notifies multiple students based on their grade.
 */
export async function notifyGrade(grade: string, data: Omit<NotificationData, 'userId' | 'user_email' | 'createdAt' | 'isRead'>) {
  try {
    const studentsQuery = query(
      collection(db, "profiles"),
      where("role", "==", "student"),
      where("gradeClass", "==", grade)
    );
    
    const snapshot = await getDocs(studentsQuery);
    const promises = snapshot.docs.map(doc => 
      createNotification({
        ...data,
        userId: doc.id,
        user_email: doc.data().email
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error("Error notifying grade:", err);
    return false;
  }
}

/**
 * Notifies all students (Broadcast).
 */
export async function notifyAllStudents(data: Omit<NotificationData, 'userId' | 'user_email' | 'createdAt' | 'isRead'>) {
  try {
    const studentsQuery = query(
      collection(db, "profiles"),
      where("role", "==", "student")
    );
    
    const snapshot = await getDocs(studentsQuery);
    const promises = snapshot.docs.map(doc => 
      createNotification({
        ...data,
        userId: doc.id,
        user_email: doc.data().email
      })
    );
    
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error("Error notifying all students:", err);
    return false;
  }
}
