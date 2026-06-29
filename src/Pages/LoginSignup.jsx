import React, { useState } from "react";
import "./CSS/LoginSignup.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const LoginSignup = () => {
  const [state, setState] = useState("Đăng nhập");
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login Function Executed", formData);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const responseData = await response.json();

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.errors || responseData.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại server backend.");
    }
  };

  const signup = async () => {
    console.log("Sign Up Function Executed", formData);
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();

      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        window.location.replace("/");
      } else {
        alert(responseData.errors || responseData.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      alert("Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại server backend.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (state === "Đăng ký") {
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
        alert("Vui lòng điền đầy đủ thông tin đăng ký!");
        return;
      }
      if (!isChecked) {
        alert("Vui lòng đồng ý với các điều khoản sử dụng!");
        return;
      }
      signup();
    } else {
      if (!formData.email.trim() || !formData.password.trim()) {
        alert("Vui lòng nhập Email và Mật khẩu!");
        return;
      }
      login();
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <form onSubmit={handleSubmit}>
          <div className="loginsignup-fields">
            {state === "Đăng ký" && (
              <input
                name="username"
                value={formData.username}
                onChange={changeHandler}
                type="text"
                placeholder="Tên của bạn"
              />
            )}
            <input
              name="email"
              value={formData.email}
              onChange={changeHandler}
              type="email"
              placeholder="Địa chỉ Email"
            />
            <input
              name="password"
              value={formData.password}
              onChange={changeHandler}
              type="password"
              placeholder="Mật khẩu"
            />
          </div>
          <button
            type="submit"
            disabled={state === "Đăng ký" && !isChecked}
          >
            Tiếp tục
          </button>
        </form>
        {state === "Đăng ký" ? (
          <p className="loginsignup-login">
            Đã có tài khoản?{" "}
            <span onClick={() => setState("Đăng nhập")}>Đăng nhập tại đây</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Tạo tài khoản mới?{" "}
            <span onClick={() => setState("Đăng ký")}>Đăng ký ngay</span>
          </p>
        )}
        <div className="loginsignup-agree">
          {state !== "Đăng nhập" ? (
            <>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <p>
                Bằng cách tiếp tục, tôi đồng ý với các điều khoản sử dụng & chính sách bảo mật.
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
