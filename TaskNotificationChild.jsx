import React, { useState, useEffect } from "react";
import { meachineicon, quizicon, taskicons } from "../../Constant/svgs";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getRequest } from "../../services";
import { Spin, Pagination } from "antd";

const TaskNotificationChild = () => {
  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Changed to 1-based for antd pagination
  const itemsPerPage = 3;
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isArabic = i18n.language;
  const auth = JSON.parse(localStorage.getItem("user"));
  const user = auth.userId;

  const handleClick = (type) => {
    if (type === "class") {
      navigate("/class-management");
    } else {
      navigate("/exams-management");
    }
  };

  useEffect(() => {
    const fetchDataExam = async (childId, childName) => {
      setLoading(true);
      try {
        const response = await getRequest(`/api/Exam/students-all-exams-by-id?userId=${childId}`);
        return response.data.data.map(exam => ({...exam, childName}));
      } catch (error) {
        console.error("Error fetching exam data:", error.message);
        return [];
      }
    };

    const fetchDataClass = async (childId, childName) => {
      try {
        const response = await getRequest(`/api/ClassAssignment/ChildClassesById?userId=${childId}`);
        return response.data.data.map(classItem => ({...classItem, childName}));
      } catch (error) {
        console.error("Error fetching class data:", error.message);
        return [];
      }
    };

    const fetchDataChild = async () => {
      setLoading(true);
      try {
        const response = await getRequest(`/api/Parent/${user}`);
        const children = response.data.data.childerns;

        const allExamData = [];
        const allClassData = [];
        
        for (let child of children) {
          const [examResults, classResults] = await Promise.all([
            fetchDataExam(child.id, child.name),
            fetchDataClass(child.id, child.name)
          ]);
          
          allExamData.push(...examResults);
          allClassData.push(...classResults);
        }

        setExamData(allExamData);
        setClassData(allClassData);
      } catch (error) {
        console.error("Error fetching child data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDataChild();

  }, [user]);

  const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
  
  const myTasks = [
    ...examData
      .filter((exam) => {
        const examDate = new Date(exam.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return examDate >= today;
      })
      .map((exam) => ({
        type: "exam",
        subjectName: exam.subjectDetails.subjectName,
        timeLine: `${exam.startTime} - ${exam.endTime}`,
        taskType: exam.examType,
        status: exam.status,
        childName: exam.childName,
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
            childName: classItem.childName,
            day: schedule.day
          }))
      )
    )
  ];

  const paginatedTasks = myTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                  {item.childName} - {item.subjectName}{" "}
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

      {myTasks.length > 0 && (
        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            total={myTasks.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      )}
    </Spin>
  );
};

export default TaskNotificationChild;
