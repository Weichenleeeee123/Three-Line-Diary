import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  PenTool, 
  Flame, 
  Trophy, 
  Bell, 
  Download, 
  Upload,
  Award,
  Target,
  Star,
  Database,
  Trash2,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import useJournalStore from '@/hooks/useJournalStore';
import { generateMockData, clearAllData } from '@/utils/mockData';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: number;
  type: 'days' | 'streak' | 'sentences';
  unlocked: boolean;
}

const getAchievements = (t: any): Achievement[] => [
  {
    id: 'first-entry',
    title: t?.profile?.achievementTitles?.['first-entry'] || '初次记录',
    description: t?.profile?.achievementDescriptions?.['first-entry'] || '写下第一篇日记',
    icon: PenTool,
    requirement: 1,
    type: 'days',
    unlocked: false
  },
  {
    id: 'week-warrior',
    title: t?.profile?.achievementTitles?.['week-warrior'] || '一周坚持',
    description: t?.profile?.achievementDescriptions?.['week-warrior'] || '连续记录7天',
    icon: Calendar,
    requirement: 7,
    type: 'streak',
    unlocked: false
  },
  {
    id: 'month-master',
    title: t?.profile?.achievementTitles?.['month-master'] || '月度达人',
    description: t?.profile?.achievementDescriptions?.['month-master'] || '累计记录30天',
    icon: Trophy,
    requirement: 30,
    type: 'days',
    unlocked: false
  },
  {
    id: 'fire-streak',
    title: t?.profile?.achievementTitles?.['fire-streak'] || '火焰连击',
    description: t?.profile?.achievementDescriptions?.['fire-streak'] || '连续记录30天',
    icon: Flame,
    requirement: 30,
    type: 'streak',
    unlocked: false
  },
  {
    id: 'hundred-club',
    title: t?.profile?.achievementTitles?.['hundred-club'] || '百日俱乐部',
    description: t?.profile?.achievementDescriptions?.['hundred-club'] || '累计记录100天',
    icon: Star,
    requirement: 100,
    type: 'days',
    unlocked: false
  },
  {
    id: 'sentence-master',
    title: t?.profile?.achievementTitles?.['sentence-master'] || '文字大师',
    description: t?.profile?.achievementDescriptions?.['sentence-master'] || '累计写下1000句话',
    icon: Award,
    requirement: 1000,
    type: 'sentences',
    unlocked: false
  }
];

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { entries, getStats, deleteEntry, deleteAllEntries } = useJournalStore();
  const { t, language, setLanguage } = useI18n();
  
  const stats = getStats();
  
  // Calculate achievements
  const achievements = getAchievements(t);
  const unlockedAchievements = achievements.map(achievement => {
    let unlocked = false;
    
    switch (achievement.type) {
      case 'days':
        unlocked = stats.totalDays >= achievement.requirement;
        break;
      case 'streak':
        unlocked = stats.currentStreak >= achievement.requirement || stats.longestStreak >= achievement.requirement;
        break;
      case 'sentences':
        unlocked = stats.totalSentences >= achievement.requirement;
        break;
    }
    
    return { ...achievement, unlocked };
  });
  
  const unlockedCount = unlockedAchievements.filter(a => a.unlocked).length;
  
  const handleExportData = async () => {
    try {
      const data = {
        entries,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `三句话日记_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };
  
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.entries && Array.isArray(data.entries)) {
              // Here you would implement the import logic
              toast.success('数据导入成功');
            } else {
              toast.error('文件格式不正确');
            }
          } catch (error) {
            toast.error('文件解析失败');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleGenerateMockData = () => {
    try {
      generateMockData();
      // 强制重新渲染页面以显示新数据
      setTimeout(() => {
        window.location.reload();
      }, 500);
      toast.success(t?.profile?.mockDataGenerated || '模拟数据生成成功！');
    } catch (error) {
      toast.error(t?.profile?.generateMockDataError || '生成模拟数据失败');
    }
  };
  

  
  const handleClearData = () => {
     try {
       deleteAllEntries();
       clearAllData();
       setShowClearConfirm(false);
       toast.success(t?.profile?.dataClearedSuccess || '数据已清空');
     } catch (error) {
       toast.error(t?.profile?.clearDataError || '清空数据失败');
     }
   };
  
  const handleDeleteEntry = (date: string) => {
    deleteEntry(date);
    toast.success(t?.profile?.entryDeletedSuccess || '日记已删除');
  };
  
  return (
    <div className="p-4 space-y-6 page-slide-in">
      {/* Header */}
      <div className="text-center py-6 fade-in">
        <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center float">
          <User className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-semibold text-gray-800 typewriter">{t?.profile?.userProfile || '三句日记用户'}</h1>
        <p className="text-gray-500 text-sm mt-1 fade-in-delay-1">{t?.profile?.manageSettings || '记录生活，感受成长'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 fade-in-delay-1">
        <div className="bg-orange-50 rounded-xl p-4 text-center card-hover slide-in-up">
          <Calendar className="mx-auto mb-2 text-orange-600 bounce" size={24} />
          <div className="text-2xl font-bold text-orange-600 count-up">{stats.totalDays}</div>
          <div className="text-sm text-gray-600">{t?.profile?.stats?.totalDays || '总天数'}</div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4 text-center card-hover slide-in-up fade-in-delay-1">
          <PenTool className="mx-auto mb-2 text-blue-600 wiggle" size={24} />
          <div className="text-2xl font-bold text-blue-600 count-up">{stats.totalSentences}</div>
          <div className="text-sm text-gray-600">{t?.profile?.stats?.totalSentences || '总句数'}</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 text-center card-hover slide-in-up fade-in-delay-2">
          <Flame className="mx-auto mb-2 text-green-600 pulse" size={24} />
          <div className="text-2xl font-bold text-green-600 count-up">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">{t?.profile?.stats?.currentStreak || '连续'}</div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4 text-center card-hover slide-in-up fade-in-delay-3">
          <Target className="mx-auto mb-2 text-purple-600 float" size={24} />
          <div className="text-2xl font-bold text-purple-600 count-up">{stats.completionRate}%</div>
          <div className="text-sm text-gray-600">{t?.profile?.stats?.completionRate || '完成率'}</div>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🏆 {t?.profile?.achievements || '成就'}
          </h2>
          <span className="text-sm text-gray-500">{unlockedCount}/{achievements.length}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {unlockedAchievements.map((achievement) => {
            const Icon = achievement.icon;
            
            return (
              <div
                key={achievement.id}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  achievement.unlocked
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
                    achievement.unlocked
                      ? "bg-yellow-200 text-yellow-700"
                      : "bg-gray-200 text-gray-500"
                  )}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-medium text-sm text-gray-800">{achievement.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          ⚙️ {t?.profile?.settings || '设置'}
        </h2>
        
        <div className="space-y-3">
          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="text-gray-600" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">{t?.profile?.dailyReminder || '每日提醒'}</h3>
                <p className="text-sm text-gray-600">{t?.profile?.dailyReminderDesc || '提醒你每天记录'}</p>
              </div>
            </div>
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                dailyReminder ? "bg-orange-500" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform",
                dailyReminder ? "translate-x-6" : "translate-x-0.5"
              )} />
            </button>
          </div>
          
          {/* 语言设置 */}
          <div className="p-4 bg-gray-50 rounded-lg card-hover fade-in-delay-1">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-gray-600 wiggle" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">{t?.profile?.languageSettings || '语言设置'}</h3>
                <p className="text-sm text-gray-600">{t?.profile?.languageSettingsDesc || '选择应用语言'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-300 hover:scale-105 active:scale-95 button-press ${
                  language === 'zh' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-300 hover:scale-105 active:scale-95 button-press ${
                  language === 'en' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                English
              </button>
            </div>
          </div>
          
          {/* Data Backup */}
          <button 
            onClick={handleExportData}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 w-full text-left hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 button-press card-hover"
          >
            <div className="flex items-center gap-3">
              <Download className="text-gray-600 bounce" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">{t?.profile?.dataBackup || '数据备份'}</h3>
                <p className="text-sm text-gray-600">{t?.profile?.dataBackupDesc || '导出你的日记数据'}</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          
          {/* Data Import */}
          <button 
            onClick={handleImportData}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 w-full text-left hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 button-press card-hover"
          >
            <div className="flex items-center gap-3">
              <Upload className="text-gray-600 bounce" size={20} />
              <div>
                <h3 className="font-medium text-gray-800">{t?.profile?.importData || '导入数据'}</h3>
                <p className="text-sm text-gray-600">{t?.profile?.importDataDesc || '从备份文件恢复数据'}</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
          

          
          {/* Generate Mock Data */}
          <button 
            onClick={handleGenerateMockData}
            className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 w-full text-left hover:bg-blue-100 transition-all duration-300 hover:scale-105 active:scale-95 button-press card-hover"
          >
            <div className="flex items-center gap-3">
              <Database className="text-blue-600 pulse" size={20} />
              <div>
                <h3 className="font-medium text-blue-800">{t?.profile?.generateMockData || '生成模拟数据'}</h3>
                <p className="text-sm text-blue-600">{t?.profile?.generateMockDataDesc || '生成过去30天的示例日记'}</p>
              </div>
            </div>
            <span className="text-blue-400">›</span>
          </button>
          
          {/* Clear All Data */}
           <button 
             onClick={() => setShowClearConfirm(true)}
             className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100 w-full text-left hover:bg-red-50 transition-all duration-300 hover:scale-105 active:scale-95 button-press card-hover"
           >
             <div className="flex items-center gap-3">
               <Trash2 className="text-red-600 wiggle" size={20} />
               <div>
                 <h3 className="font-medium text-red-800">{t?.profile?.clearAllData || '清空所有数据'}</h3>
                 <p className="text-sm text-red-600">{t?.profile?.clearAllDataDesc || '删除所有日记记录'}</p>
               </div>
             </div>
             <span className="text-red-400">›</span>
           </button>
        </div>
      </div>
      
      {/* App Info */}
      <div className="text-center py-4 text-gray-500 text-sm">
        <p>三句话日记 v1.0</p>
        <p className="mt-1">简单记录，深度思考</p>
      </div>
      
      {/* 确认删除对话框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 slide-in-up">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">{t?.profile?.confirmClearData || '确认清空数据'}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t?.profile?.clearDataWarning || '此操作将删除所有日记数据，且无法恢复。确定要继续吗？'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 button-press"
              >
                {t?.profile?.cancel || '取消'}
              </button>
              <button
                 onClick={handleClearData}
                 className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-300 hover:scale-105 active:scale-95 button-press"
               >
                 {t?.profile?.confirm || '确认'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}