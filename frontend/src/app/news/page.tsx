import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card"; // hoặc thay bằng div nếu chưa có component này

export default function Layout({ children }: { children: React.ReactNode }) {
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


     <div className="container content-wrapper mx-auto px-6">
  <div className="text-center my-10">
    <h2 className="text-2xl font-bold text-[#2d388a] tracking-widest uppercase">Tin tức</h2>
    <div className="relative flex items-center justify-center mt-3">
      <div className="w-24 h-1 bg-[#2d71c8]"></div>
      <div className="w-4 h-4 border-2 border-[#f47c00] bg-white rounded-full absolute"></div>
    </div>
  </div>

  <div className="p-6 space-y-6">
    {[1, 2, 3, 4].map((_, index) => (
      <Card key={index} className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-1/4">
            <Image
              src="/assets/img/AnhBaiViet_1.jpg"
              alt="ASEAN Summit"
              width={300}
              height={200}
              className="object-cover w-full h-auto rounded"
            />
          </div>
          <div className="w-full md:w-3/4">
            <h2 className="font-semibold text-lg">
              ASEAN jointly build an inclusive business support environment
            </h2>
            <p className="text-gray-700 mt-2">
              On October 27, the 5th ASEAN Inclusive Business Summit with the theme "ASEAN working together to build an inclusive business enabling environment" was held in Seam Reap, Cambodia.
            </p>
          </div>
        </div>
      </Card>
    ))}

    <div className="flex flex-wrap justify-center items-center gap-3 pt-6">
      <button className="px-4 py-2 border rounded">Đầu</button>
      <button className="px-4 py-2 border rounded bg-blue-500 text-white">1</button>
      <button className="px-4 py-2 border rounded">2</button>
      <button className="px-4 py-2 border rounded">3</button>
      <button className="px-4 py-2 border rounded">Sau</button>
    </div>
  </div>
</div>


    </>
  );
}
