import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useAuth } from './AuthContext';
import styles from './MenuManagement.module.css';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MenuItemModal from './MenuItemModal'; // Import the new MenuItemModal component

// Drag and Drop Item Type
const ItemTypes = {
  MENU_ITEM: 'menu_item',
};

// Draggable Menu Item Component
const DraggableMenuItem = ({ item, index, moveItem, openEditModal, deleteMenuItem }) => {
  const ref = React.useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.MENU_ITEM,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(itemBeingDragged, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = itemBeingDragged.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations in render functions and side effects,
      // but for the sake of performance in dnd it's acceptable.
      itemBeingDragged.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MENU_ITEM,
    item: () => {
      return { id: item.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} className={styles.menuItem} style={{ opacity }} data-handler-id={handlerId}>
      <div className={styles.itemInfo}>
        <h3 className={styles.itemName}>{item.itemName}</h3>
        <span className={styles.itemPrice}>৳{item.price.toFixed(2)}</span>
      </div>
      <p className={styles.itemDescription}>{item.description}</p>
      <div className={styles.itemActions}>
        <button onClick={() => openEditModal(item)} className={styles.editButton}>Edit</button>
        <button onClick={() => deleteMenuItem(item.id)} className={styles.deleteButton}>Delete</button>
      </div>
    </div>
  );
};

const MenuManagement = () => {
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // For edit operations

  // Firestore reference for user's menu items
  const menuCollectionRef = currentUser ? collection(db, `restaurants/${currentUser.uid}/menuItems`) : null;

  // Fetch menu items from Firestore
  useEffect(() => {
    // If there's no user, we can't fetch anything.
    // Set loading to false and stop.
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const menuItemsCollectionRef = collection(db, 'restaurants', currentUser.uid, 'menuItems');
    const q = query(menuItemsCollectionRef, orderBy('orderIndex'));

    // onSnapshot sets up the real-time listener.
    // It automatically gives you the latest data when it changes on the server.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching menu items:", err);
      setError("Failed to load menu items.");
      setLoading(false);
    });

    // This is the cleanup function that runs when the component unmounts.
    // It's a critical best practice to prevent memory leaks.
    return () => {
      unsubscribe();
    };
  }, [currentUser]); // <-- THE CORRECTED DEPENDENCY ARRAY

  // Handle drag and drop reordering
  const moveItem = useCallback((dragIndex, hoverIndex) => {
    const dragItem = menuItems[dragIndex];
    const newItems = [...menuItems];
    newItems.splice(dragIndex, 1);
    newItems.splice(hoverIndex, 0, dragItem);
    setMenuItems(newItems);
  }, [menuItems]);

  const updateOrderInFirestore = useCallback(async (updatedItems) => {
    if (!menuCollectionRef) return;
    try {
      const batch = writeBatch(db); // Import writeBatch from 'firebase/firestore'
      updatedItems.forEach((item, i) => {
        // Only update if orderIndex changed
        if (item.orderIndex !== i) {
          const itemRef = doc(db, `restaurants/${currentUser.uid}/menuItems`, item.id);
          batch.update(itemRef, { orderIndex: i });
        }
      });
      await batch.commit();
      console.log('Menu item order updated in Firestore.');
    } catch (err) {
      console.error('Error updating order in Firestore:', err);
      alert('Failed to update item order.');
    }
  }, [menuCollectionRef, currentUser]); // Dependencies for useCallback


  // CRUD Operations
  const openAddModal = () => {
    setCurrentItem(null); // Clear item for add mode
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setCurrentItem(item); // Set item for edit mode
    setIsModalOpen(true);
  };

  const closeItemModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  const saveMenuItem = async (itemData) => {
    if (!currentUser) {
      alert('You must be logged in to manage menu items.');
      return;
    }
    setLoading(true);
    try {
      if (itemData.id) {
        // Update existing item
        await updateDoc(doc(db, `restaurants/${currentUser.uid}/menuItems`, itemData.id), itemData);
        console.log('Menu item updated:', itemData.id);
      } else {
        // Add new item
        // Assign a temporary orderIndex (will be re-indexed on next fetch/reorder)
        const newOrderIndex = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.orderIndex)) + 1 : 0;
        await addDoc(collection(db, `restaurants/${currentUser.uid}/menuItems`), { ...itemData, orderIndex: newOrderIndex });
        console.log('New menu item added.');
      }
      closeItemModal();
    } catch (err) {
      console.error('Error saving menu item:', err);
      setError('Failed to save menu item.');
    } finally {
      setLoading(false);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!currentUser) {
      alert('You must be logged in to delete menu items.');
      return;
    }
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, `restaurants/${currentUser.uid}/menuItems`, itemId));
        console.log('Menu item deleted:', itemId);
      } catch (err) {
        console.error('Error deleting menu item:', err);
        setError('Failed to delete menu item.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading menu...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!currentUser) {
    return <div className={styles.authRequired}>Please log in to manage your menu.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.container}>
        <h1 className={styles.title}>My Menu</h1>
        <button onClick={openAddModal} className={styles.addButton}>+ Add New Item</button>

        <div className={styles.menuList}>
          {menuItems.length === 0 && !loading ? (
            <p className={styles.noItems}>No menu items yet. Click "Add New Item" to start!</p>
          ) : (
            menuItems.map((item, index) => (
              <DraggableMenuItem
                key={item.id}
                item={item}
                index={index}
                moveItem={moveItem}
                openEditModal={openEditModal}
                deleteMenuItem={deleteMenuItem}
              />
            ))
          )}
        </div>
      </div>
      {/* MenuItemModal will be rendered here */}
      {isModalOpen && (
        <MenuItemModal
          isOpen={isModalOpen}
          onClose={closeItemModal}
          onSave={saveMenuItem}
          itemData={currentItem}
        />
      )}
    </DndProvider>
  );
};

export default MenuManagement;
