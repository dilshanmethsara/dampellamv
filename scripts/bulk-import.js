const admin = require('firebase-admin');
const fs = require('fs');

// Initializing with service account
// To run: export FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}'
// Or place service-account.json in root (ignored by git)
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('../service-account.json');
  }
} catch (err) {
  console.error('Service account not found. Please set FIREBASE_SERVICE_ACCOUNT env var or create service-account.json');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function bulkImport() {
  console.log('--- STARTING BULK IMPORT ---');
  try {
    const csvData = fs.readFileSync('valid_students_rows.csv', 'utf8');
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const batch = db.batch();
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        const student_id = parts[0];
        const full_name = parts[1];
        const grade = parts[2];
        const created_at_str = parts[3];

        if (!student_id) continue;

        const studentRef = db.collection('valid_students').doc(student_id);
        batch.set(studentRef, {
            student_id: student_id,
            full_name: full_name || 'Unknown Student',
            grade: grade || null,
            created_at: created_at_str ? admin.firestore.Timestamp.fromDate(new Date(created_at_str)) : admin.firestore.Timestamp.now()
        }, { merge: true });
        
        count++;
    }

    await batch.commit();
    console.log(`Successfully imported ${count} students instantly.`);
  } catch (err) {
    console.error('Import failed:', err);
  }
}

bulkImport();
