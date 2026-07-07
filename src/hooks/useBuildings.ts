import { useEffect, useState } from 'react';
import api from '../lib/apiClient';

export interface BuildingOption {
  id: string;
  name: string;
  address?: string;
  water_reading_enabled?: boolean;
  has_wings?: boolean;
}

const CACHE_KEY = 'mb_admin_buildings';

export function useBuildings(enabled: boolean) {
  const [buildings, setBuildings] = useState<BuildingOption[]>(() => {
    if (!enabled) return [];
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get<BuildingOption[]>('/buildings')
      .then(data => {
        setBuildings(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled]);

  return { buildings, loading };
}

export const ADMIN_BUILDING_KEY = 'mb_admin_selected_building';

export function loadSavedBuilding(): BuildingOption | null {
  try {
    const s = localStorage.getItem(ADMIN_BUILDING_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function saveBuilding(building: BuildingOption | null) {
  if (building) localStorage.setItem(ADMIN_BUILDING_KEY, JSON.stringify(building));
  else localStorage.removeItem(ADMIN_BUILDING_KEY);
}
