import React, { useState, useEffect } from 'react';
import { excelAPI } from '../services/api';

const StatusIndicator = () => {
  const [hasFile, setHasFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFileStatus();
  }, []);

  const checkFileStatus = async () => {
    try {
      const status = await excelAPI.getFileStatus();
      setHasFile(status.hasFile);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="status-indicator loading">
        <div className="status-dot"></div>
        Проверка статуса...
      </div>
    );
  }

  return (
    <div className={`status-indicator ${hasFile ? 'has-file' : 'no-file'}`}>
      <div className="status-dot"></div>
      {hasFile ? 'Файл загружен' : 'Файл не загружен'}
    </div>
  );
};

export default StatusIndicator;