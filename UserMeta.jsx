import React from "react";
import { attendanceSvg, classSvg, sectionSvg } from "../../Constant/svgs";
import TextChip from "../Common/TextChip";
import IconWrapper from "../Common/IconWrapper";
import { useTranslation } from "react-i18next";

const UserMeta = () => {
  
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  return (
    <div className="w-100 d-flex flex-column gap-3 userClassMeta px-3">
      <div className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
          <IconWrapper bg="#E9E8EF">{classSvg}</IconWrapper>
          <div className="d-flex flex-column">
            <h6 className="m-0 p-0 fw-bold">{t("JoinDate")}</h6>
            <p className="m-0 p-0 text-secondary">10-02-2022</p>
          </div>
        </div>
        <TextChip label="2 years" bg="#EDE7FF" text="#7F53FE" />
      </div>
            <div className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
          <IconWrapper bg="#E9E8EF">{sectionSvg}</IconWrapper>
          <div className="d-flex flex-column">
            <h6 className="m-0 p-0 fw-bold">{t("Performance")}</h6>
            <p className="m-0 p-0 text-secondary">{t("OverAll")}</p>
          </div>
        </div>
        <TextChip label="90%" bg="#52AFA626" text="#30ADA1" />
      </div>
            <div className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
          <IconWrapper bg="#E9E8EF">{attendanceSvg}</IconWrapper>
          <div className="d-flex flex-column">
            <h6 className="m-0 p-0 fw-bold">{t("Attendance")}</h6>
            <p className="m-0 p-0 text-success">{t("Present")}</p>
          </div>
        </div>
        <TextChip label="80%" bg="#DFE9F6" text="#3D87DC" />
      </div>
    </div>
  );
};

export default UserMeta;
