import { useEffect } from "react"

export default function LandingPage({ onGetStarted }) {

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add("visible")
      })
    }, { threshold: 0.1 })
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el))

    const handleScroll = () => {
      const nav = document.querySelector(".pg-nav")
      if (!nav) return
      nav.style.background = window.scrollY > 60
        ? "rgba(5,7,10,0.95)"
        : "rgba(5,7,10,0.8)"
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="pg-landing">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');

        .pg-landing { background:#05070A; color:#EAEEF2; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
        .pg-landing * { box-sizing:border-box; margin:0; padding:0; }

        /* ── NAVBAR ── */
        .pg-nav {
          position:fixed; top:0; left:0; right:0; z-index:1000;
          padding:14px 20px;
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(5,7,10,0.8);
          backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(255,45,75,0.1);
          transition:background 0.3s;
        }
        @media(min-width:640px){ .pg-nav{ padding:20px 60px; } }

        .pg-nav-logo {
          font-family:'Bebas Neue',sans-serif;
          font-size:22px; letter-spacing:0.08em; color:#FF2D4B; flex-shrink:0;
        }
        @media(min-width:640px){ .pg-nav-logo{ font-size:28px; } }
        .pg-nav-logo span { color:#EAEEF2; }

        .pg-nav-links { display:flex; gap:6px; align-items:center; }

        .pg-nav-link {
          background:none; border:none; cursor:pointer;
          font-size:12px; color:#8B949E;
          letter-spacing:0.04em; transition:color 0.2s;
          font-family:'DM Sans',sans-serif;
          white-space:nowrap; padding:4px 8px;
          display:none;
        }
        @media(min-width:640px){ .pg-nav-link{ display:block; font-size:13px; } }
        .pg-nav-link:hover{ color:#EAEEF2; }

        .pg-nav-cta {
          background:#FF2D4B; color:white;
          padding:8px 14px; border-radius:8px;
          font-size:12px; font-weight:700;
          border:none; cursor:pointer;
          letter-spacing:0.04em; transition:all 0.2s;
          font-family:'DM Sans',sans-serif;
          white-space:nowrap; flex-shrink:0;
        }
        @media(min-width:640px){ .pg-nav-cta{ padding:10px 24px; font-size:13px; } }
        .pg-nav-cta:hover{ background:#CC1A30; transform:translateY(-1px); }

        /* ── HERO ── */
        .pg-hero {
          min-height:100vh;
          display:flex; flex-direction:column;
          justify-content:center; align-items:flex-start;
          padding:100px 20px 120px;
          position:relative; overflow:hidden;
        }
        @media(min-width:640px){ .pg-hero{ padding:140px 60px 80px; } }

        .pg-hero::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,45,75,0.05) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,45,75,0.05) 1px,transparent 1px);
          background-size:60px 60px;
          animation:pgGrid 25s linear infinite;
          pointer-events:none;
        }
        .pg-hero::after {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 60% 50% at 80% 20%,rgba(255,45,75,0.18) 0%,transparent 60%),
            radial-gradient(ellipse 40% 40% at 10% 80%,rgba(0,212,255,0.10) 0%,transparent 60%);
          pointer-events:none;
        }
        @keyframes pgGrid{
          0%{background-position:0 0;}
          100%{background-position:60px 60px;}
        }

        .pg-hero-inner{ position:relative; z-index:1; width:100%; max-width:900px; }

        .pg-eyebrow {
          display:flex; align-items:center; gap:12px; margin-bottom:20px;
          animation:pgFadeUp 0.8s ease both;
        }
        .pg-eyebrow::before{
          content:''; width:32px; height:2px;
          background:#FF2D4B; flex-shrink:0;
        }
        .pg-eyebrow span{
          font-family:'JetBrains Mono',monospace;
          font-size:10px; letter-spacing:0.18em;
          text-transform:uppercase; color:#FF2D4B;
        }
        @media(min-width:640px){
          .pg-eyebrow{ margin-bottom:24px; }
          .pg-eyebrow::before{ width:40px; }
          .pg-eyebrow span{ font-size:11px; letter-spacing:0.2em; }
        }

        .pg-h1 {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(60px,20vw,140px);
          line-height:0.88; letter-spacing:0.04em;
          animation:pgFadeUp 0.8s 0.1s ease both;
        }
        .pg-h1 .red{ color:#FF2D4B; }
        .pg-h1 .dim{ color:#636E7B; }

        .pg-hero-sub {
          font-size:16px; color:#8B949E;
          max-width:560px; line-height:1.7;
          margin:20px 0 32px; font-weight:300;
          animation:pgFadeUp 0.8s 0.2s ease both;
        }
        @media(min-width:640px){ .pg-hero-sub{ font-size:18px; margin:28px 0 40px; } }
        .pg-hero-sub strong{ color:#EAEEF2; font-weight:500; }

        .pg-hero-btns {
          display:flex; gap:12px; flex-wrap:wrap; width:100%;
          animation:pgFadeUp 0.8s 0.3s ease both;
        }

        .pg-btn-primary {
          background:#FF2D4B; color:white;
          padding:14px 24px; border-radius:10px;
          font-size:15px; font-weight:700;
          border:none; cursor:pointer; transition:all 0.25s;
          font-family:'DM Sans',sans-serif;
          flex:1; min-width:120px; text-align:center;
        }
        @media(min-width:640px){ .pg-btn-primary{ flex:none; padding:16px 32px; } }
        .pg-btn-primary:hover{ background:#CC1A30; transform:translateY(-2px); box-shadow:0 8px 32px rgba(255,45,75,0.4); }

        .pg-btn-secondary {
          background:transparent; color:#EAEEF2;
          padding:14px 24px; border-radius:10px;
          font-size:15px; font-weight:500;
          border:1px solid #161B22; cursor:pointer; transition:all 0.25s;
          font-family:'DM Sans',sans-serif;
          flex:1; min-width:120px; text-align:center;
        }
        @media(min-width:640px){ .pg-btn-secondary{ flex:none; padding:16px 32px; } }
        .pg-btn-secondary:hover{ border-color:#8B949E; transform:translateY(-2px); }

        .pg-stats {
          display:flex; gap:24px; margin-top:40px;
          padding-top:28px; border-top:1px solid #161B22;
          animation:pgFadeUp 0.8s 0.4s ease both; flex-wrap:wrap;
        }
        @media(min-width:640px){ .pg-stats{ gap:48px; margin-top:72px; padding-top:40px; } }
        .pg-stat-num{
          font-family:'Bebas Neue',sans-serif;
          font-size:36px; color:#FF2D4B; line-height:1;
        }
        @media(min-width:640px){ .pg-stat-num{ font-size:48px; } }
        .pg-stat-label{
          font-size:11px; color:#636E7B;
          font-family:'JetBrains Mono',monospace;
          letter-spacing:0.12em; text-transform:uppercase; margin-top:4px;
        }

        @keyframes pgFadeUp{
          from{ opacity:0; transform:translateY(24px); }
          to{ opacity:1; transform:translateY(0); }
        }

        /* ── SECTIONS ── */
        .pg-section{ padding:60px 20px; }
        @media(min-width:640px){ .pg-section{ padding:100px 60px; } }
        .pg-section-dark{
          background:#090C10;
          border-top:1px solid #161B22;
          border-bottom:1px solid #161B22;
        }

        .pg-label{
          font-family:'JetBrains Mono',monospace;
          font-size:10px; letter-spacing:0.25em;
          text-transform:uppercase; color:#636E7B;
          display:flex; align-items:center; gap:12px; margin-bottom:24px;
        }
        .pg-label::after{
          content:''; flex:1; height:1px;
          background:#161B22; max-width:200px;
        }

        .pg-section-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(32px,8vw,60px);
          line-height:0.95; letter-spacing:0.03em;
        }
        .pg-section-title .red{ color:#FF2D4B; }
        .pg-section-title .cyan{ color:#00D4FF; }

        /* ── PROBLEM GRID ── */
        .pg-problem-grid{
          display:grid; grid-template-columns:1fr;
          gap:2px; margin-top:36px;
        }
        @media(min-width:768px){ .pg-problem-grid{ grid-template-columns:repeat(3,1fr); } }

        .pg-problem-item{
          background:#0D1117; padding:28px 24px;
          position:relative; overflow:hidden; transition:transform 0.3s;
        }
        @media(min-width:640px){ .pg-problem-item{ padding:36px 32px; } }
        .pg-problem-item:hover{ transform:translateY(-4px); }
        .pg-problem-item::before{
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
        }
        .pp1::before{ background:#FF2D4B; }
        .pp2::before{ background:#FFD60A; }
        .pp3::before{ background:#00D4FF; }
        .pg-problem-num{
          font-family:'Bebas Neue',sans-serif;
          font-size:80px; line-height:1; opacity:0.06;
          position:absolute; top:16px; right:20px;
        }
        .pg-problem-icon{ font-size:28px; margin-bottom:14px; }
        .pg-problem-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:22px; letter-spacing:0.04em; margin-bottom:10px;
        }
        .pg-problem-desc{ font-size:13px; color:#8B949E; line-height:1.8; font-weight:300; }
        .pg-problem-desc strong{ color:#EAEEF2; font-weight:500; }

        /* ── FEATURES GRID ── */
        .pg-features-grid{
          display:grid; grid-template-columns:1fr;
          gap:12px; margin-top:40px;
        }
        @media(min-width:640px){ .pg-features-grid{ grid-template-columns:repeat(2,1fr); gap:16px; } }
        @media(min-width:1024px){ .pg-features-grid{ grid-template-columns:repeat(3,1fr); } }

        .pg-feature-card{
          background:#090C10; border:1px solid #161B22;
          border-radius:16px; padding:24px; transition:all 0.3s;
        }
        .pg-feature-card:hover{ transform:translateY(-4px); }
        .pg-feature-card.pg-featured{
          grid-column:span 1;
          background:linear-gradient(135deg,rgba(255,45,75,0.08) 0%,rgba(0,0,0,0) 60%);
          border-color:rgba(255,45,75,0.2);
        }
        @media(min-width:640px){ .pg-feature-card.pg-featured{ grid-column:span 2; } }
        @media(min-width:1024px){ .pg-feature-card.pg-featured{ grid-column:span 2; } }

        .pg-fc-icon{ font-size:26px; margin-bottom:14px; }
        .pg-fc-tag{
          font-family:'JetBrains Mono',monospace;
          font-size:9px; letter-spacing:0.2em;
          text-transform:uppercase; margin-bottom:8px;
        }
        .pg-fc-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:22px; letter-spacing:0.04em; margin-bottom:8px;
        }
        .pg-fc-desc{ font-size:13px; color:#8B949E; line-height:1.7; font-weight:300; }
        .pg-fc-desc strong{ color:#EAEEF2; font-weight:500; }

        /* ── STEPS ── */
        .pg-steps{
          display:grid; grid-template-columns:repeat(2,1fr);
          gap:2px; margin-top:40px;
        }
        @media(min-width:768px){ .pg-steps{ grid-template-columns:repeat(4,1fr); } }

        .pg-step{ background:#0D1117; padding:24px 20px; position:relative; }
        @media(min-width:768px){
          .pg-step::after{
            content:'→'; position:absolute;
            right:-14px; top:50%; transform:translateY(-50%);
            font-size:20px; color:#636E7B; z-index:1;
          }
          .pg-step:last-child::after{ display:none; }
        }
        .pg-step-num{
          font-family:'Bebas Neue',sans-serif;
          font-size:48px; color:#FF2D4B; opacity:0.3; line-height:1; margin-bottom:10px;
        }
        .pg-step-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:20px; letter-spacing:0.04em; margin-bottom:6px;
        }
        .pg-step-desc{ font-size:12px; color:#8B949E; line-height:1.7; font-weight:300; }

        /* ── DEMO ── */
        .pg-demo-container{
          display:grid; grid-template-columns:1fr;
          gap:40px; align-items:center;
          max-width:1100px; margin:0 auto;
        }
        @media(min-width:900px){ .pg-demo-container{ grid-template-columns:1fr 1fr; gap:60px; } }

        .pg-demo-h2{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(32px,7vw,60px);
          line-height:0.95; letter-spacing:0.03em; margin-bottom:16px;
        }
        .pg-demo-h2 span{ color:#FF2D4B; }
        .pg-demo-p{ font-size:14px; color:#8B949E; line-height:1.8; margin-bottom:20px; font-weight:300; }
        .pg-demo-list{ list-style:none; margin-bottom:24px; }
        .pg-demo-list li{
          font-size:13px; color:#8B949E;
          padding:8px 0; border-bottom:1px solid #161B22;
          display:flex; align-items:center; gap:10px;
        }
        .pg-demo-list li::before{ content:'✓'; color:#00FF88; font-weight:700; flex-shrink:0; }

        .pg-map-mockup{
          background:#090C10; border:1px solid #161B22;
          border-radius:20px; padding:24px;
        }
        .pg-map-header{
          font-family:'JetBrains Mono',monospace;
          font-size:9px; letter-spacing:0.2em;
          text-transform:uppercase; color:#636E7B; margin-bottom:20px;
        }
        .pg-nodes{ display:flex; gap:10px; justify-content:center; margin-bottom:16px; flex-wrap:wrap; }
        .pg-node{
          background:#0D1117; border:1px solid #161B22;
          border-radius:12px; padding:14px 16px; text-align:center; min-width:88px;
        }
        .pg-node.danger{
          border-color:rgba(255,45,75,0.6);
          background:rgba(255,45,75,0.06);
          animation:pgPulse 2s ease-in-out infinite;
        }
        @keyframes pgPulse{
          0%,100%{ box-shadow:0 0 0 0 rgba(255,45,75,0.4); }
          50%{ box-shadow:0 0 0 8px rgba(255,45,75,0); }
        }
        .pg-node-emoji{ font-size:22px; margin-bottom:5px; }
        .pg-node-name{ font-size:11px; font-weight:500; }
        .pg-node-count{ font-size:10px; color:#636E7B; margin-top:2px; }

        .pg-connection{
          display:flex; align-items:center; gap:8px; margin:5px 0;
          background:rgba(255,45,75,0.08);
          border:1px solid rgba(255,45,75,0.3);
          border-radius:10px; padding:9px 12px;
        }
        .pg-conn-dot{
          width:7px; height:7px; border-radius:50%;
          background:#FF2D4B; flex-shrink:0;
          animation:pgBlink 1.5s ease-in-out infinite;
        }
        @keyframes pgBlink{ 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .pg-conn-text{ font-size:11px; color:#8B949E; }
        .pg-conn-text strong{ color:#FF2D4B; }

        /* ── API CARDS ── */
        .pg-api-grid{
          display:grid; grid-template-columns:1fr;
          gap:12px; margin-top:40px;
        }
        @media(min-width:640px){ .pg-api-grid{ grid-template-columns:repeat(3,1fr); gap:16px; } }

        .pg-api-card{
          background:#0D1117; border:1px solid #161B22;
          border-radius:14px; padding:24px;
        }
        .pg-api-badge{
          font-family:'JetBrains Mono',monospace;
          font-size:9px; letter-spacing:0.15em; text-transform:uppercase;
          padding:4px 10px; border-radius:20px;
          display:inline-block; margin-bottom:14px;
        }
        .pg-badge-green{ background:rgba(0,255,136,0.1); color:#00FF88; border:1px solid rgba(0,255,136,0.2); }
        .pg-badge-cyan { background:rgba(0,212,255,0.1); color:#00D4FF; border:1px solid rgba(0,212,255,0.2); }
        .pg-badge-yellow{ background:rgba(255,214,10,0.1); color:#FFD60A; border:1px solid rgba(255,214,10,0.2); }
        .pg-api-name{
          font-family:'Bebas Neue',sans-serif;
          font-size:26px; letter-spacing:0.04em; margin-bottom:8px;
        }
        .pg-api-desc{ font-size:12px; color:#8B949E; line-height:1.7; font-weight:300; margin-bottom:14px; }
        .pg-api-pills{ display:flex; flex-wrap:wrap; gap:6px; }
        .pg-api-pill{
          font-size:10px; color:#636E7B;
          background:rgba(255,255,255,0.04);
          border:1px solid #161B22;
          padding:3px 10px; border-radius:20px;
        }

        /* ── CTA ── */
        .pg-cta{
          background:#05070A; padding:80px 20px;
          text-align:center; position:relative; overflow:hidden;
        }
        @media(min-width:640px){ .pg-cta{ padding:120px 60px; } }
        .pg-cta::before{
          content:''; position:absolute; inset:0;
          background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(255,45,75,0.08) 0%,transparent 70%);
          pointer-events:none;
        }
        .pg-cta-inner{ position:relative; z-index:1; }
        .pg-cta-eyebrow{
          font-family:'JetBrains Mono',monospace;
          font-size:10px; letter-spacing:0.2em;
          text-transform:uppercase; color:#FF2D4B; margin-bottom:16px;
        }
        .pg-cta-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(44px,14vw,100px);
          line-height:0.9; letter-spacing:0.04em; margin-bottom:20px;
        }
        .pg-cta-title span{ color:#FF2D4B; }
        .pg-cta-sub{
          font-size:15px; color:#8B949E;
          max-width:480px; margin:0 auto 32px;
          line-height:1.7; font-weight:300;
        }
        .pg-cta-btns{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; padding:0 20px; }

        /* ── PILLS ── */
        .pg-pill-row{ display:flex; flex-wrap:wrap; gap:8px; margin-top:24px; }
        .pg-pill{
          font-family:'JetBrains Mono',monospace;
          font-size:10px; padding:5px 12px;
          border-radius:6px; font-weight:700; letter-spacing:0.06em;
        }
        .pp-red   { background:rgba(255,45,75,0.12);  color:#FF2D4B; border:1px solid rgba(255,45,75,0.25); }
        .pp-cyan  { background:rgba(0,212,255,0.1);   color:#00D4FF; border:1px solid rgba(0,212,255,0.2); }
        .pp-green { background:rgba(0,255,136,0.1);   color:#00FF88; border:1px solid rgba(0,255,136,0.2); }
        .pp-yellow{ background:rgba(255,214,10,0.1);  color:#FFD60A; border:1px solid rgba(255,214,10,0.2); }
        .pp-purple{ background:rgba(191,90,242,0.1);  color:#BF5AF2; border:1px solid rgba(191,90,242,0.2); }
        .pp-gray  { background:rgba(255,255,255,0.05);color:#636E7B; border:1px solid #161B22; }

        /* ── FOOTER ── */
        .pg-footer{
          background:#090C10; border-top:1px solid #161B22;
          padding:32px 20px;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:16px;
        }
        @media(min-width:640px){ .pg-footer{ padding:48px 60px; } }
        .pg-footer-logo{
          font-family:'Bebas Neue',sans-serif;
          font-size:28px; letter-spacing:0.08em; color:#FF2D4B;
        }
        .pg-footer-logo span{ color:#636E7B; }
        .pg-footer-text{ font-size:12px; color:#636E7B; }

        /* ── REVEAL ANIMATIONS ── */
        .reveal{ opacity:0; transform:translateY(30px); transition:opacity 0.7s ease,transform 0.7s ease; }
        .reveal.visible{ opacity:1; transform:translateY(0); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="pg-nav">
        <div className="pg-nav-logo">PHARMA<span>GUARD</span></div>
        <div className="pg-nav-links">
          <button className="pg-nav-link" onClick={() => scrollTo("pg-features")}>Features</button>
          <button className="pg-nav-link" onClick={() => scrollTo("pg-how")}>How It Works</button>
          <button className="pg-nav-link" onClick={() => scrollTo("pg-demo")}>Demo</button>
          <button className="pg-nav-cta" onClick={onGetStarted}>Open App →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pg-hero">
        <div className="pg-hero-inner">
          <div className="pg-eyebrow">
            <span>World's First Family Medicine Safety System</span>
          </div>
          <h1 className="pg-h1">
            PHARMA<br/>
            <span className="red">GUARD</span><br/>
            <span className="dim">OS</span>
          </h1>
          <p className="pg-hero-sub">
            Every existing app checks medicines for <strong>one person</strong>.
            PharmaGuard checks the <strong>whole family</strong> — across doctors,
            across members, and across the kitchen table.
          </p>
          <div className="pg-hero-btns">
            <button className="pg-btn-primary" onClick={onGetStarted}>Get Started →</button>
            <button className="pg-btn-secondary" onClick={() => scrollTo("pg-features")}>See Features</button>
          </div>
          <div className="pg-stats">
            <div><div className="pg-stat-num">10</div><div className="pg-stat-label">Safety Features</div></div>
            <div><div className="pg-stat-num">30+</div><div className="pg-stat-label">Drug Interactions</div></div>
            <div><div className="pg-stat-num">200+</div><div className="pg-stat-label">Indian Brands</div></div>
            <div><div className="pg-stat-num">3</div><div className="pg-stat-label">Live Drug APIs</div></div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="pg-section pg-section-dark">
        <div className="pg-label">The Problem We Solve</div>
        <h2 className="pg-section-title">
          THREE SILENT DANGERS IN<br/>EVERY INDIAN HOUSEHOLD
        </h2>
        <div className="pg-problem-grid reveal">
          <div className="pg-problem-item pp1">
            <div className="pg-problem-num">01</div>
            <div className="pg-problem-icon">💊</div>
            <div className="pg-problem-title">Different Doctors, Same Family</div>
            <div className="pg-problem-desc">
              Father visits a cardiologist. Son visits a GP. No doctor knows what the other prescribed.
              <strong> Nobody checks if the two medicines interact dangerously.</strong>
            </div>
          </div>
          <div className="pg-problem-item pp2">
            <div className="pg-problem-num">02</div>
            <div className="pg-problem-icon">📦</div>
            <div className="pg-problem-title">80,000 Brand Names, One Molecule</div>
            <div className="pg-problem-desc">
              Crocin and Dolo-650 look completely different. Both contain Paracetamol.
              <strong> Patients double-dose without knowing.</strong>
            </div>
          </div>
          <div className="pg-problem-item pp3">
            <div className="pg-problem-num">03</div>
            <div className="pg-problem-icon">🔍</div>
            <div className="pg-problem-title">Symptoms Blamed on Age</div>
            <div className="pg-problem-desc">
              Dry cough blamed on TB. Muscle pain blamed on arthritis.
              <strong> All caused by medicines. All completely missed.</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="pg-section" id="pg-features">
        <div className="pg-label">What PharmaGuard Does</div>
        <h2 className="pg-section-title">
          EVERY FEATURE CATCHES<br/>
          SOMETHING <span className="red">NO ONE ELSE</span> DOES
        </h2>
        <div className="pg-features-grid reveal">
          <div className="pg-feature-card pg-featured">
            <div className="pg-fc-icon">🚨</div>
            <div className="pg-fc-tag" style={{color:"#FF2D4B"}}>World First · Core Intelligence</div>
            <div className="pg-fc-title">Cross-Family Danger Radar</div>
            <div className="pg-fc-desc">
              When any family member scans a new prescription, PharmaGuard checks it against
              <strong> every medicine every other family member is currently taking.</strong> No app has ever done this.
            </div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">📷</div>
            <div className="pg-fc-tag" style={{color:"#00D4FF"}}>Input Intelligence</div>
            <div className="pg-fc-title">Prescription Photo Scanner</div>
            <div className="pg-fc-desc">Photograph any prescription. <strong>Tesseract OCR reads it. No typing needed.</strong></div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">💊</div>
            <div className="pg-fc-tag" style={{color:"#00FF88"}}>Duplicate Detection</div>
            <div className="pg-fc-title">Same Molecule Detector</div>
            <div className="pg-fc-desc">Sees through 80,000 brand names. <strong>Crocin + Dolo-650 = double Paracetamol. Caught instantly.</strong></div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">🤒</div>
            <div className="pg-fc-tag" style={{color:"#FFD60A"}}>Diagnostic Intelligence</div>
            <div className="pg-fc-title">Symptom Reverse Lookup</div>
            <div className="pg-fc-desc">Type a symptom. <strong>App finds which medicine is causing it.</strong> Saves thousands in tests.</div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">👨‍⚕️</div>
            <div className="pg-fc-tag" style={{color:"#BF5AF2"}}>Multi-Doctor Safety</div>
            <div className="pg-fc-title">Multi-Doctor Conflict Alert</div>
            <div className="pg-fc-desc">Catches conflicts between <strong>medicines from different doctors to the same patient.</strong></div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">⏰</div>
            <div className="pg-fc-tag" style={{color:"#FF6B35"}}>Reminder System</div>
            <div className="pg-fc-title">Medicine Reminder + Alert</div>
            <div className="pg-fc-desc">No confirmation in 15 minutes? <strong>Family members automatically alerted by email.</strong></div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">🔍</div>
            <div className="pg-fc-tag" style={{color:"#00D4FF"}}>Live Database</div>
            <div className="pg-fc-title">Medicine Comparator</div>
            <div className="pg-fc-desc"><strong>3-layer lookup: local → RxNorm NIH → OpenFDA.</strong> Works for any medicine worldwide.</div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">🏛️</div>
            <div className="pg-fc-tag" style={{color:"#00FF88"}}>Real Medical Data</div>
            <div className="pg-fc-title">Live Drug APIs</div>
            <div className="pg-fc-desc">Connected to RxNorm and OpenFDA. <strong>Real drug data. Not hardcoded guesses.</strong></div>
          </div>
          <div className="pg-feature-card">
            <div className="pg-fc-icon">📋</div>
            <div className="pg-fc-tag" style={{color:"#FF2D4B"}}>Management</div>
            <div className="pg-fc-title">Full Delete and Reset</div>
            <div className="pg-fc-desc">Remove medicines, members, or <strong>reset the entire app.</strong> Full control.</div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pg-section pg-section-dark" id="pg-how">
        <div className="pg-label">How It Works</div>
        <h2 className="pg-section-title">
          FROM PHOTO TO <span className="red">PROTECTION</span> IN SECONDS
        </h2>
        <div className="pg-steps reveal">
          <div className="pg-step">
            <div className="pg-step-num">01</div>
            <div className="pg-step-title">Scan Prescription</div>
            <div className="pg-step-desc">Photograph any prescription. Tesseract OCR reads text automatically.</div>
          </div>
          <div className="pg-step">
            <div className="pg-step-num">02</div>
            <div className="pg-step-title">Auto Extract</div>
            <div className="pg-step-desc">Medicine names, doses and frequencies saved to the right family member.</div>
          </div>
          <div className="pg-step">
            <div className="pg-step-num">03</div>
            <div className="pg-step-title">Check Everything</div>
            <div className="pg-step-desc">Interaction checker runs across ALL family members instantly.</div>
          </div>
          <div className="pg-step">
            <div className="pg-step-num">04</div>
            <div className="pg-step-title">Family Protected</div>
            <div className="pg-step-desc">Dangerous interactions shown with severity, risk and exact action to take.</div>
          </div>
        </div>
      </section>

      {/* ── DEMO ── */}
      <section className="pg-section" id="pg-demo">
        <div className="pg-demo-container">
          <div className="reveal">
            <div className="pg-label">Live Demo</div>
            <h2 className="pg-demo-h2">THE KUMAR FAMILY<br/><span>DEMO SCENARIO</span></h2>
            <p className="pg-demo-p">
              Father (68) takes Warfarin for his heart. Son (24) gets Ciprofloxacin
              for a throat infection. The son scans his prescription.
            </p>
            <ul className="pg-demo-list">
              <li>Before he taps Save — a red alert fires</li>
              <li>Warfarin + Cipro = dangerous bleeding risk</li>
              <li>Neither doctor knew what the other prescribed</li>
              <li>PharmaGuard caught it in 4 seconds</li>
              <li>Zero hospitalisation. Zero emergency.</li>
            </ul>
            <div className="pg-pill-row">
              <span className="pg-pill pp-red">Cross-Family Radar</span>
              <span className="pg-pill pp-cyan">OCR Scanner</span>
              <span className="pg-pill pp-green">Duplicate Detector</span>
              <span className="pg-pill pp-yellow">Symptom Lookup</span>
              <span className="pg-pill pp-purple">Multi-Doctor</span>
              <span className="pg-pill pp-gray">Email Alerts</span>
            </div>
          </div>

          <div className="pg-map-mockup reveal">
            <div className="pg-map-header">Family Medicine Map — Kumar Family</div>
            <div className="pg-nodes">
              <div className="pg-node danger">
                <div className="pg-node-emoji">👴</div>
                <div className="pg-node-name">Father</div>
                <div className="pg-node-count">1 medicine</div>
              </div>
              <div className="pg-node danger">
                <div className="pg-node-emoji">👦</div>
                <div className="pg-node-name">Son</div>
                <div className="pg-node-count">1 medicine</div>
              </div>
              <div className="pg-node">
                <div className="pg-node-emoji">👩</div>
                <div className="pg-node-name">Mother</div>
                <div className="pg-node-count">2 medicines</div>
              </div>
            </div>
            <div className="pg-connection">
              <div className="pg-conn-dot"></div>
              <div className="pg-conn-text">
                <strong>HIGH RISK</strong> — Father's Warfarin ↔ Son's Cipro
              </div>
            </div>
            <div className="pg-connection" style={{borderColor:"rgba(255,214,10,0.3)",background:"rgba(255,214,10,0.06)"}}>
              <div className="pg-conn-dot" style={{background:"#FFD60A"}}></div>
              <div className="pg-conn-text">
                <strong style={{color:"#FFD60A"}}>DUPLICATE</strong> — Crocin + Dolo 650 same molecule
              </div>
            </div>
            <div style={{marginTop:"16px",padding:"12px",background:"rgba(255,45,75,0.06)",borderRadius:"10px",border:"1px solid rgba(255,45,75,0.2)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:"0.2em",color:"#FF2D4B",marginBottom:"5px"}}>ACTION REQUIRED</div>
              <div style={{fontSize:"11px",color:"#8B949E"}}>Contact Father's cardiologist. INR monitoring required during Son's antibiotic course.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APIs ── */}
      <section className="pg-section pg-section-dark">
        <div className="pg-label">Powered By Real Medical Data</div>
        <h2 className="pg-section-title">
          NOT HARDCODED.<br/><span className="cyan">LIVE DATABASES.</span>
        </h2>
        <div className="pg-api-grid reveal">
          <div className="pg-api-card">
            <div className="pg-api-badge pg-badge-green">Free · No Key Needed</div>
            <div className="pg-api-name">RxNorm API</div>
            <div className="pg-api-desc">US National Library of Medicine. Resolves any brand name to its generic molecule. 100,000+ medicines.</div>
            <div className="pg-api-pills">
              <span className="pg-api-pill">Brand → Generic</span>
              <span className="pg-api-pill">Drug Interactions</span>
              <span className="pg-api-pill">NIH Official</span>
            </div>
          </div>
          <div className="pg-api-card">
            <div className="pg-api-badge pg-badge-cyan">Free · 1000 req/day</div>
            <div className="pg-api-name">OpenFDA</div>
            <div className="pg-api-desc">FDA's official drug label database. Drug labels, warnings, dosage and manufacturer details.</div>
            <div className="pg-api-pills">
              <span className="pg-api-pill">Drug Labels</span>
              <span className="pg-api-pill">Warnings</span>
              <span className="pg-api-pill">FDA Official</span>
            </div>
          </div>
          <div className="pg-api-card">
            <div className="pg-api-badge pg-badge-yellow">Free · No Key Needed</div>
            <div className="pg-api-name">FDA FAERS</div>
            <div className="pg-api-desc">FDA Adverse Event Reporting System. Real side effects reported by real patients worldwide.</div>
            <div className="pg-api-pills">
              <span className="pg-api-pill">Real Adverse Events</span>
              <span className="pg-api-pill">Side Effects</span>
              <span className="pg-api-pill">Patient Reports</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pg-cta">
        <div className="pg-cta-inner">
          <div className="pg-cta-eyebrow">Ready to protect your family?</div>
          <h2 className="pg-cta-title">
            10 FEATURES.<br/>ONE FAMILY.<br/><span>ZERO DANGER.</span>
          </h2>
          <p className="pg-cta-sub">
            The first system that matches how medicine danger works in the real world —
            across time, across doctors, across family members.
          </p>
          <div className="pg-cta-btns">
            <button className="pg-btn-primary" onClick={onGetStarted}>Open PharmaGuard →</button>
            <button className="pg-btn-secondary" onClick={() => scrollTo("pg-features")}>Learn More</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="pg-footer">
        <div className="pg-footer-logo">PHARMA<span>GUARD</span></div>
        <div className="pg-footer-text">Family Medicine Safety · Hackathon 2026</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#636E7B"}}>
          NOT A SUBSTITUTE FOR MEDICAL ADVICE
        </div>
      </footer>

    </div>
  )
}
