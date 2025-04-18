import React, { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRequest } from "../../services";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { useChild } from "../../ContextAPI/ChildContext";

const Calendar = () => {
  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [listWeek, setListWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const { selectedChildId } = useChild();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await getRequest(`/api/User/GetUserById/${selectedChildId}`);
        if (response.data.success) {
          return response.data.data.dokLevel;
        }
      } catch (error) {
        console.error("Error fetching student data:", error.message);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const studentDokLevel = await fetchStudent();
        const [examResponse, classResponse] = await Promise.all([
          getRequest(`/api/Exam/students-all-exams-by-id?userId=${selectedChildId}`),
          getRequest(`/api/ClassAssignment/ChildClassesById?userId=${selectedChildId}`)
        ]);

        const filteredExams = examResponse.data.data.filter(exam => {
          const examDokLevels = exam.dokLevel ? exam.dokLevel.split(',') : [];
          return examDokLevels.includes(studentDokLevel);
        });
        setExamData(filteredExams);

        const uniqueClasses = {};
        classResponse.data.data.forEach((cls) => {
          if (!uniqueClasses[cls.classId]) {
            uniqueClasses[cls.classId] = {
              className: cls.className,
              sectionName: cls.sectionName,
              startedSession: cls.startedSession,
              endSession: cls.endSession,
              subjects: cls.subjects.map(subject => ({
                subjectName: subject.subjectName,
                schedules: subject.schedules.map(schedule => ({
                  day: schedule.day,
                  startTime: schedule.startTime,
                }))
              }))
            };
          }
        });
        setClassData(Object.values(uniqueClasses));
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedChildId]);

  const getTime = (startTimeString) => {
    const dummyDate = new Date(startTimeString);
    const hours = dummyDate.getHours();
    const minutes = dummyDate.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [currentDate, setCurrentDate] = useState(getMonday(new Date()));

  const handleLeftArrowClick = () => {
    setListWeek(listWeek - 1);
    const updatedDate = new Date(currentDate);
    updatedDate.setDate(updatedDate.getDate() - 7);
    setCurrentDate(getMonday(updatedDate));
  };

  const handleRightArrowClick = () => {
    setListWeek(listWeek + 1);
    const updatedDate = new Date(currentDate);
    updatedDate.setDate(updatedDate.getDate() + 7);
    setCurrentDate(getMonday(updatedDate));
  };

  const weekData = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      data.push({
        dayName: daysOfWeek[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
      });
    }
    return data;
  }, [currentDate]);

  const timeZone = Array.from({ length: 17 }, (_, i) => i + 7);

  return (
    <>
      <Spin spinning={loading}>
        <div className="timetable">
          <div className="container text-center">
            <div className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <b className="classManagementDate text-primary">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </b>
              <div className="gap-1 mt-lg-0 d-flex justify-content-center calender_left text-primary">
                <div className="rounded-start d-flex align-items-center justify-content-center left_angle" onClick={handleLeftArrowClick}>
                  <ChevronLeft className="h-75 w-75" />
                </div>
                <span className="d-flex align-items-center center_calender">
                  {listWeek > 0
                    ? t("Next Week")
                    : listWeek === 0
                      ? t("Current Week")
                      : t("Previous Week")}
                </span>
                <div className="rounded-end d-flex align-items-center right_angle justify-content-center" onClick={handleRightArrowClick}>
                  <ChevronRight className="h-75 w-75" />
                </div>
              </div>
            </div>
          </div>
          <table className="table table-bordered">
            <thead>
              <tr className="bg-light-gray">
                <th></th>
                {weekData.map((dayData, index) => (
                  <th key={index} className="text-uppercase text-primary">
                    <b>{dayData.dayName}</b>
                    <br />
                    {dayData.date} <br />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeZone.map((time) => (
                <tr key={time}>
                  <td className="clocK_time text-primary">{time.toString().padStart(2, "0")}:00</td>
                  {weekData.map((dayData, dayIndex) => {
                    const dayName = dayData.dayName;
                    const fullDate = dayData.fullDate;

                    // Check for exams
                    const matchingExam = examData.find(exam => {
                      const examDateTime = `${exam.startDate}T${exam.startTime}`;
                      const examDate = new Date(examDateTime);
                      if (isNaN(examDate)) return false;
                      return (
                        examDate.toDateString() === fullDate.toDateString() &&
                        examDate.getHours() === time
                      );
                    });

                    // Check for classes
                    // In the calendar rendering section where classes are checked:
                    const matchingClasses = [];
                    classData.forEach(classItem => {
                      const sessionStart = new Date(classItem.startedSession);
                      const sessionEnd = new Date(classItem.endSession);
                      const weekStart = new Date(currentDate);
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);

                      // Check if the current week overlaps with the session
                      if (sessionStart > weekEnd || sessionEnd < weekStart) return;

                      classItem.subjects.forEach(subject => {
                        subject.schedules.forEach(schedule => {
                          // Normalize day names to lowercase
                          const scheduleDay = schedule.day.toLowerCase();
                          const targetDay = dayName.toLowerCase();

                          // Parse schedule time
                          const [scheduleHour] = schedule.startTime.split(':').map(Number);

                          // Match day and time
                          if (scheduleDay === targetDay && scheduleHour === time) {
                            matchingClasses.push({
                              className: classItem.className,
                              sectionName: classItem.sectionName,
                              subjectName: subject.subjectName,
                              startTime: schedule.startTime,
                            });
                          }
                        });
                      });
                    });

                    // In the exam display section, update the className/sectionName access
                    const displayItem = matchingExam
                      ? {
                        type: 'exam',
                        title: `${matchingExam.title} Exam`,
                        className: matchingExam.subjectDetails?.sectionDetails?.classDetails?.className || 'N/A',
                        sectionName: matchingExam.subjectDetails?.sectionDetails?.sectionName || 'N/A',
                        time: getTime(`${matchingExam.startDate}T${matchingExam.startTime}`),
                      }
                      : matchingClasses.length > 0
                        ? {
                          type: 'class',
                          title: `${matchingClasses[0].subjectName} Class`,
                          className: matchingClasses[0].className,
                          sectionName: matchingClasses[0].sectionName,
                          time: matchingClasses[0].startTime,
                        }
                        : null;

                    return (
                      <td
                        key={`${dayName}-${time}`}
                        className={`class-cell p-2 ${displayItem ? "has-class" : ""}`}
                        style={{
                          color: displayItem?.type === 'exam' ? "#fff" : "#241763",
                          backgroundColor: displayItem?.type === 'exam' ? "#241763" : "transparent",
                          borderLeft: dayIndex % 2 === 0 ? "5px solid #4a399a" : "5px solid #241763",
                          borderRadius: displayItem?.type === 'exam' ? "8px" : "0"
                        }}
                      >
                        {displayItem ? (
                          <div className="d-flex flex-column">
                            <p className="fw-bold">{displayItem.title}</p>
                            <p className={displayItem.type === 'exam' ? "text-white" : "text-muted"}>
                              {t("Class")}: {displayItem.className}, {t("Section")}: {displayItem.sectionName}
                            </p>
                            <span>{displayItem.time}</span>
                          </div>
                        ) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Spin>
    </>
  );
};

export default Calendar;