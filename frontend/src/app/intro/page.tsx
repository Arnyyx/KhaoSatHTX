"use client"; // ⚠️ Phải là dòng đầu tiên

import { useEffect, useState } from "react";
import Head from "next/head";
import { Radius } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("noibat");

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

        <header>
        {/* Header Start */}
        <div className="header-area">
          <div className="header-mid gray-bg">
            <div className="row">
              <div className="row d-flex align-items-center">
                {/* Logo */}
                <div className="col-md-12">
                  <div className="header-banner f-right" style={{ width: "100%" }}>
                    <div className="banner">
                      <img src="/assets/img/Banner.png" alt="Banner" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="header-bottom header-sticky">
            <div className="menu-wrapper">
              <div className="container content-wrapper">
                <div className="menu">
                  <nav className="navbar">
                    <ul className="nav-menu">
                      <li><a href="/">Trang chủ</a></li>
                      <li><a href="/intro">Giới thiệu</a></li>
                      <li className="dropdown">
                        <a href="/document">Văn bản</a>
                       
                      </li>
                      <li><a href="/news">Tin tức</a></li>
                      <li><a href="#">Khảo sát</a></li>
                      <li><a href="#">Hướng dẫn</a></li>
                      <li><a href="#">Tra cứu</a></li>
                    </ul>
                  </nav>

                  <div className="search-box">
                    <input type="text" placeholder="Tìm kiếm..." />
                    <button type="submit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#3071c8" viewBox="0 0 24 24">
                        <path d="M10 2a8 8 0 105.293 14.707l5 5 1.414-1.414-5-5A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
                      </svg>
                    </button>
                  </div>
                  <a href="/login">ĐĂNG NHẬP</a>
                </div>
              </div>
            </div>

          </div>
        </div>
        {/* Header End */}
      </header>

      <div className="container2">
        <main className="main-content">
        <div className="blogsingle col-md-12 pt-10">
      <h1>Giới thiệu về ủy ban kiểm tra</h1>

      <p>
        <a
          style={{ color: '#051441', display: 'none' }}
          href="/DinhKem/PDF/"
          download
        >
          <span className="material-symbols-outlined">download</span>
        </a>
      </p>

      <h5></h5>

      <p>
        Ủy ban Kiểm tra là cơ quan kiểm tra của Liên minh Hợp tác xã Việt Nam được
        thành lập ở cấp Trung Ương, do Ban Chấp hành bầu. Chủ nhiệm Ủy ban Kiểm tra là
        Ủy viên Ban Thường vụ. Nhiệm kỳ của Ủy ban Kiểm tra cùng với nhiệm kỳ Đại hội.
        Việc bầu bổ sung, miễn nhiệm, bãi nhiệm Chủ nhiệm, Phó Chủ nhiệm, Ủy viên Ủy ban
        kiểm tra giữa hai kỳ Đại hội do Ban Chấp hành Liên minh Hợp tác xã Việt Nam
        quyết định.
      </p>

      <p>
        1. Ủy ban Kiểm tra do Đại hội bầu. Chủ nhiệm, Phó Chủ nhiệm Ủy ban Kiểm tra do
        Ban Chấp hành bầu. Chủ nhiệm Ủy ban Kiểm tra là Ủy viên Ban Thường vụ. Nhiệm kỳ
        của Ủy ban Kiểm tra cùng với nhiệm kỳ Đại hội. Việc bầu bổ sung, miễn nhiệm, bãi
        nhiệm Chủ nhiệm, Phó Chủ nhiệm, Ủy viên Ủy ban kiểm tra giữa hai kỳ Đại hội do
        Ban Chấp hành Liên minh Hợp tác xã Việt Nam quyết định.<br />
        2. Nhiệm vụ và quyền hạn của Ủy ban Kiểm tra<br />
        a) Kiểm tra, giám sát việc thực hiện Điều lệ, Nghị quyết của Đại hội và Ban Chấp
        hành, Ban Thường vụ; giám sát thực hiện các kế hoạch, chương trình, đề án, dự
        án của Liên minh Hợp tác xã Việt Nam; kiểm tra, giám sát việc quản lý tài chính
        của Liên minh Hợp tác xã Việt Nam (trừ kinh phí ngân sách nhà nước cấp);<br />
        b) Hướng dẫn và bồi dưỡng nghiệp vụ kiểm tra, đôn đốc, tiếp nhận và tổng hợp báo
        cáo công tác của Ủy ban Kiểm tra Liên minh Hợp tác xã cấp tỉnh; phân công, phối
        hợp với Ủy ban Kiểm tra Liên minh Hợp tác xã cấp tỉnh để thực hiện bảo vệ quyền
        và lợi ích hợp pháp của thành viên theo quy chế do Ban Chấp hành ban hành;<br />
        c) Kiển nghị với Ban Chấp hành các hình thức kỷ luật đối với tập thể và cá nhân
        khi có sai phạm;<br />
        d) Bảo vệ quyền, lợi ích hợp pháp của thành viên;<br />
        đ) Giải quyết, đề xuất, kiến nghị giải quyết đơn thư tố cáo, khiếu nại liên quan
        đến quyền và lợi ích hợp pháp của thành viên theo quy định của pháp luật;<br />
        e) Báo cáo Đại hội, Ban Chấp hành, Ban Thưởng vụ về tình hình thực hiện nhiệm
        vụ, quyền hạn và đề xuất của Ủy ban Kiểm tra.<br />
        3. Nguyên tắc làm việc của Ủy ban Kiểm tra: Ủy ban Kiểm tra chịu sự chỉ đạo của
        Ban Chấp hành, Ban Thường vụ; hoạt động theo quy chế do Ban Chấp hành ban hành;
        các nghị quyết và quyết định của Ủy ban Kiểm tra được thông qua khi có trên 1/2
        (một phần hai) tổng số ủy viên Ủy ban Kiểm tra biểu quyết tán thành.
      </p>
    </div>

          <CommentSection />

        </main>

        <aside className="sidebar">
          <div className="sidebar-item">
           <a href=""> <img src="/assets/img/AnhBaiViet.jpg" alt="" /></a>
           <h5>
            <a href="">Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã</a>
           </h5>
          </div>
          <div className="sidebar-item">
           <a href=""> <img src="/assets/img/AnhBaiViet.jpg" alt="" /></a>
           <h5>
            <a href="">Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã</a>
           </h5>
          </div>
          <div className="sidebar-item">
           <a href=""> <img src="/assets/img/AnhBaiViet.jpg" alt="" /></a>
           <h5>
            <a href="">Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã</a>
           </h5>
          </div>
          <div className="sidebar-item">
           <a href=""> <img src="/assets/img/AnhBaiViet.jpg" alt="" /></a>
           <h5>
            <a href="">Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã</a>
           </h5>
          </div>
        </aside>
      </div>

      <footer className="footer content-wrapper">
        <div className="footer-main">
          <h3>ỦY BAN KIỂM TRA – LIÊN MINH HỢP TÁC XÃ VIỆT NAM</h3>
          <p>Địa chỉ: Số 6 Dương Đình Nghệ, phường Yên Hòa, quận Cầu Giấy, Hà Nội</p>
        </div>
        <div className="footer-bottom">Thiết kế bởi Viện Khoa học công nghệ và Môi trường</div>
      </footer>
    </>
  );
}

