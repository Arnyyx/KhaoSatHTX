// types/user.ts
export interface User {
    Id: number;
    Username: string;
    OrganizationName?: string;
    Name?: string;
    Password?: string;
    Role: 'LMHTX' | 'QTD' | 'HTX' | 'admin' | 'UBKT';
    Email?: string;
    Type?: 'PNN' | 'NN';
    ProvinceId?: number;
    Province?: { Name: string; Region?: string };
    WardId?: number;
    Ward?: { Name: string };
    Address?: string;
    Position?: string;
    MemberCount?: number;
    EstablishedDate?: string;
    IsMember?: boolean;
    Status?: boolean;
    IsLocked?: boolean;
    SurveyStatus?: boolean;
    SurveyTime?: number;
}

export interface UserResponse {
    total: number;
    items: User[];
}

export interface UserFormData {
    Username: string;
    OrganizationName?: string;
    Name?: string;
    Password?: string;
    Role: 'LMHTX' | 'QTD' | 'HTX' | 'admin' | 'UBKT';
    Email?: string;
    Type?: 'PNN' | 'NN';
    ProvinceId?: number;
    WardId?: number;
    Address?: string;
    Position?: string;
    MemberCount?: number;
    EstablishedDate?: string;
    IsMember?: boolean;
    Status?: boolean;
    IsLocked?: boolean;
    SurveyStatus?: boolean;
    SurveyTime?: number;
}

export interface Province {
    Id: number;
    Name: string;
    Region: string;
}

export interface Ward {
    Id: number;
    Name: string;
}

export interface ProfileCardProps {
    user: {
        Id: number;
        Username: string;
        OrganizationName: string;
        Name: string;
        Role: string;
        Email: string;
        Type: string;
        ProvinceId: number;
        DistrictId: number;
        WardId: number;
        Address: string;
        Position: string;
        NumberCount?: number;
        EstablishedDate: string;
        MemberTV?: number;
        MemberKTV?: number;
        Status: boolean;
        IsLocked: boolean;
        SurveySuccess: number;
        SurveyTime: number;
    };
    isAdmin?: boolean;
}