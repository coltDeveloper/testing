// AppRouter.js
import React from "react";
import Home from "./View/Home";
import NotFound from "./View/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  AccountSettings,
  ClassSchedule,
  Community,
  Courses,
  Exams,
  GradeBook,
  CourseDetails,
  AssesmentWelcome,
  Assesment,
  ExamQuestions,
  ExamStudent,
  ResultStudent,
  Library,
  AdminPanel,
  MyClasses,
  LessonDetails,
  VideoChat,
  liveCall
} from "./View/student/index";

import {
  CurriculumDesign,
  GradeManagement,
  LessonPlan,
  ClassManagement,
  PersonalProfile,
  ExamsManagement,
  AddLessonPlan,
  Attendance,
  GradeookResult,
  ClassSchedule as TeacherClassSchedule,
  EditLessonPlan,
} from "./View/Teacher/index";
import {
  AccountSetting,
  Calendar,
  Exam,
  Fees,
  ParentSurvey,
  Performance,
} from "./View/parent/index";
import Sign from "./View/SignInFirst";
import SignIn from "./View/SignIn";
import SignUpFirst from "./View/SignUpFirst";
import SignUp from "./View/SignUp";
import ForgotPassword from "./View/ForgotPassword";
import OtpVerification from "./View/OtpVerification";
import ResetPassword from "./View/ResetPassword";


//  admin routes..

import { AdminDashboard, AdminUsers, AdminTeachers, AdminStudents, AdminClasses, AdminParents, AdminLibrary, AdminCourses, AdminManagement, AdminFeeManagement, AdminCampuses, AdminSurveys, AdminWellnesDashboard, AdminWellnessSuite, AdminReports} from "./View/admin";
import { HrHrms, HrPayroll, HrRecruitment, HrConfiguration, HrWarningDetails, HrAttendance, HrEmployeeDetails, HrLeaveDetails, HrReports, HrAllLeaveDetails, HrHrController, HrDesignationDetail, HrHrDepartment, HrLocationDetail, HrSalaries, HrLoanAdvances, HrArreasBonus, HrFinalSettlement, HrTaxHolding, HrStipend, HrWelfareAllownce, HrDuesDetail, HrJobsOpening, HrCandidates, HrInterviews } from "./View/Hr";

