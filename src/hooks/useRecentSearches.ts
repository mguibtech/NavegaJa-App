import {useState, useEffect} from 'react';
import AsyncStorage from '@infra/storage';

const STORAGE_KEY = '@navegaja:recent-searches';
const MAX_SEARCHES = 5;

export interface RecentSearch {
  origin: string;
  destination: string;
  displayDate?: string;
  dateForApi?: string;
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }

  async function addSearch(search: RecentSearch) {
    const deduped = recentSearches.filter(
      s => !(s.origin === search.origin && s.destination === search.destination),
    );
    const updated = [search, ...deduped].slice(0, MAX_SEARCHES);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  async function clearSearches() {
    setRecentSearches([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  return {recentSearches, addSearch, clearSearches};
}
