import { SurveyTable } from "@/components/SurveyTable";

export default function Home() {
    return (
        <main className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Survey Management</h1>
            <SurveyTable />
        </main>
    );
}