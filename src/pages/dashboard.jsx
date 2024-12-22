import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight, Star, XCircle, ArrowUpCircle, Briefcase, Link, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ResumeReviewer() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const token = localStorage.getItem('token');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await fetch(
        'https://adaptive-learning-v1.onrender.com/resume/resume_upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const reviewResponse = await fetch(
        'https://adaptive-learning-v1.onrender.com/resume/resume_review',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!reviewResponse.ok) {
        throw new Error('Review failed');
      }

      const reviewData = await reviewResponse.json();
      console.log('API Response:', reviewData);

      setReviewData(reviewData[0]); // Assuming the API returns an array with one object
      setUploadStatus('completed');
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Reviewer</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 bg-white mb-8">
            {!file ? (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">Upload your resume</h2>
                <p className="mt-1 text-sm text-gray-500">PDF up to 10MB</p>
                <div className="mt-6">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-blue-600 hover:bg-blue-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Select PDF
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-blue-600" />
                <h2 className="mt-2 text-lg font-medium text-gray-900">{fileName}</h2>
                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Reviewing...
                      </>
                    ) : (
                      <>
                        Get Reviewed
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          {uploadStatus && (
            <div
              className={`mb-8 p-4 rounded-md ${
                uploadStatus === 'completed' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {uploadStatus === 'completed' && (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-700">
                    Your resume has been successfully reviewed!
                  </span>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">
                    An error occurred while reviewing. Please try again.
                  </span>
                </div>
              )}
            </div>
          )}
          {reviewData && (
            <div className="space-y-8">
              {/* Resume Score */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-center">
                    <Star className="h-8 w-8 text-yellow-400 mr-2" />
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Resume Score: {reviewData["Resume Score"] || "N/A"}
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
                      {reviewData["Strong Parts of the Resume"]?.map((item, index) => (
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
                      {reviewData["Weak Parts of the Resume"]?.map((item, index) => (
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
                      {reviewData["Scope of Improvements"]?.map((item, index) => (
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
                      {reviewData["Resume is Best Suited for Roles"]?.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600">{item}</li>
                      )) || <li className="text-sm text-gray-600">No data available</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Useful Links */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Link className="h-5 w-5 text-indigo-500 mr-2" />
                    Useful Links
                  </h3>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {reviewData["Useful Links"]?.map((link, index) => (
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
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Instructions</h3>
                  <p className="text-sm text-gray-600">{reviewData["Additional Instructions"] || "No additional instructions available"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

