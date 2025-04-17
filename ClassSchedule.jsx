import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRequest } from "../services";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const ClassSchedule = () => {
  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [listWeek, setListWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth.user;

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December",
  ];
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await getRequest(`/api/User/GetUserById/${auth.userId}`);
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
          getRequest(user === "teacher" ? `/api/Exam/exams` : `/api/Exam/students-all-exams`),
          getRequest(`/api/ClassAssignment/MyClasses`)
        ]);

        if(user !== "teacher" && studentDokLevel){
          const filteredExams = examResponse.data.data.filter(exam => {
            const examDokLevels = exam.dokLevel ? exam.dokLevel.split(',') : [];
            return examDokLevels.includes(studentDokLevel);
          });
          setExamData(filteredExams);
        } else {
          setExamData(examResponse.data.data);
        }

        setClassData(classResponse.data.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWeekSchedule = () => {
    const weekSchedule = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday

    // Process exams
    const examSchedule = examData.map(exam => ({
      title: `${exam.title} Exam`,
      startTime: new Date(`${exam.startDate}T${exam.startTime}`),
      section: exam.subjectDetails.sectionDetails.sectionName,
      class: exam.subjectDetails.sectionDetails.classDetails.className,
      isExam: true
    }));

    // Process classes
    const classSchedule = classData.flatMap(classItem => 
      classItem.subjects.flatMap(subject => 
        subject.schedules.map(schedule => {
          const [hours, minutes] = schedule.startTime.split(':');
          const date = new Date(startOfWeek);
          const dayIndex = daysOfWeek.indexOf(schedule.day);
          date.setDate(date.getDate() + dayIndex);
          date.setHours(parseInt(hours), parseInt(minutes));
          
          return {
            title: `${subject.subjectName} Class`,
            startTime: date,
            section: classItem.sectionName,
            class: classItem.className,
            isExam: false
          };
        })
      )
    );

    return [...examSchedule, ...classSchedule];
  };

  const handleLeftArrowClick = () => {
    setListWeek(listWeek - 1);
    const updatedDate = new Date(currentDate);
    updatedDate.setDate(updatedDate.getDate() - 7);
    setCurrentDate(updatedDate);
  };

  const handleRightArrowClick = () => {
    setListWeek(listWeek + 1);
    const updatedDate = new Date(currentDate);
    updatedDate.setDate(updatedDate.getDate() + 7);
    setCurrentDate(updatedDate);
  };

  const renderDates = () => {
    const weekData = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekData.push({
        day: daysOfWeek[date.getDay()],
        date: date.getDate(),
      });
    }

    return weekData.map((dayData, index) => (
      <th key={index} className="text-uppercase text-primary">
        <b>{dayData.day}</b>
        <br />
        {dayData.date} <br />
      </th>
    ));
  };

  const timeZone = Array.from({ length: 16 }, (_, i) => i + 7); // 24-hour time from 07 to 22
  const weekSchedule = getWeekSchedule();

  return (
    <>
      <Spin spinning={loading}>
        <div className="timetable">
          <div className="container text-center">
            <div
              className={`d-flex justify-content-between align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
            >
              <b className="classManagementDate text-primary">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </b>
              <div className="gap-1 mt-lg-0 d-flex justify-content-center calender_left text-primary">
                <div
                  className="rounded-start d-flex align-items-center justify-content-center left_angle"
                  onClick={handleLeftArrowClick}
                >
                  <ChevronLeft className="h-75 w-75" />
                </div>
                <span className="d-flex align-items-center center_calender">
                  {listWeek > 0 
                    ? t("Next Week")
                    : listWeek === 0
                      ? t("Current Week")
                      : t("Previous Week")}
                </span>
                <div
                  className="rounded-end d-flex align-items-center right_angle justify-content-center"
                  onClick={handleRightArrowClick}
                >
                  <ChevronRight className="h-75 w-75" />
                </div>
              </div>
            </div>
          </div>
          <table className="table table-bordered">
            <thead>
              <tr className="bg-light-gray">
                <th className=""></th>
                {renderDates()}
              </tr>
            </thead>
            <tbody>
              {timeZone.map((time) => (
                <tr key={time}>
                  <td className="clocK_time text-primary">{time.toString().padStart(2, "0")}:00</td>
                  {daysOfWeek.map((day, index) => {
                    const matchingClass = weekSchedule.find((classInfo) => {
                      const classDate = new Date(classInfo.startTime);
                      const currentDate = new Date();
                      currentDate.setDate(currentDate.getDate() + index);
                      
                      return (
                        classDate.getDay() === currentDate.getDay() &&
                        classDate.getHours() === time
                      );
                    });

                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`class-cell p-2 ${matchingClass ? "has-class" : ""}`}
                        style={{
                          color: matchingClass?.isExam ? "#fff" : "#241763",
                          backgroundColor: matchingClass?.isExam ? "#241763" : "transparent",
                          borderLeft: index % 2 === 0 ? "5px solid #4a399a" : "5px solid #241763",
                          borderRadius: matchingClass?.isExam ? "8px" : "0"
                        }}
                      >
                        {matchingClass ? (
                          <div className="d-flex flex-column">
                            <p className="fw-bold">{matchingClass.title}</p>
                            <p className={matchingClass.isExam ? "text-white" : "text-muted"}>{`Class: ${matchingClass.class}, Section: ${matchingClass.section}`}</p>
                            <span>{matchingClass.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          "-"
                        )}
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

export default ClassSchedule;