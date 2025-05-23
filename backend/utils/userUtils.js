// Định nghĩa các header mong đợi và alias
const EXPECTED_HEADERS = {
    Id: ["Id", "Mã"],
    Username: ["Username", "Tên đăng nhập"],
    Password: ["Password", "Mật khẩu"],
    OrganizationName: ["OrganizationName", "Tên tổ chức"],
    Name: ["Name", "Người quản lý"],
    Role: ["Role", "Loại"],
    Email: ["Email", "Email"],
    Type: ["Type", "Loại hình"],
    Province: ["Province", "Tỉnh/Thành phố"],
    Ward: ["Ward", "Phường/Xã"],
    Address: ["Address", "Địa chỉ"],
    Position: ["Position", "Chức vụ"],
    MemberCount: ["MemberCount", "Số lượng"],
    EstablishedDate: ["EstablishedDate", "Ngày thành lập"],
    IsMember: ["IsMember", "Là thành viên"],
    Status: ["Status", "Trạng thái"],
    IsLocked: ["IsLocked", "Khóa"],
    SurveyStatus: ["SurveyStatus", "Trạng thái khảo sát"],
    SurveyTime: ["SurveyTime", "Thời gian khảo sát"],
};

const mapExcelHeaders = (headers) => {
    const headerMap = {};
    Object.keys(EXPECTED_HEADERS).forEach((field) => {
        const alias = EXPECTED_HEADERS[field].find((h) => headers.includes(h));
        if (alias) headerMap[alias] = field;
    });
    return headerMap;
};

const checkRequiredHeaders = (headerMap) => {
    const requiredHeaders = ["Username", "Password", "Role"];
    const missingHeaders = requiredHeaders.filter(
        (h) => !Object.values(headerMap).includes(h)
    );
    return missingHeaders;
};

const validateUserData = (row) => {
    const errors = [];

    // Required fields validation
    if (!row.Username) errors.push("Username là bắt buộc");
    if (!row.Password) errors.push("Password là bắt buộc");
    if (!row.Role) errors.push("Role là bắt buộc");
    if (!row.OrganizationName) errors.push("Tên tổ chức là bắt buộc");
    if (!row.Name) errors.push("Tên người quản lý là bắt buộc");
    if (!row.Type) errors.push("Loại hình là bắt buộc");
    if (!row.Ward) errors.push("Phường/Xã là bắt buộc");
    if (!row.Address) errors.push("Địa chỉ là bắt buộc");
    if (!row.Position) errors.push("Chức vụ là bắt buộc");
    if (!row.MemberCount) errors.push("Số thành viên là bắt buộc");
    if (!row.EstablishedDate) errors.push("Ngày thành lập là bắt buộc");

    // Format validation
    if (row.Username && row.Username.length > 50) {
        errors.push("Username không được vượt quá 50 ký tự");
    }

    if (row.Password && row.Password.length < 6) {
        errors.push("Password phải có ít nhất 6 ký tự");
    }

    if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
        errors.push("Email không hợp lệ");
    }

    if (row.Role && !["LMHTX", "QTD", "HTX", "admin", "UBKT"].includes(row.Role)) {
        errors.push("Role phải là một trong các giá trị: LMHTX, QTD, HTX, admin, UBKT");
    }

    if (row.Type && !["PNN", "NN"].includes(row.Type)) {
        errors.push("Loại hình phải là NN (Nông nghiệp) hoặc PNN (Phi nông nghiệp)");
    }

    if (row.IsMember !== undefined) {
        const validIsMemberValues = ['true', 'false', 'Có', 'Không', 'có', 'không', '0', '1', true, false, 0, 1];
        if (!validIsMemberValues.includes(row.IsMember)) {
            errors.push("Là thành viên phải là một trong các giá trị: Có/Không, true/false, 1/0");
        }
    }

    if (row.Status !== undefined) {
        const validStatusValues = ['true', 'false', 'Hoạt động', 'Ngừng hoạt động', '0', '1', true, false, 0, 1];
        if (!validStatusValues.includes(row.Status)) {
            errors.push("Trạng thái phải là một trong các giá trị: Hoạt động/Ngừng hoạt động, true/false, 1/0");
        }
    }

    if (row.EstablishedDate) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.EstablishedDate)) {
            errors.push("Ngày thành lập phải có định dạng DD/MM/YYYY");
        } else {
            const [day, month, year] = row.EstablishedDate.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                errors.push("Ngày thành lập không hợp lệ");
            }
        }
    }

    if (row.MemberCount !== undefined) {
        const memberCount = Number(row.MemberCount);
        if (isNaN(memberCount)) {
            errors.push("Số thành viên phải là số");
        } else if (memberCount < 1) {
            errors.push("Số thành viên phải lớn hơn 0");
        }
    }

    return errors;
};

module.exports = {
    EXPECTED_HEADERS,
    mapExcelHeaders,
    checkRequiredHeaders,
    validateUserData,
};

