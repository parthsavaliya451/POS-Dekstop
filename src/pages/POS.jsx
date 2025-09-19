// src/pages/POS.jsx

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import BillingArea from "../components/Billing/BillingArea";
import PaymentButtons from "../components/Billing/PaymentButtons";
import ProductSidebar from "../components/Billing/ProductSidebar";
import BarcodeInput from "../components/Billing/BarcodeInput";
import { saveSaleToFirestore } from "../features/pos/saveSaleToFirestore";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";

const POS = () => {
  const location = useLocation();
  const { storeId } = location.state || {};

  // States
  const [storeDetails, setStoreDetails] = useState({});
  const [products, setProducts] = useState([]);
  const [scannedItems, setScannedItems] = useState([]);
  const [deals, setDeals] = useState([]);

  // Cashier login states
  const [cashier, setCashier] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [pinInput, setPinInput] = useState("");


 // Add this state to trigger refresh in sidebar
  const [billsRefreshCounter, setBillsRefreshCounter] = useState(0);


  // Fetch store details on mount
  useEffect(() => {
    if (!storeId) return;

    const fetchStoreInfo = async () => {
      try {
        const storeRef = doc(db, "stores", storeId);
        const storeSnap = await getDoc(storeRef);
        if (storeSnap.exists()) {
          setStoreDetails(storeSnap.data());
        } else {
          console.warn("Store not found");
        }
      } catch (error) {
        console.error("Error fetching store info:", error);
      }
    };

    fetchStoreInfo();
  }, [storeId]);

  // Fetch products from Firestore
  useEffect(() => {
    if (!storeId) return;

    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "stores", storeId, "products");
        const querySnapshot = await getDocs(productsRef);
        const prodList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(prodList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [storeId]);

  // Fetch deals from Firestore
useEffect(() => {
  if (!storeId) return;

  const fetchDeals = async () => {
    try {
      const dealsRef = collection(db, "stores", storeId, "deals");
      const snapshot = await getDocs(dealsRef);
      const dealList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));


      setDeals(dealList);
    } catch (error) {
      console.error("❌ Error fetching deals:", error);
    }
  };

  fetchDeals();
}, [storeId]);


  // Handle barcode scan: add/update scannedItems and apply deal discount if applicable
