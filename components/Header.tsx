'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useCallback } from 'react'

/**
 * 页面头部组件
 * 显示用户信息和登出按钮
 */
export function Header() {
  const { user, signOut } = useAuth()

  /**
   * 处理用户登出
   */
  const handleLogout = useCallback(() => {
    signOut()
  }, [signOut])

  // 格式化用户邮箱显示
  const email = user?.email ?? ''
  const displayEmail = email.length > 24 ? email.slice(0, 21) + '...' : email

  return (
    <header className="header animate-fade-in">
      <div className="user-info">
        Logged in as: <strong>{displayEmail}</strong>
      </div>
      <button type="button" className="btn btn-ghost" onClick={handleLogout}>
        Sign Out
      </button>
    </header>
  )
}
