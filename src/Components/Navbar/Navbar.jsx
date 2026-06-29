"use client";
import React, { useContext, useRef, useState } from "react";
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from "../../Context/ShopContext";
import nav_dropdown from '../Assets/nav_dropdown.png';
import { FaUserCircle, FaSearch } from "react-icons/fa";

const ADMIN_URL = (import.meta.env.VITE_ADMIN_URL || "http://localhost:5173").replace(/\/$/, "");

const Navbar = () => {
  const { getTotalCartItems, all_product } = useContext(ShopContext);
  const menuRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = all_product && searchQuery.trim()
    ? all_product.filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (!token) return;

    const iframe = document.createElement("iframe");
    iframe.src = `${ADMIN_URL}/?auth_bridge=1`;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const listener = (event) => {
      if (event.origin === ADMIN_URL) {
        if (event.data === "AUTH_READY") {
          iframe.contentWindow.postMessage(
            { type: "AUTH_TOKEN", token: token },
            ADMIN_URL
          );
        } else if (event.data === "AUTH_SUCCESS") {
          window.location.href = `${ADMIN_URL}/`;
          cleanup();
        }
      }
    };

    const cleanup = () => {
      window.removeEventListener("message", listener);
      document.body.removeChild(iframe);
    };

    window.addEventListener("message", listener);
  };

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
            <a style={{ textDecoration: "none", color: "#626262" }} href={`${ADMIN_URL}/`} onClick={handleAdminClick}>Admin</a>
          </li>
        )}
        {token && userRole !== 'super_admin' && (
          <li>
            <Link style={{ textDecoration: "none" }} to='/orderhistory'>Đơn hàng</Link>
            {activeMenu === "orders" ? <hr /> : <></>}
          </li>
        )}
      </ul>
      <div className="nav-search-container" style={{ position: 'relative' }}>
        <form onSubmit={handleSearchSubmit} className="nav-search-form" style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '20px', padding: '6px 12px', margin: '0 15px', border: '1px solid #e0e0e0' }}>
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Tìm kiếm sản phẩm..." 
             style={{ border: 'none', background: 'none', outline: 'none', width: '160px', fontSize: '14px' }} 
           />
           <button type="submit" style={{ border: 'none', background: 'none', outline: 'none', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 2px' }}>
             <FaSearch style={{ color: '#888' }} />
           </button>
        </form>
        {suggestions.length > 0 && (
           <div className="nav-search-suggestions" style={{
             position: 'absolute',
             top: '100%',
             left: '15px',
             right: '15px',
             background: '#fff',
             border: '1px solid #ddd',
             borderRadius: '8px',
             boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
             zIndex: 1000,
             maxHeight: '200px',
             overflowY: 'auto',
             marginTop: '5px'
           }}>
             {suggestions.map((item, idx) => (
               <div 
                 key={idx}
                 onClick={() => {
                   setSearchQuery("");
                   navigate(`/product/${item.id}`);
                 }}
                 style={{
                   padding: '10px 15px',
                   cursor: 'pointer',
                   fontSize: '14px',
                   borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #eee',
                   whiteSpace: 'nowrap',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis',
                   color: '#333'
                 }}
                 onMouseOver={(e) => e.target.style.background = '#f5f5f5'}
                 onMouseOut={(e) => e.target.style.background = '#fff'}
               >
                 {item.name}
               </div>
             ))}
           </div>
        )}
      </div>
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
