// src/features/pos/getRecentBills.js
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

export async function getRecentBills(storeId) {
  try {
    const billsRef = collection(db, "stores", storeId, "bills");
    const q = query(billsRef, orderBy("createdAt", "desc")); // Removed limit
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const bills = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return bills;
  } catch (error) {
    console.error("Error fetching recent bills:", error);
    return [];
  }
}
