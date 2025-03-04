import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import Counter from "../../Components/Common/Counter";
import { message, Upload, Button } from "antd";
import { Link } from "react-router-dom";
import FlexBtn from "../../Components/Common/FlexBtn";
import { useTranslation } from "react-i18next";
import { postRequest, updateRequest } from "../../services";

const AddQuestions = (props) => {

  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  const ref4 = useRef();

  const [click, setClick] = useState(0);
  const [documentFile, setDocumentFile] = useState([]);
  const [percentage, setPercentage] = useState();
  const refs = [ref1, ref2, ref3, ref4];
  const [quiz, setQuiz] = useState([]);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language;
  const { onRequestClose, questions, typeOfExam, questionID, fetchData, } = props;
  const [loading, setLoading] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState({
    id: 1,
    question: "",
    marks: 1,
    time: 1,
    mcqs: [
      {
        answer: "",
        isCorrect: false,
        isChecked: false,
      },
      {
        answer: "",
        isCorrect: false,
        isChecked: false,
      },
      {
        answer: "",
        isCorrect: false,
        isChecked: false,
      },
      {
        answer: "",
        isCorrect: false,
        isChecked: false,
      },
    ],
  });

  useEffect(() => {
    setPercentage(((click + 1) / questions) * 100);
  }, [click, questions]);

  const dots = Array.from({ length: questions }, (_, i) => i);

  const handleOptionSelect = (mcqIndex) => {
    const updatedMcqs = currentQuestion.mcqs.map((mcq, i) => ({
      ...mcq,
      isChecked: i === mcqIndex,
      isCorrect: i === mcqIndex,
    }));
    setCurrentQuestion({ ...currentQuestion, mcqs: updatedMcqs });
  };

  const handleClickNext = async (action) => {
    if (currentQuestion.question === "") {
      message.warning("Please add a question");
      return;
    } else if (
      typeOfExam === "McQs" &&
      currentQuestion.mcqs.some((mcq) => mcq.answer === "")
    ) {
      message.warning("Please provide all options");
      return;
    } else if (
      typeOfExam === "McQs" &&
      !currentQuestion.mcqs.some((mcq) => mcq.isCorrect)
    ) {
      message.warning("Please mark at least one option as correct");
      return;
    } else if (currentQuestion.marks === 0) {
      message.warning("Marks should be greater than 0");
      return;
    } else if (typeOfExam === "Assignment" && documentFile.length === 0) {
      message.warning("Please upload file");
      return;
    }

    const updatedQuiz = [...quiz];
    updatedQuiz[click] = {
      ...currentQuestion,
      marks: currentQuestion.marks,
      time: currentQuestion.time
    };
    setQuiz(updatedQuiz);

    if (action === "Next") {
      if (click + 1 < questions) {
        const nextQuestion = {
          id: click + 2,
          question: "",
          marks: 1,
          time: 1,
          mcqs: [
            { answer: "", isCorrect: false, isChecked: false },
            { answer: "", isCorrect: false, isChecked: false },
            { answer: "", isCorrect: false, isChecked: false },
            { answer: "", isCorrect: false, isChecked: false },
          ],
        };
        
        setCurrentQuestion(nextQuestion);
        setClick((prev) => prev + 1);
      } else {
        message.success("All questions completed");
      }
      setPercentage(((click + 1) / questions) * 100);
    } else if (action === "Save" || action === "Publish") {
      setLoading(true);
      let formattedQuiz;

      if (typeOfExam === "McQs") {
        const convertQuizFormat = (quiz) =>
          quiz.map((question) => {
            const correctOptionIndex = question.mcqs.findIndex((mcq) => mcq.isCorrect);
            const correctOption =
              correctOptionIndex !== -1
                ? String.fromCharCode(65 + correctOptionIndex)
                : "";

            return {
              examId: questionID,
              question: question.question,
              optionA: question.mcqs[0]?.answer || "",
              optionB: question.mcqs[1]?.answer || "",
              optionC: question.mcqs[2]?.answer || "",
              optionD: question.mcqs[3]?.answer || "",
              marks: question.marks,
              time: question.time,
              correctOption: correctOption,
            };
          });

        formattedQuiz = convertQuizFormat(updatedQuiz);
      } else if (typeOfExam === "Question") {
        formattedQuiz = updatedQuiz.map((question) => ({
          examId: questionID,
          question: question.question,
          marks: question.marks,
          time: question.time,
        }));
      } else if (typeOfExam === "Assignment") {
        try {
          let attachment = null;
          if (documentFile?.length) {
            const formData = new FormData();
            documentFile.forEach((file) => formData.append("files", file)); 

            const docResponse = await postRequest("/api/Document/documents-upload", formData, true);
            attachment = docResponse?.data;
          }
          formattedQuiz = updatedQuiz.map((question) => ({
            examId: questionID,
            title: question.question,
            attachment: attachment[0],
            marks: question.marks
          }));

        } catch (error) {
          console.error("Error:", error.message);
          message.error("An error occurred while saving the exam");
          setLoading(false);
        }
      }
      console.log(formattedQuiz);
      const endPointApi = typeOfExam === "McQs"
        ? `/api/Exam/add-mcqs`
        : typeOfExam === "Assignment"
          ? `/api/Exam/add-assignement`
          : `/api/Exam/add-questions`;
      try {
        const response = await postRequest(
          `${endPointApi}`,
          formattedQuiz
        );
        if (response.data.success) {
          if (action === "Publish") {
            await updateRequest(`/api/Exam/examStatus?id=${questionID}`);
            message.success("Exam is published successfully");
          }
          else {
            message.success(response.data.message || "Exam save successfully");
          }
          onRequestClose();
          fetchData();
        } else {
          message.error("Failed to save the exam");
        }
      } catch (error) {
        message.error("An error occurred while saving the exam");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };
  ;

  const handleClickPrevious = () => {
    if (click > 0) {
      setClick((prev) => prev - 1);
      setCurrentQuestion(quiz[click - 1]);
      setPercentage(((click - 1) / questions) * 100);
    }
  };

  const handleOptionChange = (index, e) => {
    const newMcqs = currentQuestion.mcqs.slice();
    newMcqs[index].answer = e.target.value;
    setCurrentQuestion({ ...currentQuestion, mcqs: newMcqs });
  };

  const handleMarksChange = (action) => {
    if (action === "increment") setCurrentQuestion({ ...currentQuestion, marks: currentQuestion.marks + 1 });
    else if (action === "decrement" && currentQuestion.marks > 1) setCurrentQuestion({ ...currentQuestion, marks: currentQuestion.marks - 1 });
  };

  const handleTimeChange = (action) => {
    if (action === "increment") setCurrentQuestion({ ...currentQuestion, time: currentQuestion.time + 1 });
    else if (action === "decrement" && currentQuestion.time > 1) setCurrentQuestion({ ...currentQuestion, time: currentQuestion.time - 1 });
  };


  return (
    <div className="container-fluid p-0 m-0 pb-4 modalWrapper">
      <div className="row d-flex justify-contents-center p-0 m-0">
        <div className="col-md-12 examModalWrapper p-0 m-0">
          <div className="d-flex justify-content-between align-items-center px-4 col-md-12 examModalHeader">
            <h4 style={{ color: "#060317" }} className="fw-bold">{typeOfExam}</h4>
            <div className="iconWrapper cursor-pointer" onClick={onRequestClose}><X /></div>
          </div>
        </div>
      </div>
      <div className="modalBody">
        <div className="row px-4 m-0 gap-5 mt-4">
          <div className="col-md-4 m-0 p-0">
            <div className="w-100 d-flex flex-column gap-2 justify-content-center">
              <label>{click + 1}/{questions}</label>
              <div className="questionBarProgress">
                {dots.map((_, index) => (
                  <div className={`dot ${index <= click ? "dotWhite" : ""}`} key={index}></div>
                ))}
                <div className="progressBar" style={{ width: percentage + "%" }}></div>
              </div>
            </div>
          </div>
          <div className="col-md-3 m-0 p-0">
            <div className="d-flex gap-3 align-items-center">
              <label>Marks</label>
              <Counter
                value={currentQuestion.marks}
                isFullWidth={true}
                counter="question"
                handleClick={(counter, action) => handleMarksChange(action)}
                disable={click >= questions}
              />
            </div>
          </div>
          {typeOfExam === "Assignment" ? null :
            <div className="col-md-3 m-0 p-0">
              <div className="d-flex gap-3 align-items-center">
                <label>Time</label>
                <Counter
                  value={currentQuestion.time}
                  isFullWidth={true}
                  counter="mins"
                  handleClick={(counter, action) => handleTimeChange(action)}
                  disable={click >= questions}
                />
              </div>
            </div>
           }
        </div>
        <div className="row px-4 mt-5">
          <div className="col-md-12 mb-4">
            <textarea
              rows={3}
              placeholder="Please provide question"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
              className="form-control"
            ></textarea>
          </div>

          {typeOfExam === "Assignment" && (
            <div className={`col-md-12 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
              <label htmlFor="documentUpload" className="weakform-text form-label">
                {t("ContentUpload")}
              </label>
              <Upload
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
                  setDocumentFile([file]);
                  return false;
                }}
                fileList={documentFile}
                onRemove={() => setDocumentFile([])}
                listType="picture"
              >
                <button className="btn btn-primary">{t("Upload File")}</button>
              </Upload>

            </div>
          )}
          {typeOfExam === "McQs" && currentQuestion.mcqs.map((mcq, mcqIndex) => (
            <div className="col-md-6 mb-4" key={mcqIndex}>
              <div className="input-group">
                <div className="input-group-text">
                  <input
                    className="form-check-input mt-0"
                    type="radio"
                    name={`radioGroup-${click}`}
                    checked={mcq.isChecked}
                    onChange={() => handleOptionSelect(mcqIndex)}
                  />
                </div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Option"
                  ref={refs[mcqIndex]}
                  value={mcq.answer}
                  onChange={(e) => handleOptionChange(mcqIndex, e)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="row px-4 m-0 mt-3">
        <div className="col-md-12 d-flex justify-content-end gap-3">
          <Link onClick={handleClickPrevious}>
            <FlexBtn label={t("Previous")} color="#463C77" bgColor="#EDEBF1" disabled={click === 0}></FlexBtn>
          </Link>
          <Button
            type="primary"
            loading={loading}
            onClick={() => handleClickNext(click + 1 === questions ? "Save" : "Next")}
          >
            {click + 1 === questions ? "Save" : "Next"}
          </Button>
          {click + 1 === questions && (
            <Button
              type="primary"
              loading={loading}
              onClick={() => handleClickNext("Publish")}
            >
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddQuestions;
