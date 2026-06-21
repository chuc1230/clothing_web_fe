import React from "react";
import "./Offers.css";
import exclusive_image from "../Assets/exclusive_image.png"
const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <h1>Ưu đãi</h1>
        <h1>Độc quyền cho bạn</h1>
        <p>CHỈ DÀNH CHO CÁC SẢN PHẨM BÁN CHẠY NHẤT</p>
        <button>Xem ngay</button>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt=""></img>
      </div>
    </div>
  );
};

export default Offers;
