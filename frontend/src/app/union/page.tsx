import { CooperativeTable } from "@/components/CooperativeTable";

export default function Home() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Union Management</h1>
            <CooperativeTable />
        </main>
    );
}