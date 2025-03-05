import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getRequest, postRequest } from "../services";
import { Spin, message } from "antd";

const ChangePassword = () => {
  const [passwordData, setPassowrdData] = useState({
    current_password: "",
    new_password: "", 
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getRequest(`/api/User/GetUserById/${user.userId}`);
        setUserData(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, [user.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPassowrdData({ ...passwordData, [name]: value });
  };

  const handleSave = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      message.error("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        email: userData.email,
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password
      };

      const response = await postRequest('/api/User/ChangePassword/', payload);
      
      if (response.data.success) {
        message.success("Password changed successfully");
        setPassowrdData({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
      } else {
        message.error(response.data.message || "Failed to change password");
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  return (
    <div className="w-100 py-4 px-4  d-flex flex-column userGenInfoWrapper gap-3 mt-3">
      <h2 className="heading24px fw-bold text-center">{t("ChangePassword")}</h2>
      <div className={`row studentProfileHeading ${isArabic === "sa" ? "flex-row-reverse" : " "}`}>
        <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
          <label for="exampleInputEmail1" className="form-label">
            {t("CurrentPassword")}
          </label>
          <div className="mb-3">
            <input
              type="password"
              className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
              placeholder=""
              onChange={handleChange}
              value={passwordData.current_password}
              name="current_password"
            />
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label for="exampleInputEmail1" className="form-label">
                {t("NewPassword")}
              </label>
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  placeholder=""
                  onChange={handleChange}
                  value={passwordData.new_password}
                  name="new_password"
                />
              </div>
            </div>
            <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label for="exampleInputEmail2" className="form-label">
                {t("ConfirmPassword")}
              </label>
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  placeholder=""
                  onChange={handleChange}
                  value={passwordData.confirm_password}
                  name="confirm_password"
                />
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-12 text-center   mt-2">
              <button className="btn-update" onClick={handleSave} disabled={loading}>
                {loading ? <Spin size="small" /> : t("SaveChanges")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
