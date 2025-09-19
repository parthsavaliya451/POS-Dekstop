import React from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  Paper,
} from "@mui/material";

const TAX_RATE = 0.13;

const PreviousBill = ({ bill }) => {
  if (!bill) {
    return (
      <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 4 }}>
        No previous bill found.
      </Typography>
    );
  }

  const {
    cartItems,
    cashier,
    paymentType,
    totalAmount,
    createdAt,
    customerId,
    id,
  } = bill;

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleString();
  };

  // Compute all necessary totals
  let subtotal = 0;
  let taxTotal = 0;
  let totalDiscount = 0;

  const enhancedCartItems = cartItems.map((item) => {
    const itemSubtotal = item.price * item.qty;
    const discount = item.discount || 0;
    const taxableAmount = itemSubtotal - discount;

    const isTaxable = ["true", "yes", true].includes(item.taxable);
    const tax = isTaxable ? +(taxableAmount * TAX_RATE).toFixed(2) : 0;
    const total = +(taxableAmount + tax).toFixed(2);

    subtotal += taxableAmount;
    taxTotal += tax;
    totalDiscount += discount;

    return {
      ...item,
      itemSubtotal,
      discount,
      tax,
      total,
    };
  });


  const grandTotal = +(subtotal + taxTotal).toFixed(2);

  return (
    <Paper elevation={3} sx={{ maxHeight: "100%", overflowY: "auto", p: 3, bgcolor: "#fafafa", borderRadius: 3 }}>
      {/* Header */}
      <Box mb={2}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Invoice ID: {id}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Date: {formatDate(createdAt)}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Customer ID: {customerId || "N/A"}
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Items List */}
      <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
        Items
      </Typography>
      <List dense sx={{ mb: 2 }}>
        {enhancedCartItems.map((item, index) => (
          <ListItem
            key={index}
            sx={{
              py: 2,
              px: 0,
              flexDirection: "column",
              borderBottom: "1px solid #e0e0e0",
              mb: 1,
            }}
          >
            <Box width="100%" display="flex" justifyContent="space-between">
              <Typography variant="body1" fontWeight="medium">{item.name}</Typography>
              <Typography variant="body1" fontWeight="medium">
                ${item.price.toFixed(2)} x {item.qty} = ${item.itemSubtotal.toFixed(2)}
              </Typography>
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
              Category: {item.category} | Section: {item.section}
            </Typography>

            {item.deal && (
              <Typography variant="caption" color="primary" fontWeight="medium">
                Deal Applied: {item.deal}
              </Typography>
            )}

            {item.discount > 0 && (
              <Typography variant="caption" color="error">
                Discount: -${item.discount.toFixed(2)}
              </Typography>
            )}

            {item.taxable && item.tax > 0 && (
              <Typography variant="caption" color="secondary">
                Tax (13%): +${item.tax.toFixed(2)}
              </Typography>
            )}

            <Box
              width="100%"
              display="flex"
              justifyContent="space-between"
              mt={1}
              bgcolor="#f0f4ff"
              px={1.5}
              py={0.5}
              borderRadius={1}
            >
              <Typography variant="body2" fontWeight="bold">
                → Item Total:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                ${item.total.toFixed(2)}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* Footer Details */}
      <Box mb={1}>
        <Typography variant="body2" color="textSecondary">
          Cashier: <strong>{cashier?.name || "Unknown"}</strong> (Employee ID: {cashier?.employeeId || "N/A"})
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Payment Type: <strong>{paymentType || "N/A"}</strong>
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Total Section */}
      <Box sx={{ bgcolor: "#e3f2fd", p: 2, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="medium">Subtotal:</Typography>
          <Typography variant="body2" fontWeight="medium">${subtotal.toFixed(2)}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="medium">Discounts:</Typography>
          <Typography variant="body2" fontWeight="medium" color="error">-${totalDiscount.toFixed(2)}</Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="medium">Tax:</Typography>
          <Typography variant="body2" fontWeight="medium">${taxTotal.toFixed(2)}</Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold" color="primary">Total:</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">${grandTotal.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreviousBill;
