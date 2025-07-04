import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import useParams
import styles from './DinerMenuView.module.css';
import { useAuth } from './AuthContext'; // Import useAuth
import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'; // Import Firestore functions
import { db } from './firebaseConfig'; // Import db

const DinerMenuView = () => {
  const { restaurantId, tableId } = useParams(); // Get restaurantId and tableId from URL params
  const { currentUser } = useAuth();
  const [restaurantName, setRestaurantName] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [view, setView] = useState('menu'); // 'menu', 'cart', 'summary'
  const [cart, setCart] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null); // To store the ID of the placed order
  const [isBillRequested, setIsBillRequested] = useState(false); // State for bill request button

  useEffect(() => {
    // Mock API call
    const fetchMenuData = () => {
      const mockData = {
        restaurantName: "Cline's Diner",
        menuItems: [
          { id: 'item1', itemName: 'Pizza', price: 15.00, description: 'Delicious pepperoni pizza.', orderIndex: 1 },
          { id: 'item2', itemName: 'Burger', price: 12.99, description: 'Classic beef burger with all the fixings.', orderIndex: 2 },
          { id: 'item3', itemName: 'Fries', price: 3.50, description: 'Crispy golden fries.', orderIndex: 3 },
          { id: 'item4', itemName: 'Milkshake', price: 5.00, description: 'Creamy vanilla milkshake.', orderIndex: 4 },
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

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem.quantity === 1) {
        return prevCart.filter(cartItem => cartItem.id !== itemId);
      }
      return prevCart.map(cartItem =>
        cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      );
    });
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      const orderData = {
        restaurantId: restaurantId,
        tableId: tableId,
        items: cart.map(item => ({
          id: item.id,
          itemName: item.itemName,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getTotalAmount(),
        status: 'Placed', // Initial status
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setCurrentOrderId(docRef.id); // Store the new order ID
      setView('summary'); // Switch to summary view
      setCart([]); // Clear cart after placing order
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const handleRequestBill = async () => {
    if (!currentOrderId) {
      alert("No order to request bill for.");
      return;
    }
    try {
      await updateDoc(doc(db, 'orders', currentOrderId), { status: 'Bill Requested' });
      setIsBillRequested(true);
      console.log(`Bill requested for order: ${currentOrderId}`);
    } catch (error) {
      console.error("Error requesting bill:", error);
      alert("Failed to request bill. Please try again.");
    }
  };

  const renderMenu = () => (
    <>
      {currentUser && (
        <div className={styles.dashboardLinkContainer}>
          <Link to="/dashboard" className={styles.dashboardButton}>Go to Dashboard</Link>
        </div>
      )}
      <h1 className={styles.header}>{restaurantName} ({tableId})</h1>
      <div className={styles.menuList}>
        {menuItems.map((item) => (
          <div key={item.id} className={styles.menuItem}>
            <div className={styles.itemInfo}>
              <h2 className={styles.itemName}>{item.itemName}</h2>
              <span className={styles.price}>৳{item.price.toFixed(2)}</span>
            </div>
            <p className={styles.description}>{item.description}</p>
            <button onClick={() => addToCart(item)} className={styles.addToCartButton}>Add to Cart</button>
          </div>
        ))}
      </div>
      <div className={styles.cartSummary}>
        <p>Items in cart: {cart.reduce((total, item) => total + item.quantity, 0)}</p>
        <p>Total: ৳{getTotalAmount().toFixed(2)}</p>
        <button onClick={() => setView('cart')} className={styles.viewCartButton} disabled={cart.length === 0}>
          View Cart ({cart.length})
        </button>
      </div>
    </>
  );

  const renderCart = () => (
    <>
      <h1 className={styles.header}>Your Cart</h1>
      <div className={styles.cartItems}>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <p>{item.itemName} (৳{item.price.toFixed(2)}) x {item.quantity}</p>
              <div className={styles.cartItemActions}>
                <button onClick={() => addToCart(item)}>+</button>
                <button onClick={() => removeFromCart(item.id)}>-</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className={styles.cartTotal}>
        <p>Total: ৳{getTotalAmount().toFixed(2)}</p>
      </div>
      <div className={styles.cartActions}>
        <button onClick={() => setView('menu')} className={styles.backToMenuButton}>Back to Menu</button>
        <button onClick={placeOrder} className={styles.placeOrderButton} disabled={cart.length === 0}>Place Order</button>
      </div>
    </>
  );

  const renderSummary = () => (
    <>
      <h1 className={styles.header}>Order Summary</h1>
      <div className={styles.summaryContent}>
        <p className={styles.orderStatus}>Your order has been sent!</p>
        <p className={styles.orderId}>Order ID: {currentOrderId}</p>
        <div className={styles.summaryItems}>
          <h3>Items Ordered:</h3>
          {cart.map((item, index) => (
            <p key={index}>{item.itemName} x {item.quantity} (৳{item.price.toFixed(2)} each)</p>
          ))}
        </div>
        <p className={styles.summaryTotal}>Total: ৳{getTotalAmount().toFixed(2)}</p>
        <button
          onClick={handleRequestBill}
          className={styles.requestBillButton}
          disabled={isBillRequested}
        >
          {isBillRequested ? 'Help is on the way...' : 'Request Bill'}
        </button>
      </div>
      <button onClick={() => setView('menu')} className={styles.newOrderButton}>Place New Order</button>
    </>
  );

  return (
    <div className={styles.container}>
      {view === 'menu' && renderMenu()}
      {view === 'cart' && renderCart()}
      {view === 'summary' && renderSummary()}
      <p className={styles.footer}>Powered by Menu.X</p>
    </div>
  );
};

export default DinerMenuView;
