import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import booksApi from "./features/books/booksApi";
import cartReducer from "./features/cart/cartSlice";
import ordersApi from "./features/orders/ordersApi";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(booksApi.middleware, ordersApi.middleware),
});

// RTK Query: 포커스/네트워크 복구 시 자동 리패치
setupListeners(store.dispatch);
