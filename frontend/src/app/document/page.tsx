"use client"; // ⚠️ Phải là dòng đầu tiên

import { useEffect, useState } from "react";
import Head from "next/head";
import { Radius } from "lucide-react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Download } from "lucide-react";
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

      <div className="container2 document">
        <main className="main-content">
        <div className="container mt-4">
      <h4 className="mb-4" style={{ color: "#3c3c8b" }}>Văn bản UBKT</h4>
      <form className="row gy-3 align-items-end">
        {/* Cơ quan ban hành */}
        <div className="col-md-3">
          <label htmlFor="coquan" className="form-label">Cơ quan ban hành</label>
          <select className="form-select" id="coquan">
            <option>Tất Cả</option>
            {/* Các option khác nếu cần */}
          </select>
        </div>

        {/* Phân loại văn bản */}
        <div className="col-md-3">
          <label htmlFor="phanloai" className="form-label">Phân loại văn bản</label>
          <select className="form-select" id="phanloai">
            <option>Văn bản UBKT</option>
            {/* Các option khác nếu cần */}
          </select>
        </div>

        {/* Năm ban hành */}
        <div className="col-md-2">
          <label htmlFor="nambh" className="form-label">Năm ban hành</label>
          <select className="form-select" id="nambh">
            <option>Tất Cả</option>
            {/* Các năm cụ thể nếu cần */}
          </select>
        </div>

        {/* Loại văn bản */}
        <div className="col-md-2">
          <label htmlFor="loaivb" className="form-label">Loại văn bản</label>
          <select className="form-select" id="loaivb">
            <option>Tất Cả</option>
            {/* Các loại văn bản khác */}
          </select>
        </div>

        {/* Tìm theo ký hiệu, trích yếu */}
        <div className="col-md-4">
          <label htmlFor="tukhoa" className="form-label">Tìm theo ký hiệu, trích yếu</label>
          <input type="text" className="form-control" id="tukhoa" placeholder="" />
        </div>

        {/* Nút tìm kiếm */}
        <div className="col-md-2">
          <button type="submit" className="btn btn-outline-success w-100">Tìm kiếm</button>
        </div>
      </form>
      <div className="table-responsive mt-4">
  <table className="table table-bordered table-hover">
    <thead className="table-primary text-center align-middle">
      <tr>
        <th style={{ width: "15%" }}>Số/Ký hiệu</th>
        <th style={{ width: "10%" }}>Ngày ban hành</th>
        <th style={{ width: "55%" }}>Trích yếu</th>
        <th style={{ width: "10%" }}>Files Văn bản</th>
      </tr>
    </thead>
    <tbody>
      {[
        {
          soKyHieu: "[02/UBKT-HD]",
          ngay: "07-05-2023",
          trichYeu: "Hướng dẫn sử dụng Hệ thống phần mềm Khảo sát chỉ số hài lòng cấp tỉnh của HTX (Dành cho cấp quản lý)",
        },
        {
          soKyHieu: "[HD]",
          ngay: "18-04-2023",
          trichYeu: "Hướng dẫn sử dụng Hệ thống phần mềm Khảo sát chỉ số hài lòng cấp tỉnh của HTX",
        },
        {
          soKyHieu: "[39/LMHTXVN-UBKT]",
          ngay: "14-04-2023",
          trichYeu: "Về việc tập huấn, hướng dẫn sử dụng phần mềm Chỉ số hài lòng cấp tỉnh của HTX",
        },
        {
          soKyHieu: "[25/KH-UBKT]",
          ngay: "03-03-2023",
          trichYeu: "Kế hoạch kiểm tra, giám sát chuyên đề đối với Liên minh HTX các tỉnh, thành phố năm 2023",
        },
        {
          soKyHieu: "[18/LMHTXVN-UBKT]",
          ngay: "22-02-2023",
          trichYeu: "V/v cung cấp danh sách các HTX thành viên, HTX đang hoạt động trên địa bàn tỉnh, thành phố năm 2022",
        },
        {
          soKyHieu: "[10/KH-UBKT]",
          ngay: "02-02-2023",
          trichYeu: "Kế hoạch khảo sát đánh giá mức độ hài lòng của HTX đối với các chủ trương, chính sách của Đảng và Nhà nước",
        },
        {
          soKyHieu: "[09/LMHTXVN-UBKT]",
          ngay: "01-02-2023",
          trichYeu: "V/v xin ý kiến Phiếu khảo sát Quy chế xếp loại HTX theo hạng năm 2022",
        },
        {
          soKyHieu: "[08/LMHTXVN-UBKT]",
          ngay: "31-01-2023",
          trichYeu: "V/v gửi số liệu chuyển môn nghiệp vụ công tác kiểm tra, giám sát",
        },
        {
          soKyHieu: "[08/LMHTXVN-UBKT]",
          ngay: "31-01-2023",
          trichYeu: "Chuyển đề: hướng dẫn, bổ dưỡng tình tự bảo vệ quyền và lợi ích hợp pháp của thành viên và thành viên HTX",
        },
        {
          soKyHieu: "[08/LMHTXVN-UBKT]",
          ngay: "31-01-2023",
          trichYeu: "Chuyển đề: hướng dẫn, bổ dưỡng tình tự giải quyết đơn thư khiếu nại, tố cáo, phản ánh của thành viên và thành viên HTX",
        },
      ].map((row, i) => (
        <tr key={i}>
          <td>{row.soKyHieu}</td>
          <td>{row.ngay}</td>
          <td>{row.trichYeu}</td>
          <td className="text-center">
          <Download className="text-blue-600 cursor-pointer" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Phân trang */}
  <nav aria-label="Page navigation example">
    <ul className="pagination justify-content-end">
      <li className="page-item disabled">
        <a className="page-link" href="#">Đầu</a>
      </li>
      <li className="page-item active">
        <a className="page-link" href="#">1</a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">2</a>
      </li>
      <li className="page-item">
        <a className="page-link" href="#">Tiếp</a>
      </li>
    </ul>
  </nav>
</div>

      
    </div>
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

