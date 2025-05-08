"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-primary text-white py-4 shadow">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
                        <h1 className="text-xl font-semibold">Liên minh Hợp tác xã</h1>
                    </div>
                    <nav className="flex gap-6">
                        <a href="#" className="hover:underline">Văn bản</a>
                        <a href="#" className="hover:underline">Giới thiệu</a>
                        <a href="#" className="hover:underline">Tin tức</a>
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
                        © {new Date().getFullYear()} - Thiết kế bởi Arny
                    </div>
                </div>
            </footer>
        </main>
    )
}
