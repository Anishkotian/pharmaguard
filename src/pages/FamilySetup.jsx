import { useState } from "react"
import { saveFamily } from "../services/familyService"

export default function FamilySetup({ onComplete }) {
  const [familyName, setFamilyName] = useState("")
  const [members, setMembers] = useState([
    { id: "m1", name: "", age: "", medicines: [] }
  ])
  const [saving, setSaving] = useState(false)

  const addMember = () => {
    setMembers([...members, {
      id: "m" + Date.now(), name: "", age: "", medicines: []
    }])
  }

  const updateMember = (id, field, value) => {
    setMembers(members.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const removeMember = (id) => {
    if (members.length === 1) return
    setMembers(members.filter(m => m.id !== id))
  }

  const handleSave = async () => {
    if (!familyName.trim()) { alert("Please enter a family name"); return }
    const valid = members.filter(m => m.name.trim())
    if (valid.length === 0) { alert("Please add at least one member"); return }
    setSaving(true)
    const familyId = "family_" + Date.now()
    await saveFamily(familyId, {
      familyName: familyName.trim(),
      members: valid,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem("pharmaguard_family_id", familyId)
    setSaving(false)
    onComplete(familyId)
  }

  return (
    <div style={{
      minHeight:"100vh", background:"#05070A",
      color:"#EAEEF2", fontFamily:"'DM Sans',sans-serif",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px 16px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .fs-input {
          width:100%; background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:14px 16px;
          color:#EAEEF2; font-size:16px;
          font-family:'DM Sans',sans-serif;
          outline:none; transition:border-color 0.2s;
          box-sizing:border-box;
        }
        .fs-input:focus { border-color:#CC2222; }
        .fs-input::placeholder { color:#636E7B; }
      `}</style>

      <div style={{width:"100%", maxWidth:"440px"}}>

        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:"32px"}}>
          <h1 style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:"48px", letterSpacing:"0.08em",
            color:"#CC2222", margin:"0 0 4px"
          }}>PharmaGuard</h1>
          <p style={{color:"#636E7B", fontSize:"14px", margin:0}}>
            Family Medicine Safety System
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:"20px", padding:"28px 24px"
        }}>
          <p style={{
            fontFamily:"'JetBrains Mono',monospace",
            fontSize:"10px", letterSpacing:"0.2em",
            color:"#636E7B", textTransform:"uppercase",
            marginBottom:"20px"
          }}>Create Family Profile</p>

          {/* Family name */}
          <div style={{marginBottom:"20px"}}>
            <label style={{
              display:"block", fontSize:"12px",
              color:"#636E7B", marginBottom:"8px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.1em", textTransform:"uppercase"
            }}>Family Name</label>
            <input
              className="fs-input"
              type="text"
              placeholder="e.g. Kumar Family"
              value={familyName}
              onChange={e => setFamilyName(e.target.value)}
            />
          </div>

          {/* Members */}
          <div style={{marginBottom:"20px"}}>
            <label style={{
              display:"block", fontSize:"12px",
              color:"#636E7B", marginBottom:"8px",
              fontFamily:"'JetBrains Mono',monospace",
              letterSpacing:"0.1em", textTransform:"uppercase"
            }}>Family Members</label>

            <div style={{display:"flex", flexDirection:"column", gap:"8px"}}>
              {members.map(member => (
                <div key={member.id} style={{display:"flex", gap:"8px", alignItems:"center"}}>
                  <input
                    className="fs-input"
                    type="text"
                    placeholder="Name e.g. Father"
                    value={member.name}
                    onChange={e => updateMember(member.id, "name", e.target.value)}
                    style={{flex:1}}
                  />
                  <input
                    className="fs-input"
                    type="number"
                    placeholder="Age"
                    value={member.age}
                    onChange={e => updateMember(member.id, "age", e.target.value)}
                    style={{width:"70px"}}
                  />
                  <button
                    onClick={() => removeMember(member.id)}
                    style={{
                      background:"rgba(204,34,34,0.1)",
                      border:"1px solid rgba(204,34,34,0.2)",
                      color:"#FF5555", borderRadius:"10px",
                      width:"42px", height:"48px",
                      fontSize:"18px", cursor:"pointer",
                      flexShrink:0, display:"flex",
                      alignItems:"center", justifyContent:"center"
                    }}
                  >×</button>
                </div>
              ))}
            </div>

            <button
              onClick={addMember}
              style={{
                marginTop:"10px",
                background:"none", border:"none",
                color:"#CC2222", fontSize:"13px",
                fontWeight:"600", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif",
                padding:0, display:"flex",
                alignItems:"center", gap:"4px"
              }}
            >+ Add another member</button>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width:"100%", background: saving ? "#333" : "#CC2222",
              color:"white", border:"none",
              borderRadius:"12px", padding:"16px",
              fontSize:"15px", fontWeight:"700",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif",
              transition:"all 0.2s"
            }}
          >
            {saving ? "Creating..." : "Create Family Profile →"}
          </button>
        </div>

      </div>
    </div>
  )
}
