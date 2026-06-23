import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
export const ShopContext = createContext(null);

const getDefaultCart = () => {
  return {};
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [orderItems, setOrderItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  const fetchOrderItems = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const orderResponse = await axios.get('http://localhost:4000/orderItems', {
          headers: {
            'auth-token': token,
          },
        });
        if (orderResponse.data.success) {
          setOrderItems(orderResponse.data.orderItems);
        }
      }
    } catch (error) {
      console.error("Error fetching order history", error);
    }
  };

  useEffect(() => {
    fetch('http://localhost:4000/allproducts')
      .then((response) => response.json())
      .then((data) => setAll_Product(data));

    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/getcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: ""
      }).then((response) => response.json())
        .then((data) => {
          // Filter out zero quantities if any exist in the database from older sessions
          const cleanCart = {};
          for (const key in data) {
            if (data[key] > 0) {
              cleanCart[key] = data[key];
            }
          }
          setCartItems(cleanCart);
        });

      fetchOrderItems();
    }
  }, []);

  const addToCart = (itemId, showAlert = false) => {
    if (showAlert) {
      const isAlreadyInCart = cartItems[itemId] && cartItems[itemId] > 0;
      alert("Đã thêm vào giỏ hàng!");
      if (isAlreadyInCart) {
        return;
      }
    }

    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    setCheckedItems((prev) => ({ ...prev, [itemId]: true })); // Auto check

    const token = localStorage.getItem('auth-token');
    
    if (token) {
        fetch('http://localhost:4000/addtocart', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'auth-token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "itemId": itemId })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            console.log("Thành công:", data);
        })
        .catch((error) => {
            console.error("Lỗi khi thêm vào giỏ hàng:", error);
        });
    } else {
        console.warn("Người dùng chưa đăng nhập, chỉ lưu giỏ hàng tạm thời.");
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/removefromcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId })
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error in removing from cart:", error));
    }
  };

  const deleteFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    setCheckedItems((prev) => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/deletefromcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": itemId })
      })
        .then((response) => response.json())
        .then((data) => console.log("Deleted:", data))
        .catch((error) => console.error("Error deleting from cart:", error));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.new_price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += 1; // Count unique products only!
      }
    }
    return totalItem;
  };

  const clearCart = () => {
    setCartItems(getDefaultCart());
    setCheckedItems({});
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/clearcart', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })
        .then((response) => response.json())
        .then((data) => console.log("Cart cleared:", data))
        .catch((error) => console.error("Lỗi khi xóa giỏ hàng:", error));
    }
  };

  const clearCheckedCart = () => {
    setCartItems((prev) => {
      const updated = { ...prev };
      for (const itemId in checkedItems) {
        if (checkedItems[itemId] !== false) {
          delete updated[itemId];
        }
      }
      return updated;
    });
    setCheckedItems({});
  };

  const contextValue = {
    all_product,
    cartItems,
    orderItems,
    checkedItems,
    setCheckedItems,
    fetchOrderItems,
    addToCart,
    removeFromCart,
    deleteFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    clearCart,
    clearCheckedCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
