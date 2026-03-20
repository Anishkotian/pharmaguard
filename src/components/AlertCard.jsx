export default function AlertCard({ alert, onDismiss }) {
  const isHigh = alert.severity === "HIGH"

  return (
    <div className={`rounded-xl border p-5 mb-4 relative ${
      isHigh
        ? "bg-red-950 border-red-700"
        : "bg-yellow-950 border-yellow-700"
    }`}>

      {/* Top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${
        isHigh ? "bg-red-500" : "bg-yellow-500"
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isHigh ? "🚨" : "⚠️"}</span>
          <div>
            <p className={`font-bold text-sm ${
              isHigh ? "text-red-400" : "text-yellow-400"
            }`}>
              {isHigh ? "HIGH RISK" : "MEDIUM RISK"} — CROSS FAMILY INTERACTION
            </p>
            <p className="text-white font-semibold text-base mt-1">
              {alert.member1}'s {alert.med1} + {alert.member2}'s {alert.med2}
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

      {/* Effect */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-400 mb-1 font-mono tracking-widest">RISK</p>
        <p className="text-gray-200 text-sm">{alert.effect}</p>
      </div>

      {/* Action */}
      <div className="bg-black bg-opacity-30 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1 font-mono tracking-widest">ACTION</p>
        <p className={`text-sm font-semibold ${
          isHigh ? "text-red-300" : "text-yellow-300"
        }`}>{alert.action}</p>
      </div>

    </div>
  )
}
