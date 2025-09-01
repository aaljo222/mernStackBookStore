// src/pages/AdminLogin.jsx
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import getBaseUrl from "../utils/baseURL";

// JWT exp(ms) 파싱
function getJwtExpiryMs(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return json?.exp ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

const AdminLogin = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data) => {
    setMessage("");
    try {
      const res = await axios.post(`${getBaseUrl()}/api/auth/admin`, data, {
        headers: { "Content-Type": "application/json" },
      });

      const { token } = res.data || {};
      if (!token) {
        throw new Error("No token in response");
      }

      // 토큰 저장
      localStorage.setItem("token", token);

      // 토큰 만료시간 기준으로 자동 로그아웃
      const expMs = getJwtExpiryMs(token);
      if (expMs) {
        const msLeft = Math.max(0, expMs - Date.now());
        setTimeout(() => {
          localStorage.removeItem("token");
          alert("Session expired. Please login again.");
          navigate("/");
        }, msLeft);
      }

      alert("Admin Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Please provide a valid username and password";
      setMessage(apiMsg);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* USERNAME */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
            />
            {errors.username && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API MESSAGE */}
          {message && (
            <p className="text-red-500 text-xs italic mb-3">{message}</p>
          )}

          <div className="w-full">
            <button
              type="submit"
              className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-gray-500 text-xs">
          ©2025 Book Store. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
