"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface Survey {
  ID_survey: number;
  Title: string;
  Description: string;
  Status: string;
}

interface Question {
  ID_Q: number;
  question: string;
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
    console.log("🔍 Cookie ID_user tại SurveyPage:", ID_user);

    if (!ID_user) {
      setError("Không tìm thấy ID người dùng.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await fetch(`http://localhost:3001/api/profile/${ID_user}`);
        if (!userRes.ok) throw new Error("Không lấy được thông tin người dùng.");
        const user = await userRes.json();

        const role = user.role?.toLowerCase();
        const type = user.type?.toLowerCase();

        const surveyId =
          role === "htx"
            ? type === "nn"
              ? 1
              : type === "pnn"
              ? 3
              : undefined
            : role === "qtd"
            ? 2
            : undefined;

        if (!surveyId) throw new Error("Không xác định được surveyId từ vai trò và loại người dùng.");

        const [surveyRes, questionRes] = await Promise.all([
          fetch(`http://localhost:3001/api/survey/${surveyId}`),
          fetch(`http://localhost:3001/api/question/${surveyId}`),
        ]);

        if (!surveyRes.ok) throw new Error("Không thể lấy thông tin khảo sát.");
        if (!questionRes.ok) throw new Error("Không thể lấy danh sách câu hỏi.");

        const surveyData = await surveyRes.json();
        const questionData = await questionRes.json();

        if (!Array.isArray(questionData)) throw new Error("Dữ liệu câu hỏi không hợp lệ.");

        setSurvey(surveyData);
        setQuestions(questionData);
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
    const ID_user = Cookies.get("ID_user");
    if (!ID_user) {
      alert("Không tìm thấy ID người dùng.");
      return;
    }

    try {
      const payload = Object.entries(answers).map(([ID_Q, answerText]) => ({
        ID_user,
        ID_Q: parseInt(ID_Q),
        answer: answerValueMap[answerText],
      }));

      const res = await fetch("http://localhost:3001/api/result", {
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
    <div className="p-4 max-w-xl mx-auto bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Khảo sát</h1>
      <p><strong>Tiêu đề:</strong> {survey?.Title}</p>
      <p><strong>Mô tả:</strong> {survey?.Description}</p>
      <p><strong>Trạng thái:</strong> {survey?.Status === "true" ? "Đang mở" : "Đã đóng"}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Câu hỏi khảo sát</h2>
        {questions.length > 0 ? (
          questions.map((q) => (
            <div key={q.ID_Q} className="mb-4">
              <p className="font-medium">{q.question}</p>
              <div className="mt-2 space-x-4">
                {Object.keys(answerValueMap).map((option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name={`question-${q.ID_Q}`}
                      value={option}
                      checked={answers[q.ID_Q] === option}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.ID_Q]: option }))
                      }
                      className="mr-1"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Không có câu hỏi nào cho khảo sát này.</p>
        )}
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
