import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './AuthContext';
import styles from './LiveOrders.module.css';

const LiveOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Query orders for the current restaurant, excluding 'Completed' orders
    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', currentUser.uid),
      where('status', '!=', 'Completed'), // Filter out completed orders
      orderBy('status'), // Order by status to group 'Bill Requested'
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(), // Convert Firestore Timestamp to Date object
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching live orders:", err);
      setError("Failed to load live orders.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [currentUser]);

  const markOrderAsComplete = async (orderId) => {
    if (!currentUser) {
      alert('You must be logged in to mark orders as complete.');
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Completed' });
      console.log(`Order ${orderId} marked as Completed.`);
    } catch (err) {
      console.error('Error marking order as complete:', err);
      alert('Failed to mark order as complete.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading live orders...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!currentUser) {
    return <div className={styles.authRequired}>Please log in to view live orders.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Live Orders</h1>
      {orders.length === 0 && !loading ? (
        <p className={styles.noOrders}>No live orders at the moment.</p>
      ) : (
        <div className={styles.ordersGrid}>
          {orders.map(order => (
            <div key={order.id} className={`${styles.orderCard} ${order.status === 'Bill Requested' ? styles.billRequested : ''}`}>
              <h2>Table {order.tableId}</h2>
              <div className={styles.itemsList}>
                {order.items && order.items.map((item, index) => (
                  <p key={index}>{item.itemName} x {item.quantity}</p>
                ))}
              </div>
              <p className={styles.totalAmount}>Total: ৳{order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</p>
              {order.createdAt && (
                <p className={styles.createdAt}>
                  Ordered: {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}
                </p>
              )}
              <button onClick={() => markOrderAsComplete(order.id)} className={styles.completeButton}>
                Mark as Complete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveOrders;
