import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
export function useResource<T>(route: string) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const n = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const result = await api<T>(route);
      if (n === generation.current) setData(result);
    } catch (e) {
      if (n === generation.current)
        setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      if (n === generation.current) setLoading(false);
    }
  }, [route]);
  useEffect(() => {
    void reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  return { data, loading, error, reload };
}
