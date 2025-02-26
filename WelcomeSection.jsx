import React, { useEffect, useState } from "react";
import EntrollCourseTiles from "../Home/EntrollCourseTiles";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../Constant/numberFormatter";
import { getRequest } from "../../services";
import ChildCards2 from "../parent/ChildCards2";
const WelcomeSection = () => {
  const [myData, setMyData] = useState([]);
  const [lessonLength, setLessonLength] = useState(0);
  const [classLength, setClassLength] = useState(0);
  const [myTaskLength, setMyTasksLength] = useState(0);
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth.user;
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;

  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const response = await getRequest(
          `/api/User/GetUserById/${auth.userId}`
        );
        const data = response.data.data;
        setMyData(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    const fetchDataLesson = async () => {
      try {
        const endPointApi = user === "teacher"
          ? `/api/LessonPlan/teacher-lessonPlans?teacherId=${auth.userId}`
          : `/api/Course`;

        const response = await getRequest(endPointApi);

        const data = user === "teacher"
          ? response.data.data.length
          : response.data.data.totalCount;

        setLessonLength(data);
      } catch (error) {
        console.error("Error fetching lesson data:", error.message);
      }
    };

    const fetchDataClass = async () => {
      try {
        const response = await getRequest(`/api/ClassAssignment/MyClasses`);
        const data = user === "teacher"
          ? response.data.data.length
          : response.data.data[0]?.subjects?.length;
        setClassLength(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
    
    fetchDataUser();
    fetchDataLesson();
    fetchDataClass();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const endPointApi =
        user === "teacher"
          ? `/api/Exam/exams`
          : `/api/Exam/students-all-exams`;
  
      try {
        const examResponse = await getRequest(endPointApi);
        const examData = examResponse.data.data;
  
        const classResponse = await getRequest(`/api/ClassAssignment/MyClasses`);
        const classData = classResponse.data.data;
  
        const currentDay = new Date().toLocaleDateString("en-US", {
          weekday: "long",
        });
        const currentDate = new Date().toISOString().split("T")[0];
  
        // Calculate myTasks length
        const tasksLength =
          classData.reduce(
            (count, classItem) =>
              count +
              classItem.subjects.filter((subject) => subject.day === currentDay)
                .length,
            0
          ) +
          examData.filter(
            (exam) =>
              currentDate >= exam.startDate && currentDate <= exam.endDate
          ).length;
  
        setMyTasksLength(tasksLength); // Assuming you have a state for the length
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } 
    };
  
    fetchData();
  }, []);

  const EntrollCourseValueTech = [
    {
      id: "1",
      heading: t("MyLessonPlan"),
      price: lessonLength,
      link: "/lesson-plan",
    },
    {
      id: "2",
      heading: t("MyClasses"),
      price: classLength,
      link: "/class-management"
    },
    {
      id: "3",
      heading: t("MyTask"),
      price: myTaskLength,
      link: ""
    },
  ];
  const EntrollCourseValueStud = [
    {
      id: "1",
      heading: t("MyCourses"),
      price: lessonLength,
      link: "/courses",
    },
    {
      id: "2",
      heading: t("MyClasses"),
      price: classLength,
      link: "/my-classes"
    },
    {
      id: "3",
      heading: t("MyTask"),
      price: myTaskLength,
      link: ""
    },
  ];

  return (
    <div className="welcomeBox">
      <div className="logoWithText d-flex justify-content-start align-items-start flex-wrap">
        <div className="welcomeTxtP w-100">
          <div className=" d-flex justify-content-start gap-3 align-items-center">
            <img
              src={myData.profilePicture ? myData.profilePicture : "https://cdn.prod.website-files.com/6600e1eab90de089c2d9c9cd/662c092880a6d18c31995dfd_66236531e8288ee0657ae7a7_Business%2520Professional.webp"} className="image--cover" />
            <div className={`mt-3 ${isArabic === "sa" ? "text-end" : ""}`}>
              <h6>{`${t("welcome")} ${myData.firstName} ${myData.lastName}!`}</h6>
              <p>
                {user === "student"
                  ? t("alwaysStudent")
                  : user === "teacher"
                    ? t("alwaysTeacher")
                    : user === "parent"
                      ? t("alwaysParent")
                      : t("alwaysAdmin")}
              </p>
            </div>
          </div>
          {user === "parent" && <ChildCards2 />}
          {user === "teacher" && (
            <div
              className={`welcomeTilles d-flex ${isArabic === "sa" ? "justify-content-end" : "justify-content-start"
                } mt-3 flex-wrap`}
            >
              {EntrollCourseValueTech.map((item, index) => (
                <EntrollCourseTiles
                  key={index}
                  id={index}
                  heading={item.heading}
                  price={isArabic === "sa" ? formatNumber(item.price) : item.price}
                  isArabic={isArabic}
                  urlLink={item.link}
                />
              ))}
            </div>
          )}
          {user === "student" && (
            <div className="welcomeTilles d-flex justify-content-start mt-3 flex-wrap">
              {EntrollCourseValueStud.map((item, index) => (
                <EntrollCourseTiles
                  key={index}
                  id={index}
                  heading={item.heading}
                  price={isArabic === "sa" ? formatNumber(item.price) : item.price}
                  isArabic={isArabic}
                  urlLink={item.link}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
