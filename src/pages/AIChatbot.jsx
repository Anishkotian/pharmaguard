import { useState, useRef, useEffect } from "react"
import { askMedicineChatbot } from "../services/aiService"

const suggestions = [
  "Is it safe to take ibuprofen with my current medicines?",
  "What medicines should not be taken together?",
  "Can my father drink alcohol with his medicines?",
  "What are the side effects of Warfarin?",
  "Which medicines cause dizziness?",
  "Is it safe to take paracetamol every day?",
]

export default function AIChatbot({ family, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hi! I'm PharmaGuard AI 🤖\n\nI have access to your family's medicine data and can answer any questions about drug interactions, side effects, or medicine safety.\n\nWhat would you like to know?`,
      time: new Date()
    }
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" })
  }, [messages])

  const handleSend = async (text) => {
    const q = text || input.trim()
    if (!q || loading) return
    setInput("")
    setLoading(true)

    setMessages(prev => [...prev, { role:"user", text:q, time:new Date() }])

    try {
      const answer = await askMedicineChatbot(q, family)
      setMessages(prev => [...prev, { role:"ai", text:answer, time:new Date() }])
    } catch {
      setMessages(prev => [...prev, {
        role:"ai",
        text:"Sorry, I couldn't connect to the AI right now. Please check your internet connection and try again.",
        time: new Date()
      }])
    }
    setLoading(false)
  }

  const fmt = (date) => date.toLocaleTimeString("en-IN", {hour:"2-digit", minute:"2-digit"})

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
          .chat-modal {
            align-self:center !important;
            border-radius:20px !important;
            max-width:480px !important;
            height:80vh !important;
          }
        }
        .chat-input {
          flex:1; background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:12px 16px;
          color:#F0F4F8; font-size:16px;
          font-family:'DM Sans',sans-serif;
          outline:none; resize:none;
          transition:border-color 0.2s;
        }
        .chat-input:focus { border-color:#E53935; }
        .chat-input::placeholder { color:#64748B; }
        @keyframes msgIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes typing {
          0%,80%,100% { opacity:0.3; transform:scale(0.8); }
          40%          { opacity:1;   transform:scale(1); }
        }
      `}</style>

      <div className="chat-modal" style={{
        background:"#0D1117",
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:"20px 20px 0 0",
        width:"100%", height:"85vh",
        display:"flex", flexDirection:"column",
        overflow:"hidden", fontFamily:"'DM Sans',sans-serif"
      }}>

        {/* Header */}
        <div style={{
          padding:"16px 18px",
          borderBottom:"1px solid rgba(255,255,255,0.07)",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexShrink:0
        }}>
          <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{
              width:"38px", height:"38px", borderRadius:"12px",
              background:"linear-gradient(135deg,#E53935,#B71C1C)",
              display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"18px"
            }}>🤖</div>
            <div>
              <p style={{color:"#F0F4F8", fontWeight:"700", fontSize:"14px", margin:0}}>
                PharmaGuard AI
              </p>
              <p style={{color:"#00C853", fontSize:"11px", margin:"2px 0 0",
                fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.05em"}}>
                ● Online · {family.members.length} members loaded
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.06)",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"#F0F4F8", borderRadius:"10px",
            width:"36px", height:"36px", fontSize:"18px",
            cursor:"pointer", display:"flex",
            alignItems:"center", justifyContent:"center"
          }}>×</button>
        </div>

        {/* Messages */}
        <div style={{
          flex:1, overflowY:"auto", padding:"16px",
          display:"flex", flexDirection:"column", gap:"12px"
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display:"flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap:"8px", alignItems:"flex-end",
              animation:"msgIn 0.25s ease both"
            }}>
              {msg.role === "ai" && (
                <div style={{
                  width:"28px", height:"28px", borderRadius:"8px",
                  background:"linear-gradient(135deg,#E53935,#B71C1C)",
                  display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"14px", flexShrink:0
                }}>🤖</div>
              )}
              <div style={{maxWidth:"78%"}}>
                <div style={{
                  background: msg.role === "user"
                    ? "linear-gradient(135deg,#E53935,#B71C1C)"
                    : "rgba(255,255,255,0.05)",
                  border: msg.role === "ai"
                    ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderRadius: msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  padding:"12px 14px",
                  color:"#F0F4F8", fontSize:"13px",
                  lineHeight:"1.6", whiteSpace:"pre-wrap"
                }}>
                  {msg.text}
                </div>
                <p style={{
                  color:"#64748B", fontSize:"10px",
                  marginTop:"4px", fontFamily:"'JetBrains Mono',monospace",
                  textAlign: msg.role === "user" ? "right" : "left"
                }}>{fmt(msg.time)}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{display:"flex", gap:"8px", alignItems:"flex-end"}}>
              <div style={{
                width:"28px", height:"28px", borderRadius:"8px",
                background:"linear-gradient(135deg,#E53935,#B71C1C)",
                display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:"14px"
              }}>🤖</div>
              <div style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"16px 16px 16px 4px",
                padding:"12px 16px",
                display:"flex", alignItems:"center", gap:"6px"
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:"6px", height:"6px", borderRadius:"50%",
                    background:"#64748B",
                    animation:`typing 1.2s ease-in-out ${i*0.2}s infinite`
                  }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !loading && (
          <div style={{
            padding:"0 16px 8px",
            display:"flex", gap:"6px",
            overflowX:"auto", flexShrink:0
          }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} style={{
                flexShrink:0, background:"rgba(229,57,53,0.08)",
                border:"1px solid rgba(229,57,53,0.2)",
                borderRadius:"20px", padding:"6px 12px",
                color:"#FF8A80", fontSize:"11px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                fontWeight:"500", whiteSpace:"nowrap",
                transition:"all 0.2s"
              }}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding:"12px 16px 16px",
          borderTop:"1px solid rgba(255,255,255,0.07)",
          display:"flex", gap:"8px", flexShrink:0
        }}>
          <textarea
            className="chat-input"
            placeholder="Ask about medicines, interactions, side effects..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            rows={1}
            style={{minHeight:"44px", maxHeight:"100px"}}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            style={{
              background: !input.trim() || loading ? "rgba(229,57,53,0.3)" : "#E53935",
              border:"none", color:"white", borderRadius:"12px",
              width:"44px", flexShrink:0, cursor:"pointer",
              fontSize:"18px", transition:"all 0.2s",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}
          >→</button>
        </div>

      </div>
    </div>
  )
}
