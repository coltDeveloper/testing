import { useState, useRef, useEffect } from "react";
import CoursesList from "../Components/Home/CoursesList";
import TaskNotifications from "../Components/Home/TaskNotifications";
import TaskNotificationsChild from "../Components/parent/TaskNotificationChild";
import { Pagination } from "antd";
import ClassView from "../Components/Teacher/ClassView";
import QuickMessages from "../Components/Teacher/QuickMessages";
import Course from "../Components/Common/Course";
import { chatSvg } from "../Constant/svgs";
import Chatbot from "../Components/Common/Chatbot";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import WelcomeSection from "../Components/Common/WelcomeSection";
import UpcomingClasses from "../Components/parent/UpcomingClasses";
import Chart from "../Components/parent/analytics/Chart";
import { useTranslation } from "react-i18next";
import { getRequest } from "../services";
import { Spin } from "antd";

const Home = () => {

  const { t, i18n } = useTranslation();
  const [chatOpened, setChatOpened] = useState(false);

  const chatRef = useRef(null);
  const auth = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const user = auth.user;
  const isArabic = i18n.language;

  const [CoursesListValue, setCourseListValue] = useState([]);
  const handleChatClick = () => {
    setChatOpened(!chatOpened);
  };

  const chatVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeInOut" }, // Adjust duration and easing as desired
    },
    closed: {
      opacity: 0,
      y: "100%", // Adjust y-axis offset based on your layout needs
      transition: { duration: 0.5, ease: "easeInOut" }, // Adjust duration and easing as desired
    },
  };

  const fetchDataCourses = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getRequest(
        `/api/Course?pageNumber=${page}&pageSize=${pageSize}`
      );
      const data = response.data.data;
      setCourseListValue(data);
      
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
    finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchDataCourses();
  }, []);

  return (
    <>
      <section className="dashboardWrapper d-flex flex-column ">
        {user === "parent" ? null : <WelcomeSection />}
        {user === "teacher" && (
          <div className="col-lg-12 ">
            <div className={`row ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
              <div className="col-lg-8">
                {/* <h3 className={`myClassesHeading ${isArabic === "sa" ? "text-end" : ""}`}>{t('MyCourses')}</h3> */}
                <Course useToggle={false} count={3} homeRender={true} suggested={false} />
              </div>
              <div className="align-self-start mt-4 col-12 col-lg-4 ">
                <div className="taskListView shadow">
                  <h4 className={`mb-4 ${isArabic === "sa" ? "text-end" : ""}`}>{t('Tasks')}</h4>
                  <TaskNotifications/>
                </div>
              </div>
            </div>
            <div className={`row mt-5 ${isArabic === "sa" ? 'flex-row-reverse' : ''}`}>
              <div className="col-12 col-lg-8">
                <h3 className={`myClassesHeading ${isArabic === "sa" ? "text-end" : ""}`}>  {t('Today')} {t('MyClasses')}</h3>
                <div className="row">
                  <ClassView />
                </div>
              </div>
              <div className="col-12 col-lg-4 d-flex align-items-stretch">
                <QuickMessages isArabic={isArabic} />
              </div>
            </div>
          </div>
        )}
        {user === "student" ? (
          <div className="row">
            <div className="col-12 col-lg-8">
              <div className="CoursesDetails">
                <h3 className="myClassesHeading">{t('MyCourses')}</h3>
                <div className="position-relative" style={{minHeight: "200px"}}>
                  <Spin spinning={loading} className="position-absolute top-50 start-50 translate-middle">
                    {CoursesListValue?.items?.map((item, index) => (
                      <CoursesList
                        key={index}
                        item={item}
                      />
                    ))}
                  </Spin>
                  <div className="d-flex justify-content-end mt-4">
                    <Pagination
                      current={CoursesListValue?.pageNumber || 1}
                      pageSize={CoursesListValue?.pageSize || 10}
                      total={CoursesListValue?.totalCount || 0}
                      onChange={(page, pageSize) => {
                        // Handle page change
                        fetchDataCourses(page, pageSize);
                      }}
                      showSizeChanger={false}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="align-self-start mt-4 col-12 col-lg-4 ">
              <div className="taskListView shadow">
                <h4 className="mb-4">{t('Tasks')}</h4>
                <TaskNotifications />
              </div>
            </div>
          </div>
        ) : null}
        {user === "parent" && (
          <div className="container-fluid pr-0">
            <div className="row mt-4 gy-2">
              {/* <div className="w-100 bg-primary"></div> */}
              <div className="col-12 col-sm-12 col-lg-8 bg-white shadow taskListView d-flex flex-column gap-3 overflow-hidden">
                <div className="d-flex justify-content-between ">
                  <div>
                    <h4>Student Performance</h4>
                    <p className="text-secondary">June 2022</p>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="dotGraph"></div>
                    <h4 className="m-0 p-0 fs-6">Jennifer Markus</h4>
                  </div>
                </div>
                <Chart />
              </div>
              <div className="col-12 col-lg-4  p-0  px-lg-3">
                <div className="taskListView shadow">
                  <h4 className="mb-4">{t('Tasks')}</h4>
                  <TaskNotificationsChild />
                </div>
              </div>
            </div>
            <div className="row pb-4">
              <div className="col-lg-8">
                  <h1 className="myClassesHeading mb-3 mt-5">Upcoming Classes</h1>
                  <UpcomingClasses />
              </div>
              <div className="col-12 col-lg-4 d-flex align-items-stretch mt-4">
                <QuickMessages />
              </div>
            </div>
          </div>
        )}
        <AnimatePresence>
          <div
            className={`chatbotIconWrapper ${chatOpened ? "chatOpened" : "chatClosed"
              }`}
            onClick={handleChatClick}
          >
            {chatOpened ? <X className="closeIcon" /> : chatSvg}
          </div>

          <motion.div
            ref={chatRef}
            variants={chatVariants}
            animate={chatOpened ? "open" : "closed"}
            style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          >
            {chatOpened ? <Chatbot /> : null}
          </motion.div>
        </AnimatePresence>
      </section>
    </>
  );
};

export default Home;