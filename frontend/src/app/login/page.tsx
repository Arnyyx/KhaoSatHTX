"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaLock, FaHome, FaSignInAlt } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username && password) {
      router.push("/survey");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-md w-full max-w-md border border-gray-200">
        <div className="bg-white text-center border-b border-gray-300 p-4 rounded-t-md">
          <h3 className="text-xl font-bold leading-6">
            Đăng nhập - Ủy ban kiểm tra <br /> Liên Minh HTX Việt Nam
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tên tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            />
            <FaUser className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500"
            />
            <FaLock className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <div className="flex justify-between gap-2">
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              <FaSignInAlt />
              Đăng nhập
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
              <FaHome />
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
