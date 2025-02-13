import React, { useState, useEffect, useRef } from "react";
import AttendanceTable from "../../Components/Common/AttendanceTable";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services/index";
import CarouselLesson from "./CarouselLesson";
import { Spin } from "antd";

const Attendance = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [currentDate, setCurrentDate] = useState("");
  const [myData, setMyData] = useState([]);
  const [isMatched, setIsMatched] = useState(false);
  const [myAttendaceData, setMyAttendaceData] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState();
  const [loading, setLoading] = useState(false);
  const { state } = useLocation();
  const userID = JSON.parse(localStorage.getItem("user"));
  const attendanceTableRef = useRef();
  const savedState = JSON.parse(localStorage.getItem("attendanceState"));
  const effectiveState = state || savedState;

  useEffect(() => {
    if (state) {
      localStorage.setItem("attendanceState", JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    const formatDate = () => {
      const date = new Date();
      return date.toDateString();
    };
    setCurrentDate(formatDate());
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/LessonPlan/teacher-lessonPlans?teacherId=${userID?.userId}`
      );
      const data = response?.data?.data || [];
      setMyData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/ClassAssignment/GetStudentsInClass?classSectionId=${effectiveState.sectionId}&subjectId=${effectiveState.subjectId}`
      );
      const data = response?.data;
      setAttendanceToday(data.lastAttendance)
      setMyAttendaceData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getClassDate = () => {

    if(attendanceToday){
      const currentDate = new Date().toISOString().split("T")[0];
      const attendanceDate = new Date(attendanceToday).toISOString().split("T")[0];
      console.log(currentDate === attendanceDate);
      setIsMatched(currentDate === attendanceDate);
    }
  }

  useEffect(() => {
    fetchData();
    fetchAttendanceData();
    getClassDate();
  }, [attendanceToday]);

  // Filter lessons based on the effective state
  const filteredLessons = myData
    .filter(
      (lesson) =>
        lesson?.classId === effectiveState?.classId &&
        lesson?.sectionId === effectiveState?.sectionId &&
        lesson?.subjectId === effectiveState?.subjectId &&
        new Date(lesson.date) >= new Date()
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));


  // Handle cases where effectiveState is null or undefined
  if (!effectiveState) {
    return (
      <div className="text-center py-5">
        <h4>{t("State not found. Please try again.")}</h4>
      </div>
    );
  }

  const handelSaveAttendance = () => {
    attendanceTableRef.current.triggerSaveAttendance();
  }

  return (
    <div className="container-fluid px-2 py-2 shadow-md bg-white rounded">
      <Spin spinning={loading}>
        {!loading && filteredLessons?.length === 0 ? (
          <div className="text-center w-100 py-5">
            <h4>{t("No Lesson Available")}</h4>
          </div>
        ) : (
          <CarouselLesson filteredLessons={filteredLessons} state={effectiveState} />
        )}
      </Spin>
      <div className="row mt-4">
        <div className="col-md-9">
          <h4 className="fw-bold heading24px">
            {`${effectiveState?.className} - ${effectiveState?.subjectName}`}
          </h4>
        </div>
        <div className="col-md-3">
          <div className="w-100 d-flex align-items-center h-100 gap-3 justify-content-end">
            <h6 className="p-0 m-0">Date</h6>
            <h6 className="mr-5 fw-bold">{currentDate}</h6>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-md-12">
          <AttendanceTable classData={effectiveState} myAttendaceData={myAttendaceData} ref={attendanceTableRef}  fetchAttendanceData={fetchAttendanceData} />
        </div>
        <div className="row mt-3">
          <div
            className="col-md-12 d-flex justify-content-center justify-content-md-end gap-3"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <Link
              to="/class-management"
              className="btnFooter"
              style={{ backgroundColor: "#EDEBF1", color: "#463C77" }}
            >
              {t("Cancel")}
            </Link>
            <Link
              className={`btnFooter ${!isMatched ? "" : "disabled"}`}
              style={{
                backgroundColor: !isMatched ? "#463C77" : "#D3D3D3",
                color: "white",
                pointerEvents: !isMatched ? "auto" : "none", 
                cursor: !isMatched ? "pointer" : "not-allowed", 
              }}
              onClick={!isMatched ? handelSaveAttendance : undefined}
            >
              {t("Save Attendance")}
            </Link>
            <Link
              to={`/live-call`}
              state={{ subjectId: effectiveState?.subjectId }}
              className="btnFooter"
              style={{ backgroundColor: "#463C77", color: "white" }}
            >
              {t("StartLecture")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
