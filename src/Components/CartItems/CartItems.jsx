import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const { 
    all_product, 
    cartItems, 
    removeFromCart, 
    deleteFromCart, 
    checkedItems, 
    setCheckedItems 
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // Find active cart items
  const cartProducts = all_product.filter((e) => cartItems[e.id] > 0);
  const cartProductIds = cartProducts.map((e) => e.id);
  
  // Calculate checked items count
  const checkedProductIds = cartProductIds.filter((id) => checkedItems[id] !== false);
  const checkedCount = checkedProductIds.length;
  const allSelected = cartProductIds.length > 0 && checkedCount === cartProductIds.length;

  const handleSelectAll = () => {
    const updated = { ...checkedItems };
    cartProductIds.forEach((id) => {
      updated[id] = !allSelected;
    });
    setCheckedItems(updated);
  };

  const handleToggleCheck = (id) => {
    const isChecked = checkedItems[id] !== false;
    setCheckedItems((prev) => ({ ...prev, [id]: !isChecked }));
  };

  const handleDeleteSelected = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa các sản phẩm đã chọn khỏi giỏ hàng?")) {
      checkedProductIds.forEach((id) => {
        deleteFromCart(id);
      });
    }
  };

  const handleBuySelected = () => {
    if (checkedCount === 0) {
      alert("Vui lòng tích chọn sản phẩm muốn mua!");
      return;
    }
    navigate("/checkout");
  };

  // Calculate checked total amount
  const getCheckedTotalAmount = () => {
    let total = 0;
    cartProducts.forEach((product) => {
      if (checkedItems[product.id] !== false) {
        total += product.new_price * cartItems[product.id];
      }
    });
    return total;
  };

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <div className="cartitems-select-all-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            checked={allSelected} 
            onChange={handleSelectAll} 
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span>Tất cả</span>
        </div>
        <p>Sản phẩm</p>
        <p>Tên sản phẩm</p>
        <p style={{ textAlign: 'center' }}>Giá</p>
        <p style={{ textAlign: 'center' }}>Số lượng</p>
        <p style={{ textAlign: 'center' }}>Tổng cộng</p>
        <p style={{ textAlign: 'center' }}>Xóa bỏ</p>
      </div>
      <hr />
      {cartProducts.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", fontSize: "18px", color: "#555" }}>
          Giỏ hàng của bạn đang trống. <Link to="/" style={{ color: "#ff4141", textDecoration: "none", fontWeight: "bold" }}>Mua sắm ngay!</Link>
        </div>
      ) : (
        cartProducts.map((e) => {
          const isChecked = checkedItems[e.id] !== false;
          return (
            <div key={e.id}>
              <div className="cartitems-format cartitems-format-main">
                <input
                  type="checkbox"
                  className="cartitems-item-checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleCheck(e.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 'auto' }}
                />
                <Link to={`/product/${e.id}`} className="cartitems-item-img-link">
                  <img src={e.image} alt="" className="carticon-product-icon" onClick={() => window.scrollTo(0, 0)} />
                </Link>
                <Link to={`/product/${e.id}`} className="cartitems-item-title-link" style={{ textDecoration: 'none', color: '#454545' }} onClick={() => window.scrollTo(0, 0)}>
                  <p className="cartitems-product-title">{e.name}</p>
                </Link>
                <p className="cartitems-item-price" style={{ textAlign: 'center' }}>{e.new_price}đ</p>
                <div className="cartitems-quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => removeFromCart(e.id)} 
                    style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{cartItems[e.id]}</span>
                  <button 
                    onClick={() => addToCart(e.id, false)} 
                    style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>
                <p className="cartitems-item-total" style={{ textAlign: 'center' }}>{e.new_price * cartItems[e.id]}đ</p>
                <img
                  className="cartitems-remove-icon"
                  src={remove_icon}
                  onClick={() => removeFromCart(e.id)}
                  alt=""
                  style={{ cursor: 'pointer', margin: 'auto' }}
                />
              </div>
              <hr />
            </div>
          );
        })
      )}

      {checkedCount > 0 && (
        <div className="cartitems-actions-bar">
          <span className="cartitems-selected-count">
            Đã chọn <strong style={{ color: "#ff4141", fontSize: "18px" }}>{checkedCount}</strong> sản phẩm
          </span>
          <div className="cartitems-actions-buttons">
            <button className="cartitems-action-btn delete-btn" onClick={handleDeleteSelected}>
              Xóa khỏi giỏ hàng
            </button>
            <button className="cartitems-action-btn buy-btn" onClick={handleBuySelected}>
              Mua sản phẩm
            </button>
          </div>
        </div>
      )}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Tổng số giỏ hàng (Đã chọn)</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Tạm tính</p>
              <p>{getCheckedTotalAmount()}đ</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Phí vận chuyển</p>
              <p>Miễn phí</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Tổng cộng</h3>
              <h3>{getCheckedTotalAmount()}đ</h3>
            </div>
          </div>
          <button onClick={handleBuySelected}>MUA HÀNG</button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
