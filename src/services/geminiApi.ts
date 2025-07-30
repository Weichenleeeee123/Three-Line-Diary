// Gemini API 服务
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// 魔搭社区 API 配置（备用）
const MODELSCOPE_API_KEY = import.meta.env.VITE_MODELSCOPE_API_KEY;
const MODELSCOPE_API_URL = 'https://api-inference.modelscope.cn/v1/chat/completions';
const MODELSCOPE_MODEL = 'Qwen/Qwen2.5-VL-72B-Instruct';

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2秒，给网络更多恢复时间

// 检查API密钥是否配置
if (!GEMINI_API_KEY) {
  console.warn('VITE_GEMINI_API_KEY is not configured. Gemini API features will use fallback responses.');
}
if (!MODELSCOPE_API_KEY) {
  console.warn('VITE_MODELSCOPE_API_KEY is not configured. Backup API will not be available.');
}

interface JournalEntry {
  id: string;
  date: string;
  sentences: [string, string, string];
  image?: string; // Base64 encoded image data
}

// 将base64图片转换为Gemini API需要的格式
function convertImageToGeminiFormat(base64Image: string) {
  // 移除data:image/jpeg;base64,前缀
  const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
  return {
    inline_data: {
      mime_type: base64Image.match(/data:image\/([a-z]+);base64,/)?.[1] === 'png' ? 'image/png' : 'image/jpeg',
      data: base64Data
    }
  };
}

// 将base64图片转换为魔搭API需要的格式
function convertImageToModelScopeFormat(base64Image: string) {
  return {
    type: "image_url",
    image_url: {
      url: base64Image
    }
  };
}

// 延迟函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 检查是否为速率限制或网络错误
function isRetryableError(error: any): boolean {
  if (error.message && typeof error.message === 'string') {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || 
           message.includes('429') || 
           message.includes('503') || 
           message.includes('502') || 
           message.includes('network') ||
           message.includes('timeout') ||
           message.includes('failed to fetch') ||
           message.includes('fetch error');
  }
  // TypeError通常是网络问题
  if (error instanceof TypeError) {
    return true;
  }
  return false;
}

// 魔搭社区API调用函数
async function callModelScopeAPI(prompt: string, images: string[] = [], language: 'zh' | 'en' = 'zh'): Promise<string> {
  if (!MODELSCOPE_API_KEY) {
    throw new Error('ModelScope API key not configured');
  }

  const messages: any[] = [];
  
  // 构建消息内容
  const content: any[] = [{ type: "text", text: prompt }];
  
  // 添加图片（最多3张）
  if (images.length > 0) {
    const imagesToInclude = images.slice(0, 3);
    imagesToInclude.forEach(image => {
      content.push(convertImageToModelScopeFormat(image));
    });
  }
  
  messages.push({
    role: "user",
    content: content
  });

  const response = await fetch(MODELSCOPE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MODELSCOPE_API_KEY}`
    },
    body: JSON.stringify({
      model: MODELSCOPE_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    throw new Error(`ModelScope API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content.trim();
  } else {
    throw new Error('Invalid ModelScope API response format');
  }
}

// 带重试的API调用函数
async function callAPIWithRetry(prompt: string, images: string[] = [], language: 'zh' | 'en' = 'zh'): Promise<string> {
  let lastError: any;
  
  // 暂时注释掉Gemini API，演示时使用魔搭社区API
  /*
  // 首先尝试Gemini API
  if (GEMINI_API_KEY) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Attempting Gemini API call (${attempt}/${MAX_RETRIES})`);
        
        // 构建请求内容，包含文本和图片
        const parts: any[] = [{ text: prompt }];
        
        // 如果有图片，添加到请求中（最多3张图片以避免token限制）
        if (images.length > 0) {
          const imagesToInclude = images.slice(0, 3);
          imagesToInclude.forEach(image => {
            parts.push(convertImageToGeminiFormat(image));
          });
        }

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: parts
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          }),
          // 添加超时和错误处理
          signal: AbortSignal.timeout(30000) // 30秒超时
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          console.log('Gemini API call successful');
          return data.candidates[0].content.parts[0].text.trim();
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(`Gemini API attempt ${attempt} failed:`, error);
        lastError = error;
        
        // 如果是可重试的错误且还有重试次数，则等待后重试
        if (isRetryableError(error) && attempt < MAX_RETRIES) {
          console.log(`Waiting ${RETRY_DELAY}ms before retry...`);
          await delay(RETRY_DELAY);
          continue;
        }
        
        // 如果不是可重试的错误或已达到最大重试次数，跳出循环
        break;
      }
    }
  }
  */
  
  // 直接使用魔搭社区API（演示用）
  if (MODELSCOPE_API_KEY) {
    try {
      console.log('使用魔搭社区API...');
      const result = await callModelScopeAPI(prompt, images, language);
      console.log('魔搭社区API调用成功');
      return result;
    } catch (error) {
      console.error('魔搭社区API调用失败:', error);
      lastError = error;
    }
  }
  
  // 如果魔搭API也失败，抛出错误
  throw new Error(language === 'zh' 
    ? 'AI服务暂时不可用，请稍后重试'
    : 'AI service is temporarily unavailable, please try again later'
  );
}

