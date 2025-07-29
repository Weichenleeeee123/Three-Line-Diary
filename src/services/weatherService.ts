/**
 * 天气服务 - 获取当前天气信息
 */

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'snowy';

export interface WeatherData {
  condition: WeatherCondition;
  temperature?: number;
  description?: string;
}

/**
 * 根据天气代码映射到简化的天气状态
 */
function mapWeatherCondition(weatherCode: number, description: string): WeatherCondition {
  // OpenWeatherMap weather codes mapping
  if (weatherCode >= 200 && weatherCode < 300) {
    return 'rainy'; // Thunderstorm
  }
  if (weatherCode >= 300 && weatherCode < 600) {
    return 'rainy'; // Drizzle and Rain
  }
  if (weatherCode >= 600 && weatherCode < 700) {
    return 'snowy'; // Snow
  }
  if (weatherCode >= 700 && weatherCode < 800) {
    return 'cloudy'; // Atmosphere (mist, fog, etc.)
  }
  if (weatherCode === 800) {
    return 'sunny'; // Clear sky
  }
  if (weatherCode > 800) {
    return 'cloudy'; // Clouds
  }
  
  // Fallback based on description
  const desc = description.toLowerCase();
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('thunder')) {
    return 'rainy';
  }
  if (desc.includes('snow') || desc.includes('sleet')) {
    return 'snowy';
  }
  if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('fog') || desc.includes('mist')) {
    return 'cloudy';
  }
  
  return 'sunny'; // Default
}

/**
 * 获取用户地理位置
 */
function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
}

/**
 * 从OpenWeatherMap获取天气数据
 */
async function fetchWeatherFromAPI(lat: number, lon: number): Promise<WeatherData> {
  // 使用免费的OpenWeatherMap API
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
  
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key not configured');
  }
  
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    const condition = mapWeatherCondition(data.weather[0].id, data.weather[0].description);
    
    return {
      condition,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description
    };
  } catch (error) {
    console.warn('Failed to fetch weather from API:', error);
    throw error;
  }
}

/**
 * 基于时间的简单天气模拟（作为备用方案）
 */
function getSimulatedWeather(): WeatherData {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const random = Math.random();
  
  // 简单的天气模拟逻辑
  let condition: WeatherCondition;
  
  if (random < 0.1) {
    condition = 'snowy';
  } else if (random < 0.3) {
    condition = 'rainy';
  } else if (random < 0.6) {
    condition = 'cloudy';
  } else {
    condition = 'sunny';
  }
  
  // 夜晚更可能是多云
  if (hour < 6 || hour > 20) {
    condition = random < 0.7 ? 'cloudy' : condition;
  }
  
  return {
    condition,
    temperature: Math.round(15 + Math.random() * 20), // 15-35°C
    description: getWeatherDescription(condition)
  };
}

/**
 * 获取天气描述
 */
function getWeatherDescription(condition: WeatherCondition): string {
  const descriptions = {
    sunny: '晴朗',
    rainy: '下雨',
    cloudy: '多云',
    snowy: '下雪'
  };
  return descriptions[condition];
}

/**
 * 获取当前天气信息
 * 优先使用真实API，失败时使用模拟数据
 */
export async function getCurrentWeather(): Promise<WeatherData> {
  try {
    // 尝试获取地理位置
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    
    // 尝试从API获取天气
    return await fetchWeatherFromAPI(latitude, longitude);
  } catch (error) {
    console.warn('Failed to get real weather data, using simulated data:', error);
    // 使用模拟天气数据作为备用方案
    return getSimulatedWeather();
  }
}

/**
 * 获取天气图标名称（用于Lucide图标）
 */
export function getWeatherIcon(condition: WeatherCondition): string {
  const iconMap = {
    sunny: 'Sun',
    rainy: 'CloudRain',
    cloudy: 'Cloud',
    snowy: 'Snowflake'
  };
  return iconMap[condition];
}

/**
 * 获取天气颜色主题
 */
export function getWeatherColor(condition: WeatherCondition): string {
  const colorMap = {
    sunny: 'text-yellow-500',
    rainy: 'text-blue-500',
    cloudy: 'text-gray-500',
    snowy: 'text-blue-300'
  };
  return colorMap[condition];
}

/**
 * 缓存天气数据（避免频繁请求）
 */
const WEATHER_CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟

interface WeatherCache {
  data: WeatherData;
  timestamp: number;
  date: string;
}

/**
 * 获取缓存的天气数据
 */
function getCachedWeather(): WeatherData | null {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp, date }: WeatherCache = JSON.parse(cached);
    const today = new Date().toISOString().split('T')[0];
    
    // 检查是否是今天的数据且未过期
    if (date === today && Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to get cached weather:', error);
    return null;
  }
}

/**
 * 缓存天气数据
 */
function setCachedWeather(data: WeatherData): void {
  try {
    const cache: WeatherCache = {
      data,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to cache weather:', error);
  }
}

/**
 * 获取今日天气（带缓存）
 */
export async function getTodayWeather(): Promise<WeatherData> {
  // 先尝试从缓存获取
  const cached = getCachedWeather();
  if (cached) {
    return cached;
  }
  
  // 获取新的天气数据
  const weather = await getCurrentWeather();
  
  // 缓存数据
  setCachedWeather(weather);
  
  return weather;
}