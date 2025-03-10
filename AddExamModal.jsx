import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { X } from "lucide-react";
import Counter from "../../Components/Common/Counter";
import { Toaster } from "react-hot-toast";
import ReactStartEndDatePicker from "../../Components/Common/ReactStartEndDatePicker";
import { getRequest, postRequest } from "../../services";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FlexBtn from "../../Components/Common/FlexBtn";
import { message, TimePicker, Button } from "antd";
import dayjs from 'dayjs';
import { validator } from "../../Constant/validator";

const AddExamModal = (props) => {

  const [questionCounter, setQuestionCounter] = useState(1);
  const [minsCounter, setMinsCounter] = useState(1);
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const userID = JSON.parse(localStorage.getItem('user'));
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const [examDetails, setExamDetails] = useState({
    title: "",
    categoryType: "",
    classId: "",
    sectionId: "", 
    subjectId: "",
    duration: 0,
    examType: "",
    questionCount: 0,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });

  const fetchData = async () => {
    try {
      const response = await getRequest(
        `/api/ClassAssignment/GetAssignedClasses?userId=${userID.userId}`
      );
      const data = response.data.data;
      setMyData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectChange = (field, value) => {
    setExamDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    setExamDetails((prevDetails) => ({
      ...prevDetails,
      questionCount: questionCounter,
      duration: minsCounter,
    }));
  }, [questionCounter, minsCounter]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name, date) => {
    setExamDetails((prevDetails) => {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const updatedDetails = { ...prevDetails, [name]: formattedDate };

      if (name === "startDate" && updatedDetails.endDate && new Date(updatedDetails.endDate) < new Date(formattedDate)) {
        updatedDetails.endDate = null;
      }

      return updatedDetails;
    });
  };

  const handleClick = (type, operationOrValue) => {
    if (type === "question") {
      if (typeof operationOrValue === "number") {
        setQuestionCounter(Math.max(0, operationOrValue));
      } else {
        setQuestionCounter((prev) =>
          Math.max(0, operationOrValue === "increment" ? prev + 1 : prev - 1)
        );
      }
    } else if (type === "duration") {
      if (typeof operationOrValue === "number") {
        setMinsCounter(Math.max(0, operationOrValue));
      } else {
        setMinsCounter((prev) =>
          Math.max(0, operationOrValue === "increment" ? prev + 1 : prev - 1)
        );
      }
    }
  };

  const getSections = () => {
    const selectedClass = myData.find((cls) => cls.classId === examDetails.classId);
    return selectedClass?.classSections || [];
  };

  const getSubjects = () => {
    const selectedSection = getSections().find(
      (sec) => sec.id === examDetails.sectionId
    );
    return selectedSection?.subjects || [];
  };

  const handleSubmitData = async (e) => {
    e.preventDefault();
    setLoading(true);
    const objFormData = {
      Title: examDetails.title,
      Class_Name: examDetails.classId,
      Section_Name: examDetails.sectionId,
      Subject_Name: examDetails.subjectId,
      Category_Type: examDetails.categoryType,
      Exam_Type: examDetails.examType,
      Duration: examDetails.duration,
      No_Of_Question: examDetails.questionCount,
      Start_Date: examDetails.startDate,
      End_Date: examDetails.endDate,
      Start_Time: examDetails.startTime,
      End_Time: examDetails.endTime,
    };
    const validate = validator(objFormData);
    if (validate !== "success") {
      message.warning(validate);
      setLoading(false);
    }
    else {
      const { classId, sectionId, ...filteredExamDetails } = examDetails;
      const payload = { ...filteredExamDetails };

      try {
        const response = await postRequest(`/api/Exam`, payload);
        if (response.status === 200 && response.data.success) {
          message.success(response.data.message || "Exam saved successfully");
          props.onRequestClose();
          props.fetchData();
        } else {
          message.error(response.data.message || "Failed to save lesson");
        }
      } catch (error) {
        console.error("Error:", error.message);
        message.error("An error occurred while saving the lesson");
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="container-fluid p-0 m-0 pb-4 modalWrapper">
      <Toaster />
      <div className="row d-flex justify-content-center p-0 m-0">
        <div className="col-md-12 examModalWrapper p-0 m-0">
          <div className="d-flex justify-content-between align-items-center px-4 col-md-12 examModalHeader">
            <h4 style={{ color: "#060317" }} className="fw-bold">
              {t(" AddNewExam")}
            </h4>
            <div className="iconWrapper cursor-pointer" onClick={props.onRequestClose}>
              <X />
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-3 p-0 m-0 px-4 modalBody">
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="title"> {t("ExamTitle")}</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control py-1 fs-6 px-2"
              value={examDetails.title}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="examType"> {t("ExamType")}</label>
            <input
              type="text"
              id="examType"
              name="examType"
              className="form-control py-1 fs-6 px-2"
              value={examDetails.examType}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <label htmlFor="classInput" className="weakform-text form-label">
            {t("SelectClass")}
          </label>
          <div className="d-flex">
            <input
              id="classInput"
              type="text"
              className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
              value={myData.find((cls) => cls.classId === examDetails.classId)?.className || ""}
              readOnly
            />
            <button
              className="drop-btn rounded-end"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <ChevronDown className="icon-drop" />
            </button>
            <ul className="dropdown-menu">
              {myData.map((cls) => (
                <li key={cls.classId}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleSelectChange("classId", cls.classId)}
                  >
                    {cls.className}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section Dropdown */}
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <label htmlFor="sectionInput" className="weakform-text form-label">
            {t("SelectSection")}
          </label>
          <div className="d-flex">
            <input
              id="sectionInput"
              type="text"
              className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
              value={getSections().find((sec) => sec.id === examDetails.sectionId)?.sectionName || ""}
              readOnly
            />
            <button
              className="drop-btn rounded-end"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              disabled={!examDetails.classId}
            >
              <ChevronDown className="icon-drop" />
            </button>
            <ul className="dropdown-menu">
              {getSections().map((sec) => (
                <li key={sec.id}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleSelectChange("sectionId", sec.id)}
                  >
                    {sec.sectionName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subject Dropdown */}
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <label htmlFor="subjectInput" className="weakform-text form-label">
            {t("SelectSubject")}
          </label>
          <div className="d-flex">
            <input
              id="subjectInput"
              type="text"
              className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
              value={getSubjects().find((sub) => sub.id === examDetails.subjectId)?.subjectName || ""}
              readOnly
            />
            <button
              className="drop-btn rounded-end"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              disabled={!examDetails.sectionId}
            >
              <ChevronDown className="icon-drop" />
            </button>
            <ul className="dropdown-menu">
              {getSubjects().map((sub) => (
                <li key={sub.id}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleSelectChange("subjectId", sub.id)}
                  >
                    {sub.subjectName}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <label htmlFor="categoryInput" className="weakform-text form-label">
            {t("Category")}
          </label>
          <div className="d-flex">
            <input
              id="categoryInput"
              type="text"
              className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
              value={examDetails.categoryType || ""}
              readOnly
            />
            <button
              className="drop-btn rounded-end"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <ChevronDown className="icon-drop" />
            </button>
            <ul className="dropdown-menu">
              {["McQs", "Question", "Assignment"].map((option, index) => (
                <li key={index}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleSelectChange("categoryType", option)}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {examDetails.categoryType !== "Assignment" && (
          <>
            <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <div className="d-flex flex-column gap-2 mt-3">
                <label htmlFor="questionCount">{t("NumberofQuestions")}</label>
                <Counter
                  isFullWidth={true}
                  handleClick={handleClick}
                  counter="question"
                  value={questionCounter}
                />
              </div>
            </div>
            <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <div className="d-flex flex-column gap-2 mt-3">
                <label htmlFor="duration"> {t("DurationinMinutes")}</label>
                <Counter
                  isFullWidth={true}
                  handleClick={handleClick}
                  counter="duration"
                  value={minsCounter}
                />
              </div>
            </div>
          </>
        )}
        <div className="col-md-6 mb-3">
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="startDate">Start Date</label>
            <ReactStartEndDatePicker
              name="startDate"
              selectedDate={examDetails.startDate}
              getDate={handleDateChange}
              minDate={new Date()}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="endDate">End Date</label>
            <ReactStartEndDatePicker
              name="endDate"
              selectedDate={examDetails.endDate}
              getDate={handleDateChange}
              minDate={examDetails.startDate ? new Date(examDetails.startDate) : new Date()}
            />
          </div>
        </div>
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="startTime"> {t("StartTime")}</label>
            <TimePicker
              format="HH:mm:ss"
              value={examDetails.startTime ? dayjs(examDetails.startTime, "HH:mm:ss") : null}
              onChange={(time, timeString) =>
                handleInputChange({ target: { name: "startTime", value: timeString } })
              }
              className="form-control py-1 fs-6 px-2"
            />
          </div>
        </div>
        <div className={`col-md-6 mb-3 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
          <div className="d-flex flex-column gap-2 mt-3">
            <label htmlFor="endTime"> {t("EndTime")}</label>
            <TimePicker
              format="HH:mm:ss"
              value={examDetails.endTime ? dayjs(examDetails.endTime, "HH:mm:ss") : null}
              onChange={(time, timeString) =>
                handleInputChange({ target: { name: "endTime", value: timeString } })
              }
              className="form-control py-1 fs-6 px-2"
            />
          </div>
        </div>
      </div>
      <div className="col-md-12 px-4 mt-3 py-3">
        <div className="d-flex gap-3 justify-content-end">
          <Link onClick={props.onRequestClose}>
            <FlexBtn label={t("Cancel")} color="#463C77" bgColor="#EDEBF1" />
          </Link>
          <Button type="primary" loading={loading} onClick={handleSubmitData}>
            {t("Create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExamModal;
