// 模拟数据生成工具
import useJournalStore from '@/hooks/useJournalStore';
import useI18n from '@/hooks/useI18n';

// 中文模拟数据
const mockSentencesZh = [
  // 工作相关
  ['今天完成了项目的重要功能开发', '感觉很有成就感，团队合作很愉快', '学会了新的技术栈，收获满满'],
  ['参加了部门会议，讨论了新的方案', '虽然有些压力，但充满挑战的感觉很棒', '明白了沟通的重要性'],
  ['解决了一个困扰很久的bug', '终于找到问题根源，心情大好', '学到了调试的新方法'],
  ['今天的工作效率特别高', '完成了很多待办事项', '感觉自己越来越专业了'],
  ['和同事一起头脑风暴新想法', '大家的创意都很棒', '团队协作的力量真的很强大'],
  
  // 生活相关
  ['和朋友一起去了新开的咖啡店', '环境很温馨，咖啡也很香醇', '友谊让生活更加美好'],
  ['在家做了一顿丰盛的晚餐', '享受烹饪的过程，很有治愈感', '发现自己的厨艺又进步了'],
  ['晚上看了一部很棒的电影', '被剧情深深感动，思考了很多', '艺术真的能触动人心'],
  ['今天整理了房间', '看着干净整洁的空间心情很好', '生活需要仪式感'],
  ['和家人一起吃了顿温馨的晚餐', '聊了很多有趣的话题', '家的温暖无可替代'],
  
  // 学习成长
  ['读完了一本很有启发的书', '书中的观点让我重新思考人生', '知识真的是最好的投资'],
  ['尝试了新的运动项目', '虽然有点累，但感觉很充实', '运动让身心都更健康'],
  ['学习了一门新的技能', '过程虽然困难，但很有趣', '每天进步一点点就很棒'],
  ['参加了一个有趣的线上课程', '学到了很多实用的知识', '终身学习真的很重要'],
  ['练习了新学的乐器', '虽然还不熟练但很享受过程', '音乐能带来内心的平静'],
  
  // 情感感悟
  ['今天天气特别好，心情也很棒', '阳光洒在脸上的感觉真温暖', '简单的快乐最珍贵'],
  ['和家人视频通话了很久', '虽然不在身边，但爱从未缺席', '家人的关怀是最大的动力'],
  ['在公园里散步，看到了美丽的夕阳', '大自然的美景让人心旷神怡', '要学会欣赏生活中的美好'],
  ['今天遇到了一些小挫折', '但最终都顺利解决了', '困难让我变得更加坚强'],
  ['收到了朋友的暖心消息', '被这份真诚的友谊深深感动', '有朋友真好'],
];

// 英文模拟数据
const mockSentencesEn = [
  // Work related
  ['Completed an important project feature today', 'Feeling accomplished and enjoyed great teamwork', 'Learned new tech stack, very rewarding'],
  ['Attended department meeting to discuss new proposals', 'Though stressful, the challenge feels exciting', 'Understood the importance of communication'],
  ['Fixed a bug that had been bothering me for ages', 'Finally found the root cause, feeling great', 'Learned new debugging techniques'],
  ['Had exceptionally high productivity today', 'Completed many pending tasks', 'Feeling more professional than ever'],
  ['Brainstormed new ideas with colleagues', 'Everyone had amazing creativity', 'The power of teamwork is truly strong'],
  
  // Life related
  ['Visited a new coffee shop with friends', 'Cozy atmosphere and aromatic coffee', 'Friendship makes life more beautiful'],
  ['Cooked a hearty dinner at home', 'Enjoyed the therapeutic cooking process', 'Discovered my cooking skills improved'],
  ['Watched an amazing movie tonight', 'Deeply moved by the plot, thought a lot', 'Art truly touches the heart'],
  ['Organized my room today', 'Feeling good seeing the clean and tidy space', 'Life needs a sense of ritual'],
  ['Had a warm dinner with family', 'Chatted about many interesting topics', 'The warmth of home is irreplaceable'],
  
  // Learning and growth
  ['Finished reading an inspiring book', 'The ideas made me rethink life', 'Knowledge is truly the best investment'],
  ['Tried a new sport activity', 'Though tiring, feeling very fulfilled', 'Exercise makes both body and mind healthier'],
  ['Learned a new skill', 'Though challenging, it was very interesting', 'Daily progress is wonderful'],
  ['Attended an interesting online course', 'Learned many practical knowledge', 'Lifelong learning is really important'],
  ['Practiced the new instrument I learned', 'Though not fluent yet, enjoying the process', 'Music brings inner peace'],
  
  // Emotional insights
  ['Beautiful weather today, feeling great', 'Sunshine on my face feels so warm', 'Simple happiness is most precious'],
  ['Had a long video call with family', 'Though not physically together, love never fades', 'Family care is the greatest motivation'],
  ['Walked in the park and saw beautiful sunset', 'Nature\'s beauty is refreshing', 'Must learn to appreciate life\'s beauty'],
  ['Encountered some small setbacks today', 'But eventually solved them all', 'Difficulties make me stronger'],
  ['Received a heartwarming message from friend', 'Deeply moved by this sincere friendship', 'Having friends is wonderful'],
];

// 生成过去30天的模拟数据
export function generateMockData() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const entries = [];
  
  // 获取当前语言设置
  const { language } = useI18n.getState();
  const mockSentences = language === 'en' ? mockSentencesEn : mockSentencesZh;
  
  // 生成过去30天的数据，但不是每天都有，且不包括今天
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 跳过今天的数据，确保不覆盖
    if (dateStr === todayStr) {
      continue;
    }
    
    // 75%的概率生成数据，模拟真实使用情况
    if (Math.random() > 0.25) {
      const randomSentences = mockSentences[Math.floor(Math.random() * mockSentences.length)];
      entries.push({
        id: `mock-${dateStr}`,
        date: dateStr,
        sentences: randomSentences as [string, string, string],
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
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
  
  // 合并新数据，避免重复，但保护今天的数据
  const existingEntries = storageData.state.entries || [];
  const newEntries = [...existingEntries];
  
  entries.forEach(newEntry => {
    // 再次确认不覆盖今天的数据
    if (newEntry.date === todayStr) {
      return;
    }
    
    const existingIndex = newEntries.findIndex(e => e.date === newEntry.date);
    if (existingIndex >= 0) {
      // 只有当现有记录不是今天的记录时才覆盖
      if (newEntries[existingIndex].date !== todayStr) {
        newEntries[existingIndex] = newEntry;
      }
    } else {
      newEntries.push(newEntry);
    }
  });
  
  storageData.state.entries = newEntries;
  localStorage.setItem('journal-storage', JSON.stringify(storageData));
  
  const { t } = useI18n.getState();
  console.log(t.profile.mockDataGenerated, entries.length, language === 'en' ? 'records' : '条记录');
}

// 清空所有数据
export function clearAllData() {
  const { t } = useI18n.getState();
  
  // 确认对话框
  if (window.confirm(t.profile.clearDataWarning)) {
    localStorage.removeItem('journal-storage');
    console.log(t.profile.dataClearedSuccess);
    window.location.reload();
  }
}