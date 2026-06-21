import React, { useState } from "react";
import "./CSS/LoginSignup.css";

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
    let responseData;
    await fetch("http://localhost:4000/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors || responseData.message || "Đăng nhập thất bại");
    }
  };

  const signup = async () => {
    console.log("Sign Up Function Executed", formData);
    let responseData;
    await fetch("http://localhost:4000/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => (responseData = data));

    if (responseData.success) {
      localStorage.setItem("auth-token", responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors || responseData.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
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
          onClick={state === "Đăng nhập" ? login : signup}
          disabled={state === "Đăng ký" && !isChecked}
        >
          Tiếp tục
        </button>
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
