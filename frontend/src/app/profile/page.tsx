"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface UserInfo {
  username: string;
  name: string;
  address: string;
  password: string;
  position: string;
  role: string;
  status: boolean;
  type: string;
  SDT: string;
  MemberNo: number;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("ID_user");
    Cookies.remove("role");
    router.push("/");
  };

  useEffect(() => {
    const ID_user = Cookies.get("ID_user");
    console.log("ID_user trong cookie:", ID_user); // DEBUG

    if (!ID_user) {
      setError("Không tìm thấy ID_user trong cookie");
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/profile/${ID_user}`)
      .then(async (res) => {
        const data = await res.json();

        // Kiểm tra phản hồi không thành công hoặc dữ liệu không hợp lệ
        if (!res.ok) {
          throw new Error(`Lỗi server: ${data?.message || res.statusText}`);
        }
        if (!data || !data.username) {
          throw new Error("Dữ liệu trả về không hợp lệ.");
        }
        

        setUserInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Đã xảy ra lỗi khi lấy thông tin người dùng.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Đang tải thông tin người dùng...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Thông tin người dùng</h1>
      <p><strong>Tên đăng nhập:</strong> {userInfo?.username}</p>
      <p><strong>Họ tên:</strong> {userInfo?.name}</p>
      <p><strong>SĐT:</strong> {userInfo?.SDT}</p>
      <p><strong>Địa chỉ:</strong> {userInfo?.address}</p>
      <p><strong>Chức vụ:</strong> {userInfo?.position}</p>
      <p><strong>Vai trò:</strong> {userInfo?.role}</p>
      <p><strong>Loại:</strong> {userInfo?.type}</p>
      <p><strong>Trạng thái:</strong> {userInfo?.status ? "Hoạt động" : "Đã khóa"}</p>
      <p><strong>Số thành viên:</strong> {userInfo?.MemberNo}</p>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => router.push("/survey")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Làm Khảo sát
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
