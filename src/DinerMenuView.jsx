import React, { useState, useEffect } from 'react';
import styles from './DinerMenuView.module.css';

const DinerMenuView = ({ restaurantId }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    // Mock API call
    const fetchMenuData = () => {
      const mockData = {
        restaurantName: "Cline's Diner",
        menuItems: [
          { itemName: 'Burger', price: 12.99, description: 'Classic beef burger with all the fixings.', orderIndex: 2 },
          { itemName: 'Fries', price: 3.50, description: 'Crispy golden fries.', orderIndex: 3 },
          { itemName: 'Milkshake', price: 5.00, description: 'Creamy vanilla milkshake.', orderIndex: 4 },
          { itemName: 'Pizza', price: 15.00, description: 'Delicious pepperoni pizza.', orderIndex: 1 },
        ],
      };

      // Simulate network latency
      setTimeout(() => {
        setRestaurantName(mockData.restaurantName);
        // Sort menu items by orderIndex
        const sortedMenuItems = mockData.menuItems.sort((a, b) => a.orderIndex - b.orderIndex);
        setMenuItems(sortedMenuItems);
      }, 1000);
    };

    fetchMenuData();
  }, [restaurantId]); // Re-fetch if restaurantId changes

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>{restaurantName}</h1>
      <div className={styles.menuList}>
        {menuItems.map((item, index) => (
          <div key={index} className={styles.menuItem}>
            <h2 className={styles.itemName}>{item.itemName}</h2>
            <span className={styles.price}>৳{item.price.toFixed(2)}</span>
            <p className={styles.description}>{item.description}</p>
          </div>
        ))}
      </div>
      <p className={styles.footer}>Powered by Menu.X</p>
    </div>
  );
};

export default DinerMenuView;
