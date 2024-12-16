import React, { useState, useEffect } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "../../Firebase";
import { useNavigate } from "react-router-dom";

const DocsVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const firestore = getFirestore(app);
        const realtimeDb = getDatabase(app);

        const collectionRef = collection(firestore, "usersDocs");
        const querySnapshot = await getDocs(collectionRef);

        const fetchedDocs = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const uid = docSnapshot.id;
            const userDocs = docSnapshot.data();

            const userRef = ref(realtimeDb, `users/${uid}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.exists() ? userSnapshot.val() : {};

            return {
              id: uid,
              name: userData.fullName || "ERROR: Name not found",
              ...userDocs,
            };
          })
        );

        setDocuments(fetchedDocs);
      } catch (error) {
        console.error("Error fetching collection data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionData();
  }, []);

  const calculateDocumentStatus = (doc) => {
    const keys = Object.keys(doc).filter(
      (key) => key !== "id" && key !== "name"
    );
  
    // Check if any document is rejected
    const hasRejectedDocs = keys.some(key => {
      const item = doc[key];
      // For array of documents
      if (Array.isArray(item)) {
        return item.some(doc => doc.status === 3);
      }
      // For single documents
      return item.status === 3;
    });
  
    // If any document is rejected, overall status is rejected
    if (hasRejectedDocs) return 3;
  
    // Check if any document is pending
    const hasPendingDocs = keys.some(key => {
      const item = doc[key];
      // For array of documents
      if (Array.isArray(item)) {
        return item.some(doc => doc.status === 1);
      }
      // For single documents
      return item.status === 1;
    });
  
    // If any document is pending, overall status is pending
    if (hasPendingDocs) return 1;
  
    // If no documents are pending or rejected, all are approved
    return 2;
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      1: { label: "Pending", color: "text-yellow-600" },
      2: { label: "Approved", color: "text-green-600" },
      3: { label: "Rejected", color: "text-red-600" }
    };
    return statusMap[status] || { label: "Unknown", color: "text-gray-600" };
  };

  const getPendingDocsCount = (doc) => {
    const keys = Object.keys(doc).filter(
      (key) => key !== "id" && key !== "name"
    );
    return keys.filter((key) => {
      const item = doc[key];
      return (
        item?.status === 1 ||
        (Array.isArray(item) && item.some((i) => i.status === 1))
      );
    }).length;
  };

  const getLastUpdatedDetails = (doc) => {
    const timestamps = Object.keys(doc)
      .filter((key) => key !== "id" && key !== "name")
      .map((key) => {
        const item = doc[key];
        if (Array.isArray(item)) {
          return item
            .map((i) => new Date(i.uploadTimestamp))
            .sort()
            .pop();
        }
        return new Date(item.uploadTimestamp);
      });

    const lastUpdated = timestamps.sort((a, b) => b - a)[0];
    return lastUpdated ? lastUpdated.toLocaleString() : "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">
        Document Verification
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-gray-600">S.No</th>
              <th className="px-4 py-2 text-left text-gray-600">UID</th>
              <th className="px-4 py-2 text-left text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-gray-600">
                Pending Docs
              </th>
              <th className="px-4 py-2 text-left text-gray-600">
                Last Updated
              </th>
              <th className="px-4 py-2 text-left text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => {
              const pendingDocs = getPendingDocsCount(doc);
              const lastUpdated = getLastUpdatedDetails(doc);
              const overallStatus = calculateDocumentStatus(doc);
              const { label: statusLabel, color: statusColor } = getStatusLabel(overallStatus);

              return (
                <tr
                  key={doc.id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } border-b border-gray-200`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{doc.id}</td>
                  <td className="px-4 py-2">{doc.name}</td>
                  <td className="px-4 py-2">{pendingDocs}</td>
                  <td className="px-4 py-2">{lastUpdated}</td>
                  <td className={`px-4 py-2 font-medium ${statusColor}`}>
                    {statusLabel}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                      onClick={() => navigate(`/details/${doc.id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocsVerification;