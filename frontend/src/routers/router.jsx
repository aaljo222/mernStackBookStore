// frontend/src/routers/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/books/CartPage";
import CheckoutPage from "../pages/books/CheckoutPage";
import SingleBook from "../pages/books/SingleBook";
import PrivateRoute from "./PrivateRoute";
import OrderPage from "../pages/books/OrderPage";

import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import ManageBooks from "../pages/dashboard/manageBooks/ManageBooks";
import AddBook from "../pages/dashboard/addBook/AddBook";
import UpdateBook from "../pages/dashboard/EditBook/UpdateBook";
import UserDashboard from "../pages/dashboard/users/UserDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "orders", element: <PrivateRoute><OrderPage /></PrivateRoute> },
      { path: "about", element: <div>About</div> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <PrivateRoute><CheckoutPage /></PrivateRoute> },
      { path: "books/:id", element: <SingleBook /> },
      { path: "user-dashboard", element: <PrivateRoute><UserDashboard /></PrivateRoute> },
    ],
  },

  // 관리자 로그인 페이지
  { path: "/admin", element: <AdminLogin /> },

  // 관리자 영역(부모만 보호)
  {
    path: "/dashboard",
    element: (
      <AdminRoute>
        <DashboardLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "add-new-book", element: <AddBook /> },
      { path: "edit-book/:id", element: <UpdateBook /> },
      { path: "manage-books", element: <ManageBooks /> },
    ],
  },
]);

export default router;
