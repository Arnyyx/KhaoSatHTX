// Định nghĩa các header mong đợi và alias
const EXPECTED_HEADERS = {
    Id: ["Id", "Mã"],
    Username: ["Username", "Tên đăng nhập"],
    Password: ["Password", "Mật khẩu"],
    OrganizationName: ["OrganizationName", "Tên tổ chức"],
    Name: ["Name", "Họ tên"],
    Role: ["Role", "Loại"],
    Email: ["Email", "Email"],
    Type: ["Type", "Loại hình"],
    Province: ["Province", "Tỉnh/Thành phố"],
    Ward: ["Ward", "Phường/Xã"],
    Address: ["Address", "Địa chỉ"],
    Position: ["Position", "Chức vụ"],
    MemberCount: ["MemberCount", "Số lượng"],
    EstablishedDate: ["EstablishedDate", "Ngày thành lập"],
    IsMember: ["IsMember", "Thành viên"],
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

    if (!row.Username) errors.push("Username là bắt buộc");
    if (!row.Password) errors.push("Password là bắt buộc");
    if (!row.Role) errors.push("Role là bắt buộc");

    if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
        errors.push("Email không hợp lệ");
    }

    if (row.Role && !["LMHTX", "QTD", "HTX", "admin", "UBKT"].includes(row.Role)) {
        errors.push("Role không hợp lệ");
    }

    if (row.Type && !["PNN", "NN"].includes(row.Type)) {
        errors.push("Type không hợp lệ");
    }

    if (row.IsMember !== undefined && typeof row.IsMember !== 'boolean' && 
        row.IsMember !== 'true' && row.IsMember !== 'false' && 
        row.IsMember !== '0' && row.IsMember !== '1') {
        errors.push("IsMember phải là giá trị boolean");
    }

    if (
        row.EstablishedDate &&
        !/^\d{2}\/\d{2}\/\d{4}$/.test(row.EstablishedDate)
    ) {
        errors.push("EstablishedDate phải có định dạng DD/MM/YYYY");
    }

    if (row.MemberCount !== undefined && isNaN(Number(row.MemberCount))) {
        errors.push("MemberCount phải là số");
    }

    return errors;
};

module.exports = {
    EXPECTED_HEADERS,
    mapExcelHeaders,
    checkRequiredHeaders,
    validateUserData,
};

