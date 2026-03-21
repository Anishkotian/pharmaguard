export default function MultiDoctorAlert({ alert, onDismiss }) {
  const isHigh = alert.severity === "HIGH"

  return (
    <div className={`rounded-xl border p-5 mb-4 relative ${
      isHigh
        ? "bg-orange-950 border-orange-700"
        : "bg-yellow-950 border-yellow-700"
    }`}>

      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
        isHigh ? "bg-orange-500" : "bg-yellow-500"
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👨‍⚕️</span>
          <div>
            <p className={`font-bold text-sm font-mono tracking-widest ${
              isHigh ? "text-orange-400" : "text-yellow-400"
            }`}>
              {isHigh ? "HIGH RISK" : "MEDIUM RISK"} — MULTI-DOCTOR CONFLICT
            </p>
            <p className="text-white font-semibold text-base mt-1">
              {alert.memberName}'s medicines conflict
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-600 hover:text-white text-xl ml-4"
          >×</button>
        )}
      </div>

      {/* Two doctors */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-black bg-opacity-30 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">DOCTOR 1</p>
          <p className="text-white font-semibold text-sm">{alert.doctor1}</p>
          <p className="text-gray-400 text-xs mt-1">For: {alert.condition1}</p>
          <p className="text-orange-300 text-sm font-bold mt-2">{alert.med1}</p>
        </div>
        <div className="bg-black bg-opacity-30 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">DOCTOR 2</p>
          <p className="text-white font-semibold text-sm">{alert.doctor2}</p>
          <p className="text-gray-400 text-xs mt-1">For: {alert.condition2}</p>
          <p className="text-orange-300 text-sm font-bold mt-2">{alert.med2}</p>
        </div>
      </div>

      {/* Neither doctor knows */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">THE PROBLEM</p>
        <p className="text-gray-300 text-sm">
          <span className="text-orange-400 font-semibold">{alert.doctor1}</span> does not know
          what <span className="text-orange-400 font-semibold">{alert.doctor2}</span> prescribed —
          and neither knows about this conflict.
        </p>
      </div>

      {/* Risk */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">RISK</p>
        <p className="text-gray-200 text-sm">{alert.effect}</p>
      </div>

      {/* Action */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1 font-mono tracking-widest">ACTION</p>
        <p className={`text-sm font-semibold ${
          isHigh ? "text-orange-300" : "text-yellow-300"
        }`}>{alert.action}</p>
      </div>

    </div>
  )
}
