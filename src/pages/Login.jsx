// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { TextField, Button, Box, Typography } from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Query store by user email after login
  async function fetchStoreByEmail(userEmail) {
    const storesRef = collection(db, "stores");
    const q = query(storesRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    } else {
      const storeDoc = querySnapshot.docs[0];
      return { id: storeDoc.id, ...storeDoc.data() };
    }
  }

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;

      const store = await fetchStoreByEmail(userEmail);

      if (!store) {
        alert("No store found for your account.");
        return;
      }

      // Redirect to POS with storeId in state
      navigate("/pos", { state: { storeId: store.id, storeName: store.storeName } });
    } catch (error) {
      alert("Login failed: " + error.message);
      console.error("Login failed:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        fullWidth
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" fullWidth onClick={handleLogin}>
        Login
      </Button>
    </Box>
  );
}

export default Login;