// ✅ Tách riêng Component Bình luận ra ngoài
function CommentSection() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    content: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đã gửi bình luận:", form);
    // Reset form nếu muốn
    setForm({ name: '', email: '', content: '' });
  };

  return (
    <div className="comment-section" >
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '10px' }}>
        <a href="#"><img src="/assets/img/facebook.png" alt="Facebook" /></a>
        <a href="#"><img src="/assets/img/Google-plus-icon.png" alt="Google+" /></a>
        <a href="#"><img src="/assets/img/tw.png" alt="Twitter" /></a>
        <a href="#"><img src="/assets/img/zalo.png" alt="Zalo" /></a>
      </div>

      <div className="comment-list" style={{ border: '1px solid #ccc', padding: '10px' }}>
        <strong>Bình luận (0)</strong>
        <p style={{ marginTop: '10px', color: '#333' }}>
          Hiện chưa có bình luận nào, hãy là người bình luận đầu tiên
        </p>
      </div>

      <h3 style={{ marginTop: '20px', color: '#3c3c94' }}>Bình luận</h3>
      <form onSubmit={handleSubmit}>
        
        <input
  type="text"
  name="name"
  placeholder="Họ và Tên"
  value={form.name}
  onChange={handleChange}
  className="form-control"
  style={{  width: '50%',padding:'10px',flex: 1, border : '1px solid #ccc',  }} // Thêm viền
  required
/>

<input
  type="email"
  name="email"
  placeholder="Email"
  value={form.email}
  onChange={handleChange}
  className="form-control"
  style={{ width: '50%',padding:'10px', flex: 1, border: '1px solid #ccc' }} // Thêm viền
  required
/>

<textarea
  name="content"
  placeholder="Nội Dung"
  value={form.content}
  onChange={handleChange}
  className="form-control"
  rows="4"
  style={{ width: '100%',padding:'10px', marginBottom: '10px', border: '1px solid #ccc' }} // Thêm viền
  required
></textarea>

        <button type="submit" className="btn btn-outline-success">Gửi bình luận</button>
      </form>
    </div>
  );
}
