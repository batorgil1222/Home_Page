import axios from "axios";
import { useEffect, useState } from "react";

interface NewsItem {
  _id: string;
  title: string;
  createdAt: number;
  content?: { _id: string; path: string; type: string };
}

type TesoNewsResponse = {
  pageProps?: { articles?: { articles?: NewsItem[] } };
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL as string;
  const NEWS_CACHE_KEY = "TESO_NEWS_CACHE_V1";
  const NEWS_TTL_MS = 15 * 60 * 1000;

  const isValidNewsResponse = (value: unknown): value is TesoNewsResponse => {
    if (!value || typeof value !== "object") return false;
    const v = value as TesoNewsResponse;
    const articles = v?.pageProps?.articles?.articles;
    return Array.isArray(articles);
  };

  useEffect(() => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem(NEWS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as { ts: number; data: any };
        if (!parsed?.ts || !parsed?.data) return null;

        const age = Date.now() - parsed.ts;
        if (age > NEWS_TTL_MS) return null;

        return parsed.data;
      } catch {
        return null;
      }
    };

    const writeCache = (data: any) => {
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
        const res = await axios.get(BASE_URL + NEWS_API_URL);
        if (res.data) {
          const data = res.data;
          if (!isValidNewsResponse(data)) {
            throw new Error("Invalid news response");
          }
          const articles = data?.pageProps?.articles?.articles ?? [];
          setNews(articles);
          writeCache(res.data);
        }
      } catch (err) {
        console.error("мэдээлэл татахад алдаа гарлаа:", err);
        const cached = readCache();
        if (cached && isValidNewsResponse(cached)) {
          const cachedArticles = cached?.pageProps?.articles?.articles ?? [];
          setNews(cachedArticles);
        }
      } finally {
        setLoading(false);
      }
    };

    const cached = readCache();
    if (cached && isValidNewsResponse(cached)) {
      const cachedArticles = cached?.pageProps?.articles?.articles ?? [];
      setNews(cachedArticles);
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
          const imageUrl = n.content?.path
            ? `${BASE_URL}/images/${n.content.path}`
            : "https://via.placeholder.com/300x200";

          const newsLink = `${BASE_URL}/news/all/article/${n._id}`;

          return (
            <a
              key={n._id || i}
              href={newsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card"
              style={{ textDecoration: "none" }}
            >
              <div className="news-image-wrapper">
                <img
                  src={imageUrl}
                  alt={n.title}
                  className="news-image"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/300x200";
                  }}
                />
              </div>

              <div className="news-content">
                <h4 style={{ textDecoration: "none", color: "white" }}>{n.title}</h4>
                <span className="news-date">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString("mn-MN") : "Огноогүй"}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
