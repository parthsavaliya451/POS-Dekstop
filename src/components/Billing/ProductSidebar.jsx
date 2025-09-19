import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import ProductButton from "./ProductButton";
import PreviousBill from "./PreviousBill";
import { getRecentBills } from "../../features/pos/getRecentBills";

const numberButtons = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const actionButtons = ["@", "Taxable", "NoTax", "Instant Lottery", "Lotto Lottery", "Lotto Paidout"];
const extraButtons = ["Delete", "Void", ".", "Clear Last"];

const ProductSidebar = ({ onButtonClick, storeId, refreshTrigger }) => {
  const [bills, setBills] = useState([]);
  const [currentBillIndex, setCurrentBillIndex] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showXReport, setShowXReport] = useState(false);

  useEffect(() => {
    if (storeId) {
      setShowXReport(false); // Reset X Report view on store change
      console.log("[Sidebar] Fetching recent bills for store:", storeId);
      getRecentBills(storeId).then((data) => {
        console.log("[Sidebar] Fetched bills:", data);
        setBills(data);
        if (data.length > 0) {
          setCurrentBillIndex(0);
        } else {
          setCurrentBillIndex(null);
        }
      });
    }
  }, [storeId, refreshTrigger]);

  const handlePrev = () => {
    setCurrentBillIndex((idx) => {
      if (idx === null) return null;
      const nextIndex = idx + 1;
      if (nextIndex < bills.length) return nextIndex;
      return idx;
    });
  };

  const handleNext = () => {
    setCurrentBillIndex((idx) => {
      if (idx === null) return null;
      const nextIndex = idx - 1;
      if (nextIndex >= 0) return nextIndex;
      return idx;
    });
  };

  const toggleInvoice = () => {
    setShowInvoice((prev) => !prev);
  };

  //x report
const calculateXReport = () => {
  const sectionTotals = {};

  bills.forEach((bill) => {
    if (!Array.isArray(bill.cartItems)) return;  // Use cartItems instead of items

    bill.cartItems.forEach((item) => {
      const section = item.section || "Unknown";
      const total = (item.price || 0) * (item.qty || 1); // use qty

      if (!sectionTotals[section]) {
        sectionTotals[section] = 0;
      }
      sectionTotals[section] += total;
    });
  });

  return sectionTotals;
};




  const currentBill = currentBillIndex !== null ? bills[currentBillIndex] : null;

  return (
    <Box
      sx={{
        height: "100%",
        padding: 2,
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Top Buttons */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          onClick={toggleInvoice}
          disabled={bills.length === 0}
        >
          {showInvoice ? "Hide Invoice" : "Show Invoice"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowXReport(true)}
          sx={{ ml: 1 }}
          disabled={bills.length === 0}
        >
          X Report
        </Button>
      </Box>

      {/* Previous Bill Display */}
      {showInvoice && currentBill && (
        <Box
          sx={{
            flex: "0 0 auto",
            overflowY: "auto",
            mb: 2,
            border: "1px solid #ccc",
            borderRadius: "8px",
            p: 1,
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Button
              variant="outlined"
              onClick={handlePrev}
              disabled={currentBillIndex >= bills.length - 1}
            >
              &lt;
            </Button>
            <Typography variant="h6" align="center" sx={{ flexGrow: 1 }}>
              Previous Bill ({currentBillIndex + 1} of {bills.length})
            </Typography>
            <Button
              variant="outlined"
              onClick={handleNext}
              disabled={currentBillIndex === 0}
            >
              &gt;
            </Button>
          </Box>
          <PreviousBill bill={currentBill} />
        </Box>
      )}

      {/* Manual Input Label */}
      <Box sx={{ flex: "0 0 auto", mb: 1 }}>
        <Typography variant="h6" fontWeight="bold" align="center">
          Manual Input
        </Typography>
      </Box>

      {/* Number Buttons */}
      <Box sx={{ flex: "0 0 auto", mb: 2 }}>
        <Grid container spacing={1} justifyContent="center">
          {numberButtons.map((num) => (
            <Grid item key={num} xs={1.2} minWidth={40}>
              <ProductButton label={num} onClick={onButtonClick} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ flex: "0 0 auto", mb: 2 }}>
        <Grid container spacing={1} justifyContent="center">
          {actionButtons.map((label) => (
            <Grid item key={label} xs={4}>
              <ProductButton label={label} onClick={onButtonClick} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Extra Buttons */}
      <Box sx={{ flex: "0 0 auto", mb: 2 }}>
        <Grid container spacing={1} justifyContent="center">
          {extraButtons.map((label) => (
            <Grid item key={label} xs={3}>
              <ProductButton label={label} onClick={onButtonClick} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* X Report Display */}
{showXReport && (
  <Box
    sx={{
      mt: 2,
      border: "2px dashed #333",
      borderRadius: "10px",
      p: 2,
      backgroundColor: "#fff",
      overflowY: "auto",
    }}
  >
    <Typography variant="h6" fontWeight="bold" align="center" gutterBottom>
      ------ X REPORT ------
    </Typography>
    <Typography variant="body2" align="center">
      {new Date().toLocaleString()}
    </Typography>
    <Box sx={{ mt: 2 }}>
      {Object.entries(calculateXReport()).map(([section, total]) => (
        <Box
          key={section}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            py: 0.5,
            borderBottom: "1px solid #eee",
          }}
        >
          <Typography variant="body1" fontWeight="medium">
            {section}
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            ${total.toFixed(2)}
          </Typography>
        </Box>
      ))}

      {/* Total of all sections */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: 1,
          mt: 1,
          borderTop: "2px solid #333",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          TOTAL
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          ${Object.values(calculateXReport()).reduce((a, b) => a + b, 0).toFixed(2)}
        </Typography>
      </Box>
    </Box>
    <Box sx={{ textAlign: "center", mt: 2 }}>
      <Button
        variant="outlined"
        color="error"
        onClick={() => setShowXReport(false)}
      >
        Close X Report
      </Button>
    </Box>
  </Box>
)}


    </Box>
  );
};

export default ProductSidebar;
