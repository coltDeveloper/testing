import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getRequest, updateRequest } from "../services";
import { userAvatar } from "../Constant/images";
import { pencilSvg } from "../Constant/svgs";
import UserMeta from "../Components/Common/UserMeta";
import ClassDetails from "./ClassesDetails";
import ChangePassword from "./ChangePassword";
import { DatePicker, message, Spin } from "antd";
import dayjs from "dayjs";

const UserGenInfoTeacher = () => {
  const [genInfo, setGenInfo] = useState({
    firstName: "",
    lastName: "", 
    designation: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    cnic: "",
    salary: "",
    dob: "",
    gender: ""
  });
  const [initialGenInfo, setInitialGenInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const auth = JSON.parse(localStorage.getItem("user"));
  const [avatar, setAvatar] = useState(userAvatar);

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  // Update genInfo with fetched user data
  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const response = await getRequest(`/api/User/GetUserById/${auth.userId}`);
        const data = response.data.data;

        const newGenInfo = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          designation: data.userType || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          address: data.address || "",
          cnic: data.cnic || "",
          salary: data.salary || "",
          dob: data.dob || "",
          gender: data.gender || ""
        };

        setGenInfo(newGenInfo);
        setInitialGenInfo(newGenInfo);

        // Update avatar if profile picture exists
        if (data.profilePicture) {
          setAvatar(data.profilePicture);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        message.error("Failed to fetch user data");
      }
    };

    fetchDataUser();
  }, [auth.userId]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGenInfo({ ...genInfo, [name]: value });
  };

  const handleDateChange = (date) => {
    setGenInfo({ ...genInfo, dob: date ? date.format('YYYY-MM-DD') : '' });
  };

  const isFormChanged = () => {
    return JSON.stringify(genInfo) !== JSON.stringify(initialGenInfo);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('FirstName', genInfo.firstName);
    formData.append('LastName', genInfo.lastName);
    formData.append('Email', genInfo.email);
    formData.append('Gender', 'Male');
    formData.append('Phone', genInfo.phone);
    formData.append('Location', genInfo.location);
    formData.append('Address', genInfo.address);
    formData.append('CNIC', genInfo.cnic);
    formData.append('DOB', genInfo.dob);

    try {
      const response = await updateRequest('/api/User/UpdateParent', formData, true);
      if(response.status === 200) {
        message.success("Successfully updated user info");
        setInitialGenInfo(genInfo);
      }
    } catch (error) {
      console.error("Error updating user info:", error.message);
      message.error("Failed to update user info");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className="col-md-4">
        <div className="w-100 userProfileWrapper py-4">
          <div className="userMeta w-100 d-flex align-items-center flex-column gap-2 mt-2">
            <div className="avatarWrapper">
              <img
                src={avatar}
                alt="user"
                className="img-fluid rounded-circle"
              />
              <div className="editAvatarImage">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="fileInput"
                />
                <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                  {pencilSvg}
                </label>
              </div>
            </div>
            <h4 className="fw-bold fs-6">{`${genInfo.firstName} ${genInfo.lastName}`}</h4>
            <h6 className="text-secondary">{t(auth.user)}</h6>
          </div>
          <UserMeta />
        </div>
      </div>
      <div className="col-md-8">
        <div className="settings w-100 d-flex flex-column gap-3">

          <div className="w-100 py-4 px-4 d-flex flex-column userGenInfoWrapper gap-3">
            <h2 className="heading24px fw-bold text-center">{t("GeneralInformation")}</h2>
            <div className={`row studentProfileHeading ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>

              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="firstName" className="form-label">
                  {t("FirstName")}
                </label>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Peter"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="firstName"
                    onChange={handleChange}
                    value={genInfo.firstName}
                    required
                  />
                </div>
              </div>

              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="lastName" className="form-label">
                  {t("LastName")}
                </label>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Smith"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="lastName"
                    onChange={handleChange}
                    value={genInfo.lastName}
                    required
                  />
                </div>
              </div>


              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="email" className="form-label">
                  {t("Email")}
                </label>
                <div className="mb-3">
                  <input
                    type="email"
                    placeholder="hello@designdrops.io"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="email"
                    onChange={handleChange}
                    value={genInfo.email}
                    required
                    disabled
                  />
                </div>
              </div>

              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="phone" className="form-label">
                  {t("Phone")}
                </label>
                <div className="mb-3">
                  <input
                    type="tel" 
                    placeholder="+92"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="phone"
                    onChange={handleChange}
                    value={genInfo.phone || ''}
                    required
                  />
                </div>
              </div>

              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="dob" className="form-label">
                  {t("DateOfBirth")}
                </label>
                <div className="mb-3">
                  <DatePicker
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    value={genInfo.dob ? dayjs(genInfo.dob.split('T')[0]) : null}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    required
                  />
                </div>
              </div>

              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="cnic" className="form-label">
                  {t("CNIC")}
                </label>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="12345-1234567-1"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="cnic"
                    onChange={handleChange}
                    value={genInfo.cnic}
                  />
                </div>
              </div>


              <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="location" className="form-label">
                  {t("City")}
                </label>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="City"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="location"
                    onChange={handleChange}
                    value={genInfo.location}
                    required
                  />
                </div>
              </div>

              <div className={`col-md-12 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label htmlFor="address" className="form-label">
                  {t("Address")}
                </label>
                <div className="mb-3">
                  <textarea
                    placeholder="Address"
                    className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                    name="address"
                    onChange={handleChange}
                    value={genInfo.address}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 text-center mt-2">
                  <button 
                    className="btn-update" 
                    onClick={handleSubmit}
                    disabled={!isFormChanged() || loading}
                  >
                    {loading ? <Spin size="small" /> : t("SaveChanges")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {auth.user !== "parent" ? <ClassDetails /> : null}
        <ChangePassword />
      </div>
    </>
  );
};

export default UserGenInfoTeacher;