const handleScan = (barcode) => {

  const product = products.find((p) => p.barcode === barcode);
  if (!product) {
    console.warn("❌ Product not found for barcode:", barcode);
    alert("Product not found for barcode: " + barcode);
    return;
  }

  const deal = deals.find((d) => d.dealname === product.deal);
  const numericPrice = parseFloat(product.price) || 0;

  if (deal) {
    console.log("✅ Deal found for product:", {
      dealName: deal.dealname,
      priceOff: deal.priceoff,
      requiredQty: deal.oneeveryhowmanyscan,
    });
  } else {
    console.log("ℹ️ No deal found for this product.");
  }

  setScannedItems((prevItems) => {
    let updatedItems = [...prevItems];
    const existingIndex = updatedItems.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
      updatedItems[existingIndex].qty += 1;
    } else {
      updatedItems.push({ ...product, qty: 1 });
    }

    // Recalculate all discounts
  updatedItems = updatedItems.map((item) => {
  const matchingDeal = deals.find((d) => d.dealname === item.deal);

  if (item.deal && matchingDeal) {
    const sets = Math.floor(item.qty / matchingDeal.oneveryhowmanyscan);
    const discount = sets * matchingDeal.priceoff;

    return {
      ...item,
      price: parseFloat(item.price),
      discount,
      dealInfo: matchingDeal,
    };
  } else {
    return {
      ...item,
      price: parseFloat(item.price),
      discount: 0,
    };
  }
});


    return updatedItems;
  });
};





  // Remove scanned item
  const handleRemoveItem = (itemId) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Validate cashier login credentials
  const validateCashierLogin = async (employeeId, pin) => {
    if (!storeId) return null;
    try {
      const cashiersRef = collection(db, "stores", storeId, "cashiers");
      const q = query(
        cashiersRef,
        where("employeeId", "==", employeeId),
        where("pin", "==", pin)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() };
    } catch (error) {
      console.error("Error validating cashier login:", error);
      return null;
    }
  };

  // Handle cashier login form submit
  const handleCashierLogin = async (e) => {
    e.preventDefault();
    const cashierData = await validateCashierLogin(employeeIdInput, pinInput);
    if (cashierData) {
      setCashier(cashierData);
      setShowLoginForm(false);
      setEmployeeIdInput("");
      setPinInput("");
    } else {
      alert("Invalid Employee ID or PIN");
    }
  };

  // Logout cashier
  const handleLogout = () => {
    setCashier(null);
  };

  // Handle payment button click
  const handlePayment = async (paymentType) => {
    if (!cashier) {
      alert("Please log in as a cashier to complete payment.");
      return;
    }
    if (scannedItems.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      const totalAmount = scannedItems.reduce((sum, item) => {
        const itemTotal = item.price * item.qty;
        const discount = item.discount || 0;
        return sum + itemTotal - discount;
      }, 0);

      const result = await saveSaleToFirestore({
        storeId,
        cashier,
        cartItems: scannedItems,
        totalAmount,
        paymentType,
      });

      if (result.success) {
        alert(
          `Payment successful via ${paymentType}`
        );
        setScannedItems([]);

        // trigger sidebar refresh:
      setBillsRefreshCounter((c) => c + 1);

      } else {
        alert("Failed to save sale. Try again.");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("An error occurred while processing payment.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        padding: "10px",
        boxSizing: "border-box",
      }}
    >
      {/* Left side: Billing & payment */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginRight: "10px",
        }}
      >
        {/* Billing area */}
        <div
          style={{
            flex: 8,
            backgroundColor: "#f5f5f5",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            overflowY: "auto",
          }}
        >
          {/* Header with store info & cashier login status */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div>
              <h2>{storeDetails.storeName} - Billing Area</h2>
              <div style={{ fontSize: "14px", color: "#555" }}>
                {storeDetails.address}, {storeDetails.city} {storeDetails.state}{" "}
                {storeDetails.zipcode}
              </div>
            </div>
            <div style={{ cursor: "pointer" }}>
              {cashier ? (
                <div>
                  <span>
                    Cashier: <strong>{cashier.name}</strong>
                  </span>{" "}
                  |{" "}
                  <button
                    onClick={handleLogout}
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: "#1976d2",
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginForm(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #1976d2",
                    backgroundColor: "white",
                    color: "#1976d2",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Guest (Login)
                </button>
              )}
            </div>
          </div>

          {/* Login modal */}
          {showLoginForm && (
            <>
              <div
                onClick={() => setShowLoginForm(false)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  backgroundColor: "rgba(0,0,0,0.4)",
                  zIndex: 999,
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  padding: "30px",
                  borderRadius: "12px",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                  zIndex: 1000,
                  width: "320px",
                  maxWidth: "90vw",
                }}
              >
                <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                  Cashier Login
                </h3>
                <form onSubmit={handleCashierLogin}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                      Employee ID:
                    </label>
                    <input
                      type="text"
                      value={employeeIdInput}
                      onChange={(e) => setEmployeeIdInput(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "6px" }}>
                      PIN:
                    </label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "16px",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        backgroundColor: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginRight: "10px",
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLoginForm(false)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        backgroundColor: "#999",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* Barcode input and scanned items */}
          <BarcodeInput onScan={handleScan} />
          <BillingArea scannedItems={scannedItems} onRemoveItem={handleRemoveItem} deals={deals} />
        </div>

        {/* Payment buttons */}
        <div
          style={{
            flex: 2,
            marginTop: "10px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <PaymentButtons onPayment={handlePayment} />
        </div>
      </div>

      {/* Product sidebar */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#eaeaea",
          borderRadius: "10px",
          padding: "10px",
          overflowY: "auto",
        }}
      >
<ProductSidebar
          storeId={storeId}
          onButtonClick={(val) => console.log("Pressed:", val)}
          refreshTrigger={billsRefreshCounter}  // Pass the refresh trigger
        />
      </div>
    </div>
  );
};

export default POS;
