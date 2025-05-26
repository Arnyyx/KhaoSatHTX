import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { LogOut, FileText } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { logout } from "@/app/apis/logout";
import { User } from "@/types/user";

interface ProfileCardProps {
    user: User;
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

    const renderBasicInfo = () => (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Thông tin cơ bản</h3>
            <div className="mt-2 space-y-2">
                <Info label="Tên đăng nhập" value={user.Username} />
                {user.Email && <Info label="Email" value={user.Email} />}
                <Info label="Vai trò" value={user.Role} />
                {user.Name && <Info label="Họ và tên" value={user.Name} />}
                {user.OrganizationName && <Info label="Tổ chức" value={user.OrganizationName} />}
                {user.Position && <Info label="Vị trí" value={user.Position} />}
                {user.Type && <Info label="Loại hình" value={user.Type} />}
            </div>
        </div>
    );

    const renderLocationInfo = () => (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Thông tin địa chỉ</h3>
            <div className="mt-2 space-y-2">
                {user.Province && <Info label="Tỉnh/Thành phố" value={user.Province.Name} />}
                {user.Ward && <Info label="Phường/Xã" value={user.Ward.Name} />}
                {user.Address && <Info label="Địa chỉ chi tiết" value={user.Address} />}
            </div>
        </div>
    );

    const renderOrganizationInfo = () => {
        if (isAdmin) return null;

        return (
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Thông tin tổ chức</h3>
                <div className="mt-2 space-y-2">
                    {user.EstablishedDate && (
                        <Info
                            label="Ngày thành lập"
                            value={new Date(user.EstablishedDate).toLocaleDateString('vi-VN')}
                        />
                    )}
                    {user.MemberCount !== undefined && (
                        <Info label="Số thành viên" value={user.MemberCount.toString()} />
                    )}
                    {user.IsMember !== undefined && (
                        <Info label="Là thành viên" value={user.IsMember ? "Có" : "Không"} />
                    )}
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
                    {user.SurveyTime !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Tiến độ khảo sát:</span>
                            <Badge variant="outline">
                                {user.SurveyStatus ? "1" : "0"}/{user.SurveyTime}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        );
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
                    {renderBasicInfo()}
                    {renderLocationInfo()}
                    {renderOrganizationInfo()}
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