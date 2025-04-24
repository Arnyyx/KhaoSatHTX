"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const questions = [
  "Bạn đánh giá thế nào về chất lượng sản phẩm của HTX?",
  "Bạn cảm thấy dịch vụ chăm sóc khách hàng của HTX ra sao?",
  "Bạn có hài lòng với quá trình giao hàng và thanh toán không?",
]

const options = [
  { value: "very_satisfied", label: "Rất hài lòng" },
  { value: "satisfied", label: "Hài lòng" },
  { value: "unsatisfied", label: "Không hài lòng" },
]

export default function SurveyPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const handleChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }))
  }

  const handleSubmit = () => {
    console.log("Kết quả khảo sát:", answers)
    alert("Đã gửi khảo sát!")
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Khảo sát thành viên</h1>

      {questions.map((question, index) => (
        <Card key={index}>
          <CardContent className="p-4 space-y-3">
            <p className="font-medium">{index + 1}. {question}</p>
            <RadioGroup
              value={answers[index] || ""}
              onValueChange={(val) => handleChange(index, val)}
              className="space-y-2"
            >
              {options.map(opt => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={`${index}-${opt.value}`} />
                  <Label htmlFor={`${index}-${opt.value}`}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Button className="w-full" onClick={handleSubmit}>Gửi khảo sát</Button>
    </main>
  )
}
