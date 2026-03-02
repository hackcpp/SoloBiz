import { createClient } from '@supabase/supabase-js'

export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  // 如果是占位符，返回一个 mock 对象
  if (!url || url.startsWith('your_')) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ data: null, error: new Error('No Supabase config') }),
        signOut: async () => ({ error: null }),
      },
    } as any
  }
  
  return createClient(url, key)
}
