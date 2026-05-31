import React, { useState } from 'react'
import './App.css'

export default function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const [reconUrl, setReconUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const apiBase = import.meta.env.VITE_API_URL || ''

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setReconUrl(null)
    setStatus('')
  }

  async function uploadAndRun() {
    if (!file) return alert('Please choose an image first')
    setLoading(true)
    setStatus('Uploading image...')

    const form = new FormData()
    form.append('file', file)

    try {
      setStatus('Starting pipeline...')
      const resp = await fetch(`${apiBase}/api/predict`, {
        method: 'POST',
        body: form
      })

      if (!resp.ok) {
        const txt = await resp.text()
        throw new Error(txt || 'Server error')
      }

      const data = await resp.json()
      setResult(data)
      if (data.reconstruction_url) {
        setReconUrl(`${apiBase}${data.reconstruction_url}`)
      }
      setStatus('Done')
    } catch (err) {
      console.error(err)
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">SkullRecon AI</h1>
          <p className="text-xl text-purple-200">Facial Reconstruction System</p>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-400">
            <div className="text-3xl mb-2">📤</div>
            <div className="text-white font-medium">Upload Skull</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-400">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-white font-medium">AI Analysis</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-400">
            <div className="text-3xl mb-2">🎨</div>
            <div className="text-white font-medium">Face Generation</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
            <label className="cursor-pointer block">
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <div className="py-8">
                <div className="text-6xl mb-4">☠️</div>
                <div className="text-2xl font-semibold text-gray-700 mb-2">Upload Skull Image</div>
                <div className="text-gray-500">Click to browse or drag and drop (JPG, PNG)</div>
              </div>
            </label>
          </div>

          {preview && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-700 mb-3">Input Skull</div>
                <img src={preview} alt="preview" className="w-full h-64 object-contain rounded-lg shadow-md bg-gray-50" />
              </div>
              <div className="flex flex-col justify-center">
                <button 
                  onClick={uploadAndRun} 
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? '⏳ Processing...' : '🚀 Start Reconstruction'}
                </button>
                {status && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Status: {status}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🔬 Analysis Results</h2>
              
              {result.stage === 'animal_detected' ? (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
                  <div className="font-semibold text-yellow-800 text-lg mb-2">❌ Animal Skull Detected</div>
                  <div className="text-yellow-700">Type: {result.label}</div>
                  <div className="text-yellow-700">Confidence: {(result.prob * 100).toFixed(2)}%</div>
                  <div className="text-yellow-600 text-sm mt-2">Reconstruction not available for animal skulls.</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-300 rounded">
                    <div className="font-semibold text-green-800 text-lg mb-2">✅ Step 1: Skull Classification</div>
                    <div className="text-green-700">Detected: <span className="font-bold">Human Skull</span></div>
                    <div className="text-green-700">Confidence: {(result.skull_prob * 100).toFixed(2)}%</div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-300 rounded">
                    <div className="font-semibold text-blue-800 text-lg mb-2">✅ Step 2: Gender Prediction</div>
                    <div className="text-blue-700">Predicted Gender: <span className="font-bold capitalize">{result.gender_label}</span></div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-300 rounded">
                    <div className="font-semibold text-purple-800 text-lg mb-2">✅ Step 3: Face Reconstruction</div>
                    <div className="text-purple-700">Status: <span className="font-bold">Generation Complete</span></div>
                    <div className="text-purple-600 text-sm mt-1">See reconstructed face below ⬇️</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {reconUrl && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">✨ Reconstructed Face</h3>
              <div className="flex justify-center">
                <img src={reconUrl} alt="reconstructed" className="max-w-md w-full rounded-lg shadow-2xl border-4 border-purple-300" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
