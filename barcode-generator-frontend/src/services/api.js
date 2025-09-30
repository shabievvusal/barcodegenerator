import axios from 'axios';

const API_BASE = '/api/excel';

// Кэш для API запросов
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Функция для проверки валидности кэша
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Функция для получения данных из кэша или выполнения запроса
const getCachedData = async (key, fetchFunction) => {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

export const excelAPI = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw error;
    }
  },

  async deleteFile() {
    try {
      const response = await fetch(`${API_BASE}/delete`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw error;
    }
  },

  async getProducts() {
    return getCachedData('products', async () => {
      try {
        const response = await fetch(`${API_BASE}/products`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
        return response.json();
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
        }
        throw error;
      }
    });
  },

  async getFileStatus() {
    return getCachedData('status', async () => {
      try {
        const response = await fetch(`${API_BASE}/status`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
        return response.json();
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
        }
        throw error;
      }
    });
  },

  // Добавлены отсутствующие методы поиска
  async searchProduct(barcode) {
    return getCachedData(`search-${barcode}`, async () => {
      try {
        const response = await fetch(`${API_BASE}/search?barcode=${encodeURIComponent(barcode)}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        return response.json();
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
        }
        throw error;
      }
    });
  },

  async searchBySap(sap) {
    return getCachedData(`search-sap-${sap}`, async () => {
      try {
        const response = await fetch(`${API_BASE}/search-sap?sap=${encodeURIComponent(sap)}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        return response.json();
      } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
        }
        throw error;
      }
    });
  },

  // Функция для очистки кэша
  clearCache() {
    cache.clear();
  },

  // Функция для очистки кэша при загрузке/удалении файла
  invalidateCache() {
    cache.clear();
  }
};