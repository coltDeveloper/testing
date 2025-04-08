import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, Spin } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { getRequest, postRequest } from "../../services";
import NameAvatar from "../Common/Avatar";
import { message } from 'antd';
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const GradeTableQuestion = (props) => {
  const { filteredExamsId, setExamPublish, setPublishStatus } = props;
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [myQuestion, setMyQuestion] = useState([]);

  const handlePagination = (direction) => {
    setCurrentPage((prev) => (direction === "next" ? prev + 1 : prev - 1));
  };
console.log(props)
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/Grades/question-submission-details?examId=${filteredExamsId[currentPage].id}`
      );
      const status = await getRequest(`/api/Grades/ResultStatus?examId=${filteredExamsId[currentPage].id}`);
      setPublishStatus(status.data)
      const data = response.data;
      setExamPublish({
        Exam: filteredExamsId[currentPage],
        Question: data
      });
      setMyQuestion(data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filteredExamsId[currentPage]?.id]);

  const showModal = (index) => {
    setActiveRowIndex(index);
    setReview(myQuestion[index]?.student?.marksAlloted?.remarks || "");
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const item = myQuestion[activeRowIndex];

    const payload = {
      userId: item.student.studentId,
      subjectId: filteredExamsId[currentPage]?.subjectDetails?.subjectId || "",
      examId: filteredExamsId[currentPage]?.id || "",
      remarks: review || "",
      answers: item.questions.map((question) => ({
        questionId: question.questionId || "",
        marks: question.getMarks || 0,
      })),
    };
    // console.log("pa",payload)
    try {
      const response = await postRequest(`/api/Grades/evaluate-questions`, payload);
      if (response.status === 200 ) {
        message.success(response.data.message || "Update successfully");
        fetchData();
      } else {
        message.error("Failed to save lesson");
      }
    } catch (error) {
      console.error("Error:", error.message);
      message.error("An error occurred while saving the lesson");

    }
  };

  const handleInputChange = (index, questionIndex, value) => {
    const updatedQuestions = [...myQuestion];
    updatedQuestions[index].questions[questionIndex].getMarks = value;
    setMyQuestion(updatedQuestions);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setActiveRowIndex(null);
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: "Student Name",
        dataIndex: "name",
        key: "name",
        fixed: 'left',
        render: (_, record) => (
          <div className="d-flex align-items-center gap-2">
            {record.student.profilePicture ? (
              <img src={record.student.profilePicture} alt="user" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
            ) : (
              <NameAvatar name={record.student.studentName} rounded />
            )}
            <span>{record.student.studentName}</span>
          </div>
        ),
      },
      {
        title: "Score",
        dataIndex: "score",
        key: "score",
        render: (_, record) => `${Math.round(
          (record.questions.reduce((acc, q) => acc + q.marksObtained, 0) /
            record.questions.reduce((acc, q) => acc + q.marks, 0)) * 100
        )}%`,
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        render: (_, record, index) => (
          !record.student.marksAlloted.alloted ? (
            <Button type="primary" size="small" onClick={() => showModal(index)}>
              Add Remark
            </Button>
          ) : (
            record.student.marksAlloted.remarks
          )
        ),
      },
    ];

    const extraColumns = [
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: () => "PP",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: () => "Exam",
      },
      {
        title: "Submitted",
        dataIndex: "submitted",
        key: "submitted",
        render: () => "Yes",
      },
    ];

    const isMobile = window.innerWidth < 768;
    return isMobile ? baseColumns : [...baseColumns.slice(0, 1), ...extraColumns, ...baseColumns.slice(1)];
  };

  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    const handleResize = () => {
      setColumns(getColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const expandedRowRender = (record) => (
    <div className="bg-gray-50 rounded p-6">
      {record.questions.map((question, qIndex) => (
        <div key={qIndex} className="mb-4 border-b pb-4 border-gray-200">
          <p>
            <strong>{qIndex + 1}:</strong> {question.questionText}
          </p>
          <p>
            <strong>Answer:</strong> {question.submissionAnswer}
          </p>
          <p>
            <strong>Total Marks:</strong> {question.marks}
          </p>
          {!record.student.marksAlloted.alloted ? (
            <p className="w-25">
              <Input
                placeholder="Enter marks"
                value={question.getMarks || ""}
                onChange={(e) => handleInputChange(
                  myQuestion.findIndex(q => q.student.studentId === record.student.studentId),
                  qIndex,
                  e.target.value
                )}
              />
            </p>
          ) : (
            <p><strong>Obtained Marks: {question.marksObtained}</strong></p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={myQuestion}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
            expandIcon: ({ expanded, onExpand, record }) => (
              <DownOutlined
                style={{ 
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: '0.3s',
                  cursor: 'pointer'
                }}
                onClick={e => onExpand(record, e)}
              />
            )
          }}
          pagination={false}
          rowKey={(record) => record.student.studentId}
          bordered
          scroll={{ x: 'max-content' }}
          className="responsive-table"
          size="small"
        />
        {filteredExamsId.length > 0 && (
          <div className="flex justify-center mt-4 pb-4 gap-3">
            <Button
              onClick={() => handlePagination("previous")}
              disabled={currentPage < 1}
              icon={<LeftOutlined />}
            />
            <span className="bg-[#241763] text-white px-3 py-1 mx-1 border rounded d-flex align-items-center">
              {`${currentPage + 1}/${filteredExamsId.length}`}
            </span>
            <Button
              onClick={() => handlePagination("next")}
              disabled={currentPage >= filteredExamsId.length - 1}
              icon={<RightOutlined />}
            />
          </div>
        )}
      </Spin>
      <Modal
        title="Add Marks & Remark"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="row p-3">
          {activeRowIndex !== null && myQuestion[activeRowIndex]?.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="col-md-12 mb-3">
              <p><strong>Question {questionIndex + 1}:</strong> {question.questionText}</p>
              <p><strong>Answer:</strong> {question.submissionAnswer}</p>
              <p><strong>Total Marks:</strong> {question.marks}</p>
              <Input
                placeholder="Enter marks"
                value={question.getMarks || ""}
                onChange={(e) => handleInputChange(activeRowIndex, questionIndex, e.target.value)}
                className="mb-2"
              />
            </div>
          ))}
          <div className="col-md-12">
            <Input.TextArea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Enter your remark here"
              rows={4}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeTableQuestion;
