import { SurveyTable } from "@/components/surveys/SurveyTable";

export default function Home() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Quản lý Khảo sát</h1>
            <SurveyTable />
        </main>
    );
}