"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import Cookies from "js-cookie";

interface Survey {
  Id: number;
  Title: string;
  Description: string;
  Status: string;
}

interface Question {
  Id: number;
  QuestionContent: string;
}

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const answerValueMap: { [key: string]: number } = {
    "Rất hài lòng": 10,
    "Hài lòng": 5,
    "Không hài lòng": 1,
  };

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

        // const surveyId = role === "htx" ? type === "nn" ? 1 : type === "pnn" ? 3 : undefined : role === "qtd" ? 2 : undefined;

        // if (!surveyId) throw new Error("Không xác định được vai trò người dùng.");

        const [surveyRes] = await Promise.all([
          fetch(`${API.surveys}/by_role?role=${role}&type=${type}`),
        ]);   
        if (!surveyRes.ok) throw new Error("Không thể lấy thông tin khảo sát.");
        const surveyData = await surveyRes.json(); 

        const [questionRes] = await Promise.all([
          fetch(`${API.questions}/by-survey?surveyId=${surveyData.surveys[0].Id}`),
        ]);
        if (!questionRes.ok) throw new Error("Không thể lấy danh sách câu hỏi.");
        const questionData = await questionRes.json();    

        if (!Array.isArray(questionData.data)) throw new Error("Dữ liệu câu hỏi không hợp lệ.");

        setQuestions(questionData.data);
        setSurvey(surveyData.surveys[0]);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải dữ liệu khảo sát:", err);
        setError(err.message || "Đã xảy ra lỗi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    const UserId = Cookies.get("ID_user");
    if (!UserId) {
      alert("Không tìm thấy ID người dùng.");
      return;
    }

    try {
      const payload = Object.entries(answers).map(([ID_Q, answerText]) => ({
        UserId,
        QuestionId: parseInt(ID_Q),
        Answer: answerValueMap[answerText],
      }));

      const res = await fetch(`${API.result}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gửi khảo sát thất bại.");

      alert("Khảo sát đã được gửi. Cảm ơn bạn!");
      Cookies.remove("user");
      Cookies.remove("ID_user");
      router.push("/login");
    } catch (err: any) {
      console.error("❌ Lỗi khi gửi khảo sát:", err);
      alert("Đã xảy ra lỗi khi gửi khảo sát.");
    }
  };

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
    <div className="p-4 max-w-6xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Khảo sát</h1>
      <p><strong>Tiêu đề:</strong> {survey?.Title}</p>
      <p><strong>Mô tả:</strong> {survey?.Description}</p>
      <p><strong>Trạng thái:</strong> {survey?.Status === "true" ? "Đang mở" : "Đã đóng"}</p>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-gray-300 p-2 text-center w-12">TT</th>
              <th rowSpan={2} className="border border-gray-300 p-2 text-center">Câu hỏi về mức độ hài lòng của hợp tác xã</th>
              <th colSpan={3} className="border border-gray-300 p-2 text-center">Mức độ hài lòng hợp tác xã đánh giá</th>
            </tr>
            <tr className="bg-gray-100">
              {Object.keys(answerValueMap).map((label, idx) => (
                <th key={idx} className="border border-gray-300 p-2 text-center w-32">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr key={q.Id} className="align-top">
                <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 p-2 whitespace-pre-wrap">{q.QuestionContent}</td>
                {Object.keys(answerValueMap).map((option, idx) => (
                  <td key={idx} className="border border-gray-300 text-center">
                    <input
                      type="radio"
                      name={`question-${q.Id}`}
                      value={option}
                      checked={answers[q.Id] === option}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.Id]: option }))
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-sm text-red-600 font-medium">
        Lưu ý: Sau khi nhấn "Hoàn thành khảo sát", tài khoản của bạn sẽ kết thúc nhiệm vụ và không thể đăng nhập lại.
      </p>

      <button
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
        onClick={handleSubmit}
      >
        Hoàn thành khảo sát
      </button>
    </div>
  );
}
