import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CSS/Checkout.css";
import qrCodeImage from "../Components/Assets/QR_MB.jpg";

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
  const [showQRModal, setShowQRModal] = useState(false);

  // Get selected products and parse composite keys
  const cartItemKeys = Object.keys(cartItems).filter(key => cartItems[key] > 0 && checkedItems[key] !== false);
  const selectedProducts = cartItemKeys.map(key => {
    const parts = key.split('_');
    const productId = Number(parts[0]);
    const size = parts[1] || "";
    const color = parts[2] || "";
    const product = all_product.find(p => p.id === productId);
    return {
      key, // unique key
      productId,
      size,
      color,
      quantity: cartItems[key],
      product
    };
  }).filter(item => item.product !== undefined);

  const getCheckedTotalAmount = () => {
    let total = 0;
    selectedProducts.forEach((item) => {
      let itemPrice = item.product.new_price;
      if (item.size && item.product.sizes) {
        const matchedSize = item.product.sizes.find(s => s.size === item.size);
        if (matchedSize) {
          itemPrice = matchedSize.new_price;
        }
      }
      total += itemPrice * item.quantity;
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

    setPlacingOrder(true);

    const orderedItems = {};
    selectedProducts.forEach((item) => {
      orderedItems[item.key] = item.quantity;
    });

    const finalPaymentMethod = paymentMethod === "cash" 
      ? "Tiền mặt" 
      : "Chuyển khoản";

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
        if (fetchOrderItems) {
          await fetchOrderItems();
        }
        if (paymentMethod === "transfer") {
          setShowQRModal(true);
        } else {
          alert("Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.");
          navigate("/orderhistory");
        }
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

  // const isInstantTransfer = false;

  return (
    <div className="checkout-container">
      <h1>Thanh Toán Đơn Hàng</h1>
      <div className="checkout-content">
        <form onSubmit={handleSubmitOrder} className="checkout-form">
          <div className="checkout-section">
            <h2>1. Thông tin liên hệ & Giao hàng</h2>
            <div className="checkout-form-group">
              <label>Họ và tên <span style={{ color: 'red' }}>*</span></label>
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
              <label>Số điện thoại <span style={{ color: 'red' }}>*</span></label>
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
              <label>Số nhà, Tên đường (Thôn/Xóm) <span style={{ color: 'red' }}>*</span></label>
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
                <label>Quận / Huyện <span style={{ color: 'red' }}>*</span></label>
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
                <label>Tỉnh / Thành phố <span style={{ color: 'red' }}>*</span></label>
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
            <p style={{ color: '#ff4d4f', fontSize: '13px', fontStyle: 'italic', marginTop: '12px', margin: '0' }}>
              (*): Bắt buộc điền thông tin
            </p>
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
                  <span className="payment-desc">Chuyển khoản qua quét mã QR ngân hàng.</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={placingOrder} 
            className="checkout-submit-btn"
          >
            {placingOrder ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Tóm tắt đơn hàng ({selectedProducts.length})</h2>
          <hr />
          <div className="checkout-items-list">
            {selectedProducts.map((item) => {
              let itemPrice = item.product.new_price;
              if (item.size && item.product.sizes) {
                const matchedSize = item.product.sizes.find(s => s.size === item.size);
                if (matchedSize) {
                  itemPrice = matchedSize.new_price;
                }
              }
              return (
                <div key={item.key} className="checkout-item-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
                  <img src={item.product.image} alt="" className="checkout-item-img" />
                  <div className="checkout-item-detail" style={{ flex: 1 }}>
                    <span className="item-name">{item.product.name}</span>
                    {(item.size || item.color) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#777', marginTop: '2px', flexWrap: 'wrap' }}>
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>|</span>}
                        {item.color && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Màu: {item.color}
                            {(() => {
                              const matchedColor = item.product.colors && item.product.colors.find(c => c.name === item.color);
                              return matchedColor && matchedColor.image ? (
                                <img src={matchedColor.image} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />
                              ) : null;
                            })()}
                          </span>
                        )}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(item.key)} 
                        style={{ width: '22px', height: '22px', border: '1px solid #ccc', background: '#fff', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.quantity}</span>
                      <button 
                        type="button" 
                        onClick={() => addToCart(item.productId, false, item.size, item.color)} 
                        style={{ width: '22px', height: '22px', border: '1px solid #ccc', background: '#fff', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                      <span style={{ fontSize: '13px', color: '#666', marginLeft: '5px' }}>x {itemPrice}đ</span>
                    </div>
                  </div>
                  <span className="item-subtotal">{itemPrice * item.quantity}đ</span>
                </div>
              );
            })}
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
      {showQRModal && (
        <div className="checkout-qr-modal-overlay">
          <div className="checkout-qr-modal-card">
            <div className="checkout-qr-modal-header">
              <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
              <p>Vui lòng quét mã QR bên dưới để thực hiện chuyển khoản thanh toán</p>
            </div>
            <div className="checkout-qr-image-container">
              <img src={qrCodeImage} alt="QR Code" className="checkout-qr-img" />
            </div>
            <div className="checkout-qr-details">
              <div className="checkout-qr-details-row">
                <span>Ngân hàng:</span>
                <span>MB Bank</span>
              </div>
              <div className="checkout-qr-details-row">
                <span>Tên chủ tài khoản:</span>
                <span>SHOP CLOTHING</span>
              </div>
              <div className="checkout-qr-details-row">
                <span>Số tài khoản:</span>
                <span>20039999799999</span>
              </div>
              <div className="checkout-qr-details-row total-row">
                <span>Số tiền cần thanh toán:</span>
                <span>{getCheckedTotalAmount()}đ</span>
              </div>
            </div>
            <button className="checkout-qr-btn" onClick={() => {
              setShowQRModal(false);
              alert("Đã xác nhận hình thức chuyển khoản. Đơn hàng của bạn đang được xử lý.");
              navigate("/orderhistory");
            }}>
              Tôi đã chuyển khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
