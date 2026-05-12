/*
  GRASS ROOTS — Applicazione completa
  ─────────────────────────────────────────────────────────
  Dipendenze CDN usate (già incluse via import):
    - @supabase/supabase-js  (client database)
    - leaflet                (mappa OpenStreetMap)

  Prima di usare:
    1. Crea un progetto su supabase.com
    2. Esegui lo schema SQL (vedi grassroots-schema.sql)
    3. Sostituisci SUPABASE_URL e SUPABASE_ANON_KEY sotto
*/

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CONFIGURAZIONE ────────────────────────────────────────
const SUPABASE_URL = "https://tlcpwfsipqzfexeymjjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsY3B3ZnNpcHF6ZmV4ZXltampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NTUwODYsImV4cCI6MjA5MTQzMTA4Nn0.zTjieW7ipQBqUqbbw6TOngrNhPf5ykMjlCInn3fQgAQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CATEGORIES = ["Ambiente","Cultura","Sport","Welfare","Educazione","Arte","Diritti","Altro"];
const CAT_COLOR = { Ambiente:"#5a7a4a", Arte:"#8b5e3c", Welfare:"#7a5a8b", Cultura:"#3c6e8b", Sport:"#8b7a3c", Educazione:"#3c7a6e", Diritti:"#8b3c5a", Altro:"#6e6e6e" };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("it-IT",{day:"numeric",month:"long",year:"numeric"}) : "";

// ── STYLES ────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300&display=swap');
@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --cream:#f5f0e8; --warm-white:#faf7f2;
  --earth:#a07840; --earth-light:#c9a96e; --earth-dark:#6b4f28;
  --green:#7a8c3a; --green-light:#9aaa55; --green-pale:#f0f2e4;
  --red:#9b2335; --red-light:#c03a4a;
  --text:#2c2418; --text-muted:#7a6a52;
  --border:#ddd5c4; --shadow:rgba(44,36,24,0.08);
  --status-pending:#d4890a; --status-approved:#4a7a3a; --status-rejected:#9b2335;
}
body{font-family:'Source Serif 4',Georgia,serif;background:var(--warm-white);color:var(--text);line-height:1.6}

/* NAV */
nav{background:White color:var(--cream);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:500;box-shadow:0 2px 12px rgba(0,0,0,0.25)}
.nav-brand{display:flex;align-items:center;gap:1rem;padding:0.75rem 0;cursor:pointer}
.nav-brand-text{font-family:'Source Serif 4',serif;font-size:1.55rem;font-weight:600;letter-spacing:0.02em;color:var(--earth-light)}
.nav-brand-sub{font-size:0.65rem;opacity:0.65;letter-spacing:0.15em;text-transform:uppercase;font-style:italic;display:block}
.nav-links{display:flex;gap:0.25rem;align-items:center}
.nav-link{background:none;border:none;color:var(--text);font-family:'Source Serif 4',serif;font-size:0.9rem;padding:0.6rem 1rem;cursor:pointer;border-radius:4px;opacity:0.75;transition:all 0.2s}
.nav-link:hover,.nav-link.active{opacity:1;background:rgba(255,255,255,0.1)}
.nav-cta{background:var(--red);border:none;color:white;font-family:'Source Serif 4',serif;font-size:0.85rem;padding:0.55rem 1.1rem;cursor:pointer;border-radius:4px;font-weight:600;transition:all 0.2s;margin-left:0.5rem}
.nav-cta:hover{background:var(--red-light)}
.nav-user{display:flex;align-items:center;gap:0.75rem;font-size:0.82rem;color:var(--cream);opacity:0.8}
.nav-user button{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:var(--cream);font-size:0.78rem;padding:0.3rem 0.7rem;border-radius:4px;cursor:pointer}

/* LAYOUT */
.page{min-height:calc(100vh - 64px)}
.page-header{background:var(--cream);border-bottom:1px solid var(--border);padding:2.5rem 2rem}
.page-header h1{font-family:'Playfair Display',serif;font-size:2.2rem;color:var(--earth-dark)}
.page-header p{color:var(--text-muted);margin-top:0.4rem}
.container{max-width:1200px;margin:0 auto;padding:2rem}
.section{padding:4rem 2rem;max-width:1200px;margin:0 auto}

/* HERO */
.hero{background:linear-gradient(160deg,#3d2e10 0%,#6b5428 35%,#5a6428 70%,#3d4a1a 100%);color:var(--cream);padding:5rem 2rem 4rem;text-align:center;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='3' fill='%23ffffff' fill-opacity='0.025'/%3E%3C/svg%3E")}
.hero-eyebrow{font-size:0.75rem;letter-spacing:0.25em;text-transform:uppercase;opacity:0.65;margin-bottom:1.25rem;font-style:italic;position:relative}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.2rem,5vw,4rem);font-weight:700;line-height:1.15;margin-bottom:1rem;position:relative}
.hero h1 em{font-style:italic;color:var(--earth-light)}
.hero-sub{font-size:1.1rem;opacity:0.8;max-width:540px;margin:0 auto 2.5rem;line-height:1.75;font-weight:300;position:relative}
.hero-actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;gap:0.4rem;font-family:'Source Serif 4',serif;font-size:0.92rem;padding:0.75rem 1.6rem;border-radius:5px;border:none;cursor:pointer;font-weight:600;transition:all 0.2s;text-decoration:none}
.btn-primary{background:var(--red);color:white}.btn-primary:hover{background:var(--red-light);transform:translateY(-1px)}
.btn-green{background:var(--green);color:white}.btn-green:hover{background:var(--green-light)}
.btn-outline{background:transparent;color:var(--cream);border:1.5px solid rgba(245,240,232,0.45)}.btn-outline:hover{border-color:var(--cream);background:rgba(255,255,255,0.08)}
.btn-outline-dark{background:transparent;color:var(--text);border:1.5px solid var(--border)}.btn-outline-dark:hover{border-color:var(--earth-light)}
.btn-sm{padding:0.4rem 0.9rem;font-size:0.8rem}
.btn-danger{background:#c0392b;color:white}.btn-danger:hover{background:#e74c3c}

/* STATS BAR */
.stats-bar{background:var(--cream);border-bottom:1px solid var(--border);display:flex;justify-content:center}
.stat-item{padding:1.5rem 3rem;text-align:center;border-right:1px solid var(--border)}
.stat-item:last-child{border-right:none}
.stat-num{font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--earth);display:block}
.stat-label{font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em}

