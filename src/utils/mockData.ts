// 模拟数据生成工具
import useJournalStore from '@/hooks/useJournalStore';

const mockSentences = [
  // 工作相关
  ['今天完成了项目的重要功能开发', '感觉很有成就感，团队合作很愉快', '学会了新的技术栈，收获满满'],
  ['参加了部门会议，讨论了新的方案', '虽然有些压力，但充满挑战的感觉很棒', '明白了沟通的重要性'],
  ['解决了一个困扰很久的bug', '终于找到问题根源，心情大好', '学到了调试的新方法'],
  
  // 生活相关
  ['和朋友一起去了新开的咖啡店', '环境很温馨，咖啡也很香醇', '友谊让生活更加美好'],
  ['在家做了一顿丰盛的晚餐', '享受烹饪的过程，很有治愈感', '发现自己的厨艺又进步了'],
  ['晚上看了一部很棒的电影', '被剧情深深感动，思考了很多', '艺术真的能触动人心'],
  
  // 学习成长
  ['读完了一本很有启发的书', '书中的观点让我重新思考人生', '知识真的是最好的投资'],
  ['尝试了新的运动项目', '虽然有点累，但感觉很充实', '运动让身心都更健康'],
  ['学习了一门新的技能', '过程虽然困难，但很有趣', '每天进步一点点就很棒'],
  
  // 情感感悟
  ['今天天气特别好，心情也很棒', '阳光洒在脸上的感觉真温暖', '简单的快乐最珍贵'],
  ['和家人视频通话了很久', '虽然不在身边，但爱从未缺席', '家人的关怀是最大的动力'],
  ['在公园里散步，看到了美丽的夕阳', '大自然的美景让人心旷神怡', '要学会欣赏生活中的美好'],
];

// 生成过去30天的模拟数据
export function generateMockData() {
  const today = new Date();
  const entries = [];
  
  // 生成过去30天的数据，但不是每天都有
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 70%的概率生成数据，模拟真实使用情况
    if (Math.random() > 0.3) {
      const randomSentences = mockSentences[Math.floor(Math.random() * mockSentences.length)];
      entries.push({
        id: `mock-${dateStr}`,
        date: dateStr,
        sentences: randomSentences as [string, string, string],
        createdAt: date.toISOString()
      });
    }
  }
  
  // 直接写入localStorage
  const existingData = localStorage.getItem('journal-storage');
  let storageData;
  
  if (existingData) {
    try {
      storageData = JSON.parse(existingData);
    } catch {
      storageData = { state: { entries: [] }, version: 0 };
    }
  } else {
    storageData = { state: { entries: [] }, version: 0 };
  }
  
  // 合并新数据，避免重复
  const existingEntries = storageData.state.entries || [];
  const newEntries = [...existingEntries];
  
  entries.forEach(newEntry => {
    const existingIndex = newEntries.findIndex(e => e.date === newEntry.date);
    if (existingIndex >= 0) {
      newEntries[existingIndex] = newEntry;
    } else {
      newEntries.push(newEntry);
    }
  });
  
  storageData.state.entries = newEntries;
  localStorage.setItem('journal-storage', JSON.stringify(storageData));
  
  console.log('模拟数据生成完成！', entries.length, '条记录');
}

// 清空所有数据
export function clearAllData() {
  localStorage.removeItem('journal-storage');
  window.location.reload();
}