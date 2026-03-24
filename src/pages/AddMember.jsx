import { useState } from "react"

export default function AddMember({ onAdd, onClose }) {
  const [name, setName]   = useState("")
  const [age, setAge]     = useState("")
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) { alert("Please enter a name"); return }
    if (!age.trim())  { alert("Please enter an age");  return }
    setSaving(true)
    await onAdd({
      id:        "m" + Date.now(),
      name:      name.trim(),
      age:       age.trim(),
      medicines: []
    })
    setSaving(false)
    onClose()
  }

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"rgba(0,0,0,0.85)",
      backdropFilter:"blur(8px)",
      display:"flex", alignItems:"flex-end",
      justifyContent:"center", zIndex:50
    }}>
      <style>{`
        @media(min-width:640px){
          .am-modal {
            align-self: center !important;
            border-radius: 20px !important;
            max-width: 420px !important;
          }
        }
        .am-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #EAEEF2;
          font-size: 16px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .am-input:focus { border-color: #CC2222; }
        .am-input::placeholder { color: #636E7B; }
      `}</style>

      <div className="am-modal" style={{
        background:"rgba(9,12,16,0.98)",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:"20px 20px 0 0",
        width:"100%",
        padding:"24px 20px 32px",
        fontFamily:"'DM Sans',sans-serif"
      }}>

        {/* Handle bar */}
        <div style={{
          width:"40px", height:"4px",
          background:"rgba(255,255,255,0.1)",
          borderRadius:"2px", margin:"0 auto 20px"
        }}/>

        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:"24px"
        }}>
          <div>
            <h2 style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:"26px", letterSpacing:"0.06em",
              color:"#EAEEF2", margin:0
            }}>👤 Add Family Member</h2>
            <p style={{color:"#636E7B", fontSize:"12px", margin:"4px 0 0"}}>
              Add a new person to your family profile
            </p>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"#EAEEF2", borderRadius:"10px",
            width:"36px", height:"36px",
            fontSize:"18px", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center"
          }}>×</button>
        </div>

        {/* Name input */}
        <div style={{marginBottom:"14px"}}>
          <label style={{
            display:"block", fontSize:"11px",
            color:"#636E7B", marginBottom:"8px",
            fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:"0.15em", textTransform:"uppercase"
          }}>Full Name</label>
          <input
            className="am-input"
            type="text"
            placeholder="e.g. Grandmother, Uncle Raj"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            autoFocus
          />
        </div>

        {/* Age input */}
        <div style={{marginBottom:"24px"}}>
          <label style={{
            display:"block", fontSize:"11px",
            color:"#636E7B", marginBottom:"8px",
            fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:"0.15em", textTransform:"uppercase"
          }}>Age</label>
          <input
            className="am-input"
            type="number"
            placeholder="e.g. 65"
            value={age}
            onChange={e => setAge(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            min="0"
            max="120"
          />
        </div>

        {/* Buttons */}
        <div style={{display:"flex", gap:"10px"}}>
          <button
            onClick={onClose}
            style={{
              flex:1, background:"rgba(255,255,255,0.05)",
              border:"1px solid rgba(255,255,255,0.1)",
              color:"#EAEEF2", borderRadius:"12px",
              padding:"14px", fontSize:"14px",
              fontWeight:"600", cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif"
            }}
          >Cancel</button>
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim() || !age.trim()}
            style={{
              flex:2,
              background: saving || !name.trim() || !age.trim()
                ? "rgba(204,34,34,0.4)" : "#CC2222",
              border:"none", color:"white",
              borderRadius:"12px", padding:"14px",
              fontSize:"14px", fontWeight:"700",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.2s"
            }}
          >
            {saving ? "Adding..." : "➕ Add Member"}
          </button>
        </div>

      </div>
    </div>
  )
}
