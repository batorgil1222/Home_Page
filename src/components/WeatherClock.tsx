import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function WeatherClock() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const WEATHER_CACHE_KEY = "ub_weather_cache_v1";
  const WEATHER_CACHE_TTL_MS = 60 * 60 * 1000;

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  const readCache = () => {
    try {
      const raw = localStorage.getItem(WEATHER_CACHE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as { ts: number; data: any };
      if (!parsed?.ts || !parsed?.data) return null;

      const age = Date.now() - parsed.ts;
      if (age > WEATHER_CACHE_TTL_MS) return null; // хугацаа дууссан

      return parsed.data;
    } catch {
      return null;
    }
  };

  const writeCache = (data: any) => {
    try {
      localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data })
      );
    } catch {
      // storage дүүрсэн гэх мэт үед зүгээр алгасна
    }
  };

  const fetchWeather = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_WEATHER_API_URL);
      if (res.data && res.data.current) {
        setWeather(res.data);
        writeCache(res.data);
      }
    } catch (err) {
      console.error("Цаг агаар татахад алдаа гарлаа:", err);

      // net алдаа гарвал cache байгаа бол түүнийг ашиглаж үлдээнэ
      const cached = readCache();
      if (cached) setWeather(cached);
    }
  };

    const cached = readCache();
    if (cached) setWeather(cached);

    if (!cached) fetchWeather();

    const intervalId = setInterval(fetchWeather, WEATHER_CACHE_TTL_MS);

    return () => clearInterval(intervalId);
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

  const getNext7HourlyForecast = () => {
  if (!weather?.hourly?.time?.length) return [];

  const now = new Date();
  const times: string[] = weather.hourly.time;
  const temps: number[] = weather.hourly.temperature_2m ?? [];
  const codes: number[] = weather.hourly.weather_code ?? [];

  let startIndex = times.findIndex(
    (t) => new Date(t).getTime() >= now.getTime()
  );
  if (startIndex === -1) startIndex = 0;

  // ✅ 1 цагийн зайтай 7 ширхэг
  return Array.from({ length: 7 }, (_, i) => {
    const idx = startIndex + i;  

    if (idx >= times.length) return null;

    return {
      time: times[idx],
      temp: temps[idx],
      code: codes[idx],
    };
  }).filter(Boolean) as Array<{ time: string; temp: number; code: number }>;
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
      {!isExpanded && (
        <div className="weather-summary-mini">
          <span className="temp-main">
            {weather?.current ? `${Math.round(weather.current.temperature_2m)}°` : "..."}
          </span>
          <span className="weather-status-text">{currentInfo.text}</span>
        </div>
      )}

      {isExpanded && (
        <div className="weather-full-details" onClick={(e) => e.stopPropagation()}>
          <div className="weather-header-row">
            <span className="date-txt">{time.toLocaleDateString("fr-CA")}</span>
            <span className="loc-txt">📍 Улаанбаатар</span>
            <span className="temp-txt">
              {currentInfo.icon} {Math.round(weather?.current?.temperature_2m ?? 0)}°
            </span>
          </div>

          <div className="divider"></div>

          <div className="forecast-grid">
            {getNext7HourlyForecast().map((item, index) => {
              const info = getWeatherInfo(item.code);
              const dt = new Date(item.time);
              const hh = String(dt.getHours()).padStart(2, "0");
              return (
                <div key={index} className="forecast-item">
                  <span>{hh}:00</span>
                  <span>{info.icon}</span>
                  <b>{Math.round(item.temp)}°</b>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
