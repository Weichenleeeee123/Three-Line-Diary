// 情绪分析工具

export interface EmotionData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  dominant: 'positive' | 'neutral' | 'negative';
}

// 积极情绪关键词
const positiveKeywords = [
  '开心', '快乐', '高兴', '兴奋', '满足', '幸福', '愉快', '舒服', '轻松', '放松',
  '成功', '胜利', '完成', '实现', '达成', '进步', '提升', '改善', '突破', '收获',
  '感谢', '感激', '温暖', '美好', '棒', '好', '赞', '优秀', '精彩', '完美',
  '爱', '喜欢', '享受', '满意', '骄傲', '自豪', '信心', '希望', '乐观', '积极',
  'happy', 'joy', 'excited', 'satisfied', 'great', 'good', 'amazing', 'wonderful',
  'love', 'like', 'enjoy', 'proud', 'confident', 'hope', 'positive', 'success'
];

// 消极情绪关键词
const negativeKeywords = [
  '难过', '伤心', '痛苦', '失望', '沮丧', '郁闷', '烦躁', '焦虑', '担心', '害怕',
  '生气', '愤怒', '恼火', '讨厌', '厌恶', '后悔', '遗憾', '失落', '孤独', '寂寞',
  '累', '疲惫', '疲劳', '困难', '挫折', '失败', '错误', '问题', '麻烦', '压力',
  '不好', '糟糕', '差', '坏', '恶心', '讨厌', '无聊', '空虚', '迷茫', '困惑',
  'sad', 'upset', 'disappointed', 'frustrated', 'angry', 'worried', 'afraid',
  'tired', 'exhausted', 'difficult', 'problem', 'trouble', 'bad', 'terrible'
];

// 中性情绪关键词
const neutralKeywords = [
  '工作', '学习', '吃饭', '睡觉', '起床', '出门', '回家', '看书', '看电影', '听音乐',
  '运动', '散步', '购物', '做饭', '洗澡', '打扫', '整理', '计划', '安排', '准备',
  '今天', '明天', '昨天', '早上', '下午', '晚上', '时间', '地点', '人', '事情',
  'work', 'study', 'eat', 'sleep', 'home', 'book', 'movie', 'music', 'exercise',
  'today', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'time'
];

/**
 * 分析文本的情绪倾向
 * @param text 要分析的文本
 * @returns 情绪分数对象
 */
export function analyzeEmotion(text: string): { positive: number; neutral: number; negative: number } {
  if (!text || text.trim().length === 0) {
    return { positive: 0, neutral: 1, negative: 0 };
  }

  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;

  // 计算积极情绪分数
  positiveKeywords.forEach(keyword => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    positiveScore += matches;
  });

  // 计算消极情绪分数
  negativeKeywords.forEach(keyword => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    negativeScore += matches;
  });

  // 计算中性情绪分数
  neutralKeywords.forEach(keyword => {
    const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
    neutralScore += matches;
  });

  // 如果没有匹配到任何关键词，默认为中性
  if (positiveScore === 0 && negativeScore === 0 && neutralScore === 0) {
    neutralScore = 1;
  }

  const total = positiveScore + negativeScore + neutralScore;
  
  return {
    positive: total > 0 ? positiveScore / total : 0,
    neutral: total > 0 ? neutralScore / total : 1,
    negative: total > 0 ? negativeScore / total : 0
  };
}

/**
 * 获取主导情绪
 * @param emotion 情绪分数对象
 * @returns 主导情绪类型
 */
export function getDominantEmotion(emotion: { positive: number; neutral: number; negative: number }): 'positive' | 'neutral' | 'negative' {
  if (emotion.positive > emotion.neutral && emotion.positive > emotion.negative) {
    return 'positive';
  } else if (emotion.negative > emotion.neutral && emotion.negative > emotion.positive) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

/**
 * 分析日记条目的情绪
 * @param entry 日记条目
 * @returns 情绪数据
 */
export function analyzeEntryEmotion(entry: any): EmotionData {
  const fullText = `${entry.sentence1 || ''} ${entry.sentence2 || ''} ${entry.sentence3 || ''}`;
  const emotion = analyzeEmotion(fullText);
  const dominant = getDominantEmotion(emotion);

  return {
    date: entry.date,
    positive: Math.round(emotion.positive * 100) / 100,
    neutral: Math.round(emotion.neutral * 100) / 100,
    negative: Math.round(emotion.negative * 100) / 100,
    dominant
  };
}

/**
 * 获取情绪趋势数据
 * @param entries 日记条目数组
 * @param days 分析的天数（默认30天）
 * @returns 情绪趋势数据数组
 */
export function getEmotionTrend(entries: any[], days: number = 30): EmotionData[] {
  // 获取最近的日记条目
  const sortedEntries = entries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days);

  // 分析每个条目的情绪
  const emotionData = sortedEntries.map(entry => analyzeEntryEmotion(entry));

  // 按日期正序排列（用于图表显示）
  return emotionData.reverse();
}

/**
 * 获取情绪统计数据
 * @param emotionData 情绪数据数组
 * @returns 情绪统计
 */
export function getEmotionStats(emotionData: EmotionData[]) {
  if (emotionData.length === 0) {
    return {
      averagePositive: 0,
      averageNeutral: 1,
      averageNegative: 0,
      dominantCount: { positive: 0, neutral: 1, negative: 0 },
      trend: 'stable' as 'improving' | 'declining' | 'stable'
    };
  }

  const totalPositive = emotionData.reduce((sum, data) => sum + data.positive, 0);
  const totalNeutral = emotionData.reduce((sum, data) => sum + data.neutral, 0);
  const totalNegative = emotionData.reduce((sum, data) => sum + data.negative, 0);

  const dominantCount = emotionData.reduce(
    (count, data) => {
      count[data.dominant]++;
      return count;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  // 计算趋势（比较前半段和后半段的积极情绪比例）
  const midPoint = Math.floor(emotionData.length / 2);
  const firstHalf = emotionData.slice(0, midPoint);
  const secondHalf = emotionData.slice(midPoint);

  const firstHalfPositive = firstHalf.reduce((sum, data) => sum + data.positive, 0) / firstHalf.length;
  const secondHalfPositive = secondHalf.reduce((sum, data) => sum + data.positive, 0) / secondHalf.length;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (secondHalfPositive > firstHalfPositive + 0.1) {
    trend = 'improving';
  } else if (secondHalfPositive < firstHalfPositive - 0.1) {
    trend = 'declining';
  }

  return {
    averagePositive: Math.round((totalPositive / emotionData.length) * 100) / 100,
    averageNeutral: Math.round((totalNeutral / emotionData.length) * 100) / 100,
    averageNegative: Math.round((totalNegative / emotionData.length) * 100) / 100,
    dominantCount,
    trend
  };
}