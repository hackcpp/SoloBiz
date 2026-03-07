import { createClient } from '@supabase/supabase-js'

/**
 * 创建 Supabase 浏览器客户端
 *
 * 使用环境变量配置：
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase 项目 URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase 匿名密钥
 *
 * @returns 配置好的 Supabase 客户端实例
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key)
}
