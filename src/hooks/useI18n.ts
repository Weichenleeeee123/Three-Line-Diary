import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'zh' | 'en';

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.zh;
}

const translations = {
  zh: {
    // 通用
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    
    // 首页
    home: {
      title: '今日记录',
      subtitle: '用三句话记录美好',
      todayThreeSentences: '今日三句话',
      save: '保存今日记录',
      fillAtLeastOne: '请至少填写一句话',
      updated: '日记已更新！',
      saved: '日记已保存！',
      refreshQuote: '换一句',
      placeholders: [
        '今天做了什么？',
        '今天感受如何？',
        '今天学到了什么？'
      ],
      sentenceLabel: '第{index}句',
      motivationalQuotes: [
        '今天的心情如何呢？ 😊',
        '记录生活，感受成长 🌱',
        '每一天都是新的开始 ✨',
        '用三句话记录美好 📝',
        '简单记录，深度思考 💭',
        '今天又是充满可能的一天 🌟',
        '用文字捕捉生活的美好 🎨',
        '三句话，无限可能 🚀',
        '生活需要仪式感，从记录开始 ✍️',
        '每个平凡的日子都值得被记住 📖',
        '用心感受，用笔记录 💝',
        '今天的小确幸是什么呢？ 🍀',
        '记录当下，珍藏回忆 📷',
        '三句话，一个故事 📚',
        '慢下来，感受生活的美好 🌸',
        '每一次记录都是与自己的对话 💬',
        '今天想对自己说什么？ 💭',
        '用文字温暖时光 ☀️',
        '记录是最好的陪伴 🤗',
        '今天的收获值得被记住 🎁'
      ]
    },
    
    // 日历
    calendar: {
      title: '日历',
      noEntry: '暂无记录',
      hasEntry: '已记录',
      viewEntry: '查看记录',
      noEntries: '暂无记录',
      clickToAdd: '点击日期添加记录',
      monthView: '月视图',
      weekView: '周视图',
      today: '今天',
      recorded: '已记录',
      unrecorded: '未记录',
      completionRate: '完成率',
      recentEntries: '最近记录',
      entriesCount: '条记录',
      noEntriesThisMonth: '本月还没有记录',
      clickDateToStart: '点击日期开始记录吧！',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      months: [
        '1月', '2月', '3月', '4月', '5月', '6月',
        '7月', '8月', '9月', '10月', '11月', '12月'
      ]
    },
    
    // 总结
    summary: {
      title: '本周总结',
      weeklyStats: '本周统计',
      recordedDays: '记录天数',
      totalSentences: '总句数',
      completionRate: '完成率',
      aiWeeklySummary: 'AI 周总结',
      aiMoodInsight: 'AI 情绪洞察',
      aiAnalyzing: 'AI正在为你生成专属总结...',
      analyzing: '分析中...',
      noSummaryYet: '暂无总结内容',
      noInsightYet: '正在分析你的情绪变化...',
      generateSummary: '生成总结',
      generateInsight: '生成洞察',
      regenerate: '重新生成总结',
      shareTitle: '分享总结',
      moodAnalysis: '情绪分析',
      positive: '积极',
      neutral: '平静',
      negative: '消极',
      noRecordsThisWeek: '这周还没有记录',
      startRecordingPrompt: '开始记录来查看情绪分析吧！',
      weeklyRecords: '本周记录',
      sentences: '句话',
      summaryGenerationFailed: 'AI总结生成失败，请稍后重试',
      copiedToClipboard: '总结已复制到剪贴板',
      shareFailed: '分享失败'
    },
    
    // 个人资料
    profile: {
      userProfile: '用户档案',
      manageSettings: '管理您的日记设置和数据',
      stats: {
        totalEntries: '总日记数',
        currentStreak: '连续天数',
        longestStreak: '最长连续',
        totalDays: '总天数',
        totalSentences: '总句数',
        completionRate: '完成率',
      },
      achievements: '成就',
      achievementTitles: {
        'first-entry': '初次记录',
        'week-warrior': '一周坚持',
        'month-master': '月度达人',
        'fire-streak': '火焰连击',
        'hundred-club': '百日俱乐部',
        'sentence-master': '文字大师'
      },
      achievementModal: {
        unlocked: '🎉 成就解锁！',
        awesome: '太棒了！'
      },
      celebrationModal: {
        awesome: '太棒了！',
        saved: '今日记录已保存',
        firstTimeMessage: '🎉 恭喜你开始了记录之旅！坚持下去，你会发现生活中更多美好的瞬间。',
        continueRecording: '继续记录'
      },
      achievementDescriptions: {
        'first-entry': '写下第一篇日记',
        'week-warrior': '连续记录7天',
        'month-master': '累计记录30天',
        'fire-streak': '连续记录30天',
        'hundred-club': '累计记录100天',
        'sentence-master': '累计写下1000句话'
      },
      settings: '设置',
      dailyReminder: '每日提醒',
      dailyReminderDesc: '提醒你每天记录',
      languageSettings: '语言设置',
      languageSettingsDesc: '选择应用语言',
      dataBackup: '数据备份',
      dataBackupDesc: '导出你的日记数据',
      importData: '导入数据',
      importDataDesc: '从备份文件恢复数据',
      generateMockData: '生成模拟数据',
      generateMockDataDesc: '生成过去30天的示例日记',
      clearAllData: '清空所有数据',
      clearAllDataDesc: '删除所有日记记录',
      appInfo: '应用信息',
      version: '版本',
      developer: '开发者',
      teamName: '三句日记团队',
      updateTime: '更新时间',
      confirmClearData: '确认清空数据',
      clearDataWarning: '此操作将删除所有日记数据，且无法恢复。确定要继续吗？',
      dataClearedSuccess: '数据已清空',
      entryDeletedSuccess: '日记已删除',
      mockDataGenerated: '模拟数据已生成',
      generateMockDataError: '生成模拟数据失败',
      clearDataError: '清空数据失败',
      mockData: {
        entry1: {
          sentence1: '今天天气很好',
          sentence2: '和朋友一起吃了午饭',
          sentence3: '晚上看了一部电影'
        },
        entry2: {
          sentence1: '工作很忙碌',
          sentence2: '学习了新的技能',
          sentence3: '感觉很充实'
        },
        entry3: {
          sentence1: '去了公园散步',
          sentence2: '读了一本好书',
          sentence3: '心情很愉快'
        }
      }
    },
    
    // 导航
    navigation: {
      home: '首页',
      calendar: '日历',
      summary: '总结',
      profile: '我的',
    },
    
    // Toast 消息
    toast: {
      saved: '保存成功',
      deleted: '删除成功',
      error: '操作失败',
    }
  },
  
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    
    // Home
    home: {
      title: "Today's Record",
      subtitle: 'Record beauty with three sentences',
      todayThreeSentences: "Today's Three Sentences",
      save: "Save Today's Record",
      fillAtLeastOne: 'Please fill in at least one sentence',
      updated: 'Diary updated!',
      saved: 'Diary saved!',
      refreshQuote: 'Refresh quote',
      placeholders: [
        'What did you do today?',
        'How did you feel today?',
        'What did you learn today?'
      ],
      sentenceLabel: 'Sentence {index}',
      motivationalQuotes: [
        'How are you feeling today? 😊',
        'Record life, feel growth 🌱',
        'Every day is a new beginning ✨',
        'Record beauty with three sentences 📝',
        'Simple recording, deep thinking 💭',
        'Today is another day full of possibilities 🌟',
        'Capture the beauty of life with words 🎨',
        'Three sentences, infinite possibilities 🚀',
        'Life needs ritual, start with recording ✍️',
        'Every ordinary day deserves to be remembered 📖',
        'Feel with heart, record with pen 💝',
        'What is today\'s little happiness? 🍀',
        'Record the present, treasure memories 📷',
        'Three sentences, one story 📚',
        'Slow down, feel the beauty of life 🌸',
        'Every record is a dialogue with yourself 💬',
        'What do you want to say to yourself today? 💭',
        'Warm time with words ☀️',
        'Recording is the best companion 🤗',
        'Today\'s harvest deserves to be remembered 🎁'
      ]
    },
    
    // Calendar
    calendar: {
      title: 'Calendar',
      noEntry: 'No entry',
      hasEntry: 'Recorded',
      viewEntry: 'View entry',
      noEntries: 'No entries',
      clickToAdd: 'Click date to add entry',
      monthView: 'Month View',
      weekView: 'Week View',
      today: 'Today',
      recorded: 'Recorded',
      unrecorded: 'Unrecorded',
      completionRate: 'Completion Rate',
      recentEntries: 'Recent Entries',
      entriesCount: 'entries',
      noEntriesThisMonth: 'No entries this month',
      clickDateToStart: 'Click a date to start recording!',
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]
    },
    
    // Summary
    summary: {
      title: 'Weekly Summary',
      weeklyStats: 'Weekly Stats',
      recordedDays: 'Recorded Days',
      totalSentences: 'Total Sentences',
      completionRate: 'Completion Rate',
      aiWeeklySummary: 'AI Weekly Summary',
      aiMoodInsight: 'AI Mood Insight',
      aiAnalyzing: 'AI is generating your personalized summary...',
      analyzing: 'Analyzing...',
      noSummaryYet: 'No summary content yet',
      noInsightYet: 'Analyzing your mood changes...',
      generateSummary: 'Generate Summary',
      generateInsight: 'Generate Insight',
      regenerate: 'Regenerate Summary',
      shareTitle: 'Share Summary',
      moodAnalysis: 'Mood Analysis',
      positive: 'Positive',
      neutral: 'Neutral',
      negative: 'Negative',
      noRecordsThisWeek: 'No records this week',
      startRecordingPrompt: 'Start recording to see mood analysis!',
      weeklyRecords: 'Weekly Records',
      sentences: 'sentences',
      summaryGenerationFailed: 'AI summary generation failed, please try again later',
      copiedToClipboard: 'Summary copied to clipboard',
      shareFailed: 'Share failed'
    },
    
    // Profile
    profile: {
      userProfile: 'User Profile',
      manageSettings: 'Manage your diary settings and data',
      stats: {
        totalEntries: 'Total Entries',
        currentStreak: 'Current Streak',
        longestStreak: 'Longest Streak',
        totalDays: 'Total Days',
        totalSentences: 'Total Sentences',
        completionRate: 'Completion Rate',
      },
      achievements: 'Achievements',
      achievementTitles: {
        'first-entry': 'First Entry',
        'week-warrior': 'Week Warrior',
        'month-master': 'Month Master',
        'fire-streak': 'Fire Streak',
        'hundred-club': 'Hundred Club',
        'sentence-master': 'Sentence Master'
      },
      achievementModal: {
         unlocked: '🎉 Achievement Unlocked!',
         awesome: 'Awesome!'
       },
       celebrationModal: {
         awesome: 'Awesome!',
         saved: 'Today\'s record saved',
         firstTimeMessage: '🎉 Congratulations on starting your recording journey! Keep it up and you\'ll discover more beautiful moments in life.',
         continueRecording: 'Continue Recording'
       },
      achievementDescriptions: {
        'first-entry': 'Write your first diary entry',
        'week-warrior': 'Record for 7 consecutive days',
        'month-master': 'Record for 30 total days',
        'fire-streak': 'Record for 30 consecutive days',
        'hundred-club': 'Record for 100 total days',
        'sentence-master': 'Write 1000 total sentences'
      },
      settings: 'Settings',
      dailyReminder: 'Daily Reminder',
      dailyReminderDesc: 'Remind you to record daily',
      languageSettings: 'Language Settings',
      languageSettingsDesc: 'Choose app language',
      dataBackup: 'Data Backup',
      dataBackupDesc: 'Export your diary data',
      importData: 'Import Data',
      importDataDesc: 'Restore data from backup file',
      generateMockData: 'Generate Mock Data',
      generateMockDataDesc: 'Generate sample diary for past 30 days',
      clearAllData: 'Clear All Data',
      clearAllDataDesc: 'Delete all diary records',
      appInfo: 'App Info',
      version: 'Version',
      developer: 'Developer',
      teamName: 'Three Line Diary Team',
      updateTime: 'Update Time',
      confirmClearData: 'Confirm Clear Data',
      clearDataWarning: 'This operation will delete all diary data and cannot be recovered. Are you sure to continue?',
      dataClearedSuccess: 'Data cleared successfully',
      entryDeletedSuccess: 'Entry deleted successfully',
      mockDataGenerated: 'Mock data generated successfully',
      generateMockDataError: 'Failed to generate mock data',
      clearDataError: 'Failed to clear data',
      mockData: {
        entry1: {
          sentence1: 'The weather is nice today',
          sentence2: 'Had lunch with friends',
          sentence3: 'Watched a movie in the evening'
        },
        entry2: {
          sentence1: 'Work was busy',
          sentence2: 'Learned new skills',
          sentence3: 'Feeling fulfilled'
        },
        entry3: {
          sentence1: 'Went for a walk in the park',
          sentence2: 'Read a good book',
          sentence3: 'Feeling happy'
        }
      }
    },
    
    // Navigation
    navigation: {
      home: 'Home',
      calendar: 'Calendar',
      summary: 'Summary',
      profile: 'Profile',
    },
    
    // Toast messages
    toast: {
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      error: 'Operation failed',
    }
  }
};

export const useI18n = create<I18nStore>()(persist(
  (set, get) => ({
    language: 'zh',
    setLanguage: (language: Language) => {
      set({ 
        language,
        t: translations[language]
      });
    },
    t: translations.zh,
  }),
  {
    name: 'i18n-storage',
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => (state) => {
      if (state) {
        // 重新设置翻译对象
        state.t = translations[state.language];
      }
    },
  }
));

export default useI18n;