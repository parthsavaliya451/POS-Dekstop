// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // firebase user object
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen auth state change
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Query 'stores' collection where adminEmail (or userUid) matches
        const storesRef = collection(db, "stores");
        const q = query(storesRef, where("adminEmail", "==", firebaseUser.email)); // or use uid
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setStoreId(querySnapshot.docs[0].id); // first matching storeId
        } else {
          setStoreId(null);
        }
      } else {
        setStoreId(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, storeId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
