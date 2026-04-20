import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * FIRESTORE SERVICE
 * Abstracts out the database logic from our UI components.
 * This demonstrates "Separation of Concerns" for your viva!
 */

// CREATE
export async function addSubscription(userId, subData) {
  // We attach the userId so a user only sees their own subscriptions
  return await addDoc(collection(db, 'subscriptions'), {
    ...subData,
    userId,
    createdAt: new Date().toISOString()
  });
}

// READ
export async function getUserSubscriptions(userId) {
  // Create a query to find all docs where userId strictly matches
  const q = query(
    collection(db, 'subscriptions'), 
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  // Map the raw Firestore documents into nice JS objects
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  }));
}

// DELETE
export async function deleteSubscription(id) {
  return await deleteDoc(doc(db, 'subscriptions', id));
}

// UPDATE (Bonus!)
export async function updateSubscription(id, updatedData) {
  const subRef = doc(db, 'subscriptions', id);
  return await updateDoc(subRef, updatedData);
}

// REPORTS (Analytics Tracking)
export async function syncMonthlyReport(userId, total, count) {
  // We use setDoc with merge:true so it continuously updates the CURRENT month's record
  // When a new month begins, this ID changes, safely locking in the previous month's historical data!
  const date = new Date();
  const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  const reportRef = doc(db, 'reports', `${userId}_${yearMonth}`);
  await setDoc(reportRef, {
    userId,
    month: yearMonth,
    total,
    subscriptionCount: count,
    updatedAt: date.toISOString()
  }, { merge: true });
}

export async function getMonthlyReports(userId) {
  const q = query(
    collection(db, 'reports'),
    where('userId', '==', userId)
  );
  
  const snapshot = await getDocs(q);
  const reports = snapshot.docs.map(doc => doc.data());
  // Sort oldest to newest locally to avoid needing Firebase composite indexes
  return reports.sort((a, b) => a.month.localeCompare(b.month));
}
