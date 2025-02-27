import React, { useState, useEffect } from "react";
import { clockSvg, studentSvg, calanderSvg } from "../../Constant/svgs";
import { CalendarCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services";
import { useChild } from "../../ContextAPI/ChildContext";
import { Tooltip } from "antd";

const UpcomingClasses = () => {
  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState([]);
  const { t, i18n } = useTranslation();
  const { selectedChildId } = useChild();
  const isArabic = i18n.language;

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

  return (
    <>
      {!loading && (!classData || classData.length === 0) ? (
        <div className="text-center w-100 py-5">
          <h4>{t("No Data Available")}</h4>
        </div>
      ) : (
        classData.map((classItem) => (
          <div className="row" key={classItem.classId}>
            {classItem.subjects.map((subject) => (
              <div className="col-lg-4 col-md-6 mt-2" key={subject.id}>
                <div className="d-flex flex-column align-items-between bg-white examDataWrapper px-2 py-3 borderRadius_15 my-3">
                  <h6 className="heading-class fw-bold mt-2 text-white">{subject.subjectName}</h6>
                  <div className="d-flex justify-content-start gap-3 examChipsWrapper mt-3 px-2 ">
                    <div className="section p-2">
                      <p className="m-0 p-0">{classItem.className}</p>
                    </div>
                    <div className="seven-class p-2"><p className="m-0 p-0">{subject.subjectName}</p></div>
                    <div className="section p-2">
                      <p className="m-0 p-0">{classItem.sectionName}</p>
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
        ))
      )}
    </>
  );
};

export default UpcomingClasses;
