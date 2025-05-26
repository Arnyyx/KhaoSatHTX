"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {
    Button,
} from "@/components/ui/button"
import { API } from "@/lib/api";
import Cookies from "js-cookie";

interface Survey {
  Id: number;
  Title: string;
  Description: string;
  Status: string;
  StartTime: string;
  EndTime: string;
}

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const ID_user = Cookies.get("ID_user");
    if (!ID_user) {
      setError("Không tìm thấy ID người dùng.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await fetch(`${API.users}/${ID_user}`);
        if (!userRes.ok) throw new Error("Không lấy được thông tin người dùng.");
        const profile = await userRes.json();

        const role = profile.user.Role?.toLowerCase();
        const type = profile.user.Type?.toLowerCase();

        const [surveyRes] = await Promise.all([
          fetch(`${API.surveys}/by_role?role=${role}&type=${type}`),
        ]);   
        if (!surveyRes.ok) throw new Error("Không thể lấy thông tin khảo sát.");
        const surveyData = await surveyRes.json();    
        console.log(surveyData);

        setSurvey(surveyData.surveys);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải dữ liệu khảo sát:", err);
        setError(err.message || "Đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Đang tải thông tin khảo sát...</div>;

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
        <button
          className="ml-2 underline text-blue-600"
          onClick={() => router.push("/login")}
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white shadow-md rounded-xl m-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Khảo sát</h1>
      {survey.map((item) => (
        <div key={item.Id} className="mb-4">
          <p><strong>Tiêu đề:</strong> {item?.Title}</p>
          <p><strong>Mô tả:</strong> {item?.Description}</p>
          <p><strong>Trạng thái:</strong> {item?.Status ? "Đang mở" : "Đã đóng"}</p>
          <p><strong>Ngày bắt đầu:</strong> {new Date(item.StartTime).toLocaleString()}</p>
          <p><strong>Ngày kết thúc:</strong> {new Date(item.EndTime).toLocaleString()}</p>
          <p><Link href={`/survey?id=${item.Id}`}><Button>Tham gia khảo sát</Button></Link></p>
        </div>
      ))}
    </div>
  );
}
