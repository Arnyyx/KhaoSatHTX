"use client";

import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { FaCheckCircle, FaComments, FaProjectDiagram, FaCogs, FaPen, FaClipboardCheck } from "react-icons/fa";
import "@fortawesome/fontawesome-free/css/all.min.css";

const newsItems = [
  {
    title: "TIÊU ĐỀ TIN TỨC",
    description:
      "Căn cứ Kế hoạch số  /KH-BTV ngày  / 2025 của Ban Thường vụ Liên minh Hợp tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài lòng của hợp tác xã (HTX) đối với chính quyền địa phương năm 2024",
    image: "/assets/img/UBKT_2025_TEM-05.jpg",
    image: "/assets/img/UBKT_2025_TEM-05.jpg",
  },
  {
    title: "TIÊU ĐỀ TIN TỨC",
    description:
      "Căn cứ Kế hoạch số  /KH-BTV ngày  / 2025 của Ban Thường vụ Liên minh Hợp tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài lòng của hợp tác xã (HTX) đối với chính quyền địa phương năm 2024",
    image: "/assets/img/UBKT_2025_TEM-05.jpg",
  },
  {
    title: "TIÊU ĐỀ TIN TỨC",
    description:
      "Căn cứ Kế hoạch số  /KH-BTV ngày  / 2025 của Ban Thường vụ Liên minh Hợp tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài lòng của hợp tác xã (HTX) đối với chính quyền địa phương năm 2024",
    image: "/assets/img/UBKT_2025_TEM-05.jpg",
  },
];

