import React, { useState, useEffect } from 'react';
import styles from './MenuManagement.module.css'; // Reusing styles from MenuManagement
import { getFunctions, httpsCallable } from 'firebase/functions'; // Import Firebase Functions
import { app } from './firebaseConfig'; // Import the app instance

const MenuItemModal = ({ isOpen, onClose, onSave, itemData }) => {
  const [itemName, setItemName] = useState(itemData?.itemName || '');
  const [price, setPrice] = useState(itemData?.price || '');
  const [description, setDescription] = useState(itemData?.description || '');
  const [isGenerating, setIsGenerating] = useState(false); // New state for AI button loading

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

  const handleGenerateDescription = async () => {
    if (!itemName) {
      alert("Please enter an Item Name before generating a description.");
      return;
    }

    setIsGenerating(true);
    try {
      const functions = getFunctions(app); // Get Firebase Functions instance
      const generateDescription = httpsCallable(functions, 'generateDescription'); // Reference your Cloud Function

      const result = await generateDescription({ itemName: itemName });
      setDescription(result.data.description); // Assuming the Cloud Function returns { description: "..." }
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={isGenerating || !itemName}
              className={styles.aiButton} // Add a class for styling
            >
              {isGenerating ? 'Generating...' : '✨ Write with AI'}
            </button>
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
