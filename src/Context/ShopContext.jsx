import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
export const ShopContext = createContext(null);

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

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
        const orderResponse = await axios.get(`${API_URL}/orderItems`, {
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
    fetch(`${API_URL}/allproducts`)
      .then((response) => response.json())
      .then((data) => setAll_Product(data));

    if (localStorage.getItem('auth-token')) {
      fetch(`${API_URL}/getcart`, {
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

  const addToCart = (itemId, showAlert = false, size = "", color = "") => {
    const cartKey = (size || color) ? `${itemId}_${size}_${color}` : `${itemId}`;

    if (showAlert) {
      alert("Đã thêm vào giỏ hàng!");
    }

    setCartItems((prev) => ({ ...prev, [cartKey]: (prev[cartKey] || 0) + 1 }));
    setCheckedItems((prev) => ({ ...prev, [cartKey]: true })); // Auto check

    const token = localStorage.getItem('auth-token');
    
    if (token) {
        fetch(`${API_URL}/addtocart`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'auth-token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "itemId": cartKey })
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

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[cartKey] > 1) {
        updated[cartKey] -= 1;
      } else {
        delete updated[cartKey];
      }
      return updated;
    });
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_URL}/removefromcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": cartKey })
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error in removing from cart:", error));
    }
  };

  const deleteFromCart = (cartKey) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      delete updated[cartKey];
      return updated;
    });
    setCheckedItems((prev) => {
      const updated = { ...prev };
      delete updated[cartKey];
      return updated;
    });
    if (localStorage.getItem('auth-token')) {
      fetch(`${API_URL}/deletefromcart`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "itemId": cartKey })
      })
        .then((response) => response.json())
        .then((data) => console.log("Deleted:", data))
        .catch((error) => console.error("Error deleting from cart:", error));
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        const parts = key.split('_');
        const itemId = Number(parts[0]);
        const sizeName = parts[1] || "";
        
        let itemInfo = all_product.find(
          (product) => product.id === itemId
        );
        if (itemInfo) {
          let itemPrice = itemInfo.new_price;
          if (sizeName && itemInfo.sizes) {
            const matchedSize = itemInfo.sizes.find(s => s.size === sizeName);
            if (matchedSize) {
              itemPrice = matchedSize.new_price;
            }
          }
          totalAmount += itemPrice * cartItems[key];
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
      fetch(`${API_URL}/clearcart`, {
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
  
  const updateProductReviews = (productId, reviews) => {
    setAll_Product((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId ? { ...p, reviews: reviews } : p
      )
    );
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
    updateProductReviews,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
