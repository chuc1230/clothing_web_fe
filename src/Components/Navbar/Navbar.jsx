"use client";
import React, { useContext, useRef } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link, useLocation } from 'react-router-dom';
import { ShopContext } from "../../Context/ShopContext";
import nav_dropdown from '../Assets/nav_dropdown.png';
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const location = useLocation();

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

  const getActiveMenu = () => {
    const path = location.pathname;
    if (path === '/') return "shop";
    if (path.startsWith('/mens')) return "men";
    if (path.startsWith('/womens')) return "women";
    if (path.startsWith('/kids')) return "kids";
    if (path.startsWith('/orderhistory')) return "orders";
    if (path.startsWith('/profile')) return "profile";
    return "";
  };

  const activeMenu = getActiveMenu();

  return (
    <div className="navbar">
      <Link to="/" style={{ textDecoration: "none" }} className="nav-logo">
        <img src={logo} alt="" />
        <p>Clothing store</p>
      </Link>
      <img className="nav-dropdown" onClick={dropdown_toggle} src={nav_dropdown} alt="" />
      <ul ref={menuRef} className="nav-menu">
        <li>
          <Link style={{ textDecoration: "none" }} to='/'>Trang chủ</Link>
          {activeMenu === "shop" ? <hr /> : <></>}
        </li>
        <li>
          <Link style={{ textDecoration: "none" }} to='/mens'>Nam</Link>
          {activeMenu === "men" ? <hr /> : <></>}
        </li>
        <li>
          <Link style={{ textDecoration: "none" }} to='/womens'>Nữ</Link>
          {activeMenu === "women" ? <hr /> : <></>}
        </li>
        <li>
          <Link style={{ textDecoration: "none" }} to='/kids'>Trẻ em</Link>
          {activeMenu === "kids" ? <hr /> : <></>}
        </li>
        {(userRole === 'admin' || userRole === 'super_admin') && (
          <li>
            <a style={{ textDecoration: "none", color: "#626262" }} href={`http://localhost:5173/?token=${token}`}>Admin</a>
          </li>
        )}
        {token && userRole !== 'super_admin' && (
          <li>
            <Link style={{ textDecoration: "none" }} to='/orderhistory'>Đơn hàng</Link>
            {activeMenu === "orders" ? <hr /> : <></>}
          </li>
        )}
      </ul>
      <div className="nav-login-cart">
        {token
          ? <button onClick={() => { localStorage.removeItem('auth-token'); window.location.replace('/') }}>Đăng xuất</button>
          : <Link to='/login'><button>Đăng nhập</button></Link>}

        <div className="nav-cart-container">
          <Link to='/cart'><img src={cart_icon} alt="" /></Link>
          <div className="nav-cart-count">{getTotalCartItems()}</div>
        </div>

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
