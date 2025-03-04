import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Modal from "react-modal";
import AddExamModal from "../../modals/teacher/AddExamModal";
import AddQuestions from "../../modals/teacher/AddQuestions";
import UpdateMcQsModal from "../../modals/teacher/UpdateMcQsModal";
import UpdateQuestionModal from "../../modals/teacher/UpdateQuestionModal";
import UpdateAssignmentModal from "../../modals/teacher/UpdateAssignmentModal";
import ExamCards from "../../Components/Teacher/ExamCards";
import { useTranslation } from "react-i18next";
import CustomDropdown from "../../Components/Common/CustomFilter";
import { getRequest } from "../../services";
import { Spin, Pagination } from "antd";

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
  },
};

const ExamsManagement = () => {

  const [searchQuery, setSearchQuery] = useState('');
  const [classFilterValues, setClassFilterValues] = useState('');
  const [sectionFilterValues, setSectionFilterValues] = useState('');
  const [subjectFilterValues, setSubjectFilterValues] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Number of items per page

  const [examData, setExamData] = useState([]);
  const [classData, setClassData] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [typeOfExam, setTypeOfExam] = useState(0);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [questionID, setQuestionID] = useState(null);
  const [refetchList, setRefetchList] = useState(false);
  const [openQuestionModal, setOpenQuestionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateData, setUpdateData] = useState();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "sa";
  const userID = JSON.parse(localStorage.getItem("user"));

  const handleAddNewExamClick = () => {
    setIsOpen(true);
  };

  const handleClickQuestions = async (question, exam, category) => {
    setLoading(true);
    try {
      let endPoint;
      if (category === "McQs") {
        endPoint = 'mcqs';
      } else if (category === "Question") {
        endPoint = 'questions';
      } else {
        endPoint = 'assignment';
      }

      // Await the API call and ensure the rest of the code runs after receiving the response
      const examData = await fetchExamDataStatus(exam, endPoint);

      // Continue with the rest of the logic after the API call completes
      setNumberOfQuestions(question);
      setQuestionID(exam);
      setTypeOfExam(category);

      if (examData.length !== 0) {
        setOpenQuestionModal(true);
      } else {
        setQuestionsOpen(true);
      }
    } catch (error) {
      console.error("Error handling click questions:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = (question, id) => {
    setOpenQuestionModal(true);
    setQuestionID(id);
    setNumberOfQuestions(question);
  };

  const closeModal = () => setIsOpen(false);
  const UpdateCloseModal = () => setOpenQuestionModal(false);
  const closeQuestionModal = () => {
    setQuestionsOpen(false);
    setRefetchList(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch exam data
      const examResponse = await getRequest(`/api/Exam/exams`);
      const examData = examResponse.data.data;
      setExamData(examData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchClassData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`/api/ClassAssignment/GetMyClasses?userId=${userID.userId}`);
      const data = response.data.data;
      setClassData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
    finally {
      setLoading(false); // Stop loading
    }
  };
  const fetchExamDataStatus = async (examId, endPoint) => {
    try {
      const examResponse = endPoint === 'mcqs' 
        ? await getRequest(`/api/Exam/v2mcqs/?examId=${examId}`)
        : await getRequest(`/api/Exam/${endPoint}?examId=${examId}`);
      const examData = examResponse.data.data;
      setUpdateData(examData);
      return examData;
    } catch (error) {
      console.error("Error fetching data:", error.message);
      return [];
    }
  };

  useEffect(() => {
    fetchClassData();
    fetchData();
  }, []);

  // Dynamically extract unique values from examData
  const classFilter = [...new Set(classData.map(exam => exam.className))];
  const sectionFilter = [...new Set(classData.map(exam => exam.sectionName))];
  const subjectFilter = [...new Set(classData.map(exam => exam.subjectName))];

  const today = new Date();
  const oneDayBefore = new Date(today);
  oneDayBefore.setDate(today.getDate() - 1);
  const oneDayBeforeStr = oneDayBefore.toISOString().split('T')[0];
  const filteredExams = examData.filter(exam => exam.startDate >= oneDayBeforeStr);

  const filteredExamData = filteredExams.filter((exam) => {
    const classMatch = classFilterValues
      ? exam.subjectDetails?.sectionDetails?.classDetails?.className === classFilterValues : true;

    const sectionMatch = sectionFilterValues
      ? exam.subjectDetails?.sectionDetails?.sectionName === sectionFilterValues : true;

    const subjectMatch = subjectFilterValues
      ? exam.subjectDetails?.subjectName === subjectFilterValues : true;

    const searchMatch = searchQuery
      ? exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

    return classMatch && sectionMatch && subjectMatch && searchMatch;
  });

  // Calculate pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedExams = filteredExamData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <AddExamModal
          examData={examData}
          setExamData={setExamData}
          onRequestClose={closeModal}
          fetchData={fetchData}
        />
      </Modal>

      <Modal
        isOpen={openQuestionModal}
        onRequestClose={UpdateCloseModal}
        style={customStyles}
        contentLabel="Update Exam"
      >
        {typeOfExam === 'McQs' ?
          <UpdateMcQsModal
            onRequestClose={UpdateCloseModal}
            updateData={updateData}
            questionID={questionID}
            fetchData={fetchData}
          />
          : typeOfExam === 'Question' ?
            <UpdateQuestionModal
              onRequestClose={UpdateCloseModal}
              updateData={updateData}
              questionID={questionID}
              fetchData={fetchData}
            />
            :
            <UpdateAssignmentModal
              onRequestClose={UpdateCloseModal}
              questionID={questionID}
              updateData={updateData}
              fetchData={fetchData}
            />
        }
      </Modal>

      <Modal
        isOpen={questionsOpen}
        style={customStyles}
        onRequestClose={closeModal}
      >
        <AddQuestions
          onRequestClose={closeQuestionModal}
          typeOfExam={typeOfExam}
          questions={numberOfQuestions}
          questionID={questionID}
          fetchData={fetchData}
        />
      </Modal>

      <div className="container-fluid bg-white rounded px-2 py-2">
        <div className={`row ${isArabic ? "flex-row-reverse" : ""}`}>
          <div className="col-lg-4 mb-3">
            <input
              type="text"
              placeholder={t('searchHear')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className={`w-full p-2 border rounded ${isArabic ? "text-end" : "text-start"}`}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <CustomDropdown
              options={classFilter}
              value={classFilterValues}
              onChange={(value) => {
                setClassFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t('allClasses')}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <CustomDropdown
              options={sectionFilter}
              value={sectionFilterValues}
              onChange={(value) => {
                setSectionFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t('allSections')}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3">
            <CustomDropdown
              options={subjectFilter}
              value={subjectFilterValues}
              onChange={(value) => {
                setSubjectFilterValues(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
              placeholder={t('allSubjects')}
            />
          </div>
          <div className="col-lg-2 col-md-3 col-sm-6 mb-3 d-flex justify-content-end">
            <button
              className={`text-capitalize fs-6 gap-3 d-flex justify-content-between align-items-center btnWithIcon bg-main ${isArabic ? "flex-row-reverse" : ""}`}
              onClick={handleAddNewExamClick}
            >
              <span className="px-1 py-1 fw-4 rounded p-0 addButtonSty">
                <Plus />
              </span>
              <span>{t('addNew')}</span>
            </button>
          </div>
        </div>
        <Spin spinning={loading}>
          <div className={`row text-capitalize mt-3 ${isArabic ? "flex-row-reverse" : ""}`}>
            {!loading && filteredExamData.length === 0 ? (
              <div className="text-center w-100 py-5">
                <h4>{t("No Data Available")}</h4>
              </div>
            ) : (
              paginatedExams.map((exam, index) => (
                <ExamCards
                  exam={exam}
                  key={index}
                  handleClickScheduleExam={examData}
                  quizLoading={false}
                  quizError={null}
                  handleClickQuestions={handleClickQuestions}
                  refetchLists={refetchList}
                  questionData={examData}
                  handleUpdateQuestion={handleUpdateQuestion}
                  fetchData={fetchData}
                />
              ))
            )}
          </div>
          {filteredExamData.length > 0 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                current={currentPage}
                total={filteredExamData.length}
                pageSize={pageSize}
                onChange={handlePageChange}
              />
            </div>
          )}
        </Spin>
      </div>
    </>
  );
};

export default ExamsManagement;
