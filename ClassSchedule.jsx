import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getRequest } from "../services";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

const ClassSchedule = () => {

  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  let [listWeek, setListWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examResponse, classResponse] = await Promise.all([
          getRequest(user === "teacher" ? `/api/Exam/exams` : `/api/Exam/students-all-exams`),
          getRequest(`/api/ClassAssignment/MyClasses`)
        ]);
        
        setExamData(examResponse.data.data);

        const uniqueClasses = {};

        classResponse.data.data.forEach((cls) => {
          if (!uniqueClasses[cls.classId]) {
            uniqueClasses[cls.classId] = { ...cls };
            uniqueClasses[cls.classId].subjects = cls.subjects.map(({ day, startTime, endTime, ...subject }) => subject);
          }
        });
        console.log("uniqueClasses",uniqueClasses)
        setClassData(Object.values(uniqueClasses)); // Ensure classData is an array
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const mockExamData = examData.map((exam) => ({
    Exam_title: `${exam.title} Exam`,
    startTime: `${exam.startDate}T${exam.startTime}`,
    section: exam.subjectDetails.sectionDetails.sectionName,
    class: exam.subjectDetails.sectionDetails.classDetails.className,
  }));

  const mockClassData = [];

  // Iterate through each class entry
  function getDatesForDayInRange(startDate, endDate, dayOfWeek) {
    const dates = [];
    const dayMapping = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
    let currentDate = new Date(startDate);

    // Find the first occurrence of the target day
    while (currentDate.getDay() !== dayMapping[dayOfWeek]) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Collect all occurrences of the day in the range
    while (currentDate <= new Date(endDate)) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }

    return dates;
  }

  classData.forEach(classItem => {
    const { className, sectionName, startedSession, endSession, subjects } = classItem;
    const startSessionDate = new Date(startedSession);
    const endSessionDate = new Date(endSession);
  
    subjects.forEach(subjectItem => {
      const { subjectName, schedules } = subjectItem;
  
      // Loop through each schedule in the subject
      schedules.forEach(schedule => {
        const { day, startTime } = schedule;
  
        // Get all dates for the specific day within the session range
        const datesForDay = getDatesForDayInRange(startSessionDate, endSessionDate, day);
  
        // Create mock data for each date
        datesForDay.forEach(date => {
          const startTimeDate = new Date(date);
          const [hours, minutes] = startTime.split(':');
          startTimeDate.setHours(parseInt(hours), parseInt(minutes));
  
          mockClassData.push({
            subject_title: `${subjectName} Class`,
            startTime: startTimeDate.toISOString(),
            section: sectionName,
            class: className,
          });
        });
      });
    });
  });

  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December",
  ];
  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  const getDay = (d) => {
    const date = new Date(d);
    const currentDay = date.getDay();
    return daysOfWeek[currentDay];
  };

  const getTime = (startTimeString) => {
    const dummyDate = new Date(startTimeString);
    const hours = dummyDate.getHours();
    const minutes = dummyDate.getMinutes();
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`; // 24-hour format
  };

  const getDate = (d) => {
    const date = new Date(d);
    return date.getDate();
  };

  const getMonth = (dt) => {
    const date = new Date(dt);
    return months[date.getMonth()];
  };

  const newDataFormat = mockExamData.map((exam) => ({
    section: exam.section,
    class: exam.class,
    title: exam.Exam_title,
    day: getDay(exam.startTime),
    time: getTime(exam.startTime),
    date: getDate(exam.startTime),
    month: getMonth(exam.startTime),
    isExam: true
  }));

  const newClassDataFormat = mockClassData.map((cls) => ({
    section: cls.section,
    class: cls.class,
    title: cls.subject_title,
    day: getDay(cls.startTime),
    time: getTime(cls.startTime),
    date: getDate(cls.startTime),
    month: getMonth(cls.startTime),
    isExam: false
  }));

  const allData = [...newDataFormat, ...newClassDataFormat];
  const [currentDate, setCurrentDate] = useState(new Date());

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
                    const matchingClass = allData.find((classInfo) => {
                      const classDate = new Date(
                        `${classInfo.month} ${classInfo.date}, ${new Date().getFullYear()}`
                      );

                      const isSameDay =
                        classDate.toDateString() ===
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          currentDate.getDate() + index
                        ).toDateString();

                      const classTime = parseInt(classInfo.time.split(":")[0], 10);
                      const isSameTime = classTime === time;

                      return isSameDay && isSameTime;
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
                            <span>{matchingClass.time}</span>
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
        </div >
      </Spin>
    </>
  );
};

export default ClassSchedule;