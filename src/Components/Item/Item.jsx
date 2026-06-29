import React from "react";
import "./Item.css";
import { Link } from "react-router-dom";

const Item = (props) => {
  return (
    <div className="item">
      <div className="item-img-container">
        <Link to={`/product/${props.id}`}>
          <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt="" />
        </Link>
      </div>
      <div className="item-name-container">
        <Link to={`/product/${props.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={() => window.scrollTo(0, 0)}>
          <p>{props.name}</p>
        </Link>
      </div>
      <div className="item-price-container">
        {props.new_price === props.old_price ? (
          <span className="item-price-new">{props.old_price}đ</span>
        ) : (
          <>
            <span className="item-price-new">{props.new_price}đ</span>
            <span className="item-price-old">{props.old_price}đ</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Item;
