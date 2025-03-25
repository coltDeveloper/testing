import React, { useState, useEffect } from "react";
import { clockSvg, studentSvg } from "../../Constant/svgs";
import { CalendarCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRequest } from "../../services";
import { formatTime } from "../../Constant/date";
import { useNavigate } from "react-router-dom";
import { Pagination } from "antd"; // Import Pagination from antd

const ClassView = () => {

    const [loading, setLoading] = useState(false);
    const [classData, setClassData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const [pageSize] = useState(6);
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language;
    const navigate = useNavigate();


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getRequest(`/api/ClassAssignment/MyClasses`);
            const data = response.data.data;
            console.log(data)
            setClassData(data);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filterClassesByCurrentDay = (classData) => {
        const daysOfWeek = [
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        const currentDay = daysOfWeek[new Date().getDay()];

        return classData.map(classItem => ({
            ...classItem,
            subjects: classItem.subjects.map(subject => ({
                ...subject,
                schedules: subject.schedules.filter(schedule => schedule.day === currentDay)
            })).filter(subject => subject.schedules.length > 0) // Keep only subjects that have schedules for today
        })).filter(classItem => classItem.subjects.length > 0); // Keep only classes with subjects for today
    };

    const currentDayClasses = filterClassesByCurrentDay(classData);

    const subjectsList = currentDayClasses.length > 0 ? currentDayClasses[0].subjects : [];

    const paginatedSubjects = subjectsList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <>
            {!loading && subjectsList.length === 0 ? (
                <div className="text-center w-100 py-5">
                    <h4>{t("No Data Available")}</h4>
                </div>
            ) : (
                paginatedSubjects.map((subject, index) => (
                    <div className="col-lg-4 col-md-6 col-sm-12 mb-4" key={index} onClick={() => navigate("/attendance", { state: { subject } })}>
                        <div className="container p-2 bg-white pb-3 rounded-4 shadow cursor-pointer">
                            <h6 className="heading-class fw-bold mt-2">{subject.subjectName}</h6>
                            <div className="d-flex justify-content-between mt-3">
                                <div className="d-flex align-items-center gap-1">
                                    <span className="">{clockSvg}</span>
                                    <span className="text-class">
                                        {subject.schedules.length > 0 ?
                                            `${formatTime(subject.schedules[0].startTime, subject.schedules[0].endTime)} Minutes`
                                            : "Time Not Available"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 d-flex justify-content-start gap-3">
                                <div className="section p-2">
                                    <p className="m-0 p-0">{currentDayClasses[0]?.className}</p>
                                </div>
                                <div className="seven-class p-2">
                                    <p className="m-0 p-0">{subject.subjectName}</p>
                                </div>
                                <div className="section p-2">
                                    <p className="m-0 p-0">Section {currentDayClasses[0]?.sectionName}</p>
                                </div>
                            </div>
                            <div className="d-flex justify-content-center mt-3">
                                <button className="btn-class">
                                    {isArabic === "sa" ? (
                                        <>
                                            {t('Scheduled')} <CalendarCheck2 className="d-inline" size={15} />
                                        </>
                                    ) : (
                                        <>
                                            <CalendarCheck2 className="d-inline" size={20} /> {t('Scheduled')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div className="d-flex justify-content-center mt-4">
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={subjectsList.length}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                />
            </div>
        </>
    );

};

export default ClassView;