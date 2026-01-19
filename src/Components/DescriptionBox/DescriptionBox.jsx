import React from "react";
import "./DescriptionBox.css";

const DescriptionBox = () => {
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        {/* <div className="descriptionbox-nav-box fade">Review (122)</div> */}
      </div>
      <div className="descriptionbox-description">
        <p>
          Phần này chưa làm được 
        </p>
      </div>
    </div>
  );
};

export default DescriptionBox;
