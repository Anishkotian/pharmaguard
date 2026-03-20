export default function FamilyMap({ members, alerts }) {
  const hasAlert = (memberName) => {
    return alerts.some(
      a => a.member1 === memberName || a.member2 === memberName
    )
  }

  const getAlertBetween = (name1, name2) => {
    return alerts.find(
      a =>
        (a.member1 === name1 && a.member2 === name2) ||
        (a.member1 === name2 && a.member2 === name1)
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
      <p className="text-xs text-gray-500 font-mono tracking-widest mb-4">
        FAMILY MEDICINE MAP
      </p>

      {/* Member nodes */}
      <div className="flex flex-wrap gap-3 mb-4">
        {members.map(member => (
          <div
            key={member.id}
            className={`rounded-xl px-4 py-3 border text-center min-w-24 ${
              hasAlert(member.name)
                ? "bg-red-950 border-red-700 animate-pulse"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <p className="text-2xl mb-1">
              {hasAlert(member.name) ? "🚨" : "👤"}
            </p>
            <p className="text-white text-sm font-semibold">{member.name}</p>
            <p className="text-gray-500 text-xs">{member.medicines.length} medicines</p>
          </div>
        ))}
      </div>

      {/* Alert connections */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-red-950 bg-opacity-50 rounded-lg px-3 py-2"
            >
              <span className="text-red-500 font-bold text-sm">{alert.member1}</span>
              <div className="flex-1 h-px bg-red-700 relative">
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-900 px-2 text-red-400 text-xs font-mono">
                  ⚡ {alert.severity}
                </span>
              </div>
              <span className="text-red-500 font-bold text-sm">{alert.member2}</span>
            </div>
          ))}
        </div>
      )}

      {alerts.length === 0 && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span>✅</span>
          <span>No cross-family interactions detected</span>
        </div>
      )}
    </div>
  )
}
