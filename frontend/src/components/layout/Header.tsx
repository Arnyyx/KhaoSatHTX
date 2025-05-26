"use client";

import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export function Header() {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <header>
      {/* Hotline chỉ hiện trên PC */}
      <div className="d-none d-lg-block" style={{ backgroundColor: "#b3e5fc" }}>
        <div className="container py-2 d-flex justify-content-between align-items-center text-primary" style={{ fontWeight: 500, fontSize: "16px" }}>
          <div>Trang thông tin Khảo sát Chỉ số hài lòng cấp tỉnh năm 2024</div>
          <div><i className="fas fa-phone-alt me-2"></i>(+84) 123 456 789</div>
        </div>
      </div>

      {/* Thanh menu chính */}
      <nav className="navbar navbar-light bg-white border-bottom py-3">
        <div className="container d-flex justify-content-between align-items-center">
          {/* Logo */}
          <a className="navbar-brand" href="/">
            <img
              src="/assets/img/logo ubkt.svg"
              alt="Logo"
              style={{
                height: "90px",
                objectFit: "contain",
              }}
              className="d-none d-lg-block"
            />
            <img
              src="/assets/img/logo ubkt.svg"
              alt="Logo"
              style={{ height: "55px", objectFit: "contain" }}
              className="d-block d-lg-none"
            />
          </a>

          {/* Menu PC */}
          <div className="d-none d-lg-flex gap-4 fw-medium text-uppercase">
            <a className="nav-link text-danger" href="/">Trang chủ</a>
            <a className="nav-link text-dark" href="/intro">Giới thiệu</a>
            <a className="nav-link text-dark" href="/survey">Khảo sát</a>
            <a className="nav-link text-dark" href="/news">Tin tức</a>
            <a className="nav-link text-dark" href="/report">Báo cáo</a>
            <a className="nav-link text-dark" href="/login">Đăng nhập</a>
          </div>

          {/* Nút menu mobile */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>

      {/* Menu Mobile Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="mobileMenuLabel">Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body text-uppercase fw-medium">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link text-danger" href="/">Trang chủ</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/intro">Giới thiệu</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/survey">Khảo sát</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/news">Tin tức</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/report">Báo cáo</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/login">Đăng nhập</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
