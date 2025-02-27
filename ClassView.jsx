import React, { useState, useEffect } from "react";
import { clockSvg, studentSvg } from "../../Constant/svgs";
import { CalendarCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services";
import { formatTime } from "../../Constant/date";
import { useNavigate } from "react-router-dom";

const ClassView = () => {

  const [loading, setLoading] = useState(false);
  const [classData, setClassData] = useState([]);
  const userID = JSON.parse(localStorage.getItem("user"));
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`/api/ClassAssignment/GetMyClasses?userId=${userID.userId}`);
      const data = response.data.data;
      setClassData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterClassesByCurrentDay = (classData) => {
    const daysOfWeek = [
      "Sunday",
      "Monday", 
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const currentDay = daysOfWeek[new Date().getDay()];
    
    // Filter classes that have schedules matching current day
    const filteredClasses = classData.filter(classItem => {
      return classItem.schedules.some(schedule => schedule.day === currentDay);
    });

    // Map filtered classes to include schedule details for current day
    return filteredClasses.map(classItem => {
      const todaySchedule = classItem.schedules.find(schedule => schedule.day === currentDay);
      return {
        ...classItem,
        startTime: todaySchedule.startTime,
        endTime: todaySchedule.endTime
      };
    });
  };

  const currentDayClasses = filterClassesByCurrentDay(classData);

  return (
    <>
      {!loading && currentDayClasses?.length === 0 ? (
        <div className="text-center w-100 py-5">
          <h4>{t("No Data Available")}</h4>
        </div>
      ) : (
        currentDayClasses.map((item, index) => (
          <div className="col-lg-4 col-md-6 col-sm-12 mt-2" key={index} onClick={() => navigate("/attendance", { state: { ...item } })}>
            <div className="container p-2 bg-white pb-3 rounded-4 shadow cursor-pointer">
              <h6 className=" heading-class fw-bold mt-2">{item.subject}</h6>
              <div className="d-flex justify-content-between mt-3">
                <div className=" d-flex align-items-center gap-1">
                  <span className="">{clockSvg}</span>
                  <span className="text-class">{formatTime(item.startTime, item.endTime)} Minutes</span>
                </div>
                <div className=" d-flex align-items-center gap-1">
                  <span>{studentSvg}</span>
                  <span className="text-class">{item.student} Students</span>
                </div>
              </div>

              <div className="mt-4 d-flex  justify-content-start gap-3">
                <div className="section p-2 ">
                  <p className="m-0 p-0">{item.className}</p>
                </div>
                <div className="seven-class p-2">
                  <p className="m-0 p-0">{item.subjectName}</p>
                </div>
                <div className="section p-2">
                  <p className="m-0 p-0">Section {item.sectionName}</p>
                </div>
              </div>
              <div className=" d-flex justify-content-center mt-3">
                <button className="btn-class ">
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
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default ClassView;
