import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MonitorPlay, FileText } from "lucide-react";
import { logoFrame as viserbe } from "../Constant/images";
import { greenPlayBtn, purplePlayBtn, lightPlayBtn } from "../Constant/svgs";
import { Link, useParams, useLocation } from "react-router-dom";
import { getRequest } from "../services";
import { t } from "i18next";
import { Spin } from "antd";

const LessonDetails = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [startLecture, setStartLecture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [asset, setAsset] = useState();

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/LessonPlan/lesson-plans?subjectId=${id}`
      );
      const data = response.data.data;

      // Sort lessons by date status (past, today, future)
      const currentDate = new Date();
      const currentDateOnly = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      const pastLessons = [];
      const todayLessons = [];
      const futureLessons = [];

      data.forEach(lesson => {
        const lessonDate = new Date(lesson.date);
        const lessonDateOnly = new Date(
          lessonDate.getFullYear(),
          lessonDate.getMonth(),
          lessonDate.getDate()
        );

        if (lessonDateOnly < currentDateOnly) {
          pastLessons.push(lesson);
        } else if (lessonDateOnly.getTime() === currentDateOnly.getTime()) {
          todayLessons.push(lesson);
        } else {
          futureLessons.push(lesson);
        }
      });
console.log(lessons)
      // Combine sorted arrays: past first, then today, then future
      const sortedLessons = [...pastLessons, ...todayLessons, ...futureLessons];

      setLessons(sortedLessons);
      setSelectedLesson(sortedLessons?.[0]);

      // Set initial asset based on first available video or document
      const firstLesson = sortedLessons?.[0];
      if (firstLesson) {
        if (firstLesson.videoUrl?.length) {
          setAsset({
            type: "video",
            url: firstLesson.videoUrl[0]
          });
        } else if (firstLesson.documentUrl?.length) {
          setAsset({
            type: "document",
            url: firstLesson.documentUrl[0]
          });
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
    const currentTime = new Date().toTimeString().split(" ")[0];

    const todaySchedule = state.schedules.find(
      (schedule) =>
        schedule.day === currentDay &&
        currentTime >= schedule.startTime &&
        currentTime <= schedule.endTime
    );

    if (todaySchedule) {
      setStartLecture(true)
    } else {
      setStartLecture(false)
    }
  }, []);

  const getPlayButton = (lessonDate) => {
    const currentDate = new Date();
    const lessonDateTime = new Date(lessonDate);

    const currentDateOnly = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const lessonDateOnly = new Date(
      lessonDateTime.getFullYear(),
      lessonDateTime.getMonth(),
      lessonDateTime.getDate()
    );

    if (lessonDateOnly < currentDateOnly) {
      return greenPlayBtn;
    } else if (lessonDateOnly.getTime() === currentDateOnly.getTime()) {
      return purplePlayBtn;
    } else {
      return lightPlayBtn;
    }
  };

  return (
    <>
      <div className="container-fluid">
        <Spin spinning={loading}>
          <div className="row mt-3">
            {/* Video container */}
            <div className="col-md-12 col-lg-8">
              {asset?.type === "video" && (
                <div className="video">
                  <video
                    key={asset?.url}
                    autoPlay
                    loop
                    controls
                    className="rounded-md w-100"
                  >
                    <source src={asset?.url} />
                  </video>
                </div>
              )}
              {asset?.type === "document" && (
                <div className="document-preview">
                  {(asset?.url.endsWith(".doc") || asset?.url.endsWith(".docx")) && (
                    <iframe
                      src={`https://docs.google.com/gview?url=${asset?.url}&embedded=true`}
                      sandbox="allow-scripts allow-same-origin"
                      className="document-viewer"
                      title="Document Viewer"
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                      }}
                    ></iframe>
                  )}
                  {asset.url?.endsWith(".pdf") && (
                    <iframe
                      src={asset?.url}
                      className="document-viewer"
                      title="PDF Viewer"
                      style={{
                        width: "100%",
                        height: "600px",
                        border: "none",
                      }}
                    ></iframe>
                  )}
                  {[".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) =>
                    asset.url?.endsWith(ext)
                  ) && (
                      <div className="image-preview">
                        <img
                          src={asset?.url}
                          alt="Missing Preview"
                          className="image-viewer"
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "600px",
                            border: "none",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}
                </div>
              )}
              <div className="reviewAboutChannel position-relative top-4">
                <div className="bottom-part d-flex justify-content-between flex-wrap ">
                  <div className=" d-flex flex-wrap gap-2 w-50">
                    <div className="img-viserbe ">
                      <img src={viserbe} className="img-fluid" alt="" />
                    </div>
                    <div className="viserbe-text d-flex flex-column">
                      <span className="viser-helper fw-bold">{selectedLesson?.topic}</span>
                      <span className="digital-studio">Design Studio</span>
                    </div>
                  </div>
                </div>
                <hr className="line w-100 mt-1" />
                <div className="container-fluid">
                  <h3 className="fw-bold pt-3">About Lesson</h3>
                  <p>{selectedLesson?.detail}</p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div
              className="col-md-12 col-lg-4 p-4 rounded-4 shadow-sm"
              style={{
                background: "#f9f9f9",
                border: "1px solid #ddd",
              }}
            >
              {startLecture ? (
                <Link
                  to={`/live-call`}
                  state={{ subjectId: state?.subjectId }}
                  className="btn btn-primary w-100 mb-4"
                >
                  {t("JoinLecture")}
                </Link>
              ) : (
                <button className="btn btn-primary w-100 mb-4" disabled>
                  {t("JoinLecture")}
                </button>
              )}

              {/* Lesson List */}
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {lessons.length > 0 ? (
                  lessons?.map((lesson, index) => (
                    <div
                      key={index}
                      className="mb-3 p-3 rounded shadow-sm"
                      style={{
                        background: selectedLesson === index ? "#e3f2fd" : "#ffffff",
                        cursor: "pointer",
                        transition: "0.3s",
                      }}
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ transform: "scale(2)" }}>{getPlayButton(lesson.date)}</span>
                          <span className="fw-bold" style={{ fontSize: "16px" }}>
                            {lesson.topic} ({(lesson.videoUrl?.length || 0) + (lesson.documentUrl?.length || 0)})
                          </span>
                        </div>
                        {selectedLesson?.id === lesson?.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      {selectedLesson?.id === lesson?.id && (
                        <ul
                          className="mt-3 ps-3"
                        >
                          {lesson.videoUrl?.map((video) => (
                            <li className="d-flex justify-content-start align-items-center gap-2" style={{ padding: "5px 0", fontSize: "14px" }}>
                              <MonitorPlay size={16} className="ms-1 text-primary" />
                              <span
                                onClick={() => setAsset({ type: "video", url: video })}
                                style={{
                                  color: "#241763",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                              >
                                Watch Video
                              </span>
                            </li>
                          ))}
                          {lesson.documentUrl?.map((document) => (
                            <li className="d-flex justify-content-start align-items-center gap-2" style={{ padding: "5px 0", fontSize: "14px" }}>
                              <FileText size={16} className="ms-1 text-primary" />
                              <span
                                onClick={() => setAsset({ type: "document", url: document })}
                                style={{
                                  color: "#241763",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                              >
                                Read Document
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center w-100 py-5">
                    <h4>{t("No Data Available")}</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </>
  );
};

export default LessonDetails;
