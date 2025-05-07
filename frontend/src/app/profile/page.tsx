"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api"
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'; // Import js-cookie
import { useUser } from '@/context/UserContext'
import { log } from "console";

interface User {
  Id: number
  Username: string
  OrganizationName: string
  Name: string
  Role: string
  Email: string
  Type: string
  ProvinceId: number
  DistrictId: number
  WardId: number
  Address: string
  Position: string
  NumberCount: number
  EstablishedDate: string
  MemberTV: number
  MemberKTV: number
  Status: boolean
  IsLocked: boolean
  SurveySuccess: number
  SurveyTime: number
}

export default function ProfilePage() {
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
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
