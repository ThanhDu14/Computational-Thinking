import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudFog, CloudLightning, Loader2, ThermometerSun, Wind, Eye, Droplets } from 'lucide-react';
import { getWeatherByProvince } from '../../services/weatherService';

const WeatherWidget = ({ province }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to map OpenWeatherMap icon codes to Lucide icons
  const getWeatherIcon = (iconCode, sizeClass = "w-8 h-8") => {
    if (!iconCode) return <Sun className={`${sizeClass} text-yellow-400`} />;
    const code = iconCode.substring(0, 2);
    switch (code) {
      case '01': 
        return <Sun className={`${sizeClass} text-yellow-400 ${sizeClass.includes('w-8') || sizeClass.includes('w-7') ? 'animate-[spin_20s_linear_infinite]' : ''}`} />;
      case '02': 
      case '03':
      case '04': 
        return <Cloud className={`${sizeClass} text-blue-300 dark:text-blue-200`} />;
      case '09':
      case '10': 
        return <CloudRain className={`${sizeClass} text-blue-400`} />;
      case '11': 
        return <CloudLightning className={`${sizeClass} text-purple-400`} />;
      case '13': 
        return <CloudRain className={`${sizeClass} text-cyan-300`} />;
      case '50': 
        return <CloudFog className={`${sizeClass} text-slate-400`} />;
      default: 
        return <Sun className={`${sizeClass} text-yellow-400`} />;
    }
  };

  // Helper to format date in Vietnamese
  const formatForecastDate = (dateString, index) => {
    if (index === 0) return 'Hôm nay';
    if (index === 1) return 'Ngày mai';
    
    try {
      const date = new Date(dateString);
      const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[date.getDay()];
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${dayName}, ${day}/${month}`;
    } catch (e) {
      return dateString;
    }
  };

  // Helper to get highlight gradient for Today's weather
  const getTodayWeatherBackground = (iconCode) => {
    if (!iconCode) return 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border-amber-500/25';
    const code = iconCode.substring(0, 2);
    switch (code) {
      case '01': // Sunny
        return 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border-amber-500/25';
      case '09': // Rain
      case '10':
      case '11':
      case '13':
        return 'from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10 border-blue-500/25';
      default: // Cloudy/Foggy
        return 'from-slate-400/15 to-slate-500/5 dark:from-slate-400/25 dark:to-slate-500/10 border-slate-400/25';
    }
  };

  useEffect(() => {
    const fetchWeather = async () => {
      if (!province) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getWeatherByProvince(province);
        setWeatherData(data);
      } catch (err) {
        console.error("Lỗi khi tải thời tiết từ Backend API:", err);
        setError("Không thể tải thời tiết");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, [province]);

  if (isLoading) {
    return (
      <div className="bg-surface-container/40 dark:bg-surface-container-high/40 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-center h-28 animate-pulse mb-6 shadow-sm">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <span className="ml-2 text-sm text-on-surface-variant font-body">Đang tải thời tiết {province}...</span>
      </div>
    );
  }

  if (error || !weatherData) {
    return null; // Return null if fetching fails so it doesn't break the UI
  }

  // Handle both 3-day forecast (array) and old single-day (object) response format
  const isForecastArray = Array.isArray(weatherData);

  if (isForecastArray) {
    return (
      <div className="bg-gradient-to-br from-surface-container/60 to-surface-container-low/40 dark:from-surface-container-high/60 dark:to-surface-container/40 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-4.5 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-2 mb-3.5 text-on-surface">
          <ThermometerSun className="w-5 h-5 text-orange-500 animate-[pulse_2s_infinite]" />
          <h3 className="font-display font-bold text-base">Dự báo thời tiết 3 ngày</h3>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full ml-auto">
            {province}
          </span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {weatherData.map((day, idx) => {
            const dateLabel = formatForecastDate(day.date, idx);
            const capitalizedDesc = day.description ? day.description.charAt(0).toUpperCase() + day.description.slice(1) : "";
            const isToday = idx === 0;
            const cardBgClass = isToday
              ? `bg-gradient-to-br ${getTodayWeatherBackground(day.icon)}`
              : 'bg-surface/30 dark:bg-surface-container-highest/10 hover:bg-surface/50 dark:hover:bg-surface-container-highest/20 border border-outline-variant/10 hover:border-outline-variant/30';

            return (
              <div 
                key={day.date || idx}
                className={`${cardBgClass} flex items-center justify-between p-3.5 rounded-xl border border-outline-variant/15 transition-all duration-300 group`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className={`font-semibold text-sm text-on-surface ${isToday ? 'text-primary dark:text-primary-light font-bold' : ''}`}>
                    {dateLabel}
                  </span>
                  <span className="text-xs text-on-surface-variant/80 font-body">
                    {capitalizedDesc}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full transition-transform duration-300 ${isToday ? 'bg-surface/50 dark:bg-surface-container-highest/40 shadow-inner' : 'bg-primary/5 group-hover:scale-110'}`}>
                    {getWeatherIcon(day.icon, isToday ? 'w-7 h-7' : 'w-6 h-6')}
                  </div>
                  
                  <div className="flex items-center gap-2 font-display text-sm min-w-[70px] justify-end">
                    <span className="text-blue-500 dark:text-blue-400 font-semibold" title="Nhiệt độ thấp nhất">
                      {Math.round(day.min_temp)}°
                    </span>
                    <span className="text-on-surface-variant/20">|</span>
                    <span className="text-orange-500 dark:text-orange-400 font-bold" title="Nhiệt độ cao nhất">
                      {Math.round(day.max_temp)}°
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: old single day response format
  const temp = Math.round(weatherData.main?.temp);
  const feelsLike = Math.round(weatherData.main?.feels_like);
  const humidity = weatherData.main?.humidity;
  const windSpeed = weatherData.wind?.speed;
  const visibilityKm = (weatherData.visibility / 1000).toFixed(1);
  const description = weatherData.weather?.[0]?.description;
  const iconCode = weatherData.weather?.[0]?.icon;
  const capitalizedDesc = description ? description.charAt(0).toUpperCase() + description.slice(1) : "";

  return (
    <div className="bg-gradient-to-br from-surface-container/60 to-surface-container-low/40 dark:from-surface-container-high/60 dark:to-surface-container/40 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-4.5 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-3.5 text-on-surface">
        <ThermometerSun className="w-5 h-5 text-orange-500 animate-[pulse_2s_infinite]" />
        <h3 className="font-display font-bold text-base">Thời tiết hiện tại</h3>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full ml-auto">
          {province}
        </span>
      </div>
      
      {/* Main weather info card */}
      <div className="flex items-center justify-between bg-surface/30 dark:bg-surface-container-highest/20 rounded-xl p-3.5 border border-outline-variant/10 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 rounded-full shadow-inner border border-outline-variant/20">
            {getWeatherIcon(iconCode, "w-8 h-8")}
          </div>
          <div>
            <div className="font-display font-extrabold text-3xl text-on-surface tracking-tight">
              {temp}°C
            </div>
            <div className="text-xs text-on-surface-variant/80 font-body mt-0.5">
              Cảm giác như: <span className="font-semibold text-primary">{feelsLike}°C</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-block text-xs font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md uppercase tracking-wider mb-1">
            Live
          </span>
          <div className="text-sm font-semibold text-on-surface max-w-[150px] truncate" title={capitalizedDesc}>
            {capitalizedDesc}
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="flex flex-col items-center bg-surface/40 dark:bg-surface-container-highest/40 rounded-xl p-2 border border-outline-variant/10 hover:bg-surface/60 transition-colors">
          <Droplets className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-[10px] text-on-surface-variant/70 font-body">Độ ẩm</span>
          <span className="text-xs font-bold text-on-surface mt-0.5">{humidity}%</span>
        </div>
        
        <div className="flex flex-col items-center bg-surface/40 dark:bg-surface-container-highest/40 rounded-xl p-2 border border-outline-variant/10 hover:bg-surface/60 transition-colors">
          <Wind className="w-4 h-4 text-teal-500 mb-1" />
          <span className="text-[10px] text-on-surface-variant/70 font-body">Tốc độ gió</span>
          <span className="text-xs font-bold text-on-surface mt-0.5">{windSpeed} m/s</span>
        </div>

        <div className="flex flex-col items-center bg-surface/40 dark:bg-surface-container-highest/40 rounded-xl p-2 border border-outline-variant/10 hover:bg-surface/60 transition-colors">
          <Eye className="w-4 h-4 text-indigo-500 mb-1" />
          <span className="text-[10px] text-on-surface-variant/70 font-body">Tầm nhìn</span>
          <span className="text-xs font-bold text-on-surface mt-0.5">{visibilityKm} km</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
