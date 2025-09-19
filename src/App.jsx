// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import POS from "./pages/POS"; // your POS screen

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pos" element={<POS />} />
    </Routes>
  );
}

export default App;
