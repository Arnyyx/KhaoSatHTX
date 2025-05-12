import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LogOut, Edit, FileText } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { logout } from "@/app/apis/logout";

interface ProfileCardProps {
    user: {
        Id: number;
        Username: string;
        OrganizationName: string;
        Name: string;
        Role: string;
        Email: string;
        Type: string;
        ProvinceId: number;
        DistrictId: number;
        WardId: number;
        Address: string;
        Position: string;
        NumberCount?: number;
        EstablishedDate: string;
        MemberTV?: number;
        MemberKTV?: number;
        Status: boolean;
        IsLocked: boolean;
        SurveySuccess: number;
        SurveyTime: number;
    };
    isAdmin?: boolean;
}

export function ProfileCard({ user, isAdmin = false }: ProfileCardProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const data = await logout();
            if (data.success) {
                Cookies.remove('token');
                Cookies.remove('userRole');
                Cookies.remove('userId');
                toast.success("Đăng xuất thành công");
                router.push('/login');
            } else {
                toast.error(data.message || 'Đăng xuất thất bại');
            }
        } catch (error) {
            toast.error("Có lỗi xảy ra khi đăng xuất");
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Thông tin cá nhân</CardTitle>
                <div className="flex items-center gap-2">
                    {!isAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/survey")}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Làm khảo sát
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/profile/edit")}
                        className="flex items-center gap-2"
                    >
                        <Edit className="h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Thông tin cơ bản</h3>
                            <div className="mt-2 space-y-2">
                                <Info label="Tên đăng nhập" value={user.Username} />
                                <Info label="Họ và tên" value={user.Name} />
                                <Info label="Email" value={user.Email} />
                                <Info label="Vai trò" value={user.Role} />
                                <Info label="Loại hình" value={user.Type} />
                                <Info label="Tổ chức" value={user.OrganizationName} />
                                <Info label="Vị trí" value={user.Position} />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Thông tin chi tiết</h3>
                            <div className="mt-2 space-y-2">
                                <Info label="Địa chỉ" value={user.Address} />
                                <Info label="Ngày thành lập" value={new Date(user.EstablishedDate).toLocaleDateString('vi-VN')} />
                                <Info label="Số thành viên" value={user.NumberCount?.toString() || "0"} />
                                <Info label="Thành viên TV" value={user.MemberTV?.toString() || "0"} />
                                <Info label="Thành viên KTV" value={user.MemberKTV?.toString() || "0"} />
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                    <Badge variant={user.Status ? "default" : "destructive"}>
                                        {user.Status ? "Hoạt động" : "Ngừng hoạt động"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Khóa tài khoản:</span>
                                    <Badge variant={user.IsLocked ? "destructive" : "default"}>
                                        {user.IsLocked ? "Đã khóa" : "Chưa khóa"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Tiến độ khảo sát:</span>
                                    <Badge variant="outline">
                                        {user.SurveySuccess}/{user.SurveyTime}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
        </div>
    );
} 