'use client'

import { useAuth } from '@/components/providers/AuthProvider'

/**
 * 登录页面组件
 *
 * 功能：
 * - 显示应用介绍
 * - 提供 Google OAuth 登录按钮
 * - 居中布局，响应式设计
 */
export function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="login-page">
      <div className="login-card">
        {/* 应用标题和标语 */}
        <h1>KeyNexus</h1>
        <p>智能密钥保险箱 · 零知识加密，安全同步</p>

        {/* Google 登录按钮 */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => signInWithGoogle()}
          style={{ width: '100%', padding: '12px' }}
        >
          使用 Google 登录
        </button>
      </div>
    </div>
  )
}