const AppRouter = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // Initialize role with a default value
  let role = "student";
  if (user && user.user) {
    role = user.user;
  }

  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      {role === "student" ? (
        <>
          <Route path="/home" element={<ProtectedRoute Component={Home} />} />
          <Route
            path="/account-settings"
            element={<ProtectedRoute Component={AccountSettings} />}
          />
          <Route
            path="/library"
            element={<ProtectedRoute Component={Library} />}
          />
          <Route
            path="/class-schedule"
            element={<ProtectedRoute Component={ClassSchedule} />}
          />
          <Route
            path="/admin-panel"
            element={<ProtectedRoute Component={AdminPanel} />}
          />
          <Route
            path="/community"
            element={<ProtectedRoute Component={Community} />}
          />
          <Route
            path="/courses"
            element={<ProtectedRoute Component={Courses} />}
          />
          <Route
            path="/my-classes"
            element={<ProtectedRoute Component={MyClasses} />}
          />
          <Route path="/exams" element={<ProtectedRoute Component={Exams} />} />
          <Route
            path="/grade-book"
            element={<ProtectedRoute Component={GradeBook} />}
          />
          <Route
            path="/assesment-welcome"
            element={<ProtectedRoute Component={AssesmentWelcome} />}
          />
          <Route
            path="/assesment"
            element={<ProtectedRoute Component={Assesment} />}
          />
          <Route
            path="/course/:id"
            element={<ProtectedRoute Component={CourseDetails} />}
          />
          <Route
            path="/lesson/:id"
            element={<ProtectedRoute Component={LessonDetails} />}
          />
          <Route
            path="/exams/:id"
            element={<ProtectedRoute Component={ExamQuestions} />}
          />
           <Route
            path="/exam-student/:id"
            element={<ProtectedRoute Component={ExamStudent} />}
          />
            <Route
            path="/results-student/:id"
            element={<ProtectedRoute Component={ResultStudent} />}
          />
          <Route
            path="/video-chat"
            element={<ProtectedRoute Component={VideoChat} />}
          />
          <Route
            path="/live-call"
            element={<ProtectedRoute Component={liveCall} />}
          />
          {/* <Route
            path="/messages"
            element={<ProtectedRoute Component={Messages} />}
          /> */}
        </>
      ) : role === "teacher" ? (
        <>
          {/* Teacher routes */}
          <Route path="/home" element={<ProtectedRoute Component={Home} />} />
          <Route
            path="/course/:id"
            element={<ProtectedRoute Component={CourseDetails} />}
          /><Route
            path="/edit-lessonplan/:id"
            element={<ProtectedRoute Component={EditLessonPlan} />}
          />
          <Route
            path="/attendance"
            element={<ProtectedRoute Component={Attendance} />}
          />
          <Route
            path="/class-schedule"
            element={<ProtectedRoute Component={TeacherClassSchedule} />}
          />
          <Route
            path="/add-lesson-plan"
            element={<ProtectedRoute Component={AddLessonPlan} />}
          />
          <Route
            path="/exams/:id"
            element={<ProtectedRoute Component={ExamQuestions} />}
          />
          <Route
            path="/curriculum-design"
            element={<ProtectedRoute Component={CurriculumDesign} />}
          />
          <Route
            path="/grades-management"
            element={<ProtectedRoute Component={GradeManagement} />}
          />
          <Route
            path="/grades-results"
            element={<ProtectedRoute Component={GradeookResult} />}
          />
          <Route
            path="/lesson-plan"
            element={<ProtectedRoute Component={LessonPlan} />}
          />
          <Route
            path="/lesson/:id"
            element={<ProtectedRoute Component={LessonDetails} />}
          />
          <Route
            path="/class-management"
            element={<ProtectedRoute Component={ClassManagement} />}
          />
          <Route
            path="/exams-management"
            element={<ProtectedRoute Component={ExamsManagement} />}
          />
          <Route
            path="/personal-profile"
            element={<ProtectedRoute Component={PersonalProfile} />}
          />
          <Route
            path="/account-settings"
            element={<ProtectedRoute Component={AccountSettings} />}
          />
          <Route
            path="/library"
            element={<ProtectedRoute Component={Library} />}
          />
          <Route
            path="/community"
            element={<ProtectedRoute Component={Community} />}
          />
          <Route
            path="/live-call"
            element={<ProtectedRoute Component={liveCall} />}
          />
        </>
      ) : role === "parent" ? (
        <>
          <Route path="/home" element={<ProtectedRoute Component={Home} />} />
          <Route path="/exam" element={<ProtectedRoute Component={Exam} />} />
          <Route
            path="/account-setting"
            element={<ProtectedRoute Component={AccountSetting} />}
          />
          <Route
            path="/calendar"
            element={<ProtectedRoute Component={Calendar} />}
          />
          <Route
            path="/fees-dues"
            element={<ProtectedRoute Component={Fees} />}
          />
          <Route
            path="/parent-survey"
            element={<ProtectedRoute Component={ParentSurvey} />}
          />
          <Route
            path="/performance"
            element={<ProtectedRoute Component={Performance} />}
          />
        </>
      ) : role === "admin" ? (
        <>
          <Route
            path="/users"
            element={<ProtectedRoute Component={AdminUsers} />}
          />
          <Route
            path="/home"
            element={<ProtectedRoute Component={AdminDashboard} />}
          />
           <Route
            path="/teachers"
            element={<ProtectedRoute Component={AdminTeachers} />}
          />
           <Route
            path="/students"
            element={<ProtectedRoute Component={AdminStudents} />}
          />
           <Route
            path="/classes"
            element={<ProtectedRoute Component={AdminClasses} />}
          />
           <Route
            path="/parents"
            element={<ProtectedRoute Component={AdminParents} />}
          />
           <Route
            path="/libraries"
            element={<ProtectedRoute Component={AdminLibrary} />}
          />
          <Route
            path="/courses"
            element={<ProtectedRoute Component={AdminCourses} />}
          />
          <Route
            path="/management"
            element={<ProtectedRoute Component={AdminManagement} />}
          />
          <Route
            path="/feeManagement"
            element={<ProtectedRoute Component={AdminFeeManagement} />}
          />
          <Route
            path="/campuses"
            element={<ProtectedRoute Component={AdminCampuses} />}
          />
          <Route
            path="/wellnessSuite"
            element={<ProtectedRoute Component={AdminWellnessSuite} />}
          />
          <Route
            path="/wellnessDasboard"
            element={<ProtectedRoute Component={AdminWellnesDashboard} />}
          />
          <Route
            path="/surveys&feedback"
            element={<ProtectedRoute Component={AdminSurveys} />}
          />
          <Route
            path="/reports"
            element={<ProtectedRoute Component={AdminReports} />}
          />
           <Route path="/hrms" element={<ProtectedRoute Component={HrEmployeeDetails} />} />
          <Route path="/payroll" element={<ProtectedRoute Component={HrSalaries} />} />
          <Route path="/recruitment" element={<ProtectedRoute Component={HrJobsOpening} />} />
          <Route path="/hrConfiguration" element={<ProtectedRoute Component={HrHrController} />} />
          <Route path="/warningDetails" element={<ProtectedRoute Component={HrWarningDetails} />} />
          <Route path="/employeeDetails" element={<ProtectedRoute Component={HrEmployeeDetails} />} />
          <Route path="/leaveDetails" element={<ProtectedRoute Component={HrLeaveDetails} />} />
          <Route path="/employee_all_leaves" element={<ProtectedRoute Component={HrAllLeaveDetails} />} />
          <Route path="/attendance" element={<ProtectedRoute Component={HrAttendance} />} />
          <Route path="/reports" element={<ProtectedRoute Component={HrReports} />} />
          <Route path="/hrController" element={<ProtectedRoute Component={HrHrController} />} />
          <Route path="/designationDetail" element={<ProtectedRoute Component={HrDesignationDetail} />} />
          <Route path="/hrDepartment" element={<ProtectedRoute Component={HrHrDepartment} />} />
          <Route path="/locationDetail" element={<ProtectedRoute Component={HrLocationDetail} />} />
          <Route path="/salaries" element={<ProtectedRoute Component={HrSalaries} />} />
          <Route path="/loanAdvance" element={<ProtectedRoute Component={HrLoanAdvances} />} />
          <Route path="/arreasBonus" element={<ProtectedRoute Component={HrArreasBonus} />} />
          <Route path="/finalSettlement" element={<ProtectedRoute Component={HrFinalSettlement} />} />
          <Route path="/taxHolding" element={<ProtectedRoute Component={HrTaxHolding} />} />
          <Route path="/stipend" element={<ProtectedRoute Component={HrStipend} />} />
          <Route path="/welfareAllownce" element={<ProtectedRoute Component={HrWelfareAllownce} />} />
          <Route path="/duesDetail" element={<ProtectedRoute Component={HrDuesDetail} />} />
          <Route path="/jobsOpening" element={<ProtectedRoute Component={HrJobsOpening} />} />
          <Route path="/candidates" element={<ProtectedRoute Component={HrCandidates} />} />
          <Route path="/interviews" element={<ProtectedRoute Component={HrInterviews} />} />

          


        </>
      ) : (
        "not found"
      )}

      {/* public routes */}
      <Route path="/sign-in-first" element={<Sign />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up-first" element={<SignUpFirst />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRouter;
