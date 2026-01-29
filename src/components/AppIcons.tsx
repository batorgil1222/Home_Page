import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_APP_CORE_API_URL as string;
const IMAGE_BASE = import.meta.env.VITE_APP_CORE_IMAGE_BASE as string;

type SystemItem = {
  ID: number;
  NAME: string;
  LINK: string;
  IMAGE_PATH?: string;
  ORDERING?: number;
};

type ApiResponse = {
  status: string;
  result: SystemItem[];
};

export default function AppIcons() {
  const [apps, setApps] = useState<SystemItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await fetch(API_URL);
        const data: ApiResponse = await res.json();

        if (data.status === "success") {
          const sorted = data.result.sort(
            (a, b) => (a.ORDERING ?? 999) - (b.ORDERING ?? 999)
          );
          setApps(sorted);
        }
      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSystems();
  }, []);

  if (loading) return <div />;

  return (
    <div className="app-icons">
      {apps.map((app) => (
        <a
          key={app.ID}
          href={app.LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="app-icon"
        >
          <img
            src={
              app.IMAGE_PATH
                ? IMAGE_BASE + app.IMAGE_PATH
                : "/no-image.png"
            }
            alt={app.NAME}
          />
          <span>{app.NAME}</span>
        </a>
      ))}
    </div>
  );
}
