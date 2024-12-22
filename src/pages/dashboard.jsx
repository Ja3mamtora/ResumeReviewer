import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight, ExternalLink } from 'lucide-react'

export default function Dashboard() {
  const [file, setFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [reviewData, setReviewData] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setFileName(selectedFile.name)
      setError(null)
    } else {
      setError('Please upload a PDF file')
      setFile(null)
      setFileName('')
    }
  }

  const parseReviewData = (data) => {
    try {
      // The data is already in the correct format, so we just need to return it
      return data[0]
    } catch (error) {
      console.error('Error parsing review data:', error)
      return null
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setIsUploading(true)
    setUploadStatus(null)
    setReviewData(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found')
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
      )

      if (!uploadResponse.ok) {
        throw new Error('Resume upload failed')
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
      )

      if (!reviewResponse.ok) {
        throw new Error('Resume review failed')
      }

      const data = await reviewResponse.json()
      const parsedData = parseReviewData(data)

      if (!parsedData) {
        throw new Error('Invalid review data format')
      }

      setReviewData(parsedData)
      setUploadStatus('completed')
    } catch (error) {
      console.error('Error:', error)
      setUploadStatus('error')
      setError(error.message || 'An error occurred during the review process')
    } finally {
      setIsUploading(false)
    }
  }

  const ReviewSection = ({ title, items, className = "" }) => (
    <div className={`mb-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">Resume Reviewer</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 bg-white mb-8">
          {!file ? (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">Upload your resume</h2>
              <p className="mt-1 text-sm text-gray-500">PDF up to 10MB</p>
              <div className="mt-6">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white flex items-center justify-center"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Select PDF
                  <input
                    id="file-upload"
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
                  className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white flex items-center justify-center disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
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
          <div className="mb-8 p-4 rounded-md bg-red-100 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {uploadStatus && (
          <div
            className={`mb-8 p-4 rounded-md flex items-center ${
              uploadStatus === 'completed' ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {uploadStatus === 'completed' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-700">
                  Your resume has been successfully reviewed!
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700">
                  An error occurred while reviewing. Please try again.
                </span>
              </>
            )}
          </div>
        )}

        {reviewData && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Resume Score</h2>
              <div className="mt-2 text-4xl font-bold text-blue-600">{reviewData["Resume Score"]}</div>
            </div>

            <ReviewSection title="Strong Parts of the Resume" items={reviewData["Strong Parts of the Resume"]} className="bg-green-50 p-4 rounded-md" />
            <ReviewSection title="Weak Parts of the Resume" items={reviewData["Weak Parts of the Resume"]} className="bg-yellow-50 p-4 rounded-md" />
            <ReviewSection title="Scope of Improvements" items={reviewData["Scope of Improvements"]} className="bg-blue-50 p-4 rounded-md" />

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Resume is Best Suited for Roles</h2>
              <div className="flex flex-wrap gap-2">
                {reviewData["Resume is Best Suited for Roles"].map((role, index) => (
                  <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Useful Links</h2>
              <ul className="space-y-1">
                {reviewData["Useful Links"].map((link, index) => (
                  <li key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                      {link}
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h2 className="text-xl font-semibold mb-2">Additional Instructions</h2>
              <p className="text-gray-700">{reviewData["Additional Instructions"]}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

