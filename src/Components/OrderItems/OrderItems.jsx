import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../../Context/ShopContext";
import { Pagination, Modal } from "antd";
import "./OrderItems.css";
import { FiEye } from "react-icons/fi";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const OrderItems = () => {
  const [current, setCurrent] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orderItems, all_product, fetchOrderItems } = useContext(ShopContext);
  const pageSize = 5;

  useEffect(() => {
    if (fetchOrderItems) {
      fetchOrderItems();
    }
  }, []);

  const getProductNameById = (productId) => {
    const product = all_product.find((prod) => prod.id === parseInt(productId));
    return product ? product.name : "Sản phẩm không tồn tại";
  };

  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Handle page change
  const onPageChange = (page) => {
    setCurrent(page);
  };

  // Paginate the orderItems array
  const startIndex = (current - 1) * pageSize;
  const paginatedOrderItems = orderItems.slice(
    startIndex,
    startIndex + pageSize
  );

  const getStatusBadge = (status) => {
    const s = status || "Chờ shop đóng hàng";
    let bg = "#fff7e6";
    let color = "#d46b08";
    let border = "1px solid #ffd591";
    
    if (s === "Đang ship") {
      bg = "#e6f7ff";
      color = "#0050b3";
      border = "1px solid #91d5ff";
    } else if (s === "Đã thanh toán") {
      bg = "#f6ffed";
      color = "#389e0d";
      border = "1px solid #b7eb8f";
    } else if (s === "Đã hủy") {
      bg = "#fff1f0";
      color = "#cf1322";
      border = "1px solid #ffa39e";
    }
    
    return (
      <span style={{ 
        background: bg, 
        color: color, 
        border: border, 
        padding: "6px 12px", 
        borderRadius: "20px", 
        fontSize: "13px",
        fontWeight: "bold",
        display: "inline-block"
      }}>
        {s}
      </span>
    );
  };

  const handleCancelOrder = async (orderDate) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      return;
    }
    try {
      const token = localStorage.getItem("auth-token");
      if (!token) return;

      const response = await fetch(`${API_URL}/cancelOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
        body: JSON.stringify({ orderDate }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Hủy đơn hàng thành công!");
        setIsModalOpen(false);
        if (fetchOrderItems) {
          await fetchOrderItems();
        }
      } else {
        alert("Hủy đơn hàng thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Đã xảy ra lỗi khi hủy đơn hàng!");
    }
  };

  return (
    <div className="orderitems">
      <div className="orderitems-format-main">
        <p>STT</p>
        <p>Ngày đặt hàng</p>
        <p>Số lượng</p>
        <p>Tổng tiền</p>
        <p>Trạng thái</p>
        <p>Chi tiết</p>
      </div>
      <hr />
      {orderItems.length === 0 ? (
        <p style={{ textAlign: "center", padding: "40px", fontSize: "16px" }}>Bạn chưa có đơn hàng nào.</p>
      ) : (
        <>
          {paginatedOrderItems.map((order, index) => (
            <div key={order._id}>
              <div className="orderitems-format orderitems-format-main">
                <p>{startIndex + index + 1}</p>
                <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                <p>
                  <button className="orderitems-quantity">
                    {Object.values(order.cart).reduce(
                      (total, quantity) => total + quantity,
                      0
                    )}
                  </button>
                </p>
                <p>{order.totalPrice}đ</p>
                <p>{getStatusBadge(order.status)}</p>
                <p>
                  <FiEye className="icon" onClick={()=> showModal(order)} style={{ cursor: "pointer", fontSize: "20px" }} />
                </p>
              </div>
              <hr />
            </div>
          ))}
        </>
      )}
      <Pagination
        current={current}
        total={orderItems.length}
        pageSize={pageSize}
        onChange={onPageChange}
        align="center"
      />
      <Modal
        title="Chi tiết đơn hàng"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
            <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
            <p><strong>Tổng tiền:</strong> <strong style={{ color: '#ff4141' }}>{selectedOrder.totalPrice}đ</strong></p>
            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || "Tiền mặt"}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.phoneNumber || "Không có"}</p>
            <p>
              <strong>Địa chỉ giao hàng:</strong>{" "}
              {selectedOrder.address 
                ? `${selectedOrder.address.street || ""}, ${selectedOrder.address.city || ""}, ${selectedOrder.address.state || ""}` 
                : "Không có"}
            </p>
            {(!selectedOrder.status || selectedOrder.status === "Chờ shop đóng hàng") && (
              <button 
                onClick={() => handleCancelOrder(selectedOrder.orderDate)}
                style={{
                  background: '#ff4d4f',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  marginTop: '10px',
                  width: 'fit-content',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#d9363e'}
                onMouseOut={(e) => e.target.style.background = '#ff4d4f'}
              >
                Hủy đơn hàng
              </button>
            )}
            <hr style={{ border: '0', height: '1px', background: '#eee' }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Sản phẩm trong đơn hàng:</h3>
            <ul>
              {Object.entries(selectedOrder.cart).map(
                ([productId, quantity]) => (
                  <li key={productId} style={{ margin: '6px 0' }}>
                    <strong>{getProductNameById(productId)}</strong>: Số lượng {quantity}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderItems;
