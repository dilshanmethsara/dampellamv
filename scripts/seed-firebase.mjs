import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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

// Admin account for /admin login (Firebase Auth + admin profile)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@dampellamv.lk";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dampella2024";
const ADMIN_NAME = "Site Administrator";

async function ensureAdmin() {
  const auth = getAuth(app);
  try {
    // Create the auth user (fails if already exists)
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = cred.user.uid;
    await setDoc(doc(db, "profiles", uid), {
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "admin",
      approvalStatus: "approved",
      createdAt: new Date().toISOString()
    });
    console.log(`👑 Admin created: ${ADMIN_EMAIL}`);
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      // Account exists — verify/repair the profile role
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await setDoc(doc(db, "profiles", cred.user.uid), {
        fullName: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: "admin",
        approvalStatus: "approved",
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`👑 Admin profile ensured: ${ADMIN_EMAIL}`);
    } else {
      throw e;
    }
  }
}

async function seed() {
  console.log("🌱 Starting Firebase Seed...");

  try {
    // 0. Provision admin auth user + profile (required for /admin Firestore access)
    await ensureAdmin();

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

    // 4. Seed demo gallery images (deterministic IDs → idempotent)
    console.log("🖼️ Seeding gallery_images...");
    const demoImages = [
      { id: "demo-1", src: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop", alt: "Students in classroom", category: "Classroom" },
      { id: "demo-2", src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop", alt: "Science lab experiment", category: "Science" },
      { id: "demo-3", src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop", alt: "Sports day event", category: "Sports" },
      { id: "demo-4", src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop", alt: "Cultural performance", category: "Cultural" },
      { id: "demo-5", src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop", alt: "Library reading", category: "Library" },
      { id: "demo-6", src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=600&fit=crop", alt: "Art class", category: "Art" },
      { id: "demo-7", src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop", alt: "Computer lab", category: "ICT" },
      { id: "demo-8", src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop", alt: "Prize giving ceremony", category: "Events" },
      { id: "demo-9", src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&h=600&fit=crop", alt: "Students studying", category: "Academics" },
      { id: "demo-10", src: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop", alt: "School building", category: "Campus" },
      { id: "demo-11", src: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&h=600&fit=crop", alt: "Music class", category: "Music" },
      { id: "demo-12", src: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop", alt: "School playground", category: "Campus" }
    ];
    for (const img of demoImages) {
      await setDoc(doc(db, "gallery_images", img.id), {
        ...img,
        created_at: Timestamp.now()
      });
    }

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
