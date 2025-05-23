import * as XLSX from 'xlsx';
import { z } from 'zod';

// Define validation schema for Excel import with Vietnamese headers
const excelRowSchema = z.object({
    'Tên đăng nhập': z.string().min(1, "Tên đăng nhập là bắt buộc").max(50),
    'Mật khẩu': z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    'Tên tổ chức': z.string().min(1, "Tên tổ chức là bắt buộc").max(255),
    'Loại': z.enum(["HTX", "QTD"], {
        errorMap: () => ({ message: "Loại phải là HTX hoặc QTD" })
    }),
    'Loại hình': z.enum(["NN", "PNN"], {
        errorMap: () => ({ message: "Loại hình phải là NN hoặc PNN" })
    }),
    'Người quản lý': z.string().min(1, "Người quản lý là bắt buộc").max(255),
    'Chức vụ': z.string().min(1, "Chức vụ là bắt buộc").max(100),
    'Email': z.union([z.string().email("Email không hợp lệ").max(100), z.string().max(0)]),
    'Phường/Xã': z.string().min(1, "Phường/Xã là bắt buộc"),
    'Địa chỉ': z.string().min(1, "Địa chỉ là bắt buộc").max(255),
    'Số thành viên': z.coerce.number().int().min(1, "Số thành viên phải lớn hơn 0"),
    'Ngày thành lập': z.string().refine(val => {
        // Handle both ISO format and dd/MM/yyyy format
        if (!val) return false;

        // Try standard parsing first (works for ISO format)
        if (!isNaN(Date.parse(val))) return true;

        // Try parsing dd/MM/yyyy format
        const parts = val.split('/');
        if (parts.length === 3) {
            // Format is expected to be dd/MM/yyyy
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // months are 0-indexed in JS
            const year = parseInt(parts[2], 10);

            const date = new Date(year, month, day);
            return date.getDate() === day &&
                date.getMonth() === month &&
                date.getFullYear() === year;
        }

        return false;
    }, {
        message: "Ngày thành lập không hợp lệ (định dạng: dd/MM/yyyy)",
    }),
    'Là thành viên': z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const lowerVal = val.toLowerCase();
                return lowerVal === 'có' || lowerVal === 'true' || lowerVal === 'yes';
            }
            return Boolean(val);
        },
        z.boolean()
    ),
    'Trạng thái': z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                const lowerVal = val.toLowerCase();
                return lowerVal === 'hoạt động' || lowerVal === 'true' || lowerVal === 'yes';
            }
            return Boolean(val);
        },
        z.boolean()
    ),
});

// Define the type for Excel row data
type ExcelRowType = z.infer<typeof excelRowSchema>;

