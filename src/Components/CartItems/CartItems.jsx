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

    if (Object.keys(cartData).length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    const requestData = {
      cart: cartData,
      totalPrice: getTotalCartAmount(),
    };

    try {
      // Gửi yêu cầu POST tới API /addOrder
      const response = await axios.post("http://localhost:4000/addOrder", requestData, {
        headers: {
          "auth-token": localStorage.getItem("auth-token"), // Token xác thực từ LocalStorage
        },
      });

      if (response.data.success) {
        alert("Đặt hàng thành công! Chúc bạn một ngày tốt lành.");
        console.log("Response:", response.data);

        // Clear the cart after successful order
        clearCart(); // This will reset the cartItems to an empty state
      } else {
        alert(`Đặt hàng thất bại: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error in sending order:", error);
      alert("Đặt hàng thất bại!");
    }
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Sản phẩm</p>
        <p>Tên sản phẩm</p>
        <p>Giá</p>
        <p>Số lượng</p>
        <p>Tổng cộng</p>
        <p>Xóa bỏ</p>
      </div>
      <hr />
      {all_product.map((e) => {
        if (cartItems[e.id] > 0) {
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <img src={e.image} alt="" className="carticon-product-icon" />
                <p>{e.name}</p>
                <p>{e.new_price}đ</p>
                <button className="cartitems-quantity">
                  {cartItems[e.id]}
                </button>
                <p>{e.new_price * cartItems[e.id]}đ</p>
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
          <h1>Tổng số giỏ hàng</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Tạm tính</p>
              <p>{getTotalCartAmount()}đ</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Phí vận chuyển</p>
              <p>Miễn phí</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Tổng cộng</h3>
              <h3>{getTotalCartAmount()}đ</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>TIẾN HÀNH THANH TOÁN</button>
        </div>
        <div className="cartitems-promocode">
          <p>Nếu bạn có mã giảm giá, hãy nhập vào đây</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="Mã giảm giá"/>
            <button>Áp dụng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
