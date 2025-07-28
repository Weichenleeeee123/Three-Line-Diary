# 三句话日记 (Three-Line Diary)

一个简洁优雅的日记应用，让你用三句话记录每一天的美好时光。

## ✨ 功能特性

### 📝 核心功能
- **三句话记录**：用简洁的三句话记录每日感悟
- **日历视图**：直观查看历史记录，点击日期查看详情
- **智能总结**：AI生成周报和心情洞察
- **数据管理**：支持编辑、删除日记条目

### 🌍 用户体验
- **多语言支持**：完整的中英文界面切换
- **响应式设计**：完美适配手机和桌面设备
- **现代化UI**：简洁美观的界面设计
- **本地存储**：数据安全保存在本地

### 🏆 成就系统
- **写作里程碑**：连续记录天数奖励
- **内容质量**：字数和质量成就
- **使用频率**：活跃度奖励
- **特殊节日**：节日主题成就

## 🚀 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand
- **图标库**：Lucide React
- **AI服务**：Google Gemini API
- **部署平台**：腾讯云开发

## 📦 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm 或 pnpm

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd Three-Line-Diary

# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev
# 或
pnpm dev
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌐 在线体验

访问：[https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/](https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/)

## 📱 功能截图

### 首页 - 三句话输入
简洁的输入界面，每日一句励志语录激发灵感。

### 日历视图
直观的日历界面，轻松查看历史记录。

### AI智能总结
- **周报生成**：自动分析一周的记录，生成深度总结
- **心情洞察**：AI分析情感变化，提供个性化建议

### 个人中心
- 成就展示
- 统计数据
- 语言设置
- 数据管理

## 🔧 配置说明

### AI功能配置
如需使用AI总结功能，请配置Gemini API密钥：

1. 在Google AI Studio获取API密钥
2. 在应用设置中配置API密钥

### 环境变量
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## 📂 项目结构

```
src/
├── components/          # 可复用组件
│   ├── BottomNavigation.tsx
│   ├── JournalModal.tsx
│   └── Layout.tsx
├── hooks/              # 自定义Hooks
│   ├── useI18n.ts      # 国际化
│   └── useJournalStore.ts  # 数据管理
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Calendar.tsx    # 日历
│   ├── Summary.tsx     # 总结
│   └── Profile.tsx     # 个人中心
├── services/           # API服务
│   └── geminiApi.ts    # AI服务
└── utils/              # 工具函数
    └── mockData.ts     # 模拟数据
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

### 开发规范
- 使用TypeScript进行类型检查
- 遵循ESLint代码规范
- 组件保持单一职责
- 提交前运行测试

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**开始你的三句话日记之旅吧！** ✍️📖✨
