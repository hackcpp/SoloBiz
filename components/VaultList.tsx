'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useMasterPassword } from '@/components/providers/MasterPasswordProvider'
import { decrypt, type PayloadData, type SimpleData, type PairData } from '@/lib/crypto'
import { createBrowserClient } from '@/lib/supabase/client'

/**
 * 密钥列表项组件
 */
function KeyItem({ item, onDelete }: { item: any, onDelete: (id: string) => Promise<void> }) {
  const { masterPassword, isUnlocked } = useMasterPassword()
  const [copying, setCopying] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleCopy = async (field: 'key' | 'appId' | 'appSecret') => {
    if (!masterPassword) return

    try {
      // 1. 解密数据
      const data = await decrypt<PayloadData>(masterPassword, {
        ciphertext: item.encrypted_payload,
        iv: item.iv,
        salt: item.salt
      })

      // 2. 获取目标内容
      let text = ''
      if (item.type === 'simple') {
        text = (data as SimpleData).key
      } else {
        text = field === 'appId' ? (data as PairData).appId : (data as PairData).appSecret
      }

      // 3. 复制到剪贴板
      await navigator.clipboard.writeText(text)
      
      // 4. 显示反馈
      setCopying(field)
      setTimeout(() => setCopying(null), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Decryption failed')
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="key-card animate-fade-in">
      <div className="key-info">
        <div className="key-name">{item.name}</div>
        <div className="key-meta">
          <span className="badge">{item.type}</span>
          <span>Added on {new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="actions">
        {item.type === 'simple' ? (
          <button
            className="btn btn-secondary"
            onClick={() => handleCopy('key')}
            disabled={!isUnlocked}
          >
            {copying === 'key' ? '✅ Copied' : '📋 Copy Key'}
          </button>
        ) : (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => handleCopy('appId')}
              disabled={!isUnlocked}
            >
              {copying === 'appId' ? '✅ Copied' : '📋 ID'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => handleCopy('appSecret')}
              disabled={!isUnlocked}
            >
              {copying === 'appSecret' ? '✅ Copied' : '📋 Secret'}
            </button>
          </>
        )}

        {!showConfirm ? (
          <button
            className="btn btn-danger"
            onClick={() => setShowConfirm(true)}
            title="Delete Key"
          >
            🗑️
          </button>
        ) : (
          <div className="confirm-actions">
            <button 
              className="btn btn-danger btn-confirm" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '...' : 'Confirm'}
            </button>
            <button 
              className="btn btn-secondary btn-confirm" 
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 密钥库列表组件
 */
export function VaultList() {
  const { user } = useAuth()
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createBrowserClient(), [])

  const fetchKeys = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setKeys(data)
    }
    setLoading(false)
  }

  const handleDeleteKey = async (id: string) => {
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      fetchKeys()
    }
  }

  useEffect(() => {
    fetchKeys()

    // 监听刷新事件（例如在添加新 Key 后）
    const handleRefresh = () => fetchKeys()
    window.addEventListener('keynexus:refresh', handleRefresh)
    return () => window.removeEventListener('keynexus:refresh', handleRefresh)
  }, [user, supabase])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading vault...</div>
  }

  return (
    <section className="vault-section">
      <div className="vault-header">
        <h2 className="vault-title">Your Vault</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{keys.length} items</span>
      </div>

      {keys.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border)',
          color: 'var(--text-muted)'
        }}>
          No keys found. Add your first secret above!
        </div>
      ) : (
        <div className="vault-grid">
          {keys.map((item) => (
            <KeyItem key={item.id} item={item} onDelete={handleDeleteKey} />
          ))}
        </div>
      )}
    </section>
  )
}
