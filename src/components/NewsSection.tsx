import axios from "axios";
import { useEffect, useState } from "react";

interface NewsItem {
  id: number;
  title: string;
  imagePath: string | null;
  date: string;
}

type TesoNewsResponse = {
  status?: string;
  result?: Array<{
    id: number;
    TITLE?: string;
    IMAGE_PATH?: string | null;
    THUMBNAIL_PATH?: string | null;
    DATE?: string;
  }>;
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const NEWS_API_URL = "https://site-api.teso.mn/api/newnews?limit=10";
  const NEWS_CACHE_KEY = "TESO_NEWS_CACHE_V1";
  const NEWS_TTL_MS = 15 * 60 * 1000;

  const isValidNewsResponse = (value: unknown): value is TesoNewsResponse => {
    if (!value || typeof value !== "object") return false;
    const v = value as TesoNewsResponse;
    return Array.isArray(v?.result);
  };

  useEffect(() => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem(NEWS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as {
          ts: number;
          data: NewsItem[] | null;
        };
        if (!parsed?.ts || !parsed?.data) return null;

        const age = Date.now() - parsed.ts;
        if (age > NEWS_TTL_MS) return null;

        return parsed.data;
      } catch {
        return null;
      }
    };

    const writeCache = (data: NewsItem[] | null) => {
      try {
        localStorage.setItem(
          NEWS_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), data })
        );
      } catch {
        // no-op
      }
    };

    const fetchNews = async () => {
      try {
        const res = await axios.get(NEWS_API_URL);
        if (res.data) {
          const data = res.data;
          if (!isValidNewsResponse(data)) {
            throw new Error("Invalid news response");
          }

          const articles: NewsItem[] = (data.result ?? []).map(item => {
            return {
              id: item.id,
              title: item.TITLE || "",
              imagePath: item.THUMBNAIL_PATH || item.IMAGE_PATH || null,
              date: item.DATE || "",
            };
          });

          setNews(articles);
          writeCache(articles);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
        const cached = readCache();
        if (cached) setNews(cached);
      } finally {
        setLoading(false);
      }
    };

    const cached = readCache();
    if (cached) {
      setNews(cached);
      setLoading(false);
    }

    if (!cached) fetchNews();

    const intervalId = setInterval(fetchNews, NEWS_TTL_MS);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div className="loading"></div>;

  return (
    <div className="news-wrapper">
      <div className="news-header">
        <h3>Мэдээ мэдээлэл</h3>
        <a
          href={`${BASE_URL}/news/all`}
          target="_blank"
          rel="noreferrer"
          className="news-more"
        >
          Дэлгэрэнгүй &gt;
        </a>
      </div>

      <div className="news-section">
        {news.map((n, i) => {
          const imageUrl = n.imagePath
            ? `https://site-api.teso.mn${n.imagePath}`
            : "https://via.placeholder.com/300x200";

          const newsLink = `${BASE_URL}/news/${n.id}`;

          return (
            <a
              key={n.id || i}
              href={newsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
              style={{ textDecoration: "none" }}
            >
              <div className="news-image-wrapper">
                <img
                  src={imageUrl}
                  alt={n.title || "news"}
                  className="news-image"
                  loading="lazy"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/300x200";
                  }}
                />
              </div>

              <div className="news-content">
                <h4 style={{ textDecoration: "none", color: "white" }}>
                  {n.title}
                </h4>
                <span className="news-date">
                  {n.date
                    ? new Date(n.date).toLocaleDateString("mn-MN")
                    : "Огноогүй"}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
