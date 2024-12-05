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
      usefulLinks: []
    };

    let currentSection = '';

    lines.forEach(line => {
      if (line.startsWith('Resume score:')) {
        result.score = parseInt(line.split(':')[1].trim());
      } else if (line.startsWith('Strong parts of the resume:')) {
        currentSection = 'strong';
      } else if (line.startsWith('Weak parts of the resume:')) {
        currentSection = 'weak';
      } else if (line.startsWith('Scope of improvements:')) {
        currentSection = 'improvements';
      } else if (line.startsWith('Resume is best suited for the following roles:')) {
        currentSection = 'roles';
      } else if (line.startsWith('Useful links:')) {
        currentSection = 'links';
      } else if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.')) {
        switch (currentSection) {
          case 'strong':
            result.strongParts.push(line.trim().substring(3));
            break;
          case 'weak':
            result.weakParts.push(line.trim().substring(3));
            break;
          case 'improvements':
            result.improvements.push(line.trim().substring(3));
            break;
          case 'roles':
            result.suitableRoles.push(line.trim().substring(3));
            break;
          case 'links':
            result.usefulLinks.push(line.trim().substring(3));
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

