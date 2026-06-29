import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/Checkout.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const Checkout = () => {
  const { all_product, cartItems, checkedItems, addToCart, removeFromCart, clearCheckedCart, fetchOrderItems } = useContext(ShopContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth-token");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
    },
  });

  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash, transfer
  const [transferType, setTransferType] = useState("later"); // instant, later

  // Get selected products
  const selectedProducts = all_product.filter(
    (product) => cartItems[product.id] > 0 && checkedItems[product.id] !== false
  );

  const getCheckedTotalAmount = () => {
    let total = 0;
    selectedProducts.forEach((product) => {
      total += product.new_price * cartItems[product.id];
    });
    return total;
  };

  useEffect(() => {
    if (!loading && selectedProducts.length === 0) {
      alert("Giỏ hàng thanh toán của bạn trống!");
      navigate("/cart");
    }
  }, [selectedProducts.length, loading, navigate]);

  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: {
            "auth-token": token,
          },
        });
        if (response.data.success) {
          const user = response.data.user;
          setProfile({
            name: user.name || "",
            phoneNumber: user.phoneNumber || "",
            address: {
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
            },
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!profile.phoneNumber) {
      alert("Vui lòng nhập số điện thoại xác nhận!");
      return;
    }
    if (!profile.address.street || !profile.address.city || !profile.address.state) {
      alert("Vui lòng nhập đầy đủ địa chỉ nhận hàng!");
      return;
    }

    if (paymentMethod === "transfer" && transferType === "instant") {
      alert("Chức năng chuyển khoản trực tiếp đang phát triển!");
      return;
    }

    setPlacingOrder(true);

    const orderedItems = {};
    selectedProducts.forEach((p) => {
      orderedItems[p.id] = cartItems[p.id];
    });

    const finalPaymentMethod = paymentMethod === "cash" 
      ? "Tiền mặt" 
      : "Chuyển khoản (Chờ nhận hàng mới chuyển khoản)";

    const requestData = {
      cart: orderedItems,
      totalPrice: getCheckedTotalAmount(),
      phoneNumber: profile.phoneNumber,
      address: profile.address,
      paymentMethod: finalPaymentMethod,
    };

    try {
      const response = await axios.post(`${API_URL}/addOrder`, requestData, {
        headers: {
          "auth-token": token,
        },
      });

      if (response.data.success) {
        alert("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
        // clearCheckedCart(); // Keep items in cart on purchase as per new request
        if (fetchOrderItems) {
          await fetchOrderItems();
        }
        navigate("/orderhistory");
      } else {
        alert("Đặt hàng thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Lỗi hệ thống khi đặt hàng!");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-loading">
        <h2>Đang tải thông tin thanh toán...</h2>
      </div>
    );
  }

  const isInstantTransfer = paymentMethod === "transfer" && transferType === "instant";

  return (
    <div className="checkout-container">
      <h1>Thanh Toán Đơn Hàng</h1>
      <div className="checkout-content">
        <form onSubmit={handleSubmitOrder} className="checkout-form">
          <div className="checkout-section">
            <h2>1. Thông tin liên hệ & Giao hàng</h2>
            <div className="checkout-form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                placeholder="Nhập họ và tên người nhận"
              />
            </div>
            <div className="checkout-form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="Số điện thoại liên lạc"
              />
            </div>
            <div className="checkout-form-group">
              <label>Số nhà, Tên đường (Thôn/Xóm)</label>
              <input
                type="text"
                name="address.street"
                value={profile.address.street}
                onChange={handleInputChange}
                required
                placeholder="Số nhà, ngõ ngách, tên đường..."
              />
            </div>
            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label>Quận / Huyện</label>
                <input
                  type="text"
                  name="address.city"
                  value={profile.address.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Quận/Huyện"
                />
              </div>
              <div className="checkout-form-group">
                <label>Tỉnh / Thành phố</label>
                <input
                  type="text"
                  name="address.state"
                  value={profile.address.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>2. Phương thức thanh toán</h2>
            <div className="payment-options">
              <label className={`payment-option-card ${paymentMethod === "cash" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                <div className="payment-option-info">
                  <span className="payment-title">Tiền mặt (COD)</span>
                  <span className="payment-desc">Thanh toán bằng tiền mặt khi nhận hàng.</span>
                </div>
              </label>

              <label className={`payment-option-card ${paymentMethod === "transfer" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="transfer"
                  checked={paymentMethod === "transfer"}
                  onChange={() => setPaymentMethod("transfer")}
                />
                <div className="payment-option-info">
                  <span className="payment-title">Chuyển khoản ngân hàng</span>
                  <span className="payment-desc">Chuyển khoản qua số tài khoản ngân hàng.</span>
                </div>
              </label>
            </div>

            {paymentMethod === "transfer" && (
              <div className="transfer-details-box">
                <h3>Chọn hình thức chuyển khoản:</h3>
                <div className="transfer-suboptions">
                  <label className="suboption-label">
                    <input
                      type="radio"
                      name="transferType"
                      value="instant"
                      checked={transferType === "instant"}
                      onChange={() => setTransferType("instant")}
                    />
                    <span>Chuyển khoản ngay (Direct Bank Transfer)</span>
                  </label>
                  <label className="suboption-label">
                    <input
                      type="radio"
                      name="transferType"
                      value="later"
                      checked={transferType === "later"}
                      onChange={() => setTransferType("later")}
                    />
                    <span>Chờ nhận hàng rồi mới chuyển khoản</span>
                  </label>
                </div>

                {transferType === "instant" && (
                  <div className="instant-transfer-warning">
                    <p>⚠️ <strong>Đang phát triển:</strong> Chức năng chuyển khoản trực tiếp (thanh toán online qua cổng ngân hàng/QR) hiện đang được phát triển. Vui lòng chọn "Chờ nhận hàng rồi mới chuyển khoản" hoặc "Tiền mặt" để tiếp tục đặt hàng.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={placingOrder || isInstantTransfer} 
            className={`checkout-submit-btn ${isInstantTransfer ? "disabled" : ""}`}
          >
            {placingOrder ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Tóm tắt đơn hàng ({selectedProducts.length})</h2>
          <hr />
          <div className="checkout-items-list">
            {selectedProducts.map((p) => (
              <div key={p.id} className="checkout-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                <img src={p.image} alt="" className="checkout-item-img" />
                <div className="checkout-item-detail" style={{ flex: 1 }}>
                  <span className="item-name">{p.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(p.id)} 
                      style={{ width: '22px', height: '22px', border: '1px solid #ccc', background: '#fff', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{cartItems[p.id]}</span>
                    <button 
                      type="button" 
                      onClick={() => addToCart(p.id, false)} 
                      style={{ width: '22px', height: '22px', border: '1px solid #ccc', background: '#fff', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '13px', color: '#666', marginLeft: '5px' }}>x {p.new_price}đ</span>
                  </div>
                </div>
                <span className="item-subtotal">{p.new_price * cartItems[p.id]}đ</span>
              </div>
            ))}
          </div>
          <hr />
          <div className="summary-totals">
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{getCheckedTotalAmount()}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span className="free-shipping">Miễn phí</span>
            </div>
            <hr />
            <div className="summary-row grand-total">
              <span>Tổng cộng</span>
              <span>{getCheckedTotalAmount()}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
