import React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { fetchClasses, fetchClassesV1 } from "../../redux/classSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

const StudentModal = ({
  isModalOpen,
  isEdit,
  onSubmit,
  register,
  handleSubmit,
  setIsModalOpen,
  password,
  currentPicture,
  classes,
  sections,
  setSections,
  fetchFeeStructures,
  uploadType,
  onModalClose,
  reset,
}) => {
  const {
    setError,
    formState: { errors },
  } = useForm();
  const [newPicture, setNewPicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Store the file
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(""); // Track selected class
  const [showDropdowns, setShowDropdowns] = useState(false);

  const [feeStructuresList, setFeeStructuresList] = useState([]);
  const [selectedFeeCode, setSelectedFeeCode] = useState("");
  const [discountName, setDiscountName] = useState("");


  useEffect(() => {
    if (selectedClass && Array.isArray(classes)) {
      // Find the selected class
      const selectedClassData = classes.find((cls) => cls.id === selectedClass);

      if (selectedClassData && Array.isArray(selectedClassData.classSections)) {
        // Map sections into expected format
        const formattedSections = selectedClassData.classSections.map(
          (section) => ({
            id: section.id, // Use the section's unique ID
            name: section.sectionName, // Display the section name
          })
        );
        setSections(formattedSections);
      } else {
        setSections([]); // Reset sections if no valid data
      }
    } else {
      setSections([]); // Reset sections when no class is selected
    }
  }, [selectedClass, classes, setSections]);

  useEffect(() => {
    if (isModalOpen) {
      const feeStructures = fetchFeeStructures();
      setFeeStructuresList(feeStructures || []);
    }
  }, [isModalOpen, fetchFeeStructures]);

  useEffect(() => {
    if (isEdit) {
      setSelectedFile(null); // Clear file on edit to avoid conflicts
      setNewPicture(currentPicture); // Set the current picture on modal open
    }
  }, [isModalOpen, isEdit, currentPicture]);

  const handlePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Store the file
      const imageUrl = URL.createObjectURL(file); // Preview the image
      setNewPicture(imageUrl);
    }
  };

  const handleFeeCodeChange = (event) => {
    const selectedCode = event.target.value;
    setSelectedFeeCode(selectedCode);

    if (selectedCode) {
      setShowDropdowns(true);
      const selectedStructure = feeStructuresList.find(
        (structure) => structure.feeCode === selectedCode
      );
      if (selectedStructure && selectedStructure.discounts?.length) {
        setDiscountName(selectedStructure.discounts[0].name); // Set the first discount name
      } else {
        setDiscountName("");
      }
    } else {
      setShowDropdowns(false);
      setDiscountName("");
    }
  };

  const handleFormSubmit = (data) => {
    if (!isEdit && data.password !== data.confirmPassword) {
      return setError("confirmPassword", {
        type: "manual",
        message: "Password doesn't match",
      });
    }
    return onSubmit(data, selectedFile);
  };
  const handleBulkFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBulkFile(file);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkFile) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadSimulation = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadSimulation);
          setIsUploading(false);
          toast.success("File has been uploaded!");
          setBulkFile(null);
          setIsModalOpen(false);
          onModalClose();
        }
        return prev + 10; // Increment progress
      });
    }, 300); // Adjust interval speed as needed
  };

  const handleClose = () => {
    reset();
    setIsModalOpen(false);
    setUploadProgress(0);
    setBulkFile(null);
    setIsUploading(false);
    setShowDropdowns(false);
    if (onModalClose) {
      onModalClose();
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-red-500 text-white p-1 ml-4 rounded"
            onClick={handleClose}
          >
            <span>
              <X />
            </span>
          </button>
        </div>
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Student" : "Add Student"}
        </h2>
        {isEdit && currentPicture && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Current Picture:</label>
            <img
              src={newPicture || currentPicture} // Use new picture if available
              alt="Student Profile"
              className="w-20 h-20 rounded-full mb-4"
            />
          </div>
        )}
        {isEdit || uploadType === "single" ? (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <h1 className="text-lg font-bold">Personal Details</h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              {/* FirstName */}
              <div>
                <label className="block">First Name</label>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="First Name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* LastName */}
              <div>
                <label className="block">Last Name</label>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Last Name"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Gender */}
              <div>
                <label className="block">Gender</label>
                <select
                  {...register("gender")}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              {/* Phone */}
              <div>
                <label className="block">Phone</label>
                <input
                  type="text"
                  {...register("phone")}
                  placeholder="Phone"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* CNIC */}
              <div>
                <label className="block">CNIC</label>
                <input
                  type="text"
                  {...register("cnic")}
                  placeholder="CNIC"
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* Email */}
              <div>
                <label className="block">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Password */}
              <div>
                <label className="block">Password</label>
                <input
                  type="password"
                  {...register("password", {
                    required: !isEdit && "Password is required", // Required if not edit mode
                  })}
                  placeholder="Password"
                  className="w-full p-2 border rounded"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block">Confirm Password</label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    validate: (value) =>
                      isEdit || value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm Password"
                  className="w-full p-2 border rounded"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {/* Location */}
              <div>
                <label className="block">Location</label>
                <input
                  type="text"
                  {...register("location")}
                  placeholder="Location"
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* DOB */}
              <div>
                <label className="block">DOB</label>
                <input
                  type="date"
                  {...register("dob")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* AdmissionDate */}
              <div>
                <label className="block">Admission Date</label>
                <input
                  type="date"
                  {...register("admissionDate")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* MaritalStatus */}
              <div>
                <label className="block">Marital Status</label>
                <select
                  {...register("maritalStatus")}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>
              {isEdit && (
                <div>
                  <label className="block">Status</label>
                  <select
                    className="w-full p-2 border rounded"
                    {...register("userStatus")}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Dropout">Dropout</option>
                    <option value="Passout">Passout</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block">EnrollmentNo</label>
                <input
                  type="text"
                  {...register("enrollmentNo")}
                  className="w-full p-2 border rounded"
                />
              </div>
              {/* ProfilePicture */}
              <div>
                <label className="block">
                  {isEdit ? "Upload New Picture" : "Upload Picture"}
                </label>
                <input
                  type="file"
                  className="w-full p-2 border rounded"
                  onChange={handlePictureChange}
                  accept="image/*"
                  required={!isEdit}
                />
              </div>
            </div>

            {/* Parent Details */}
            <h1 className="mt-2 text-lg font-bold">Parent Details</h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              {/* Father Details */}
              <div>
                <label className="block">Father Name</label>
                <input
                  type="text"
                  {...register("userDetails.fatherName")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Father Contact</label>
                <input
                  type="text"
                  {...register("userDetails.fatherContact")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Father Profession</label>
                <input
                  type="text"
                  {...register("userDetails.fatherProfession")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Father CNIC</label>
                <input
                  type="text"
                  {...register("userDetails.fatherCNIC")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {/* Mother Details */}
              <div>
                <label className="block">Mother Name</label>
                <input
                  type="text"
                  {...register("userDetails.motherName")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Mother Contact</label>
                <input
                  type="text"
                  {...register("userDetails.motherContact")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Mother Profession</label>
                <input
                  type="text"
                  {...register("userDetails.motherProfession")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Mother CNIC</label>
                <input
                  type="text"
                  {...register("userDetails.motherCNIC")}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block">Parent email for portal</label>
                <input
                  type="email"
                  {...register("userDetails.parentEmail")}
                  className="w-full p-2 border rounded"
                  required={!isEdit}
                />
              </div>
            </div>

            {/* Academic Performance */}
            <h1 className="mt-2 text-lg font-bold">Academic Performance</h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              <div>
                <label className="block">First Sem Result</label>
                <input
                  type="number"
                  {...register("academicDetails.firstSemResult")}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block">Second Sem Result</label>
                <input
                  type="number"
                  {...register("academicDetails.secondSemResult")}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block">Third Sem Result</label>
                <input
                  type="number"
                  {...register("academicDetails.thirdSemResult")}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              <div>
                <label className="block">Overall Annual Result</label>
                <input
                  type="number"
                  {...register("academicDetails.overallAnnualResult")}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>
              {/* Classes Dropdown */}
              <div>
                <label>Class</label>
                <select
                  {...register("classId")}
                  className="w-full p-2 border rounded"
                  defaultValue=""
                  onChange={(e) => {
                    const selectedClassValue = e.target.value;
                    setSelectedClass(selectedClassValue);

                    // Reset section selection if class changes and isEdit is true
                    if (isEdit) {
                      register("sectionId").onChange({ target: { value: "" } });
                    }
                  }}
                >
                  <option value="">Select a Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Section</label>
                <select
                  {...register("sectionId")}
                  className="w-full p-2 border rounded"
                  defaultValue=""
                  disabled={!selectedClass} // Disable when no class is selected
                >
                  <option value="">Select a Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fee & Dues Details */}
            <h1 className="mt-2 text-lg font-bold">Fee & Dues Details</h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              {/* Fee Code Dropdown */}
              <div>
                <label className="block">Fee Code</label>
                <select
                  className="w-full p-2 border rounded"
                  {...register("feeCode")}
                  onChange={handleFeeCodeChange}
                  required
                >
                  <option value="">Select Fee Code</option>
                  {feeStructuresList.map((structure) => (
                    <option key={structure.id} value={structure.feeCode}>
                      {structure.feeCode}
                    </option>
                  ))}
                </select>
              </div>
              
              {showDropdowns && (
                <div>
                  <label className="block">Discount Name</label>
                  <input
                    className="w-full p-2 border rounded"
                    value={discountName}
                    {...register("discountName")}
                    readOnly
                  />
                </div>
              )}
            </div>

            {/* Incident Reporting Fields */}
            <h1 className="mt-2 text-lg font-bold">Incident Reporting</h1>
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              {/* Reporter Details */}
              <div>
                <label className="block">Reporter Name</label>
                <input
                  type="text"
                  {...register("incidentDetails.reporterName")}
                  className="w-full p-2 border rounded"
                  placeholder="Enter reporter name"
                />
              </div>

              <div>
                <label className="block">Reporter Type</label>
                <select
                  {...register("incidentDetails.reporterType")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Reporter Type</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>
              
              <div>
                <label className="block">Date & Time of Incident</label>
                <input
                  type="datetime-local"
                  {...register("incidentDetails.dateTime")}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block">Location</label>
                <select
                  {...register("incidentDetails.location")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Location</option>
                  <option value="Classroom">Classroom</option>
                  <option value="Playground">Playground</option>
                  <option value="Hallway">Hallway</option>
                  <option value="Online">Online</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block">Category</label>
                <select
                  {...register("incidentDetails.category")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Bullying">Bullying</option>
                  <option value="Misconduct">Misconduct</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Safety Concern">Safety Concern</option>
                  <option value="Health Issue">Health Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block">Incident Description</label>
                <textarea
                  {...register("incidentDetails.description")}
                  className="w-full p-2 border rounded"
                  rows="4"
                />
              </div>

              <div>
                <label className="block">Involved Parties</label>
                <input
                  type="text"
                  {...register("incidentDetails.involvedParties")}
                  className="w-full p-2 border rounded"
                  placeholder="Enter names separated by commas"
                />
              </div>

              <div>
                <label className="block">Severity Level</label>
                <select
                  {...register("incidentDetails.severityLevel")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Severity</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block">Attachments</label>
                <input
                  type="file"
                  {...register("incidentDetails.attachments")}
                  className="w-full p-2 border rounded"
                  multiple
                />
              </div>

              <div>
                <label className="block">Action Taken</label>
                <select
                  {...register("incidentDetails.actionTaken")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Action</option>
                  <option value="Warning Issued">Warning Issued</option>
                  <option value="Counseling Provided">Counseling Provided</option>
                  <option value="Parental Involvement">Parental Involvement</option>
                  <option value="Disciplinary Action">Disciplinary Action</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block">Assigned To</label>
                <select
                  {...register("incidentDetails.assignedTo")}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Staff Member</option>
                  <option value="staff1">Staff Member 1</option>
                  <option value="staff2">Staff Member 2</option>
                  <option value="staff3">Staff Member 3</option>
                </select>
              </div>

              <div>
                <label className="block">Status</label>
                <select
                  {...register("incidentDetails.status")}
                  className="w-full p-2 border rounded"
                >
                  <option value="Reported">Reported</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block">Comments/Notes</label>
                <textarea
                  {...register("incidentDetails.comments")}
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Additional remarks..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-[#241763] text-white p-2 rounded"
              >
                {isEdit ? "Update" : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h1 className="text-lg font-bold">Bulk Upload</h1>
            <input
              type="file"
              className="w-full p-2 border rounded"
              onChange={handleBulkFileChange}
              accept=".xlsx, .xls"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-4">
                <label className="block font-medium mb-2">
                  Upload Progress
                </label>
                <div className="relative w-full h-4 bg-gray-200 rounded">
                  <div
                    className="absolute top-0 left-0 h-4 bg-green-500 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleBulkSubmit}
                className={`px-4 py-2 rounded ${
                  isUploading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#241763] text-white"
                }`}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentModal;
