import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Plus, X } from "lucide-react";
import { getRequest } from "../../services";

const AutomationModal = (props) => {
  const [formData, setFormData] = useState({
    dailySchedule: {
      startTime: "",
      endTime: ""
    },

    // Teachers
    teachers: [{
      name: "",
      subjects: [],
      maxWeeklyHours: "",
      availability: {
        monday: { available: false, slots: [] },
        tuesday: { available: false, slots: [] },
        wednesday: { available: false, slots: [] },
        thursday: { available: false, slots: [] },
        friday: { available: false, slots: [] }
      },
      preferredSlots: []
    }],

    // Constraints
    constraints: {
      breakTimes: {
        monday: [{ start: "", end: "", available: false, slots: [] }],
        tuesday: [{ start: "", end: "", available: false, slots: [] }],
        wednesday: [{ start: "", end: "", available: false, slots: [] }],
        thursday: [{ start: "", end: "", available: false, slots: [] }],
        friday: [{ start: "", end: "", available: false, slots: [] }]
      },
      gapBetweenClasses: "",
      maxConsecutiveHoursTeacher: "",
      maxConsecutiveHoursStudent: "",
      teacherPreferences: [{
        teacherId: "",
        preferredRooms: [],
        preferredTimeSlots: []
      }],
      roomPreferences: [{
        roomId: "",
        preferredSubjects: [],
        preferredTeachers: []
      }],
      specialEvents: [{
        name: "",
        date: "",
        startTime: "",
        endTime: "",
        room: "",
        teacher: "",
        description: ""
      }]
    },

    // General Settings
    settings: {
      timetableFormat: "weekly", // weekly, daily
      outputViews: {
        perClass: true,
        perTeacher: true,
        perRoom: true
      },
      language: "english"
    },

    // Classroom Details
    classrooms: [{
      gradeName: "",
      studentCount: "",
      subjectGroups: [{
        subject: "",
        numberOfGroups: "",
        studentsPerGroup: ""
      }],
      specialRequirements: ""
    }]
  });

  const [teachersList, setTeachersList] = useState([]);
  const [searchTerms, setSearchTerms] = useState(formData.teachers.map(() => ""));
  const [showDropdowns, setShowDropdowns] = useState(formData.teachers.map(() => false));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDropdowns(prev => prev.map(() => false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await getRequest('/api/Teacher/paginated?pageNumber=1&pageSize=10000');
        const teachersWithClasses = response.data?.data?.teachers?.map(({ teacher }) => ({
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
        }));
        setTeachersList(teachersWithClasses);

      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };

    fetchTeachers();
  }, []);

  const { currentSubjects } = props;

  const getFilteredTeachers = (searchTerm) => {
    return teachersList.filter(teacher => 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const addTeacher = () => {
    setFormData(prev => ({
      ...prev,
      teachers: [...prev.teachers, {
        name: "",
        subjects: [],
        maxWeeklyHours: "",
        preferredSlots: []
      }]
    }));
    setSearchTerms(prev => [...prev, ""]);
    setShowDropdowns(prev => [...prev, false]);
  };

  const removeTeacher = (index) => {
    setFormData(prev => ({
      ...prev,
      teachers: prev.teachers.filter((_, i) => i !== index)
    }));
    setSearchTerms(prev => prev.filter((_, i) => i !== index));
    setShowDropdowns(prev => prev.filter((_, i) => i !== index));
  };

  const addClassroom = () => {
    setFormData(prev => ({
      ...prev,
      classrooms: [...prev.classrooms, {
        gradeName: "",
        studentCount: "",
        subjectGroups: [{
          subject: "",
          numberOfGroups: "",
          studentsPerGroup: ""
        }],
        specialRequirements: ""
      }]
    }));
  };

  const removeClassroom = (index) => {
    setFormData(prev => ({
      ...prev,
      classrooms: prev.classrooms.filter((_, i) => i !== index)
    }));
  };

  const addSubjectGroup = (classroomIndex) => {
    const newClassrooms = [...formData.classrooms];
    newClassrooms[classroomIndex].subjectGroups.push({
      subject: "",
      numberOfGroups: "",
      studentsPerGroup: ""
    });
    setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
  };

  const removeSubjectGroup = (classroomIndex, groupIndex) => {
    const newClassrooms = [...formData.classrooms];
    newClassrooms[classroomIndex].subjectGroups = newClassrooms[classroomIndex].subjectGroups.filter((_, i) => i !== groupIndex);
    setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
  };

  const handleSubjectAdd = (teacherIndex, subject) => {
    const newTeachers = [...formData.teachers];
    newTeachers[teacherIndex].subjects.push(subject);
    setFormData(prev => ({ ...prev, teachers: newTeachers }));
  };

  const handleSubjectRemove = (teacherIndex, subjectToRemove) => {
    const newTeachers = [...formData.teachers];
    newTeachers[teacherIndex].subjects = newTeachers[teacherIndex].subjects.filter(
      subject => subject !== subjectToRemove
    );
    setFormData(prev => ({ ...prev, teachers: newTeachers }));
  };

  return (
    <>
      <Toaster />
      <div className="container-fluid">
        {/* Teacher Details Section */}
        <div className="row mb-4">
          <div className="col-12">

            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Teacher Details</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={addTeacher}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Teacher
              </button>
            </div>

            {formData.teachers.map((teacher, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="flex justify-end">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeTeacher(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Subject Tags Input */}
                <div className="form-group col-span-2 mb-3">
                  <label>Subjects</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {teacher.subjects.map((subject, sIndex) => (
                      <span key={sIndex} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                        {subject}
                        <button
                          className="ml-2"
                          onClick={() => handleSubjectRemove(index, subject)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <select 
                      className="form-control"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSubjectAdd(index, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">Select a subject</option>
                      {currentSubjects.map((subject, idx) => (
                        <option key={idx} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group relative dropdown-container">
                    <label>Teacher Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={searchTerms[index]}
                      onChange={(e) => {
                        const newSearchTerms = [...searchTerms];
                        newSearchTerms[index] = e.target.value;
                        setSearchTerms(newSearchTerms);
                        const newShowDropdowns = [...showDropdowns];
                        newShowDropdowns[index] = true;
                        setShowDropdowns(newShowDropdowns);
                      }}
                      onFocus={() => {
                        const newShowDropdowns = [...showDropdowns];
                        newShowDropdowns[index] = true;
                        setShowDropdowns(newShowDropdowns);
                      }}
                      placeholder="Search for a teacher..."
                    />
                    {showDropdowns[index] && (
                      <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                        {getFilteredTeachers(searchTerms[index]).map((t) => (
                          <div
                            key={t.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              const newTeachers = [...formData.teachers];
                              newTeachers[index].name = t.name;
                              setFormData(prev => ({ ...prev, teachers: newTeachers }));
                              
                              const newSearchTerms = [...searchTerms];
                              newSearchTerms[index] = t.name;
                              setSearchTerms(newSearchTerms);
                              
                              const newShowDropdowns = [...showDropdowns];
                              newShowDropdowns[index] = false;
                              setShowDropdowns(newShowDropdowns);
                            }}
                          >
                            {t.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacher.preferredSlots.map((slot, slotIndex) => (
                        <span key={slotIndex} className="bg-green-100 px-2 py-1 rounded flex items-center">
                          {slot}
                          <button
                            className="ml-2"
                            onClick={() => {
                              const newTeachers = [...formData.teachers];
                              newTeachers[index].preferredSlots = newTeachers[index].preferredSlots.filter(
                                (_, i) => i !== slotIndex
                              );
                              setFormData(prev => ({ ...prev, teachers: newTeachers }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student/Classroom Details Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Student/Classroom Details</h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={addClassroom}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Classroom
              </button>
            </div>

            {formData.classrooms.map((classroom, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="flex justify-end">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeClassroom(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Grade/Class Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={classroom.gradeName}
                      onChange={(e) => {
                        const newClassrooms = [...formData.classrooms];
                        newClassrooms[index].gradeName = e.target.value;
                        setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Students</label>
                    <input
                      type="number"
                      className="form-control"
                      value={classroom.studentCount}
                      onChange={(e) => {
                        const newClassrooms = [...formData.classrooms];
                        newClassrooms[index].studentCount = e.target.value;
                        setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                      }}
                    />
                  </div>

                  {/* Subject Groups */}
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label>Subject-Wise Groups</label>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => addSubjectGroup(index)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Group
                      </button>
                    </div>
                    {classroom.subjectGroups.map((group, groupIndex) => (
                      <div key={groupIndex} className="grid grid-cols-3 gap-4 mb-2">
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Subject"
                            value={group.subject}
                            onChange={(e) => {
                              const newClassrooms = [...formData.classrooms];
                              newClassrooms[index].subjectGroups[groupIndex].subject = e.target.value;
                              setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Number of Groups"
                            value={group.numberOfGroups}
                            onChange={(e) => {
                              const newClassrooms = [...formData.classrooms];
                              newClassrooms[index].subjectGroups[groupIndex].numberOfGroups = e.target.value;
                              setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                            }}
                          />
                        </div>
                        <div className="form-group flex items-center">
                          <input
                            type="number"
                            className="form-control mr-2"
                            placeholder="Students per Group"
                            value={group.studentsPerGroup}
                            onChange={(e) => {
                              const newClassrooms = [...formData.classrooms];
                              newClassrooms[index].subjectGroups[groupIndex].studentsPerGroup = e.target.value;
                              setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                            }}
                          />
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => removeSubjectGroup(index, groupIndex)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-span-2">
                    <label>Special Needs or Requirements</label>
                    <textarea
                      className="form-control"
                      value={classroom.specialRequirements}
                      onChange={(e) => {
                        const newClassrooms = [...formData.classrooms];
                        newClassrooms[index].specialRequirements = e.target.value;
                        setFormData(prev => ({ ...prev, classrooms: newClassrooms }));
                      }}
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="text-lg font-semibold mb-3">Constraints and Preferences</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Gap Between Classes (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.constraints.gapBetweenClasses}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, gapBetweenClasses: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Max Consecutive Hours (Teachers)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.constraints.maxConsecutiveHoursTeacher}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxConsecutiveHoursTeacher: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label>Max Consecutive Hours (Students)</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.constraints.maxConsecutiveHoursStudent}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, maxConsecutiveHoursStudent: e.target.value }
                  }))}
                />
              </div>

              {/* Break Times Section */}
              <div className="form-group col-span-2">
                <h3 className="text-lg font-semibold mb-3">Break Times</h3>
                {Object.entries(formData.constraints.breakTimes).map(([day, breaks]) => (
                  <div key={day} className="mb-2">
                    <h4 className="capitalize">{day}</h4>
                    {breaks.map((breakTime, index) => (
                      <div key={index} className="flex items-center gap-4 mb-1">
                        <input
                          type="time"
                          className="form-control w-40"
                          value={breakTime.start}
                          onChange={(e) => {
                            const newBreakTimes = { ...formData.constraints.breakTimes };
                            newBreakTimes[day][index].start = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              constraints: { ...prev.constraints, breakTimes: newBreakTimes }
                            }));
                          }}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          className="form-control w-40"
                          value={breakTime.end}
                          onChange={(e) => {
                            const newBreakTimes = { ...formData.constraints.breakTimes };
                            newBreakTimes[day][index].end = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              constraints: { ...prev.constraints, breakTimes: newBreakTimes }
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Special Events Section */}
              <div className="form-group col-span-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Add Special Events</h3>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        constraints: {
                          ...prev.constraints,
                          specialEvents: [
                            ...prev.constraints.specialEvents,
                            { name: "", date: "", startTime: "", endTime: "", room: "", teacher: "", description: "" }
                          ]
                        }
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Special Event
                  </button>
                </div>

                {formData.constraints.specialEvents.map((event, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Event Name"
                      className="form-control"
                      value={event.name}
                      onChange={(e) => {
                        const newEvents = [...formData.constraints.specialEvents];
                        newEvents[index].name = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          constraints: { ...prev.constraints, specialEvents: newEvents }
                        }));
                      }}
                    />
                    <input
                      type="date"
                      className="form-control"
                      value={event.date}
                      onChange={(e) => {
                        const newEvents = [...formData.constraints.specialEvents];
                        newEvents[index].date = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          constraints: { ...prev.constraints, specialEvents: newEvents }
                        }));
                      }}
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        className="form-control"
                        value={event.startTime}
                        onChange={(e) => {
                          const newEvents = [...formData.constraints.specialEvents];
                          newEvents[index].startTime = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            constraints: { ...prev.constraints, specialEvents: newEvents }
                          }));
                        }}
                      />
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            constraints: {
                              ...prev.constraints,
                              specialEvents: prev.constraints.specialEvents.filter((_, i) => i !== index)
                            }
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>

        {/* General Settings Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="text-lg font-semibold mb-3">General Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Timetable Format</label>
                <select
                  className="form-control"
                  value={formData.settings.timetableFormat}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, timetableFormat: e.target.value }
                  }))}
                >
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select
                  className="form-control"
                  value={formData.settings.language}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, language: e.target.value }
                  }))}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button className="btn btn-primary">
            Generate Schedule
          </button>
        </div>
      </div>
    </>
  );
};

export default AutomationModal;
