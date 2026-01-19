import React from "react";
import "./NewsLetter.css";
const NewsLetter = () => {
  return (
    <div className="newsletter">
      <h1>Nhận ưu đãi độc quyền qua email</h1>
      <p>Đăng ký nhận bản tin của chúng tôi để luôn cập nhật thông tin mới nhất</p>
      <div>
        <input type="email" placeholder="Your Email " />
        <button>Subcribe</button>
      </div>
    </div>
  );
};

export default NewsLetter;
