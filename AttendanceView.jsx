import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Select, DatePicker } from "antd";
import dayjs from "dayjs";

const AttendanceView = ({ onRequestClose }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const { RangePicker } = DatePicker;

  const classes = [
    { value: "10", label: "Class 10" },
    { value: "9", label: "Class 9" },
    { value: "8", label: "Class 8" }
  ];

  const sections = [
    { value: "A", label: "Section A" },
    { value: "B", label: "Section B" },
    { value: "C", label: "Section C" }
  ];

  const subjects = [
    { value: "math", label: "Mathematics" },
    { value: "science", label: "Science" },
    { value: "english", label: "English" }
  ];

  useEffect(() => {
    // Fetch attendance data based on selections
    if (selectedClass && selectedSection && selectedSubject && dateRange.length === 2) {
      // Mock data - replace with actual API call
      const mockData = [
        { date: "2025-03-01", status: "P" },
        { date: "2025-03-02", status: "A" },
        { date: "2025-03-03", status: "P" },
      ];

      // Filter data based on selected date range
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');

      const filteredData = mockData.filter(record => {
        const recordDate = dayjs(record.date);
        return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
      });

      setAttendanceData(filteredData);
    } else {
      setAttendanceData([]);
    }
  }, [selectedClass, selectedSection, selectedSubject, dateRange]);

  const handleClose = () => {
    if (onRequestClose) {
      onRequestClose();
    }
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  return (
    <div className="container-fluid p-0 m-0 pb-4 modalWrapper">
      <div className="row d-flex justify-contents-center p-0 m-0">
        <div className="col-md-12 examModalWrapper p-0 m-0">
          <div className="d-flex justify-content-between align-items-center px-4 col-md-12 examModalHeader">
            <h4 style={{ color: "#060317" }} className="fw-bold">Attendance</h4>
            <div className="iconWrapper cursor-pointer" onClick={handleClose}><X /></div>
          </div>
        </div>
      </div>
      <div className="modalBody p-4">
        <div className="mb-4">
          <div className="row g-3">
            <div className="col-md-3">
              <Select
                placeholder="Select Class"
                style={{ width: '100%' }}
                options={classes}
                onChange={(value) => setSelectedClass(value)}
              />
            </div>
            <div className="col-md-3">
              <Select
                placeholder="Select Section"
                style={{ width: '100%' }}
                options={sections}
                onChange={(value) => setSelectedSection(value)}
              />
            </div>
            <div className="col-md-3">
              <Select
                placeholder="Select Subject"
                style={{ width: '100%' }}
                options={subjects}
                onChange={(value) => setSelectedSubject(value)}
              />
            </div>
            <div className="col-md-3">
              <RangePicker 
                style={{ width: '100%' }}
                onChange={handleDateRangeChange}
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
              />
            </div>
          </div>
        </div>

        {attendanceData.length > 0 ? (
          <div className="Table_Card">
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "arial, sans-serif",
              }}
            >
              <thead>
                <tr>
                  <th className="Salary_Heading">Date</th>
                  <th className="Salary_Heading">Day</th>
                  <th className="Salary_Heading">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record, index) => (
                  <tr key={index}>
                    <td className="Salary_Data">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="Salary_Data">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                    <td className="Salary_Data">
                      <span className={`px-2 py-1 rounded ${record.status === 'P' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="Salary_Data">
                    <div className="d-flex justify-content-between">
                      <span>Total Days: {attendanceData.length}</span>
                      <span>Present: {attendanceData.filter(r => r.status === 'P').length}</span>
                      <span>Absent: {attendanceData.filter(r => r.status === 'A').length}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="text-center p-4">
            <p>No attendance data available for the selected date range</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;