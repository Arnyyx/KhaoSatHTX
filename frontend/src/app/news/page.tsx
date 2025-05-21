import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card"; // hoặc thay bằng div nếu chưa có component này

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hệ thống quản lý HTX</title>
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </Head>


      <div className="container content-wrapper">
        <div className="text-center my-8">
  <h2 className="text-2xl font-bold text-[#2d388a] tracking-widest uppercase">Tin tức</h2>
  <div className="relative flex items-center justify-center mt-2">
    <div className="w-24 h-1 bg-[#2d71c8]"></div>
    <div className="w-4 h-4 border-2 border-[#f47c00] bg-white rounded-full absolute"></div>
  </div>
</div>
        <div className="p-4 space-y-4">         
          {/* News Item 1 */}
          <Card className="flex p-2 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-1/4">
              <Image
                src="/assets/img/AnhBaiViet.jpg"
                alt="Chuyển đổi số"
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="w-3/4">
              <h2 className="font-semibold">
                Thúc đẩy chuyển đổi số khu vực kinh tế tập thể, hợp tác xã
              </h2>
              <p className="text-gray-700">
                (ĐCSVN) – Thủ tướng Phạm Minh Chính nêu rõ, việc tổ chức Diễn đàn Kinh tế hợp tác, hợp tác xã năm 2022 nhằm truyền tải thông điệp quan trọng của tinh thần đổi mới, sáng tạo, đột phá đối với mô hình kinh tế tập thể là thành phần kinh tế quan trọng.
              </p>
            </div>
            </div>
            
          </Card>

          {/* News Item 2 */}
          <Card className="flex p-2 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-1/4">
              <Image
                src="/assets/img/AnhBaiViet_1.jpg"
                alt="ASEAN Summit"
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="w-3/4">
              <h2 className="font-semibold">
                ASEAN jointly build an inclusive business support environment
              </h2>
              <p className="text-gray-700">
                On October 27, the 5th ASEAN Inclusive Business Summit with the theme "ASEAN working together to build an inclusive business enabling environment" was held in Seam Reap, Cambodia.
              </p>
            </div>
            </div>
            
          </Card>
            <Card className="flex p-2 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-1/4">
              <Image
                src="/assets/img/AnhBaiViet_1.jpg"
                alt="ASEAN Summit"
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="w-3/4">
              <h2 className="font-semibold">
                ASEAN jointly build an inclusive business support environment
              </h2>
              <p className="text-gray-700">
                On October 27, the 5th ASEAN Inclusive Business Summit with the theme "ASEAN working together to build an inclusive business enabling environment" was held in Seam Reap, Cambodia.
              </p>
            </div>
            </div>
            
          </Card>
            <Card className="flex p-2 gap-4">
            <div className="flex items-start gap-4">
              <div className="w-1/4">
              <Image
                src="/assets/img/AnhBaiViet_1.jpg"
                alt="ASEAN Summit"
                width={300}
                height={200}
                className="object-cover"
              />
            </div>
            <div className="w-3/4">
              <h2 className="font-semibold">
                ASEAN jointly build an inclusive business support environment
              </h2>
              <p className="text-gray-700">
                On October 27, the 5th ASEAN Inclusive Business Summit with the theme "ASEAN working together to build an inclusive business enabling environment" was held in Seam Reap, Cambodia.
              </p>
            </div>
            </div>
            
          </Card>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 pt-4">
            <button className="px-3 py-1 border rounded">Đầu</button>
            <button className="px-3 py-1 border rounded bg-blue-500 text-white">1</button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">3</button>
            <button className="px-3 py-1 border rounded">Sau</button>
          </div>
        </div>
      </div>

      

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