/* CARDS */
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem}
.card{background:white;border:1px solid var(--border);border-radius:8px;overflow:hidden;transition:all 0.2s;cursor:pointer}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 32px var(--shadow);border-color:var(--earth-light)}
.card-img{height:90px;display:flex;align-items:center;justify-content:center;font-size:2.8rem}
.card-body{padding:1.25rem}
.card-cat{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;margin-bottom:0.4rem}
.card-title{font-family:'Playfair Display',serif;font-size:1.05rem;margin-bottom:0.4rem;line-height:1.3}
.card-meta{font-size:0.8rem;color:var(--text-muted)}
.card-desc{font-size:0.85rem;color:var(--text-muted);margin-top:0.4rem;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* FILTERS */
.filters{padding:1rem 2rem;background:white;border-bottom:1px solid var(--border);display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center}
.filter-label{font-size:0.78rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted)}
.filter-btn{background:none;border:1px solid var(--border);color:var(--text);font-family:'Source Serif 4',serif;font-size:0.8rem;padding:0.35rem 0.85rem;border-radius:20px;cursor:pointer;transition:all 0.15s}
.filter-btn:hover,.filter-btn.on{background:var(--green);color:white;border-color:var(--green)}
.search-input{border:1px solid var(--border);border-radius:4px;padding:0.4rem 0.85rem;font-family:'Source Serif 4',serif;font-size:0.85rem;color:var(--text);background:var(--warm-white)}
.search-input:focus{outline:none;border-color:var(--green)}

/* EVENTS LIST */
.events-list{display:grid;gap:1rem}
.event-row{background:white;border:1px solid var(--border);border-radius:8px;display:grid;grid-template-columns:72px 1fr auto;gap:1.25rem;align-items:center;padding:1.25rem;transition:all 0.2s;cursor:pointer}
.event-row:hover{border-color:var(--earth-light);box-shadow:0 4px 16px var(--shadow)}
.event-date-box{text-align:center;background:var(--green-pale);border-radius:6px;padding:0.65rem 0.4rem}
.eday{font-family:'Playfair Display',serif;font-size:1.7rem;font-weight:700;color:var(--green);line-height:1}
.emon{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--green)}
.event-info h3{font-family:'Playfair Display',serif;font-size:1.05rem;margin-bottom:0.25rem}
.event-info p{font-size:0.8rem;color:var(--text-muted)}
.tag{font-size:0.7rem;padding:0.18rem 0.55rem;border-radius:20px;background:var(--cream);color:var(--text-muted);border:1px solid var(--border);display:inline-block}
.spots-bar{background:var(--cream);border-radius:4px;height:4px;width:80px;overflow:hidden;margin-bottom:0.3rem}
.spots-fill{height:100%;background:var(--green);border-radius:4px}
.spots-text{font-size:0.7rem;color:var(--text-muted);text-align:right}

/* ASSOC CARDS */
.assoc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:1.5rem}
.assoc-card{background:white;border:1px solid var(--border);border-radius:10px;padding:1.5rem;transition:all 0.2s;cursor:pointer}
.assoc-card:hover{transform:translateY(-3px);box-shadow:0 8px 32px var(--shadow)}
.assoc-header{display:flex;align-items:flex-start;gap:1rem;margin-bottom:0.85rem}
.assoc-avatar{width:52px;height:52px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.7rem;background:var(--green-pale);flex-shrink:0}
.assoc-name{font-family:'Playfair Display',serif;font-size:1.05rem;line-height:1.3}
.assoc-city{font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem}
.assoc-desc{font-size:0.85rem;color:var(--text-muted);line-height:1.55;margin-bottom:0.85rem}
.assoc-footer{display:flex;justify-content:space-between;align-items:center;padding-top:0.65rem;border-top:1px solid var(--border);font-size:0.76rem;color:var(--text-muted)}

/* MAP */
#leaflet-map{height:520px;border-radius:10px;border:1px solid var(--border);z-index:1}
.map-layout{display:grid;grid-template-columns:1fr 300px;gap:1.5rem}
.map-sidebar{display:flex;flex-direction:column;gap:0.75rem;max-height:520px;overflow-y:auto}
.map-card{background:white;border:1px solid var(--border);border-radius:7px;padding:1rem;cursor:pointer;transition:all 0.15s}
.map-card:hover,.map-card.sel{border-color:var(--green);background:var(--green-pale)}
.map-card h4{font-family:'Playfair Display',serif;font-size:0.95rem;margin-bottom:0.2rem}
.map-card p{font-size:0.78rem;color:var(--text-muted)}

/* MODALS */
.overlay{position:fixed;inset:0;background:rgba(44,36,24,0.55);z-index:600;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(2px)}
.modal{background:white;border-radius:12px;max-width:620px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.3)}
.modal-hero{height:130px;display:flex;align-items:center;justify-content:center;font-size:3.5rem;position:relative}
.modal-close{position:absolute;top:1rem;right:1rem;background:white;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.12)}
.modal-body{padding:1.75rem}
.modal-cat{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;margin-bottom:0.4rem}
.modal-title{font-family:'Playfair Display',serif;font-size:1.7rem;line-height:1.2;margin-bottom:1rem}
.modal-meta{display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:1.25rem}
.meta-box{background:var(--cream);border-radius:6px;padding:0.65rem 0.85rem}
.meta-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:0.15rem}
.meta-val{font-size:0.88rem;font-weight:600}
.modal-desc{font-size:0.92rem;line-height:1.7;color:var(--text-muted);margin-bottom:1.25rem}
.modal-actions{display:flex;gap:0.75rem}

/* FORMS */
.form-card{background:white;border:1px solid var(--border);border-radius:10px;padding:2rem}
.form-title{font-family:'Playfair Display',serif;font-size:1.4rem;color:var(--earth-dark);margin-bottom:1.5rem;border-bottom:2px solid var(--border);padding-bottom:0.75rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.form-group{display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.85rem}
.form-group label{font-size:0.78rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em}
.form-group input,.form-group select,.form-group textarea{border:1px solid var(--border);border-radius:5px;padding:0.6rem 0.85rem;font-family:'Source Serif 4',serif;font-size:0.9rem;color:var(--text);background:var(--warm-white);transition:border-color 0.2s;width:100%}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--green);background:white}
.form-group textarea{resize:vertical;min-height:90px}
.form-hint{font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;font-style:italic}
.form-section-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--earth-dark);margin:1.5rem 0 0.75rem;padding-bottom:0.4rem;border-bottom:1px solid var(--border)}

