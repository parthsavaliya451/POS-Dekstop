import React from "react";

const PaymentButtons = ({ onPayment }) => {
  const methods = ["Cash", "Visa", "Mastercard", "Debit"];

  return (
    <div>
      <h3>Payment Methods</h3>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        {methods.map((method) => (
          <button
            key={method}
            onClick={() => onPayment(method)}
            style={{
              flex: "1 1 30%",
              padding: "15px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            {method}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentButtons;
