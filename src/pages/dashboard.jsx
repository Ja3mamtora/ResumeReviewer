import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react';

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
    const cleanContent = (content) => content.replace(/\*\*/g, '').trim();

    lines.forEach((line) => {
      const cleanedLine = cleanContent(line);

      if (cleanedLine.startsWith('Resume score:')) {
        result.score = cleanedLine.split(':')[1].trim();
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
        cleanedLine.trim().match(/^\d+\./)
      ) {
        const content = cleanContent(cleanedLine.replace(/^\d+\.\s*/, ''));
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
          default:
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
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-gray-700 font-bold">
                      Category
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-gray-700 font-bold">
                      Feedback
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Resume Score</td>
                    <td className="border border-gray-300 px-4 py-2">{reviewData.score}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Strong Points</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc ml-5">
                        {reviewData.strongParts.map((point, index) => (
                          <li key={`strong-${index}`}>{point}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Weak Points</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc ml-5">
                        {reviewData.weakParts.map((point, index) => (
                          <li key={`weak-${index}`}>{point}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Areas for Improvement</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc ml-5">
                        {reviewData.improvements.map((point, index) => (
                          <li key={`improvement-${index}`}>{point}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Suitable Roles</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc ml-5">
                        {reviewData.suitableRoles.map((role, index) => (
                          <li key={`role-${index}`}>{role}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Useful Links</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <ul className="list-disc ml-5">
                        {reviewData.usefulLinks.map((link, index) => (
                          <li key={`link-${index}`}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
