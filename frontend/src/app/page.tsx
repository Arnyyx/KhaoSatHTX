"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("noibat");

  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 shadow">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <h1 className="text-xl font-semibold">Liên minh Hợp tác xã</h1>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#" className="hover:underline">Văn bản</a>
            <a href="#" className="hover:underline">Giới thiệu</a>
            <a href="#" className="hover:underline">Tin tức</a>
            <Link href="/login">
              <Button variant="secondary" size="sm">Đăng nhập</Button>
            </Link>
            <Link href="/admin">
              <Button variant="secondary" size="sm">Admin</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Thông báo mới</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Thông báo khảo sát tháng 4</h3>
                <p className="text-muted-foreground mt-1">Các HTX vui lòng hoàn tất khảo sát trước ngày 30/04.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Hội nghị giao ban quý I</h3>
                <p className="text-muted-foreground mt-1">Diễn ra vào ngày 28/04 tại hội trường A, tầng 3.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Cập nhật thông tin thành viên</h3>
                <p className="text-muted-foreground mt-1">HTX vui lòng rà soát và cập nhật thông tin trước ngày 05/05.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Báo cáo kết quả năm 2024</h3>
                <p className="text-muted-foreground mt-1">Hạn chót nộp báo cáo tổng kết là 15/05/2025.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Nghị định mới</h2>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Nghị định 45/2025/NĐ-CP</h3>
                <p className="text-muted-foreground mt-1">Quy định chi tiết về hoạt động sản xuất kinh doanh của HTX nông nghiệp.</p>
                <Button variant="link" className="mt-2 p-0 h-auto text-sm">Xem chi tiết</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Nghị định 22/2025/NĐ-CP</h3>
                <p className="text-muted-foreground mt-1">Hướng dẫn quản lý và sử dụng vốn điều lệ trong hợp tác xã.</p>
                <Button variant="link" className="mt-2 p-0 h-auto text-sm">Xem chi tiết</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg">Nghị định 31/2025/NĐ-CP</h3>
                <p className="text-muted-foreground mt-1">Quy định về tổ chức bộ máy và quản lý nhân sự trong HTX.</p>
                <Button variant="link" className="mt-2 p-0 h-auto text-sm">Xem chi tiết</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-muted text-sm py-6 border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <strong>Liên minh HTX Việt Nam</strong><br />
            123 Đường Lý Thái Tổ, Q.1, TP.HCM<br />
            Email: lienminhhtx@example.com<br />
            Điện thoại: 028-1234-5678
          </div>
          <div className="text-muted-foreground">
            © {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </main>
  )
}
