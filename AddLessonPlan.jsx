import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRequest, postRequest } from "../../services";
import { Link } from "react-router-dom";
import FlexBtn from "../../Components/Common/FlexBtn";
import ReactCustomDatePicker from "../../Components/Common/ReactCustomDatePicker";
import { useNavigate } from "react-router-dom";
import { message, Button, Progress, Tooltip, Upload } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { validator } from "../../Constant/validator";

const AddLessonPlan = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const [myData, setMyData] = useState([]);
  const userID = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lessonPlanData, setLessonPlanData] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    teacherId: userID.userId,
    day: "",
    startTime: "",
    endTime: "",
    topic: "",
    date: null,
    Completion: "",
    lessonPlanType: "",
    detail: "",
  });
  const [documentFile, setDocumentFile] = useState([]);
  const [videoFile, setVideoFile] = useState([]);
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

  // Handle dropdown selections
  const handleSelectChange = (field, value) => {
    setLessonPlanData((prev) => ({
      ...prev,
      [field]: value, // Update the specific field directly
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const objFormData = {
      Class_Name: lessonPlanData.classId,
      Section_Name: lessonPlanData.sectionId,
      Subject_Name: lessonPlanData.subjectId,
      Day: lessonPlanData.day,
      Start_Time: lessonPlanData.startTime,
      End_Time: lessonPlanData.endTime,
      Topic: lessonPlanData.topic,
      Date: lessonPlanData.date,
      Completion: lessonPlanData.Completion,
      Lesson_Plan_Type: lessonPlanData.lessonPlanType,
    };
    const validate = validator(objFormData);
    if (validate !== "success") {
      message.warning(validate);
    } else if (documentFile.some(file => file.size > 29 * 1024 * 1024) ) {
      message.warning("File size should not be greater than 29 MB.");
    }
    else if (videoFile.some(file => file.size > 29 * 1024 * 1024)) {
      message.warning("Video size should not be greater than 29 MB.");
    }
    else {
      setLoading(true);
      try {
        // Upload document files if selected
        let document = null;
        if (documentFile?.length) {
          const formData = new FormData();
          documentFile.forEach((file) => formData.append("files", file)); 
          const docResponse = await postRequest("/api/Document/documents-upload", formData, true);
          document = docResponse?.data;
        }

        // Upload video files if selected
        let video = null;
        if (videoFile?.length) {
          const formData = new FormData();
          videoFile.forEach((file) => formData.append("files", file));

          const videoResponse = await postRequest("/api/Document/videos-upload", formData, true);
          video = videoResponse?.data;
        }

        // Prepare payload with updated URLs
        const payload = {
          ...lessonPlanData,
          document,
          video,
        };

        const response = await postRequest(`/api/LessonPlan`, payload);
        if (response.status === 200 && response.data.success) {
          message.success(response.data.message || "Lesson saved successfully");
          navigate("/lesson-plan");
        } else {
          message.error(response.data.message || "Failed to save lesson");
        }
      } catch (error) {
        console.error("Error:", error.message);
        message.error(error.message || "An error occurred while saving the lesson");
      } finally {
        setLoading(false);
      }
    }

  };

  const getSections = () => {
    const selectedClass = myData.find((cls) => cls.classId === lessonPlanData.classId);
    return selectedClass?.classSections || [];
  };

  const getSubjects = () => {
    const selectedSection = getSections().find(
      (sec) => sec.id === lessonPlanData.sectionId
    );
    return selectedSection?.subjects || [];
  };

  return (
    <>
      <div className="bg-white pt-4 shadow-lg rounded-4 min-vh-82">
        <h2 className={`p-3 myClassesHeading ${isArabic === "sa" ? "text-end" : ""}`}>
          {t("CreateLeasonPlan")}
        </h2>
        <form className="p-3">
          <div className={`row studentProfileHeading ${isArabic === "sa" ? "flex-row-reverse" : ""}`} dir={isArabic === "sa" ? "ltr" : ""}>
            <div className={`col-md-4 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <label htmlFor="classInput" className="weakform-text form-label">
                {t("SelectClass")}
              </label>
              <div className="mb-3 d-flex">
                <input
                  id="classInput"
                  type="text"
                  className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
                  value={myData.find((cls) => cls.classId === lessonPlanData.classId)?.className || ""}
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
            <div className={`col-md-4 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <label htmlFor="sectionInput" className="weakform-text form-label">
                {t("SelectSection")}
              </label>
              <div className="mb-3 d-flex">
                <input
                  id="sectionInput"
                  type="text"
                  className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
                  value={getSections().find((sec) => sec.id === lessonPlanData.sectionId)?.sectionName || ""}
                  readOnly
                />
                <button
                  className="drop-btn rounded-end"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  disabled={!lessonPlanData.classId}
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
            <div className={`col-md-4 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <label htmlFor="subjectInput" className="weakform-text form-label">
                {t("SelectSubject")}
              </label>
              <div className="mb-3 d-flex">
                <input
                  id="subjectInput"
                  type="text"
                  className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
                  value={getSubjects().find((sub) => sub.id === lessonPlanData.subjectId)?.subjectName || ""}
                  readOnly
                />
                <button
                  className="drop-btn rounded-end"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  disabled={!lessonPlanData.sectionId}
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
          </div>
          <div className="row mb-2">
            <div className={`col-md-4 ${isArabic === "sa" ? "text-end" : "text-start"}`}>
              <label htmlFor="dayInput" className="weakform-text form-label">
                {t("Day And Time")}
              </label>
              <div className="mb-3 d-flex">
                <input
                  id="dayInput"
                  type="text"
                  className={`input-cx rounded-start px-2 ${isArabic === "sa" ? "text-end pr-2" : "text-start"}`}
                  value={
                    lessonPlanData.day
                      ? `${lessonPlanData.day} - ${lessonPlanData.startTime} to ${lessonPlanData.endTime}`
                      : ""
                  }
                  readOnly
                />
                <button
                  className="drop-btn rounded-end"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  disabled={!lessonPlanData.subjectId}
                >
                  <ChevronDown className="icon-drop" />
                </button>
                <ul className="dropdown-menu">
                  {getSubjects().map((subject) =>
                    subject.schedules.map((schedule) => (
                      <li key={`${schedule.day}-${schedule.startTime}`}>
                        <button
                          className="dropdown-item"
                          type="button"
                          onClick={() => {
                            handleSelectChange("day", schedule.day);
                            handleSelectChange("startTime", schedule.startTime);
                            handleSelectChange("endTime", schedule.endTime);
                          }}
                        >
                          {`${schedule.day} - ${schedule.startTime} to ${schedule.endTime}`}
                          {lessonPlanData.day === schedule.day &&
                            lessonPlanData.startTime === schedule.startTime &&
                            lessonPlanData.endTime === schedule.endTime && (
                              <span> ✔</span>
                            )}
                        </button>
                      </li>
                    ))
                  )}

                </ul>
              </div>



            </div>

            {/* Topic Field */}
            <div className={`col-md-4 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="topic" className="weakform-text form-label">
                {t("Topic")}
              </label>
              <div className="mb-3">
                <input
                  id="topic"
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={lessonPlanData.topic}
                  onChange={(e) => setLessonPlanData({ ...lessonPlanData, topic: e.target.value })}
                />
              </div>
            </div>

            {/* Date Field */}
            <div className={`col-md-4 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="date" className="weakform-text form-label">
                {t("Date")}
              </label>
              <div className="mb-3">
                <ReactCustomDatePicker
                  id="date"
                  placeholder="Select a date"
                  getDate={(name, date) => setLessonPlanData((prev) => ({ ...prev, date: date }))}
                  name="date"
                  selectedDate={lessonPlanData.date}
                  day={lessonPlanData.day}
                />
              </div>
            </div>
            {/* Completion Field */}
            <div className={`col-md-4 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="Completion" className="weakform-text form-label">
                {t("Completion")}
              </label>
              <div className="mb-3">
                <input
                  id="Completion"
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={lessonPlanData.Completion}
                  onChange={(e) => setLessonPlanData({ ...lessonPlanData, Completion: e.target.value })}
                />
              </div>
            </div>
            <div className={`col-md-4 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="lessonPlanType" className="weakform-text form-label">
                {t("lessonPlanType")}
              </label>
              <div className="mb-3">
                <input
                  id="lessonPlanType"
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={lessonPlanData.lessonPlanType}
                  onChange={(e) => setLessonPlanData({ ...lessonPlanData, lessonPlanType: e.target.value })}
                />
              </div>
            </div>

            {/* Details Field */}
            <div className={`col-md-12 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="detail" className="weakform-text form-label">
                {t("Details")}
              </label>
              <div className="mb-3">
                <textarea
                  id="detail"
                  rows="5"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={lessonPlanData.detail}
                  onChange={(e) => setLessonPlanData({ ...lessonPlanData, detail: e.target.value })}
                />
              </div>
            </div>
          </div>
          {/* File Upload Section */}
          <div className="row">
            <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              {/* <label htmlFor="documentUpload" className="weakform-text form-label">
                {t("ContentUpload")}
              </label> */}
              <Upload
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                beforeUpload={(file) => {
                  const allowedTypes = [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    alert(t("Invalid file type. Please select a PDF, image, or DOC file."));
                    return Upload.LIST_IGNORE;
                  }
                  setDocumentFile((prev) => [...(prev || []), file]);
                  return false;
                }}
                onRemove={(file) => {
                  setDocumentFile((prev) => prev.filter((f) => f.uid !== file.uid));
                }}
                listType="picture"
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  {t("ContentUpload")}
                </Button>
              </Upload>
            </div>


            <div className={`col-md-6 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              {/* <label htmlFor="videoUpload" className="weakform-text form-label">
                {t("VideoUpload")}
              </label> */}
              <Upload
                multiple
                beforeUpload={(file) => {
                  setVideoFile((prev) => [...(prev || []), file]);
                  return false;
                }}
                onRemove={(file) => {
                  setVideoFile((prev) => prev.filter((f) => f.uid !== file.uid));
                }}
                listType="picture"
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  {t("VideoUpload")}
                </Button>
              </Upload>

            </div>
          </div>

          {/* Form Buttons */}
          <div className="col-md-12 px-4 mt-3">
            <div className="d-flex gap-3 justify-content-end">
              <Link to="/lesson-plan">
                <FlexBtn label={t("Cancel")} color="#463C77" bgColor="#EDEBF1" />
              </Link>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSubmit}
                style={{ backgroundColor: "#463C77", borderColor: "#463C77" }}
              >
                {t("Create")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddLessonPlan;
