import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import router from "./routers/router";

import { Provider } from "react-redux";
import { AuthProvider } from "./context/AuthContext";
import { store } from "./redux/store"; // ✅ named import

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </Provider>
);
