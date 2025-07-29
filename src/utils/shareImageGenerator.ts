import html2canvas from 'html2canvas';

interface ShareImageData {
  weekRange: string;
  aiSummary: string;
  moodInsight: string;
  weekEntries: any[];
  moodAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export const generateShareImage = async (data: ShareImageData): Promise<string> => {
  // 创建一个临时的DOM元素来渲染分享图片
  const shareContainer = document.createElement('div');
  shareContainer.style.position = 'fixed';
  shareContainer.style.top = '-9999px';
  shareContainer.style.left = '-9999px';
  shareContainer.style.width = '240px';
  shareContainer.style.padding = '12px';
  shareContainer.style.backgroundColor = '#ffffff';
  shareContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  shareContainer.style.borderRadius = '16px';
  shareContainer.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
  
  // 构建分享图片的HTML内容
  shareContainer.innerHTML = `
    <div style="text-align: center; margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 6px;">
        <img src="/favicon.svg" style="width: 24px; height: 24px; border-radius: 4px; margin-top: 10.5px;" alt="logo" />
        <div style="text-align: left;">
          <h1 style="margin: 0; font-size: 12px; font-weight: 700; color: #1f2937; line-height: 1.1;">三句话日记</h1>
          <p style="margin: 0; font-size: 8px; color: #6b7280; line-height: 1.1;">我的周总结</p>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 4px 8px; border-radius: 8px; display: inline-block; font-size: 8px; font-weight: 500;">
        <span style="transform: translateY(-5px); display: inline-block;">${data.weekRange}</span>
      </div>
    </div>
    
    <!-- 统计数据 -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px;">
      <div style="background: #fff7ed; border-radius: 4px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #ea580c; margin-bottom: 2px; margin-top: -5px;"><span style="transform: translateY(-2px); display: inline-block;">${data.weekEntries.length}</span></div>
        <div style="font-size: 8px; color: #6b7280; margin-top: -5px;">记录天数</div>
      </div>
      <div style="background: #eff6ff; border-radius: 4px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #2563eb; margin-bottom: 2px; margin-top: -5px;"><span style="transform: translateY(-2px); display: inline-block;">${data.weekEntries.reduce((sum, entry) => sum + entry.sentences.filter((s: string) => s.trim().length > 0).length, 0)}</span></div>
        <div style="font-size: 8px; color: #6b7280; margin-top: -5px;">总句数</div>
      </div>
      <div style="background: #f0fdf4; border-radius: 4px; padding: 8px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: #16a34a; margin-bottom: 2px; margin-top: -5px;"><span style="transform: translateY(-2px); display: inline-block;">${Math.round((data.weekEntries.length / 7) * 100)}%</span></div>
        <div style="font-size: 8px; color: #6b7280; margin-top: -5px;">完成率</div>
      </div>
    </div>
    
    <!-- AI总结 -->
    <div style="background: #fff7ed; border-radius: 6px; padding: 8px; margin-bottom: 8px; border: 1px solid #fed7aa;">
      <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 6px;">
        <div style="width: 16px; height: 16px; background: #ea580c; border-radius: 3px; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px; transform: translateY(4px);"><span style="transform: translateY(-4px); display: inline-block;">🤖</span></div>
        <h3 style="margin: 0; font-size: 9px; font-weight: 600; color: #1f2937; flex: 1;">AI 周总结</h3>
        <div style="background: #ea580c; color: white; padding: 2px 4px; border-radius: 4px; font-size: 7px; font-weight: 500; white-space: nowrap; align-self: flex-start; transform: translateY(4px);"><span style="transform: translateY(-4px); display: inline-block;">✨ Gemini</span></div>
      </div>
      <p style="margin: 0; font-size: 8px; line-height: 1.3; color: #374151;">${data.aiSummary || '正在生成中...'}</p>
    </div>
    
    <!-- AI情绪洞察 -->
    ${data.moodInsight ? `
      <div style="background: #eff6ff; border-radius: 6px; padding: 8px; margin-bottom: 8px; border: 1px solid #bfdbfe;">
        <div style="display: flex; align-items: center; gap: 3px; margin-bottom: 6px;">
          <span style="color: #2563eb; font-size: 10px;">✨</span>
          <span style="font-size: 9px; font-weight: 600; color: #1e40af;">AI 情绪洞察</span>
        </div>
        <p style="margin: 0; font-size: 8px; line-height: 1.3; color: #1e40af;">${data.moodInsight}</p>
      </div>
    ` : ''}
    
    <!-- 底部信息 -->
    <div style="text-align: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 7px; color: #9ca3af;">来自三句话日记 · 记录生活的美好时光</p>
    </div>
  `;
  
  // 添加到DOM中
  document.body.appendChild(shareContainer);
  
  try {
    // 使用html2canvas生成图片
    const canvas = await html2canvas(shareContainer, {
      backgroundColor: '#ffffff',
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      width: 240,
      height: shareContainer.scrollHeight + 16
    });
    
    // 转换为base64
    const imageDataUrl = canvas.toDataURL('image/png', 0.9);
    
    return imageDataUrl;
  } finally {
    // 清理DOM
    document.body.removeChild(shareContainer);
  }
};

// 下载图片
export const downloadImage = (dataUrl: string, filename: string = 'weekly-summary.png') => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 分享图片到社交媒体
export const shareImageToSocial = async (dataUrl: string, text: string = '') => {
  // 将base64转换为Blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'weekly-summary.png', { type: 'image/png' });
  
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: '我的周总结',
        text: text,
        files: [file]
      });
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  } else {
    // 如果不支持原生分享，则下载图片
    downloadImage(dataUrl);
    return false;
  }
};