export default function DuplicateAlert({ duplicate }) {
  const { generic, entries, totalDose, safeLimit, isOverLimit } = duplicate

  return (
    <div className={`rounded-xl border p-5 mb-4 relative ${
      isOverLimit
        ? "bg-red-950 border-red-700"
        : "bg-yellow-950 border-yellow-700"
    }`}>

      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
        isOverLimit ? "bg-red-500" : "bg-yellow-500"
      }`} />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💊</span>
        <div>
          <p className={`font-bold text-sm font-mono tracking-widest ${
            isOverLimit ? "text-red-400" : "text-yellow-400"
          }`}>
            DUPLICATE MEDICINE DETECTED
          </p>
          <p className="text-white font-bold text-lg uppercase mt-1">
            {generic}
          </p>
        </div>
      </div>

      {/* Brands involved */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-400 mb-2 font-mono tracking-widest">
          SAME MOLECULE FOUND IN
        </p>
        <div className="flex flex-wrap gap-2">
          {entries.map((entry, i) => (
            <div key={i} className="bg-gray-800 rounded-lg px-3 py-2">
              <p className="text-white text-sm font-semibold">
                {entry.medicine.brandName}
              </p>
              <p className="text-gray-500 text-xs">{entry.member.name}</p>
              <p className="text-gray-600 text-xs">{entry.medicine.dose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dose bar */}
      {safeLimit && (
        <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
          <div className="flex justify-between mb-2">
            <p className="text-xs text-gray-400 font-mono tracking-widest">
              COMBINED DOSE
            </p>
            <p className={`text-xs font-bold ${
              isOverLimit ? "text-red-400" : "text-yellow-400"
            }`}>
              {totalDose}mg / {safeLimit}mg safe limit
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                isOverLimit ? "bg-red-500" : "bg-yellow-500"
              }`}
              style={{
                width: `${Math.min((totalDose / safeLimit) * 100, 100)}%`
              }}
            />
          </div>
          {isOverLimit && (
            <p className="text-red-400 text-xs mt-2 font-semibold">
              ⚠️ Combined dose exceeds safe daily limit
            </p>
          )}
        </div>
      )}

      {/* Action */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1 font-mono tracking-widest">ACTION</p>
        <p className={`text-sm font-semibold ${
          isOverLimit ? "text-red-300" : "text-yellow-300"
        }`}>
          {isOverLimit
            ? "Remove one medicine immediately. Combined dose exceeds safe limit."
            : "Check with doctor — both medicines contain the same molecule."}
        </p>
      </div>

    </div>
  )
}
