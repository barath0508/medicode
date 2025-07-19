import { useState, useEffect } from 'react';

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      
      const parsed = JSON.parse(item);
      
      // Handle date objects in history items
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (item && typeof item === 'object' && item.timestamp) {
            return {
              ...item,
              timestamp: new Date(item.timestamp)
            };
          }
          return item;
        }) as T;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Serialize the value, handling Date objects
      const serializedValue = JSON.stringify(valueToStore, (key, val) => {
        if (val instanceof Date) {
          return val.toISOString();
        }
        return val;
      });
      
      window.localStorage.setItem(key, serializedValue);
      console.log(`LocalStorage updated for key "${key}":`, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}