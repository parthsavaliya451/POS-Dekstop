import React, { useState } from "react";
import { TextField, Button } from "@mui/material";

const BarcodeInput = ({ onScan }) => {
  const [barcode, setBarcode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;
    onScan(barcode.trim());
    setBarcode("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <TextField
        label="Enter Barcode"
        variant="outlined"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        fullWidth
        autoFocus
      />
      <Button type="submit" variant="contained" color="primary">
        Add
      </Button>
    </form>
  );
};

export default BarcodeInput;
