import React, { useContext, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import { Pagination, Modal } from "antd";
import "./OrderItems.css";
import { FiEye } from "react-icons/fi";

const OrderItems = () => {
  const [current, setCurrent] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { orderItems, all_product } = useContext(ShopContext);
  const pageSize = 5;

  const getProductNameById = (productId) => {
    const product = all_product.find((prod) => prod.id === parseInt(productId));
    return product ? product.name : "Product Not Found";
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

  return (
    <div className="orderitems">
      <div className="orderitems-format-main">
        <p>ID</p>
        <p>Order Date</p>
        <p>Quantity</p>
        <p>Total Price</p>
        <p>Details</p>
      </div>
      <hr />
      {orderItems.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <>
          {paginatedOrderItems.map((order, index) => (
            <div key={order._id}>
              <div className="orderitems-format orderitems-format-main">
                <p>{index + 1}</p>
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
                <p>
                  <FiEye className="icon" onClick={()=> showModal(order)} />
                </p>
              </div>
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
        title="Order Details"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedOrder && (
          <div>
            <h3>
              Order Date:{" "}
              {new Date(selectedOrder.orderDate).toLocaleDateString()}
            </h3>
            <h3>Total Price: {selectedOrder.totalPrice}đ</h3>
            <h3>Items in this order:</h3>
            <ul>
              {Object.entries(selectedOrder.cart).map(
                ([productId, quantity]) => (
                  <li key={productId}>
                    <strong>{getProductNameById(productId)}</strong>: {quantity}
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
