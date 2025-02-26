import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck2 } from "lucide-react";
import { clockSvg, bulbSvg } from "../../Constant/svgs";
import { getRequest } from "../../services";
import { Spin } from "antd";
import { useChild } from "../../ContextAPI/ChildContext";

const Exam = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const { selectedChildId } = useChild();
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchExamData = async () => {
      try {
        setLoading(true);
        const response = await getRequest(`/api/Exam/students-all-exams-by-id?userId=${selectedChildId}`);
        // Filter exams where status is true and examType is not "Practice"
        const filteredExams = response.data.data.filter(exam => 
          exam.status === true && 
          exam.examSubmittedStatus === false 
          // && new Date(exam.startDate) >= new Date()
        );
        setExamData(filteredExams);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [selectedChildId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  return (
    <div className="row mt-2">
      {(isArabic === "sa" ? [...examData].reverse() : examData).map((exam, index) => (
        <div className="col-md-6 col-lg-4 mb-3 cursor-pointer" key={index}>
          <div className="d-flex flex-column align-items-between examDataWrapper px-2 py-3">
            <div className={`d-flex justify-content-between ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <h4 className={`fw-bold p-0 m-0 fs-6 cursor-pointer ${isArabic === "sa" ? "text-end" : "text-left"}`}>
                {exam.title}
              </h4>
            </div>
            <div className={`d-flex justify-content-start gap-3 examChipsWrapper mt-3 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <div className="examChip">{exam.subjectDetails.subjectName}</div>
              <div className="examChip">
                {exam.subjectDetails.sectionDetails.sectionName.startsWith("Section") 
                  ? exam.subjectDetails.sectionDetails.sectionName
                  : `Section ${exam.subjectDetails.sectionDetails.sectionName}`}
              </div>
              <div className="examChip">{exam.subjectDetails.sectionDetails.classDetails.className}</div>
            </div>
            <div className={`d-flex gap-5 mt-3 align-items-center examSvgsText ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <div className={`d-flex gap-1 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                {clockSvg}
                <span>{`${exam.duration} ${t("Mins")}`}</span>
              </div>
              <div className={`d-flex gap-1 align-items-center cursor-pointer ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                <span>{bulbSvg}</span>
                <span className={`d-flex ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                  <span>{exam.examType} {t(exam.category)}</span>
                </span>
              </div>
            </div>
            <div className={`d-flex mt-3 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <div className="d-flex align-items-center gap-2 fs-6">
                <button
                  className="text-capitalize fs-6 d-flex gap-2 align-items-center"
                  style={{
                    backgroundColor: "#EDEBF1",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    color: "#463C77", 
                    width: "auto",
                    border: "none"
                  }}
                >
                  <CalendarCheck2 style={{ height: "16px", width: "16px" }} />
                  <span className="p-0 m-0" style={{ fontSize: "12px" }}>
                    {t("Scheduled")}
                  </span>
                </button>
                <span className="p-0 m-0" style={{ color: "#fff", fontSize: "10px" }}>
                  {`${exam.startDate} - ${exam.endDate}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Exam;
