import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Star, CheckCircle, XCircle, ArrowUpCircle, Briefcase, Link, Upload, FileText, Loader, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState, logout } = useContext(AuthContext);

  // File upload state
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!authState.isAuthenticated) {
        navigate('/signin');
        return;
      }

      try {
        const response = await fetch('https://adaptive-learning-v1.onrender.com/resume/review', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resume data');
        }

        const data = await response.json();
        if (data && data[0]) {
          setResumeData(data[0]);
        } else {
          console.error('Invalid data format received from API');
          setError('Invalid data received. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching resume data:', error);
        setError('Failed to load resume data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [authState, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    } else {
      setError('Please upload a PDF file');
      setFile(null);
      setFileName('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await fetch(
        'https://adaptive-learning-v1.onrender.com/resume/resume_upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Resume upload failed');
      }

      const reviewResponse = await fetch(
        'https://adaptive-learning-v1.onrender.com/resume/resume_review',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
          body: formData,
        }
      );

      if (!reviewResponse.ok) {
        throw new Error('Resume review failed');
      }

      const data = await reviewResponse.json();
      if (data && data[0]) {
        setResumeData(data[0]);
        setUploadStatus('completed');
      } else {
        throw new Error('Invalid data received from the server');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('error');
      setError(error.message || 'An error occurred during the review process');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Review Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        <div className="mb-8 bg-white overflow-hidden shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span>Choose PDF</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            {fileName && <span className="text-sm text-gray-600">{fileName}</span>}
          </div>
          {file && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
            >
              {isUploading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Upload and Review
                </>
              )}
            </button>
          )}
          {uploadStatus === 'completed' && (
            <p className="mt-2 text-green-600">Resume uploaded and reviewed successfully!</p>
          )}
          {uploadStatus === 'error' && (
            <p className="mt-2 text-red-600">Error uploading or reviewing resume. Please try again.</p>
          )}
        </div>

        {resumeData ? (
          <>
            {/* Resume Score */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center">
                  <Star className="h-8 w-8 text-yellow-400 mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Resume Score: {resumeData["Resume Score"] || "N/A"}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Strong Parts */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Strong Parts of the Resume
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {resumeData["Strong Parts of the Resume"]?.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    )) || <li className="text-sm text-gray-600">No data available</li>}
                  </ul>
                </div>
              </div>

              {/* Weak Parts */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    Weak Parts of the Resume
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {resumeData["Weak Parts of the Resume"]?.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    )) || <li className="text-sm text-gray-600">No data available</li>}
                  </ul>
                </div>
              </div>

              {/* Scope of Improvements */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-blue-500 mr-2" />
                    Scope of Improvements
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {resumeData["Scope of Improvements"]?.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    )) || <li className="text-sm text-gray-600">No data available</li>}
                  </ul>
                </div>
              </div>

              {/* Best Suited Roles */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                    Resume is Best Suited for Roles
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {resumeData["Resume is Best Suited for Roles"]?.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    )) || <li className="text-sm text-gray-600">No data available</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Link className="h-5 w-5 text-indigo-500 mr-2" />
                  Useful Links
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {resumeData["Useful Links"]?.map((link, index) => (
                    <li key={index}>
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center">
                        {new URL(link).hostname}
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </li>
                  )) || <li className="text-sm text-gray-600">No links available</li>}
                </ul>
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="mt-8 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Instructions</h3>
                <p className="text-sm text-gray-600">{resumeData["Additional Instructions"] || "No additional instructions available"}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <p className="text-lg text-gray-600">No resume data available. Please upload a resume to get started.</p>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

