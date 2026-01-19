import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";
const Popular = () => {
  
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(()=>{
    fetch('https://clothing-web-be.onrender.com/popularinwomen')
    .then((response)=>response.json())
    .then((data)=>setPopularProducts(data));
  },[])
  
  return (
    <div className="popular">
      <h1>Phổ biến cho Phụ nữ</h1>
      <hr />
      <div className="popular-item">
        {popularProducts.map((item, i) => {
          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            ></Item>
          );
        })}
      </div>
    </div>
  );
};

export default Popular;
