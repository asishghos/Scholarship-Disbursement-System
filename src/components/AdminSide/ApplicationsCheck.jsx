import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from "../../Firebase";
import { useFirebase } from "../../firebase/FirebaseContext";
import {
  ClipboardList,
  Eye,
  Check,
  X,
  FileText,
  Clock,
  Search,
  Filter,
  AlertTriangle
} from "lucide-react";
import axios from "axios";

const ReviewModal = ({ application, onClose, onReviewComplete }) => {
  const [activeDocument, setActiveDocument] = useState(null);

  // Render status icon based on document status
  const renderStatusIcon = (status) => {
    switch (status) {
      case 1:
        return <CheckCircle className="text-green-500" />;
      case 0:
        return <AlertCircle className="text-yellow-500" />;
      default:
        return <AlertCircle className="text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  const [reviewStages, setReviewStages] = useState({});
  const [activeStage, setActiveStage] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const Firebase = useFirebase();

  // Initialize reviewStages from application data
  useEffect(() => {
    if (application?.reviewStages) {
      setReviewStages(application.reviewStages);
    }
  }, [application]);

  const updateStageStatus = (stage, field, value) => {
    setReviewStages((prev) => ({
      ...prev,
      [stage]: {
        ...prev[stage],
        [field]: value,
      },
    }));
  };
  const handleFinalReview = () => {
    // If all stages are checked, mark as approved
    const allStagesChecked = Object.values(reviewStages).every((stage) => stage.checked);
    toast.success("Application updated successfully", {
      position: "top-right",
      autoClose: 3000,
      style: { fontSize: "1.25rem", padding: "1rem" },
    });
    onReviewComplete({
      reviewStages,
      reviewStatus: allStagesChecked ? "approved" : "pending",
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejecting the application", {
        position: "top-right",
        autoClose: 3000,
        style: { fontSize: "1.25rem", padding: "1rem" },
      });
      return;
    }

    onReviewComplete({
      reviewStages: reviewStages,
      reviewStatus: "rejected",
      rejectionReason: rejectionReason.trim(),
    });
  };
  //console.log(application);
  const stages = [
    { key: 'preliminaryScreening', label: 'Preliminary Screening' },
    { key: 'eligibilityVerification', label: 'Eligibility Verification' },
    { key: 'documentAuthentication', label: 'Document Authentication' },
    // { key: 'personalStatementReview', label: 'Personal Statement Review' },
    // { key: 'referenceCheck', label: 'Reference Check' },
    { key: 'academicReview', label: 'Academic Review' },
    // { key: 'financialNeedAssessment', label: 'Financial Need Assessment' },
    // { key: 'interviewAssessment', label: 'Interview Assessment' },
    { key: 'finalApproval', label: 'Final Approval' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
       <ToastContainer />
      <div className="bg-white w-full max-w-6xl h-5/6 rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Application Details */}
        <div className="w-1/2 p-8 overflow-y-auto bg-gray-50 border-r">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 flex items-center">
            <FileText className="mr-3 text-blue-500" />
            Application Details
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">Personal Information</h3>
              <p><strong>Name:</strong> {application.name}</p>
              <p><strong>Email:</strong> {application.email}</p>
              <p><strong>Contact:</strong> {application.contactNumber}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Academic Information</h3>
              <p><strong>Course:</strong> {application.courseOfStudy}</p>
              <p><strong>School:</strong> {application.schoolName}</p>
              <p><strong>GPA:</strong> {application.gpa}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Additional Details</h3>
              <p><strong>Roll Number:</strong> {application.registrationNumber}</p>
              <p><strong>Annual Income:</strong> ₹{application.annualIncome}</p>
            </div>
          </div>
        </div>

        {/*scholarship details*/}
        {/* <div>
          <p className="text-gray-700 mb-1">
            <strong>Eligibility: </strong>
            {scholarship.eligibility}
          </p>
          <p className="text-gray-600 mb-3">
            <strong>Required Documents: </strong>
            {scholarship.requiredDocuments.join(", ")}
          </p>
        </div> */}

        <div>

        </div>

        {/* Right Side - Review Stages */}
        <div className="w-1/2 p-8 overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 flex items-center">
            <ClipboardList className="mr-3 text-blue-500" />
            Review Stages
          </h2>
          <div className="space-y-4">
            {stages.map((stage) => {
              const stageData = reviewStages[stage.key] || {};
              return (
                <div
                  key={stage.key}
                  className={`p-4 rounded-lg transition-all ${activeStage === stage.key
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                    } border`}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setActiveStage(activeStage === stage.key ? null : stage.key)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 rounded focus:ring-blue-500"
                        checked={stageData.checked || false}
                        onChange={(e) => updateStageStatus(stage.key, "checked", e.target.checked)}
                      />
                      <span className={`font-semibold ${stageData.checked ? 'text-green-600' : 'text-gray-700'}`}>
                        {stage.label}
                      </span>
                    </div>
                    {stageData.checked ? (
                      <Check className="text-green-500" />
                    ) : (
                      <Clock className="text-gray-400" />
                    )}
                  </div>
                  {/* {activeStage === stage.key && (
                    <textarea
                      value={stageData.notes || ''}
                      onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                      placeholder="Add detailed notes..."
                      className="w-full mt-4 p-2 border rounded focus:ring-blue-500"
                      rows={3}
                    />
                  )} */}
                  {activeStage === stage.key && (
                    <div className="mt-4">
                      {(() => {
                        switch (stage.key) {
                          case 'preliminaryScreening':
                            return (
                              <div>
                                <div className="p-4 bg-gray-100 rounded-md">
                                  <h3 className="text-lg font-semibold">Basic Details</h3>
                                  <p><strong>Applicant Name:</strong> {application.name} </p>
                                  <p><strong>Email:</strong> {application.email} </p>
                                  <p><strong>Application Date:</strong> {new Date(application.submittedAt).toLocaleString()}</p>
                                  <p><strong>Date Of Birth</strong> {new Date(application.dateOfBirth).toLocaleDateString()}</p>
                                  <p><strong>Contact Number: </strong> {application.contactNumber}</p>
                                  <p><strong>School Name : </strong> {application.schoolName}</p>

                                </div>

                                <textarea
                                  value={stageData.notes || ''}
                                  onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                                  placeholder="Add preliminary screening notes..."
                                  className="w-full p-2 border rounded focus:ring-blue-500"
                                  rows={3}
                                />
                              </div>
                            );
                          case 'eligibilityVerification':
                            return (
                              <textarea
                                value={stageData.notes || ''}
                                onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                                placeholder="Provide Eligibility Verification notes..."
                                className="w-full p-2 border rounded focus:ring-blue-500"
                                rows={3}
                              />
                            );
                          case 'documentAuthentication':
                            return (
                              <div className="p-4 bg-white rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-4">Document Authentication</h2>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  {Object.entries(application.documents).map(([docName, docDetails]) => (
                                    <div
                                      key={docName}
                                      className={`border rounded p-3 cursor-pointer flex items-center justify-between ${activeDocument === docName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                        }`}
                                      onClick={() => setActiveDocument(docName)}
                                    >
                                      <div className="flex items-center">
                                        <FileText className="mr-2 text-gray-600" />
                                        <span className="font-medium">{docName}</span>
                                      </div>
                                      <div className="flex items-center">
                                        {/* <span className="mr-2 text-sm text-gray-500">
                        Blur Score: {docDetails.blurScore.toFixed(2)}
                      </span> */}
                                        {renderStatusIcon(docDetails.status)}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {activeDocument && (
                                  <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-2">
                                      Viewing: {activeDocument}
                                    </h3>
                                    <div className="flex justify-center mb-4">
                                      <img
                                        src={application.documents[activeDocument].url}
                                        alt={activeDocument}
                                        className="max-h-96 max-w-full object-contain border rounded"
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Authentication Notes
                                  </label>
                                  <textarea
                                    value={stage.notes || ''}
                                    onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                                    placeholder="Provide Document Authentication notes..."
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                  />
                                </div>
                              </div>
                            );
                          case 'academicReview':
                            return (
                              <div>
                                <div className="p-4 bg-gray-100 rounded-md">
                                  <h3 className="text-lg font-semibold">Academic Details</h3>
                                  <p><strong>Course Of Study:</strong> {application.courseOfStudy} </p>
                                  <p><strong>Registration Number:</strong> {application.registrationNumber} </p>
                                  <p><strong>Roll Number:</strong> {application.rollNumber}</p>
                                  <p><strong>School Name: </strong> {application.schoolName}</p>
                                  <p><strong>GPA: </strong> {application.gpa}</p>
                                </div>

                                <textarea
                                  value={stageData.notes || ''}
                                  onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                                  placeholder="Add Academic Review notes..."
                                  className="w-full p-2 border rounded focus:ring-blue-500"
                                  rows={3}
                                />
                              </div>
                            );
                          case 'finalApproval':
                            return (
                              <textarea
                                value={stageData.notes || ''}
                                onChange={(e) => updateStageStatus(stage.key, "notes", e.target.value)}
                                placeholder="Provide Final Approval notes..."
                                className="w-full p-2 border rounded focus:ring-blue-500"
                                rows={3}
                              />
                            );
                          default:
                            return null;
                        }
                      })()}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Rejection Section */}
          {isRejecting ? (
            <div className="mt-6 bg-red-50 p-4 rounded-lg">
              <div className="flex items-center mb-4 text-red-600">
                <AlertTriangle className="mr-2" />
                <h3 className="font-semibold">Reject Application</h3>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a detailed reason for rejecting the application..."
                className="w-full p-2 border rounded focus:ring-red-500"
                rows={4}
              />
            </div>
          ) : null}

          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <div className="space-x-4">
              {!isRejecting ? (
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                >
                  Confirm Rejection
                </button>
              )}
              <button
                onClick={handleFinalReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "scholarshipApplications"));
        const applicationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplications(applicationsList);
        setFilteredApplications(applicationsList);
      } catch (error) {
        //console.error("Error fetching applications:", error);
        toast.error("Failed to fetch applications", {
          position: "top-right",
          autoClose: 3000,
          style: { fontSize: "1.25rem", padding: "1rem" },
        });
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    let result = applications;

    if (searchTerm) {
      result = result.filter(app =>
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(app => app.reviewStatus === filterStatus);
    }

    setFilteredApplications(result);
  }, [searchTerm, filterStatus, applications]);

  const handleReviewComplete = async (reviewData) => {
    try {
      const applicationRef = doc(db, "scholarshipApplications", selectedApplication.id);

      // Prepare email details
      const emailDetails = prepareEmailDetails(reviewData, selectedApplication);
      //console.log(emailDetails);
      // Send email via your existing server endpoint
      await axios.post('http://172.16.11.157:5007/send-application-update-email', {
        email: selectedApplication.email,
        ...emailDetails
      });


      await axios.post('http://localhost:5007/send-message', {
        phoneNumber: selectedApplication.phoneNumber,
        message: emailDetails.body
      });

      // Update Firestore document
      await updateDoc(applicationRef, reviewData);

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, ...reviewData } : app
        )
      );
      setIsReviewModalOpen(false);
      toast.success("Application updated successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { fontSize: "1.25rem", padding: "1rem" },
      });
    } catch (error) {
      //console.error("Error updating application:", error);
      toast.error("Failed to update application. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        style: { fontSize: "1.25rem", padding: "1rem" },
      });
    }
  };

  // Helper function to prepare email details
  const prepareEmailDetails = (reviewData, application, previousReviewData) => {
    let subject = "Scholarship Application Status Update";
    let body = `Dear ${application.name},\n\n`;

    // Status update section
    if (reviewData.reviewStatus === 'approved') {
      body += `We are pleased to inform you that your scholarship application has been approved.\n\n`;
    } else if (reviewData.reviewStatus === 'rejected') {
      subject = "Scholarship Application Status Update - Action Required";
      body += `We regret to inform you that your scholarship application has been rejected.\n\n`;
      if (reviewData.rejectionReason) {
        body += `Reason for Rejection: ${reviewData.rejectionReason}\n\n`;
      }
    } else {
      body += `Your application is currently under review. Here's the latest update on your application:\n\n`;
    }

    // Review stages section
    body += "Review Stages Status:\n";

    const stageLabels = {
      preliminaryScreening: "Preliminary Screening",
      eligibilityVerification: "Eligibility Verification",
      documentAuthentication: "Document Authentication",
      // personalStatementReview: "Personal Statement Review",
      // referenceCheck: "Reference Check",
      academicReview: "Academic Review",
      // financialNeedAssessment: "Financial Need Assessment",
      // interviewAssessment: "Interview Assessment",
      finalApproval: "Final Approval"
    };

    if (reviewData.reviewStages) {
      Object.entries(stageLabels).forEach(([stageKey, stageLabel]) => {
        const stageData = reviewData.reviewStages[stageKey];
        const previousStageData = previousReviewData?.reviewStages?.[stageKey];

        let stageStatus = "⌛ Pending";
        if (stageData?.checked) {
          stageStatus = "✅ Approved";
        }

        body += `\n${stageLabel}: ${stageStatus}`;

        // Add stage notes if they exist
        if (stageData?.notes) {
          body += `\n   Notes: ${stageData.notes}`;
        }

      });
    }

    // Overall changes section
    if (previousReviewData?.reviewStatus !== reviewData.reviewStatus) {
      body += "\n\nIMPORTANT: Your application status has changed from " +
        `'${previousReviewData?.reviewStatus || "pending"}' to '${reviewData.reviewStatus}'.`;
    }

    // Next steps section
    body += "\n\nNext Steps:";
    if (reviewData.reviewStatus === 'approved') {
      body += "\n- You will receive additional information about scholarship disbursement soon.";
      body += "\n- Please ensure your bank details are up to date in your profile.";
    } else if (reviewData.reviewStatus === 'rejected') {
      body += "\n- You may appeal this decision within 14 days.";
      body += "\n- Contact our support team for guidance on the appeal process.";
    } else {
      body += "\n- Continue to monitor your email for further updates.";
      body += "\n- Ensure all requested documents are submitted and up to date.";
    }

    body += "\n\nIf you have any questions, please don't hesitate to contact our support team.";
    body += "\n\nBest regards,\nScholarship Committee";

    return { subject, body };
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
       <ToastContainer />
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 flex items-center">
            <ClipboardList className="mr-3" /> Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
              <Search className="absolute left-3 top-3 text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => {
                setSelectedApplication(application);
                setIsReviewModalOpen(true);
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-700">{application.name}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.reviewStatus)}`}
                  >
                    {application.reviewStatus || 'Pending'}
                  </span>
                </div>
                <div className="text-gray-600">
                  <p><strong>Email:</strong> {application.email}</p>
                  <p><strong>Course:</strong> {application.courseOfStudy}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isReviewModalOpen && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewComplete={handleReviewComplete}
        />
      )}
    </div>
  );
};

export default AdminDashboard;