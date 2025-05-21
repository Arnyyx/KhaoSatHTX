import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t bg-[#b0e0ff] text-gray-800 py-8 px-4 foot" style={{  background: '#b3e5fc',}}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1 - Logo + Nội dung */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-4 mb-4"  >
            <Image
              src="/assets/img/logo ubkt.svg"
              alt="Logo"
              width={350}
              height={80}
            />
          </div>
          <p className="text-sm leading-relaxed">
            Căn cứ Kế hoạch số &nbsp;/KH-BTV ngày &nbsp;/2025 của Ban Thường vụ
            Liên minh Hợp tác xã Việt Nam về việc Khảo sát đánh giá mức độ hài
            lòng của hợp tác xã (HTX) đối với chính quyền địa phương năm 2024.
          </p>
          <p className="text-sm mt-4">© Ủy ban kiểm tra 2024</p>
        </div>

        {/* Cột 2 - Danh mục */}
        <div>
          <h4 className="text-base font-bold mb-2">DANH MỤC</h4>
          <ul className="space-y-1 text-sm">
            <li>Giới thiệu</li>
            <li>Khảo sát</li>
            <li>Báo cáo</li>
            <li>Tin tức</li>
            <li>Liên hệ</li>
          </ul>
        </div>

        {/* Cột 3 - Hỗ trợ */}
        <div>
          <h4 className="text-base font-bold mb-2">HỖ TRỢ</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <i className="fa fa-phone mr-2"></i>(+84) 123 456 789
            </li>
            <li>
              <i className="fa fa-phone mr-2"></i>(+84) 123 456 789
            </li>
            <li>
              <i className="fa fa-envelope mr-2"></i>ubkt@vca.org.vn
            </li>
          </ul>

          {/* Theo dõi */}
          <div className="mt-6 border-t pt-4 text-center">
            <h4 className="text-base font-bold mb-2">THEO DÕI</h4>
            <div className="flex justify-center space-x-3 text-white">
              <div className="bg-[#3b5998] rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fab fa-facebook-f"></i>
              </div>
              <div className="bg-[#1da1f2] rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fab fa-twitter"></i>
              </div>
              <div className="bg-[#db4437] rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fab fa-google-plus-g"></i>
              </div>
              <div className="bg-[#0077b5] rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fab fa-linkedin-in"></i>
              </div>
              <div className="bg-[#ff0000] rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fab fa-youtube"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
