// src/redux/features/cart/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

const LS_KEY = "cartItems";
const load = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const save = (items) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
};

const initialState = {
  cartItems: load(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // {_id, title, price, ...}
      const found = state.cartItems.find((i) => i._id === item._id);
      if (found) {
        found.qty = (found.qty || 1) + 1;
        Swal.fire({
          position: "top-end",
          icon: "info",
          title: "Quantity increased",
          showConfirmButton: false,
          timer: 1200,
        });
      } else {
        state.cartItems.push({ ...item, qty: 1 });
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Added to cart",
          showConfirmButton: false,
          timer: 1200,
        });
      }
      save(state.cartItems);
    },
    removeFromCart: (state, action) => {
      const id = action.payload._id ?? action.payload;
      state.cartItems = state.cartItems.filter((i) => i._id !== id);
      save(state.cartItems);
    },
    clearCart: (state) => {
      state.cartItems = [];
      save(state.cartItems);
    },
    setQty: (state, action) => {
      const { _id, qty } = action.payload;
      const found = state.cartItems.find((i) => i._id === _id);
      if (found) {
        found.qty = Math.max(1, Number(qty) || 1);
        save(state.cartItems);
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, setQty } =
  cartSlice.actions;
export default cartSlice.reducer;
