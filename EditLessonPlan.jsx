import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getRequest, updateRequest, postRequest } from '../../services';
import ReactCustomDatePicker from '../../Components/Common/ReactCustomDatePicker';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FlexBtn from "../../Components/Common/FlexBtn";
import { UploadOutlined } from '@ant-design/icons';
import { Spin, message, Button, Upload } from 'antd';
import { validator } from '../../Constant/validator';
import { DeleteOutlined, FileOutlined } from '@ant-design/icons';

const EditLessonPlan = (props) => {

  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [myDataClass, setMyDataClass] = useState([]);
  const { t, i18n } = useTranslation();
  const { onRequestClose, lessonID, fetchData, userID } = props;
  const isArabic = i18n.language;
  const [documentFile, setDocumentFile] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  const [videoFile, setVideoFile] = useState([]);
  const [videoList, setVideoList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRequest(`/api/LessonPlan/${lessonID}`);
        const data = response.data.data;

        setMyData(data);

        // Populate documentFile and videoFile from the URLs
        setDocumentList(data.documentUrl || []);
        setVideoList(data.videoUrl || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDataFromClass = async () => {
      try {
        const response = await getRequest(
          `/api/ClassAssignment/GetAssignedClasses?userId=${userID.userId}`
        );
        const data = response.data.data;
        setMyDataClass(data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchDataFromClass();
    fetchData();
  }, [lessonID]);


  const handleInputChange = (field, value) => {
    setMyData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleDateChange = (date) => {
    handleInputChange('date', date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const objFormData = {
      Topic: myData.topic,
      Date: myData.date,
      // Completion: myData.Completion,
      Lesson_Plan_Type: myData.lessonPlanType,
    };
    const validate = validator(objFormData);
    if (validate !== "success") {
      message.error(validate);
    }
    else {
      setSubmitLoading(true);
      try {
        // Upload document files if selected
        let document = null;
        if (documentFile?.length) {
          const formData = new FormData();
          documentFile.forEach((file) => formData.append("files", file)); // Append all files

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
        const myAllDocument = (document ? [document] : []).concat(documentList).flat();
        const myAllVideo = (video ? [video] : []).concat(videoList).flat();
        const payload = {
          ...myData,
          document: myAllDocument,
          video: myAllVideo,
        };
        const response = await updateRequest(`/api/LessonPlan/${lessonID}`, payload);
        if (response.status === 200 && response.data.success) {
          message.success(response.data.message || "Lesson Plan Update successfully");
          onRequestClose();
          fetchData();
        } else {
          message.error("Failed to save lesson");
        }

      } catch (error) {
        message.error('Error updating lesson plan:');
      } finally {
        setSubmitLoading(false);
      }
    }
  };


  if (loading) {
    return <div className='d-flex align-items-center justify-content-center py-4'><Spin /></div>;
  }
  const findClassSectionSubject = () => {
    const { classId, sectionId, subjectId } = myData; // Assuming myData has these fields
    const classItem = myDataClass.find(item => item.classId === classId);
    if (!classItem) return null;
    const sectionItem = classItem.classSections.find(section => section.id === sectionId);
    if (!sectionItem) return null;
    const subjectItem = sectionItem.subjects.find(subject => subject.id === subjectId);
    if (!subjectItem) return null;
    return {
      className: classItem.className,
      sectionName: sectionItem.sectionName,
      subjectName: subjectItem.subjectName,
    };
  };

  const classNameID = findClassSectionSubject();

  const handleDeleteFile = (index) => {
    setDocumentList((prev) => prev.filter((_, i) => i !== index));
    message.success('File deleted successfully.');
  };
  const handleDeleteVideo = (index) => {
    setVideoList((prev) => prev.filter((_, i) => i !== index));
    message.success('File deleted successfully.');
  };
  const trimValueFile = (url) => {
    if (url) {
      return url.replace('https://lms-api.wiserbee.ca/Upload/', '');
    }
    return ''; // Return an empty string if url is null or undefined
  };
  const trimValueVideo = (url) => {
    if (url) {
      return url.replace('https://lms-api.wiserbee.ca/Upload/', '');
    }
    return ''; // Return an empty string if url is null or undefined
  };

  return (
    <>

      <div className='d-flex flex-column w-100 m-0 p-0'>
        <div className="row d-flex justify-content-center p-0 m-0">
          <div className="col-md-12 examModalWrapper p-0 m-0">
            <div className={`d-flex justify-content-between align-items-center px-4 col-md-12 examModalHeader studentProfileHeading ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <h4 style={{ color: "#060317" }} className="fw-bold">
                {t('EditLessonPlan')}
              </h4>
              <div className="iconWrapper cursor-pointer" onClick={onRequestClose}>
                <X />
              </div>
            </div>
          </div>
        </div>
        <form className="">
          <div className='px-3 py-2 editModalLesson'>
            <div className={`row mb-3 ${isArabic === "sa" ? "flex-row-reverse" : ""}`}>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Class")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={classNameID?.className || ''}
                  disabled
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Section")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={classNameID?.sectionName || ''}
                  disabled
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Subject")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={classNameID?.subjectName || ''}
                  disabled
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Day")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={myData?.day || ''}
                  disabled
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Time")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={`${myData?.startTime || ''} - ${myData?.endTime || ''}`}
                  disabled
                />
              </div>

              {/* Editable Fields */}
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Topic")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={myData?.topic || ''}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("lessonPlanType")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={myData?.lessonPlanType || ''}
                  onChange={(e) => handleInputChange('lessonPlanType', e.target.value)}
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Date")}</label>
                <ReactCustomDatePicker
                  placeholder="Select a date"
                  getDate={(name, date) => handleDateChange(date)}
                  popperModifiers={[{ name: 'preventOverflow', enabled: true }]}
                  name="date"
                  selectedDate={myData?.date ? new Date(myData.date) : null}
                  day={myData?.day}
                />
              </div>
              <div className={`col-md-6 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Completion")}</label>
                <input
                  type="text"
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={myData?.completion || ''}
                  onChange={(e) => handleInputChange('completion', e.target.value)}
                />
              </div>
              <div className={`col-md-12 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                <label className="form-label">{t("Details")}</label>
                <textarea
                  type="text"
                  rows='3'
                  className={`form-control ${isArabic === "sa" ? 'text-end' : 'text-start'}`}
                  value={myData?.detail || ''}
                  onChange={(e) => handleInputChange('detail', e.target.value)}
                />
              </div>
              {/* File Upload Section */}
              <div className="row mt-3 my-3">
                <div className={`col-md-12 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                  <Upload
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Restrict visible file types
                    beforeUpload={(file) => {
                      // Allow only specific file types (additional validation for safety)
                      const allowedTypes = [
                        "application/pdf",
                        "image/jpeg",
                        "image/png",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ];
                      if (!allowedTypes.includes(file.type)) {
                        alert(t("Invalid file type. Please select a PDF, image, or DOC file."));
                        return Upload.LIST_IGNORE; // Prevent adding invalid files to the list
                      }
                      setDocumentFile((prev) => [...(prev || []), file]);
                      return false; // Prevent auto-upload
                    }}
                    listType="picture"
                  >
                    <Button type="primary" icon={<UploadOutlined />}>
                      {t("ChooseFile")}
                    </Button>
                  </Upload>
                  <div className="document-list mt-3 ">
                    <div className='d-flex flex-column gap-3'>
                      {documentList.map((file, index) => (
                        <div key={index} className='d-flex justify-content-between align-item-center gap-3 uploadOutline'>
                          <FileOutlined style={{ fontSize: '1.5em', color: '#1677ff' }} />
                          <a href={file} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                            {trimValueFile(file)}
                          </a>
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() =>  handleDeleteFile(index)}
                            style={{ marginLeft: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`col-md-12 mt-3 ${isArabic === "sa" ? 'text-end' : 'text-start'}`}>
                  <Upload
                    multiple
                    beforeUpload={(file) => {
                      setVideoFile((prev) => [...(prev || []), file]);
                      return false; // Prevent auto-upload
                    }}
                    listType="picture"
                  >
                    <Button type="primary" icon={<UploadOutlined />}>
                      {t("ChooseFile")}
                    </Button>
                  </Upload>
                  <div className="document-list mt-3 ">
                    <div className='d-flex flex-column gap-3'>
                      {videoList.map((file, index) => (
                        <div key={index} className='d-flex justify-content-between align-item-center gap-3 uploadOutline'>
                          <FileOutlined style={{ fontSize: '1.5em', color: '#1677ff' }} />
                          <a href={file} target="_blank" rel="noopener noreferrer" style={{ flex: 1 }}>
                            {trimValueVideo(file)}
                          </a>
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={() =>  handleDeleteVideo(index)}
                            style={{ marginLeft: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <div className="col-md-12 px-4 py-3">
            <div className="d-flex gap-3 justify-content-end">
              <Link onClick={onRequestClose}>
                <FlexBtn label={t("Cancel")} color="#463C77" bgColor="#EDEBF1" />
              </Link>
              <Button 
                type="primary"
                loading={submitLoading}
                onClick={handleSubmit}
                style={{ backgroundColor: "#463C77", borderColor: "#463C77" }}
              >
                {t("Update")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditLessonPlan;
