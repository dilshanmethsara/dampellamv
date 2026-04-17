import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
const envPath = join(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = dotenv.parse(envContent);

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "(default)");

const schoolInfo = {
  name: "MR/ Dampella M.V",
  fullName: "Dampella Maha Vidyalaya",
  motto: "Knowledge is Power, Education is the Key 🔑",
  address: "Dampella, Southern Province, Sri Lanka",
  phone: "+94 XX XXX XXXX",
  email: "info@dampellamv.lk",
  students: 60,
  teachers: 25,
  achievements: 150,
  yearsOfExcellence: 50,
  principalName: "Mr. K. Perera",
  principalMessage: "Welcome to MR/ Dampella M.V, where we believe in nurturing not just academic excellence, but the holistic development of every student...",
  vision: "To be a center of excellence in education...",
  mission: "To provide quality education that develops intellectual abilities...",
  values: ["Excellence in Education", "Integrity and Honesty", "Respect for All"],
  history: "MR/ Dampella M.V was established over 50 years ago..."
};

const validStudents = [
  { student_id: "1234", full_name: "Test Student", grade: "Grade 10" },
  { student_id: "5678", full_name: "Dilshan Methsara", grade: "Grade 11" },
  { student_id: "0001", full_name: "Admin Tester", grade: "Admin" }
];

async function seed() {
  console.log("🌱 Starting Firebase Seed...");

  try {
    // 1. Seed School Settings
    console.log("📝 Seeding school_settings...");
    await setDoc(doc(db, "school_settings", "1"), schoolInfo);

    // 2. Seed Valid Students
    console.log("👥 Seeding valid_students...");
    for (const student of validStudents) {
      // Use student_id as doc ID for easier lookups
      await setDoc(doc(db, "valid_students", student.student_id), student);
    }

    // 3. Seed Sample Announcements
    console.log("📢 Seeding announcements...");
    await addDoc(collection(db, "announcements"), {
      title: "Welcome to our new LMS!",
      summary: "We have successfully migrated to our new Firebase platform.",
      content: "All students and teachers can now log in using their registered IDs.",
      category: "announcement",
      date: new Date().toISOString(),
      featured: true
    });

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
