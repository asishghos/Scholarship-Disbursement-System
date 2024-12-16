import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Add axios import
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../Firebase';
import {
  GraduationCap,
  CreditCard,
  AlertCircle,
  Building2,
  Search,
  X,
} from 'lucide-react';

const ScholarshipDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Fetch unique schools from scholarship applications
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const schoolsQuery = query(
          collection(db, 'scholarshipApplications')
        );

        const schoolSnapshot = await getDocs(schoolsQuery);
        const uniqueSchools = [
          ...new Set(schoolSnapshot.docs.map(doc => doc.data().schoolName))
        ].filter(Boolean).map((name, index) => ({
          id: index + 1,
          name: name
        }));

        setSchools(uniqueSchools);

        // Select first school by default if exists
        if (uniqueSchools.length > 0) {
          setSelectedSchool(uniqueSchools[0]);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Fetch applications for selected school
  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedSchool) return;

      try {
        setLoading(true);
        const applicationsQuery = query(
          collection(db, 'scholarshipApplications'),
          where('schoolName', '==', selectedSchool.name),
          where('reviewStatus', '==', filter)
        );

        const applicationSnapshot = await getDocs(applicationsQuery);
        const fetchedApplications = applicationSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setApplications(fetchedApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [selectedSchool, filter]);
  const prepareEmailDetails = (application) => {
    return {
      subject: "Scholarship Application Payment Initiation",
      body: `Dear ${application.name},\n\n
      We are pleased to inform you that the payment process for your scholarship application has been initiated.

      Please wait for further instructions from our scholarship team.

      Best regards,
      Scholarship Committee`
    };
  };
  const handlePaymentProcess = async (application) => {
    try {
      // Set the selected application
      setSelectedApplication(application);

      // Prepare review data for payment processing
      const reviewData = {
        paymentStatus: 'processing',
        paymentInitiatedAt: new Date().toISOString()
      };

      // Reference to the specific application document
      const applicationRef = doc(db, "scholarshipApplications", selectedApplication.id);

      // Prepare email details
      const emailDetails = prepareEmailDetails(selectedApplication);

      // Send email notification
      await axios.post('http://172.16.11.157:5007/send-application-update-email', {
        email: selectedApplication.email,
        ...emailDetails
      });

      // Optional: Send SMS notification
      await axios.post('http://localhost:5007/send-message', {
        phoneNumber: selectedApplication.phoneNumber,
        message: emailDetails.body
      });

      // Update Firestore document with payment status
      await updateDoc(applicationRef, reviewData);

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id ? { ...app, ...reviewData } : app
        )
      );

      // Show success toast
      toast.success("Payment process initiated successfully", {
        position: "top-right",
        autoClose: 3000,
        style: { fontSize: "1.25rem", padding: "1rem" },
      });

    } catch (error) {
      console.error("Error initiating payment process:", error);

      // Show error toast
      toast.error("Failed to initiate payment process", {
        position: "top-right",
        autoClose: 3000,
        style: { fontSize: "1.25rem", padding: "1rem" },
      });
    }
  };

  // Filtered schools based on search
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update review stages
  const updateReviewStage = async (applicationId, stage) => {
    try {
      const applicationRef = doc(db, 'scholarshipApplications', applicationId);
      await updateDoc(applicationRef, {
        [`reviewStages.${stage}.checked`]: true
      });

      // Refresh applications
      const updatedApplications = applications.map(app =>
        app.id === applicationId
          ? {
            ...app,
            reviewStages: {
              ...app.reviewStages,
              [stage]: { checked: true }
            }
          }
          : app
      );
      setApplications(updatedApplications);
    } catch (error) {
      console.error(`Error updating ${stage} stage:`, error);
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
       <ToastContainer />
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <div className="flex items-center mb-8">
          <GraduationCap className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Scholarship Portal</h2>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search Schools"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search
            className="absolute left-2 top-3 text-gray-400"
            size={18}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav>
          <h3 className="text-md font-semibold mb-2 text-gray-600">Schools</h3>
          {loading ? (
            <p className="text-center text-gray-500">Loading schools...</p>
          ) : filteredSchools.length > 0 ? (
            <ul className="space-y-2">
              {filteredSchools.map(school => (
                <li
                  key={school.id}
                  className={`hover:bg-blue-50 rounded-md ${selectedSchool?.id === school.id ? 'bg-blue-50' : ''
                    }`}
                >
                  <button
                    onClick={() => setSelectedSchool(school)}
                    className="w-full flex items-center p-2 text-gray-700 hover:text-blue-600 text-left"
                  >
                    <Building2 className="mr-2" size={20} />
                    <span className="truncate">{school.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No schools found</p>
          )}
        </nav>
      </div>

      {/* Main Content - Application Details Section */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedSchool ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">
              {selectedSchool.name} - {filter.toUpperCase()} Scholarship Applications
            </h1>

            {loading ? (
              <p className="text-center text-gray-500">Loading applications...</p>
            ) : applications.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map(application => (
                  <div
                    key={application.id}
                    className="bg-gray-50 p-4 rounded-md shadow-sm"
                  >
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold mb-2">
                        {application.name}
                      </h2>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Roll Number:</strong> {application.rollNumber}</p>
                        <p><strong>Course:</strong> {application.courseOfStudy}</p>
                        <p><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        className="w-full flex items-center justify-center p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <AlertCircle className="mr-2" size={20} />
                        Video Verification
                      </button>

                      {/* Payment Process Button */}
                      <button
                        onClick={() => handlePaymentProcess(application)}
                        className="w-full flex items-center justify-center p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <CreditCard className="mr-2" size={20} />
                        Start Payment Process
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No {filter} scholarship applications for this school.
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">Select a school to view applications</p>
        )}
      </div>
    </div>
  );
};

export default ScholarshipDashboard;