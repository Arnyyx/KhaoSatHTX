// app/users/page.tsx
import { UserTable } from '@/components/users/UserTable';

export default function UsersPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Quản lý người dùng</h1>
            <UserTable />
        </div>
    );
}