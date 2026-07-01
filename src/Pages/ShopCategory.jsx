import React, { useContext, useState, useEffect } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";

// Empty State Component
const EmptyState = ({ onClear }) => {
  return (
    <div className="empty-state-container">
      <svg 
        className="empty-state-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <h3 className="empty-state-title">Không tìm thấy sản phẩm phù hợp</h3>
      <p className="empty-state-desc">
        Vui lòng thử thay đổi tiêu chí lọc hoặc xóa bộ lọc để tiếp tục mua sắm.
      </p>
      <button className="empty-state-clear-btn" onClick={onClear}>
        Xóa bộ lọc
      </button>
    </div>
  );
};

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [visibleCount, setVisibleCount] = useState(12);
  const [sortType, setSortType] = useState("date");

  // Filtering states
  const [selectedCategories, setSelectedCategories] = useState([props.category]);
  const [priceRange, setPriceRange] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync category state when navigating to different category pages via navbar
  useEffect(() => {
    setSelectedCategories([props.category]);
    setIsMobileFiltersOpen(false); // Close mobile filters when category changes
  }, [props.category]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const handleCustomPriceChange = (type, value) => {
    if (type === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
    setPriceRange("custom");
  };

  const clearFilters = () => {
    setSelectedCategories([props.category]);
    setPriceRange("all");
    setMinPrice("");
    setMaxPrice("");
  };

  const filteredProducts = all_product.filter((item) => {
    // 1. Filter by category
    const matchesCategory = selectedCategories.includes(item.category);
    if (!matchesCategory) return false;

    // 2. Filter by price range
    if (priceRange === "under200") {
      return item.new_price < 200000;
    } else if (priceRange === "200to500") {
      return item.new_price >= 200000 && item.new_price <= 500000;
    } else if (priceRange === "500to1000") {
      return item.new_price >= 500000 && item.new_price <= 1000000;
    } else if (priceRange === "over1000") {
      return item.new_price > 1000000;
    } else if (priceRange === "custom") {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      return item.new_price >= min && item.new_price <= max;
    }

    return true;
  });

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

  const sortedProducts = getSortedProducts(filteredProducts);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const isFiltersActive = 
    priceRange !== "all" || 
    minPrice || 
    maxPrice || 
    selectedCategories.length !== 1 || 
    selectedCategories[0] !== props.category;

  return (
    <div className="shop-category">
      <img className="shopcategory-banner" src={props.banner} alt="" />

      {/* Unified Top Filter Bar */}
      <div className="shopcategory-filter-container">
        
        {/* Mobile Toggle Button */}
        <div className="mobile-filter-bar">
          <button 
            className="mobile-filter-toggle-btn" 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ marginRight: '6px' }}
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Bộ lọc & Sắp xếp
          </button>
        </div>

        {/* Filter Content */}
        <div className={`shopcategory-filter-bar ${isMobileFiltersOpen ? "mobile-open" : ""}`}>
          
          {/* Target Audience: Box Selectors */}
          <div className="filter-section">
            <span className="filter-label">Đối tượng:</span>
            <div className="box-selectors">
              <button
                className={`box-selector-btn ${selectedCategories.includes("men") ? "active" : ""}`}
                onClick={() => toggleCategory("men")}
              >
                Nam
              </button>
              <button
                className={`box-selector-btn ${selectedCategories.includes("women") ? "active" : ""}`}
                onClick={() => toggleCategory("women")}
              >
                Nữ
              </button>
              <button
                className={`box-selector-btn ${selectedCategories.includes("kid") ? "active" : ""}`}
                onClick={() => toggleCategory("kid")}
              >
                Trẻ em
              </button>
            </div>
          </div>

          {/* Price Range: Pill Tags */}
          <div className="filter-section">
            <span className="filter-label">Khoảng giá:</span>
            <div className="pill-tags">
              <button
                className={`pill-tag-btn ${priceRange === "all" ? "active" : ""}`}
                onClick={() => {
                  setPriceRange("all");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Tất cả
              </button>
              <button
                className={`pill-tag-btn ${priceRange === "under200" ? "active" : ""}`}
                onClick={() => {
                  setPriceRange("under200");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Dưới 200k
              </button>
              <button
                className={`pill-tag-btn ${priceRange === "200to500" ? "active" : ""}`}
                onClick={() => {
                  setPriceRange("200to500");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                200k - 500k
              </button>
              <button
                className={`pill-tag-btn ${priceRange === "500to1000" ? "active" : ""}`}
                onClick={() => {
                  setPriceRange("500to1000");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                500k - 1M
              </button>
              <button
                className={`pill-tag-btn ${priceRange === "over1000" ? "active" : ""}`}
                onClick={() => {
                  setPriceRange("over1000");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                Trên 1M
              </button>
            </div>
          </div>

          {/* Custom Price Ranges */}
          <div className="filter-section">
            <span className="filter-label">Tự nhập:</span>
            <div className="custom-price-inputs">
              <input
                type="number"
                placeholder="Từ (đ)"
                value={minPrice}
                onChange={(e) => handleCustomPriceChange('min', e.target.value)}
              />
              <span className="dash">-</span>
              <input
                type="number"
                placeholder="Đến (đ)"
                value={maxPrice}
                onChange={(e) => handleCustomPriceChange('max', e.target.value)}
              />
            </div>
          </div>

          {/* Sort selection */}
          <div className="filter-section">
            <span className="filter-label">Sắp xếp:</span>
            <select 
              value={sortType} 
              onChange={(e) => setSortType(e.target.value)}
              className="filter-sort-select"
            >
              <option value="date">Thời gian đăng bán</option>
              <option value="name_asc">Tên A-Z</option>
              <option value="name_desc">Tên Z-A</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>

          {/* Reset button inside the filter bar */}
          {isFiltersActive && (
            <button className="clear-all-filters-btn" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Index sort showing count info */}
      <div className="shopcategory-indexSort">
        <p>
          <span>Hiển thị 1-{Math.min(visibleCount, sortedProducts.length)}</span> trong số {sortedProducts.length} sản phẩm
        </p>
      </div>

      {/* Products list area */}
      {sortedProducts.length === 0 ? (
        <EmptyState onClear={clearFilters} />
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
        <div className="shopcategory-loadmore" onClick={loadMore}>
          xem thêm
        </div>
      )}
    </div>
  );
};

export default ShopCategory;
