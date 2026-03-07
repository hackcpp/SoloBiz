'use client'

import { createContext, useContext } from 'react'

/**
 * 主密码上下文接口
 * 提供固定的主密码和解锁状态
 */
interface MasterPasswordContextValue {
  masterPassword: string  // 固定的主密码
  isUnlocked: boolean     // 是否已解锁（始终为true）
}

const MasterPasswordContext = createContext<MasterPasswordContextValue | null>(null)

/**
 * 主密码提供者组件
 *
 * 简化版本：使用固定的主密码，避免用户输入
 * 在生产环境中应该实现安全的密码输入和管理
 */
export function MasterPasswordProvider({ children }: { children: React.ReactNode }) {
  return (
    <MasterPasswordContext.Provider
      value={{
        masterPassword: 'Ziyou@2026',  // 固定的主密码
        isUnlocked: true,               // 始终处于解锁状态
      }}
    >
      {children}
    </MasterPasswordContext.Provider>
  )
}

/**
 * 主密码 Hook
 * 获取主密码上下文，必须在 MasterPasswordProvider 内部使用
 */
export function useMasterPassword() {
  const ctx = useContext(MasterPasswordContext)
  if (!ctx) throw new Error('useMasterPassword must be used within MasterPasswordProvider')
  return ctx
}
