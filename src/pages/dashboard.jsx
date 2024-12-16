import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight, Star, ThumbsUp, ThumbsDown, TrendingUp, Briefcase, LinkIcon, ExternalLink } from 'lucide-react';

export default function Dashboard() {
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
      const response = await fetch(
        'https://adaptive-learning-v1.onrender.com/resume/resume_upload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await fetch(
          'https://adaptive-learning-v1.onrender.com/resume/resume_review',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const resp = await data.json();
        setReviewData(parseReviewData(resp.answer));
        setUploadStatus('completed');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const parseReviewData = (data) => {
    const lines = data.split('\n');
    const result = {
      score: 0,
      strongParts: [],
      weakParts: [],
      improvements: [],
      suitableRoles: [],
      usefulLinks: [],
      additionalInstructions: '',
    };

    let currentSection = '';

    const cleanContent = (content) => content.replace(/\*\*/g, '').trim();

    lines.forEach((line) => {
      const cleanedLine = cleanContent(line);

      if (cleanedLine.startsWith('Resume score:')) {
        result.score = parseInt(cleanedLine.split(':')[1].trim());
      } else if (cleanedLine.startsWith('Strong parts of the resume:')) {
        currentSection = 'strong';
      } else if (cleanedLine.startsWith('Weak parts of the resume:')) {
        currentSection = 'weak';
      } else if (cleanedLine.startsWith('Scope of improvements:')) {
        currentSection = 'improvements';
      } else if (cleanedLine.startsWith('Resume is best suited for the following roles:')) {
        currentSection = 'roles';
      } else if (cleanedLine.startsWith('Useful links:')) {
        currentSection = 'links';
      } else if (cleanedLine.startsWith('Additional Instructions:')) {
        currentSection = 'additional';
      } else if (cleanedLine.trim().startsWith('•')) {
        const content = cleanContent(cleanedLine.substring(1));
        switch (currentSection) {
          case 'strong':
            result.strongParts.push(content);
            break;
          case 'weak':
            result.weakParts.push(content);
            break;
          case 'improvements':
            result.improvements.push(content);
            break;
          case 'roles':
            result.suitableRoles.push(content);
            break;
          case 'links':
            result.usefulLinks.push(content);
            break;
          case 'additional':
            result.additionalInstructions += content + ' ';
            break;
        }
      }
    });

    return result;
  };

  const FeedbackSection = ({ title, items, icon: Icon, color }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Icon className={`h-5 w-5 ${color} mr-2`} />
        {title}
      </h3>
      <ul className="list-disc pl-5 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  );

  const renderFeedback = (category, feedback) => {
    if (category === 'Useful Links' && Array.isArray(feedback)) {
      return (
        <ul className="list-disc pl-5">
          {feedback.map((link, index) => {
            const [url, description] = link.split(' ', 2);
            return (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                  {description || url}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </li>
            );
          })}
        </ul>
      );
    }
    return Array.isArray(feedback) ? (
      <ul className="list-disc pl-5">
        {feedback.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      feedback
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Resume Reviewer</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Resume</h2>
              <div className="mb-6">
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>
              {file && (
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{fileName}</span>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
              )}
            </div>
          </div>

          {uploadStatus && (
            <div className={`mt-6 p-4 rounded-md ${
              uploadStatus === 'completed' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {uploadStatus === 'completed' ? (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>Your resume has been successfully reviewed!</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span>An error occurred while reviewing. Please try again.</span>
                </div>
              )}
            </div>
          )}

          {reviewData && (
            <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Review Results</h2>
                <div className="flex items-center justify-center mb-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-indigo-600">{reviewData.score}</div>
                    <div className="mt-2 text-sm font-medium text-gray-500">Resume Score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeedbackSection
                    title="Strong Points"
                    items={reviewData.strongParts}
                    icon={ThumbsUp}
                    color="text-green-500"
                  />
                  <FeedbackSection
                    title="Areas for Improvement"
                    items={reviewData.weakParts}
                    icon={ThumbsDown}
                    color="text-red-500"
                  />
                </div>
                
                <FeedbackSection
                  title="Suggested Improvements"
                  items={reviewData.improvements}
                  icon={TrendingUp}
                  color="text-blue-500"
                />
                
                <FeedbackSection
                  title="Suitable Roles"
                  items={reviewData.suitableRoles}
                  icon={Briefcase}
                  color="text-purple-500"
                />
                
                <FeedbackSection
                  title="Useful Links"
                  items={reviewData.usefulLinks}
                  icon={LinkIcon}
                  color="text-indigo-500"
                />
                
                {reviewData.additionalInstructions && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-md">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Additional Instructions</h3>
                    <p className="text-yellow-700">{reviewData.additionalInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

