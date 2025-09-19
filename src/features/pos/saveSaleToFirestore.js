import { collection, doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export async function saveSaleToFirestore({
  storeId,
  cashier,
  cartItems,
  totalAmount,
  paymentType,
}) {
  try {
    if (!storeId) throw new Error("storeId is missing");

    const billRef = doc(collection(db, "stores", storeId, "bills"));
    const customerId = billRef.id;

    let subtotal = 0;
    let totalDiscount = 0;
    let taxAmount = 0;

    const enrichedCartItems = cartItems.map((item) => {
      const itemTotal = item.price * item.qty;
      const discount = item.discount || 0;
      const itemTax = item.itemTax || 0;

      subtotal += itemTotal;
      totalDiscount += discount;
      taxAmount += itemTax;

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        category: item.category || "Uncategorized",
        section: item.section || "General",
        discount,
        deal: item.deal || null,
        dealApplied: item.dealApplied || false,
        total: item.finalTotal || itemTotal - discount + itemTax,
        taxable: item.taxable || false,
        tax: itemTax,
        // Remove stock here, we don’t use it anymore
      };
    });

    const dataToSave = {
      customerId,
      cashier: {
        id: cashier.id,
        name: cashier.name,
        employeeId: cashier.employeeId,
      },
      cartItems: enrichedCartItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      paymentType,
      createdAt: serverTimestamp(),
    };

    console.log("✅ Saving bill data:", dataToSave);
    await setDoc(billRef, dataToSave);

    // Deduct qty from product documents instead of stock
    const qtyUpdatePromises = cartItems.map(async (item) => {
      const productRef = doc(db, "stores", storeId, "products", item.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn(`Product ${item.id} does not exist`);
        return;
      }

      const currentQty = productSnap.data().qty ?? 0;
      const newQty = Math.max(0, currentQty - item.qty);

      console.log(`Updating qty for ${item.name}: ${currentQty} -> ${newQty}`);

      await setDoc(productRef, { qty: newQty }, { merge: true });
    });

    await Promise.all(qtyUpdatePromises);

    return { success: true, billId: customerId };
  } catch (error) {
    console.error("❌ Error saving bill to Firestore:", error.message, error);
    return { success: false };
  }
}
