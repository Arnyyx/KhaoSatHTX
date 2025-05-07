'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@/context/UserContext'
import { Button } from '@/components/ui/button'
import { API } from '@/lib/api'
import Link from 'next/link'

export default function NavButton() {
    const { user, token, logout, loading } = useUser()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(!!user)
    }, [user])

    if (loading) {
        return null
    }

    const handleLogout = async () => {
        try {
            const res = await fetch(`${API.users}/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                credentials: 'include' // nếu bạn dùng cookie
            })

            if (!res.ok) {
                console.error('Logout request failed')
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            logout() // luôn logout local dù API fail
        }
    }

    return isLoggedIn ? (
        <nav className="flex gap-4">
            <Button variant="secondary" size="sm" onClick={handleLogout}>Đăng xuất</Button>
            <Link href="/profile">
                <Button variant="secondary" size="sm">Profile</Button>
            </Link>
        </nav>
    ) : (
        <nav className="flex gap-4">
            <Link href="/login">
                <Button variant="secondary" size="sm">Đăng nhập</Button>
            </Link>
            <Link href="/admin">
                <Button variant="secondary" size="sm">Admin</Button>
            </Link>
        </nav>
    )
}
