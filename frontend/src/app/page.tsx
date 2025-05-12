"use client"; // ⚠️ Phải là dòng đầu tiên

import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <title>Hệ thống quản lý HTX</title> {/* Thêm title cho tốt SEO */}
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

      <div className="container content-wrapper">
        <div className="col-12"  >
          <div className="home-section">
            <div className="slider col-md-8">
              {/* Đây là nơi bạn tích hợp thư viện Carousel */}
              <div className="slide">
                <img src="/DinhKem/Client/AnhBaiViet/bannerkhaosat1.jpg" alt="Slide 1" />
              </div>
              {/* Thêm các nút mũi tên trái/phải và chấm tròn nếu muốn */}
            </div>

            <div className="news-list col-md-3 col-sm-3 col-4">
              <div className="news-item">
                <img src="/DinhKem/Client/AnhBaiViet/1.jpg" alt="Tin tức 1" />
                <div className="news-content">
                  <h4>TIN TỨC</h4>
                  <p>Liên minh HTX Việt Nam kỷ niệm ngày Hợp tác xã Quốc tế...</p>
                </div>
              </div>
              <div className="news-item">
                <img src="/DinhKem/Client/AnhBaiViet/2.jpg" alt="Tin tức 2" />
                <div className="news-content">
                  <h4>TIN TỨC</h4>
                  <p>Đoàn công tác Ban chỉ đạo Trung ương về phòng, chống tham nhũng...</p>
                </div>
              </div>
              <div className="news-item">
                <img src="/DinhKem/Client/AnhBaiViet/3.jpg" alt="Tin tức 2" />
                <div className="news-content">
                  <h4>TIN TỨC</h4>
                  <p>Đoàn công tác Ban chỉ đạo Trung ương về phòng, chống tham nhũng...</p>
                </div>
              </div>
              <div className="news-item">
                <img src="/DinhKem/Client/AnhBaiViet/3.jpg" alt="Tin tức 2" />
                <div className="news-content">
                  <h4>TIN TỨC</h4>
                  <p>Đoàn công tác Ban chỉ đạo Trung ương về phòng, chống tham nhũng...</p>
                </div>
              </div>
              {/* Lặp thêm tin khác tương tự */}
            </div>
          </div>
        </div>
      </div>











      <div className="container content-wrapper">
        <div className="statistics-container">
          <h1>THỐNG KÊ TIẾN ĐỘ</h1>
          <p>Đánh giá mức độ hài lòng của bạn từ năm 2025</p>
          <div className="statistics-box">
            <div className="statistic-item">
              <h2>63/63</h2>
              <p>Số tỉnh hoàn thành</p>
            </div>
            <div className="statistic-item">
              <h2>63/63</h2>
              <p>Số tỉnh tham gia</p>
            </div>
            <div className="statistic-item">
              <h2>13.220.245.63</h2>
              <p>Số HTX tham gia</p>
            </div>
            <div className="statistic-item">
              <h2>14.029.670</h2>
              <p>Tổng số tài khoản</p>
            </div>
          </div>
        </div>
      </div>





      <div className="container content-wrapper chart-container" style={{ display: "flex", }}>
        <div className="chart-item">

          <p>Biểu đồ 1: Số tỉnh hoàn thành</p>
          <div className="legend">
            <div className="legend-item">

              <div className="legend-color" style={{ background: '#00C49F' }}></div> 50% Đã hoàn thành
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#FF8042' }}></div>50% Chưa hoàn thành
            </div>
          </div>
          <div className="pie-chart2"></div>
        </div>
        <div className="chart-item">

          <p>Biểu đồ 2: Số hợp tác xã tham gia</p>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#00C49c' }}></div> 70% Đã tham gia
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ background: '#FF804c' }}></div>30% Đã đăng kí
            </div>
            <div className="pie-chart1"></div>
          </div>
        </div>

        <img src="/assets/img/banner3.jpg" alt="" />


      </div>
      <div className="news-section content-wrapper">
        <div className="main-news  ">
          <h1>Tin tức</h1>
          <img src="/assets/img/1.jpg" alt="Main News Image" />
          <h2 className="news-title">
            Hội nghị Thông qua báo cáo kết quả kiểm tra của Ban Bí thư...
          </h2>
          <p className="news-desc">
            Sáng ngày 21/10, tại trụ sở Liên minh Hợp tác xã Việt Nam đã diễn ra Hội nghị...
          </p>
        </div>

        <div className="side-news">
          <div>
            <div className="tabs">
              <span
                className={activeTab === 'noibat' ? 'active-tab' : ''}
                onClick={() => setActiveTab('noibat')}
              >
                Tin Nổi Bật
              </span>
              <span
                className={activeTab === 'moinhat' ? 'active-tab' : ''}
                onClick={() => setActiveTab('moinhat')}
              >
                Tin Mới Nhất
              </span>
            </div>

            {/* Nội dung theo tab */}
            <div className="tab-content">
              {activeTab === 'noibat' && (
                <p>Đây là nội dung Tin Nổi Bật.</p>
              )}
              {activeTab === 'moinhat' && (
                <p>Đây là nội dung Tin Mới Nhất.</p>
              )}
            </div>
          </div>

          <div className="news-list">
            <div className="news-item news-content">
              <img src="/assets/img/1.jpg" alt="thumb" />
              <div>
                <p className="tag">TIN TỨC</p>
                <p className="text">Liên minh HTX Việt Nam kỷ niệm ngày Hợp tác xã Quốc tế...</p>
              </div>
            </div>

            <div className="news-item news-content">
              <img src="/assets/img/2.jpg" alt="thumb" />
              <div>
                <p className="tag">TIN TỨC</p>
                <p className="text">Đoàn công tác Ban chỉ đạo Trung ương về phòng, chống tham nhũng...</p>
              </div>
            </div>

            <div className="news-item news-content">
              <img src="/assets/img/3.jpg" alt="thumb" />
              <div>
                <p className="tag">TIN TỨC</p>
                <p className="text">Hội nghị đánh giá công tác chỉ đạo, điều hành của Thường trực...</p>
              </div>
            </div>

            <div className="news-item news-content">
              <img src="/assets/img/4.jpg" alt="thumb" />
              <div>
                <p className="tag">TIN TỨC</p>
                <p className="text">Đoàn thanh niên Liên minh Hợp tác xã Việt Nam chung tay tái thiết...</p>
              </div>
            </div>
          </div>
        </div>
      </div>




      <div className="container1 content-wrapper">
        {/* Giới thiệu */}
        <div className="intro">
          <h3>Giới thiệu</h3>
          <div className="intro-content ">
            <img src="/assets/img/ban1.jpg" alt="Ủy ban kiểm tra" className="intro-img" />
            <h2>Ủy Ban Kiểm Tra</h2>
            <p>
              Ủy ban Kiểm tra do Đại hội bầu. Chủ nhiệm, Phó Chủ nhiệm Ủy ban Kiểm tra do Ban Chấp hành bầu. Chủ nhiệm Ủy ban Kiểm tra là Ủy viên Ban Thường vụ. Nhiệm kỳ của Ủy ban Kiểm tra cùng với nhiệm kỳ Đại hội. Việc bầu bổ sung, miễn nhiệm, bãi nhiệm Chủ nhiệm, Phó Chủ nhiệm, Ủy viên Ủy ban kiểm tra giữa hai kỳ Đại hội do Ban Chấp hành Liên minh Hợp tác xã Việt Nam quyết định. ...
            </p>
            <button className="btn">Xem thêm</button>
          </div>
        </div>

        {/* Thông báo */}
        <div className="notifications intro">
          <h3>Thông báo</h3>
          <ul>
            <li><a href="#">Cập nhật danh sách HTX</a></li>
            <li><a href="#">Thông báo kết luận kiểm tra năm 2021</a></li>
            <li><a href="#">Kết luận thường trực Liên minh HTX</a></li>
          </ul>
        </div>

        {/* Banner */}
        <div className="banners">
          <img src="/assets/img/tam1.jpg" alt="Luật Hợp Tác Xã 2023" />
          <img src="/assets/img/tam2.jpg" alt="Tổng kết 20 năm" />
          <img src="/assets/img/tam3.jpg" alt="Triển khai điều lệ" />
        </div>
      </div>
      <footer className="footer content-wrapper">
        <img src="/assets/img/ban2.jpg" alt="" />
        <div className="footer-main">
          <h3>ỦY BAN KIỂM TRA – LIÊN MINH HỢP TÁC XÃ VIỆT NAM</h3>
          <p>
            Địa chỉ: Số 6 Dương Đình Nghệ, phường Yên Hòa, quận Cầu Giấy, Tp Hà Nội
            Điện thoại: (+84)(80)49711
          </p>
        </div>
        <div className="footer-bottom">
          Thiết kế bởi Viện Khoa học công nghệ và Môi trường
        </div>
      </footer>

     

      <div className="search-model-box" style={{ display: "none" }}>
        <div className="d-flex align-items-center h-100 justify-content-center">
          <div className="search-close-btn">+</div>
          <form className="search-model-form">
            <input
              type="text"
              id="search-input"
              placeholder="Searching key....."
            />
          </form>
        </div>
      </div>
    </>
  );
}
