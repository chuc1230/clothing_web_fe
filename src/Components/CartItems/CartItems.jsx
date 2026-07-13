import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import remove_icon from "../Assets/cart_cross_icon.png";

const CartItems = () => {
  const { 
    all_product, 
    cartItems, 
    addToCart,
    removeFromCart, 
    deleteFromCart, 
    checkedItems, 
    setCheckedItems 
  } = useContext(ShopContext);

  const navigate = useNavigate();

  // Find active cart items and parse composite keys
  const cartItemKeys = Object.keys(cartItems).filter(key => cartItems[key] > 0);
  const cartProducts = cartItemKeys.map(key => {
    const parts = key.split('_');
    const productId = Number(parts[0]);
    const size = parts[1] || "";
    const color = parts[2] || "";
    const product = all_product.find(p => p.id === productId);
    return {
      key, // unique identifier
      productId,
      size,
      color,
      quantity: cartItems[key],
      product
    };
  }).filter(item => item.product !== undefined);

  const cartProductIds = cartProducts.map((e) => e.key);
  
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
    cartProducts.forEach((item) => {
      if (checkedItems[item.key] !== false) {
        let itemPrice = item.product.new_price;
        if (item.size && item.product.sizes) {
          const matchedSize = item.product.sizes.find(s => s.size === item.size);
          if (matchedSize) {
            itemPrice = matchedSize.new_price;
          }
        }
        total += itemPrice * item.quantity;
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
        cartProducts.map((item) => {
          const isChecked = checkedItems[item.key] !== false;
          let itemPrice = item.product.new_price;
          if (item.size && item.product.sizes) {
            const matchedSize = item.product.sizes.find(s => s.size === item.size);
            if (matchedSize) {
              itemPrice = matchedSize.new_price;
            }
          }
          return (
            <div key={item.key}>
              <div className="cartitems-format cartitems-format-main">
                <input
                  type="checkbox"
                  className="cartitems-item-checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleCheck(item.key)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', margin: 'auto' }}
                />
                <Link to={`/product/${item.productId}`} className="cartitems-item-img-link">
                  <img src={item.product.image} alt="" className="carticon-product-icon" onClick={() => window.scrollTo(0, 0)} />
                </Link>
                <Link to={`/product/${item.productId}`} className="cartitems-item-title-link" style={{ textDecoration: 'none', color: '#454545' }} onClick={() => window.scrollTo(0, 0)}>
                  <p className="cartitems-product-title">
                    {item.product.name}
                    {(item.size || item.color) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#777', marginTop: '4px', flexWrap: 'wrap' }}>
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>|</span>}
                        {item.color && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Màu: {item.color}
                            {(() => {
                              const matchedColor = item.product.colors && item.product.colors.find(c => c.name === item.color);
                              return matchedColor && matchedColor.image ? (
                                <img src={matchedColor.image} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ccc' }} />
                              ) : null;
                            })()}
                          </span>
                        )}
                      </span>
                    )}
                  </p>
                </Link>
                <p className="cartitems-item-price" style={{ textAlign: 'center' }}>{itemPrice}đ</p>
                <div className="cartitems-quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => removeFromCart(item.key)} 
                    style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    onClick={() => addToCart(item.productId, false, item.size, item.color)} 
                    style={{ width: '28px', height: '28px', cursor: 'pointer', border: '1px solid #ccc', background: '#fff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>
                <p className="cartitems-item-total" style={{ textAlign: 'center' }}>{itemPrice * item.quantity}đ</p>
                <img
                  className="cartitems-remove-icon"
                  src={remove_icon}
                  onClick={() => deleteFromCart(item.key)}
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