// Utility functions for Excel operations
export const excelUtils = {
    /**
     * Exports union data to Excel
     */
    exportUnionsToExcel: (users: any[], wards: any[]) => {
        // Create worksheet data
        const wsData = [
            [
                "Tên đăng nhập",
                "Mật khẩu",
                "Tên tổ chức",
                "Loại",
                "Loại hình",
                "Người quản lý",
                "Chức vụ",
                "Email",
                "Phường/Xã",
                "Địa chỉ",
                "Số thành viên",
                "Ngày thành lập",
                "Là thành viên",
                "Trạng thái"
            ],
            ...users.map((user) => [
                user.Username,
                user.Password,
                user.OrganizationName || "",
                user.Role,
                user.Type,
                user.Name || "",
                user.Position || "",
                user.Email || "",
                wards.find(w => w.Id === user.WardId)?.Name || "",
                user.Address || "",
                user.MemberCount || 0,
                user.EstablishedDate ? new Date(user.EstablishedDate) : "",
                user.IsMember ? "Có" : "Không",
                user.Status ? "Hoạt động" : "Ngừng hoạt động"
            ])
        ];


        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = [
            { wch: 15 }, // Tên đăng nhập
            { wch: 25 }, // Tên tổ chức
            { wch: 20 }, // Người quản lý
            { wch: 10 }, // Loại
            { wch: 25 }, // Email
            { wch: 15 }, // Loại hình
            { wch: 15 }, // Trạng thái
            { wch: 15 }, // Chức vụ
            { wch: 15 }, // Số thành viên
            { wch: 15 }, // Ngày thành lập
            { wch: 12 }, // Phường/Xã
            { wch: 30 }, // Địa chỉ
            { wch: 15 }, // Là thành viên
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "HTX_QTD");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `danh_sach_htx_qtd_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    /**
     * Exports user data to Excel
     */
    exportUsersToExcel: (users: any[], provinces: any[] = [], wards: any[] = []) => {
        // Create worksheet data
        const wsData = [
            [
                "Tên đăng nhập",
                "Tên tổ chức",
                "Người quản lý",
                "Vai trò",
                "Email",
                "Loại hình",
                "Trạng thái",
                "Chức vụ",
                "Số thành viên",
                "Ngày thành lập",
                "Tỉnh/Thành phố",
                "Phường/Xã",
                "Địa chỉ",
                "Là thành viên"
            ],
            ...users.map((user) => [
                user.Username,
                user.OrganizationName || "",
                user.Name || "",
                user.Role === "HTX" ? "Hợp tác xã" :
                    user.Role === "QTD" ? "Quỹ tín dụng" :
                        user.Role === "LMHTX" ? "LMHTX" :
                            user.Role === "UBKT" ? "UBKT" :
                                user.Role === "admin" ? "Admin" : user.Role || "",
                user.Email || "",
                user.Type === "NN" ? "Nông nghiệp" :
                    user.Type === "PNN" ? "Phi nông nghiệp" : user.Type || "",
                user.Status ? "Hoạt động" : "Ngừng hoạt động",
                user.Position || "",
                user.MemberCount || "",
                user.EstablishedDate ? new Date(user.EstablishedDate) : "",
                provinces.find(p => p.Id === user.ProvinceId)?.Name || user.Province?.Name || "",
                wards.find(w => w.Id === user.WardId)?.Name || user.Ward?.Name || "",
                user.Address || "",
                user.IsMember ? "Có" : "Không"
            ])
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        const colWidths = [
            { wch: 15 }, // Tên đăng nhập
            { wch: 25 }, // Tên tổ chức
            { wch: 20 }, // Người quản lý
            { wch: 10 }, // Vai trò
            { wch: 25 }, // Email
            { wch: 15 }, // Loại hình
            { wch: 15 }, // Trạng thái
            { wch: 15 }, // Chức vụ
            { wch: 15 }, // Số thành viên
            { wch: 15 }, // Ngày thành lập
            { wch: 18 }, // Tỉnh/Thành phố
            { wch: 12 }, // Phường/Xã
            { wch: 30 }, // Địa chỉ
            { wch: 15 }, // Là thành viên
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Người dùng");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `danh_sach_nguoi_dung_${new Date().toISOString().slice(0, 10)}.xlsx`);
    },

    /**
     * Downloads template for importing unions
     */
    downloadUnionTemplate: () => {
        // Create template data
        const templateData = [
            [
                "Tên đăng nhập*",
                "Mật khẩu*",
                "Tên tổ chức*",
                "Loại*",
                "Loại hình*",
                "Người quản lý*",
                "Chức vụ*",
                "Email",
                "Phường/Xã*",
                "Địa chỉ*",
                "Số thành viên*",
                "Ngày thành lập*",
                "Là thành viên*",
                "Trạng thái*"
            ],
            [
                "username1",
                "password123",
                "Tên tổ chức",
                "HTX",
                "NN",
                "Nguyễn Văn A",
                "Giám đốc",
                "email@example.com",
                "Phường/Xã",
                "Địa chỉ chi tiết",
                "10",
                new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                "Có",
                "Hoạt động"
            ]
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // Add notes to first row
        const notes = {
            A1: { t: "s", v: "Tên đăng nhập*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên đăng nhập là bắt buộc và không được trùng" }] },
            B1: { t: "s", v: "Mật khẩu*", c: [{ a: "Nguyễn Bá Thanh", t: "Mật khẩu phải có ít nhất 6 ký tự" }] },
            C1: { t: "s", v: "Tên tổ chức*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên tổ chức là bắt buộc" }] },
            D1: { t: "s", v: "Loại*", c: [{ a: "Nguyễn Bá Thanh", t: "Loại phải là HTX hoặc QTD" }] },
            E1: { t: "s", v: "Loại hình*", c: [{ a: "Nguyễn Bá Thanh", t: "Loại hình phải là NN hoặc PNN" }] },
            I1: { t: "s", v: "Phường/Xã*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên phường/xã, lấy từ hệ thống" }] },
            L1: { t: "s", v: "Ngày thành lập*", c: [{ a: "Nguyễn Bá Thanh", t: "Định dạng ngày: dd/MM/yyyy (Ví dụ: 15/05/2023)" }] },
        };

        Object.keys(notes).forEach(cell => {
            ws[cell] = notes[cell as keyof typeof notes];
        });

        // Set column widths
        const colWidths = [
            { wch: 15 }, // Tên đăng nhập
            { wch: 15 }, // Mật khẩu
            { wch: 25 }, // Tên tổ chức
            { wch: 10 }, // Loại
            { wch: 10 }, // Loại hình
            { wch: 20 }, // Người quản lý
            { wch: 15 }, // Chức vụ
            { wch: 25 }, // Email
            { wch: 15 }, // Phường/Xã
            { wch: 30 }, // Địa chỉ
            { wch: 15 }, // Số thành viên
            { wch: 15 }, // Ngày thành lập
            { wch: 10 }, // Là thành viên
            { wch: 10 }, // Trạng thái
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Mẫu nhập HTX, QTD");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, "mau_nhap_htx_qtd.xlsx");
    },

    /**
     * Downloads template for importing users
     */
    downloadUserTemplate: () => {
        // Create template data
        const templateData = [
            [
                "Tên đăng nhập*",
                "Mật khẩu*",
                "Tên tổ chức*",
                "Vai trò*",
                "Loại hình*",
                "Tên người quản lý*",
                "Chức vụ*",
                "Email",
                "Tỉnh/Thành phố*",
                "Phường/Xã*",
                "Địa chỉ*",
                "Số thành viên*",
                "Ngày thành lập*",
                "Là thành viên*",
                "Trạng thái*"
            ],
            [
                "username1",
                "password123",
                "Tên tổ chức",
                "HTX",
                "NN",
                "Nguyễn Văn A",
                "Giám đốc",
                "email@example.com",
                "Hà Nội",
                "Phường/Xã",
                "Địa chỉ chi tiết",
                "10",
                new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                "Có",
                "Hoạt động"
            ]
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // Add notes to first row
        const notes = {
            A1: { t: "s", v: "Tên đăng nhập*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên đăng nhập là bắt buộc và không được trùng" }] },
            B1: { t: "s", v: "Mật khẩu*", c: [{ a: "Nguyễn Bá Thanh", t: "Mật khẩu phải có ít nhất 6 ký tự" }] },
            C1: { t: "s", v: "Tên tổ chức*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên tổ chức là bắt buộc" }] },
            D1: { t: "s", v: "Vai trò*", c: [{ a: "Nguyễn Bá Thanh", t: "Vai trò phải là HTX, QTD, LMHTX, UBKT hoặc admin" }] },
            E1: { t: "s", v: "Loại hình*", c: [{ a: "Nguyễn Bá Thanh", t: "Loại hình phải là NN hoặc PNN" }] },
            I1: { t: "s", v: "Tỉnh/Thành phố*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên tỉnh/thành phố, lấy từ hệ thống" }] },
            J1: { t: "s", v: "Phường/Xã*", c: [{ a: "Nguyễn Bá Thanh", t: "Tên phường/xã, lấy từ hệ thống" }] },
            M1: { t: "s", v: "Ngày thành lập*", c: [{ a: "Nguyễn Bá Thanh", t: "Định dạng ngày: dd/MM/yyyy (Ví dụ: 15/05/2023)" }] },
        };

        Object.keys(notes).forEach(cell => {
            ws[cell] = notes[cell as keyof typeof notes];
        });

        // Set column widths
        const colWidths = [
            { wch: 15 }, // Tên đăng nhập
            { wch: 15 }, // Mật khẩu
            { wch: 25 }, // Tên tổ chức
            { wch: 10 }, // Vai trò
            { wch: 10 }, // Loại hình
            { wch: 20 }, // Người quản lý
            { wch: 15 }, // Chức vụ
            { wch: 25 }, // Email
            { wch: 18 }, // Tỉnh/Thành phố
            { wch: 15 }, // Phường/Xã
            { wch: 30 }, // Địa chỉ
            { wch: 15 }, // Số thành viên
            { wch: 15 }, // Ngày thành lập
            { wch: 10 }, // Là thành viên
            { wch: 10 }, // Trạng thái
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Mẫu nhập người dùng");

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, "mau_nhap_nguoi_dung.xlsx");
    },

    parseExcelFile: (data: any) => {
        try {
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Get raw data
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length > 0) {
                console.log("First row from Excel:", jsonData[0]);
            }

            return jsonData;
        } catch (error) {
            console.error("Error parsing Excel file:", error);
            throw new Error("Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.");
        }
    },

    validateUnionImportData: (data: any[], wardsList: { Id: number; Name: string }[]) => {
        const errors: Record<number, Record<string, string>> = {};

        data.forEach((row, index) => {
            try {
                const wardName = row['Phường/Xã'] || row['WardName'] || "";
                const wardExists = wardsList.some(w => w.Name.toLowerCase() === wardName.toLowerCase());

                if (wardName && !wardExists) {
                    errors[index] = {
                        ...errors[index] || {},
                        'Phường/Xã': `Không tìm thấy phường/xã "${wardName}" trong hệ thống`
                    };
                }
                const processedRow = {
                    'Tên đăng nhập': row['Tên đăng nhập'] || row['Username'] || "",
                    'Mật khẩu': row['Mật khẩu'] || row['Password'] || "",
                    'Tên tổ chức': row['Tên tổ chức'] || row['OrganizationName'] || "",
                    'Loại': row['Loại'] || row['Role'] || "",
                    'Loại hình': row['Loại hình'] || row['Type'] || "",
                    'Người quản lý': row['Người quản lý'] || row['Name'] || "",
                    'Chức vụ': row['Chức vụ'] || row['Position'] || "",
                    'Email': row['Email'] || "",
                    'Phường/Xã': wardName,
                    'Địa chỉ': row['Địa chỉ'] || row['Address'] || "",
                    'Số thành viên': row['Số thành viên'] || row['MemberCount'] || 0,
                    'Ngày thành lập': row['Ngày thành lập'] || row['EstablishedDate'] || "",
                    'Là thành viên': row['Là thành viên'] || row['IsMember'] || false,
                    'Trạng thái': row['Trạng thái'] || row['Status'] || false,
                };

                excelRowSchema.parse(processedRow);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const rowErrors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                        const field = err.path.join(".");
                        rowErrors[field] = err.message;
                    });
                    errors[index] = {
                        ...errors[index] || {},
                        ...rowErrors
                    };
                    console.error(`Validation errors for row ${index + 2}:`, rowErrors);
                }
            }
        });

        return errors;
    },



    /**
     * Validate user import data 
     */
    validateUserImportData: (data: any[]) => {
        const errors: Record<number, Record<string, string>> = {};

        data.forEach((row, index) => {
            try {
                // Similar validation logic could be implemented here
            } catch (error) {
                console.error(`Error validating row ${index}:`, error);
                errors[index] = { general: "Lỗi xác thực dữ liệu" };
            }
        });

        return errors;
    }
}; 