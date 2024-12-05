import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight, Star, ThumbsUp, ThumbsDown, TrendingUp, Briefcase, Link } from 'lucide-react';

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
  };

  let currentSection = '';

  // Helper function to clean the content
  const cleanContent = (content) => content.replace(/\*\*/g, '').trim();

  lines.forEach((line) => {
    const cleanedLine = cleanContent(line); // Clean the line to remove '**'

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
    } else if (
      cleanedLine.trim().startsWith('1.') ||
      cleanedLine.trim().startsWith('2.') ||
      cleanedLine.trim().startsWith('3.') ||
      cleanedLine.trim().startsWith('4.')
    ) {
      const content = cleanContent(cleanedLine.substring(3)); // Clean and remove numbering
      switch (currentSection) {
        case 'strong':
        case 'weak':
          const [boldPart, ...rest] = content.split(':');
          const formattedContent =
            rest.length > 0
              ? (
                <>
                  <strong>{boldPart}:</strong>
                  {rest.join(':')}
                </>
              )
              : content;
          if (currentSection === 'strong') {
            result.strongParts.push(formattedContent);
          } else {
            result.weakParts.push(formattedContent);
          }
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
      }
    }
  });

  return result;
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
                  <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center">
                    <Upload className="mr-2 h-5 w-5" />
                    Select PDF
                    <input id="file-upload" name="file-upload" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
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
            <div className={`mb-8 p-4 rounded-md ${
              uploadStatus === 'completed' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {uploadStatus === 'completed' && (
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-green-700">Your resume has been successfully reviewed!</span>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-700">An error occurred while reviewing. Please try again.</span>
                </div>
              )}
            </div>
          )}
          {reviewData && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resume Review Results</h2>
              <div className="flex items-center mb-6">
                <Star className="h-8 w-8 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-gray-900">{reviewData.score}/100</span>
              </div>
          
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Strong Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <ThumbsUp className="h-5 w-5 text-green-500 mr-2" />
                    Strong Points
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {reviewData.strongParts.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
          
                {/* Areas for Improvement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <ThumbsDown className="h-5 w-5 text-red-500 mr-2" />
                    Areas for Improvement
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {reviewData.weakParts.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
          
              {/* Suggested Improvements */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  Suggested Improvements
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {reviewData.improvements.map((improvement, index) => (
                    <li key={index} className="text-gray-700">{improvement}</li>
                  ))}
                </ul>
              </div>
          
              {/* Suitable Roles */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Briefcase className="h-5 w-5 text-purple-500 mr-2" />
                  Suitable Roles
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {reviewData.suitableRoles.map((role, index) => (
                    <li key={index} className="text-gray-700">{role}</li>
                  ))}
                </ul>
              </div>
          
              {/* Useful Resources */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Link className="h-5 w-5 text-indigo-500 mr-2" />
                  Useful Resources
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {reviewData.usefulLinks.map((link, index) => (
                    <li key={index} className="text-gray-700">{link}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>          
          )}
        </div>
      </main>
    </div>
  );
}

