import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, Spin } from "antd";
import { DownOutlined, DownloadOutlined } from "@ant-design/icons";
import { getRequest, postRequest } from "../../services";
import { message } from 'antd';
import NameAvatar from "../Common/Avatar";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const GradeTableAssignment = (props) => {
  const { filteredExamsId, setExamPublish, setPublishStatus } = props;
  const [currentPage, setCurrentPage] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [myQuestion, setMyQuestion] = useState([]);
  const [mytotalMarks, setMytotalMarks] = useState({});
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const showModal = (index) => {
    setActiveRowIndex(index);
    setReview(myQuestion[index]?.remarks || "");
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    const item = myQuestion[activeRowIndex];
    await handleSaveMarks(item);
    setIsModalVisible(false);
    setActiveRowIndex(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setActiveRowIndex(null);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/Grades/assignment-submission-details?examId=${filteredExamsId[currentPage]?.id}`
      );
      const status = await getRequest(`/api/Grades/ResultStatus?examId=${filteredExamsId[currentPage].id}`);
      setPublishStatus(status.data);
      setExamPublish({
        Exam: filteredExamsId[currentPage],
        Question: response.data[0]
      });
      setMytotalMarks(response.data[0] || {});
      setMyQuestion(response.data[0]?.submissions || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filteredExamsId[currentPage]?.id]);

  const handlePagination = (direction) => {
    setCurrentPage((prev) =>
      direction === "next" ? prev + 1 : prev - 1
    );
  };

  const handleInputChange = (index, value) => {
    const updatedQuestions = [...myQuestion];
    updatedQuestions[index].marks = value;
    setMyQuestion(updatedQuestions);
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
              <NameAvatar name={record.student.name} rounded />
            )}
            <span>{record.student.name}</span>
          </div>
        ),
      },
      {
        title: "Score",
        dataIndex: "score",
        key: "score",
        render: (_, record) => {
          const totalMarks = mytotalMarks.marks || 1; // Prevent division by zero
          return `${Math.round((record.marksObtained / totalMarks) * 100)}%`;
        },
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        render: (_, record, index) => (
          !record.student.marksAlloted.alloted ? (
            <Button type="primary" size="small" onClick={() => showModal(index)}>
              Add Marks
            </Button>
          ) : (
            record.remarks
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
        render: () => "Assignment",
      },
      {
        title: "Submitted At",
        dataIndex: "submittedAt",
        key: "submittedAt",
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
      <p>
        <strong>File:</strong>{" "}
        <a
          href={record.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600"
        >
          Download <DownloadOutlined style={{ marginLeft: '4px' }} />
        </a>
      </p>
      <p>
        <strong>Submitted At:</strong> {record.submittedAt}
      </p>
      <p>
        <strong>Total Marks:</strong> {mytotalMarks.marks || 0}
      </p>
      {!record.student.marksAlloted ? (
        <>
          <div className="mt-3 mb-3">
            <Input
              placeholder="Enter marks"
              value={record.marks || ""}
              onChange={(e) => handleInputChange(
                myQuestion.findIndex(q => q.student.studentId === record.student.studentId),
                e.target.value
              )}
              style={{ width: '200px' }}
            />
          </div>
          <Button type="primary" onClick={() => showModal(myQuestion.findIndex(q => q.student.studentId === record.student.studentId))}>
            Add Remark & Save
          </Button>
        </>
      ) : (
        <p><strong>Obtained Marks:</strong> {record.marksObtained}</p>
      )}
    </div>
  );

  const handleSaveMarks = async (item) => {
    const payload = {
      userId: item.student.studentId,
      subjectId: filteredExamsId[0]?.subjectDetails?.subjectId || "",
      examId: filteredExamsId[currentPage].id || "",
      remarks: review || "",
      marks: item.marks || "",
    };

    try {
      const response = await postRequest(`/api/Grades/evaluate-assignment`, payload);
      if (response.status === 200 || response.statusText) {
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
          {activeRowIndex !== null && (
            <div className="col-md-12 mb-3">
              <p><strong>Total Marks:</strong> {mytotalMarks.marks || 0}</p>
              <Input
                placeholder="Enter marks"
                value={myQuestion[activeRowIndex]?.marks || ""}
                onChange={(e) => handleInputChange(activeRowIndex, e.target.value)}
                className="mb-3"
              />
              <Input.TextArea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Enter your remark here"
                rows={4}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GradeTableAssignment;
