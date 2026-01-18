import React, { useContext } from "react";
import "./RelatedProducts.css";
import { ShopContext } from "../../Context/ShopContext";
import Item from "../Item/Item";
const RelatedProducts = ( {product}) => {
  const { all_product } = useContext(ShopContext);

  const filteredProducts = all_product
  .filter(item => item.category === product.category && item.id !== product.id)  // Lọc theo category và loại bỏ sản phẩm có id trùng
  .slice(0, 4);
  return (
    <div className="relatedproducts">
      <h1> Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {filteredProducts.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;
