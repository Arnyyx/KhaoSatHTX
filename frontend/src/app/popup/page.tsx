"use client";
import { useState } from 'react';

export default function BaoCaoPopup() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6">
      {/* Nút để mở popup */}
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Xem hướng dẫn
      </button>

      {/* Popup overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 md:p-10 shadow-lg relative">

            {/* Tiêu đề */}
            <h3 className="text-center font-bold uppercase text-sm mb-1">
              Bước 1: Ủy ban kiểm tra
            </h3>
            <p className="text-center text-sm mb-6 text-gray-700 italic">
              Hướng dẫn đối với Ủy ban kiểm tra
            </p>

            {/* Nội dung */}
            <p className="text-sm text-justify leading-relaxed">
              Căn cứ Kế hoạch số <u>/KH-BTV</u> ngày <u>/2025</u> của Ban Thường vụ Liên minh Hợp tác xã Việt Nam
              về việc Khảo sát đánh giá mức độ hài lòng của hợp tác xã (HTX) đối với chính quyền địa phương năm 2024,
              Liên minh HTX Việt Nam trân trọng đề nghị các HTX thành viên phối hợp, cung cấp thông tin và cho ý kiến
              Đánh giá mức độ hài lòng của HTX đối với chính quyền địa phương năm 2024 trong việc thực hiện các chủ
              trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước về kinh tế tập thể, HTX tại địa phương
            </p>

            {/* Nút ĐÓNG */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-6 rounded"
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