/* ALERTS */
.alert{padding:0.9rem 1.1rem;border-radius:6px;font-size:0.88rem;margin-bottom:1.25rem}
.alert-success{background:#e8f5e8;border:1px solid #4a7a3a;color:#2d5a2d}
.alert-warning{background:#fff8e8;border:1px solid #d4890a;color:#7a4e00}
.alert-error{background:#fce8e8;border:1px solid #9b2335;color:#6b1020}
.alert-info{background:var(--green-pale);border:1px solid var(--green);color:var(--earth-dark)}

/* STATUS BADGES */
.badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;padding:0.25rem 0.65rem;border-radius:20px}
.badge-pending{background:#fff3cd;color:#7a4e00}
.badge-approved{background:#d4edda;color:#1e5a2a}
.badge-rejected{background:#fce8e8;color:#6b1020}
.badge-new{background:var(--green-pale);color:var(--green)}

/* DASHBOARD */
.dash-header{background:linear-gradient(135deg,#2a1f0d,#4a3818);color:var(--cream);border-radius:10px;padding:2rem;margin-bottom:2rem;display:flex;align-items:center;gap:1.5rem}
.dash-avatar{font-size:2.8rem;background:rgba(255,255,255,0.08);width:68px;height:68px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.dash-name{font-family:'Playfair Display',serif;font-size:1.45rem}
.dash-meta{font-size:0.82rem;opacity:0.65;margin-top:0.2rem}
.dash-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem}
.dash-stat{background:white;border:1px solid var(--border);border-radius:8px;padding:1.25rem;text-align:center}
.dash-stat-num{font-family:'Playfair Display',serif;font-size:2rem;color:var(--earth)}
.dash-stat-label{font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;margin-top:0.2rem}

/* EDITORIAL PANEL */
.editorial-tabs{display:flex;border-bottom:2px solid var(--border);margin-bottom:1.5rem}
.ed-tab{background:none;border:none;font-family:'Source Serif 4',serif;font-size:0.88rem;padding:0.75rem 1.25rem;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}
.ed-tab:hover{color:var(--text)}
.ed-tab.active{color:var(--green);border-bottom-color:var(--green);font-weight:600}
.candidate-card{background:white;border:1px solid var(--border);border-radius:8px;padding:1.5rem;margin-bottom:1rem}
.candidate-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem}
.candidate-name{font-family:'Playfair Display',serif;font-size:1.1rem}
.candidate-meta{font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem}
.candidate-desc{font-size:0.87rem;color:var(--text-muted);line-height:1.6;margin-bottom:1rem}
.candidate-actions{display:flex;gap:0.65rem;align-items:center}
.review-note{border:1px solid var(--border);border-radius:5px;padding:0.5rem 0.75rem;font-family:'Source Serif 4',serif;font-size:0.85rem;flex:1;resize:none;height:38px}
.review-note:focus{outline:none;border-color:var(--green)}

/* REGISTRATION FLOW */
.reg-steps{display:flex;gap:0;margin-bottom:2.5rem;border-radius:8px;overflow:hidden;border:1px solid var(--border)}
.reg-step{flex:1;padding:1rem;text-align:center;background:white;border-right:1px solid var(--border);position:relative}
.reg-step:last-child{border-right:none}
.reg-step.active{background:var(--green-pale);color:var(--green)}
.reg-step.done{background:var(--green);color:white}
.reg-step-num{font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;display:block}
.reg-step-label{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.8}
.pending-notice{background:linear-gradient(135deg,#fff8e8,#fff3d4);border:1px solid #d4890a;border-radius:10px;padding:2.5rem;text-align:center;max-width:520px;margin:3rem auto}
.pending-icon{font-size:3rem;margin-bottom:1rem}
.pending-title{font-family:'Playfair Display',serif;font-size:1.4rem;color:#7a4e00;margin-bottom:0.75rem}

/* LEAFLET OVERRIDES */
.leaflet-popup-content-wrapper{font-family:'Source Serif 4',serif;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.leaflet-popup-content{margin:0.75rem 1rem}
.popup-name{font-family:'Playfair Display',serif;font-size:0.95rem;margin-bottom:0.2rem}
.popup-meta{font-size:0.78rem;color:var(--text-muted)}

/* AUTH */
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#3d2e10,#5a6428);padding:1rem}
.auth-card{background:white;border-radius:12px;padding:2.5rem;max-width:420px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,0.3)}
.auth-logo{text-align:center;margin-bottom:2rem}
.auth-logo-name{font-family:'Source Serif 4',serif;font-size:1.5rem;font-weight:600;color:var(--earth);margin-top:0.5rem}
.auth-logo-sub{font-size:0.72rem;color:var(--text-muted);font-style:italic;letter-spacing:0.1em}
.auth-tabs{display:flex;border-bottom:2px solid var(--border);margin-bottom:1.75rem}
.auth-tab{flex:1;background:none;border:none;font-family:'Source Serif 4',serif;font-size:0.9rem;padding:0.6rem;cursor:pointer;color:var(--text-muted);border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s}
.auth-tab.active{color:var(--green);border-bottom-color:var(--green);font-weight:600}

/* FOOTER */
footer{background:#2a1f0d;color:var(--cream);padding:3rem 2rem;margin-top:4rem}
.footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr;gap:2rem}
.footer-brand-name{font-family:'Source Serif 4',serif;font-size:1.3rem;font-weight:600;color:var(--earth-light);margin-bottom:0.4rem}
.footer-tagline{font-size:0.82rem;opacity:0.55;font-style:italic}
.footer-col h4{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.15em;opacity:0.55;margin-bottom:0.65rem}
.footer-col p{font-size:0.83rem;opacity:0.75;line-height:1.9;cursor:pointer}
.footer-col p:hover{opacity:1}
.footer-bottom{max-width:1200px;margin:1.75rem auto 0;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;font-size:0.76rem;opacity:0.45}

/* TOAST */
.toast{position:fixed;bottom:2rem;right:2rem;background:#2a1f0d;color:var(--cream);padding:0.9rem 1.4rem;border-radius:8px;z-index:999;font-size:0.88rem;animation:slideUp 0.3s ease;box-shadow:0 8px 24px rgba(0,0,0,0.25)}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

@media(max-width:768px){
  .nav-links{display:none}
  .map-layout{grid-template-columns:1fr}
  .dash-grid{grid-template-columns:1fr 1fr}
  .footer-inner{grid-template-columns:1fr}
  .event-row{grid-template-columns:60px 1fr}
  .form-row{grid-template-columns:1fr}
  .modal-meta{grid-template-columns:1fr}
}
`;

// ── LOGO SVG ──────────────────────────────────────────────
const LogoSVG = ({ size = 54 }) => (
  <img src="/Logo_Grassroots_New.png" alt="GrassRoots" style={{ height: size, width: "auto" }} />
);

// ── TOAST ─────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div className="toast">✓ {msg}</div>;
}

// ── LEAFLET MAP COMPONENT ─────────────────────────────────
function LeafletMap({ associations, onSelectAssoc }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Load Leaflet dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => initMap();
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([44.55, 11.1], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);
    mapInstance.current = map;
    addMarkers(associations);
  };

  const addMarkers = useCallback((assocs) => {
    if (!mapInstance.current || !window.L) return;
    const L = window.L;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    assocs.forEach(a => {
      if (!a.lat || !a.lng) return;
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:38px;height:38px;border-radius:50%;background:${CAT_COLOR[a.category]||"#7a8c3a"};border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:0 2px 8px rgba(0,0,0,0.25);cursor:pointer">${a.emoji||"🌿"}</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19],
      });
      const marker = L.marker([a.lat, a.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`<div class="popup-name">${a.name}</div><div class="popup-meta">📍 ${a.city} · ${a.category}</div>`);
      marker.on("click", () => onSelectAssoc(a));
      markersRef.current.push(marker);
    });
  }, [onSelectAssoc]);

  useEffect(() => { addMarkers(associations); }, [associations, addMarkers]);

  return <div id="leaflet-map" ref={mapRef} />;
}

// ── MODALS ────────────────────────────────────────────────
function EventModal({ event, assoc, onClose, onRegister }) {
  const d = new Date(event.date);
  const pct = event.max_spots ? Math.round((event.registered / event.max_spots) * 100) : 0;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hero" style={{ background: `linear-gradient(135deg,${CAT_COLOR[event.category]}22,${CAT_COLOR[event.category]}44)` }}>
          <span style={{ fontSize: "3.5rem" }}>{event.emoji || "📌"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-cat" style={{ color: CAT_COLOR[event.category] }}>{event.category}</div>
          <h2 className="modal-title">{event.title}</h2>
          <div className="modal-meta">
            <div className="meta-box"><div className="meta-label">Data</div><div className="meta-val">{fmtDate(event.date)}</div></div>
            <div className="meta-box"><div className="meta-label">Orario</div><div className="meta-val">{event.time || "—"}</div></div>
            <div className="meta-box"><div className="meta-label">Luogo</div><div className="meta-val" style={{ fontSize: "0.8rem" }}>{event.location}</div></div>
            <div className="meta-box"><div className="meta-label">Organizzatore</div><div className="meta-val" style={{ fontSize: "0.8rem" }}>{assoc?.name}</div></div>
          </div>
          <p className="modal-desc">{event.description}</p>
          {event.max_spots && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                <span>Posti disponibili</span><span>{event.max_spots - event.registered} / {event.max_spots}</span>
              </div>
              <div className="spots-bar" style={{ width: "100%", height: "7px" }}>
                <div className="spots-fill" style={{ width: `${pct}%`, background: pct > 80 ? "var(--red)" : "var(--green)" }} />
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { onRegister(event); onClose(); }}>Partecipa →</button>
            <button className="btn btn-outline-dark" onClick={onClose}>Chiudi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssocModal({ assoc, events, onClose }) {
  const myEvents = events.filter(e => e.association_id === assoc.id);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hero" style={{ background: `linear-gradient(135deg,${CAT_COLOR[assoc.category]}18,${CAT_COLOR[assoc.category]}35)` }}>
          <span style={{ fontSize: "3.5rem" }}>{assoc.emoji || "🌿"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-cat" style={{ color: CAT_COLOR[assoc.category] }}>{assoc.category}</div>
          <h2 className="modal-title">{assoc.name}</h2>
          <div className="modal-meta">
            <div className="meta-box"><div className="meta-label">Città</div><div className="meta-val">{assoc.city}</div></div>
            <div className="meta-box"><div className="meta-label">Dal</div><div className="meta-val">{assoc.founded_year || "—"}</div></div>
            <div className="meta-box"><div className="meta-label">Soci</div><div className="meta-val">{assoc.members_count || "—"}</div></div>
            <div className="meta-box"><div className="meta-label">Email</div><div className="meta-val" style={{ fontSize: "0.78rem" }}>{assoc.contact_email}</div></div>
          </div>
          <p className="modal-desc">{assoc.description}</p>
          {assoc.tags && <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>{assoc.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>}
          {myEvents.length > 0 && <>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", marginBottom: "0.65rem", color: "var(--earth-dark)" }}>Prossimi eventi</h3>
            {myEvents.slice(0, 3).map(e => (
              <div key={e.id} style={{ display: "flex", gap: "0.75rem", padding: "0.65rem 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "1.4rem" }}>{e.emoji || "📌"}</span>
                <div><div style={{ fontFamily: "'Playfair Display',serif", fontSize: "0.9rem" }}>{e.title}</div><div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>{fmtDate(e.date)}{e.time ? " · " + e.time : ""}</div></div>
              </div>
            ))}
          </>}
          <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
            <a className="btn btn-primary" style={{ flex: 1 }} href={`mailto:${assoc.contact_email}`}>Contatta l'associazione</a>
            <button className="btn btn-outline-dark" onClick={onClose}>Chiudi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AUTH MODAL ────────────────────────────────────────────
function AuthModal({ onClose, onAuth }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    setLoading(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    if (error) setErr(error.message);
    else { onAuth(); onClose(); }
    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true); setErr("");
    const { error } = await supabase.auth.signUp({ email, password: pwd });
    if (error) setErr(error.message);
    else setMsg("Controlla la tua email per confermare la registrazione.");
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "400px" }} onClick={e => e.stopPropagation()}>
        <div className="modal-body">
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <LogoSVG size={48} />
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "1.2rem", fontWeight: 600, color: "var(--earth)", marginTop: "0.5rem" }}>grass roots</div>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Accedi</button>
            <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Registrati</button>
          </div>
          {err && <div className="alert alert-error">{err}</div>}
          {msg && <div className="alert alert-success">{msg}</div>}
          <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la-tua@email.it" /></div>
          <div className="form-group"><label>Password</label><input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="••••••••" /></div>
          <button className="btn btn-green" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} onClick={tab === "login" ? handleLogin : handleSignup} disabled={loading}>
            {loading ? "…" : tab === "login" ? "Accedi" : "Crea account"}
          </button>
          <button className="btn btn-outline-dark btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: "0.75rem" }} onClick={onClose}>Annulla</button>
        </div>
      </div>
    </div>
  );
}

// ── PAGES ─────────────────────────────────────────────────

function HomePage({ setPage, events, assocs, onEventClick, onAssocClick }) {
  const upcoming = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 3);
  const featured = assocs.slice(0, 3);
  return (
    <div className="page">
      <div className="hero">
        <div className="hero-eyebrow">piattaforma della società civile</div>
        <h1>grass roots —<br /><em>fare rete, fuori dalla rete</em></h1>
        <p className="hero-sub">Scopri le associazioni e le realtà verificate nel tuo territorio. Partecipa agli eventi, crea collaborazioni, costruisci comunità.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setPage("events")}>Esplora gli eventi</button>
          <button className="btn btn-outline" onClick={() => setPage("associations")}>Le associazioni</button>
        </div>
      </div>
      <div className="stats-bar">
        <div className="stat-item"><span className="stat-num">{assocs.length}</span><span className="stat-label">Associazioni verificate</span></div>
        <div className="stat-item"><span className="stat-num">{events.length}</span><span className="stat-label">Eventi in programma</span></div>
        <div className="stat-item"><span className="stat-num">{[...new Set(assocs.map(a => a.city))].length}</span><span className="stat-label">Città</span></div>
      </div>
      <div className="section">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.75rem" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.7rem", color: "var(--earth-dark)" }}>Prossimi eventi</h2>
          <span style={{ fontSize: "0.85rem", color: "var(--green)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("events")}>Vedi tutti →</span>
        </div>
        <div className="cards-grid">
          {upcoming.map(e => {
            const d = new Date(e.date);
            const assoc = assocs.find(a => a.id === e.association_id);
            return (
              <div key={e.id} className="card" onClick={() => onEventClick(e)}>
                <div className="card-img" style={{ background: `linear-gradient(135deg,${CAT_COLOR[e.category]}18,${CAT_COLOR[e.category]}30)` }}>{e.emoji || "📌"}</div>
                <div className="card-body">
                  <div className="card-cat" style={{ color: CAT_COLOR[e.category] }}>{e.category}</div>
                  <div className="card-title">{e.title}</div>
                  <div className="card-meta">📅 {d.getDate()} {d.toLocaleDateString("it-IT", { month: "short" })} · 📍 {e.location?.split(",").pop()?.trim()}</div>
                  <div className="card-desc">{e.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: "var(--cream)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.5rem", borderBottom: "2px solid var(--border)", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.7rem", color: "var(--earth-dark)" }}>Realtà del territorio</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--green)", cursor: "pointer", textDecoration: "underline" }} onClick={() => setPage("associations")}>Vedi tutte →</span>
          </div>
          <div className="cards-grid">
            {featured.map(a => (
              <div key={a.id} className="card" onClick={() => onAssocClick(a)}>
                <div className="card-img" style={{ background: `${CAT_COLOR[a.category]}18` }}>{a.emoji || "🌿"}</div>
                <div className="card-body">
                  <div className="card-cat" style={{ color: CAT_COLOR[a.category] }}>{a.category} · {a.city}</div>
                  <div className="card-title">{a.name}</div>
                  <div className="card-desc">{a.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🌱</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.7rem", color: "var(--earth-dark)", marginBottom: "0.85rem" }}>La tua associazione non è ancora qui?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.92rem", lineHeight: 1.7 }}>Candidati alla rete Grass Roots. La nostra redazione valuterà la vostra realtà e, una volta approvata, potrete pubblicare eventi e farvi conoscere nel territorio.</p>
          <button className="btn btn-primary" onClick={() => setPage("register")}>Candidati ora →</button>
        </div>
      </div>
    </div>
  );
}

function EventsPage({ events, assocs, onEventClick }) {
  const [filter, setFilter] = useState("Tutti");
  const sorted = [...events]
    .filter(e => filter === "Tutti" || e.category === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div className="page">
      <div className="page-header"><h1>Calendario eventi</h1><p>Tutti gli eventi delle associazioni verificate</p></div>
      <div className="filters">
        <span className="filter-label">Categoria:</span>
        {["Tutti", ...CATEGORIES].map(f => <button key={f} className={`filter-btn ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="container events-list">
        {sorted.length === 0 && <div className="alert alert-info">Nessun evento trovato per questa categoria.</div>}
        {sorted.map(e => {
          const d = new Date(e.date);
          const assoc = assocs.find(a => a.id === e.association_id);
          const pct = e.max_spots ? Math.round((e.registered / e.max_spots) * 100) : 0;
          return (
            <div key={e.id} className="event-row" onClick={() => onEventClick(e)}>
              <div className="event-date-box">
                <div className="eday">{d.getDate()}</div>
                <div className="emon">{d.toLocaleDateString("it-IT", { month: "short" })}</div>
              </div>
              <div className="event-info">
                <h3>{e.title}</h3>
                <p>🕐 {e.time || "—"} · 📍 {e.location} · <em>{assoc?.name}</em></p>
                <div style={{ marginTop: "0.35rem" }}><span className="tag" style={{ color: CAT_COLOR[e.category], borderColor: `${CAT_COLOR[e.category]}55` }}>{e.category}</span></div>
              </div>
              <div style={{ textAlign: "right", minWidth: "90px" }}>
                {e.max_spots && <>
                  <div className="spots-bar"><div className="spots-fill" style={{ width: `${pct}%`, background: pct > 80 ? "var(--red)" : "var(--green)" }} /></div>
                  <div className="spots-text">{e.max_spots - e.registered} liberi</div>
                </>}
                <button className="btn btn-primary btn-sm" style={{ marginTop: "0.4rem" }}>Partecipa</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssociationsPage({ assocs, onAssocClick }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tutte");
  const filtered = assocs.filter(a => {
    const mc = filter === "Tutte" || a.category === filter;
    const ms = a.name.toLowerCase().includes(search.toLowerCase()) || (a.description || "").toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });
  return (
    <div className="page">
      <div className="page-header"><h1>Associazioni verificate</h1><p>Tutte le realtà approvate dalla redazione Grass Roots</p></div>
      <div className="filters">
        <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Cerca…" style={{ width: "200px" }} />
        <span className="filter-label">Categoria:</span>
        {["Tutte", ...CATEGORIES].map(c => <button key={c} className={`filter-btn ${filter === c ? "on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}
      </div>
      <div className="container assoc-grid">
        {filtered.map(a => (
          <div key={a.id} className="assoc-card" onClick={() => onAssocClick(a)}>
            <div className="assoc-header">
              <div className="assoc-avatar">{a.emoji || "🌿"}</div>
              <div><div className="assoc-name">{a.name}</div><div className="assoc-city">📍 {a.city}{a.founded_year ? ` · dal ${a.founded_year}` : ""}</div></div>
            </div>
            <p className="assoc-desc">{a.description}</p>
            {a.tags && <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>{a.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>}
            <div className="assoc-footer">
              <span>{a.members_count ? `👥 ${a.members_count} soci` : ""}</span>
              <span style={{ color: CAT_COLOR[a.category], fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{a.category}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="alert alert-info" style={{ gridColumn: "1/-1" }}>Nessuna associazione trovata.</div>}
      </div>
    </div>
  );
}

function MapPage({ assocs, events, onAssocClick }) {
  const [selected, setSelected] = useState(null);
  const handleSelect = useCallback((a) => setSelected(a), []);
  return (
    <div className="page">
      <div className="page-header"><h1>Mappa delle realtà</h1><p>Esplora geograficamente le associazioni del territorio — dati da OpenStreetMap</p></div>
      <div className="container">
        <div className="map-layout">
          <LeafletMap associations={assocs} onSelectAssoc={handleSelect} />
          <div className="map-sidebar">
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.05rem", color: "var(--earth-dark)" }}>Associazioni</div>
            {assocs.map(a => (
              <div key={a.id} className={`map-card ${selected?.id === a.id ? "sel" : ""}`} onClick={() => setSelected(a)}>
                <h4>{a.emoji || "🌿"} {a.name}</h4>
                <p>📍 {a.city} · <span style={{ color: CAT_COLOR[a.category] }}>{a.category}</span></p>
              </div>
            ))}
          </div>
        </div>
        {selected && (
          <div style={{ marginTop: "1.5rem", background: "white", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.5rem", display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span style={{ fontSize: "2rem" }}>{selected.emoji || "🌿"}</span>
              <div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.1rem" }}>{selected.name}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{selected.description?.slice(0, 100)}…</div>
              </div>
            </div>
            <button className="btn btn-green btn-sm" onClick={() => onAssocClick(selected)}>Vedi profilo</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── REGISTRATION (2-phase) ────────────────────────────────
function RegisterPage({ user, setPage, onToast }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Cultura", city: "", address: "", founded_year: "", members_count: "", contact_email: user?.email || "", contact_name: "", description: "", mission: "", website: "", tags: "", emoji: "🌿" });

  useEffect(() => {
    if (user) checkExisting();
  }, [user]);

  const checkExisting = async () => {
    const { data } = await supabase.from("associations").select("*").eq("user_id", user.id).single();
    if (data) setExistingApp(data);
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    const tagsArr = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    const { error } = await supabase.from("associations").insert({
      ...form,
      tags: tagsArr,
      members_count: form.members_count ? parseInt(form.members_count) : null,
      founded_year: form.founded_year ? parseInt(form.founded_year) : null,
      status: "pending",
      user_id: user.id,
    });
    if (error) { onToast("Errore: " + error.message); }
    else { setStep(3); onToast("Candidatura inviata!"); checkExisting(); }
    setLoading(false);
  };

  if (!user) return (
    <div className="page">
      <div className="page-header"><h1>Candidatura associazione</h1></div>
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="alert alert-warning">⚠️ Devi essere registrato e aver effettuato l'accesso per candidare la tua associazione.</div>
        <button className="btn btn-green" onClick={() => setPage("home")}>Torna alla home</button>
      </div>
    </div>
  );

  if (existingApp) return (
    <div className="page">
      <div className="page-header"><h1>Candidatura inviata</h1></div>
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="pending-notice">
          <div className="pending-icon">{existingApp.status === "approved" ? "✅" : existingApp.status === "rejected" ? "❌" : "⏳"}</div>
          <div className="pending-title">
            {existingApp.status === "approved" && "Associazione approvata!"}
            {existingApp.status === "pending" && "Candidatura in valutazione"}
            {existingApp.status === "rejected" && "Candidatura non approvata"}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            {existingApp.status === "approved" && "La vostra associazione è ora visibile sulla piattaforma. Accedete alla dashboard per pubblicare eventi."}
            {existingApp.status === "pending" && "La redazione di Grass Roots sta valutando la vostra candidatura. Riceverete una comunicazione via email."}
            {existingApp.status === "rejected" && `Motivazione: ${existingApp.review_note || "nessuna nota fornita."}`}
          </p>
          {existingApp.status === "approved" && <button className="btn btn-primary" style={{ marginTop: "1.25rem" }} onClick={() => setPage("dashboard")}>Vai alla dashboard →</button>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header"><h1>Candidatura alla rete</h1><p>Proponi la tua associazione alla redazione Grass Roots</p></div>
      <div className="container" style={{ maxWidth: "700px" }}>
        <div className="reg-steps">
          <div className={`reg-step ${step >= 1 ? (step > 1 ? "done" : "active") : ""}`}><span className="reg-step-num">{step > 1 ? "✓" : "1"}</span><span className="reg-step-label">Dati</span></div>
          <div className={`reg-step ${step >= 2 ? (step > 2 ? "done" : "active") : ""}`}><span className="reg-step-num">{step > 2 ? "✓" : "2"}</span><span className="reg-step-label">Mission</span></div>
          <div className={`reg-step ${step >= 3 ? "active" : ""}`}><span className="reg-step-num">3</span><span className="reg-step-label">Conferma</span></div>
        </div>

        {step === 1 && (
          <div className="form-card">
            <h2 className="form-title">Dati dell'associazione</h2>
            <div className="form-row">
              <div className="form-group"><label>Nome *</label><input value={form.name} onChange={set("name")} placeholder="Nome completo dell'associazione" /></div>
              <div className="form-group"><label>Categoria *</label><select value={form.category} onChange={set("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Città *</label><input value={form.city} onChange={set("city")} placeholder="Es. Bologna" /></div>
              <div className="form-group"><label>Indirizzo sede</label><input value={form.address} onChange={set("address")} placeholder="Via e numero civico" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Anno fondazione</label><input type="number" value={form.founded_year} onChange={set("founded_year")} placeholder="Es. 2005" /></div>
              <div className="form-group"><label>Numero soci</label><input type="number" value={form.members_count} onChange={set("members_count")} placeholder="Approssimativo" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Email referente *</label><input type="email" value={form.contact_email} onChange={set("contact_email")} /></div>
              <div className="form-group"><label>Nome referente *</label><input value={form.contact_name} onChange={set("contact_name")} placeholder="Chi gestirebbe la piattaforma?" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Sito web</label><input value={form.website} onChange={set("website")} placeholder="https://…" /></div>
              <div className="form-group"><label>Emoji rappresentativa</label><input value={form.emoji} onChange={set("emoji")} placeholder="🌿" style={{ fontSize: "1.4rem", width: "80px" }} /></div>
            </div>
            <button className="btn btn-green" disabled={!form.name || !form.city || !form.contact_email} onClick={() => setStep(2)}>Avanti →</button>
          </div>
        )}

        {step === 2 && (
          <div className="form-card">
            <h2 className="form-title">Mission e identità</h2>
            <div className="alert alert-info">Questa sezione è fondamentale per la valutazione della redazione. Sii preciso e autentico.</div>
            <div className="form-group"><label>Descrizione breve *</label><textarea value={form.description} onChange={set("description")} placeholder="Una frase che descrive la vostra associazione (max 200 caratteri)…" style={{ minHeight: "70px" }} /></div>
            <div className="form-group">
              <label>Mission e attività *</label>
              <textarea value={form.mission} onChange={set("mission")} placeholder="Describe le vostre attività principali, i progetti in corso, il vostro impatto sul territorio, i valori che vi guidano…" style={{ minHeight: "140px" }} />
              <div className="form-hint">La redazione valuterà la coerenza con i valori della rete Grass Roots: radicamento locale, apertura, partecipazione, qualità.</div>
            </div>
            <div className="form-group">
              <label>Tag (separati da virgola)</label>
              <input value={form.tags} onChange={set("tags")} placeholder="Es. ambiente, giovani, teatro, volontariato" />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-outline-dark" onClick={() => setStep(1)}>← Indietro</button>
              <button className="btn btn-green" disabled={!form.description || !form.mission} onClick={handleSubmit}>
                {loading ? "Invio…" : "Invia candidatura →"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pending-notice">
            <div className="pending-icon">📬</div>
            <div className="pending-title">Candidatura ricevuta!</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              La redazione di Grass Roots esaminerà la vostra associazione nei prossimi giorni. Riceverete una comunicazione all'indirizzo <strong>{form.contact_email}</strong>.
            </p>
            <button className="btn btn-outline-dark" style={{ marginTop: "1.25rem" }} onClick={() => setPage("home")}>Torna alla home</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DASHBOARD ASSOCIAZIONE ────────────────────────────────
function DashboardPage({ user, assoc, events, onPublish, onToast }) {
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", category: assoc?.category || "Cultura", description: "", max_spots: "", emoji: "📌" });
  const [submitted, setSubmitted] = useState(false);
  const myEvents = events.filter(e => e.association_id === assoc?.id);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  if (!assoc || assoc.status !== "approved") return (
    <div className="page">
      <div className="page-header"><h1>Dashboard</h1></div>
      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="pending-notice">
          <div className="pending-icon">⏳</div>
          <div className="pending-title">Associazione non ancora approvata</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>La dashboard sarà disponibile una volta che la redazione avrà approvato la vostra candidatura.</p>
        </div>
      </div>
    </div>
  );

  const handlePublish = async () => {
    const { data, error } = await supabase.from("events").insert({
      ...form,
      association_id: assoc.id,
      max_spots: form.max_spots ? parseInt(form.max_spots) : null,
      registered: 0,
      status: "published",
    }).select().single();
    if (error) { onToast("Errore: " + error.message); return; }
    onPublish(data);
    setForm({ title: "", date: "", time: "", location: "", category: assoc.category, description: "", max_spots: "", emoji: "📌" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Dashboard</h1><p>Gestisci la tua presenza su Grass Roots</p></div>
      <div className="container" style={{ maxWidth: "860px" }}>
        <div className="dash-header">
          <div className="dash-avatar">{assoc.emoji || "🌿"}</div>
          <div>
            <div className="dash-name">{assoc.name}</div>
            <div className="dash-meta">📍 {assoc.city} · {assoc.category}{assoc.founded_year ? ` · dal ${assoc.founded_year}` : ""}</div>
            <div className="dash-meta" style={{ marginTop: "0.25rem" }}>✅ Associazione verificata dalla redazione</div>
          </div>
        </div>
        <div className="dash-grid">
          <div className="dash-stat"><div className="dash-stat-num">{myEvents.length}</div><div className="dash-stat-label">Eventi pubblicati</div></div>
          <div className="dash-stat"><div className="dash-stat-num">{myEvents.reduce((s, e) => s + (e.registered || 0), 0)}</div><div className="dash-stat-label">Partecipanti totali</div></div>
          <div className="dash-stat"><div className="dash-stat-num">{myEvents.filter(e => new Date(e.date) >= new Date()).length}</div><div className="dash-stat-label">Prossimi eventi</div></div>
        </div>
        <div className="form-card">
          <h2 className="form-title">📌 Pubblica un nuovo evento</h2>
          {submitted && <div className="alert alert-success">✓ Evento pubblicato con successo!</div>}
          <div className="form-group"><label>Titolo *</label><input value={form.title} onChange={set("title")} placeholder="Es. Laboratorio di compostaggio urbano" /></div>
          <div className="form-row">
            <div className="form-group"><label>Data *</label><input type="date" value={form.date} onChange={set("date")} /></div>
            <div className="form-group"><label>Orario</label><input type="time" value={form.time} onChange={set("time")} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Luogo *</label><input value={form.location} onChange={set("location")} placeholder="Es. Parco Montagnola, Bologna" /></div>
            <div className="form-group"><label>Categoria</label><select value={form.category} onChange={set("category")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="form-group"><label>Descrizione</label><textarea value={form.description} onChange={set("description")} placeholder="Descrivi l'evento, cosa porterà, a chi è rivolto…" /></div>
          <div className="form-row">
            <div className="form-group"><label>Posti massimi</label><input type="number" value={form.max_spots} onChange={set("max_spots")} placeholder="Lascia vuoto = illimitati" /></div>
            <div className="form-group"><label>Emoji</label><input value={form.emoji} onChange={set("emoji")} style={{ fontSize: "1.4rem", width: "80px" }} /></div>
          </div>
          <button className="btn btn-green" disabled={!form.title || !form.date || !form.location} onClick={handlePublish}>Pubblica evento →</button>
        </div>
        {myEvents.length > 0 && (
          <div className="form-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="form-title">I tuoi eventi</h2>
            {myEvents.sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif" }}>{e.emoji} {e.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{fmtDate(e.date)}{e.time ? " · " + e.time : ""} · {e.location}</div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.82rem", color: "var(--text-muted)" }}>👥 {e.registered || 0}{e.max_spots ? ` / ${e.max_spots}` : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── EDITORIAL PANEL ───────────────────────────────────────
function EditorialPage({ user, onToast, onRefresh }) {
  const [tab, setTab] = useState("pending");
  const [candidates, setCandidates] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    if (user) checkRole();
  }, [user]);

  const checkRole = async () => {
    const { data } = await supabase.from("editors").select("id").eq("user_id", user.id).single();
    if (data) { setIsEditor(true); loadCandidates(); }
    setLoading(false);
  };

  const loadCandidates = async () => {
    const { data } = await supabase.from("associations").select("*").order("created_at", { ascending: false });
    if (data) setCandidates(data);
  };

  const review = async (id, status) => {
    const { error } = await supabase.from("associations").update({ status, review_note: notes[id] || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (!error) { onToast(status === "approved" ? "Associazione approvata!" : "Candidatura respinta."); loadCandidates(); onRefresh(); }
  };

  if (!user) return <div className="page"><div className="container"><div className="alert alert-warning">Accesso riservato.</div></div></div>;
  if (loading) return <div className="page"><div className="container"><p>Verifica accesso…</p></div></div>;
  if (!isEditor) return <div className="page"><div className="container"><div className="alert alert-error">Accesso riservato alla redazione.</div></div></div>;

  const byStatus = s => candidates.filter(c => c.status === s);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pannello redazione</h1>
        <p>Valuta le candidature e gestisci la rete Grass Roots</p>
      </div>
      <div className="container">
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[["pending","⏳ In attesa"],["approved","✅ Approvate"],["rejected","❌ Respinte"]].map(([s, label]) => (
            <div key={s} className="dash-stat" style={{ flex: 1, minWidth: "140px", cursor: "pointer", border: tab === s ? "2px solid var(--green)" : "1px solid var(--border)" }} onClick={() => setTab(s)}>
              <div className="dash-stat-num">{byStatus(s).length}</div>
              <div className="dash-stat-label">{label}</div>
            </div>
          ))}
        </div>
        <div className="editorial-tabs">
          {[["pending","In attesa"],["approved","Approvate"],["rejected","Respinte"]].map(([s, label]) => (
            <button key={s} className={`ed-tab ${tab === s ? "active" : ""}`} onClick={() => setTab(s)}>{label} ({byStatus(s).length})</button>
          ))}
        </div>
        {byStatus(tab).length === 0 && <div className="alert alert-info">Nessuna candidatura in questa categoria.</div>}
        {byStatus(tab).map(c => (
          <div key={c.id} className="candidate-card">
            <div className="candidate-header">
              <div>
                <div className="candidate-name">{c.emoji || "🌿"} {c.name}</div>
                <div className="candidate-meta">📍 {c.city} · {c.category} · {c.contact_email}</div>
              </div>
              <span className={`badge badge-${c.status}`}>{c.status === "pending" ? "In attesa" : c.status === "approved" ? "Approvata" : "Respinta"}</span>
            </div>
            <p className="candidate-desc"><strong>Descrizione:</strong> {c.description}</p>
            <p className="candidate-desc"><strong>Mission:</strong> {c.mission}</p>
            {c.website && <p style={{ fontSize: "0.82rem", color: "var(--green)", marginBottom: "0.75rem" }}>🔗 <a href={c.website} target="_blank" rel="noreferrer">{c.website}</a></p>}
            {c.review_note && <div className="alert alert-warning" style={{ fontSize: "0.82rem" }}>📝 Nota precedente: {c.review_note}</div>}
            {tab === "pending" && (
              <div className="candidate-actions">
                <textarea className="review-note" value={notes[c.id] || ""} onChange={e => setNotes(n => ({ ...n, [c.id]: e.target.value }))} placeholder="Nota opzionale (visibile all'associazione se respinta)…" />
                <button className="btn btn-green btn-sm" onClick={() => review(c.id, "approved")}>✓ Approva</button>
                <button className="btn btn-danger btn-sm" onClick={() => review(c.id, "rejected")}>✗ Respingi</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [userAssoc, setUserAssoc] = useState(null);
  const [associations, setAssociations] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventModal, setEventModal] = useState(null);
  const [assocModal, setAssocModal] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => setToast(msg);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load data
  useEffect(() => { loadPublicData(); }, []);
  useEffect(() => { if (user) loadUserAssoc(); }, [user]);

  const loadPublicData = async () => {
    const [{ data: assocs }, { data: evts }] = await Promise.all([
      supabase.from("associations").select("*").eq("status", "approved").order("name"),
      supabase.from("events").select("*").eq("status", "published").gte("date", new Date().toISOString().split("T")[0]).order("date"),
    ]);
    if (assocs) setAssociations(assocs);
    if (evts) setEvents(evts);
  };

  const loadUserAssoc = async () => {
    const { data } = await supabase.from("associations").select("*").eq("user_id", user.id).single();
    if (data) setUserAssoc(data);
  };

  const handleRegister = async (event) => {
    await supabase.from("events").update({ registered: (event.registered || 0) + 1 }).eq("id", event.id);
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, registered: (e.registered || 0) + 1 } : e));
    showToast(`Iscrizione a "${event.title}" confermata!`);
  };

  const handlePublish = (newEvent) => {
    setEvents(prev => [...prev, newEvent]);
    showToast("Evento pubblicato!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserAssoc(null);
    showToast("Disconnesso.");
  };

  const navItems = [
    { key: "home", label: "Home" },
    { key: "events", label: "Eventi" },
    { key: "associations", label: "Associazioni" },
    { key: "map", label: "Mappa" },
  ];

  return (
    <>
      <style>{css}</style>
      <nav>
        <div className="nav-brand" onClick={() => setPage("home")}>
          <LogoSVG size={54} />
          <div>
            <span className="nav-brand-text">grass roots</span>
            <span className="nav-brand-sub">fare rete, fuori dalla rete</span>
          </div>
        </div>
        <div className="nav-links">
          {navItems.map(n => <button key={n.key} className={`nav-link ${page === n.key ? "active" : ""}`} onClick={() => setPage(n.key)}>{n.label}</button>)}
          {user ? (
            <div className="nav-user">
              <span>{user.email?.split("@")[0]}</span>
              {userAssoc?.status === "approved" && <button onClick={() => setPage("dashboard")}>Dashboard</button>}
              <button onClick={() => setPage("editorial")}>Redazione</button>
              <button onClick={handleLogout}>Esci</button>
            </div>
          ) : (
            <>
              <button className="nav-link" onClick={() => setShowAuth(true)}>Accedi</button>
              <button className="nav-cta" onClick={() => setPage("register")}>Candidati</button>
            </>
          )}
        </div>
      </nav>

      {page === "home" && <HomePage setPage={setPage} events={events} assocs={associations} onEventClick={setEventModal} onAssocClick={setAssocModal} />}
      {page === "events" && <EventsPage events={events} assocs={associations} onEventClick={setEventModal} />}
      {page === "associations" && <AssociationsPage assocs={associations} onAssocClick={setAssocModal} />}
      {page === "map" && <MapPage assocs={associations} events={events} onAssocClick={setAssocModal} />}
      {page === "register" && <RegisterPage user={user} setPage={setPage} onToast={showToast} />}
      {page === "dashboard" && <DashboardPage user={user} assoc={userAssoc} events={events} onPublish={handlePublish} onToast={showToast} />}
      {page === "editorial" && <EditorialPage user={user} onToast={showToast} onRefresh={loadPublicData} />}

      <footer>
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">grass roots</div>
            <div className="footer-tagline">fare rete, fuori dalla rete</div>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem", opacity: 0.55, lineHeight: 1.8 }}>Una piattaforma per le associazioni e le realtà della società civile. Costruiamo comunità dal basso.</p>
          </div>
          <div className="footer-col">
            <h4>Esplora</h4>
            <p onClick={() => setPage("events")}>Tutti gli eventi</p>
            <p onClick={() => setPage("associations")}>Le associazioni</p>
            <p onClick={() => setPage("map")}>Mappa del territorio</p>
          </div>
          <div className="footer-col">
            <h4>Associazioni</h4>
            <p onClick={() => setPage("register")}>Candidati alla rete</p>
            <p onClick={() => setPage("dashboard")}>Dashboard</p>
            <p onClick={() => setPage("editorial")}>Area redazione</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Grass Roots</span>
          <span>Piattaforma aperta · società civile</span>
        </div>
      </footer>

      {eventModal && <EventModal event={eventModal} assoc={associations.find(a => a.id === eventModal.association_id)} onClose={() => setEventModal(null)} onRegister={handleRegister} />}
      {assocModal && <AssocModal assoc={assocModal} events={events} onClose={() => setAssocModal(null)} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={() => { loadPublicData(); loadUserAssoc && loadUserAssoc(); }} />}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
