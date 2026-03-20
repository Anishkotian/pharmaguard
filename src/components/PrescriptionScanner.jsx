import { useState } from "react"
import Tesseract from "tesseract.js"
import { parseDrugsFromText } from "../services/drugParser"

export default function PrescriptionScanner({ familyMembers, onDrugsExtracted, onClose }) {
  const [image, setImage] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [step, setStep] = useState("upload")
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedDrugs, setExtractedDrugs] = useState([])
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]?.id || "")
  const [error, setError] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImage(URL.createObjectURL(file))
    setStep("preview")
  }

  const runOCR = async () => {
    setStep("scanning")
    setError(null)
    try {
      // Pass the actual FILE to tesseract, not the blob URL
      const result = await Tesseract.recognize(imageFile, "eng", {
        logger: m => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100))
          }
        }
      })
      const rawText = result.data.text
      console.log("OCR raw text:", rawText)

      if (!rawText || rawText.trim().length < 5) {
        setError("Could not read text from image. Please use a clearer photo.")
        setStep("preview")
        return
      }

      setStep("parsing")
      const drugs = await parseDrugsFromText(rawText)
      setExtractedDrugs(drugs)
      setStep("confirm")
    } catch (err) {
      console.error("OCR error:", err)
      setError("Could not read prescription. Please try a clearer image.")
      setStep("preview")
    }
  }

  const updateDrug = (index, field, value) => {
    setExtractedDrugs(extractedDrugs.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    ))
  }

  const removeDrug = (index) => {
    setExtractedDrugs(extractedDrugs.filter((_, i) => i !== index))
  }

  const handleConfirm = () => {
    onDrugsExtracted(selectedMember, extractedDrugs)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700">

        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Scan Prescription</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-5">

          {step === "upload" && (
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-400 mb-6">Take a photo or upload your prescription</p>
              <label className="block w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg cursor-pointer text-center transition-colors">
                📷 Upload Prescription Photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-gray-600 text-xs mt-3">Use a clear JPG or PNG image</p>
            </div>
          )}

          {step === "preview" && (
            <div>
              <img src={image} className="w-full rounded-lg mb-4 max-h-64 object-contain bg-black" />
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <button
                onClick={runOCR}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition-colors"
              >
                🔍 Read This Prescription
              </button>
              <button
                onClick={() => { setStep("upload"); setError(null) }}
                className="w-full mt-2 text-gray-500 hover:text-white py-2 text-sm"
              >
                Use a different photo
              </button>
            </div>
          )}

          {step === "scanning" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-white font-semibold mb-2">Reading prescription...</p>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-gray-500 text-sm">{ocrProgress}%</p>
            </div>
          )}

          {step === "parsing" && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🤖</div>
              <p className="text-white font-semibold mb-2">Extracting medicines...</p>
              <p className="text-gray-500 text-sm">Claude is reading the prescription</p>
            </div>
          )}

          {step === "confirm" && (
            <div>
              <p className="text-green-400 text-sm mb-4">
                ✅ Found {extractedDrugs.length} medicine{extractedDrugs.length !== 1 ? "s" : ""}
              </p>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-2">ADD TO WHICH MEMBER</label>
                <select
                  value={selectedMember}
                  onChange={e => setSelectedMember(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                >
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {extractedDrugs.map((drug, i) => (
                  <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <input
                        value={drug.brandName}
                        onChange={e => updateDrug(i, "brandName", e.target.value)}
                        className="bg-transparent text-white font-medium text-sm focus:outline-none border-b border-gray-600 flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeDrug(i)}
                        className="text-gray-600 hover:text-red-500 text-lg"
                      >×</button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={drug.dose}
                        onChange={e => updateDrug(i, "dose", e.target.value)}
                        placeholder="dose"
                        className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300 w-24 focus:outline-none"
                      />
                      <input
                        value={drug.frequency}
                        onChange={e => updateDrug(i, "frequency", e.target.value)}
                        placeholder="frequency"
                        className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300 flex-1 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{drug.genericName}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition-colors"
              >
                ✅ Save These Medicines
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
