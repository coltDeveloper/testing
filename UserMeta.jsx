import React, { useState } from "react";
import { attendanceSvg, classSvg, sectionSvg } from "../../Constant/svgs";
import TextChip from "../Common/TextChip";
import IconWrapper from "../Common/IconWrapper";
import { useTranslation } from "react-i18next";
import Modal from "react-modal";
import AttendanceView from "../../modals/AttendanceView";

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
  },
};

const UserMeta = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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
        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`} >
          <IconWrapper bg="#E9E8EF">{attendanceSvg}</IconWrapper>
          <div className="d-flex flex-column">
            <h6 className="m-0 p-0 fw-bold">{t("Attendance")}</h6>
            <p className="m-0 p-0 text-success">{t("Present")}</p>
          </div>
        </div>
        <TextChip label="80%" bg="#DFE9F6" text="#3D87DC" />
      </div>
      <div className={`flex justify-center mt-2 ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
        <button onClick={showModal} style={{cursor: 'pointer'}} className="border-2 border-[#241763] text-[#241763] hover:bg-[#241763] hover:text-white px-4 py-2 rounded">
          {t("AttendanceDetails")}
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
        style={customStyles}
      >
        <AttendanceView onRequestClose={handleCancel} />
      </Modal>
    </div>
  );
};

export default UserMeta;