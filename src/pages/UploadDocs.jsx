import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getDatabase, ref, get } from "firebase/database";
import { useFirebase } from "../firebase/FirebaseContext";
import app from "../Firebase";
const cloudName = "dmqzrmtsf";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  Firestore,
  getDoc,
} from "firebase/firestore";

const UploadDocs = () => {
  const { user } = useFirebase();
  const [selectedDocType, setSelectedDocType] = useState("aadhar_card");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const db = getDatabase();
  const firestore = getFirestore(app);
  useEffect(() => {
    // Retrieve uid from location.state or localStorage
    let uid = location.state?.uid || localStorage.getItem("uid");

    if (!uid) {
      // If no uid is found, navigate to login
      navigate("/login");
      return;
    }

    // Store the UID in localStorage to persist across pages
    localStorage.setItem("uid", uid);

    // Fetch user data from Firebase Realtime Database
    get(ref(db, "users/" + uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val()); // Set user data if it exists
        } else {
          navigate("/login"); // Navigate to login if user data doesn't exist
        }
      })
      .catch((error) => {
        console.error(error);
        setError("An error occurred while fetching user data.");
        navigate("/login");
      }); // Navigate to login on error
  }, [location.state, navigate, db]);

  const onDrop = (acceptedFiles) => {
    const filesWithType = acceptedFiles.map((file) => ({
      file,
      type: selectedDocType,
    }));
    setUploadedFiles((prev) => [...prev, ...filesWithType]);
    console.log(filesWithType);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
  });

  const handleDocTypeChange = (e) => {
    setSelectedDocType(e.target.value);
  };

  console.log(userData);
  console.log(user.uid);
 
  // const handleUpload = async () => {
  //   if (uploadedFiles.length === 0) {
  //     alert("Please select some files first!");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const userDocRef = doc(firestore, "usersDocs", user.uid);

  //     // Fetch existing data or initialize with an empty object
  //     const userData = (await getDoc(userDocRef)).data() || {};

  //     const newData = { ...userData };

  //     for (const fileObj of uploadedFiles) {
  //       const formData = new FormData();
  //       formData.append("file", fileObj.file);

  //       // Upload file and get the URL
  //       const response = await axios.post(
  //         "http://localhost:5000/upload",
  //         formData
  //       );
  //       const uploadedUrl = response.data.file.url;
  //       console.log(uploadedUrl);
  //       // const temp =await axios.post("http://localhost:5001/analyze-blur",uploadedUrl);
  //       // console.log(temp.data);

  //       // Get the current date and time
  //       const timestamp = new Date().toISOString();

  //       // Determine the document type and update the data
  //       const docTypeKey = fileObj.type;

  //       if (docTypeKey === "other") {
  //         // Handle 'Other Docs' as an array of objects
  //         newData.other_docs = newData.other_docs || [];
  //         newData.other_docs.push({
  //           url: uploadedUrl,
  //           uploadTimestamp: timestamp,
  //           status: 1,
  //         });
  //       } else {
  //         // Handle single document fields
  //         newData[docTypeKey] = {
  //           url: uploadedUrl,
  //           uploadTimestamp: timestamp,
  //           status: 1,
  //         };
  //       }

  //       console.log(`Uploaded and added ${fileObj.file.name} with timestamp.`);
  //     }

  //     // Save the updated data to Firestore
  //     await setDoc(userDocRef, newData);

  //     alert("Files uploaded and metadata saved successfully!");
  //     setUploadedFiles([]);
  //   } catch (error) {
  //     console.error("Error uploading file or saving metadata:", error);
  //     alert("Upload failed.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.warning("Failed to fetch applications", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, "usersDocs", user.uid);
      const userData = (await getDoc(userDocRef)).data() || {};
      const newData = { ...userData };
  
      for (const fileObj of uploadedFiles) {
        // First upload to Cloudinary
        const formData = new FormData();
        formData.append("file", fileObj.file);
  
        const cloudinaryResponse = await axios.post(
          "http://172.16.11.157:5007/upload",
          formData
        );
        const uploadedUrl = cloudinaryResponse.data.file.url;
  
        // Check for blur using Python API
        const blurCheckResponse = await axios.post(
          "http://172.16.11.157:5001/analyze-blur",
          {
            image_url: uploadedUrl
          }
        );
  
        if (blurCheckResponse.data.is_blurry === "True") {
          // If image is blurry, show error and skip this file
          toast.error(`${fileObj.file.name} is too blurry. Please upload a clearer image.`, {
            position: "top-right",
            autoClose: 3000,
          });
          //alert(`${fileObj.file.name} is too blurry. Please upload a clearer image.`);
          return;
        }
  
        // If image is not blurry, proceed with Firebase upload
        const timestamp = new Date().toISOString();
        const docTypeKey = fileObj.type;
  
        if (docTypeKey === "other") {
          newData.other_docs = newData.other_docs || [];
          newData.other_docs.push({
            url: uploadedUrl,
            uploadTimestamp: timestamp,
            status: 1,
            blurScore: blurCheckResponse.data.blur_score
          });
        } else {
          newData[docTypeKey] = {
            url: uploadedUrl,
            uploadTimestamp: timestamp,
            status: 1,
            blurScore: blurCheckResponse.data.blur_score
          };
        }
  
        console.log(`Successfully processed ${fileObj.file.name}`);
      }
  
      // Save the successfully processed files to Firestore
      await setDoc(userDocRef, newData);
      //alert("Files processed and uploaded successfully!");
      toast.success("Files processed and uploaded successfully!", {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
      setUploadedFiles([]);
  
    } catch (error) {
      //console.error("Error during upload process:", error);
      toast.error("Error during upload process:", error, {
        position: "top-right",
        style: { fontSize: "1.25rem", padding: "1rem" },
        autoClose: 3000,
      });
      //alert("Upload failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center p-6">
       <ToastContainer />
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          Upload Your Documents
        </h2>

        <div className="mb-6">
          <label
            htmlFor="docType"
            className="block text-gray-700 font-semibold mb-2"
          >
            Select Document Type
          </label>
          <select
            id="docType"
            value={selectedDocType}
            onChange={handleDocTypeChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="aadhar_card">Aadhar Card</option>
            <option value="voter_card">Voter Card</option>
            <option value="pan_card">PAN Card</option>
            <option value="dob_certificate">DOB Certificate</option>
            <option value="school_marksheet">School Marksheet</option>
            <option value="driving_licence">Driving Licence</option>
            <option value="passing_certificate">Passing Certificate</option>
            <option value="medical_fitness_certificate">
              Medical Fitness Certificate
            </option>
            <option value="other">Other Document</option>
          </select>
        </div>

        <div
          {...getRootProps()}
          className={`border-dashed border-4 rounded-lg p-8 transition duration-300 
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            }
            hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer`}
        >
          <input {...getInputProps()} />
          <p className="text-center text-gray-600">
            {isDragActive
              ? "Drop the files here ..."
              : "Drag & drop some files here, or click to select files"}
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            Supported formats: Images, PDF
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Uploaded Documents
            </h3>
            <ul className="space-y-2">
              {uploadedFiles.map((fileObj, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-100 rounded-md"
                >
                  <div className="flex items-center">
                    {fileObj.file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(fileObj.file)}
                        alt={fileObj.file.name}
                        className="w-12 h-12 object-cover rounded-md mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md mr-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-800 font-medium">
                        {fileObj.file.name}
                      </p>
                      <p className="text-gray-500 text-sm capitalize">
                        {formatDocType(fileObj.type)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          className={`mt-6 w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 ${
            uploadedFiles.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleUpload}
          disabled={uploadedFiles.length === 0 || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
    </div>
  );

  function formatDocType(docType) {
    switch (docType) {
      case "aadhar_card":
        return "Aadhar Card";
      case "voter_card":
        return "Voter Card";
      case "pan_card":
        return "PAN Card";
      case "dob_certificate":
        return "DOB Certificate";
      case "school_marksheet":
        return "School Marksheet";
      case "driving_licence":
        return "Driving Licence";
      case "passing_certificate":
        return "Passing Certificate";
      case "medical_fitness_certificate":
        return "Medical Fitness Certificate";
      case "other":
        return "Other Document";
      default:
        return docType.replace(/_/g, " ");
    }
  }
};

export default UploadDocs;
