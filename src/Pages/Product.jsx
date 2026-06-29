import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrum from '../Components/Breadcrum/Breadcrum';
import ProductDisplay from '../Components/ProductDisplay/ProductDisplay';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Product = () => {
  const {all_product} = useContext(ShopContext);
  const {productId} = useParams();
  
  if (!all_product || all_product.length === 0) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", fontSize: "18px", color: "#555" }}>
        Đang tải thông tin sản phẩm...
      </div>
    );
  }

  const product = all_product.find((e) => e.id === Number(productId)); 

  if (!product) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center", fontSize: "18px", color: "#ff4141", fontWeight: "600" }}>
        Sản phẩm không tồn tại hoặc đã bị xóa!
      </div>
    );
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product}/>
      <DescriptionBox product={product}/>
      <RelatedProducts product={product}/>
    </div>
  )
}

export default Product