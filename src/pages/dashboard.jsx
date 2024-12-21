import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react'

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
      const sections = {
        "Resume Score": data.score ? [`${data.score}/100`] : [],
        "Strong Parts of the Resume": data.strongParts || [],
        "Weak Parts of the Resume": data.weakParts || [],
        "Scope of Improvements": data.improvements || [],
      }

      return Object.entries(sections).map(([category, feedback]) => ({
        category,
        feedback: Array.isArray(feedback) ? feedback : [feedback]
      }))
    } catch (error) {
      console.error('Error parsing review data:', error)
      return []
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
      const parsedData = parseReviewData(data.answer)

      if (parsedData.length === 0) {
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

        {reviewData && reviewData.length > 0 && (
          <div className="bg-white shadow rounded-md p-6">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-bold text-gray-800">Category</th>
                  <th className="text-left p-2 font-bold text-gray-800">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {reviewData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium text-gray-700">{item.category}</td>
                    <td className="p-2">
                      <ul className="list-disc pl-5">
                        {item.feedback.map((point, idx) => (
                          <li key={idx}>{point}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
