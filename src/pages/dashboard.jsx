import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);

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
    formData.append('resume', file);

    try {
      const response = await fetch('https://api.resumereviewer.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setReviewStatus('ready');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setReviewStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReview = async () => {
    setIsReviewing(true);
    try {
      const response = await fetch('https://api.resumereviewer.com/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setReviewStatus('completed');
      } else {
        throw new Error('Review failed');
      }
    } catch (error) {
      console.error('Error reviewing resume:', error);
      setReviewStatus('error');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Reviewer</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center bg-white">
              {!file ? (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <h2 className="mt-2 text-sm font-medium text-gray-900">Upload your resume</h2>
                  <p className="mt-1 text-xs text-gray-500">PDF up to 10MB</p>
                  <div className="mt-6">
                    <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Select PDF
                      <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-blue-600" />
                  <h2 className="mt-2 text-sm font-medium text-gray-900">{fileName}</h2>
                  <div className="mt-6 space-y-4">
                    {reviewStatus !== 'ready' && (
                      <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-blue-600 hover:bg-blue-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" />
                            Uploading...
                          </>
                        ) : (
                          <>Upload Resume</>
                        )}
                      </button>
                    )}
                    {reviewStatus === 'ready' && (
                      <button
                        onClick={handleReview}
                        disabled={isReviewing}
                        className="bg-green-600 hover:bg-green-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isReviewing ? (
                          <>
                            <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Reviewing...
                          </>
                        ) : (
                          <>
                            Get Reviewed
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {reviewStatus && (
              <div className={`mt-6 p-4 rounded-md ${
                reviewStatus === 'completed' ? 'bg-green-100' : 
                reviewStatus === 'error' ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {reviewStatus === 'completed' && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                    <span className="text-green-700">Your resume has been successfully reviewed!</span>
                  </div>
                )}
                {reviewStatus === 'error' && (
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-700">An error occurred during the review process. Please try again.</span>
                  </div>
                )}
                {reviewStatus === 'ready' && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-400 mr-2" />
                    <span className="text-blue-700">Your resume is ready for review. Click the "Get Reviewed" button to start the AI analysis.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

