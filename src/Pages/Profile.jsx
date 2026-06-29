import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Profile.css";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("auth-token");
        if (!token) {
          window.location.replace("/login");
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.user?.role === 'super_admin') {
          window.location.replace(`http://localhost:5173/?token=${token}`);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
          headers: {
            "auth-token": token,
          },
        });
        if (response.data.success) {
          const user = response.data.user;
          setProfile({
            name: user.name || "",
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            address: {
              street: user.address?.street || "",
              city: user.address?.city || "",
              state: user.address?.state || "",
            },
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
        alert("Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("auth-token");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        {
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          address: profile.address,
        },
        {
          headers: {
            "auth-token": token,
          },
        }
      );
      if (response.data.success) {
        alert("Cập nhật thông tin cá nhân thành công!");
      } else {
        alert("Cập nhật thất bại: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu thông tin:", error);
      alert("Đã xảy ra lỗi khi lưu thông tin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <h2>Đang tải thông tin cá nhân...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h1>Thông Tin Cá Nhân</h1>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Địa chỉ Email (Không thể thay đổi)</label>
            <input type="email" value={profile.email} disabled />
          </div>
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên của bạn"
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="text"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại của bạn"
            />
          </div>
          
          <div className="address-section">
            <h3>Địa chỉ giao hàng</h3>
            <div className="form-group">
              <label>Đường / Thôn xóm</label>
              <input
                type="text"
                name="address.street"
                value={profile.address.street}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, thôn/xóm"
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Quận / Huyện</label>
                <input
                  type="text"
                  name="address.city"
                  value={profile.address.city}
                  onChange={handleChange}
                  placeholder="Quận/Huyện"
                />
              </div>
              <div className="form-group">
                <label>Tỉnh / Thành phố</label>
                <input
                  type="text"
                  name="address.state"
                  value={profile.address.state}
                  onChange={handleChange}
                  placeholder="Tỉnh/Thành phố"
                />
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={saving} className="btn-save">
            {saving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