const steps = [
  { id: 1, title: "UBKT", icon: <FaCheckCircle size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
  { id: 2, title: "LIÊN MINH HỢP TÁC XÃ TỈNH/THÀNH PHỐ", icon: <FaComments size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
  { id: 3, title: "HỢP TÁC XÃ", icon: <FaProjectDiagram size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
  { id: 4, title: "LIÊN MINH HỢP TÁC XÃ TỈNH/THÀNH PHỐ", icon: <FaCogs size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
  { id: 5, title: "UBKT", icon: <FaPen size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
  { id: 6, title: "BÁO CÁO", icon: <FaClipboardCheck size={40} className="text-blue-500" />, desc: "consectetuer adipiscing elit, sed diam nonummy nibh euismod" },
];

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);




  useEffect(() => {
    if (typeof window !== "undefined") {
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }
  }, []);


  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <title>Hệ thống quản lý HTX</title>
      </Head>


      <div className="hero-section">
        <div className="hero-content">
          <h1>ỦY BAN KIỂM TRA</h1>
          <p>
            Căn cứ Kế hoạch số <span className="slash">/KH-BTV ngày</span>{" "}
            <span className="slash">/2025</span> của Ban Thường vụ Liên minh Hợp
            tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài lòng của hợp tác
            xã (HTX) đối với chính quyền địa phương năm 2024…
          </p>
          <button className="hero-button">XEM TIẾP</button>

          <div className="slider-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      {/* Giao diện báo cáo khảo sát */}
      <section className="container content-wrapper   my-5">
        <h2 className="text-center survey  fw-bold m-5 text-center text-2xl font-bold">BÁO CÁO KHẢO SÁT</h2>
        <div className="row   content1">

          {/* Nhóm 1: HTX khảo sát */}
  <div className="survey-wrapper">
  {/* Cột 1: 40% */}
  <div className="survey-col col-40">
    <div className="survey-box">
     <div className="survey-title w-70 mx-auto text-center font-bold text-lg">
  THEO SỐ LƯỢNG HỢP TÁC XÃ KHẢO SÁT
</div>
      <div className="chart-row">
        {/* Biểu đồ 1 */}
        <div className="chart-item">
          <div className="chart-circle" style={{ background: "conic-gradient(#fbc02d 45%, #eee 0)" }}>
            <h3>45%</h3>
            <p>00.000/00.000</p>
          </div>
          <h6 className="fw-bold">HỢP TÁC XÃ THÀNH VIÊN</h6>
          <p className="text-muted small">Lorem ipsum dolor sit amet.</p>
        </div>

        {/* Biểu đồ 2 */}
        <div className="chart-item">
          <div className="chart-circle" style={{ background: "conic-gradient(#e53935 60%, #eee 0)" }}>
            <h3>60%</h3>
            <p>00.000/00.000</p>
          </div>
          <h6 className="fw-bold">HỢP TÁC XÃ CHƯA THÀNH VIÊN</h6>
          <p className="text-muted small">Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
    </div>
  </div>

  {/* Cột 2: 60% */}
  <div className="survey-col col-60">
    <div className="survey-box">
      <div className="survey-title w-70 mx-auto text-center font-bold text-lg">THEO SỐ LƯỢNG PHIẾU KHẢO SÁT</div>
      <div className="chart-row">
        {/* Biểu đồ 3 */}
        <div className="chart-item">
          <div className="chart-circle" style={{ background: "conic-gradient(#fbc02d 45%, #eee 0)" }}>
            <h3>45%</h3>
            <p>00.000/00.000</p>
          </div>
          <h6 className="fw-bold">HÀI LÒNG</h6>
          <p className="text-muted small">Lorem ipsum dolor sit amet.</p>
        </div>

        {/* Biểu đồ 4 */}
        <div className="chart-item">
          <div className="chart-circle" style={{ background: "conic-gradient(#29b6f6 75%, #eee 0)" }}>
            <h3>75%</h3>
            <p>00.000/00.000</p>
          </div>
          <h6 className="fw-bold">MỘT SỐ KHÍA CẠNH</h6>
          <p className="text-muted small">Lorem ipsum dolor sit amet.</p>
        </div>

        {/* Biểu đồ 5 */}
        <div className="chart-item">
          <div className="chart-circle" style={{ background: "conic-gradient(#2e7d32 80%, #eee 0)" }}>
            <h3>80%</h3>
            <p>00.000/00.000</p>
          </div>
          <h6 className="fw-bold">KHÔNG HÀI LÒNG</h6>
          <p className="text-muted small">Lorem ipsum dolor sit amet.</p>
        </div>
      </div>
    </div>
  </div>
</div>

        </div>
      </section>


      <div className="bg-gray-100 py-10 px-4 ">
        <h2 className="text-center text-2xl font-bold  text-center survey   m-5">HƯỚNG DẪN KHẢO SÁT</h2>
        <div className="flex justify-center items-start  flex-wrap md:flex-nowrap">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center relative survey_instruc">
              {/* Circle + icon */}
              <div className="w-28 h-28 rounded-full border-2 border-gray-300 flex flex-col items-center justify-center relative bg-white">
                <div className="absolute -top-3 -left-3 bg-yellow-400 text-black rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold top-left">
                  {step.id}
                </div>
                {step.icon}
              </div>

            {/* Content */}
            <div className="mt-4 max-w-[180px]">
              <h4 className="font-bold text-sm">{step.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{step.desc}</p>
                 <button
        onClick={() => setShowModal(true)}
        className=" text-red px-4 py-2 rounded hover:bg-blue-700" style={{ color: 'red' }}
      >
        Xem tiếp
      </button>
              
            </div>

              {/* Line (except last step) */}
              {step.id < steps.length && (
                <div className="hidden md:block absolute top-14 right-[-60px] w-[113px] h-0.5 bg-gray-300 z-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

<div className="flex flex-col items-center justify-center bg-[#403d94] py-5 px-4 min-h-0">
  <h2 className="text-xl text-white font-bold mb-4">KHẢO SÁT</h2>

  <form className="flex flex-col md:flex-row gap-4 w-full max-w-3xl">
    <input
      type="text"
      placeholder="TÊN ĐĂNG NHẬP"
      className="flex-grow px-4 h-11 rounded-full text-gray-800 placeholder-gray-400 bg-white shadow text-sm"
      style={{ minWidth: '250px' }}
    />
    <input
      type="password"
      placeholder="MẬT KHẨU"
      className="flex-grow px-4 h-11 rounded-full text-gray-800 placeholder-gray-400 bg-white shadow text-sm"
      style={{ minWidth: '250px' }}
    />
    <button
  type="submit"
  className="px-6 h-11 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow text-sm transition"
  style={{ borderRadius: '9999px' }}  // Inline style ép bo tròn hoàn toàn
>
  ĐĂNG NHẬP
</button>
  </form>
</div>










<section className="py-10 px-4 max-w-screen-xl mx-auto">
  <h2 className="text-2xl font-bold text-center mb-8">TIN TỨC</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
    {newsItems.map((item, index) => (
      <div key={index} className="mx-auto flex flex-col items-center w-64">
        <div className="w-64 h-64 overflow-hidden rounded-md relative cover">
          <Image
            src={item.image}
            alt="news image"
            width={256}
            height={256}
          />
        </div>
        <h3 className="font-bold mt-4 mb-2 text-center">{item.title}</h3>
        <p className="text-sm text-gray-700 text-center">{item.description}</p>
      </div>
    ))}
  </div>
</section>




{showModal && (
  <>
    {/* Làm mờ nền phía sau bằng backdrop-blur */}
<div
  className="fixed inset-0 backdrop-blur-sm z-40 "
  style={{ backgroundColor: 'gray', opacity: '0.8'}}
></div>

    {/* Modal content */}
    <div className="fixed inset-0 flex items-center justify-center z-50 content-wrapper " style={{ maxWidth: "900px" }}>
      <div className="bg-white rounded-lg shadow-lg  p-6 relative z-50">
        

        
        <div className="mt-4">
          <div className="max-w-4xl mx-auto p-6 text-center">
      <h2 className="text-sm font-semibold uppercase">Bước 1: ỦY BAN KIỂM TRA</h2>
      <p className="text-sm italic mb-4">Hướng dẫn đối với Ủy ban kiểm tra</p>
      <p className="text-justify leading-relaxed">
        Căn cứ Kế hoạch số <span className="inline-block w-10 border-b border-black mx-1" />
        /KH-BTV ngày <span className="inline-block w-10 border-b border-black mx-1" />
        /2025 của Ban Thường vụ Liên minh Hợp tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài lòng của hợp tác xã (HTX)
        đối với chính quyền địa phương năm 2024, Liên minh HTX Việt Nam trân trọng đề nghị các HTX thành viên phối hợp,
        cung cấp thông tin và cho ý kiến Đánh giá mức độ hài lòng của HTX đối với chính quyền địa phương năm 2024
        trong việc thực hiện các chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước về kinh tế tập thể, HTX tại địa phương.
      </p>
    </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Đóng
          </button>
        
        </div>
      </div>
    </div>
  </>
)}




      {/* CSS thêm để giả lập donut chart (mô phỏng tĩnh theo hình bạn cung cấp) */}
      <style jsx>{`
  .chart-circle {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: conic-gradient(currentColor 75%, #eee 0); /* 75% là phần trăm */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    position: relative;
    font-weight: bold;
    color: inherit;
  }

  .chart-circle::before {
    content: "";
    position: absolute;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #fff;
    z-index: 1;
  }

  .chart-circle h3,
  .chart-circle p {
    position: relative;
    z-index: 2;
    margin: 0;
  }

  .chart-circle h3 {
    font-size: 20px;
  }

  .chart-circle p {
    font-size: 12px;
  }
`}</style>







    </>
  );
}