import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck2 } from "lucide-react";
import { clockSvg, bulbSvg } from "../../Constant/svgs";
import { getRequest } from "../../services";
import { Spin } from "antd";
import { useChild } from "../../ContextAPI/ChildContext";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const Exam = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const { selectedChildId } = useChild();
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const [studentDokLevel, setStudentDokLevel] = useState();

  useEffect(() => {
    if (!selectedChildId) return;

    const fetchStudent = async () => {
      try {
        const response = await getRequest(`/api/User/GetUserById/${selectedChildId}`);
        if (response.data.success) {
          setStudentDokLevel(response.data.data.dokLevel);
        }
      } catch (error) {
        console.error("Error fetching student data:", error.message);
      }
    };

    const fetchExamData = async () => {
      try {
        setLoading(true);
        const response = await getRequest(`/api/Exam/students-all-exams-by-id?userId=${selectedChildId}`);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const filteredExams = response.data.data.filter(exam => {
          const examStartDate = new Date(exam.startDate);
          examStartDate.setHours(0, 0, 0, 0);
          const examDokLevels = exam.dokLevel ? exam.dokLevel.split(',') : [];
          const studentDokLevelMatch = studentDokLevel ? examDokLevels.includes(studentDokLevel) : false;
          return (
            exam.status === true && 
            exam.examSubmittedStatus === false &&
            examStartDate >= currentDate &&
            studentDokLevelMatch
          );
        });
        setExamData(filteredExams);
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
    fetchExamData();
  }, [selectedChildId, studentDokLevel]);

  const handlePagination = (direction) => {
    if (direction === "next" && currentPage < Math.ceil(examData.length / itemsPerPage) - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === "previous" && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin spinning={loading} size="large" />
      </div>
    );
  }

  if (!examData || examData.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>{t("No Data Available")}</h4>
      </div>
    );
  }

  const startIndex = currentPage * itemsPerPage;
  const paginatedExams = examData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="row mt-2">
        {(isArabic === "sa" ? [...paginatedExams].reverse() : paginatedExams).map((exam, index) => (
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

      {examData.length > itemsPerPage && (
        <div className="flex justify-center mt-4 paginationStyle">
          <button
            onClick={() => handlePagination("previous")}
            disabled={currentPage < 1}
            className={`px-3 py-1 bg-[#241763] text-white rounded ${
              currentPage < 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#241763] text-white hover:bg-[#241763]"
            }`}
          >
            <LeftOutlined />
          </button>
          <span className="bg-[#241763] text-white px-3 py-1 mx-1 border rounded d-flex align-items-center">
            {`${currentPage + 1}/${Math.ceil(examData.length / itemsPerPage)}`}
          </span>
          <button
            onClick={() => handlePagination("next")}
            disabled={currentPage >= Math.ceil(examData.length / itemsPerPage) - 1}
            className={`px-4 py-2 rounded ${
              currentPage >= Math.ceil(examData.length / itemsPerPage) - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#241763] text-white hover:bg-[#241763]"
            }`}
          >
            <RightOutlined />
          </button>
        </div>
      )}
    </>
  );
};

export default Exam;
//parent