import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  
  const [mainImage, setMainImage] = useState(product?.image);
  
  useEffect(() => {
    if (product) {
      setMainImage(product.image);
    }
  }, [product]);

  if (!product) {
    return <div className="productdisplay-loading">Đang tải sản phẩm...</div>;
  }

  const imagesList = [product.image, ...(product.images || [])];
  
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) 
    : 5;

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-container">
          <div className="productdisplay-main-img-wrapper">
            <img className="productdisplay-main-img" src={mainImage || product.image} alt="" />
          </div>
          <div className="productdisplay-thumbnails-below">
            {imagesList.map((imgUrl, index) => (
              <img 
                key={index} 
                src={imgUrl} 
                alt="" 
                onClick={() => setMainImage(imgUrl)}
                className={`productdisplay-thumbnail-item ${mainImage === imgUrl ? "active-thumbnail" : ""}`}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <img 
              key={star} 
              src={star <= Math.round(avgRating) ? star_icon : star_dull_icon} 
              alt="" 
            />
          ))}
          <p>({reviews.length})</p>
        </div>
        <div className="productdisplay-right-prices">
          {product.new_price === product.old_price ? (
            <div className="productdisplay-right-price-new">
              {product.old_price}đ
            </div>
          ) : (
            <>
              <div className="productdisplay-right-price-old">
                {product.old_price}đ
              </div>
              <div className="productdisplay-right-price-new">
                {product.new_price}đ
              </div>
            </>
          )}
        </div>
        <div className="productdisplay-right-description">
          {product.description || "Sản phẩm chưa có mô tả chi tiết."}
        </div>
        <div className="productdisplay-right-size">
            <h1>Chọn Size</h1>
            <div className="productdisplay-right-sizes">
                <div>S</div>
                <div>M</div>
                <div>L</div>    
                <div>XL</div>
                <div>XXL</div>
            </div>
        </div>
        <button onClick={()=> {addToCart(product.id, true)}}>Thêm vào giỏ hàng</button>
        <p className="productdisplay-right-category"><span>Danh mục : </span>{product.category === "women" ? "Nữ" : product.category === "men" ? "Nam" : "Trẻ em"} </p>
        <p className="productdisplay-right-category"><span>Từ khóa : </span>Hiện đại, Mới nhất </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
