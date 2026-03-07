'use client'

import { AuthProvider, useAuth } from '@/components/providers/AuthProvider'
import { MasterPasswordProvider } from '@/components/providers/MasterPasswordProvider'
import { LoginPage } from '@/components/LoginPage'
import { Header } from '@/components/Header'
import { KeyForm } from '@/components/KeyForm'
import { VaultList } from '@/components/VaultList'

/**
 * 主仪表板组件
 * 根据认证状态显示不同内容：
 * - 未登录：显示登录页面
 * - 已登录：显示密钥管理界面
 */
function Dashboard() {
  const { user, loading } = useAuth()

  // 显示加载状态
  if (loading) {
    return (
      <main>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
      </main>
    )
  }

  // 未登录用户显示登录页面
  if (!user) {
    return <LoginPage />
  }

  // 已登录用户显示主界面
  return (
    <MasterPasswordProvider>
      <main>
        <Header />
        <KeyForm />
        <VaultList />
      </main>
    </MasterPasswordProvider>
  )
}

/**
 * 应用根组件
 * 设置认证和主密码上下文提供者
 */
export default function Home() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  )
}
