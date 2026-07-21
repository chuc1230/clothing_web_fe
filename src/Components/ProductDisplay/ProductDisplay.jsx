import React, { useContext, useState, useEffect } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";

const ProductDisplay = (props) => {
  const { product } = props;
  const { addToCart } = useContext(ShopContext);
  
  const [mainImage, setMainImage] = useState(product?.image);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  
  useEffect(() => {
    if (product) {
      setMainImage(product.image);
      setSelectedSize(null);
      setSelectedColor(null);
    }
  }, [product]);

  useEffect(() => {
    if (selectedColor && selectedColor.image) {
      setMainImage(selectedColor.image);
    }
  }, [selectedColor]);

  if (!product) {
    return <div className="productdisplay-loading">Đang tải sản phẩm...</div>;
  }

  const imagesList = [product.image, ...(product.images || [])];
  
  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) 
    : 5;

  const isSizeObject = selectedSize && typeof selectedSize === 'object';
  const displayNewPrice = isSizeObject && selectedSize.new_price !== undefined ? selectedSize.new_price : product.new_price;
  const displayOldPrice = isSizeObject && selectedSize.old_price !== undefined ? selectedSize.old_price : product.old_price;

  const handleAddToCartClick = () => {
    const hasSizes = product.sizes && product.sizes.length > 0;
    const hasColors = product.colors && product.colors.length > 0;

    if (hasSizes && !selectedSize) {
      alert("Vui lòng chọn Kích thước trước khi thêm vào giỏ hàng!");
      return;
    }
    if (hasColors && !selectedColor) {
      alert("Vui lòng chọn Màu sắc trước khi thêm vào giỏ hàng!");
      return;
    }

    const sizeName = selectedSize ? (typeof selectedSize === 'object' ? selectedSize.size : selectedSize) : "";
    const colorName = selectedColor ? selectedColor.name : "";

    addToCart(product.id, true, sizeName, colorName);
  };

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
        {product.season && (
          <div className="productdisplay-season-tag" style={{
            display: 'inline-block',
            background: '#f3f4f6',
            color: '#4b5563',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '500',
            marginTop: '6px',
            marginBottom: '10px'
          }}>
            {product.season === 'Quanh năm' ? 'Phù hợp: Quanh năm' : `Bộ sưu tập: ${product.season}`}
          </div>
        )}
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
          {displayNewPrice === displayOldPrice ? (
            <div className="productdisplay-right-price-new">
              {displayOldPrice}đ
            </div>
          ) : (
            <>
              <div className="productdisplay-right-price-old">
                {displayOldPrice}đ
              </div>
              <div className="productdisplay-right-price-new">
                {displayNewPrice}đ
              </div>
            </>
          )}
        </div>


        {/* Khối A: Lựa chọn Màu sắc trực quan (Color Swatch) */}
        {product.colors && product.colors.length > 0 && (
          <div className="productdisplay-right-size" style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#3f3f3f', marginBottom: '8px' }}>
              Màu sắc: <span style={{ color: '#ff4141', fontWeight: '700' }}>{selectedColor ? selectedColor.name : 'Chưa chọn'}</span>
            </h2>
            <div className="productdisplay-right-sizes" style={{ display: 'flex', gap: '10px', margin: '10px 0', alignItems: 'center' }}>
              {product.colors.map((c, index) => {
                const isSelected = selectedColor && selectedColor.name === c.name;
                return (
                  <img
                    key={index}
                    src={c.image}
                    alt={c.name}
                    onClick={() => setSelectedColor(c)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: isSelected ? '3px solid #ff4141' : '1px solid #ccc',
                      boxShadow: isSelected ? '0 0 5px rgba(255, 65, 65, 0.4)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    }}
                    title={c.name}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Khối B: Lựa chọn Kích cỡ (Size Selection) */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="productdisplay-right-size" style={{ margin: '20px 0' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#3f3f3f', marginBottom: '8px' }}>
              Kích thước: <span style={{ color: '#ff4141', fontWeight: '700' }}>{selectedSize ? selectedSize.size : 'Chưa chọn'}</span>
            </h2>
            <div className="productdisplay-right-sizes" style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
              {product.sizes.map((s, index) => {
                const sizeName = typeof s === 'object' ? s.size : s;
                const isSelected = selectedSize && (typeof selectedSize === 'object' ? selectedSize.size === sizeName : selectedSize === s);
                return (
                  <div 
                    key={index} 
                    className={isSelected ? "active" : ""}
                    onClick={() => setSelectedSize(s)}
                    style={{ 
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #ff4141' : '1px solid #ddd',
                      backgroundColor: isSelected ? '#ff4141' : '#fff',
                      color: isSelected ? '#fff' : '#000',
                      padding: '8px 16px',
                      fontWeight: '600',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {sizeName}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Khối C: Bảng thông số gợi ý chọn Size (Size Guide Table) */}
        <div className="productdisplay-size-guide" style={{ margin: '20px 0', maxWidth: '400px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Size</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Chiều cao</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Cân nặng (kg)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#111827' }}>S</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>1m50 - 1m60</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>40 - 48kg</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#111827' }}>M</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>1m55 - 1m65</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>49 - 54kg</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#111827' }}>L</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>1m60 - 1m70</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>55 - 60kg</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#111827' }}>XL</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>1m65 - 1m75</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>61 - 70kg</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px', fontWeight: '600', color: '#111827' }}>XXL</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>1m70 - 1m80</td>
                <td style={{ padding: '6px 10px', color: '#4b5563' }}>71 - 82kg</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button onClick={handleAddToCartClick}>Thêm vào giỏ hàng</button>
        <p className="productdisplay-right-category"><span>Danh mục : </span>{product.category === "women" ? "Nữ" : product.category === "men" ? "Nam" : "Trẻ em"} </p>
        <p className="productdisplay-right-category"><span>Kho: </span>{product.stock !== undefined ? product.stock : 0}</p>
      </div>
    </div>
  );
};

export default ProductDisplay;
