"use client"; // ⚠️ Phải là dòng đầu tiên

import { useEffect, useState } from "react";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css'
import '../globals.css'

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
    setForm({ name: '', email: '', content: '' });
  };

  return (
    <div className="mt-5">
      {/* Share Buttons */}
      <div className="d-flex justify-content-end gap-2 mb-3">
        <a href="#"><img src="/assets/img/facebook.png" alt="Facebook" /></a>
        <a href="#"><img src="/assets/img/Google-plus-icon.png" alt="Google+" /></a>
        <a href="#"><img src="/assets/img/tw.png" alt="Twitter" /></a>
        <a href="#"><img src="/assets/img/zalo.png" alt="Zalo" /></a>
      </div>

      {/* Comment Section */}
      <div className="border p-3 mb-4">
        <strong>Bình luận (0)</strong>
        <p className="mt-2 text-muted">
          Hiện chưa có bình luận nào, hãy là người bình luận đầu tiên
        </p>
      </div>

      <h4 className="text-primary mb-3">Bình luận</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              name="name"
              placeholder="Họ và Tên"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <textarea
            name="content"
            placeholder="Nội Dung"
            value={form.content}
            onChange={handleChange}
            className="form-control"
            rows="4"
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-outline-success">
          Gửi bình luận
        </button>
      </form>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("noibat");

  useEffect(() => {
    // Tải Bootstrap JS khi client đã render
    if (typeof window !== "undefined") {
      import("bootstrap/dist/js/bootstrap.bundle.min.js");
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
        <title>Giới thiệu Ủy ban Kiểm tra</title>
      </Head>

      <div className="container py-4">
        <div className="row">
          {/* Main Content */}
          <div className="col-md-8">
            <div className="blogsingle">
              <h1 className="mb-4">Giới thiệu về Ủy ban Kiểm tra</h1>
              <p>
                Ủy ban Kiểm tra là cơ quan kiểm tra của Liên minh Hợp tác xã Việt Nam...
              </p>
              <p>
                1. Ủy ban Kiểm tra do Đại hội bầu...<br />
                2. Nhiệm vụ và quyền hạn...<br />
                a) Kiểm tra, giám sát...<br />
                b) Hướng dẫn và bồi dưỡng...<br />
                c) Kiến nghị với Ban Chấp hành...<br />
                d) Bảo vệ quyền...<br />
                đ) Giải quyết, đề xuất...<br />
                e) Báo cáo Đại hội...<br />
                3. Nguyên tắc làm việc...
              </p>

              <CommentSection />
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-md-4">
            {[...Array(4)].map((_, i) => (
              <div className="mb-4 sidebar-item" key={i}>
                <a href="#">
                  <img
                    src="/assets/img/AnhBaiViet.jpg"
                    alt="Bài viết"
                    className="img-fluid mb-2"
                  />
                </a>
                <h5 className="mb-0">
                  <a href="#">
                    Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã
                  </a>
                </h5>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
