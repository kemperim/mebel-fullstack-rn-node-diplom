// src/screens/SubcategoriesScreen.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubcategoriesScreen = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Получаем подкатегории с сервера
    axios.get('http://localhost:5000/subcategory')
      .then(response => {
        setSubcategories(response.data);  // Сохраняем подкатегории
        setLoading(false);  // Завершаем загрузку
      })
      .catch(error => {
        setError('Не удалось загрузить подкатегории');  // Обрабатываем ошибку
        setLoading(false);  // Завершаем загрузку
      });
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Список Подкатегорий</h1>
      <ul>
        {subcategories.length > 0 ? (
          subcategories.map(subcategory => (
            <li key={subcategory.id}>{subcategory.name}</li>
          ))
        ) : (
          <li>Подкатегории не найдены</li>
        )}
      </ul>
    </div>
  );
};

export default SubcategoriesScreen;
