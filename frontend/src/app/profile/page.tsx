"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api"
import Cookies from "js-cookie";

interface UserInfo {
  Username: string;
  Name: string;
  Address: string;
  Password: string;
  Position: string;
  Role: string;
  Status: boolean;
  Type: string;
  NumberCount: number;
}

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("ID_user");
    Cookies.remove("role");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
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

    fetch(`${API.users}/${ID_user}`,{ credentials: "include"})
      .then(async (res) => {
        const data = await res.json();
        console.log("🔁 DEBUG - Kết quả:", data);

        // Kiểm tra phản hồi không thành công hoặc dữ liệu không hợp lệ
        if (!res.ok) {
          throw new Error(`Lỗi server: ${data?.message || res.statusText}`);
        }
        if (!data || !data.user.Username) {
          throw new Error("Dữ liệu trả về không hợp lệ.");
        }
        

        setUserInfo(data.user);
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
      <p><strong>Tên đăng nhập:</strong> {userInfo?.Username}</p>
      <p><strong>Họ tên:</strong> {userInfo?.Name}</p>
      <p><strong>Địa chỉ:</strong> {userInfo?.Address}</p>
      <p><strong>Chức vụ:</strong> {userInfo?.Position}</p>
      <p><strong>Vai trò:</strong> {userInfo?.Role}</p>
      <p><strong>Loại:</strong> {userInfo?.Type}</p>
      <p><strong>Trạng thái:</strong> {userInfo?.Status ? "Hoạt động" : "Đã khóa"}</p>
      <p><strong>Số thành viên:</strong> {userInfo?.NumberCount}</p>

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

// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Skeleton } from "@/components/ui/skeleton"

// interface User {
//   Id: number
//   Username: string
//   OrganizationName: string
//   Name: string
//   Role: string
//   Email: string
//   Type: string
//   ProvinceId: number
//   DistrictId: number
//   WardId: number
//   Address: string
//   Position: string
//   NumberCount: number
//   EstablishedDate: string
//   MemberTV: number
//   MemberKTV: number
//   Status: boolean
//   IsLocked: boolean
//   SurveySuccess: number
//   SurveyTime: number
// }

// export default function ProfilePage() {
//   const [user, setUser] = useState<User | null>(null)

//   useEffect(() => {
//     fetch("http://localhost:3001/users/1")
//       .then(res => res.json())
//       .then(data => setUser(data))
//       .catch(console.error)
//   }, [])

//   return (
//     <main className="min-h-screen bg-muted py-10 px-4">
//       <div className="max-w-3xl mx-auto">
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
//           </CardHeader>
//           <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {user ? (
//               <>
//                 <Info label="Tên người dùng" value={user.Username} />
//                 <Info label="Tên đầy đủ" value={user.Name} />
//                 <Info label="Email" value={user.Email} />
//                 <Info label="Vai trò" value={user.Role} />
//                 <Info label="Loại hình" value={user.Type} />
//                 <Info label="Tổ chức" value={user.OrganizationName} />
//                 <Info label="Vị trí" value={user.Position} />
//                 <Info label="Địa chỉ" value={user.Address} />
//                 <Info label="Ngày thành lập" value={user.EstablishedDate} />
//                 <Info label="Thành viên TV" value={user.MemberTV.toString()} />
//                 <Info label="Thành viên KTV" value={user.MemberKTV.toString()} />
//                 <Info label="Trạng thái" value={user.Status ? "Hoạt động" : "Ngừng"} />
//                 <Info label="Bị khoá" value={user.IsLocked ? "Có" : "Không"} />
//                 <Info label="Số khảo sát hoàn thành" value={`${user.SurveySuccess}/${user.SurveyTime}`} />
//               </>
//             ) : (
//               <Skeleton className="h-40 col-span-2" />
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </main>
//   )
// }

// function Info({ label, value }: { label: string; value: string }) {
//   return (
//     <div>
//       <div className="text-sm text-muted-foreground">{label}</div>
//       <div className="font-medium">{value}</div>
//     </div>
//   )
// }
