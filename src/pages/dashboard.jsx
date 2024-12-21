import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset error when component mounts or when file changes
    setError(null);
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    setReviewData(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

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
      console.log('API Response:', reviewData); // Debug log

      if (Array.isArray(reviewData.answer)) {
        setReviewData(reviewData.answer);
        setUploadStatus('completed');
      } else {
        throw new Error('Invalid review data format');
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('error');
      setError(error.message || 'An error occurred during the review process');
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
          {error && (
            <div className="mb-8 p-4 rounded-md bg-red-100">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}
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
          {reviewData && reviewData.length > 0 && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reviewData.map((section, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                        {section.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <ReactMarkdown>{section.feedback}</ReactMarkdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
