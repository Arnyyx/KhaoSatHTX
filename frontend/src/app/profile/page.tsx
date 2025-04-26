"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

  useEffect(() => {
    fetch("http://localhost:3001/users/1")
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(console.error)
  }, [])

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
