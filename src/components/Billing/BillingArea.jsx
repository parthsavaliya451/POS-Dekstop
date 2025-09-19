import React from "react";
import { Button } from "@mui/material";

const TAX_RATE = 0.13;

const BillingArea = ({ scannedItems, onRemoveItem }) => {
  const TAX_RATE = 0.13;
  let subtotal = 0;
  let taxAmount = 0;
  let totalDiscount = 0;

  return (
    <div>
      {scannedItems.map((item) => {
        const discount = item.discount || 0;
        const itemTotal = item.price * item.qty;
        const finalItemTotal = itemTotal - discount;

        subtotal += finalItemTotal;
        if (item.taxable === "yes") {
          taxAmount += finalItemTotal * TAX_RATE;
        }

        totalDiscount += discount;

        return (
          <div
            key={item.id}
            style={{
              marginBottom: "15px",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: "bold" }}>{item.name}</div>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => onRemoveItem(item.id)}
              >
                Remove
              </Button>
            </div>
            <div style={{ marginTop: "5px", marginLeft: "10px", color: "#555" }}>
              Qty: {item.qty} | Price: ${item.price.toFixed(2)} | Total: $
              {itemTotal.toFixed(2)}
              {item.taxable === "yes" && (
                <span style={{ color: "#2b7a0b", marginLeft: "10px" }}>+ 13% Tax</span>
              )}
            </div>
            {discount > 0 && (
              <div style={{ marginLeft: "10px", color: "#d32f2f", fontWeight: "bold" }}>
                Deal Applied | Discount: -${discount.toFixed(2)}
              </div>
            )}
          </div>
        );
      })}

      {scannedItems.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            borderTop: "1px solid #ccc",
            textAlign: "right",
          }}
        >
          <div>Subtotal: ${subtotal.toFixed(2)}</div>
          <div>Tax (13%): ${taxAmount.toFixed(2)}</div>
          <div style={{ color: "#d32f2f" }}>
            Total Discount: -${totalDiscount.toFixed(2)}
          </div>
          <div style={{ fontWeight: "bold", fontSize: "18px", marginTop: "5px" }}>
            Total: ${(subtotal + taxAmount).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};


export default BillingArea;
