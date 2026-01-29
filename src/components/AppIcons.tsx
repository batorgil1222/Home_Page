import axios from "axios";
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
  const APPS_CACHE_KEY = "TESO_APPS_CACHE_V1";
  const APPS_TTL_MS = 60 * 60 * 1000;

  const isValidApiResponse = (value: unknown): value is ApiResponse => {
    if (!value || typeof value !== "object") return false;
    const v = value as ApiResponse;
    return Array.isArray(v?.result);
  };

  const sortApps = (items: SystemItem[]) =>
    [...items].sort((a, b) => (a.ORDERING ?? 999) - (b.ORDERING ?? 999));

  useEffect(() => {
    const readCache = () => {
      try {
        const raw = localStorage.getItem(APPS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as { ts: number; data: any };
        if (!parsed?.ts || !parsed?.data) return null;

        const age = Date.now() - parsed.ts;
        if (age > APPS_TTL_MS) return null;

        return parsed.data;
      } catch {
        return null;
      }
    };

    const writeCache = (data: any) => {
      try {
        localStorage.setItem(
          APPS_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), data })
        );
      } catch {
        // no-op
      }
    };

    const fetchSystems = async () => {
      try {
        const res = await axios.get(API_URL);
        const data: ApiResponse = res.data;

        if (!isValidApiResponse(data)) {
          throw new Error("Invalid app icons response");
        }

        writeCache(data);
        if (data.status === "success") {
          setApps(sortApps(data.result));
        }
      } catch (err) {
        console.error("API error:", err);
        const cached = readCache();
        if (cached && isValidApiResponse(cached)) {
          setApps(sortApps(cached.result));
        }
      } finally {
        setLoading(false);
      }
    };

    const cached = readCache();
    if (cached && isValidApiResponse(cached)) {
      setApps(sortApps(cached.result));
      setLoading(false);
    }

    if (!cached) fetchSystems();
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
            src={app.IMAGE_PATH ? IMAGE_BASE + app.IMAGE_PATH : "/no-image.png"}
            alt={app.NAME}
          />
          <span>{app.NAME}</span>
        </a>
      ))}
    </div>
  );
}
