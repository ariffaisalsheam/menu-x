import React, { useState, useEffect } from 'react';
import styles from './MenuManagement.module.css'; // Reusing styles from MenuManagement

const MenuItemModal = ({ isOpen, onClose, onSave, itemData }) => {
  const [itemName, setItemName] = useState(itemData?.itemName || '');
  const [price, setPrice] = useState(itemData?.price || '');
  const [description, setDescription] = useState(itemData?.description || '');

  useEffect(() => {
    if (itemData) {
      setItemName(itemData.itemName);
      setPrice(itemData.price);
      setDescription(itemData.description);
    } else {
      setItemName('');
      setPrice('');
      setDescription('');
    }
  }, [itemData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemToSave = {
      itemName,
      price: parseFloat(price), // Ensure price is a number
      description,
    };
    if (itemData?.id) {
      itemToSave.id = itemData.id; // Preserve ID for updates
    }
    onSave(itemToSave);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{itemData ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="itemName">Item Name:</label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            ></textarea>
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>Save</button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
