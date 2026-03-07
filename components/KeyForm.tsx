'use client'

import { useState, useMemo } from 'react'
import { useMasterPassword } from '@/components/providers/MasterPasswordProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { createBrowserClient } from '@/lib/supabase/client'
import { encrypt } from '@/lib/crypto'
import type { SimpleData, PairData } from '@/lib/crypto'

/**
 * 密钥类型：简单密钥或 ID+密钥 对
 */
type TabType = 'simple' | 'pair'

/**
 * 密钥添加表单组件
 *
 * 支持两种密钥类型：
 * - 简单 Key：单个 API 密钥
 * - ID + Secret：应用 ID 和密钥对
 *
 * 功能：
 * - 表单验证和提交
 * - 客户端加密后保存到 Supabase
 * - 实时错误提示
 */
export function KeyForm() {
  // 表单状态
  const [tab, setTab] = useState<TabType>('simple')  // 当前选中的标签页
  const [name, setName] = useState('')               // 服务名称
  const [simpleKey, setSimpleKey] = useState('')     // 简单密钥
  const [appId, setAppId] = useState('')             // 应用 ID
  const [appSecret, setAppSecret] = useState('')     // 应用密钥
  const [submitting, setSubmitting] = useState(false) // 提交状态
  const [error, setError] = useState<string | null>(null) // 错误信息

  // 依赖注入
  const { masterPassword } = useMasterPassword()
  const { user } = useAuth()
  const supabase = useMemo(() => createBrowserClient(), [])

  /**
   * 处理表单提交
   * 加密数据后保存到数据库
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 基础验证
    if (!masterPassword || !user) {
      setError('请先登录')
      return
    }
    if (!name.trim()) {
      setError('Please enter the name' )
      return
    }

    setSubmitting(true)
    try {
      const data: SimpleData | PairData =
        tab === 'simple'
          ? { key: simpleKey }
          : { appId, appSecret }

      const { ciphertext, iv, salt } = await encrypt(masterPassword, data)

      const { error: dbError } = await supabase.from('api_keys').insert({
        user_id: user.id,
        name: name.trim(),
        type: tab,
        encrypted_payload: ciphertext,
        iv,
        salt,
      })

      if (dbError) throw dbError

      setName('')
      setSimpleKey('')
      setAppId('')
      setAppSecret('')
      window.dispatchEvent(new CustomEvent('keynexus:refresh'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = name.trim() && (tab === 'simple' ? simpleKey : appId && appSecret)

  return (
    <div className="form-card">
      <div className="form-tabs">
        <button
          type="button"
          className={`form-tab ${tab === 'simple' ? 'active' : ''}`}
          onClick={() => setTab('simple')}
        >
          Key
        </button>
        <button
          type="button"
          className={`form-tab ${tab === 'pair' ? 'active' : ''}`}
          onClick={() => setTab('pair')}
        >
          ID + Secret
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-fields">
          <div className="form-field">
            <label>Name</label>
            <input
              type="text"
              placeholder="e.g.: GitHub Token"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {tab === 'simple' ? (
            <div className="form-field">
              <label>API Key</label>
              <input
                type="password"
                placeholder="sk-xxx..."
                value={simpleKey}
                onChange={(e) => setSimpleKey(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="form-field">
                <label>App ID</label>
                <input
                  type="text"
                  placeholder="wx..."
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label>App Secret</label>
                <input
                  type="password"
                  placeholder="sct..."
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {error && (
          <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
