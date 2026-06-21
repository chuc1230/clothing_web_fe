import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = 0;
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/allproducts')
      .then((response) => response.json())
      .then((data) => setAll_Product(data));

    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/getcart', {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
          'auth-token': `${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        },
        body: ""
      }).then((response) => response.json())
        .then((data) => setCartItems(data));
    }
    const fetchOrderItems = async () => {
      try {
        const token = localStorage.getItem('auth-token');  // Assuming token is stored in localStorage
        const orderResponse = await axios.get('http://localhost:4000/orderItems', {
          headers: {
            'auth-token': token,
          },
        });
        setOrderItems(orderResponse.data.orderItems);
      } catch (error) {
        console.error("Error fetching order history", error);
      } 
    };
    fetchOrderItems();
  }, []);

  // const addToCart = (itemId) => {
  //   setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
  //   if (localStorage.getItem('auth-token')) {
  //     console.log(itemId);
  //     fetch('http://localhost:4000/addtocart', {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/form-data',
  //         'auth-token': `${localStorage.getItem('auth-token')}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ "itemId": itemId })
  //     })
  //       .then((response) => response.json())
  //       .then((data) => console.log(data))
  //       .catch((error) => console.error("Lỗi khi thêm vào giỏ hàng:", error));
  //   }
  // };
const addToCart = (itemId) => {
    // Cập nhật state tại local ngay lập tức để tăng trải nghiệm người dùng (Optimistic UI)
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));

    const token = localStorage.getItem('auth-token');
    
    if (token) {
        fetch('http://localhost:4000/addtocart', {
            method: 'POST',
            headers: {
                // 'Accept': 'application/json' thông báo cho Server rằng Client muốn nhận JSON
                'Accept': 'application/json',
                'auth-token': token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "itemId": itemId })
        })
        .then((response) => {
            // Kiểm tra nếu phản hồi không phải JSON hoặc có lỗi HTTP (4xx, 5xx)
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
            // Nếu lỗi, bạn có thể hoàn tác (rollback) state cartItems ở đây nếu cần
        });
    } else {
        console.warn("Người dùng chưa đăng nhập, chỉ lưu giỏ hàng tạm thời.");
    }
};
  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem('auth-token')) {
      console.log(itemId);
      fetch('http://localhost:4000/removefromcart', {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
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

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = all_product.find(
          (product) => product.id === Number(item)
        );
        totalAmount += itemInfo.new_price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        totalItem += cartItems[item];
      }
    }
    return totalItem;
  };

  // Clear cart logic
  const clearCart = () => {
    setCartItems(getDefaultCart()); // Reset to the default cart state
    if (localStorage.getItem('auth-token')) {
      fetch('http://localhost:4000/clearcart', {
        method: 'POST',
        headers: {
          Accept: 'application/form-data',
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

  const contextValue = {
    all_product,
    cartItems,
    orderItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    clearCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
