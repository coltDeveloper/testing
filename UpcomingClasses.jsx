import React, { useState, useEffect } from "react";
import { calanderSvg } from "../../Constant/svgs";
import { CalendarCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services";
import { useChild } from "../../ContextAPI/ChildContext";
import { Tooltip } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const UpcomingClasses = () => {
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const { t, i18n } = useTranslation();
  const { selectedChildId } = useChild();
  const isArabic = i18n.language;

  const getItemsPerPage = () => {
    if (window.innerWidth >= 1200) return 3; // xl
    if (window.innerWidth >= 992) return 2;  // lg
    return 1; // sm and smaller
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`/api/ClassAssignment/ChildClassesById?userId=${selectedChildId}`);
      const data = response.data.data;
      setClassData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedChildId) return;
    fetchData();
  }, [selectedChildId]);

  const flattenedSubjects = classData.flatMap(classItem =>
    classItem.subjects.map(subject => ({
      ...subject,
      classId: classItem.classId,
      className: classItem.className,
      sectionName: classItem.sectionName
    }))
  );

  const totalPages = Math.ceil(flattenedSubjects.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const displayedSubjects = flattenedSubjects.slice(startIndex, startIndex + itemsPerPage);

  const handlePagination = (direction) => {
    if (direction === "next" && currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else if (direction === "previous" && currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <>
      {!loading && (!classData || classData.length === 0) ? (
        <div className="text-center w-100 py-5">
          <h4>{t("No Data Available")}</h4>
        </div>
      ) : (
        <>
          <div className="row">
            {displayedSubjects.map((subject) => (
              <div className="col-xl-4 col-lg-6 col-12 mt-2" key={subject.id}>
                <div className="d-flex flex-column align-items-between bg-white examDataWrapper px-2 py-3 borderRadius_15 my-3">
                  <h6 className="heading-class fw-bold mt-2 text-white">{subject.subjectName}</h6>
                  <div className="d-flex justify-content-start gap-3 examChipsWrapper mt-3 px-2 ">
                    <div className="section p-2">
                      <p className="m-0 p-0">{subject.className}</p>
                    </div>
                    <div className="seven-class p-2"><p className="m-0 p-0">{subject.subjectName}</p></div>
                    <div className="section p-2">
                      <p className="m-0 p-0">{subject.sectionName}</p>
                    </div>
                  </div>
                  <div
                    className={`d-flex gap-3 mt-3 align-items-center justify-content-between examSvgsText px-2 ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}
                  >
                    <span className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
                      {calanderSvg}{" "}
                      <span className="p-0 m-0">
                        {subject.schedules.map((item, index) => {
                          const dayAbbreviation = item.day.slice(0, 2).toUpperCase();
                          return index < subject.schedules.length - 1 ? `${dayAbbreviation}, ` : dayAbbreviation;
                        })}
                      </span>
                    </span>
                  </div>
                  <div className="d-flex justify-content-center mt-3">
                    <Tooltip
                      title={
                        <div>
                          {subject.schedules.map((schedule, index) => (
                            <div key={index}>
                              <strong>{schedule.day}</strong>: {schedule.startTime} - {schedule.endTime}
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <button className="btn-class">
                        {isArabic === "sa" ? (
                          <>
                            {t('Scheduled')} <CalendarCheck2 className="d-inline" size={15} />
                          </>
                        ) : (
                          <>
                            <CalendarCheck2 className="d-inline" size={20} /> {t('Scheduled')}
                          </>
                        )}
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {displayedSubjects.length > 0 ? (
            <div className="flex justify-end mt-4 paginationStyle">
              <button
                onClick={() => handlePagination("previous")}
                disabled={currentPage < 1}
                className={`px-3 py-1 bg-[#241763] text-white rounded ${currentPage < 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#241763] text-white hover:bg-[#241763]"
                  }`}
              >
                <LeftOutlined />
              </button>
              <span className="bg-[#241763] text-white px-3 py-1 mx-1 border rounded d-flex align-items-center">
                {`${currentPage + 1}/${Math.ceil(flattenedSubjects.length / itemsPerPage)}`}
              </span>
              <button
                onClick={() => handlePagination("next")}
                disabled={currentPage >= Math.ceil(flattenedSubjects.length / itemsPerPage) - 1}
                className={`px-4 py-2 rounded ${currentPage >= Math.ceil(flattenedSubjects.length / itemsPerPage) - 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#241763] text-white hover:bg-[#241763]"
                  }`}
              >
                <RightOutlined />
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default UpcomingClasses;