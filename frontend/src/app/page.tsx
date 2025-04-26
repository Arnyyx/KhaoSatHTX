import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-center text-primary">
        Hệ thống quản lý Hợp Tác Xã
      </h1>
      <p className="text-center text-muted-foreground mb-6 max-w-md">
        Nền tảng giúp quản lý Hợp Tác Xã, khảo sát thành viên, báo cáo hiệu quả hoạt động một cách trực quan.
      </p>
      <div className="flex gap-4">
        <Link href="/home">
          <Button>Vào hệ thống</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
        <Link href="/login">
          <Button variant="default">Đăng nhập</Button>
        </Link>
        <Link href="/survey">
          <Button variant="outline">Tham gia khảo sát</Button>
        </Link>
        <Link href="/union">
          <Button variant="outline">Liên minh HTX</Button>
        </Link>
        <Link href="/provinces">
          <Button variant="outline">Tỉnh/Thành phố</Button>
        </Link>
      </div>
    </main>
  )
}
