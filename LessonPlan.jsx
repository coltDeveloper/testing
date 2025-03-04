import React, { useEffect, useState } from "react";
import { Plus, Trash2, EditIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getRequest,deleteRequest } from "../../services";
import Modal from "react-modal";
import EditLessonPlan from "../../modals/teacher/EditLessonPlan";
import { bookSvg, calanderSvg } from "../../Constant/svgs";
import CustomDropdown from "../../Components/Common/CustomFilter";
import { formatTime } from "../../Constant/date";
import { Spin, Modal as AntdModal, notification, Pagination } from "antd";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    border: "none",
    overflow: "auto",
  },
};

const LessonPlans = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [lessonID, setId] = useState(null);
  const [lessonIndex, setIndex] = useState(null);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const [myData, setMyData] = useState([]);
  const [myDataClass, setMyDataClass] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilterValues, setClassFilterValues] = useState("");
  const [sectionFilterValues, setSectionFilterValues] = useState("");
  const [subjectFilterValues, setSubjectFilterValues] = useState("");
  const userID = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Number of items per page

  const fetchData = async () => {
    setLoading(true); // Start loading
    try {
      const response = await getRequest(
        `/api/LessonPlan/teacher-lessonPlans?teacherId=${userID.userId}`
      );
      const data = response.data.data;
      setMyData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const fetchDataFromClass = async () => {
    setLoading(true); // Start loading
    try {
      const response = await getRequest(
        `/api/ClassAssignment/GetAssignedClasses?userId=${userID.userId}`
      );
      const data = response.data.data;
      setMyDataClass(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };
  useEffect(() => {
    fetchDataFromClass();
    fetchData();
  }, []);

  const findClassSectionAndSubject = (classId, sectionId, subjectId) => {
    const classObj = myDataClass.find((cls) => cls.classId === classId);
    if (!classObj)
      return {
        className: "Not Found",
        sectionName: "Not Found",
        subjectName: "Not Found",
      };

    const sectionObj = classObj.classSections.find(
      (section) => section.id === sectionId
    );
    if (!sectionObj)
      return {
        className: classObj.className,
        sectionName: "Not Found",
        subjectName: "Not Found",
      };

    const subjectObj = sectionObj.subjects.find(
      (subject) => subject.id === subjectId
    );
    return {
      className: classObj.className,
      sectionName: sectionObj.sectionName,
      subjectName: subjectObj ? subjectObj.subjectName : "Not Found",
    };
  };

  const confirmDelete = (id) => {
    AntdModal.confirm({
      title: "Confirm Deletion",
      content: "Are you sure you want to delete this lesson?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await deleteMyLesson(id); // Call the delete function
      },
      onCancel: () => {
        notification.info({
          message: "Deletion Canceled",
          description: "You have canceled the deletion of the lesson.",
        });
      },
    });
  };
  
  const deleteMyLesson = async (id) => {
    try {
      const response = await deleteRequest(`/api/LessonPlan/${id}`);
      if (response.data.success) {
        fetchData();
        notification.success({
          message: "Success",
          description: "The lesson was deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting lesson:", error.message);
      notification.error({
        message: "Error",
        description: "An error occurred while deleting the lesson. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClickItem = (id, index) => {
    setId(id);
    setIndex(index);
    setEdit(true);
  };

  // Extract unique filter values dynamically
  const classFilter = Array.from(
    new Set(myDataClass.map((cls) => cls.className))
  );
  const sectionFilter = Array.from(
    new Set(
      myDataClass.flatMap((cls) => cls.classSections.map((sec) => sec.sectionName))
    )
  );
  const subjectFilter = Array.from(
    new Set(
      myDataClass.flatMap((cls) =>
        cls.classSections.flatMap((sec) =>
          sec.subjects.map((sub) => sub.subjectName)
        )
      )
    )
  );

  
  // Filter and search functionality
  const filteredLessons = myData.filter((lesson) => {
    const { classId, sectionId, subjectId, topic } = lesson;
    const { className, sectionName, subjectName } = findClassSectionAndSubject(
      classId,
      sectionId,
      subjectId
    );

    const matchesClassFilter =
      !classFilterValues || classFilterValues === className;
    const matchesSectionFilter =
      !sectionFilterValues || sectionFilterValues === sectionName;
    const matchesSubjectFilter =
      !subjectFilterValues || subjectFilterValues === subjectName;
    const matchesSearchQuery = topic
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return (
      matchesClassFilter &&
      matchesSectionFilter &&
      matchesSubjectFilter &&
      matchesSearchQuery
    );
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLessons = filteredLessons.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Modal
        isOpen={edit}
        onRequestClose={() => setEdit(false)}
        style={customStyles}
      >
        <EditLessonPlan
          onRequestClose={() => setEdit(false)}
          lessonID={lessonID}
          lessonIndex={lessonIndex}
          fetchData={fetchData}
          userID={userID}
        />
      </Modal>
      <div className="container-fluid">
        <div className={`row ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
          <div className="col-lg-4 mb-3 ">
            <input
              type="text"
              placeholder={t("searchHear")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className={`w-full p-2 border rounded ${isArabic === "sa" ? "text-end" : "text-start"
                }`}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3 ">
            <CustomDropdown
              options={classFilter}
              value={classFilterValues}
              onChange={(value) => {
                setClassFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t("allClasses")}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3 ">
            <CustomDropdown
              options={sectionFilter}
              value={sectionFilterValues}
              onChange={(value) => {
                setSectionFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t("allSections")}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3 ">
            <CustomDropdown
              options={subjectFilter}
              value={subjectFilterValues}
              onChange={(value) => {
                setSubjectFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t("allSubjects")}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3 d-flex justify-content-end">
            <button
              className={`text-capitalize fs-6 gap-3 d-flex justify-content-between align-items-center btnWithIcon bg-main ${isArabic === "sa" ? "flex-row-reverse" : ""
                }`}
              onClick={() => navigate("/add-lesson-plan")}
            >
              <span className="px-1 py-1 fw-4 rounded p-0 addButtonSty">
                <Plus />
              </span>
              <span>{t("addNew")}</span>
            </button>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className={`row text-capitalize py-2 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
            {!loading && filteredLessons.length === 0 ? (
              <div className="text-center w-100 py-5">
                <h4>{t("No Data Available")}</h4>
              </div>
            ) : (
              paginatedLessons.map((lesson, index) => {
                const { className, sectionName, subjectName } = findClassSectionAndSubject(
                  lesson.classId,
                  lesson.sectionId,
                  lesson.subjectId
                );
                return (
                  <div
                    className="col-md-6 col-lg-4 cursor-pointer py-2"
                    key={`${index}`}
                  >
                    <div className="d-flex flex-column align-items-between bg-white examDataWrapper px-2 py-3 borderRadius_15">
                      <div className={`d-flex justify-content-between ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                        <h4
                          className={`fw-bold p-0 m-0 fs-6 cursor-pointer px-2 ${isArabic === "sa" ? "text-end" : ""}`}
                        >
                          {lesson.topic}
                        </h4>
                        <div className={`d-flex justify-content-start gap-2 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          <EditIcon size={20} color="#fff" onClick={() => handleClickItem(lesson.id, index)} />
                          <Trash2 size={20} color="#fff" onClick={() => confirmDelete(lesson.id)} />
                        </div>
                      </div>
                      <div
                        className={`d-flex justify-content-start gap-3 examChipsWrapper mt-3 px-2 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
                      >
                        <div className="d-flex examChip">{className}</div>
                        <div className="d-flex examChip">
                          {sectionName?.startsWith("Section")
                            ? sectionName
                            : `Section ${sectionName}`}
                        </div>
                        <div className="d-flex examChip">{subjectName}</div>
                      </div>
                      <div
                        className={`d-flex gap-3 mt-3 align-items-center justify-content-between examSvgsText px-2 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          {calanderSvg}
                          <span className="p-0 m-0">{new Date(lesson.date).toISOString().split("T")[0]}</span>
                        </div>
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          {calanderSvg}
                          <span className="p-0 m-0">{lesson.day}</span>
                        </div>
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          {bookSvg}
                          <span>{lesson.lessonPlanType}</span>
                        </div>
                      </div>
                      <div
                        className={`d-flex gap-3 mt-3 align-items-center justify-content-between examSvgsText px-2 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          <span>{t("StartTime")}</span>
                          <p className="p-0 m-0">{lesson.startTime}</p>
                        </div>
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          <span>{t("EndTime")}</span>
                          <p className="p-0 m-0">{lesson.endTime}</p>
                        </div>
                        <div className={`d-flex gap-2 align-items-center ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
                          <span>{t("Duration")}</span>
                          <p className="p-0 m-0">
                            {formatTime(lesson.startTime, lesson.endTime)} {t("Mins")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {filteredLessons.length > 0 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                current={currentPage}
                total={filteredLessons.length}
                pageSize={pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </Spin>
      </div>
    </>
  );
};

export default LessonPlans;
