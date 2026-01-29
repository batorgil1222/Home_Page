import { useEffect, useRef, useState } from "react";
import { http } from "../api/http";
import { cacheGet, cacheRemove, cacheSet } from "../utils/apiCache";

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
  const [errorMsg, setErrorMsg] = useState("");

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

  const isMounted = useRef(true);
  const started = useRef(false);

  const fetchNews = async (opts?: { force?: boolean; silent?: boolean }) => {
    const force = opts?.force ?? false;
    const silent = opts?.silent ?? false;

    if (!silent) setLoading(true);
    setErrorMsg("");

    try {
      const cached = !force ? cacheGet<TesoNewsResponse>(NEWS_CACHE_KEY, NEWS_TTL_MS) : null;
      if (cached && isValidNewsResponse(cached)) {
        const cachedArticles = cached?.pageProps?.articles?.articles ?? [];
        if (isMounted.current) setNews(cachedArticles);
        return;
      }
      if (cached && !isValidNewsResponse(cached)) {
        cacheRemove(NEWS_CACHE_KEY);
      }

      const res = await http.get<TesoNewsResponse>(NEWS_API_URL);
      const data = res.data;
      if (!isValidNewsResponse(data)) {
        throw new Error("Invalid news response");
      }
      cacheSet<TesoNewsResponse>(NEWS_CACHE_KEY, data);

      const articles = data?.pageProps?.articles?.articles ?? [];
      if (isMounted.current) setNews(articles);
    } catch (err: any) {
      console.error("Мэдээ татахад алдаа:", err?.message);
      if (isMounted.current) setErrorMsg("");
    } finally {
      if (!silent && isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;

    if (started.current) return;
    started.current = true;

    fetchNews({ force: false, silent: false });

    const id = setInterval(() => {
      fetchNews({ force: false, silent: true });
    }, 15 * 60 * 1000);

    return () => {
      isMounted.current = false;
      clearInterval(id);
    };
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
