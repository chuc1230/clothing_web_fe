import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import axios from "axios";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const { all_product, cartItems, removeFromCart, getTotalCartAmount, clearCart } = useContext(ShopContext);

  const handleCheckout = async () => {
    // Chuẩn bị dữ liệu để gửi
    const cartData = {};
    all_product.forEach((product) => {
      if (cartItems[product.id] > 0) {
        cartData[product.id] = cartItems[product.id];
      }
    });

    const requestData = {
      cart: cartData,
      totalPrice: getTotalCartAmount(),
    };

    try {
      // Gửi yêu cầu POST tới API /addOrder
      const response = await axios.post("https://clothing-web-be.onrender.com/addOrder", requestData, {
        headers: {
          "auth-token": localStorage.getItem("auth-token"), // Token xác thực từ LocalStorage
        },
      });

      if (response.data.success) {
        alert("Order Successfully! Have a nice day");
        console.log("Response:", response.data);

        // Clear the cart after successful order
        clearCart(); // This will reset the cartItems to an empty state
      } else {
        alert(`Order failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error in sending order:", error);
      alert("Order failed!");
    }
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img src={e.image} alt="" className="carticon-product-icon" />
                <p>{e.name}</p>
                <p>đ{e.new_price}</p>
                <button className="cartitems-quantity">
                  {cartItems[e.id]}
                </button>
                <p>đ{e.new_price * cartItems[e.id]}</p>
                <img
                  className="cartitems-remove-icon"
                  src={remove_icon}
                  onClick={() => removeFromCart(e.id)}
                  alt=""
                />
              </div>
            </div>
          );
        }
        return null;
      })}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>đ{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>đ{getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code"/>
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
