import React, { useState, useEffect } from "react";
import { meachineicon, quizicon, taskicons } from "../../Constant/svgs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../../services";
import { Spin } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const EntrollCourseTiles = () => {
  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Current page for pagination
  const itemsPerPage = 3; // Items per page
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language;
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth.user;
  const handleClick = (type) => {
    if (type === "class") {
      navigate("/class-management");
    } else {
      navigate("/exams-management");
    }
  };

  const handlePagination = (direction) => {
    if (direction === "next") {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "previous") {
      setCurrentPage((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    const fetchDataExam = async (endPointApi) => {
      setLoading(true);
      try {
        const response = await getRequest(endPointApi);
        setExamData(response.data.data);
      } catch (error) {
        console.error("Error fetching exam data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchDataClass = async () => {
      setLoading(true);
      try {
        const response = await getRequest(`/api/ClassAssignment/MyClasses`);
        setClassData(response.data.data);
      } catch (error) {
        console.error("Error fetching class data:", error.message);
      } finally {
        setLoading(false);
      }
    };

      const endPointApi = user === "teacher"
      ? `/api/Exam/exams`
      : `/api/Exam/students-all-exams`;

      fetchDataExam(endPointApi);
      fetchDataClass();
    

  }, []);

  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const currentDate = new Date().toISOString().split("T")[0];
  
  const myTasks = [
    ...examData
      .filter((exam) =>
        new Date(currentDate) <= new Date(exam.endDate) // Include exams until their end date
      )
      .map((exam) => ({
        type: "exam",
        subjectName: exam.subjectDetails.subjectName,
        timeLine: `${exam.startTime} - ${exam.endTime}`,
        taskType: exam.examType,
        status: exam.status,
        day: new Date(exam.startDate).toLocaleDateString("en-US", { weekday: "long" }),
        date: new Date(exam.startDate).toLocaleDateString()
      })),
    ...classData.flatMap((classItem) =>
      classItem.subjects.flatMap((subject) =>
        subject.schedules
          .filter((schedule) => schedule.day === currentDay)
          .map((schedule) => ({
            type: "class",
            subjectName: subject.subjectName,
            timeLine: `${schedule.startTime} - ${schedule.endTime}`,
            day: schedule.day
          }))
      )
    )
  ];

  // Pagination logic: slice tasks based on current page
  const paginatedTasks = myTasks.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  console.log(myTasks);
  return (
    <Spin spinning={loading}>
      <div className="myTaskHeight">
        {paginatedTasks.length > 0 ? (
          paginatedTasks.map((item, index) => (
            <div
              className={`d-flex justify-content-start align-item-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
              key={index}
            >
              <div
                className={`taskImg d-flex justify-content-center align-items-center ${item.type === "class"
                  ? "meachineClr"
                  : item.status === true
                    ? "meachineClr"
                    : "discussionClr"
                  }`}
              >
                {item.type === "class"
                  ? meachineicon
                  : item.status === true
                    ? quizicon
                    : taskicons}
              </div>
              <div
                className="taskDetails cursor-pointer"
                onClick={() => handleClick(item.type)}
              >
                <h6>
                  {item.subjectName}{" "}
                  {item.type === "exam" && <strong>{item.taskType}</strong>}
                </h6>
                <p>{item.day} {item.type === "exam" && `(${item.date})`}</p>
                <p>{item.timeLine}</p>
                {item.type === "exam" && (
                  <p className="text-warning">
                    {item.status === true ? "" : "Please publish the exam"}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {paginatedTasks.length > 0 ? (
        <div className="flex justify-center mt-4 paginationStyle">
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
            {`${currentPage + 1}/${Math.ceil(myTasks.length / itemsPerPage)}`}
          </span>
          <button
            onClick={() => handlePagination("next")}
            disabled={currentPage >= Math.ceil(myTasks.length / itemsPerPage) - 1}
            className={`px-4 py-2 rounded ${currentPage >= Math.ceil(myTasks.length / itemsPerPage) - 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#241763] text-white hover:bg-[#241763]"
              }`}
          >
            <RightOutlined />
          </button>
        </div>
      ) : (
        null
      )}
    </Spin>
  );
};

export default EntrollCourseTiles;
