import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function WeatherClock() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_WEATHER_API_URL);
        if (res.data && res.data.current) setWeather(res.data);
      } catch (err) {
        console.error("Цаг агаар татахад алдаа гарлаа:", err);
      }
    };
    fetchWeather();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (boxRef.current && !boxRef.current.contains(target)) {
        setIsExpanded(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsExpanded(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isExpanded]);

  const getWeatherInfo = (code: number) => {
    switch (code) {
        case 0:
        return { icon: "☀️", text: "Цэлмэг" };

        case 1:
        return { icon: "🌤️", text: "Ихэнхдээ цэлмэг" };

        case 2:
        return { icon: "⛅", text: "Багавтар үүлтэй" };

        case 3:
        return { icon: "☁️", text: "Үүлэрхэг" };

        case 45:
        case 48:
        return { icon: "🌫️", text: "Манантай" };

        case 51:
        case 53:
        case 55:
        return { icon: "🌦️", text: "Шиврээ бороо" };

        case 61:
        case 63:
        case 65:
        return { icon: "🌧️", text: "Бороотой" };

        case 71:
        case 73:
        case 75:
        case 77:
        return { icon: "❄️", text: "Цастай" };

        case 80:
        case 81:
        case 82:
        return { icon: "🌧️", text: "Аадар" };

        case 95:
        case 96:
        case 99:
        return { icon: "⛈️", text: "Аянгатай" };

        default:
        return { icon: "🌡️", text: "Тодорхойгүй" };
    }
};


  const getDayName = (dateStr: string) => {
    const days = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Би"];
    return days[new Date(dateStr).getDay()];
  };

  const currentInfo = weather
    ? getWeatherInfo(weather.current.weather_code)
    : { icon: "", text: "" };

  return (
    <div
      ref={boxRef}
      className={`weather-container ${isExpanded ? "expanded" : "compact"}`}
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded((v) => !v);
      }}
    >
      {/* MINI - always */}
      <div className="weather-summary-mini">
        <span className="temp-main">
          {weather?.current ? `${Math.round(weather.current.temperature_2m)}°` : "..."}
        </span>
        <span className="weather-status-text">{currentInfo.text}</span>
      </div>

      {/* DETAILS - always */}
      <div className="weather-full-details" onClick={(e) => e.stopPropagation()}>
        <div className="weather-header-row">
          <span className="date-txt">{time.toLocaleDateString("fr-CA")}</span>
          <span className="loc-txt">📍 Улаанбаатар</span>
          <span className="temp-txt">
            {currentInfo.icon} {Math.round(weather?.current?.temperature_2m ?? 0)}°
          </span>
        </div>

        <div className="divider"></div>
        <div className="forecast-label">Ирэх өдрүүдийн төлөв</div>

        <div className="forecast-grid">
          {weather?.daily?.time?.map((day: string, index: number) => (
            <div key={day} className="forecast-item">
              <span>{getDayName(day)}</span>
              <span>{getWeatherInfo(weather.daily.weather_code[index]).icon}</span>
              <b>{Math.round(weather.daily.temperature_2m_max[index])}°</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