export async function generateWeeklySummary(entries: JournalEntry[], language: 'zh' | 'en' = 'zh'): Promise<string> {
  if (entries.length === 0) {
    return language === 'zh' 
      ? '这周你还没有记录，开始写下你的第一篇日记吧！记录生活的点点滴滴，会让你更好地了解自己。'
      : 'You haven\'t recorded anything this week yet. Start writing your first diary entry! Recording the little moments of life will help you understand yourself better.';
  }

  // 准备日记内容和图片
  const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));
  const journalContent = sortedEntries
    .map(entry => {
      const date = new Date(entry.date).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
      const sentences = entry.sentences.filter(s => s.trim().length > 0);
      const imageNote = entry.image ? (language === 'zh' ? ' [包含照片]' : ' [with photo]') : '';
      return `${date}${imageNote}${language === 'zh' ? '：' : ': '}\n${sentences.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    })
    .join('\n\n');
  
  // 收集所有图片
  const images = sortedEntries.filter(entry => entry.image).map(entry => entry.image!);

  const prompt = language === 'zh'
    ? `请基于以下一周的日记内容${images.length > 0 ? '和照片' : ''}，生成一个温暖、亲切的周总结。要求：

1. 使用第二人称（"你"）来称呼用户
2. 语气要亲切、温暖、鼓励
3. 总结要包含这周的主要活动、情绪变化和成长
4. ${images.length > 0 ? '结合照片内容，分析用户的生活状态和情绪' : ''}
5. 字数控制在150-200字之间
6. 要有正能量和鼓励性的结尾
7. 不要使用过于正式的语言，要像朋友间的对话

日记内容：
${journalContent}

请生成周总结：`
    : `Based on the following week's diary entries${images.length > 0 ? ' and photos' : ''}, generate a warm and friendly weekly summary. Requirements:

1. Address the user as "you"
2. Use a warm, encouraging, and friendly tone
3. Include main activities, emotional changes, and growth from this week
4. ${images.length > 0 ? 'Analyze the photos to understand the user\'s life and emotions' : ''}
5. Keep the length between 150-200 words
6. End with positive energy and encouragement
7. Don't use overly formal language, make it like a conversation between friends

Diary content:
${journalContent}

Please generate the weekly summary:`;

  // 如果没有配置API密钥，直接返回fallback响应
  if (!GEMINI_API_KEY) {
    const totalSentences = entries.reduce((sum, entry) => 
      sum + entry.sentences.filter((s: string) => s.trim().length > 0).length, 0
    );
    
    const avgSentencesPerDay = (totalSentences / 7).toFixed(1);
    
    let fallbackSummary = language === 'zh'
      ? `这周你记录了 ${entries.length} 天，共写下 ${totalSentences} 句话，平均每天 ${avgSentencesPerDay} 句。`
      : `This week you recorded ${entries.length} days, writing a total of ${totalSentences} sentences, averaging ${avgSentencesPerDay} sentences per day.`;
    
    if (entries.length >= 5) {
      fallbackSummary += language === 'zh'
        ? ' 你坚持记录的习惯真的很棒！这样的自我反思会让你更加了解自己，继续保持下去吧。'
        : ' Your habit of consistent recording is really amazing! This kind of self-reflection will help you understand yourself better. Keep it up!';
    } else if (entries.length >= 3) {
      fallbackSummary += language === 'zh'
        ? ' 你的记录习惯正在慢慢养成，这是一个很好的开始。试着每天都写下三句话，记录生活的美好瞬间。'
        : ' Your recording habit is gradually forming, which is a great start. Try to write three sentences every day to record the beautiful moments of life.';
    } else {
      fallbackSummary += language === 'zh'
        ? ' 开始记录是个很棒的决定！虽然这周记录不多，但每一次记录都是珍贵的。试着更频繁地记录你的生活吧，你会发现很多意想不到的收获。'
        : ' Starting to record is a wonderful decision! Although you didn\'t record much this week, every entry is precious. Try to record your life more frequently, and you\'ll discover many unexpected rewards.';
    }
    
    return fallbackSummary;
  }

  try {
    // 使用带重试和备用API的调用函数
    return await callAPIWithRetry(prompt, images, language);
  } catch (error) {
    console.error('AI API error:', error);
    
    // 如果所有API都失败，抛出错误让上层处理
    throw new Error(language === 'zh' 
      ? 'AI总结生成失败，请检查网络连接或稍后重试'
      : 'AI summary generation failed, please check your network connection or try again later'
    );
  }
}

export async function generateMoodInsight(entries: JournalEntry[], language: 'zh' | 'en' = 'zh'): Promise<string> {
  if (entries.length === 0) {
    return language === 'zh'
      ? '开始记录你的心情吧，AI会帮你分析情绪变化趋势。'
      : 'Start recording your mood, and AI will help you analyze emotional trends.';
  }

  const journalContent = entries
    .map(entry => {
      const sentences = entry.sentences.filter(s => s.trim().length > 0).join(' ');
      const imageNote = entry.image ? (language === 'zh' ? ' [包含照片]' : ' [with photo]') : '';
      return sentences + imageNote;
    })
    .join(' ');
  
  // 收集图片
  const images = entries.filter(entry => entry.image).map(entry => entry.image!);

  const prompt = language === 'zh'
    ? `请基于以下日记内容${images.length > 0 ? '和照片' : ''}，分析用户这周的情绪状态和心理变化。要求：

1. 使用第二人称（"你"）
2. 语气温暖、关怀
3. 分析情绪趋势和变化
4. ${images.length > 0 ? '结合照片中的表情、场景等视觉信息分析情绪' : ''}
5. 给出积极的建议和鼓励
6. 字数控制在100字以内

日记内容：${journalContent}

请生成情绪洞察：`
    : `Based on the following diary content${images.length > 0 ? ' and photos' : ''}, analyze the user's emotional state and psychological changes this week. Requirements:

1. Address the user as "you"
2. Use a warm, caring tone
3. Analyze emotional trends and changes
4. ${images.length > 0 ? 'Analyze emotions from visual cues like expressions and scenes in photos' : ''}
5. Provide positive suggestions and encouragement
6. Keep within 100 words

Diary content: ${journalContent}

Please generate emotional insights:`;

  // 如果没有配置任何API密钥，直接返回fallback响应
  if (!GEMINI_API_KEY && !MODELSCOPE_API_KEY) {
    return language === 'zh'
      ? '你这周的记录很棒！继续保持记录的习惯，让AI更好地了解你的情绪变化。'
      : 'Your records this week are great! Keep up the recording habit to help AI better understand your emotional changes.';
  }

  try {
    // 使用带重试和备用API的调用函数
    return await callAPIWithRetry(prompt, images, language);
  } catch (error) {
    console.error('AI API error:', error);
    return language === 'zh'
      ? '你这周的记录很棒！继续保持记录的习惯，让AI更好地了解你的情绪变化。'
      : 'Your records this week are great! Keep up the recording habit to help AI better understand your emotional changes.';
  }
}

// 分析单张图片的内容和情绪
export async function analyzeImage(imageBase64: string, language: 'zh' | 'en' = 'zh'): Promise<string> {
  if (!GEMINI_API_KEY && !MODELSCOPE_API_KEY) {
    return language === 'zh'
      ? '图片分析功能需要配置API密钥。'
      : 'Image analysis requires API key configuration.';
  }

  const prompt = language === 'zh'
    ? `请分析这张照片，描述你看到的内容、场景、情绪和氛围。要求：

1. 使用温暖、友好的语气
2. 描述照片中的主要元素和场景
3. 分析照片传达的情绪和氛围
4. 给出积极正面的解读
5. 字数控制在80字以内

请分析这张照片：`
    : `Please analyze this photo, describing what you see, the scene, emotions, and atmosphere. Requirements:

1. Use a warm, friendly tone
2. Describe the main elements and scene in the photo
3. Analyze the emotions and atmosphere conveyed
4. Provide positive interpretation
5. Keep within 80 words

Please analyze this photo:`;

  try {
    // 使用带重试和备用API的调用函数
    return await callAPIWithRetry(prompt, [imageBase64], language);
  } catch (error) {
    console.error('AI API error:', error);
    return language === 'zh'
      ? '这是一张很棒的照片！记录生活的美好瞬间总是让人感到温暖。'
      : 'This is a wonderful photo! Capturing beautiful moments of life always feels heartwarming.';
  }
}