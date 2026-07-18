import { useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../../../shared/services/authApi';

const API = import.meta.env.VITE_API_URL;

export function useDashboard(selectedDateISO) {
  const [metrics, setMetrics]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const eventSourceRef            = useRef(null);

  const fetchMetrics = useCallback(async () => {
    if (!selectedDateISO) return;
    try {
      const res = await fetch(
        `${API}/api/tasks/metrics?date=${selectedDateISO}`,
        { headers: authApi.headers() }
      );
      if (!res.ok) throw new Error('Falha ao buscar métricas');
      const data = await res.json();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[useDashboard]', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDateISO]);

  useEffect(() => {
    setLoading(true);
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    const token = authApi.getToken();
    if (!token) return;

    const url = `${API}/api/tasks/events?token=${token}`;
    const es  = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'refresh') {
          fetchMetrics();
        }
      } catch {}
    };

    es.onerror = () => {
      setTimeout(() => {
        es.close();
      }, 5000);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  return { metrics, loading, lastUpdate, refetch: fetchMetrics };
}