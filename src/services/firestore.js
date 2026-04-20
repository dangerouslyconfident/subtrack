import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
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
