import React, { useState, useEffect, useRef } from "react";
import { MenuIcon } from "lucide-react";
import {
  notificationSvg,
  person,
  logoutSvg,
  arrowDown,
} from "../../Constant/svgs";
import Flag from "react-world-flags";
import { Link, useLocation, useParams } from "react-router-dom";
import { NavLogo } from "../../Constant/images";
import { useNavigate } from "react-router-dom";
import { setLanguage } from "../../redux/languageSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import NotificationAlert from "../../modals/NotificationAlert";
import { getRequest } from "../../services";
import { use } from "i18next";
import { toggleRoleView } from "../../redux/ToggleSlice";

const Navbar = (props) => {
  const location = useLocation();
  const { handleToggleSidebar } = props;
  const dropDownRef = useRef(null);
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(false);
  const dispatch = useDispatch();
  const language = useSelector((state) => state.language);
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [myData, setMyData] = useState([]);

  const roleView = useSelector((state) => state.toggler.roleView);

  const countries = [
    { code: "US", language: "English" },
    { code: "SA", language: "عربي" },
    { code: "FR", language: "French" },
    { code: "CN", language: "Chinese " },
    { code: "DE", language: "German" },
  ];

  let role = "student"; // Default role
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.user) {
    role = user.user;
  }

  const translatedRole = t(`roles.${role.toLowerCase()}`);
  const openModal = () => {
    setOpen(true);
  };

  const handleRoleSwitch = () => {
    navigate(`/${roleView === "admin" ? "hrms" : "home"}`);
    dispatch(toggleRoleView());

  };

  const closeModal = () => {
    setOpen(false);
  };
  useEffect(() => {
    const handleClickWindow = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("click", handleClickWindow);

    return () => {
      document.removeEventListener("click", handleClickWindow);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language.code.toLowerCase());
  }, [language, i18n]);

  const handleListClick = (code, language) => {
    dispatch(setLanguage({ code, language }));
    setOpenDropdown(false);
  };

  const currentUrl = window.location.pathname;
  const modifiedUrl = currentUrl.replace("/", "");
  const { id } = useParams();
  const isArabic = i18n.language;

  const layoutTitles = {
    courses: t("courses"),
    "class-schedule": t("classSchedule"),
    "my-classes": t("MyClasses"),
    "grade-book": t("gradeBook"),
    management: t("Management"),
    feeManagement: t("Fee Management"),
    campuses: t("Campuses"),
    hrms: t("HRMS"),
    exams: t("exams"),
    community: t("community"),
    payroll: t("Payroll"),
    recruitment: t("Recruitment"),
    hrConfiguration: t("Hr Configuration"),
    messages: t("messages"),
    "account-settings": t("accountSettings"),
    "lesson-plan": t("lessonPlan"),
    "curriculum-design": t("curriculumDesign"),
    "class-management": t("classManagement"),
    teachers: t("teachers"),
    students: t("students"),
    parents: t("parents"),
    classes: t("classes"),
    libraries: t("libraries"),
    "personal-profile": t("personalProfile"),
    "exams-management": t("examsManagement"),
    "grades-management": t("gradesManagement"),
    "grades-results": t("gradesManagement"),
    library: t("library"),
    attendance: t("classManagement"),
    "live-call": t("liveCall"),
  };
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "100%",
      border: "none",
      overFlow: "auto",
    },
  };
  let labelContent = layoutTitles[modifiedUrl] || t("dashboard");
  if (id) {
    if (modifiedUrl === "exams" || modifiedUrl === `exams/${id}`) {
      labelContent = t("exams");
    } else if (
      modifiedUrl === "exams" ||
      modifiedUrl === `exam-student/${id}`
    ) {
      labelContent = t("exams");
    } else if (modifiedUrl === "course" || modifiedUrl === `course/${id}`) {
      labelContent = t("courses");
    } else if (modifiedUrl === "course" || modifiedUrl === `lesson/${id}`) {
      labelContent = t("MyClasses");
    }else if (modifiedUrl === "live-call") {
      labelContent = t("liveCall");
    } else if (
      modifiedUrl === "grade-book" ||
      modifiedUrl === `results-student/${id}`
    ) {
      labelContent = t("gradeBook");
    } 
  }

  const commonClassName =
    "navbarWrapper flex justify-between align-items-center  customShadow";

  const useDropDownList = [
    { label: t("myProfile"), icon: person, path: "/account-settings" },
    { label: t("logout"), icon: logoutSvg, path: "/" },
  ];
  if (role === "admin") {
    useDropDownList.push({
      label: roleView === "admin" ? "Admin View" : "HR View",
      icon: null, // Optional: Add an icon if required
      customElement: (
        <label >
          {roleView === "admin" ? "Admin View" : "HRMS View"}
          <input
            type="checkbox"
            checked={roleView === "hr"}
            onChange={handleRoleSwitch}
            className="ml-8"
          />
        </label>
      ),
    });
  }

  const handleDropdownClick = (path) => {
    if (path === "/") {
      let auth = JSON.parse(localStorage.getItem("user"));
      if (auth) {
        localStorage.removeItem("user");
        navigate("/sign-in-first");
      }
    }
    navigate(path);
  };
  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const response = await getRequest(
          `/api/User/GetUserById/${user.userId}`
        );
        const data = response.data.data;
        setMyData(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
      }
    };
    fetchDataUser();
  }, []);
  return (
    <>
      <div
        className={`${location.pathname === "/assesment" ? "" : ""
          } ${commonClassName} ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
      >
        <MenuIcon onClick={handleToggleSidebar} className="mneuIcon" />
        <div className="flex gap-4 align-items-center justify-content-left">
          <h4 className="mb-0 d-none d-md-block">
            {location.pathname === "/assesment" ||
              location.pathname === "/assesment-welcome" ? (
              <Link to="/home" className="d-flex gap-4 align-items-center">
                <img src={NavLogo} className="blackLogos" alt="logo" />
                <span>{t("cognitiveAssessment")}</span>
              </Link>
            ) : (
              labelContent
            )}
          </h4>
          {/* <div
            className={`searchBox align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""
              } d-none d-md-flex`}
          >
            <Search />
            <input
              type="text"
              placeholder={t("search")}
              className="w-100"
              style={{ textAlign: isArabic === "sa" ? "right" : "left" }}
            />
          </div> */}
        </div>
        <div className="flex align-items-center gap-4 justify-content-end">
          <div className="position-relative cursor-pointer" onClick={openModal}>
            <span>{notificationSvg}</span>
            <div className="chip position-absolute d-flex justify-content-center align-items-center text-white">
              5
            </div>
          </div>
          <div className="d-flex align-items-center position-relative setLanguage">
            <div className="navbarDropdown" ref={dropDownRef}>
              <button
                className="dropdown-button text-primary"
                onClick={() => setOpenDropdown((prev) => !prev)}
              >
                {language.language}
                <Flag code={language.code} height="20" width="30" />
                {arrowDown}
              </button>
              {openDropdown && (
                <div className="flagsDropdown custom-scrollbar">
                  {countries.map((flag, index) => (
                    <div
                      key={index}
                      className="d-flex align-items-center flagList"
                      onClick={() => handleListClick(flag.code, flag.language)}
                    >
                      <Flag
                        code={flag.code}
                        fallback={<span>Unknown</span>}
                        height="20"
                        width="30"
                      />
                      <span className="flag-language">{flag.language}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={`d-flex justify-content-between align-items-center userAccount ${isArabic === "sa" ? "flex-row-reverse" : ""
              }`}
          >
            <div
              className="navAvatar d-flex justify-content-center align-items-center"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
            >
              <img
                src={
                  myData.profilePicture
                    ? myData.profilePicture
                    : "https://cdn.prod.website-files.com/6600e1eab90de089c2d9c9cd/662c092880a6d18c31995dfd_66236531e8288ee0657ae7a7_Business%2520Professional.webp"
                }
                className="imageCoverNav"
              />
            </div>
            <div className="align-items-center userName mx-2 d-none d-lg-block">
              <h6 className="fs-6 fw-bold">
                {" "}
                {` ${myData.firstName} ${myData.lastName}`}
              </h6>
              <h5 className="font-sm text-primary">{translatedRole}</h5>
            </div>
            <div className="userUpIcon">
              <div className="form-group d-flex align-items-center gap-1">
                <div className="dropdown">
                  <button
                    className="dropdown-toggle customDropdown"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  ></button>
                  <ul
                    className="dropdown-menu px-2"
                    aria-labelledby="dropdownMenuButton1"
                  >
                    {useDropDownList.map((options, index) => (
                      <li
                        className={`dropdown-item cursor-pointer d-flex justify-content-between py-2 px-2 align-items-center chatFilterDropdownLists ${isArabic === "sa" ? "flex-row-reverse" : ""
                          }`}
                        key={index}
                        onClick={() =>
                          options.path && handleDropdownClick(options.path)
                        }
                      >
                        {options.customElement ? (
                          options.customElement
                        ) : (
                          <>
                            {options.label}
                            {options.icon}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={open} onRequestClose={closeModal} style={customStyles}>
        <NotificationAlert onRequestClose={closeModal} />
      </Modal>
    </>
  );
};

export default Navbar;