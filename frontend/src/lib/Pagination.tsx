import Link from 'next/link';
import { Button } from "@/components/ui/button";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-4 mt-4">
            {/* Trang trước */}
            <Link href={`?page=${currentPage - 1}`} passHref>
                <Button
                    size='sm'
                    className="btn"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Trang trước
                </Button>
            </Link>

            {/* Danh sách số trang */}
            <div>
                {/* {pages.map((page) => (
                    <Link key={page} href={`?page=${page}`} passHref>
                        <Button
                            size='sm'
                            className={`btn ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Button>
                    </Link>
                ))} */}
                <label>Trang: {currentPage}/{totalPages}</label>
            </div>

            {/* Trang sau */}
            <Link href={`?page=${currentPage + 1}`} passHref>
                <Button
                    size='sm'
                    className="btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Trang sau
                </Button>
            </Link>
        </div>
    );
};

export default Pagination;
