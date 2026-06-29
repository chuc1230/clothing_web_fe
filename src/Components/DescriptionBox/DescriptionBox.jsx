import React, { useState, useEffect, useContext } from "react";
import "./DescriptionBox.css";
import { ShopContext } from "../../Context/ShopContext";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const DescriptionBox = (props) => {
  const { product } = props;
  const { updateProductReviews } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  
  // Form states
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setReviews(product.reviews || []);
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert("Vui lòng điền họ tên!");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/product/${product.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          rating,
          comment: comment || "",
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Cảm ơn bạn đã gửi đánh giá!");
        setReviews(data.reviews);
        if (updateProductReviews) {
          updateProductReviews(product.id, data.reviews);
        }
        setName("");
        setRating(5);
        setComment("");
      } else {
        alert("Lỗi khi gửi đánh giá: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Đã xảy ra lỗi hệ thống khi gửi đánh giá!");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (num) => {
    return "★".repeat(num) + "☆".repeat(5 - num);
  };

  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div 
          className={`descriptionbox-nav-box ${activeTab === "description" ? "" : "fade"}`}
          onClick={() => setActiveTab("description")}
          style={{ cursor: "pointer" }}
        >
          Mô tả sản phẩm
        </div>
        <div 
          className={`descriptionbox-nav-box ${activeTab === "reviews" ? "" : "fade"}`}
          onClick={() => setActiveTab("reviews")}
          style={{ cursor: "pointer" }}
        >
          Đánh giá ({reviews.length})
        </div>
      </div>
      
      <div className="descriptionbox-description">
        {activeTab === "description" ? (
          <div>
            <p style={{ lineHeight: "1.6", fontSize: "16px", color: "#4a4a4a" }}>
              {product.description || "Sản phẩm này hiện chưa có mô tả chi tiết từ nhà sản xuất."}
            </p>
          </div>
        ) : (
          <div className="descriptionbox-reviews-section">
            <div className="reviews-list-container" style={{ marginBottom: "35px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Đánh giá từ khách hàng</h3>
              {reviews.length === 0 ? (
                <p style={{ color: "#777", fontStyle: "italic" }}>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {reviews.map((r, index) => (
                    <div 
                      key={index} 
                      className="review-item" 
                      style={{ 
                        borderBottom: "1px solid #f0f0f0", 
                        paddingBottom: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "15px", color: "#333" }}>{r.name}</strong>
                        <span style={{ fontSize: "12px", color: "#888" }}>{new Date(r.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <div style={{ color: "#ff9900", fontSize: "15px", fontWeight: "bold" }}>
                        {renderStars(r.rating)}
                      </div>
                      <p style={{ margin: "5px 0 0 0", color: "#555", fontSize: "14px", lineHeight: "1.4" }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr style={{ border: "0", height: "1px", background: "#e0e0e0", margin: "25px 0" }} />

            <form onSubmit={handleReviewSubmit} className="add-review-form" style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "500px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Viết đánh giá của bạn</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#555" }}>Họ tên của bạn</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Nhập họ tên" 
                  required
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#555" }}>Đánh giá số sao</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    outline: "none",
                    cursor: "pointer"
                  }}
                >
                  <option value="5">★★★★★ - 5 Sao (Tuyệt vời)</option>
                  <option value="4">★★★★☆ - 4 Sao (Tốt)</option>
                  <option value="3">★★★☆☆ - 3 Sao (Bình thường)</option>
                  <option value="2">★★☆☆☆ - 2 Sao (Kém)</option>
                  <option value="1">★☆☆☆☆ - 1 Sao (Rất kém)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#555" }}>Nội dung nhận xét</label>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (Tùy chọn)..." 
                  rows="4"
                  style={{
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  height: "45px",
                  background: "#ff4141",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  boxShadow: "0 4px 10px rgba(255, 65, 65, 0.15)"
                }}
                onMouseOver={(e) => e.target.style.background = "#e63030"}
                onMouseOut={(e) => e.target.style.background = "#ff4141"}
              >
                {submitting ? "Đang gửi..." : "GỬI ĐÁNH GIÁ"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionBox;
