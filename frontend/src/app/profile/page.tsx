"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api"
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'; // Import js-cookie
import { useUser } from '@/context/UserContext'
import { log } from "console";
=======
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
>>>>>>> 84d2b83e031f585e36b9ef5e352ba20f9fafa21f

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
<<<<<<< HEAD
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter();
  const { logout } = useUser()
  const token = Cookies.get('token'); // Lấy token từ cookie

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch('/api/auth/validate', {
        method: 'POST', headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        router.push('/')
      }
    }

    async function fetchProfile() {
      try {
        if (!token) {
          console.error('No token found')
          return
        }

        const response = await fetch(API.profile, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch profile')
        }

        const data = await response.json()
        setUser(data)
        console.log('Profile loaded', data)
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }

    checkAuth()
    fetchProfile()
  }, [token]) // Thêm token vào dependency array

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API.users}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          
        },
      });

      if (response.ok) {
        logout() // Gọi hàm logout từ context
        window.location.href = '/'; // Redirect
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-muted py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user ? (
              <>
                <Info label="Tên người dùng" value={user.Username} />
                <Info label="Tên đầy đủ" value={user.Name} />
                <Info label="Email" value={user.Email} />
                <Info label="Vai trò" value={user.Role} />
                <Info label="Loại hình" value={user.Type} />
                <Info label="Tổ chức" value={user.OrganizationName} />
                <Info label="Vị trí" value={user.Position} />
                <Info label="Địa chỉ" value={user.Address} />
                <Info label="Ngày thành lập" value={user.EstablishedDate} />
                <Info label="Thành viên TV" value={user.MemberTV.toString()} />
                <Info label="Thành viên KTV" value={user.MemberKTV.toString()} />
                <Info label="Trạng thái" value={user.Status ? "Hoạt động" : "Ngừng"} />
                <Info label="Bị khoá" value={user.IsLocked ? "Có" : "Không"} />
                <Info label="Số khảo sát hoàn thành" value={`${user.SurveySuccess}/${user.SurveyTime}`} />
              </>
            ) : (
              <Skeleton className="h-40 col-span-2" />
            )}
          </CardContent>
        </Card>
        <div>
          <Button variant="outline" className="mt-4 w-full" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
        <div>
          <Button variant="outline" className="mt-4 w-full" onClick={() => window.location.href = '/'}>
            Trang chủ
          </Button>
        </div>
=======
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
>>>>>>> 84d2b83e031f585e36b9ef5e352ba20f9fafa21f
      </div>
    </div>
  );
}
