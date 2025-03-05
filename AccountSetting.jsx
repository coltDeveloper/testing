import React from "react";
import UserGenInformation from "../../Forms/UserGenInformation";
import { useTranslation } from "react-i18next";


const AccountSettings = () => {

  const { i18n } = useTranslation();
  const isArabic = i18n.language;

  return (
    <div className="container-fluid">
      <div className={`row ${isArabic === "sa" ? "flex-row-reverse" : " "}`}>
        <UserGenInformation />
      </div>
    </div>
  );
};
export default AccountSettings;
