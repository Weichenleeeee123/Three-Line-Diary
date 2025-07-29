<div align="center">
  <img src="./public/app-icon.svg" alt="Three-Line Diary" width="120" height="120">
  
  # Three-Line Diary
  
  **An elegant and minimalist diary app that lets you capture each day's beautiful moments with just three sentences** ✨
  
  [![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
  [🌐 Live Demo](https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/) | [📖 User Guide](#user-guide) | [🚀 Quick Start](#quick-start)
</div>

---

## 💡 Project Philosophy

In our fast-paced lives, we often forget to record life's beautiful moments. **Three-Line Diary** advocates capturing each day in the simplest way:
- 🌅 **First sentence**: What happened today?
- 💭 **Second sentence**: How did I feel?
- 🌟 **Third sentence**: What did I learn?

Just three simple sentences, yet they capture a complete day's essence!

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 Core Features
- 🖊️ **Three-sentence recording** - Capture daily insights with concise three-sentence entries
- 🎤 **Voice recognition** - Tencent Cloud ASR real-time speech-to-text, support voice input for diary content
- 📷 **Photo diary** - Support taking photos or selecting images to record visual memories
- 🌤️ **Weather recording** - Automatically fetch and display daily weather conditions, adding contextual information to diary entries
- 📅 **Calendar view** - Intuitively browse historical records, click dates for details
- 👆 **Swipe gestures** - Summary page supports smooth left-right swipe to switch weekly summaries, keyboard arrow key support
- 📱 **PWA support** - Install to desktop, offline usage, native app experience
- 🤖 **AI smart summary** - Gemini AI generates weekly reports and mood insights
- 📤 **Share functionality** - Optimized image sharing preview interface, support saving and social sharing
- 📊 **Data management** - Support editing, deleting, and exporting diary entries
- 🔍 **Search functionality** - Quickly find historical records
- 📈 **Statistics analysis** - Track recording days, word count, and other metrics
- 📊 **Emotion trend analysis** - Intelligently analyze diary emotion changes, visualize 7-day/30-day emotion trend charts

</td>
<td width="50%">

### 🌍 User Experience
- 🌐 **Multi-language support** - Complete Chinese/English interface switching
- 📱 **Responsive design** - Perfect adaptation for mobile and desktop devices
- 🎨 **Modern UI** - Clean and beautiful interface design
- 🎤 **Smart voice** - Real-time voice recognition, audio visualization feedback, smooth voice input experience
- 🖼️ **Image preview optimization** - Carefully adjusted button layout and spacing, perfect mobile experience
- 💾 **Local storage** - Secure data storage locally
- 🔊 **Sound feedback** - Elegant interaction sound effects
- ⚡ **Smooth animations** - Silky typewriter effects and swipe gesture interactions
- 🎯 **Gesture interaction** - Support touch swipe and keyboard navigation for multiple interaction methods
- 📲 **PWA experience** - Support desktop installation, offline caching, push notifications, native app-like experience

</td>
</tr>
</table>

### 🏆 Achievement System
- 🏅 **Writing milestones** - Consecutive recording rewards (7 days, 30 days, 100 days...)
- 📏 **Content quality** - Word count and quality achievements
- 🔥 **Usage frequency** - Activity rewards
- 🎉 **Special holidays** - Holiday-themed achievements
- 🌟 **Personal growth** - Sense of achievement from recording life's moments

## 🚀 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icon Library**: Lucide React
- **AI Service**: Google Gemini API
- **Voice Recognition**: Tencent Cloud ASR
- **PWA**: Service Worker + Web App Manifest
- **Deployment**: Tencent Cloud Development

## 🚀 Quick Start

### 📋 Requirements
- **Node.js** >= 16.0.0
- **Package Manager** npm or pnpm
- **Browser** Chrome, Firefox, Safari, Edge (modern browsers)

### ⚡ One-click Setup

```bash
# 1️⃣ Clone the project
git clone https://github.com/Weichenleeeee123/Three-Line-Diary.git
cd Three-Line-Diary

# 2️⃣ Install dependencies
npm install
# or use pnpm (recommended, faster)
pnpm install

# 3️⃣ Configure environment variables (optional)
cp .env.example .env
# Edit .env file, add your Gemini API key

# 4️⃣ Start development server
npm run dev
# or
pnpm dev

# 🎉 Open browser and visit http://localhost:5173
```

### 🏗️ Build & Deploy

```bash
# Build production version
npm run build

# Preview build locally
npm run preview

# Code quality check
npm run check
```

## 📖 User Guide

### 🖊️ Start Writing
1. **Open the app** - Visit homepage, daily inspirational quotes spark creativity
2. **Write three sentences** - Follow prompts to write today's three sentences
3. **Save record** - Click save to record your diary entry

### 📅 View History
- **Calendar view** - Click calendar icon in bottom navigation
- **View details** - Click dates with records to see daily content
- **Edit entries** - Long press or click edit button to modify content

### 🤖 AI Smart Summary
- **Weekly reports** - Automatically analyze your records weekly, generate deep summaries
- **Mood insights** - AI analyzes emotional changes, provides personalized suggestions
- **Configure API** - Set up Gemini API key in profile to enable AI features

### 📲 PWA Installation & Usage
- **Mobile installation** - Browser will automatically show "Install to desktop" prompt, click to install
- **Desktop installation** - Chrome/Edge address bar will show install icon, click to install as desktop app
- **Offline usage** - Works normally even when offline after installation, data automatically cached
- **Native experience** - Full-screen display, fast startup, indistinguishable from native apps
- **Shortcuts** - Support "Write Diary" and "View Summary" shortcuts for direct access to specific features

### 🏆 Unlock Achievements
- **Consistent recording** - Unlock milestone achievements through consecutive recording
- **Rich content** - Write more words to unlock content achievements
- **Explore features** - Use various functions to unlock special achievements

## 🌐 Live Demo

🔗 **Online Demo**: [https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/](https://threelinediary-2gs9l8373211c571-1253474999.tcloudbaseapp.com/)

> 💡 **Tip**: Recommended to access via mobile browser for the best mobile experience

## 📱 Feature Screenshots

### Homepage - Three-sentence Input
Clean input interface with daily inspirational quotes to spark creativity.

### Calendar View
Intuitive calendar interface for easy browsing of historical records.

### AI Smart Summary
- **Weekly Reports**: Automatically analyze weekly records, generate deep summaries
- **Mood Insights**: AI analyzes emotional changes, provides personalized suggestions

### Profile Center
- Achievement showcase
- Statistics data
- Language settings
- Data management
- Emotion trend analysis charts

## 🔧 Configuration

### 🤖 AI Feature Setup

To use AI smart summary features, you need to configure a Gemini API key:

#### 1️⃣ Get API Key
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Log in with your Google account
- Create a new API key
- Copy the generated key

#### 2️⃣ Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env file
# Replace your_gemini_api_key_here with your actual API key
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

#### 3️⃣ Restart Development Server
```bash
# Restart server to apply environment variables
npm run dev
```

> ⚠️ **Security Reminder**:
> - Do not commit `.env` file to Git repository
> - API key is sensitive information, keep it secure
> - Configure environment variables on server for production

## 📂 Project Structure

```
src/
├── components/          # Reusable components
│   ├── BottomNavigation.tsx
│   ├── JournalModal.tsx
│   └── Layout.tsx
├── hooks/              # Custom Hooks
│   ├── useI18n.ts      # Internationalization
│   └── useJournalStore.ts  # Data management
├── pages/              # Page components
│   ├── Home.tsx        # Homepage
│   ├── Calendar.tsx    # Calendar
│   ├── Summary.tsx     # Summary
│   └── Profile.tsx     # Profile
├── services/           # API services
│   └── geminiApi.ts    # AI service
└── utils/              # Utility functions
    └── mockData.ts     # Mock data
```

## 🌟 Project Highlights

### 🎯 Design Philosophy
- **Minimalism** - Three-sentence recording, remove redundancy, focus on core
- **User Experience** - Smooth animations, elegant interactions, attention to detail
- **Advanced Technology** - Modern tech stack, type safety, performance optimization
- **Data Security** - Local storage, privacy protection, secure and reliable

### 🔥 Technical Features
- **🚀 Performance Optimization** - Vite build, fast hot reload, second-level startup
- **📱 Responsive Design** - Mobile-first, perfect adaptation to various devices
- **🎨 Modern UI** - Tailwind CSS, atomic styles, highly customizable
- **🔧 Type Safety** - Full TypeScript, compile-time error checking
- **🌐 Internationalization** - Complete i18n support, easy language switching
- **🤖 AI Integration** - Gemini API, intelligent analysis, personalized insights

## 🤝 Contributing

We welcome all forms of contributions! Whether it's bug reports, feature suggestions, or code contributions.

### 🐛 Report Issues
- Use [Issues](https://github.com/Weichenleeeee123/Three-Line-Diary/issues) to report bugs
- Provide detailed reproduction steps and environment information
- Attach screenshots or error logs (if available)

### 💡 Feature Suggestions
- Propose new features in Issues
- Describe feature requirements and use cases in detail
- Discuss implementation approaches and technical details

### 🔧 Code Contributions

#### Development Workflow
```bash
# 1. Fork the project to your GitHub
# 2. Clone your fork
git clone https://github.com/your-username/Three-Line-Diary.git

# 3. Create feature branch
git checkout -b feature/your-feature-name

# 4. Develop and test
npm run dev
npm run check

# 5. Commit changes
git add .
git commit -m "feat: add your feature description"

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create Pull Request
```

#### Development Standards
- ✅ **TypeScript** - Use TypeScript for type checking
- ✅ **ESLint** - Follow ESLint code standards
- ✅ **Component Design** - Keep components single responsibility, under 300 lines
- ✅ **Commit Convention** - Use conventional commit format
- ✅ **Testing** - Run `npm run check` before committing

## 📄 License

This project is open source under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2024 Three-Line Diary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 🙏 Acknowledgments

### 🎨 Design Inspiration
- **Minimalist Design** - Inspired by Apple and Google Material Design
- **Three-sentence Philosophy** - Borrowed from the concise aesthetics of Japanese haiku

### 🛠️ Technical Support
- [React](https://reactjs.org/) - User interface building
- [Vite](https://vitejs.dev/) - Fast build tool
- [Tailwind CSS](https://tailwindcss.com/) - Atomic CSS framework
- [Google Gemini](https://ai.google.dev/) - AI intelligent analysis
- [Lucide](https://lucide.dev/) - Beautiful icon library

### 👥 Contributors
Thanks to all developers and users who contributed to this project!

## 📞 Contact Us

- 📧 **Email**: weichenleeeee@outlook.com
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/Weichenleeeee123/Three-Line-Diary/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Weichenleeeee123/Three-Line-Diary/discussions)

---

<div align="center">
  
  ### 🌟 If this project helps you, please give us a Star! ⭐
  
  **Start your three-sentence diary journey!** ✍️📖✨
  
  *Make every day worth recording, make every sentence meaningful*
  
</div>