import React, { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";
import "./CSS/ShopCategory.css"; // Reuse ShopCategory layout styles

const Search = () => {
  const { all_product } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortType, setSortType] = useState("date");

  // Filter products by search query matching name, category, subcategory, or detail_category
  const matchedProducts = all_product.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
      (item.detail_category && item.detail_category.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const getSortedProducts = (products) => {
    const sorted = [...products];
    if (sortType === "date") {
      sorted.sort((a, b) => b.id - a.id);
    } else if (sortType === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortType === "name_desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    } else if (sortType === "price_asc") {
      sorted.sort((a, b) => a.new_price - b.new_price);
    } else if (sortType === "price_desc") {
      sorted.sort((a, b) => b.new_price - a.new_price);
    }
    return sorted;
  };

  const sortedProducts = getSortedProducts(matchedProducts);

  return (
    <div className="shop-category">
      <div style={{ padding: "40px 170px 20px 170px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#333" }}>
          Kết quả tìm kiếm cho: <span style={{ color: "#ff4141" }}>"{query}"</span>
        </h2>
      </div>
      <div className="shopcategory-indexSort">
        <p>
          <span>Hiển thị 1-{Math.min(visibleCount, sortedProducts.length)}</span> trong số {sortedProducts.length} sản phẩm
        </p>
        <div className="shopcategory-sort" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Sắp xếp:</span>
          <select 
            value={sortType} 
            onChange={(e) => setSortType(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #c3c3c3',
              outline: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              background: '#fff'
            }}
          >
            <option value="date">Thời gian đăng bán</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>
      
      {sortedProducts.length === 0 ? (
        <div style={{ padding: "80px 0", textAlign: "center", fontSize: "18px", color: "#555", width: "100%" }}>
          Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="shopcategory-products">
          {sortedProducts.slice(0, visibleCount).map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
        </div>
      )}

      {sortedProducts.length > visibleCount && (
        <div className="shopcategory-loadmore" onClick={loadMore} style={{ cursor: "pointer" }}>
          xem thêm
        </div>
      )}
    </div>
  );
};

export default Search;
