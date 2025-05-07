import { UserTable } from "@/components/UserTable";

export default function Home() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <UserTable />
        </main>
    );
}