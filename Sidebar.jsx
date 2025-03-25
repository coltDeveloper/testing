import React, { useRef, useEffect, useState } from "react";
import { kgslogo } from "../../Constant/images";
import {
  studentLinks,
  teacherLinks,
  parentLinks,
  adminLinks,
  hrLinks,
} from "../../Constant/sidebarlinks";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { setToggleSidebar } from "../../redux/ToggleSlice";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [navLinks, setNavLinks] = useState([]);
  const [windowWidth, setWindowWidth] = useState(undefined);
  const location = useLocation();
  const toggleSidebar = useSelector((state) => state.toggler.toggleSidebar);
  const auth = useSelector((state) => state.auth);
  const isArabic = i18n.language;
  const sidebarRef = useRef(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (index) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  let user = auth?.user || "student" || "teacher" || "parent";
  const userRole = JSON.parse(localStorage.getItem("user"));
  if (userRole) {
    user = userRole.user;
  }
  const roleView = useSelector((state) => state.toggler.roleView) || localStorage.getItem("roleView") || "admin";

  const links = roleView === "admin" ? adminLinks(t) : '';
  const roles = {
    teacher: (t) => teacherLinks(t),
    parent: (t) => parentLinks(t),
    student: (t) => studentLinks(t),
    admin: (t) => links, // Switch between admin and HR links
  };

 // Fetch user permissions from Redux store or localStorage
 const userPermissions = useSelector((state) => state.auth.permissions) || JSON.parse(localStorage.getItem("permissions")) || [];

 useEffect(() => {
  if (roles[user]) {
    const allLinks = roles[user](t);
    const filteredLinks = allLinks.filter(link => {
      // Check if the link has a permission property and if the user has that permission
      if (link.permission) {
        return userPermissions.includes(link.permission);
      }
      return true; // If no permission is required, show the link
    });
    setNavLinks(filteredLinks);
  } else {
    console.error("User role is not defined in roles object");
  }
}, [user, t, roleView, userPermissions]);
  

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (windowWidth < 993) {
      dispatch(setToggleSidebar());
    }
  }, [windowWidth]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  useEffect(() => {
    const onRouteChange = () => {
      scrollToTop();
    };

    // Event listener for route change
    window.addEventListener("popstate", onRouteChange);

    // Cleanup
    return () => {
      window.removeEventListener("popstate", onRouteChange);
    };
  }, []);

  return (
    <aside
      className={`${
        toggleSidebar ? "sidebarOuterSm d-none" : "sidebarOuterLg d-none"
      }`}
    >
      <div
        className={`position-fixed ${
          toggleSidebar ? "sidebarWrapperSm d-none" : "sidebarWrapperLg d-none"
        }`}
        ref={sidebarRef}
      >
        <NavLink
          to="/home"
          className="sidebarLogo d-flex w-100 justify-content-center"
        >
          {/* sidebar logo */}
          <img src={kgslogo} alt="logo" />
        </NavLink>
        <div className="divider"></div>
        <div className="linksWrapper d-flex flex-column gap-4 ">
          <div
            className={`${
              toggleSidebar
                ? "d-flex flex-column align-items-center gap-4"
                : "links d-flex flex-column gap-1 w-100 text-white"
            }`}
          >
            {navLinks.map((link, index) => (
              <div key={index}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `${
                       isActive && link.label !== "Settings" ? "sidebarLinkActive" : "sidebarLink"
                    } d-flex flex-row align-items-center justify-content-between`
                  }
                  onClick={() => toggleMenu(index)}
                >
                  <div className="d-flex gap-3 align-items-center">
                    <span className="linkIcon">{link.icon}</span>
                    {!toggleSidebar && (
                      <span className="navLabel">{link.label}</span>
                    )}
                  </div>
                  {!toggleSidebar && (
                    <ChevronRight
                      className={`chevronIcon px-0 m-0 ${
                        isArabic === "sa" ? "rotate180" : ""
                      }`}
                    />
                  )}
                </NavLink>
                {/* Render children if expanded */}
                {expandedMenus[index] && link.children && (
                  <div
                    className={`pl-8 ${isArabic === "sa" ? "pr-8 pl-0" : ""}`}
                  >
                    {!toggleSidebar && ( link.children.map((child, childIndex) => (
                      <NavLink
                        key={childIndex}
                        to={child.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 my-1  rounded-lg text-sm ${
                            isActive
                              ? "bg-blue-500/20 text-white"
                              : "text-white/70"
                          } ${isArabic === "sa" ? "text-right" : "text-left"}`
                        }
                      >
                       {child.label}
                      </NavLink>
                    )))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          className={` cursor-pointer ${
            isArabic === "sa" ? "sidebarToggleLeft" : "sidebarToggle"
          }`}
          onClick={() => dispatch(setToggleSidebar())}
        >
          {toggleSidebar ? <ChevronRight /> : <ChevronLeft />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
