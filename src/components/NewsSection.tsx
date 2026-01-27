import { useState, useEffect } from 'react';
import axios from 'axios';

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

export default function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchNews = async () => {
            try {
            const res = await axios.get(import.meta.env.VITE_NEWS_API_URL);
          
            console.log("Data structure:", res.data);
            
            const articles = res.data.pageProps?.articles?.articles || [];
            setNews(articles);
            } catch (err: any) {
            console.error("Мэдээ татахад алдаа гарлаа:", err.response?.status, err.message);
            } finally {
            setLoading(false);
            }
        };
        fetchNews();
    }, []);

  if (loading) return <div className="loading">Уншиж байна...</div>;

  return (
    <div className="news-wrapper">
      <div className="news-header">
        <h3>Мэдээ мэдээлэл</h3>
        <a href={`${BASE_URL}/news/all`} target="_blank" className="news-more">
          Дэлгэрэнгүй &gt;
        </a>
      </div>

      <div className="news-section">
        {news.map((n: NewsItem, i) => {
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
              style={{ textDecoration: 'none' }}
            >
              <div className="news-image-wrapper">
                <img src={imageUrl} alt={n.title} className="news-image" />
              </div>
              
              <div className="news-content">
                <h4 style={{ textDecoration: 'none', color: 'white' }}>{n.title}</h4>
                <span className="news-date">
                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString('mn-MN') : "Огноогүй"}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}