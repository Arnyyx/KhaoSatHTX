"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api";
import { useSearchParams } from "next/navigation";
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
interface Result {
  Id: number;
  UserId: number;
  QuestionId: number;
  Answer: number;
}

export default function SurveyPage() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const answerValueMap: { [key: string]: number } = {
    "Rất hài lòng": 5,
    "Hài lòng": 3,
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
        const userRes = await fetch(`${API.users}/survey/status?survey_id=${id}&user_id=${ID_user}`);
        if (!userRes.ok) throw new Error("Không lấy được thông tin người dùng.");
        const profile = await userRes.json();
        if (profile.IsLocked) {
          if (profile.SurveyTime !== null) {
            const resultRes = await fetch(`${API.result}?survey_id=${id}&user_id=${ID_user}`);
            if (!resultRes.ok) throw new Error("Không lấy được kết quả khảo sát.");
            const resultData = await resultRes.json();
            setResults(resultData);
            setIsLocked(true);
          } else {
            setIsLocked(true);
          }
        }

        const [surveyRes] = await Promise.all([
          fetch(`${API.surveys}/${id}`),
        ]);   
        if (!surveyRes.ok) throw new Error("Không thể lấy thông tin khảo sát.");
        const surveyData = await surveyRes.json(); 

        const [questionRes] = await Promise.all([
          fetch(`${API.questions}/by-survey?surveyId=${id}`),
        ]);
        if (!questionRes.ok) throw new Error("Không thể lấy danh sách câu hỏi.");
        const questionData = await questionRes.json();    

        if (!Array.isArray(questionData.data)) throw new Error("Dữ liệu câu hỏi không hợp lệ.");

        setQuestions(questionData.data);
        setSurvey(surveyData.survey);
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
      router.push("/surveys_list");
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
  <h1 className="text-xl sm:text-2xl font-bold mb-4 text-blue-600 text-center sm:text-left">Khảo sát</h1>

  <div className="space-y-2 text-sm sm:text-base">
    <p><strong>Tiêu đề:</strong> {survey?.Title}</p>
    <p><strong>Mô tả:</strong> {survey?.Description}</p>
    <p><strong>Trạng thái:</strong> {survey?.Status ? "Đang mở" : "Đã đóng"}</p>
  </div>
  {isLocked ?
  <p className="mt-6 text-sm text-red-600 font-medium text-center sm:text-left">
    Bạn đã hoàn thành khảo sát. Kết quả khảo sát của bạn đã được lưu lại.
  </p>
  : null}
  <div className="mt-6 overflow-x-auto">
    <table className="min-w-full border border-gray-300 text-sm sm:text-base">
      <thead>
        <tr className="bg-gray-100">
          <th rowSpan={2} className="border border-gray-300 p-2 text-center w-12">TT</th>
          <th rowSpan={2} className="border border-gray-300 p-2 text-center min-w-[300px] sm:min-w-[400px]">
            Câu hỏi về mức độ hài lòng của hợp tác xã
          </th>
          <th colSpan={3} className="border border-gray-300 p-2 text-center">
            Mức độ hài lòng hợp tác xã đánh giá
          </th>
        </tr>
        <tr className="bg-gray-100">
          {Object.keys(answerValueMap).map((label, idx) => (
            <th key={idx} className="border border-gray-300 p-2 text-center w-[60px] sm:w-[100px]">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {questions.map((q, index) => (
          <tr key={q.Id} className="align-top">
            <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
            <td className="border border-gray-300 p-2 whitespace-pre-wrap min-w-[300px] sm:min-w-[400px]">
              {q.QuestionContent}
            </td>
            {Object.keys(answerValueMap).map((option, idx) => (
              <td key={idx} className="border border-gray-300 text-center w-[60px] sm:w-[100px]">
                <input
                  type="radio"
                  name={`question-${q.Id}`}
                  value={option}
                  checked={isLocked ? results.some(r => r.QuestionId === q.Id && r.Answer === answerValueMap[option]) : answers[q.Id] === option}
                  disabled={isLocked}
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
  {!isLocked ?
  <p className="mt-6 text-sm text-red-600 font-medium text-center sm:text-left">
    Lưu ý: Sau khi nhấn "Hoàn thành khảo sát", tài khoản của bạn sẽ kết thúc nhiệm vụ và không thể đăng nhập lại.
  </p>
  : null}
  {!isLocked ?
  <div className="flex justify-center sm:justify-start">
    <button
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm sm:text-base"
      onClick={handleSubmit}
      disabled={isLocked}
    >
      Hoàn thành khảo sát
    </button>
  </div>
  : null}
</div>


  );
}
