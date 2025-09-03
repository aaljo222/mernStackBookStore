// src/components/Navbar.jsx
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { HiOutlineUser } from "react-icons/hi";
import {
  HiMiniBars3CenterLeft,
  HiOutlineHeart,
  HiOutlineShoppingCart,
} from "react-icons/hi2";
import { IoSearchOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import avatarImg from "../assets/avatar.png";
import { useAuth } from "../context/AuthContext"; // ✅ 추가

// src/components/Navbar.jsx (상단)
const userNavigation = [
  { name: "Books", href: "/" }, // ✅ 추가
  { name: "Dashboard", href: "/user-dashboard" },
  { name: "Orders", href: "/orders" },
  { name: "Cart Page", href: "/cart" },
  { name: "Check Out", href: "/checkout" },
];

function getAdminFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return { isAdmin: false, token: null };
  try {
    const p = jwtDecode(token); // { role, exp, ... }
    const notExpired = !p?.exp || p.exp * 1000 > Date.now();
    return { isAdmin: notExpired && p?.role === "admin", token };
  } catch {
    return { isAdmin: false, token: null };
  }
}

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);

  // ✅ AuthContext에서 현재 사용자/로그아웃 함수 가져오기
  const { user, logout } = useAuth();

  // 관리자 토큰(JWT)
  const { isAdmin } = getAdminFromToken();

  const handleLogOut = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6">
      <nav className="flex justify-between items-center">
        {/* left */}
        <div className="flex items-center md:gap-16 gap-4">
          <Link to="/">
            <HiMiniBars3CenterLeft className="size-6" />
          </Link>

          {/* search */}
          <div className="relative sm:w-72 w-40 space-x-2">
            <IoSearchOutline className="absolute inline-block left-3 inset-y-2" />
            <input
              type="text"
              placeholder="Search here"
              className="bg-[#EAEAEA] w-full py-1 md:px-8 px-6 rounded-md focus:outline-none"
            />
          </div>
        </div>
        {/* ✅ 항상 보이는 Books 링크 */}
        <Link
          to="/"
          className="hidden sm:inline-flex text-sm font-medium hover:underline"
        >
          Books
        </Link>
        {/* right */}
        <div className="relative flex items-center md:space-x-3 space-x-2">
          <div>
            {/* 1) 일반 사용자: 아바타 + 드롭다운 */}
            {user ? (
              <>
                <button onClick={() => setIsDropdownOpen((v) => !v)}>
                  <img
                    src={avatarImg}
                    alt=""
                    className={`size-7 rounded-full ${
                      user ? "ring-2 ring-blue-500" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      {userNavigation.map((item) => (
                        <li
                          key={item.name}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : // 2) 관리자: 대시보드 링크만
            isAdmin ? (
              <Link to="/dashboard" className="border-b-2 border-primary">
                Dashboard
              </Link>
            ) : (
              // 3) 미로그인: 로그인 아이콘
              <Link to="/login">
                <HiOutlineUser className="size-6" />
              </Link>
            )}
          </div>

          <button className="hidden sm:block">
            <HiOutlineHeart className="size-6" />
          </button>

          <Link
            to="/cart"
            className="bg-primary p-1 sm:px-6 px-2 flex items-center rounded-sm"
          >
            <HiOutlineShoppingCart />
            <span className="text-sm font-semibold sm:ml-1">
              {cartItems.length > 0 ? cartItems.length : 0}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
