# KeyNexus - 智能密钥保险箱

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2FKeyNexus&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_MASTER_PASSWORD)

一个基于 Next.js 和 Supabase 的云端密钥管理工具，采用零知识架构，确保敏感数据在客户端加密后才离开设备。

## ✨ 特性

- 🔐 **零知识加密**: 所有敏感数据在浏览器中加密，服务器永不接触明文密钥
- 🔑 **AES-GCM 加密**: 使用 PBKDF2 密钥派生和 AES-GCM 加密算法
- 🌐 **Google OAuth**: 通过 Supabase Auth 集成 Google 登录
- 📱 **响应式设计**: 现代化的暗色主题 UI
- 🔄 **实时同步**: 通过 Supabase 实现跨设备数据同步
- 🛡️ **行级安全**: Supabase RLS 确保多租户数据隔离

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账户

### 安装依赖

```bash
npm install
```

### 环境配置

#### 1. 环境变量设置

1. 复制环境变量模板：
```bash
cp .env.local.example .env.local
```

2. 配置环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MASTER_PASSWORD=your_secure_master_password
```

> **重要提示**：`NEXT_PUBLIC_MASTER_PASSWORD` 是用于客户端加解密的固定主密码，请确保其足够复杂且安全（建议至少16位，包含大小写字母、数字和特殊字符）。

#### 2. Supabase 项目配置

1. **创建 Supabase 项目**：
   - 访问 [Supabase Dashboard](https://supabase.com/dashboard)
   - 点击 "New Project" 创建新项目
   - 等待项目初始化完成

2. **数据库表创建**：
   - 在 Supabase Dashboard 中进入 **SQL Editor**
   - 执行项目中的迁移脚本，或使用 CLI：
   ```bash
   npx supabase db push
   ```
   - 迁移文件位于 `supabase/migrations/20250301000000_create_api_keys.sql`

3. **配置 Google OAuth**：
   - 进入 Supabase Dashboard → **Authentication** → **Providers**
   - 启用 **Google** 提供商
   - 在 [Google Cloud Console](https://console.cloud.google.com/) 创建 OAuth 2.0 凭据
   - 将 Supabase 提供的重定向 URL 添加到 Google OAuth 的「已授权的重定向 URI」
   - 将生成的 Client ID 和 Client Secret 填入 Supabase

4. **获取项目凭据**：
   - 在 Supabase Dashboard → **Settings** → **API** 中获取：
     - Project URL（用于 `NEXT_PUBLIC_SUPABASE_URL`）
     - Anon public key（用于 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）

### 数据库设置

1. 启动本地 Supabase（可选）：
```bash
npx supabase start
```

2. 应用数据库迁移：
```bash
npx supabase db push
```

### 运行项目

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
KeyNexus/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── Header.tsx         # 页面头部
│   ├── KeyForm.tsx        # 密钥添加表单
│   ├── VaultList.tsx      # 密钥列表
│   ├── LoginPage.tsx      # 登录页面
│   └── providers/         # 上下文提供者
├── docs/                  # 项目文档
│   ├── AUTH_GUIDE.md      # 认证与授权指南
│   ├── PRD.md             # 产品需求文档
│   └── SETUP.md           # 部署与配置指南
├── lib/                   # 工具库
│   ├── crypto.ts          # 加密/解密函数
│   └── supabase/          # Supabase 客户端
├── supabase/              # Supabase 配置
│   └── migrations/        # 数据库迁移
└── types/                 # TypeScript 类型定义
```

## 🔧 技术栈

- **前端**: Next.js 16, React 19, TypeScript
- **样式**: CSS Variables, 暗色主题
- **后端**: Supabase (Auth + Database)
- **加密**: Web Crypto API (AES-GCM + PBKDF2)
- **部署**: Vercel

## 🔒 安全模型

### 零知识架构

1. **客户端加密**: 所有密钥在浏览器中加密
2. **密钥派生**: 使用 PBKDF2-HMAC-SHA256 从主密码生成 256-bit 密钥
3. **对称加密**: AES-GCM 确保数据完整性和机密性
4. **服务器隔离**: Supabase 仅存储加密数据

### 数据库模式

```sql
-- API 密钥表
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('simple', 'pair')),
  encrypted_payload TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 行级安全策略
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);
```

## � 文档

- [部署与配置指南](docs/SETUP.md) - 详细的部署和环境配置步骤
- [认证与授权指南](docs/AUTH_GUIDE.md) - Supabase + Google OAuth 认证方案详解
- [产品需求文档](docs/PRD.md) - 产品功能和技术架构说明

## �📖 使用指南

### 添加密钥

1. 使用 Google 账户登录
2. 点击"简单 Key"或"ID + Secret"选项卡
3. 填写服务名称和密钥信息
4. 点击"保存"按钮

### 复制密钥

- 点击密钥卡片上的"复制 Key"按钮
- 密钥将自动复制到剪贴板
- 成功消息会短暂显示

### 密钥类型

- **简单 Key**: 单密钥存储（如 API Token）
- **ID + Secret**: 双密钥存储（如 App ID + App Secret）

## 🛠️ 开发

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置
- 提交前运行测试和构建

```bash
# 代码检查
npm run lint

# 构建检查
npm run build
```

### 加密实现

核心加密逻辑位于 `lib/crypto.ts`：

- `encrypt()`: 加密 JSON 数据为 Base64 密文
- `decrypt()`: 从 Base64 密文解密为 JSON 数据
- `deriveKey()`: 从密码派生加密密钥

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系

如有问题，请通过 GitHub Issues 联系。