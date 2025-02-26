import React from "react";
 
import WelcomeSection from "../Components/Common/WelcomeSection";
import { useLocation } from "react-router-dom";
import { ParentContexProvider } from "../ContextAPI/ParentContext";
import { ChildProvider } from "../ContextAPI/ChildContext";
const ParentLayout = ({ children }) => {
  const location = useLocation();
  const pathName = location.pathname;
  const hideWelcomeSection = pathName === "/account-setting";
  return (
    <ChildProvider>
      <ParentContexProvider>
        {hideWelcomeSection ? null : <WelcomeSection />}

      {children}
    </ParentContexProvider>
    </ChildProvider>
  );
};

export default ParentLayout;
