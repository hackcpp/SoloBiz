'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMasterPassword } from '@/components/providers/MasterPasswordProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { createBrowserClient } from '@/lib/supabase/client'
import { decrypt } from '@/lib/crypto'
import type { ApiKeyRecord } from '@/types'
import type { SimpleData, PairData } from '@/lib/crypto'

/**
 * 密钥库列表组件
 *
 * 功能：
 * - 显示用户的所有加密密钥
 * - 支持一键复制密钥到剪贴板
 * - 实时解密和显示密钥
 * - 错误处理和成功反馈
 *
 * 安全特性：
 * - 密钥仅在需要时解密
 * - 复制后立即清除内存中的明文
 * - 密码错误时显示友好提示
 */
export function VaultList() {
  // 组件状态
  const [items, setItems] = useState<ApiKeyRecord[]>([])     // 密钥列表
  const [loading, setLoading] = useState(true)               // 加载状态
  const [error, setError] = useState<string | null>(null)    // 错误信息
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // 成功消息

  // 依赖注入
  const { masterPassword, isUnlocked } = useMasterPassword()
  const { user } = useAuth()
  const supabase = useMemo(() => createBrowserClient(), [])

  /**
   * 获取用户密钥列表
   * 从 Supabase 查询当前用户的所有密钥记录
   */
  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error: err } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
      setItems([])
    } else {
      setError(null)
      setItems(data ?? [])
    }
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    const handler = () => fetchItems()
    window.addEventListener('keynexus:refresh', handler)
    return () => window.removeEventListener('keynexus:refresh', handler)
  }, [fetchItems])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      setError('Copy failed')
      return false
    }
  }

  const handleCopyKey = async (record: ApiKeyRecord) => {
    if (!masterPassword) return
    setError(null)
    try {
      const data = await decrypt<SimpleData>(masterPassword, {
        ciphertext: record.encrypted_payload,
        iv: record.iv,
        salt: record.salt,
      })
      if (await copyToClipboard(data.key)) {
        setSuccessMessage(`${record.name} Secret copied to clipboard`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password verification failed')
    }
  }

  const handleCopyId = async (record: ApiKeyRecord) => {
    if (!masterPassword) return
    setError(null)
    try {
      const data = await decrypt<PairData>(masterPassword, {
        ciphertext: record.encrypted_payload,
        iv: record.iv,
        salt: record.salt,
      })
      if (await copyToClipboard(data.appId)) {
        setSuccessMessage(`${record.name} Key copied to clipboard`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password verification failed')
    }
  }

  const handleCopySecret = async (record: ApiKeyRecord) => {
    if (!masterPassword) return
    setError(null)
    try {
      const data = await decrypt<PairData>(masterPassword, {
        ciphertext: record.encrypted_payload,
        iv: record.iv,
        salt: record.salt,
      })
      if (await copyToClipboard(data.appSecret)) {
        setSuccessMessage(`${record.name} Secret copied to clipboard`)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码校验失败')
    }
  }

  const formatDate = (s: string) => {
    const d = new Date(s)
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTypeLabel = (type: string) => (type === 'simple' ? '简单 Key' : 'ID + Secret')
  const getTypeIcon = (type: string) => (type === 'simple' ? '🔑' : '🔐')

  if (loading) return <div className="vault-section">Loading...</div>

  return (
    <section className="vault-section">
      <h2>Key Vault</h2>
      {successMessage && (
        <p style={{ color: 'var(--success)', fontSize: 14, marginBottom: 12 }}>{successMessage}</p>
      )}
      {error && (
        <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No keys yet, please add some first</p>
      ) : (
        <div className="vault-list">
          {items.map((record) => (
            <div key={record.id} className="vault-card">
              <div className="vault-card-info">
                <div className="vault-card-icon">{getTypeIcon(record.type)}</div>
                <div className="vault-card-meta">
                  <span className="vault-card-name">{record.name}</span>
                  <span className="vault-card-date">{formatDate(record.created_at)}</span>
                  <span className="vault-card-type">{getTypeLabel(record.type)}</span>
                </div>
              </div>
              <div className="vault-card-actions">
                {record.type === 'simple' ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!isUnlocked}
                    onClick={() => handleCopyKey(record)}
                  >
                    Copy Key
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!isUnlocked}
                      onClick={() => handleCopyId(record)}
                    >
                      Copy ID
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!isUnlocked}
                      onClick={() => handleCopySecret(record)}
                    >
                      Copy Secret
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
