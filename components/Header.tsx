'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import { useMasterPassword } from '@/components/providers/MasterPasswordProvider'
import { useCallback, useState } from 'react'

/**
 * 页面头部组件
 * 显示用户信息和登出按钮
 */
export function Header() {
  const { user, signOut } = useAuth()

  /**
   * 处理用户登出
   * 调用 Supabase 认证的 signOut 方法
   */
  const handleLogout = useCallback(() => {
    signOut()
  }, [signOut])

  // 格式化用户邮箱显示（过长时截断）
  const email = user?.email ?? ''
  const displayEmail = email.length > 24 ? email.slice(0, 21) + '...' : email

  return (
    <header className="header">
      <div className="header-left">
        {/* 显示用户邮箱，过长时显示省略号 */}
        <span className="user-info">{displayEmail}</span>
      </div>
      {/* 登出按钮 */}
      <button type="button" className="btn btn-secondary" onClick={handleLogout}>
        Sign Out
      </button>
    </header>
  )
}
