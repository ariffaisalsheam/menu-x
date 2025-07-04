import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './QrCodeManager.module.css';
import QrCodeModal from './QrCodeModal'; // Import the new QrCodeModal component

const QrCodeManager = () => {
  const { currentUser } = useAuth();
  const [tables, setTables] = useState([]);
  const [newTableName, setNewTableName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTableUrl, setSelectedTableUrl] = useState('');
  const [selectedTableName, setSelectedTableName] = useState('');
  const qrCodeRef = useRef(null); // Ref for the QR code canvas

  const restaurantDocRef = currentUser ? doc(db, 'restaurants', currentUser.uid) : null;

  // Fetch tables from Firestore
  useEffect(() => {
    if (!restaurantDocRef) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(restaurantDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTables(data.tables || []); // 'tables' is an array field in the restaurant document
      } else {
        setTables([]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tables:", err);
      setError("Failed to load tables.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantDocRef]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim() || !currentUser) return;

    setLoading(true);
    try {
      await updateDoc(restaurantDocRef, {
        tables: arrayUnion(newTableName.trim()) // Add new table name to the array
      });
      setNewTableName(''); // Clear input
      console.log(`Table '${newTableName.trim()}' added.`);
    } catch (err) {
      console.error("Error adding table:", err);
      setError("Failed to add table.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableNameToDelete) => {
    if (!currentUser || !window.confirm(`Are you sure you want to delete table '${tableNameToDelete}'?`)) return;

    setLoading(true);
    try {
      await updateDoc(restaurantDocRef, {
        tables: arrayRemove(tableNameToDelete) // Remove table name from the array
      });
      console.log(`Table '${tableNameToDelete}' deleted.`);
    } catch (err) {
      console.error("Error deleting table:", err);
      setError("Failed to delete table.");
    } finally {
      setLoading(false);
    }
  };

  const handleShowQrCode = (tableName) => {
    if (!currentUser) {
      alert("Please log in to generate QR codes.");
      return;
    }
    // Construct the dynamic URL for the QR code
    const baseUrl = "https://menux-app.web.app/menu"; // Base URL for diner view
    const url = `${baseUrl}/${currentUser.uid}/${tableName.replace(/\s/g, '-')}`; // Use UID for restaurantId
    setSelectedTableUrl(url);
    setSelectedTableName(tableName);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTableUrl('');
    setSelectedTableName('');
  };

  if (loading) {
    return <div className={styles.loading}>Loading tables...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!currentUser) {
    return <div className={styles.authRequired}>Please log in to manage QR codes.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Table & QR Code Management</h1>

      <form onSubmit={handleAddTable} className={styles.addTableForm}>
        <input
          type="text"
          placeholder="New Table Name"
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          className={styles.tableNameInput}
          required
        />
        <button type="submit" className={styles.addTableButton}>Add Table</button>
      </form>

      {tables.length === 0 && !loading && (
        <p className={styles.noTables}>No tables added yet. Use the form above to add your first table.</p>
      )}

      <ul className={styles.tablesList}>
        {tables.map((table, index) => (
          <li key={index} className={styles.tableItem}>
            <span className={styles.tableName}>{table}</span>
            <div className={styles.tableActions}>
              <button onClick={() => handleShowQrCode(table)} className={styles.showQrButton}>Show QR Code</button>
              <button onClick={() => handleDeleteTable(table)} className={styles.deleteTableButton}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <QrCodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tableUrl={selectedTableUrl}
        tableName={selectedTableName}
        qrCodeRef={qrCodeRef}
      />
    </div>
  );
};

export default QrCodeManager;
