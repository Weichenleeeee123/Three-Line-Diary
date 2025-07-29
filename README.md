<div align="center">
  <img src="./public/app-icon.svg" alt="Three-Line Diary" width="120" height="120">
  
  # 三句话日记 (Three-Line Diary)
  
  **一个简洁优雅的日记应用，让你用三句话记录每一天的美好时光** ✨
  
  [![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
  [🌐 在线体验](https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/) | [📖 使用指南](#使用指南) | [🚀 快速开始](#快速开始) | [🌍 English](./README_EN.md)
</div>

---

## 💡 项目理念

在快节奏的生活中，我们常常忘记记录生活的美好瞬间。**三句话日记**倡导用最简洁的方式记录每一天：
- 🌅 **第一句**：今天发生了什么？
- 💭 **第二句**：我有什么感受？
- 🌟 **第三句**：我学到了什么？

简单三句话，却能完整记录一天的精彩！

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 📝 核心功能
- 🖊️ **三句话记录** - 简洁的三句话记录每日感悟
- 🎤 **语音识别** - 腾讯云ASR实时语音转文字，支持语音输入日记内容
- 📷 **图片日记** - 支持拍照或选择图片，记录视觉回忆
- 🌤️ **天气记录** - 自动获取并显示当日天气状况，为日记增添情境信息
- 📅 **日历视图** - 直观查看历史记录，点击日期查看详情
- 👆 **滑动手势** - 总结页面支持丝滑的左右滑动切换周总结，键盘方向键支持
- 📱 **PWA支持** - 支持安装到桌面，离线使用，原生应用体验
- 🤖 **AI智能总结** - Gemini AI生成周报和心情洞察
- 📤 **分享功能** - 优化的图片分享预览界面，支持保存和社交分享
- 📊 **数据管理** - 支持编辑、删除、导出日记条目
- 🔍 **搜索功能** - 快速查找历史记录
- 📈 **统计分析** - 记录天数、字数等数据统计
- 📊 **情绪趋势分析** - 智能分析日记情绪变化，可视化展示7天/30天情绪趋势图表

</td>
<td width="50%">

### 🌍 用户体验
- 🌐 **多语言支持** - 完整的中英文界面切换
- 📱 **响应式设计** - 完美适配手机和桌面设备
- 🎨 **现代化UI** - 简洁美观的界面设计
- 🎤 **智能语音** - 实时语音识别，音频可视化反馈，流畅的语音输入体验
- 🖼️ **图片预览优化** - 精心调整的按钮布局和间距，完美的移动端体验
- 💾 **本地存储** - 数据安全保存在本地
- 🔊 **音效反馈** - 优雅的交互音效
- ⚡ **流畅动画** - 丝滑的打字机效果和滑动手势交互
- 🎯 **手势交互** - 支持触摸滑动和键盘导航的多种交互方式
- 📲 **PWA体验** - 支持安装到桌面，离线缓存，推送通知，原生应用般的使用体验

</td>
</tr>
</table>

### 🏆 成就系统
- 🏅 **写作里程碑** - 连续记录天数奖励（7天、30天、100天...）
- 📏 **内容质量** - 字数和质量成就
- 🔥 **使用频率** - 活跃度奖励
- 🎉 **特殊节日** - 节日主题成就
- 🌟 **个人成长** - 记录生活点滴的成就感

## 🚀 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式方案**：Tailwind CSS
- **状态管理**：Zustand
- **图标库**：Lucide React
- **语音识别**：腾讯云ASR (Automatic Speech Recognition)
- **AI服务**：Google Gemini API
- **PWA技术**：Service Worker + Web App Manifest
- **部署平台**：腾讯云开发

## 🚀 快速开始

### 📋 环境要求
- **Node.js** >= 16.0.0
- **包管理器** npm 或 pnpm
- **浏览器** Chrome, Firefox, Safari, Edge (现代浏览器)

### ⚡ 一键启动

```bash
# 1️⃣ 克隆项目
git clone https://github.com/Weichenleeeee123/Three-Line-Diary.git
cd Three-Line-Diary

# 2️⃣ 安装依赖
npm install
# 或使用 pnpm (推荐，更快)
pnpm install

# 3️⃣ 配置环境变量 (可选)
cp .env.example .env
# 编辑 .env 文件，添加你的 Gemini API 密钥

# 4️⃣ 启动开发服务器
npm run dev
# 或
pnpm dev

# 🎉 打开浏览器访问 http://localhost:5173
```

### 🏗️ 构建部署

```bash
# 构建生产版本
npm run build

# 本地预览构建结果
npm run preview

# 代码质量检查
npm run check
```

## 📖 使用指南

### 🖊️ 开始写日记
1. **打开应用** - 访问首页，每日都有励志语录激发灵感
2. **写三句话** - 按照提示写下今天的三句话
3. **语音输入** - 点击麦克风按钮，使用语音快速输入内容
4. **添加图片** - 可选择拍照或从相册选择图片记录视觉回忆
5. **保存记录** - 点击保存，你的日记就记录下来了

### 🎤 语音识别使用
- **开始录音** - 点击输入框右侧的麦克风按钮
- **实时转换** - 说话时可看到实时的语音转文字效果
- **确认输入** - 录音结束后，转换的文字会自动插入到输入框
- **音频反馈** - 录音过程中有可视化的音频波形反馈

### 📅 查看历史
- **日历视图** - 点击底部导航的日历图标
- **查看详情** - 点击有记录的日期查看当天内容
- **编辑修改** - 长按或点击编辑按钮修改内容

### 👆 滑动手势交互
- **触摸滑动** - 在总结页面左右滑动可切换不同周的总结内容
- **实时跟随** - 滑动时页面会实时跟随手指移动，提供即时视觉反馈
- **弹性动画** - 包含微妙的缩放和透明度变化，增强视觉层次感
- **键盘导航** - 使用左右方向键也可以切换周总结（方便桌面端测试）
- **智能识别** - 基于滑动速度和距离的双重判断，确保操作意图准确
- **触觉反馈** - 支持设备震动反馈（如果设备支持）

### 🤖 AI智能总结
- **周报生成** - 每周自动分析你的记录，生成深度总结
- **心情洞察** - AI分析你的情感变化，提供个性化建议
- **配置API** - 在个人中心配置Gemini API密钥启用AI功能

### 📲 PWA安装使用
- **手机端安装** - 浏览器会自动显示"安装到桌面"提示，点击即可安装
- **桌面端安装** - Chrome/Edge地址栏会显示安装图标，点击安装为桌面应用
- **离线使用** - 安装后即使断网也能正常使用，数据自动缓存
- **原生体验** - 全屏显示，快速启动，与原生应用无异
- **快捷方式** - 支持"写日记"和"查看总结"快捷方式，直接访问特定功能

### 🏆 解锁成就
- **坚持记录** - 连续记录解锁里程碑成就
- **丰富内容** - 写更多字数解锁内容成就
- **探索功能** - 使用各种功能解锁特殊成就

## 🌐 在线体验

🔗 **在线演示**：[https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/](https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/)

> 💡 **提示**：建议使用手机浏览器访问，体验最佳的移动端效果

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
- 情绪趋势分析图表

## 🔧 配置说明

### 🎤 语音识别配置

为了使用语音识别功能，你需要配置腾讯云ASR服务：

#### 1️⃣ 获取腾讯云密钥
- 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
- 开通语音识别服务
- 获取SecretId和SecretKey

#### 2️⃣ 配置环境变量
```bash
# 在 .env 文件中添加腾讯云配置
VITE_TENCENT_SECRET_ID=your_secret_id_here
VITE_TENCENT_SECRET_KEY=your_secret_key_here
```

### 🤖 AI功能配置

为了使用AI智能总结功能，你需要配置Gemini API密钥：

#### 1️⃣ 获取API密钥
- 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
- 登录你的Google账号
- 创建新的API密钥
- 复制生成的密钥

#### 2️⃣ 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# 将 your_gemini_api_key_here 替换为你的实际API密钥
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

#### 3️⃣ 重启开发服务器
```bash
# 重启服务器使环境变量生效
npm run dev
```

> ⚠️ **安全提醒**：
> - 不要将 `.env` 文件提交到Git仓库
> - API密钥是敏感信息，请妥善保管
> - 生产环境请在服务器配置环境变量

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

## 🌟 项目亮点

### 🎯 设计理念
- **极简主义** - 三句话记录，去除冗余，专注核心
- **用户体验** - 流畅动画，优雅交互，细节打磨
- **技术先进** - 现代化技术栈，类型安全，性能优化
- **数据安全** - 本地存储，隐私保护，安全可靠

### 🔥 技术特色
- **🚀 性能优化** - Vite构建，快速热更新，秒级启动
- **📱 响应式设计** - 移动优先，完美适配各种设备
- **🎨 现代UI** - Tailwind CSS，原子化样式，高度可定制
- **🔧 类型安全** - 全量TypeScript，编译时错误检查
- **🌐 国际化** - 完整i18n支持，轻松切换语言
- **🤖 AI集成** - Gemini API，智能分析，个性化洞察

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是Bug报告、功能建议还是代码贡献。

### 🐛 报告问题
- 使用 [Issues](https://github.com/your-username/Three-Line-Diary/issues) 报告Bug
- 提供详细的复现步骤和环境信息
- 附上截图或错误日志（如果有）

### 💡 功能建议
- 在Issues中提出新功能建议
- 详细描述功能需求和使用场景
- 讨论实现方案和技术细节

### 🔧 代码贡献

#### 开发流程
```bash
# 1. Fork 项目到你的GitHub
# 2. 克隆你的Fork
git clone https://github.com/your-username/Three-Line-Diary.git

# 3. 创建功能分支
git checkout -b feature/your-feature-name

# 4. 开发和测试
npm run dev
npm run check

# 5. 提交更改
git add .
git commit -m "feat: add your feature description"

# 6. 推送到你的Fork
git push origin feature/your-feature-name

# 7. 创建Pull Request
```

#### 开发规范
- ✅ **TypeScript** - 使用TypeScript进行类型检查
- ✅ **ESLint** - 遵循ESLint代码规范
- ✅ **组件设计** - 保持组件单一职责，小于300行
- ✅ **提交规范** - 使用约定式提交格式
- ✅ **测试** - 提交前运行 `npm run check`

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2024 Three-Line Diary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 🙏 致谢

### 🎨 设计灵感
- **极简主义设计** - 受到 Apple 和 Google Material Design 启发
- **三句话理念** - 借鉴了日本俳句的简洁美学

### 🛠️ 技术支持
- [React](https://reactjs.org/) - 用户界面构建
- [Vite](https://vitejs.dev/) - 快速构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 原子化CSS框架
- [Google Gemini](https://ai.google.dev/) - AI智能分析
- [Lucide](https://lucide.dev/) - 精美图标库

### 👥 贡献者
感谢所有为这个项目做出贡献的开发者和用户！

## 📞 联系我们

- 📧 **邮箱**: weichenleeeee@outlook.com
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/Weichenleeeee123/Three-Line-Diary/issues)
- 💬 **讨论交流**: [GitHub Discussions](https://github.com/Weichenleeeee123/Three-Line-Diary/discussions)

---

<div align="center">
  
  ### 🌟 如果这个项目对你有帮助，请给我们一个Star！⭐
  
  **开始你的三句话日记之旅吧！** ✍️📖✨
  
  *让每一天都值得记录，让每一句话都充满意义*
  
</div>
