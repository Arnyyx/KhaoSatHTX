'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'

type User = {
  Id: number
  Username: string
  OrganizationName: string
  Name: string
  Role: string
  Email: string
  Type: string
  ProvinceId: number
  DistrictId: number
  WardId: number
  Address: string
  Position: string
  NumberCount: number
  EstablishedDate: string
  MemberTV: number
  MemberKTV: number
  Status: boolean
  IsLocked: boolean
  SurveySuccess: number
  SurveyTime: number
}

type UserContextType = {
  user: User | null
  token: string | null
  login: (userData: User, tokenData: string) => void
  logout: () => void
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Lấy từ cookie khi load lần đầu
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = Cookies.get('user')
        const storedToken = Cookies.get('token')

        if (storedUser) {
          // Thêm validation cho dữ liệu user
          const parsedUser = JSON.parse(storedUser)
          if (parsedUser && typeof parsedUser === 'object' && 'Id' in parsedUser) {
            setUser(parsedUser)
          } else {
            Cookies.remove('user')
          }
        }

        if (storedToken) {
          setToken(storedToken)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid data
        Cookies.remove('user')
        Cookies.remove('token')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = (userData: User, tokenData: string) => {
    try {
      // Validate dữ liệu trước khi lưu
      if (!userData?.Id || !tokenData) {
        throw new Error('Invalid user data or token')
      }

      setUser(userData)
      setToken(tokenData)

      // Lưu vào cookie
      Cookies.set('user', JSON.stringify(userData), { expires: 1 }) // Cookie hết hạn sau 1 ngày
      Cookies.set('token', tokenData, { expires: 1 }) // Cookie hết hạn sau 1 ngày
    } catch (error) {
      console.error('Login error:', error)
      throw error // Re-throw để component có thể xử lý
    }
  }

  const logout = () => {
    try {
      setUser(null)
      setToken(null)
      Cookies.remove('user')
      Cookies.remove('token')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const contextValue = {
    user,
    token,
    login,
    logout,
    loading
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
