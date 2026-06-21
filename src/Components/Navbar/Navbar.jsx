"use client";
import React, { useState, useContext, useRef } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link } from 'react-router-dom';
import { ShopContext } from "../../Context/ShopContext";
import nav_dropdown from '../Assets/nav_dropdown.png';
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  const token = localStorage.getItem('auth-token');
  let userRole = "";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.user?.role || "";
    } catch (e) {
      console.error("Lỗi parse token:", e);
    }
  }

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" />
        <p>Cửa hàng quần áo</p>
      </div>
      <img className="nav-dropdown" onClick={dropdown_toggle} src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li
          onClick={() => {
            setMenu("shop");
          }}
        >
          <Link style={{ textDecoration: "none" }} to='/'>Cửa hàng</Link>{menu === "shop" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("men");
          }}
        >
          <Link style={{ textDecoration: "none" }} to='/mens'>Nam</Link>{menu === "men" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("women");
          }}
        >
          <Link style={{ textDecoration: "none" }} to='/womens'>Nữ</Link>{menu === "women" ? <hr /> : <></>}
        </li>
        <li
          onClick={() => {
            setMenu("kids");
          }}
        >
          <Link style={{ textDecoration: "none" }} to='/kids'>Trẻ em</Link>{menu === "kids" ? <hr /> : <></>}
        </li>
        {userRole === 'super_admin' && (
          <li>
            <a style={{ textDecoration: "none", color: "#626262" }} href="http://localhost:3000/">Admin</a>
          </li>
        )}
        {token && userRole !== 'super_admin' && (
          <li
            onClick={() => {
              setMenu("orders");
            }}
          >
            <Link style={{ textDecoration: "none" }} to='/orderhistory'>Đơn hàng</Link>{menu === "orders" ? <hr /> : <></>}
          </li>
        )}
      </ul>
      <div className="nav-login-cart">
        {token
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace('/') }}>Đăng xuất</button>
          : <Link to='/login'><button>Đăng nhập</button></Link>}

        <Link to='/cart'><img src={cart_icon} alt="" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>

        {token && userRole !== 'super_admin' && (
          <Link to='/profile' className="nav-avatar-link">
            <FaUserCircle size={35} className="nav-avatar-icon" title="Thông tin cá nhân" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
