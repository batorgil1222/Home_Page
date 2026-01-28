import { useEffect, useState } from "react";
import { cachedGet } from "../api/http";

interface NewsItem {
  _id: string;
  title: string;
  createdAt: number;
  content?: {
    _id: string;
    path: string;
    type: string;
  };
}

type TesoNewsResponse = {
  pageProps?: {
    articles?: {
      articles?: NewsItem[];
    };
  };
};

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const NEWS_API_URL = import.meta.env.VITE_NEWS_API_URL as string;

  const fetchNews = async (force = false) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await cachedGet<TesoNewsResponse>(NEWS_API_URL, {
        ttlMs: 15 * 60 * 1000,
        force,
        cacheKey: "TESO_NEWS_CACHE_V1",
      });

      const articles = data?.pageProps?.articles?.articles ?? [];
      setNews(articles);
    } catch (err: any) {
      console.error("Мэдээ татахад алдаа:", err?.message);
      setErrorMsg("Мэдээ татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  if (loading) return <div className="loading">Уншиж байна...</div>;

  return (
    <div className="news-wrapper">
      <div className="news-header">
        <h3>Мэдээ мэдээлэл</h3>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => fetchNews(true)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "white",
              padding: "6px 10px",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 12,
            }}
            title="Cache үл тоогоод API-аас дахин татах"
          >
            Шинэчлэх
          </button>

          <a
            href={`${BASE_URL}/news/all`}
            target="_blank"
            rel="noreferrer"
            className="news-more"
          >
            Дэлгэрэнгүй &gt;
          </a>
        </div>
      </div>

      {errorMsg ? (
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 8 }}>
          {errorMsg}
        </div>
      ) : null}

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
