import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Smile, Meh, Frown } from 'lucide-react';
import { EmotionData, getEmotionStats, analyzeEntryEmotion } from '@/utils/emotionAnalysis';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import useJournalStore from '@/hooks/useJournalStore';

interface EmotionTrendChartProps {
  className?: string;
}

const EMOTION_COLORS = {
  positive: '#10b981', // green-500
  neutral: '#6b7280',  // gray-500
  negative: '#ef4444'  // red-500
};

const PIE_COLORS = ['#10b981', '#6b7280', '#ef4444'];

export default function EmotionTrendChart({ className }: EmotionTrendChartProps) {
  const { t } = useI18n();
  const { entries } = useJournalStore();
  
  // 将日记条目转换为情绪数据
  const emotionData: EmotionData[] = entries.map(entry => {
    const combinedText = `${entry.sentences[0]} ${entry.sentences[1]} ${entry.sentences[2]}`.trim();
    const emotion = analyzeEntryEmotion({
      sentence1: entry.sentences[0],
      sentence2: entry.sentences[1], 
      sentence3: entry.sentences[2]
    });
    return {
      date: entry.date,
      positive: emotion.positive,
      neutral: emotion.neutral,
      negative: emotion.negative,
      dominant: emotion.dominant
    };
  });
  
  const stats = getEmotionStats(emotionData);

  // 准备折线图数据
  const lineData = emotionData.map((data, index) => ({
    day: index + 1,
    positive: data.positive * 100,
    neutral: data.neutral * 100,
    negative: data.negative * 100
  }));

  // 准备饼图数据
  const pieChartData = [
    {
      name: t?.emotionChart?.positive || '积极',
      value: stats.dominantCount.positive,
      color: EMOTION_COLORS.positive
    },
    {
      name: t?.emotionChart?.neutral || '平静',
      value: stats.dominantCount.neutral,
      color: EMOTION_COLORS.neutral
    },
    {
      name: t?.emotionChart?.negative || '消极',
      value: stats.dominantCount.negative,
      color: EMOTION_COLORS.negative
    }
  ].filter(item => item.value > 0);

  // 准备柱状图数据
  const averageData = [
    {
      name: t?.emotionChart?.positive || '积极',
      value: Math.round(stats.averagePositive * 100),
      color: EMOTION_COLORS.positive
    },
    {
      name: t?.emotionChart?.neutral || '平静',
      value: Math.round(stats.averageNeutral * 100),
      color: EMOTION_COLORS.neutral
    },
    {
      name: t?.emotionChart?.negative || '消极',
      value: Math.round(stats.averageNegative * 100),
      color: EMOTION_COLORS.negative
    }
  ];

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'improving':
        return <TrendingUp className="text-green-500" size={20} />;
      case 'declining':
        return <TrendingDown className="text-red-500" size={20} />;
      default:
        return <Minus className="text-gray-500" size={20} />;
    }
  };

  const getTrendText = () => {
    switch (stats.trend) {
      case 'improving':
        return t?.emotionChart?.trendImproving || '情绪趋势向好';
      case 'declining':
        return t?.emotionChart?.trendDeclining || '情绪有所下降';
      default:
        return t?.emotionChart?.trendStable || '情绪保持稳定';
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (emotionData.length === 0) {
    return (
      <div className={cn("bg-white rounded-xl p-6 border border-gray-100", className)}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📊 {t?.emotionChart?.title || '情绪趋势分析'}
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Meh size={48} className="mx-auto mb-4 opacity-50" />
          <p>{t?.emotionChart?.noData || '暂无数据，开始写日记来分析你的情绪趋势吧！'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl p-6 border border-gray-100 space-y-6", className)}>
      {/* 标题和趋势指示器 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          📊 {t?.emotionChart?.title || '情绪趋势分析'}
        </h3>
        <div className={cn("flex items-center gap-2 text-sm font-medium", getTrendColor())}>
          {getTrendIcon()}
          <span>{getTrendText()}</span>
        </div>
      </div>

      {/* 情绪统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <Smile className="mx-auto mb-2 text-green-600" size={24} />
          <div className="text-2xl font-bold text-green-600">
            {Math.round(stats.averagePositive * 100)}%
          </div>
          <div className="text-sm text-green-700">{t?.emotionChart?.positive || '积极'}</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
          <Meh className="mx-auto mb-2 text-gray-600" size={24} />
          <div className="text-2xl font-bold text-gray-600">
            {Math.round(stats.averageNeutral * 100)}%
          </div>
          <div className="text-sm text-gray-700">{t?.emotionChart?.neutral || '平静'}</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
          <Frown className="mx-auto mb-2 text-red-600" size={24} />
          <div className="text-2xl font-bold text-red-600">
            {Math.round(stats.averageNegative * 100)}%
          </div>
          <div className="text-sm text-red-700">{t?.emotionChart?.negative || '消极'}</div>
        </div>
      </div>

      {/* 折线图 - 情绪变化趋势 */}
      {lineData.length > 1 && (
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">
            {t?.emotionChart?.trendChart || '情绪变化趋势'}
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: string) => [
                    `${value}%`,
                    name === 'positive' ? (t?.emotionChart?.positive || '积极') :
                    name === 'neutral' ? (t?.emotionChart?.neutral || '平静') :
                    (t?.emotionChart?.negative || '消极')
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="positive" 
                  stroke={EMOTION_COLORS.positive}
                  strokeWidth={2}
                  dot={{ fill: EMOTION_COLORS.positive, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: EMOTION_COLORS.positive, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke={EMOTION_COLORS.neutral}
                  strokeWidth={2}
                  dot={{ fill: EMOTION_COLORS.neutral, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: EMOTION_COLORS.neutral, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="negative" 
                  stroke={EMOTION_COLORS.negative}
                  strokeWidth={2}
                  dot={{ fill: EMOTION_COLORS.negative, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: EMOTION_COLORS.negative, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 底部图表区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 饼图 - 情绪分布 */}
        {pieChartData.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              {t?.emotionChart?.distributionChart || '情绪分布'}
            </h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: string) => [
                      `${value} ${t?.emotionChart?.days || '天'}`,
                      name === '积极' ? (t?.emotionChart?.positive || '积极') :
                      name === '平静' ? (t?.emotionChart?.neutral || '平静') :
                      (t?.emotionChart?.negative || '消极')
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 柱状图 - 平均情绪 */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">
            {t?.emotionChart?.averageChart || '平均情绪'}
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={averageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value}%`, '']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                >
                  {averageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}