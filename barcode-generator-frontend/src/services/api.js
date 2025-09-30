import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/excel';

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
  },

  async getFileStatus() {
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
  },

  getFileStatus: async () => {
    try {
      const { data } = await axios.get('http://localhost:8080/api/excel/status');
      return data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw new Error(`Ошибка сервера: ${error.response?.status || 'Неизвестная ошибка'} - ${error.response?.data?.message || error.message}`);
    }
  },
  getProducts: async () => {
    try {
      const { data } = await axios.get('http://localhost:8080/api/excel/products');
      return data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw new Error(`Ошибка сервера: ${error.response?.status || 'Неизвестная ошибка'} - ${error.response?.data?.message || error.message}`);
    }
  },
  searchProduct: async (barcode) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/excel/search?barcode=${encodeURIComponent(barcode)}`);
      return data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw new Error(`Ошибка сервера: ${error.response?.status || 'Неизвестная ошибка'} - ${error.response?.data?.message || error.message}`);
    }
  },
  searchBySap: async (sapArticle) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/api/excel/search-sap?sap=${encodeURIComponent(sapArticle)}`);
      return data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Сервер недоступен. Проверьте подключение к интернету.');
      }
      throw new Error(`Ошибка сервера: ${error.response?.status || 'Неизвестная ошибка'} - ${error.response?.data?.message || error.message}`);
    }
  },
};