import React from 'react';
import { Sun, CloudRain, Cloud, Snowflake } from 'lucide-react';
import { WeatherCondition } from '../services/weatherService';
import { useI18n } from '../hooks/useI18n';

interface WeatherIconProps {
  condition?: WeatherCondition;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  condition, 
  size = 16, 
  className = '', 
  showTooltip = true 
}) => {
  const { t } = useI18n();
  
  if (!condition) return null;

  const getIcon = () => {
    switch (condition) {
      case 'sunny':
        return <Sun size={size} className={`text-yellow-500 ${className}`} />;
      case 'rainy':
        return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
      case 'cloudy':
        return <Cloud size={size} className={`text-gray-500 ${className}`} />;
      case 'snowy':
        return <Snowflake size={size} className={`text-blue-300 ${className}`} />;
      default:
        return <Sun size={size} className={`text-yellow-500 ${className}`} />;
    }
  };

  const getTooltip = () => {
    return t.weather[condition];
  };

  const icon = getIcon();

  if (showTooltip) {
    return (
      <div 
        className="inline-flex items-center justify-center" 
        title={getTooltip()}
      >
        {icon}
      </div>
    );
  }

  return icon;
};

export default WeatherIcon;