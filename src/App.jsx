// CB BINISSALEM DASHBOARD v3 — Supabase + Todas las mejoras
import { useState, useRef, useEffect, useCallback, useContext, createContext } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Calendar, BarChart2, Dumbbell, Users, BookOpen, PenTool,
  Sun, Moon, Plus, Check, X, Activity, Target, Upload, ChevronRight, ChevronLeft,
  Trash2, RotateCcw, Edit2, Trophy, Shield, Wifi, WifiOff, Loader, Link,
  Search, ExternalLink, Globe, Save, Star, Zap, Image, FileText, Printer,
  Copy, Brain, ChevronDown, Camera
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

/* ── SUPABASE ─────────────────────────────────────────────── */
const sb = createClient(
  "https://ckznrzmuxwbuixrbjsnw.supabase.co",
  "sb_publishable_Tz9Qvz8a-FxqN3Vp0PdbKw_Qzzp4cZ5"
);

/* ── CONTEXTS ─────────────────────────────────────────────── */
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);
const DataCtx  = createContext();
const useData  = () => useContext(DataCtx);

const DARK  = { bg:"#07070f",card:"#111120",card2:"#181828",nav:"#09091a",border:"#1f1f38",border2:"#252542",text:"#e2e8f0",sub:"#64748b",muted:"#374151",accent:"#f97316",mode:"dark",tableHead:"#0e0e1f",rowHover:"rgba(249,115,22,.04)",inputBg:"#181828" };
const LIGHT = { bg:"#f0f2f5",card:"#ffffff",card2:"#f8fafc",nav:"#1e293b",border:"#e2e8f0",border2:"#cbd5e1",text:"#0f172a",sub:"#64748b",muted:"#94a3b8",accent:"#f97316",mode:"light",tableHead:"#f8fafc",rowHover:"rgba(249,115,22,.04)",inputBg:"#ffffff" };

/* ── DEFAULT DATA ─────────────────────────────────────────── */
// Campos: pj=partidos jugados, pt=puntos totales, min=minutos totales
// tl_i/tl_m=tiros libres intentados/metidos, t2_i/t2_m=tiros 2, t3_i/t3_m=tiros 3
// fc=faltas cometidas totales
// Calculados: min_p=min/pj, pts_p=pt/pj, tl%=tl_m/tl_i, t2%=t2_m/t2_i, t3%=t3_m/t3_i, fc_p=fc/pj
const emptyStats=()=>({pj:0,pt:0,min:0,tl_i:0,tl_m:0,t2_i:0,t2_m:0,t3_i:0,t3_m:0,fc:0});
const calcStats=p=>{
  const pj=p.pj||0;
  const tl_m=p.tl_m||0,tl_i=p.tl_i||0,tl_f=tl_i-tl_m;
  const t2_m=p.t2_m||0,t2_i=p.t2_i||0,t2_f=t2_i-t2_m;
  const t3_m=p.t3_m||0,t3_i=p.t3_i||0,t3_f=t3_i-t3_m;
  const tc_i=t2_i+t3_i;
  const pt=p.pt||0;
  // PIR (FIBA): PT + RD + RO + AST + ROB + TAP + FC_rec - TL_f - T2_f - T3_f - TO - FC_com
  // Since we don't have rebounds/assists yet, use scoring efficiency contribution
  const pir=pj?+(( pt + t2_m + t3_m + tl_m - tl_f - t2_f - t3_f ) / pj ).toFixed(1):0;
  // eFG% = (T2M + 1.5×T3M) / (T2I + T3I)  — effective field goal %
  const efg=tc_i?+(((t2_m+1.5*t3_m)/tc_i)*100).toFixed(1):0;
  // TS% = PT / (2 × (TC_i + 0.44×TL_i))  — true shooting %
  const tsDen=2*(tc_i+0.44*tl_i);
  const ts=tsDen?+((pt/tsDen)*100).toFixed(1):0;
  return{
    min_p:pj?+(p.min/pj).toFixed(1):0,
    pts_p:pj?+(pt/pj).toFixed(1):0,
    tl_pct:tl_i?+((tl_m/tl_i)*100).toFixed(1):0,
    t2_pct:t2_i?+((t2_m/t2_i)*100).toFixed(1):0,
    t3_pct:t3_i?+((t3_m/t3_i)*100).toFixed(1):0,
    fc_p:pj?+(p.fc/pj).toFixed(1):0,
    pir,efg,ts,
  };
};
const DP = [
  {id:1, name:"Joan Mir Crespí",      num:4,  pos:"Base",      active:true,  lesionado:false,equipo:"A",pj:18,pt:223,min:486,tl_i:42,tl_m:34,t2_i:78,t2_m:52,t3_i:38,t3_m:14,fc:32},
  {id:2, name:"Toni Alcover Pons",    num:7,  pos:"Escolta",   active:true,  lesionado:false,equipo:"A",pj:17,pt:173,min:425,tl_i:28,tl_m:20,t2_i:64,t2_m:40,t3_i:45,t3_m:17,fc:28},
  {id:3, name:"Marc Rosselló Vich",   num:11, pos:"Alero",     active:true,  lesionado:false,equipo:"A",pj:18,pt:157,min:392,tl_i:22,tl_m:16,t2_i:55,t2_m:34,t3_i:32,t3_m:11,fc:35},
  {id:4, name:"Pau Vicens Fiol",      num:14, pos:"Ala-Pívot", active:true,  lesionado:false,equipo:"A",pj:16,pt:120,min:368,tl_i:38,tl_m:28,t2_i:72,t2_m:48,t3_i:8, t3_m:2, fc:42},
  {id:5, name:"Biel Moyà Llull",      num:21, pos:"Pívot",     active:true,  lesionado:false,equipo:"A",pj:18,pt:113,min:340,tl_i:52,tl_m:38,t2_i:68,t2_m:48,t3_i:2, t3_m:0, fc:48},
  {id:6, name:"Andreu Pons Amengual", num:8,  pos:"Base",      active:true,  lesionado:false,equipo:"A",pj:17,pt:155,min:408,tl_i:30,tl_m:22,t2_i:58,t2_m:36,t3_i:42,t3_m:15,fc:30},
  {id:7, name:"Miquel Bestard Sans",  num:15, pos:"Escolta",   active:true,  lesionado:false,equipo:"A",pj:16,pt:138,min:372,tl_i:24,tl_m:18,t2_i:62,t2_m:40,t3_i:36,t3_m:13,fc:26},
  {id:8, name:"Rafel Perelló Reus",   num:3,  pos:"Alero",     active:true,  lesionado:false,equipo:"A",pj:15,pt:102,min:318,tl_i:18,tl_m:13,t2_i:48,t2_m:30,t3_i:28,t3_m:9, fc:22},
  {id:9, name:"Arnau Sastre Munar",   num:23, pos:"Ala-Pívot", active:true,  lesionado:false,equipo:"A",pj:14,pt:76, min:280,tl_i:16,tl_m:11,t2_i:44,t2_m:28,t3_i:10,t3_m:3, fc:30},
  {id:10,name:"Tomeu Ramis Fiol",     num:33, pos:"Pívot",     active:true,  lesionado:false,equipo:"A",pj:15,pt:63, min:255,tl_i:24,tl_m:16,t2_i:40,t2_m:26,t3_i:0, t3_m:0, fc:38},
  {id:11,name:"Xavi Colom Ferrer",    num:9,  pos:"Escolta",   active:false, lesionado:false,equipo:"A",pj:8, pt:46, min:182,tl_i:10,tl_m:7, t2_i:22,t2_m:13,t3_i:18,t3_m:6, fc:12},
  {id:12,name:"Jaume Morro Pujol",    num:17, pos:"Alero",     active:true,  lesionado:false,equipo:"A",pj:16,pt:126,min:348,tl_i:20,tl_m:14,t2_i:52,t2_m:32,t3_i:30,t3_m:10,fc:24},
];
const DS = [
  {id:1,date:"2025-04-08",type:"Técnico-Táctico",dur:90,title:"Presentación + Ataque posicional",notes:"",exs:["Calentamiento 15'","Sistemas ofensivos 40'","5v5 restringido 25'","Vuelta calma 10'"]},
  {id:2,date:"2025-04-10",type:"Físico",          dur:75,title:"Fuerza general + Resistencia",    notes:"",exs:["Activación 10'","Circuito fuerza 30'","Carrera aeróbica 20'","Estiramientos 15'"]},
  {id:3,date:"2025-04-11",type:"Técnico",         dur:60,title:"Tiro individual + Bote",          notes:"",exs:["Calentamiento 10'","Spot shooting 20'","Bote y finalizaciones 20'","Tiro libre 10'"]},
  {id:4,date:"2025-04-15",type:"Táctico",         dur:90,title:"Defensa individual + Press 2-2-1",notes:"",exs:["Calentamiento 10'","1v1 defensivo 20'","Press 2-2-1 25'","Situaciones partido 30'","Vuelta 5'"]},
];
const DM = [
  {id:1,date:"2025-04-12",rival:"CB Inca A",       location:"Casa",  pts_us:78,pts_them:65},
  {id:2,date:"2025-04-19",rival:"Bàsquet Lloseta", location:"Fuera", pts_us:72,pts_them:70},
  {id:3,date:"2025-04-26",rival:"CB Pollença A",   location:"Casa",  pts_us:81,pts_them:75},
];
// attDates: { "YYYY-MM-DD": [playerId, ...] }
const DA = {};
const DEFAULT_QUINTETS = [
  {id:1,name:"Quinteto 1",lineup:{}},
  {id:2,name:"Quinteto 2",lineup:{}},
  {id:3,name:"Quinteto 3",lineup:{}},
  {id:4,name:"Quinteto 4",lineup:{}},
  {id:5,name:"Quinteto 5",lineup:{}},
];
const DEFAULT_RECURSOS = [
  {id:1,title:"FastModel Sports",        url:"https://fastmodelsports.com",        desc:"Base de datos de jugadas NBA/FIBA con diagramas interactivos",tags:["jugadas","NBA","FIBA","diagramas"]},
  {id:2,title:"Breakthrough Basketball", url:"https://breakthroughbasketball.com", desc:"Ejercicios, drills y sistemas de juego para todos los niveles",tags:["ejercicios","sistemas","educación"]},
  {id:3,title:"FBIB",                   url:"https://fbib.es",                     desc:"Federació de Bàsquet de les Illes Balears",                   tags:["federación","Baleares","estadísticas"]},
  {id:4,title:"FEB",                    url:"https://feb.es",                      desc:"Federación Española de Baloncesto",                           tags:["federación","España","noticias"]},
  {id:5,title:"ACB",                    url:"https://acb.com",                     desc:"Liga ACB — resultados, estadísticas y clasificación",         tags:["ACB","estadísticas","resultados"]},
];

/* ── STATIC DATA ──────────────────────────────────────────── */
const MESOS=[
  {id:1,name:"Preparación General",    s:"Sem 1", e:"Sem 4", type:"Pretemporada",weeks:4, color:"#3b82f6",goal:"Base física y adaptación motriz"},
  {id:2,name:"Preparación Específica", s:"Sem 5", e:"Sem 8", type:"Pretemporada",weeks:4, color:"#8b5cf6",goal:"Trabajo técnico-táctico intensivo"},
  {id:3,name:"Competición I",          s:"Sem 9", e:"Sem 20",type:"Temporada",   weeks:12,color:"#f97316",goal:"Rendimiento competitivo sostenido"},
  {id:4,name:"Recuperación Activa",    s:"Sem 21",e:"Sem 22",type:"Transición",  weeks:2, color:"#10b981",goal:"Descarga y regeneración"},
  {id:5,name:"Playoffs",               s:"Sem 23",e:"Sem 34",type:"Playoffs",    weeks:12,color:"#ef4444",goal:"Pico de forma – Fase final"},
];
// Mar=2 Mié=3 Jue=4 Vie=5
const TRAIN_DAYS = [2,3,4,5];
const TRAIN_DAY_NAMES = {2:"Mar",3:"Mié",4:"Jue",5:"Vie"};
const SEASON_START = new Date("2025-04-07");
const SEASON_END   = new Date("2026-06-30");
function generateTrainingDates(){
  const dates=[];
  const cur=new Date(SEASON_START);
  while(cur<=SEASON_END){
    if(TRAIN_DAYS.includes(cur.getDay())){
      dates.push(cur.toISOString().slice(0,10));
    }
    cur.setDate(cur.getDate()+1);
  }
  return dates;
}
const ALL_TRAINING_DATES = generateTrainingDates();

const MICRO_DAYS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MICRO=[
  {type:"Libre",           intens:"—",          focus:"Descanso activo",           color:"#4b5563"},
  {type:"Técnico-Táctico", intens:"Media-Alta", focus:"Ataque + sistemas",         color:"#f97316"},
  {type:"Técnico",         intens:"Media",      focus:"Tiro y bote",               color:"#f59e0b"},
  {type:"Físico",          intens:"Alta",       focus:"Fuerza / Potencia",         color:"#3b82f6"},
  {type:"Táctico",         intens:"Media",      focus:"Defensa / Sistemas",        color:"#8b5cf6"},
  {type:"Partido",         intens:"Máxima",     focus:"Competición",               color:"#ef4444"},
  {type:"Recuperación",    intens:"Mínima",     focus:"Regenerativo post-partido", color:"#10b981"},
];
const ML=[10,85,65,75,60,100,15];
const DEFAULT_PLAYS=[
  {id:1,name:"Horns Flex",     cat:"Ataque",  desc:"Dos pívots en codo, base arriba. Múltiples opciones de corte, bloqueo y penetración.",tags:["Pick & Roll","Bloqueos"],images:[]},
  {id:2,name:"Box BLOB",       cat:"Especial",desc:"Saque de banda desde zona. Formación en caja con múltiples opciones de corte y tiro.",tags:["Lateral","Zona baja"],images:[]},
  {id:3,name:"Match-Up Zone",  cat:"Defensa", desc:"Zona híbrida adaptativa. Alta comunicación entre jugadores.",tags:["Zona","Comunicación"],images:[]},
  {id:4,name:"Princeton Base", cat:"Ataque",  desc:"Sistema de bajo poste con backdoors continuos y bloqueos cruzados en esquina.",tags:["Sistema","Backdoor"],images:[]},
  {id:5,name:"ATO #14",        cat:"Especial",desc:"After timeout. Bloqueo doble para tirador de 3 en esquina.",tags:["ATO","Tiro 3"],images:[]},
  {id:6,name:"Press 1-2-1-1",  cat:"Defensa", desc:"Press full court con trampa lateral. Ideal para recuperar partido en últimos minutos.",tags:["Press","Trampa"],images:[]},
];
const DEFAULT_EJS=[
  {id:1, name:"Tiro en forma",         cat:"Técnico",     dur:"15'",diff:"Básico",desc:"Mecánica de tiro con corrección de follow-through.",images:[]},
  {id:2, name:"1v1 desde cono",        cat:"Técnico",     dur:"20'",diff:"Medio", desc:"Bote desde cono lateral, finalización variada.",images:[]},
  {id:3, name:"Pick & Roll 2v2",       cat:"Táctico",     dur:"25'",diff:"Medio", desc:"Bloqueador y base ejecutan P&R. Progresión a 3v3.",images:[]},
  {id:4, name:"Defensa 1v1 perímetro", cat:"Táctico",     dur:"20'",diff:"Medio", desc:"Posición defensiva, footwork, no ceder línea de base.",images:[]},
  {id:5, name:"Circuito de fuerza",    cat:"Físico",      dur:"30'",diff:"Alto",  desc:"6 estaciones: sentadillas, prensa, peso muerto, dominadas, abdominales, saltos.",images:[]},
  {id:6, name:"Series 4×30m",          cat:"Físico",      dur:"20'",diff:"Alto",  desc:"Sprint a máxima intensidad con recuperación de 2' entre series.",images:[]},
  {id:7, name:"Movilidad y Stretching",cat:"Recuperación",dur:"30'",diff:"Básico",desc:"Movilidad articular, estiramientos dinámicos y estáticos.",images:[]},
  {id:8, name:"TL bajo presión",       cat:"Mental",      dur:"15'",diff:"Medio", desc:"Tiro libre tras ejercicio físico intenso. Series 2+2.",images:[]},
  {id:9, name:"3v2 – 2v1 continuo",   cat:"Táctico",     dur:"20'",diff:"Medio", desc:"Transición ofensiva y defensiva en continuidad.",images:[]},
  {id:10,name:"Spot Shooting",         cat:"Técnico",     dur:"20'",diff:"Básico",desc:"5 posiciones fijas, 5 tiros por posición, 3 series.",images:[]},
  {id:11,name:"4v4 restringido",       cat:"Táctico",     dur:"25'",diff:"Alto",  desc:"Juego con restricciones: máx. 2 botes, pase interior obligatorio.",images:[]},
  {id:12,name:"Foam Roller + PNF",     cat:"Recuperación",dur:"20'",diff:"Básico",desc:"2 minutos por grupo muscular. Estiramientos PNF.",images:[]},
];
const CS=[
  {id:"PG",abbr:"B", name:"Base",      x:200,y:105},
  {id:"SG",abbr:"E", name:"Escolta",   x:345,y:185},
  {id:"SF",abbr:"A", name:"Alero",     x:55, y:185},
  {id:"PF",abbr:"AP",name:"Ala-Pívot", x:305,y:285},
  {id:"C", abbr:"P", name:"Pívot",     x:95, y:285},
];
const TC={"Técnico-Táctico":"#f97316","Físico":"#3b82f6","Técnico":"#f59e0b","Táctico":"#8b5cf6","Recuperación":"#10b981","Partido":"#ef4444","Mental":"#06b6d4","Libre":"#4b5563"};
const CC={"Técnico":"#f59e0b","Táctico":"#8b5cf6","Físico":"#3b82f6","Recuperación":"#10b981","Mental":"#06b6d4"};
const DC={"Básico":"#10b981","Medio":"#f59e0b","Alto":"#ef4444"};
const PC={"Ataque":"#f97316","Defensa":"#3b82f6","Especial":"#8b5cf6"};
const POC={"Base":"#3b82f6","Escolta":"#8b5cf6","Alero":"#f97316","Ala-Pívot":"#10b981","Pívot":"#ef4444"};
const DC2=["#f97316","#ef4444","#3b82f6","#10b981","#f8fafc","#111120"];
const TAG_COLORS=["#f97316","#3b82f6","#8b5cf6","#10b981","#ef4444","#f59e0b","#06b6d4","#ec4899"];
const tagColor=t=>TAG_COLORS[Math.abs([...String(t)].reduce((a,c)=>a+c.charCodeAt(0),0))%TAG_COLORS.length];

/* ── GLOBAL STYLES ────────────────────────────────────────── */
function GS({th}){return <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html,body,#root{height:100%}
  body{font-family:'Inter',sans-serif;background:${th.bg};color:${th.text}}
  ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${th.card}}
  ::-webkit-scrollbar-thumb{background:${th.border2};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:#f97316}
  input,select,textarea{background:${th.inputBg}!important;border:1px solid ${th.border2}!important;color:${th.text}!important;border-radius:8px;padding:8px 12px;outline:none;font-family:'Inter',sans-serif;font-size:13px;width:100%;transition:border-color .15s}
  input:focus,select:focus,textarea:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.15)}
  option{background:${th.card};color:${th.text}}
  .card{background:${th.card};border:1px solid ${th.border};border-radius:14px}
  .card2{background:${th.card2};border:1px solid ${th.border};border-radius:10px}
  .hrow:hover{background:${th.rowHover}!important}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;cursor:pointer;border-right:3px solid transparent;transition:all .15s}
  .nav-item:hover{background:rgba(249,115,22,.07);border-right-color:rgba(249,115,22,.3)}
  .nav-item.active{background:rgba(249,115,22,.13);border-right-color:#f97316}
  .cl{transition:transform .2s,box-shadow .2s;cursor:pointer}.cl:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.2)}
  @keyframes spin{to{transform:rotate(360deg)}}
  @media print{.no-print{display:none!important}.print-only{display:block!important}}

  /* ── RESPONSIVE ── */
  .close-sidebar{display:none}
  /* iOS safe areas — Dynamic Island / notch / home indicator */
  @supports(padding-top: env(safe-area-inset-top)){
    .sidebar{padding-top: env(safe-area-inset-top)!important;}
  }
  .mobile-topbar{display:none!important}

  /* Tablet ≤900px */
  @media(max-width:900px){
    .sidebar{
      position:fixed!important;left:0;top:0;width:250px!important;
      height:100dvh!important;z-index:200;
      transform:translateX(-100%);transition:transform .28s cubic-bezier(.4,0,.2,1);
      box-shadow:4px 0 24px rgba(0,0,0,.35)!important;
    }
    .sidebar.open{transform:translateX(0)!important;}
    .mobile-topbar{display:flex!important;}
    .close-sidebar{display:flex!important;}
    main{padding:14px 12px!important;}
    .card{border-radius:10px!important;}
    /* Overlay when sidebar open */
    .sidebar-overlay{display:block!important;}
  }

  /* Móvil ≤600px */
  @media(max-width:600px){
    .sidebar{width:82vw!important;max-width:300px!important;}
    main{padding:10px 8px!important;}
    h2{font-size:22px!important;}
    /* Tables get horizontal scroll */
    .card table{min-width:500px;}
    /* Stack all 2-col grids */
    .r2col{grid-template-columns:1fr!important;}
    /* KPI grids: 2 col on mobile */
    .kpi4{grid-template-columns:1fr 1fr!important;}
    .kpi3{grid-template-columns:1fr 1fr!important;}
    /* Sections headers */
    .sh-right{display:none!important;}
  }

  /* Named responsive grid classes */
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:900px){
    .g4{grid-template-columns:1fr 1fr!important;}
    .g3{grid-template-columns:1fr 1fr!important;}
    .g2{grid-template-columns:1fr!important;}
  }
  @media(max-width:600px){
    .g4{grid-template-columns:1fr 1fr!important;}
    .g3{grid-template-columns:1fr!important;}
    .g2{grid-template-columns:1fr!important;}
  }

  /* Overlay */
  .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:199;backdrop-filter:blur(2px)}
  
  /* Touch-friendly buttons on mobile */
  @media(max-width:600px){
    button{min-height:36px;}
    input,select,textarea{font-size:16px!important;} /* prevent iOS zoom */
  }
`}</style>;}

/* ── SHARED UI ────────────────────────────────────────────── */
function Badge({children,color="#f97316",sm}){return <span style={{background:color+"1e",color,border:`1px solid ${color}40`,borderRadius:5,padding:sm?"1px 6px":"2px 9px",fontSize:sm?10:11,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:.4,whiteSpace:"nowrap",display:"inline-block"}}>{children}</span>;}
function Btn({children,onClick,variant="primary",sm,icon,disabled,style:sx}){
  const S={primary:{bg:"#f97316",color:"#fff",border:"none"},ghost:{bg:"transparent",color:"#64748b",border:"1px solid #374151"},danger:{bg:"rgba(239,68,68,.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,.3)"},success:{bg:"rgba(16,185,129,.1)",color:"#10b981",border:"1px solid rgba(16,185,129,.3)"}}[variant]||{bg:"#f97316",color:"#fff",border:"none"};
  return <button disabled={disabled} onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:sm?"5px 12px":"8px 18px",background:S.bg,color:S.color,border:S.border,borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:sm?12:14,letterSpacing:.4,opacity:disabled?.45:1,whiteSpace:"nowrap",fontFamily:"Barlow Condensed,sans-serif",...sx}}>{icon}{children}</button>;
}
function SH({title,sub,right}){const{th}=useTheme();return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div><h2 style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:30,fontWeight:800,color:th.text,letterSpacing:1,textTransform:"uppercase",lineHeight:1}}>{title}</h2>{sub&&<p style={{color:th.muted,fontSize:12,marginTop:4}}>{sub}</p>}</div>{right&&<div style={{flexShrink:0,marginLeft:16}}>{right}</div>}</div>;}
function TB({tabs,active,onChange}){const{th}=useTheme();return <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>{tabs.map(([id,lbl])=><button key={id} onClick={()=>onChange(id)} style={{padding:"7px 20px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed,sans-serif",background:active===id?"#f97316":th.card2,color:active===id?"#fff":th.sub,transition:"all .15s"}}>{lbl}</button>)}</div>;}
function Lbl({children}){return <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase",letterSpacing:.5}}>{children}</label>;}
function SyncBadge({status}){const cfg={saving:{icon:<Loader size={11} style={{animation:"spin 1s linear infinite"}}/>,label:"Guardando…",color:"#f59e0b"},saved:{icon:<Wifi size={11}/>,label:"Sincronizado ✓",color:"#10b981"},offline:{icon:<WifiOff size={11}/>,label:"Sin conexión",color:"#ef4444"},loading:{icon:<Loader size={11} style={{animation:"spin 1s linear infinite"}}/>,label:"Cargando…",color:"#64748b"}}[status]||{};return <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:cfg.color+"18",border:`1px solid ${cfg.color}35`}}><span style={{color:cfg.color}}>{cfg.icon}</span><span style={{fontSize:11,color:cfg.color,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,letterSpacing:.3}}>{cfg.label}</span></div>;}

/* ── IMAGE UPLOAD HELPER ──────────────────────────────────── */
function ImageUploader({images,setImages,max=4}){
  const{th}=useTheme();
  const ref=useRef();
  const handleFiles=files=>{
    const arr=[...files].slice(0,max-images.length);
    arr.forEach(f=>{
      if(!f.type.startsWith("image/"))return;
      if(f.size>2*1024*1024){alert("La imagen es demasiado grande. Máximo 2MB. Usa una imagen más pequeña o comprimida.");return;}
      const r=new FileReader();
      r.onload=e=>setImages(prev=>[...prev,e.target.result].slice(0,max));
      r.onerror=()=>alert("Error leyendo la imagen. Prueba con otro archivo.");
      r.readAsDataURL(f);
    });
  };
  return <div>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
      {images.map((img,i)=><div key={i} style={{position:"relative",width:80,height:80,borderRadius:8,overflow:"hidden",border:`1px solid ${th.border}`}}>
        <img src={img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <button onClick={()=>setImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:9,background:"rgba(239,68,68,.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10}}>×</button>
      </div>)}
      {images.length<max&&<div onClick={()=>ref.current?.click()} style={{width:80,height:80,borderRadius:8,border:`2px dashed ${th.border2}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",gap:4,color:th.muted}}>
        <Image size={18}/><span style={{fontSize:10}}>Añadir</span>
      </div>}
    </div>
    <input ref={ref} type="file" accept="image/jpeg,image/png" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
    <p style={{fontSize:10,color:th.muted}}>Hasta {max} imágenes JPG/PNG · Usa imágenes pequeñas (&lt;500KB)</p>
  </div>;
}

/* ── LOGO + SHARED PDF STYLES ────────────────────────────── */
const LOGO_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB+wAAAfLCAYAAACB5lSXAAEAAElEQVR4nOz9bYxdd50v+P7cITM15AVtRtYcsxVWPNdSMHTjnWMEchDpk43FiYW42qWUkB2kqktkrrlRsId0JZEsVSJSkkdxqkE2uaFLeMyUpU6iqFDVnRZyDtepnE6ELZhOu0w3bXLHXGfFKgzKFYEXRh5FaN8XlYQ8+KEe9t7/9fD5vDonCfa3k/Laa6/v+v3+EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAb61JHQAAAADojWazGRs3buws539z8uTJNQsLC72KBAAAALyDwh4AAAASGBoaumyRftNNN8VHP/rR9/31D33oQzE2OdfzXMsxvrsVf/jDH97311944YX3/bWzZ8+umZ+f70MqAAAAKA+FPQAAALxDo9GIrVu3XrZMv+222y77v/nEJz4RXx072tNcdfKD8eH4xS9+8b6//vOf/zx+//vfv++vT09Pe74BAABAKflCCwAAQCW0Wq3Ohz/84Yh4d7F+4403xt7HZhOlomhGd2x5319754sANgEAAADQTwp7AAAACu+ts9j/8i//Mj75yU9GRMTE0y8lTkWdHLy/HefPn4+IP6/8V+4DAACwWgp7AAAAknrnCvq3JuOtmKesxne34g9/+EO8+uqr8corr8Tvfve7mJub8/wFAACAy/KFEQAAgJ56a1X95s2b40Mf+pAV9dTaD8aH4xe/+EX84Q9/iNOnTyv0AQAAas4XQgAAAFbsctPxVtXDyin0AQAA6sUXPgAAAC7rcmW86XhI6+D97Th//vzbK/fPnj27Zn5+PnUsAAAAVkhhDwAAUEPOjYdqGt/dij/84Q/x85//PH7/+98r9AEAAApOYQ8AAFBBbxXyf/mXfxmf/OQn40Mf+lCMTc6ljgUk9taE/lsr9yMipqenPR8CAABIxBcyAACAkmo2m7Fx48bO5s2b40Mf+pCz44FVG9/dildffTVOnz5tOh8AAKAPFPYAAAAF91Yxf9ttt1lbDyTx1mT+Cy+8oMgHAADoIoU9AABAgbRarc5//I//Mf76r//aCnug8H4wPhy/+MUvFPkAAAArpLAHAABIZGhoqLN58+b4q7/6q9j72GzqOABdYyIfAABgaRT2AAAAfaCcB4gY392KV199NU6fPh3T09OeSwEAALXnixEAAECXKecBlu6ttfo///nP45//+Z9N4wMAALWisAcAAFihRqMRW7du7dx2223xiU98Ir46djR1JIDKGN/din/913+Nf/mXf4m5uTnPsAAAgEryZQcAAGAJlPMA6R28vx3/9m//ZqU+AABQGb7YAAAAvIdyHqA8lPgAAECZ+RIDAADUWrPZjE996lOdT37ykzHx9Eup4wDQBW+V+M8//7x1+gAAQKH5wgIAANSGch6gvsZ3t+Jf//Vf4/jx42vm5+dTxwEAAIgIhT0AAFBRynkArmV0x5Z44YUX4uTJk2sWFhZSxwEAAGpIYQ8AAJTe0NBQ56abboq//uu/jrHJudRxACipg/e34yc/+Un8y7/8i1X6AABAX/jiAQAAlEqr1er8x//4H+Ozn/1s7H1sNnUcACrOFD4AANBLCnsAAKDQhoaGOrfddpu19gAUwvjuVrz44ovxz//8z2vm5+dTxwEAAEpOYQ8AABSKgh6AMnlrjf7x48cV+AAAwLIp7AEAgKRarVbn9ttvj1tvvTW+OnY0dRwAWJUfjA/HiRMn4vnnn4+5uTnP3gAAgKvypQEAAOirRqMRO3fu7DiDHoA6UOADAABX40sCAADQc61Wq9Nut625B6D2FPgAAMA7+VIAAAB0nSl6AFiag/e34yc/+UkcP358zfz8fOo4AABAnynsAQCArjBFDwCrd/D+dvzoRz+KY8eOrVlYWEgdBwAA6DGFPQAAsCKNRiO2b9/e+eIXv2iKHgB6ZHTHlnjhhRdienraczwAAKggN/oAAMCStVqtzu233x7fP3Y2dRQAqJ0fjA/HiRMn4oc//KH1+QAAUBEKewAA4IpM0QNAcY3vbsWLL74Yhw8f9owPAABKys08AADwLkNDQ53bbrvNWfQAUCKm7wEAoJwU9gAAUHPW3ANA9Zi+BwCAcnDDDgAANWPNPQDUyw/Gh+PYsWPx1FNPrVlYWEgdBwAAeAeFPQAA1ECr1eq0221r7gGA+Nr2jVbnAwBAQSjsAQCgghqNRuzcubPz2c9+1hQ9AHBFb63OP3bsmOl7AABIQGEPAAAVMTQ01PnSl74UY5NzqaMAACU1umNLvPDCCzE9Pe25IQAA9IEbbwAAKKlmsxnbtm3rbN++Pb46djR1HACgYn4wPhzHjh2L48ePW58PAAA9orAHAIAS2bVrV+dzn/ucKXoAoO9Gd2yJ2dnZmJub80wRAAC6xM01AAAUmCl6AKCIxne34sUXX4zDhw97vggAAKvghhoAAAqm2WzGnXfe2fn+sbOpowAAXNPB+9vxox/9SHkPAAAr4CYaAAAKoNFoxM6dOzvPnHgtdRQAgBVT3gMAwPK4cQYAgIR27drV2blzp3X3AEDlKO8BAODa3CwDAECftVqtzje+8Y3Y+9hs6igAAH1x8P52fPe73425uTnPIwEA4B3cIAMAQB84lx4AYNH47lZMTU0p7wEAIBT2AADQU6Ojo53t27dbeQ8AcBlf274xfvjDH66Zn59PHQUAAJJQ2AMAQJcNDQ11vvKVr1h5DwCwRD8YH45jx47FxMSE55UAANSKG2AAAOiCZrMZ3/zmNztjk3OpowAAlNrB+9vxD//wDzE9Pe3ZJQAAleemFwAAVqjRaMTOnTs7z5x4LXUUAIBKGt2xJY4cOWJlPgAAlaWwBwCAZdq1a1fni1/8opX3AAB99OVb18VTTz21ZmFhIXUUAADoGoU9AAAsgZX3AADFYGU+AABV4qYWAACuoNFoxNe//vXO94+dTR0FAIDL+Nr2jfHDH/7QynwAAErrL1IHAACAohkdHe0899xzneuybcp6AIAC+/6xs/G7D27uPPfcc53R0dFO6jwAALBcJuwBACCcSw8AUBUH72/Hd7/73Zibm/PsEwCAwnPTCgBAbbVarc7IyEg4lx4AoJqszAcAoOgU9gAA1Eqz2Yw777zTqnsAgBr5wfhwHDt2LCYmJjwPBQCgUNygAgBQeY1GI3bu3NnZvn17fHXsaOo4AAAkZGU+AABF4qYUAIDKci49AABXM767FVNTU8p7AACScSMKAEClNJvN+OY3v9lxLj0AAMvhvHsAAFJQ2AMAUHpvrbx/5sRrqaMAAFABX751XTz11FNrFhYWUkcBAKDi/iJ1AAAAWKmhoaHOzMxM57psm7IeAICueebEa3Fdtq0zMzPTabVandR5AACoLhP2AACUSrPZjLvvvrsz8fRLqaMAAFAjX9u+Mf7+7//e1D0AAF1lwh4AgFLYtWtX57nnnuv87oOblfUAAPTd94+dfXvqfmhoyNQ9AABdYcIeAIDCajQa8fWvf73z/WNnU0cBAID3cdY9AACrZcIeAIDCabVab59Nr6wHAKCo3nnWfbPZTB0HAIASMmEPAEBhjI6Odp458VrqGAAAsGJf+Pj1cfjwYc9dAQBYEjeOAAAk1Wg04sEHH3QuPQAAlWJdPgAAS2ElPgAASTQajTh06FDnumybsh4AgMp5a13+1NSUdfkAAFyRwh4AgL5qNpvx1vn0inoAAKpubHIufvfBzZ2ZmZnO0NBQJ3UeAACKxUp8AAD6YmhoqPOVr3wl9j42mzoKQKnlk+2IP5y//N/8zc8jLv3+/X/90u8iLswt/TfZMHT1v3/TbVf+e//thyLbu4zfC6CGnHMPAMBb3BQCANBTQ0NDnZ/9+obUMQB6Lj+w5fJ/4/evRvz+lcv/vQsnIy452/hd1jYj/nLjlf/+X94U8Zcfjbjuv4347zdG9n872q9kAF335VvXxcTEhGe0AAA15mYQAICeGB0d7Txz4rXUMQAiIiKfGo747S/e/RdfeeHy//Dvz0a8Pt/zTKzApl0R2edM8AOVM7pjSzz66KNrFha8xAUAUDcKewAAuqbRaMTOnTsV9UBf5QdbEf/nH/48ya5wr471rYiPtSN74KXUSQD6YnTHljhy5Mia+fn51FEAAOgThT0AAKvWaDTiwQcf7Ew8rVABuu/tVfNvTcSfm04Xht5a24y4aVvEzdsjG7HqHqivg/e341vf+pbiHgCgBhT2AACsWLPZjIcffriz97HZ1FGAkson2xF/OP/n6fhLv4u4YN15rVhzD3BFB+9vx3e/+92Ym5vzHBcAoKLc6AEAsGyKemCp3lfIW1fP2mbEx+6MyG41RQ+wDJ/+yMWYnp72PBcAoGLc4AEAsGRDQ0Odn/36htQxgIJ439nxEdbVc3mm6AG65gsfvz4OHz7suS4AQEW4sQMA4JpGR0c7z5x4LXUMoI/eLuN/8/OIS783Gc/yOIseoOe+fOu6mJiY8HwXAKDk3NABAHBFinqorrcL+VdeWPwLJuNZrfWtiI+1I3vgpdRJAGpFcQ8AUG5u5AAAeJdGoxEPPvhgZ+JphQuU3dvnx7/yQsSl30VcsI6cLtu0K+LmL0a2ezZ1EoDaG92xJR599NE1CwsLqaMAALAMCnsAACIiotlsxt13362ohxLKp4YjfvuLxfX1v/lnq+vpnYFGxKadVt0DFJjiHgCgXBT2AAA112w24+GHH+7sfWw2dRRgCd4u5195IeLCyYhLHsbTY2ubER+7M7KHzqZOAsAyjO9uxXe+85018/PzqaMAAHAVCnsAgJoaGhrqfOUrXwlFPRSXcp5k1rciNo9EttcxCgBld/D+dnzrW99S3AMAFJTCHgCgZoaGhjo/+/UNqWMA75FPtiN++28RvzkdcW46dRzqSEkPUGk/GB+O733vezE9Pe2ZMABAgbg5AwCoidHR0c4zJ15LHQMI5TwFsmlXxM1fjGz3bOokAPTRl29dFxMTE54NAwAUgJsyAIAKazQa8fWvf73z/WPOHYZU8oOtiN/+a8Rv/iXigsllCkBJT0m8fSzI/+//E7Hmuoj//v8S2QMvpY4FlTK6Y0s8+uijaxYWHLsDAJCKwh4AoIIajUY8+OCDnYmnPdSGflLOU1hKekogP9iKyF+M+M0/R7w+f/V/eKARsX5rxE23RfwPn4hs5GhfMkJVKe4BANJR2AMAVEiz2YyHH364s/ex2dRRoPLyA1sifvPzpRVLkIKSngJ7+2iQV57v3gtOa5sR/+FTEf/hkybxYYUO3t+Ob33rW2vm5+dTRwEAqA2FPQBABSjqobeU85SGkp6Cevs6eu5YxKU+TvCubUbctC3if/jryPbafAJLpbgHAOgfhT0AQIkp6qG73j4v+ZUXIi6c7G+pBCu1vhWxeUQZSWHkU8MR+YmI35yOODedOs77bRiK+A+bI7JbrdKHa1DcAwD0nsIeAKCEFPWwem+vYy5qoQRXo6SnQPLJdkT+k4hXjpdzC8lbq/Szz/kzBVeguAcA6B2FPQBAiSjqYeXyA1tMzlNua5sRH7szsofOpk5CzeUHWxH5i/1fb99PG4Yibrot4n/4hCl8eIeD97fj3nvvXbOwUNE/+wAACSjsAQBKoNFoxOOPP66oh2V4u6A3PU+ZDTQibvm6kp6kvPAUi1stbrrdGn140+iOLfHoo48q7gEAukBhDwBQYI1GIx588MHOxNMvpY4ChZcfbEW8/I8KeqrhltGIm7crBknCC09LsLYZcdO2iOyzke2eTZ0GklHcAwCsnsIeAKCgxsfHO98/ZqISruTtM5PPPFXfiU+qZcNQxOavKP/oOwV9Fyjwqbkv37ouJiYmPGsGAFgBN1EAAAWza9euzo///Y3UMaCQ8gNbIn45G3FhLnUU6I61zYjPfDOyvX6m6R8bSfpAgU9NfeHj18fhw4c9cwYAWAY3TwAABTE0NNT52a9vSB0DCiWfGo54+ZgpeqploBGxaWdk+19LnYSayA+2IvIXI84dcy1NZX0r4qbbI7JbHXVBLXz6Ixdjenras2cAgCVw0wQAkFiz2YyHH364s/ex2dRRoBBMflJZm3ZF3PxF07b03NtHhrxyPOL1+dRxuJwNQxE33RbZAy+lTgI9c/D+dnzrW99aMz8/nzoKAEChKewBABJpNBrx4IMPdiae9qCWent7il6xRBVZeU8f5FPDEfmJiF/+0HW0jAYaERu2e6GHyhrdsSUeffTRNQsLNnwAAFyOwh4AIIHR0dHOMyesQqa+TNFTaVbe0wf5gS0Rr7zgOlpF1udTUV/bvjHGxsY8jwYAeA83SAAAfeSceurKemZqYX0r4jPfMCFLT7x9HT3zlHPo68ZxGlSM8+0BAN7NjREAQB84p566eXs98yvPR1ywCpwKG2hE3PL1yB46mzoJFZQ/stF1lHd7c/reNYcq+PAfTzvfHgAgFPYAAD136NAh59RTC9YzUysbhiI2f8XEK12VT7YjXv5RxLljpuhZGuvzKbnx3a3Yt2+f8+0BgFpT2AMA9MiuXbs6P/73N1LHgJ6xnpnaMU1PD5iip6s2DEXcdFtkD3hZlHJxvj0AUGduggAAuqzVanXOXroxdQzoCcUStWSani4yRU/fDDQiNu2MyD7r+kVpON8eAKgjNz8AAF3SaDRi//79nbFJRSbVkR9sReQvRpw5nDoK9JdperooP9iKOD3lZSfSWt+K2DwS2V4/hxTbD8aH42//9m+dbw8A1IbCHgCgC8bHxzvfP6bUofzyqeGIl49FvHI84vX51HGg/0zT0wX51HBEfiLilz90LaWY1jYjPnanl5IotNEdW+LRRx91vj0AUHkKewCAVRgaGur87Nc3pI4Bq5If2BLxygsR56ZTR4E03lwbne1/LXUSSsyqe0pLeU/BffnWdTExMeE5NgBQWW50AABWoNlsxt/93d91vjp2NHUUWLZf/WA4PnDe5CfE2mbE3zxsmp4Vyw+2Il7+Ry88UR1eYKLANg6cj7m5Oc+zAYDKcYMDALAMjUYjHnzwwc7E0y+ljgLLlu9bF3HmKZOfcMuoMooVyw9sifjlrPPoqT6T9xTQwfvbce+991qTDwBUisIeAGCJnFNPGeWPbDRJDxGLU6NbH4zsAS9csXyupdSe8p6CGd2xJfbs2ePZNgBQCW5qAACuwTn1lE1+sBVxesr0J0RErG9FfOYb1t6zLPnUcMTLx2wlgctZ34rYPBLZXvcZpPfpj1yM6elpz7gBgFJzMwMAcAWtVqtz9tKNqWPAkvzqB8PxgX99KuLM4dRRoBisvWeZlPSwAhuGIjZ/xUtRJPfhP55eMz8/nzoGAMCKKOwBAN6j2WzGww8/3Nn72GzqKHBN+SMbI079vXIJIqy9Z9mU9NBFm3ZFbN4Z2cjR1EmoqdEdW+LRRx91vj0AUDoKewCANzUajdi/f39nbNJ6T4rNynt4j7XNiL952IQnS6Kkhx4baERs2mnLCcl8bfvGGBsb89wbACgNNy4AABFx6NChzsTTJjIpvnyyHTE7mDoGFMOmXZF9+43UKSgBJT0ksrYZ0bzb5hOS+PKt62JiYsLzbwCg8NywAAC1tmvXrs6P/13ZQ7ko7ak1k5sskZIeCmZ9K+Iz37ANhb779EcuxvT0tOfgAEBhuVEBAGqp2WzG7z64uZM6B6xUvm9dxKmJ1DGgf5xPzxIo6aEknHdPn/1gfDj+9m//ds38/HzqKAAA76OwBwBqxTn1VInSnlpwPj1LkO9bp6SHMrI1hT4b3bElHn300TULCz4vAIDiUNgDALUxOjraeeaEh4FUS373+YgLXkChgjYMRfbEDalTUGD5IxsjfvnDiNfnU0cBumFtM+Jjd0b20NnUSaiBL3z8+jh8+LBn4wBAIbgpAQAqz/p7qk5pT6XcMmrSkivKD2yJmD+ipIeqW9+K2DwS2V73N/TWh/942pp8ACA5hT0AUGmHDh3qTDztvGOqT2lPqVmJzFXkB1sRp6dc46CulPf0mDX5AEBqCnsAoJKGhoY6P/u1VcrUSz543PnNlMtAI2Lrg5E94MUq3i2fbEe8/KOIM4dTRwGKRHlPD336Ixdjenra83IAoO/cgAAAldJoNGL//v2dsUkP8agnpT2lsLYZ8ZlvKlx4l3xqOOLlYxFnnnIdA65t066Im78Y2e7Z1EmokIP3t+Pee+81bQ8A9JXCHgCojF27dnV+/O9vpI5BDb38vwzHwMWFyPY8lzpKRCjtKbC1zYi/eVi5wrvkj2yM+OUPnUsPrIxjVeiBL3z8+jh8+LBn5wBAX7jpAABKr9FoxNGjRztfHTuaOgo1896SKTs2kjbQOyjtKZT1rYjPfENRz9ucSw/0hA0udNmH/3h6zfz8fOoYAEDFKewBgFIzVU+/5ZPtiJ9+9/Il09pmZE9u7numK1Hak9yGocieuCF1CgoinxqOOP2Uc+mB/ti0K2LzzshGvNTL6nxt+8YYGxvzHB0A6Bk3GgBAKZmqp9/yfesiTk1c+x+8/VBkD7zU+0BLpLQnCUU975A/sjHi1N+7FgFpmLqnS0zbAwC9orAHAErHVD39kh/YEjF/ZNnnKhdpNX6E0p4+UtTzpqtuIwFI5ZZRZ92zKqbtAYBecHMBAJSGqXr64eX/ZTgGfrHKlc3rW5EdubF7obpAaU9PKUB405K3kQCktL4V8ZlvRLZ7NnUSSsq0PQDQTQp7AKAUTNXTa/nBVsRPv7PsaforKthq/AilPT2gqCd6cP0E6JeBRsTWBwt3z0Y5fOHj18fhw4c9XwcAVs0NBQBQaI1GIx5//PHO3sdmU0ehovJ96yLOPNWTIrtoq/EjIvK7TivVWD1Ffe3lU8MRp1e5jQSgSHy2sQI/GB+O4eHhNQsLXooFAFZOYQ8AFNbQ0FDnZ792FjK9kd9zMeLcdG9/kwKuxo+IyO8+71xpVkaZUXv5gS0R80e8+ANU14ahiM1fsS6fZfn0Ry7G9PS0Z+0AwIq4iQAACmlqaqozNqlQpLt+9b12fOB//25/y+oCrsaPUNqzTIr6WjNND9TS2mbEZ74Z2V73SyzN+O5W7Nu3z7Q9ALBsCnsAoFBarVbn7KXiTSRTbr/6Xjs+8OK3kk2EFnE1foTSniVQ1NeaaXqAcM49y7Zx4HzMzc157g4ALJkbBwCgMA4dOtSZeNqDMLonP7Al4uSjPTmfflnWNiN7cnPaDFeQ71sXcWoidQyKRlFfW6bpAa7C5yNLNLpjS+zZs8ezdwBgSdw0AADJNZvN+N0HN3dS56A68n3rIs48lb6of6cCP+BV2vO2Av+c0lum6QGWYcNQZE/ckDoFJfDhP55eMz8/nzoGAFBwCnsAIKnR0dHOMyeUQ3RH4YvnHc9FNnI0dYrLyg+2Ip4t5up++kDxUFuFv24CFNn6VsRnvhHZ7tnUSSiwL3z8+jh8+LDn8ADAFblRAACSaDQacfTo0c5Xx4pZXlIu+T0XI85Np45xbQONyGa2pU5xRflkO2J2MHUM+klRX0v5wVbET79jmh6gW9Y2I/7mYcU9V3Tw/nbce++9axYWCrQBDAAoDIU9ANB3Q0NDnZ/9WkHE6vzqe+34wP/+3YgLc6mjLM/6VmRHbkyd4qrywePFOk6A7lPU15JpeoAeG2hEbH0wsgdeSp2Egto4cD7m5uY8kwcA3sXNAQDQN41GI/bv398ZmyxZwUqh/Op77fjAi98q92To1vHIHjqbOsVV5XedLve/Yy5vbTOyJzenTkEf5ZPtiJ+W8OUmgLK7ZTSy/Y7+4v1Gd2yJPXv2eC4PALzNjQEA0BetVqtz9lKxp4optvzAloiTj1Zn8rvA59m/Jb/7vJKvKqzqrZ3KXTMBykpxzxV8+I+n18zPz6eOAQAUgMIeAOi5Q4cOdSaethaSlcn3rYs481T1SqeCn2f/Fiu0S26gEXHH44r6GvFnFqCgNgxFfOb/UfgXNumvL3z8+jh8+LBn9ABQc24GAICeMVXPatSidCrBefYRb07qPr8ndQyWwxm6tWLtPUCJ2HrDexy8vx333nvvmoWFir2gDAAsmcIeAOiJ8fHxzvePFfuMboopv+dixLnp1DH6pyRrUvPJdsSz91Zv00EVbR2P7CHX3zqw9h6gxAYaEbd83Wc2b9s4cD7m5uY8rweAGnIDAAB0VbPZjN99cHMndQ7K5Vffa8cH/vUf6lXUv9MdU5HtLcdkbD54XDlYVCV5+YPVq8UGEoA62bQrsm+/kToFBfC17RtjbGzMM3sAqBkf/gBA14yOjnaeOaEsYul+9b12fODFb0W8Pp86SnLZsZHUEZYsv/u81dtFsmEosiduSJ2CHssn2xGna/xiE0AdWJfPm/6UH7ciHwBqRGEPAKxao9GIo0ePdr46djR1FErCGufLGGhENrMtdYolM+FbAOtbkR25MXUKeiyfbEf8kxebAGplbTOieXdkD7yUOgkJfeHj18fhw4c9vweAGvCBDwCsyq5duzo//nfrG1ma/JGNEaf+XlF/JSUrYPPJdsTsYOoY9WP6rha82ARADDQitj6ouK+x8d2t2Ldvn2l7AKg4hT0AsCKNRiP279/fGZu0FptrM429DCU8w9S59n3ioX0tuF4C8D4DjYhNOyPb7/ixuto4cD7m5uY8yweAivIhDwAsW6vV6py9VJ4pYNLJ77novOWV2Doe2UNnU6dYFufa99gtox7SV5zrJQBL4p6gtkZ3bIk9e/Z4ng8AFeQDHgBYlkOHDnUmnjbdyZX98v/Zjv/uF/+geFqt9kzpVp7nj2yMODmWOka1bBiK7IkbUqegR/LJdsRPv+tlFwCWT3FfWx/+4+k18/PzqWMAAF2ksAcAlqTZbMbvPri5kzoHxfWr77XjAy9+K+L1+dRRKiM7NpI6wrLlk+2IZ++1In+11rciO2KTSVXlk+2If3K9BKALFPe19IWPXx+HDx/2bB8AKsKHOgBwTaOjo51nTngIxOUp6ntooBHZzLbUKVbEivwVGmhE3PF46bYrsDT5gS0RJx/1QgsA3TXQiNj6YGQP2IRWJ+O7WzEyMuL5PgBUgA90AOCKGo1GHD16tPPVsaOpo1BAivo+KfGkdb5vXcSpidQxyuP2Qx60V1S+b13EmacU9QD0luK+lqzIB4DyU9gDAJfVarU6Zy+VsySktxT1CZS5tD/Yini2fKv9+2rTrsi+/UbqFPSAl1YASGKgEfGf9ke217ajurAiHwDKzYc4APA+4+Pjne8fO5s6BgWU33VaUZ9Kyc8n9bNzGSV+EYOry++5GHFuOnUMAOpubTPibx521E5NWJEPAOXlAxwAeFuj0Yjrsm2d1DkoHuVTQZS9tDdtvMjUW2W5VgJQSF4SrBUr8gGgfBT2AEBERAwNDXV+9usbUsegYPL7ro84czh1DN6p5Oec55PtiGfvre9Z3lvHI3vIBpMqySfbET/9bsQFL2AAUHAbhiJ7wne+OrAiHwDKxYc2ABCHDh3qTDxd3gKQ7ssf2Rhxcix1DK6kPVP61ab53efrVXB6QF45+WQ74p++5agHAMqn5FubWBor8gGgPHxgA0CNWYHPe/0f//OW+G9+9mh9p5/LpAqlfR1eDFnbjPjPfxfZyNHUSegSRT0AlTDQiNj6YKk3N7E0f8qPr1lY8P0OAIpMYQ8ANdVqtTpnLznHkEUv/y/DMfDc3yqgSiY7NpI6wqrlU8MRs8PVe0nEQ/DKUdQDUEkDjYg7Hi/9i6Bc3ac/cjGmp6d1AQBQUD6kAaCGRkdHO8+csAKRRfk9FyPOTaeOwUoMNCKb2ZY6RVdU6udw067Ivv1G6hR0SX5gS8RJm0cAqLi1zcie3Jw6BT30te0bY2xsTB8AAAXkAxoAamZmZqaz97HZ1DEogHzfuohTE6ljsFpVKu0PtiL+677yFqMedFeKoh6AWtowFNkTN6ROQY/8YHw4hoeHrcgHgIJR2ANATTivnrec/U4rrn+hxKUo71eh0j4iIr/7fMSFudQxls76+0pR1ANARNwyGtl+W9mqauPA+Zibm9MNAEBB+FAGgBpwXj1vye867fzlqqpaaX9gS8Tze1LHuDbr7ytDUQ8A7+GlxEr7wsevj8OHD+sHAKAAfCADQMU5r56IiPy+6yPOHE4dg16rWGkfUeCXTKy/rwxFPQBcw9pmxH/+u8hGjqZOQpeN7tgSe/bs0REAQGI+jAGgwqampjpjkyVaK03XlWZKme5Z34rsSLU2auSPbIw4OZY6xp/dfsikWQUo6gFgmZxvX0nOtQeA9BT2AFBBjUYjjh492vnqmAmIuvrV99rxgR/fq4iqqwqW9hER+eDxtD/THlJXgqIeAFbJ+faV5Fx7AEjHBzAAVEyj0Yjrsm2d1DlIJ7/nYsS56dQxSK2qpX2K4x0GGhHto9bAllw+2Y74p28V84gFACgb59tXknPtASANH74AUCGtVqtz9lL1CjqWJt+3LuLUROoYFElVS/up4YjZ4f5MSG8dj+yhs73/fegZRT0A9NDaZsTfPBzZ7tnUSegS59oDQP/54AWAilDW15f1zlxVRUv7iB5P21f431tdKOoBoI/cO1XKwfvbce+99zrXHgD6RGEPABUwOjraeeaEMwTr5lffa8cHXlRGsQQVfoDa9Wn7gUbEf9of2d657vx69J2iHgAS2jAU2RM3pE5Bl/wpP660B4A+UNgDQMmNj493vn/Muua6ye8+H3FBocgyVLi0j+jStP2mXZF9+43uBKLv8qnhiP/yt4p6ACgCxX1lbBw4H3Nzc3oEAOghH7QAUGIzMzOdvY/Npo5BH+X3XIw4N506BmVV8dI+IiK/6/TyC9u1zcie3NyTPPSHayMAFNQto5Httw2u7L5867qYmJjQJQBAj/iQBYASajQacV22rZM6B/2T71sXcWoidQyqYKAR2cy21Cl6Kn9kY8TJsaX9w1vHI3vIlpKyUtQDQAkMNCK2PhjZAy+lTsIqjO7YEnv27NEnAEAP+IAFgJJpNpvxuw9uVtbXxLKKR1iqGpT2EdeYtq/BtoEq8xITAJTQ2mbE3zwc2e7Z1ElYoYP3t+Pee+91rj0AdJnCHgBKpNVqdc5eUjDVwf/xP2+J/+Znj0Zc8iCEHqlLaX9gS8Tze979F28/ZMKrpC773xMAKBfn25fen/LjSnsA6CKFPQCUxOjoaOeZE87+q7pf/WA4PvD//tvln8ENK1GT0j7izdXpl35nqr6k8gNbIk56iQkAKsXRRKW2ceB8zM3N6RcAoAt8oAJACUxNTXXGJudSx6DHnMVMEgONiDset5qUQson2xHP3quoB4Cqci9aal/4+PVx+PBhHQMArJIPUwAosEajEUePHu18dexo6ij0kBXPFEJ7xoNSCiOfbEf807dsGwGAurAmv7S+fOu6mJiY0DMAwCr4IAWAgnJeffVZf0/hKO0pANtGAKDGbj8U2QMvpU7BMh28vx2Dg4O6BgBYIR+iAFBAQ0NDnZ/92nRBlSmkKKxbRiPb/1rqFNSQ6yIAEBERa5uRPbk5dQqW6eD97bj33nvXLCw4yggAlkthDwAFMz4+3vn+sbOpY9Aj+cFWxH/d5zxmik1pTx/l+9ZFnJpIHQMAKJqt45E95Ltx2fwpP660B4BlUtgDQIHMzMx09j42mzoGPZLffT7iwlzqGLA0m3ZF9u03UqegwvIDWyJOPuoFJgDgygYaEe2jkY0cTZ2EZdg4cD7m5uZ0DwCwRD40AaAAGo1GXJdt66TOQW/kB7ZEPL8ndQxYvvWtyI7cmDoFFZNPtiP+6VsRr8+njgIAlIWXSUtHaQ8AS+cDEwASa7VanbOXFGJVZaqe0lPa00XOqQcAVsy0fel8+dZ1MTExoYMAgGvwYQkACY2OjnaeOeGc6CoyVU+lDDQim9mWOgUl5px6AKBrTNuXitIeAK7NByUAJHLo0KHOxNMvpY5BD5iqp5IGGhF3PB7Z7tnUSSgRLy8BAD1h2r5Uxne3YmRkRBcBAFfgQxIA+qzRaMTjjz/e2fvYbOoodJliilpozyjtuaZ8sh3x7L0RlxZSRwEAqsy0fWkcvL8dg4OD+ggAuAwfkADQR41GI67LtnVS56D7TNVTK7eMRrbfcR5cnushANBXpu1L4wfjwzE8PLxmYcFLnQDwTgp7AOiTVqvVOXvpxtQx6DJT9dSWaSbeI7/v+ogzh1PHAADqyv1pafwpP660B4B3UNgDQB/s2rWr8+N/9+CgavJ7Lkacm04dA9JZ34rsiBeR6s6LSwBAYZi2Lw2lPQD8mcIeAHpsdHS088wJq6Or5Ox3WnH9C/uczQwREQONyGa2pU5BAvlkO+KfvhXx+nzqKAAA72bavhQ2DpyPubk5HQUAtefDEAB6aGZmprP3sdnUMegiK5/hMgYaEXc8Htnu2dRJ6BMbRgCAwvNiaSko7QFAYQ8APdFoNOLxxx9X1lfIr34wHB/434ZN1cPV3DEV2d651CnoofyRjREnx1LHAABYuq3jkT10NnUKrkJpD0Dd+RAEgC5rNBpxXbatkzoH3ZVPtiNmB1PHgOK7ZTSy/Y4BqZp8sh3x7L1eWgIAymltM7InN6dOwVV8+dZ1MTExoa8AoJZ8AAJAFynrqy2fGo6YNWUP17S+FdmRG1OnoEusvwcAKsO0faEp7QGoKx9+ANAlrVarc/aSgqoO8sHjSnu4FmeGll6+b13EqYnUMQAAusu0faEp7QGoIx98ANAFyvr6ye8+H3HBWd1wVQONiDsej2z3bOokLEN+sBXxX/d5MQkAqLbbD0X2wEupU3AZ47tbMTIyorsAoDZ86AHAKinr6yu/7/qIM4dTx4Dis3q0NPK7Tke8Pp86BgBAfzjKqbAO3t+OwcFB/QUAteADDwBWQVmPldGwBB6EFp4XkACAWjNtX0hKewDqwocdAKzQ6Oho55kTr6WOQQHkk+2I2cHUMaCYTNcXmvX3AABv8pJpISntAagDH3QAsALKet4rnxqOmB1WesFbBhqRzWxLnYKryO8+H3FhLnUMAIBiMW1fOEp7AKrOhxwALNOuXbs6P/73N1LHoKDyweNKe9i0K7Jvu04WVf7IxoiTY6ljAAAUl2n7QvpTfnzNwoLv2wBUj8IeAJbBmfXll993fcTv/789ffhiapVau2Mqsr1+/osonxqO+C9/G/H6fOooAADlYNq+cJT2AFSRwh4AlkhZX375Xaf/XFT1eGIiv+/6iDOHe/brQ+GYQiq0/J6LEeemU8cAACgf97mFo7QHoGoU9gCwBMr6crvi+udbRiPb/1rvft996yJOTfTs14fC2Doe2UNnU6fgMvIDWyJOPuqoDgCA1RhoRPyn/TZJFYjSHoAq+YvUAQCg6JT15Zbfff7KZzWfmlgss3ok2/9axB1TPfv1IbmBRsSO55T1RfahGyM2bE+dAgCg3C4tRDw7srhJjUK4LtvWaTQaqWMAQFeYsAeAq1DWl1d+YEvE83uW9g+3ZyLbPdu7LJPtiGfvNeFKtWwYiuyJG1KnYBnyqeGIl49FnHnK9QgAYKUGGpHNbEudgjeZtAegChT2AHAFyvryWslZzdmxkR6l+bN88LiSjGq4/VBkD7yUOgWrlD+yMeKXP4x4fT51FACA8nEsVGEo7QEoO4U9AFyGsr6cfvWD4fjA/za8slK8T1MS+d3nIy4495CSMk1UWfnBVsTL/7jsl50AAGptfSuyI54dFIHSHoAyU9gDwHso68sp37cu4tTE6n6RPj1sUdpTSlbg18bbq/NfOW76HgDgWgYaEXc83tNj1lgapT0AZaWwB4B3UNaXU37X6e6VSv0q7bvxggH0ixX4tZYfbEXkL0acOZw6CgBAcd0yGtn+11KnqD2lPQBlpLAHgDc1Go24LtvWSZ2DpcsPtiKe7cHZ83160JIf2BLx/J6e/z6wYlbgcxn5IxsjXnnephAAgPeyIr8QlPYAlI3CHgBCWV9G+T0Xe3vWcp8mivPJdsTsYM9/H1g2K/BZgnyyHZH/xPp8AIB3umMqsr1ebkxJaQ9AmSjsAag9ZX355IPHIy714Yt3e6Zv5xD27f8mWAor8FmhfLId8fKPIs4dc00DAOpt067Ivv1G6hS1prQHoCwU9gDUmrK+XHq2Av8qsmP9+/2U9iRnBT5dlh9sReQvKvABgHpa24zsyc2pU9Sa0h6AMlDYA1Bbyvpyye+7PuLM4f7/xn0uMPO7zzsXmjSct0kfKPABgFrq4/Y23k9pD0DRKewBqCVlfbkkL7H7XGQmezmB+to6HtlDZ1OnoIYU+ABAbdwyGtn+11KnqC2lPQBFprAHoHaU9eXxq++14wM/vrcYJU6/S/t96yJOTfTt96OmBhoR7aORjRxNnQQiIiKfbEfkP4l45XjE6/Op4wAAdJetVkkp7QEoKoU9ALWirC+P/JGNESfHUsd4tz5PROQHWxHPjvTt96NmPCykBPLJdsRv/y3ilecdFwIAVIOXZpNS2gNQRAp7AGpDWV8ehV4Jf/uhyB54qW+/XT7Zjpgd7NvvR01YgU9J5VPDEb/9RcQrL0Scm04dBwBg5dyTJ6O0B6BoFPYA1IKyvjySn1e/FO2ZyHbP9vW3zAePF+NoAMrNNA8VlB9sReQvRpw75joJAJTLhqHInrghdYpaUtoDUCQKewAqT1lfHmUqpbNj/V9Vn9912pnOrJwV+NSENfoAQKkMNCKb2ZY6RS0p7QEoCoU9AJWmrC+HfLId8ey9pSnrIyLZQ5VSbCCgeDbtiuzbb6ROAcnkB7YsrtG/cLJcnzUAQH0k2ORGxKsnpnQkACTnwwiAylLWl0Opz2hf24zsyc19/23zfesiTk30/felpG4/FNkDL6VOAYWST7Yj8p9E/OZfvAQFABTHLaOR7X8tdYpaOXh/OwYHB/UkACTlgwiASlLWl0MliudEa8Yr8e+O3nJePSxLfmBLxG9+HnHumCl8ACAdR1n1ndIegNR8CAFQOcr6cqhU4Zxo3XiptxPQWx7ywarlk+2I3/5bxCvPm8IHAPrLufZ9p7QHICUfQABUzkdvHVHWF1wlz2FPtLown2xHPHuvaVD+zHn10DP5wVZE/mLEb/454vX51HEAgKpzrn1fKe0BSMWHDwCVMjMz09n72GzqGFxFJcv6tyR8mJIPHlfa47x66LN8ajjit7+IeOWFiHPTqeMAAFW0dTyyh86mTlEbozu2xJ49e/QmAPSVDx4AKkNZX3y1KJVTlvZVfhmCq3NePRRGPtmOyH8S8Zt/cU0GALpjw1BkT9yQOkVtfPnWdTExMaE7AaBvfOgAUAnK+mKr1Vnric8aVNrXkPPqofDyA1sifvNzq/QBgJVz399XSnsA+skHDgClp6wvtvyRjREnx1LH6K/Upf2+dRGnJpL9/vSR8+qhlPKp4Yj8RMRvTlulDwAsXeLvmnWjtAegX3zYAFBqyvpiy++7PuLM4dQx0kg8/VDLFyXqxnn1UCn5wVbEb//VKn0A4NoSHsVWN5/+yMWYnp7WowDQUz5oACgtZX2xWc0e6Uv7Oh1FUCemaqA2rNIHAK7oltHI9r+WOkUtbBw4H3Nzc7oUAHrGhwwApTQ+Pt75/rGzqWNwBfng8YhLC6ljFEPihyj51HDE7LD/HlXh3MpCyCfbJppIIp8ajvjtLyJeecEqfQDAEVl9pLQHoJd8wABQOqOjo51nTniLvIjyg62IZ0dSxyiereORPZT2BRMvUVSAh3HJ5Qe2RDy/Z/H/s7YZ8TcPK+5JLp9sR+Q/sUofAOrKS7198+E/nl4zPz+fOgYAFaSwB6BUlPXFle9bF3FqInWM4irAGYOOKSgx59Und8U/PxuGInvihv4Hgqt4e5X+uWNe1gKAOnBsVt/8KT++ZmHB/RUA3aWwB6A0lPXFpQheoh3PRTZyNGkE/61KqAAve9RZPtmOePbea5eeinsKLJ8ajshPRPzmtFX6AFBVA42IOx733aEPlPYAdJvCHoBSGBoa6vzs14qQIrJqfRkKMvVgG0JJFOTnpc7y+66POHN4ef8jxT0lkR9sRfz2XyNeOR7x+nzqOABAt9wxFdleL2n32qsnpnQrAHSNDxUACq/VanXOXnIeW9Hkk+2I2cHUMcqnICWs0r7gnEOZXH7X6dWVmOtbEZ/5hgknSiOfGo747S8iXnkh4sJJL+MBQJndMhrZfhsKe+ng/e0YHBzUrwDQFT5QACg0ZX0x5Y9sjDg5ljpGeRWkjPXSRUFt2hXZt99InaK28gNbIp7f071fcG0z4m8eVtxTSvlkOyL/ScRv/sVxKgBQNr5X9Nz47laMjIzoWABYNR8mABRWs9mM331wcyd1Dt4tv+ei82+7oUil/VLO56Y/to5H9tDZ1ClqK7/7fO9KybXNiM9803pSSi8/sMUUPgCURUG+d1bZl29dFxMTE3oWAFbFBwkAhdRoNOK6bJuyvmB6WmbVUYHWFOaDxxUvqbVnTGEn0tcXVwYaEVsfjOyBl3r/e0Ef5JPtiN/+W8Qrz7tHAIAiUtr33Kc/cjGmp6d1LQCsmA8RAArpueee63x17GjqGLyDQrdHbj9UmOLOCxmJDDQim9mWOkVt5fvWRZyaSPObF+ilHegmU/gAUDC+c/TcxoHzMTc3p28BYEV8gABQOIcOHepMPF2MAhPnnPdFgSarlfZ9Ztolqfyu0xGvz6eOEbFhKGLzVwpzHYBuyyfbEflPIn7zLz5jACCVgUbEHY+75+yhP+XH1ywseFkRgOVT2ANQKLt27er8+N/fSB2DN+UHtkQ8vyd1jFrIjo2kjvC2/L7rI84cTh2j+jYMRfbEDalT1FJ+sBXxbHH+zL3NOffURD41HPHbXyxO4Z+bTh0HAOqlQC+MV5HSHoCVUNgDUBitVqtz9pJJ06JIuia6jgq2otB//x6zCj2Z0ryQ4meEmskPtiLyFyN+88/F2HwBAFVWoKPZqubg/e0YHBzUuwCwLD44ACiERqMR12XbOqlzsCi/56KJtxSKVtoXdQq57Ey0JFOYFfjLsb4V8Zlv+JmhdvLJdsRv/y3ileet0QeAXvCCaM+M7tgSe/bs0b0AsGQ+NAAohOeee67z1bGjqWMQzjBPrmBnmueT7YjZwdQxqqFgL2TUSSVePhloRNzy9cgeOps6CSSTH9hijT4AdJPSvme+8PHr4/Dhw/oXAJbEBwYAyY2Pj3e+f0wBUQTK+oIo4Nnm+eDxiEvO4Vuxgr2IUSelWYG/HBuGIjZ/xdQ9tff2Gv1zx3xGAcBK+a7SMxsHzsfc3JwOBoBr8mEBQFJDQ0Odn/26WMVkXSlkC6aAkw5+RlbIA7BkSrkCfzkGGhGbdhbuWgGp5JPtiPwnEa8cr/affQDoNt9ZeuZP+fE1Cwu+RwNwdQp7AJJpNpvxuw9udm59AShiC+qOqcj2FmvjgS0My1TAFy/qoBIr8JdrfSti80jhrhmQUj41HJGfiHjleZ9dAHAtSvueefXElB4GgKvyQQFAEo1GI67LtinrC0BZX3DtmcKtvVbaL5GyPolKrsBfrk27IjbvjGzkaOokUCgKfAC4hoFGZDPbUqeonPHdrRgZGdHFAHBFPiQASGJmZqaz97HZ1DFqT1lfDtmx4k0K5/vWRZyaSB2juAr4okUdVH4F/nINNCJu+XpkD51NnQQKKz+wJeKVFyLOTaeOAgDFoLTviS/fui4mJib0MQBclg8IAPpufHy88/1jyoPUlPUlUtAHJkr7yxhoRNzxuLK+z/IDWyKe35M6RrFZmQ9LosAHgCjsd9Cy2zhwPubm5nQyALyPDwcA+mpoaKjzs1/fkDpG7SnrS6igD0zyyXbE7GDqGMVQ0P9GVWcF/gps2hVx8xe9WAJLoMAHoNZsDuu6P+XH1ywseB4DwLsp7AHoG+fWF4OyvsTWtyI7cmPqFO+jtI+Itc3IntycOkXtWIHfBbeMRty83Xn3sEQKfABqR2nfda+emNLLAPAuPhgA6JuP3jqirE9MWV8BG4Yie6KYWypq+/NV0BcpqiyfbEc8e289f956ZaARsWmn8h6WSYEPQC0o7btqfHcrRkZGdDMAvM2HAgB9MTMz09n72GzqGLWW330+4oKziyvhltHI9r+WOsVl1W7iedOuyL79RuoUtZLvWxdxaiJ1jGpT3sOK5FPDEfmJiFeed88FQPUo7bvqCx+/Pg4fPqyfASAiFPYA9MHo6GjnmRPFLBfrQllfQbcfiuyBl1KnuKza/LwV+MWJqqrNz1aRKO9hxRT4AFROgb+HltHGgfMxNzenowFAYQ9Ab7Varc7ZS1ZFp6TgqrACTzjk91ys9npgD6r6rrZHLhSJ8h5WJZ9sR+Q/iXjleL220QBQLV5c7qo/5cfXLCz4ngNQdwp7AHqm0WjEddk259YnpKyvvuzYSOoIV1TZ1eUFflGiivKDrYhni/tzXlvKe1i1/GArIn8x4twxLyQBUC5K+645eH87BgcH9TQANeeDAICe+eitI8r6hJT1NTHQiGxmW+oUV5Q/sjHi5FjqGN0x0IhoH1VO9lF+3/URZw6njsG1KO+hK/IDWyJeeaHaG2oAqA6lfdd8bfvGGBsb09UA1JgPAQB6YmZmprP3sdnUMWpLWV8zRS/tJ9sRs4OpY6xOwf8dV5HrWEkNNCI2bI+4+Ys2UcAq5FPDEfmJiFeedy0EoLiU9l3jPHuAevMBAEDXjY6Odp454QtbKkqumlrfiuzIjalTXFE+2Y549t5yrvwt+L/bqin1zwrvt2mX8h66IJ9sR+Q/iTjzlOsjAMWitO8a59kD1JfCHoCuarVanbOXFFupKOtrrgTFcj54vFxFQwn+nVZJpY5Q4P3WtyI2j0S21+cUrFZ+sBXx8j9anw9AMSjtu+bVE1M6G4AacvEHoGsajUZcl21zbn0iynoiohQPSvK7Tke8Pp86xrUp6/sqv+ei4qlO1jYjPnZnZA+dTZ0ESu/t9fm//GE5Pl8BqKYSfBctg9EdW2LPnj16G4CaceEHoGs+euuIsj4RZT3vUoIHJYX/mS3Bv8MqKd3mBbproBGxaWfEzdsjGzmaOg2UXn6wFZG/GHHumGsrAP3le1RXfPojF2N6elp3A1AjLvoAdMXU1FRnbLLA5VuFFb74JI32TOHPjC7sRLWHTH2TT7YjZgdTx6BoNu2KyD5ndT50Sf7IxohXnne/CEB/+D7VFc6zB6gXhT0AqzY6Otp55oQvYyko67mqMpT2+9ZFnJpIHePPPFzqG+fVsyTrWxE33W51PnRJPtmOePlHpu8B6K1NuyL79hupU5Se8+wB6sMFH4BVabVanbOXnPGcgrKeaxpoRDazLXWKaypMaX/HlInePinsdgWK7a3V+dlnC/8yEpRBPjUckZ+I+OUPI16fTx0HgKpZ34rsiOdFqzG+uxUjIyM6HIAacLEHYMUajUZcl21zbn0CynqWrCylferV6CXYRlAV+V2nFUN0x/pWxOYRL9pAl+QHWxH5ixFnDqeOAkBVbBiK7IkbUqcotS98/Po4fPiwHgeg4lzoAVix5557rvPVsaOpY9SOsp5lW9uM7MnNqVNcU7LSXlnfF/nUcMTssBXM9MbaZsRN2yJu3h7ZiHsTWK18ajji5WMRZ55y3QZgdRw7tmof/uPpNfPz86ljANBDCnsAVuTQoUOdiadfSh2jdpT1rFiJ1hHmg8f7Uw4MNCLaR5V7fZAf2BLx/J7UMaiTDUMRN3/J9D10SX5gS8QvZ92HArAySvtV+1N+fM3CgpfoAKpKYQ/Asu3atavz439/I3WM2nHmM6tWonWEPS/tS3JUQBXk+9ZFnJpIHYM6M30PXWV1PgArorRflYP3t2NwcFCfA1BRLvAALEur1eqcvVSOKd0qUXjRNSV6SNKzjRLK+r6xFYRCMn0PXWN1PgDLUqLvo0X05VvXxcTEhE4HoIJc3AFYskajEddl2zqpc9SNsp6u2zoe2UNnU6dYkq4XvmubkT25uXu/HlfUt6MNYDXemr7PPhvZ7tnUaaD08kc2RvzyhxGvz6eOAkBRKe1XZePA+Zibm9PrAFSMCzsAS/bcc891vjpmlWw/KevpmfZMacqprv05WN+K7IgNIb2WT7YjZgdTx4CVWd+K+Fg7sgdeSp0ESi8/2Io4PWXTCgDvp7RfFefZA1SPwh6AJTl06FBn4mkPr/tJWU/P7XiuNOc5r/rPg7K+L1y3qJSBRsSG7RE3f7E0LzhBUTn3HoD3Udqv2A/Gh+Pzn/+8bgegQlzUAbimoaGhzs9+fUPqGLWi9KIvSnaWe36wFfHsyPL/hxuGInvCNazXnFdP5a1tRnzszojs1tK87ARFlE+2I17+kfIeAKX9Knxt+8YYGxvT7wBUhAs6AFfVbDbjdx/c7Nz6PlLW01dlK+2Xu27dA6C+yO867bxi6mfDUMTNX4psrxdVYKXyqeGIl49FnHkq4pLVvgC15DvbijnPHqA6XMwBuKJGoxHXZduU9X2krCeJkq2Lz6eGI2aHr/1g34Ofnssn2xHP3qtkgYFGxKadEdlnrc+HFVLeA9RYe8Y91Ao5zx6gGhT2AFzRzMxMZ+9js6lj1IaynqRKVtpHROSDx6/8QF9Z33MrPqIA6mB9K+Km263PhxXKp4Yj8hMRv/yhDS4AdaG0X7FXT0zpeQBKzoUcgMsaHx/vfP/Y2dQxaiM/sCXi+T2pY1B3m3ZF9u03UqdYlsuuYlfW95wXjGCZrM+HVckf2ai8B6gDpf2KjO9uxcjIiK4HoMRcxAF4n1ar1Tl7qVyTtmW27DO5oZdKWHbnd5+PuPBmCVbC/GWT33Mx4tx06hhQXtbnw6oo7wEqbKAR2cy21ClK6Qsfvz4OHz6s7wEoKRdwAN7no7eOOLe+T5T1FNLthyJ74KXUKZYlv+dixF/epKzvsXe9HAF0x9pmxMfutD4fVkB5D1BBSvsV2zhwPubm5nQ+ACXk4g3Auxw6dKgz8XS5irqyUtZTaFYR8h754PGISwupY0D1bRiKuOm20r04Bakp7wEqRGm/Yn/Kj69ZWPC9DaBsFPYAvM0q/P5R1lMKO54z7cni9erZe5X1kMJAI2LD9ojsc5Httd0Clirfty7izFM+uwDKbH0rsiOeUS3XwfvbMTg4qPcBKBkXbgDeZhV+/5hUpRRMNdRefrAV8exI6hjAW9Y2I27aFnHzdi9UwRLkU8MRLx9T3gOU1YahyJ64IXWK0vna9o0xNjam+wEoERdtACLCKvx+UtZTKkr72sr3rYs4NZE6BnA161sRH2tbnw9L8HZ577MNoFxuGY1s/2upU5TOpz9yMaanp/U/ACXhgg2AVfh9lN99PuKClbaUjFWEtZPfczHi3HTqGMBybdplfT4sQT7Zjnj5RxFnDqeOAsBS3DHl/mYFXj0xpf8BKAkXbACswu+T/L7rPRSkvJT2teHFIqiIt9bnZ5+NbPds6jRQWPnBVsTpKZ99AEXXnnFPs0yjO7bEnj17dEAAJeBiDVBzVuH3R35gS8Tze1LHgNVxfmDlObIDKmx9K+Km2yOyWyMbOZo6DRRSfrAV8dPvRLw+nzoKAO/luLYV+fAfT6+Zn59PHQOAa1DYA9SYVfj9kU8NRzz9+dQxoDucH1hJ+WQ74tl7lfVQJxuGIm66LbIHvLgJl5M/sjHi1N/7bAQoEqX9sv1gfDg+//nP64EACs6FGqDGrMLvDxOrVM7W8cgeOps6BV2SH2xFPDuSOgaQ0kAjYsP2iJu/aNUsvEc+NRzx8rGIM0+5pwcoAse1LdsXPn59HD58WBcEUGAu0gA1NT4+3vn+MYVbrzkLmspyfmAl5PvWRZyaSB0DKJq1zYiP3Wl9PrxHPtmOePlHEWcOp44CUG82vy3bn/LjaxYWvHgGUFQKe4Aaajab8bsPbjZd32P5PRcjzk2njgG9o7QvNWU9sGTrWxEfa1ufD+/gvHuAxG4/5N5kGUZ3bIk9e/bogwAKygUaoIaswu+9/JGNESfHUseA3nJ+YGnZ/gGs2Fvr87PPRbbXdQQi3nwJzsp8gP7zEvmyfPiPp9fMz8+njgHAZSjsAWpm165dnR//+xupY1RaPtmOmB1MHQP6Q2lfOsp6oKvWNiNu2hZx83br86m9fGo44vRTVuYD9Ivvo8v26okpnRBAAbk4A9RIo9GI67Jtput7LB88brqGevGQpDRcn4Cesz4fIsLKfIC+WduM7MnNqVOUxpdvXRcTExN6IYCCcWEGqJGZmZnO3sdmU8eotPyu0x7KUU/rW5EduTF1Cq5CWQ/03Vvr82/+onW11JqV+QA95vvosvwpP75mYcFnEkCRKOwBamJoaKjzs1/fkDpGpeX3XIw4N506BqTjIUkhOaYDKIy1zYiP3RmR3Wp9PrWUT7YjTv+D7wwAvXDLaGT7X0udohQO3t+OwcFB3RBAgbgoA9TER28dsQq/h/JHNkacHEsdA9LzkKRQlPVAoW0Yirj5S5HtnUudBPouf2RjxC9/aDsXQDe1Z2z1WaJPf+RiTE9P64cACsIFGaAGDh061Jl42jmivaIQg/dQ2hdCvm9dxKmJ1DEAlmagEbFpZ0T2WQ/aqZV8ajji9FMRZw6njgJQCdmxkdQRSuPVE1P6IYCCcEEGqLhmsxm/++Bm0/U95FxouIw7pkxMJqSsB0pvfSviptsje+hs6iTQN/mBLRHzR0zdA6zGQCOymW2pU5TC6I4tsWfPHh0RQAG4GANUnFX4vZXfddoDNbgS6wiTyO8+H3HByxJAhQw0IjZsj7j5iz5XqAVT9wCrtL4V2ZEbU6cohQ//8fSa+fn51DEAak9hD1Bho6OjnWdOWEvdK/k9FyPOTaeOAcW247nIRo6mTlEbynqgFtY2Iz52Z0R2q88YKi8/2Ir46Xe8JAywXI5qWzKr8QHScyEGqKhGoxHXZdtM1/dI/sjGiJNjqWNA8VlH2DeO5wBqa9OuiOxzjmKh0kzdA6yAo9qW5Mu3rouJiQldEUBCLsIAFTU1NdUZm/SlpBfyyXbE7GDqGFAeSvueU9YDvMn0PTXgrHuApcuOjaSOUAp/yo+vWVjwnRIgFYU9QAUNDQ11fvbrG1LHqCzFGKyAMwR7Ip9sRzx7r2sSwJWYvqfCTN0DLIEXyJfk4P3tGBwc1BcBJOICDFBBH711xCr8HsnvOm2SBVbC+YFdZ9sHwDKZvqfC8kc2Rpz6ey/xAVyOF8iX5NMfuRjT09M6I4AEXHwBKubQoUOdiadfSh2jkvJ7Lkacm04dA8pHWd91ynqALjB9TwXlk+2I0//gewvAe23aFdm330idovCsxgdIQ2EPUCHNZjN+98HNput7IH9kY8TJsdQxoHyU9V2XH9gS8fye1DEAqsX0PRWU71sXceYpU/cAb7n9UGQPGHK5mtEdW2LPnj16I4A+c+EFqJDnnnuu89UxDxi7zSQrrJCyvuvyfesiTk2kjgFQbQONiA3bI27+YmS7Z1OngVXLD7YifvodR3sBRETseM7LedewceB8zM3N6Y4A+shFF6AihoaGOj/79Q2pY1RSPnjcVAosl7K+65T1AImsb0V8rG0ij9LLp4Yjfvo96/KBehtoRDazLXWKwnv1xJTuCKCPXHQBKqDRaMR12Tar8Hsgv+u0SRRYLmV91ynrAQpioBGxaWfEzdtN51Fq1uUDtba2GdmTm1OnKLSvbd8YY2Nj+iOAPnHBBaiAQ4cOdSaeNvHTbfk9F02fwHKtb0V25MbUKSrFtQigwDbtisg+F9neudRJYEWsywdqa8NQZE/YVHk1f8qPr1lY8GIXQD8o7AFKrtVqdc5eUo51W/7IxoiTY6ljQLko67suv/t8xAUlEEAprG9F3HR7ZA+dTZ0Els26fKCWbIe7qh+MD8fnP/95HRJAH7jYApTcR28dsQq/y/LJdsTsYOoYUC7K+q5T1gOUmNX5lJh1+UCttGci2z2bOkVhffojF2N6elqPBNBjLrQAJTY6Otp55oQ3gbstHzzu4RQsx0AjspltqVNUirIeoGKszqeE8gNbIuaPWJcPVF52bCR1hEJ79cSUHgmgx1xoAUqq0WjEddk20/Vdlt912gMpWA5lfdd5aQig4ta3Ij7WjuyBl1IngSXJJ9sRP/2ulwmB6vK99qpGd2yJPXv26JIAeshFFqCkZmZmOnsfm00do1Lyey46sxGWw0ONrlPWA9TM2mbEx+6MyG61Op9SyO+7PuLM4dQxALrPMW9X9eE/nl4zPz+fOgZAZSnsAUpoaGio87Nf35A6RqXkj2yMODmWOgaUh7K+65T1ADX31rn32WedpUvhOeceqKQNQ5E94XnblViND9A7LrAAJfTRW0eswu+ifLIdMTuYOgaUy47nTAJ2ST7Zjnj2Xg+8AXi3Tbsibv6i8p5Cyw9siTj5qPsYoDpuGY1s/2upUxTSFz5+fRw+fFinBNADLq4AJXPo0KHOxNPOu+wmU62wTO0Z5UGXeGEIgCVZ34rYPBLZXmeIU0z5ZDvin74V8fp86igAq+c77xX9KT++ZmHBMzSAblPYA5RIs9mM331ws+n6LsrvOu2hEiyHBxddo6wHYEXePPc+e+hs6iTwPvnUcMRPvxdxbjp1FICVcwTcFY3u2BJ79uzRKwF0mQsrQIlYhd9d+X3XR5w5nDoGlMcdUyb7usyGDwBWRXlPgfm+BZSa8+yv6MN/PL1mfn4+dQyASlHYA5TE6Oho55kTztDqlnxqOOLpz6eOAeXhHL+eUdoD0BUDjYhNOyNu3h7ZyNHUaeBt+b51EacmUscAWL4dz/lMvYJXT0zplgC6yEUVoAQajUZcl20zXd9FCjJYBmV9z+V3n4+4YHsBAF2ivKeA8kc2Rpz6e9/DgPKwGv+KvvDx6+Pw4cP6JYAucUEFKIGZmZnO3sdmU8eojPyei85UhKVS1veN0h6Antm0K+LmL0a2ezZ1Eoj8wJaIk48q7oFy8J34iv6UH1+zsOBaDtANCnuAghsaGur87NfOzOqW/GAr4tmR1DGgHNa3IjtyY+oUteKsVwB6TnlPQeQHtkTMH4l4fT51FICryo55jnQ5ozu2xJ49e3RMAF3gYgpQcB+9dcQq/C6yCh+WSFmfjHNeAegb5T0FkE+2I/7pW4p7oLjWNiN7cnPqFIX04T+eXjM/P586BkDp/UXqAABc2fj4uLK+i/J7LirrYSmU9Ull+1+L2DqeOgYAdXDmcMTsYOTbpyK/7/rF4hT6LNs9u1iEtWci1jZTxwF4v9fnI39kY+oUhfR3f/d3nl0CdIEJe4CCajQacV22zU1vl+R//3+N+H/dmToGFN9AI7KZbalTEG9Om80Opo4BQB2ZvCehfLIdcfofIs5Np44C8C5W41/epz9yMaanp3VNAKvgIgpQUFNTU52xybnUMSrDKnxYAmV94SjtAUhOeU9C+T0XFfdAcViNf0WvnpjSNQGsgosoQAE1m8343Qc3m67vkvx/WhPx8v+aOgYUnmmB4vLSEQCFoLwnEcU9UBi3H4rsgZdSpyicL9+6LiYmJvRNACvkAgpQQM8991znq2NHU8eojHz7VOoIUHztGQ/fC05pD0ChKO9JQHEPFIGX3S/vT/nxNQsLvrMCrITCHqBghoaGOj/79Q2pY1SGgguW4I6pyPY6gqMM8rvPR1zw3wqAgrllNOLm7ZGNeOmY/lDcA0mtb0V25MbUKQpndMeW2LNnj84JYAVcPAEK5qO3jliF3yX533024vj/PXUMKLZbRiPb/1rqFCyD0h6AwhpoRGzaqbynbxT3QDJW41+WKXuAlVHYAxSI6frusgofrmHTrsi+/UbqFKyA0h6AwnuzvPdiIP2guAdSsBr//Q7e347BwUG9E8AyuXACFIjp+u7J/6c1ES//r6ljQHFZ4Vd6+b51EacmUscAgGtb24z42J2RPXQ2dRIqTnEP9JXv1Zf14T+eXjM/P586BkCpKOwBCsJ0fXeZroer8FChMpT2AJTO2mbEZ74Z2V6bYugdxT3QN1bjv48pe4Dlc9EEKAjT9d3j4QxcxUAjspltqVPQRfmBLRHP70kdAwCWb30r4jPfiGz3bOokVJTvhkA/WI3/fhsHzsfc3Jz+CWCJXDABCsB0fXeZrocrUNZXVj7ZjpgdTB0DAFZu066Im7+ovKcn8rvPR1yw1QHoEVvsLuvVE1P6J4Al+ovUAQCIUNZ3T37X6dQRoLjueDx1Anok2z0b0Z6JGGikjgIAK3PmcMTsYOSDxyPfty7yqeHUiaiQ7MiNi/dKa5upowBVdGFucfMZ7zI0NGSbKMASecMJIDHT9d1jwhSuoj1jYq0m8sHjEZcWUscAgNVb24z42J2RPXQ2dRIqJJ9sR/zTtyJen08dBagYq/Hfz5Q9wNK4WAIk5uz67snvOu2hC1zOLaOR7X8tdQr6SGkPQOWsb0VsHolsr7XmdIfiHug6q/Hf59MfuRjT09N6KIBrcKEESMh0ffd0dbp+bTPiLzde+5+7cFIhRvEp62vLWa0AVJbz7umi/MCWiJOP+m4HdMfthyJ74KXUKQrFlD3AtblQAiRkur57ljRdP9CIWL814i9vivjLj0Z86MaePOTLD7Yi/s8/RPzm5xGXfh9xbrrrvwcsibf7a09pD0ClDTQiNu30ciJdobgHusVq/HfbOHA+5ubmdFEAV+EiCZCI6fruyQ+2Ip59z5ehtc2I//CpiP/wyUK92Zwf2BLx+1cjfvMvSjR6a20zsic3p05BAeT3XPTiEADVt7YZ0by7UPf+lFO+b13EqYnUMYAy8/L8uxy8vx2Dg4O6KICrcJEESGRmZqaz97HZ1DEqIR88HvHfrYu4aVtE9tnSrcbMD2yJeOUFhRrdM9CIbGZb6hQUiAfPANTKhqGIzV8p3fcCisX9E7AqVuO/y4f/eHrN/Px86hgAhaWwB0ig2WzG7z642Tp8Lis/sCXil7Mm8Fkx6/e4HA+dAagdK/PpAtuKgJXy3fzPTNkDXJ0LJEACputZqnyyHfHyjyLOHE4dhbJoz5gm44oue4QIANTB2mbEZ74Z2V4vxbIy+d3nvVQNLI/V+O/yp/z4moWFhdQxAApJYQ/QZ6brWal8ajji5WMmZLkyK/dYgnyyHTE7mDoGAKSzaVfE5p2RjRxNnYSSySfbEf/0rYjX51NHAcrC9/S3je7YEnv27NFJAVyGiyNAnx06dKgz8bQbdVbH5D3vc8uoda+rkE+2I3763VpNP+SDxyMumW4AoMYGGhG3fD2yh86mTkLJ5Ae2RJx81L0UcG0DjchmtqVOURim7AEuT2EP0EeNRiOuy7aZrqer8oOtiJ9+x5RHnVmztyrvmjiv2b9LpT0AvGnDUMTmrzhaiGXJH9kYcXIsdQyg6DYMRfbEDalTFMLXtm+MsbExvRTAe7gwAvTR+Ph45/vHTG/QO/m+dVbm183aZmRPbk6dorQuux6+ZtsKnMcKAO8w0IjYtLNW9wKsnu9hwDXdMRXZXt+7IiJePTGllwJ4DxdGgD766K0jpuvpCysaa8JqvVW56lnuSnsAYH0r4jPfMHXPkuX3XIw4N506BlBEvr+/7cu3rouJiQndFMA7/EXqAAB1MTo6qqynb7IHXlr8ItieiVjbTB2HHvFlf5WevffKf+/UxOKkVE1kR26M2LQrdQwAKJYLcxGzg5EPHq/VfQErlz1xg+9gwOVdWoj8vutTpyiEZ07U5+V4gKXyFhNAn5iuJ6V8ajjip98z7VEl7RnTXquw5LPba7a20DpXALgGU/cska1nwOVkx0ZSRyiEL3z8+jh8+LB+CuBNLogAfTA0NNT52a9vSB0DIsKaxkqo2br2bltyWf+Wmr0ckR/YEvH8ntQxAKDYnHXPEnkhEniXtc3IntycOkUhOMse4M9cEAH6wHQ9RaS4L6lNuyL79hupU5TWssv6t9SttJ9sR8wOpo4BAOVg6p4l8P0LeNvthyJ74KXUKZL79EcuxvT0tI4KIBT2AD3XarU6Zy/dmDoGXJEHRyWyvrV41jgrkt99fvEs2hWq2+rCfLId8ey91rgCwFKZuuca8qnhiP/ytxGvz6eOAiRWt++XV2LKHmCRiyFAj83MzHT2PjabOgZcVT7Zjvinb3lwVGQDjchmtqVOUVqrLesjorb/DVa8lQAA6mzDUMTmr5i657Kcbw/EhqHInnB85of/eHrN/Px86hgAySnsAXqo2WzG7z642Tp8SiM/2Ir4r/s8OCogb9+vXFfK+rfUtbS/67QXegBgJQYaEbd8PbKHzqZOQgE53x5qrmZHr13OwfvbMTg4qKcCas+FEKCHTNdTVvmBLRHP70kdg7f4Er9iXS3r31LX0r4X/y4BoE427YrYvDOykaOpk1AwjimDmqrpd8v3MmUPoLAH6JlGoxHXZdtM11NqHhwVwC2jzkFdofy+6yPOHO7NL76+FdmRG3vzaxeYawIAdMHaZsRnvhnZXi/C8Wf5ZDvi2XttO4O6uf1QZA+8lDpFUuO7WzEyMqKrAmrNRRCgRw4dOtSZeLreN9xUQz41HPFf/tY67BScabdifVkvWtfS3upWAOgeL2fyHradQf04Ai/iT/nxNQsLXlgC6kthD9ADpuupIg+O+mxtM7InN6dOUUp9LZSV9gBAN2wYitj8Fccg8TabjaBGvKwfozu2xJ49e/RVQG25AAL0wPj4eOf7x86mjlFb+YEtEZf+EPGb0xGXfreyM5cHGhHrty7+v2+6LeK//ZCVlW/y4KgPnGO3YkmK5JpOxuWT7YjZwdQxAKBaBhoRWx+s/XpkFtl2BvVhyt6UPVBvCnuAHvjorSOm6/sgnxqOyE8sFvP9LJDXNiP+w6ciss/VtsTPD7Yi/us+5yv2yo7nIhs5mjpF6eQHWxHPJnrIobQHALqtpvcXvJ9tZ1ADtuzFl29dFxMTEzoroJZc/AC6bHR0tPPMCQ9VeuHtgv6V51c2Nd9Lm3bVssDP77s+4szh1DGq5fZDJqpWoBDFcY0fqueDx73AAwC9Yl0+b7LtDCquPVP7a/2rJ6Z0VkAtufgBdJnp+u7KJ9sRL/+oXKXw2mbEx+6M7KF6HIuQTw1HzA4r67ph067Ivv1G6hSlU4iy/i13TNXuxZ23KO0BoMfWNiOad3u5s+asyYcKczyeKXugtlz4ALrIdH335PvWRZx5qvzlT43Ke9P2q7S+FdmRG1OnKKV8+1TqCO9W46mI/O7zxduAAgBVVOPNPiyyJh8qytY9U/ZALbnwAXSR6fruqGzxu74V8ZlvVLrIc7b9CnmLfsUKO9WttE8dAwDqYcNQZE/ckDoFCVmTDxXj+UB8+iMXY3p6WncF1MpfpA4AUBWjo6PK+m6pYlkfsVhgzQ5GPng88kc2pk7TE9neucUvlutbqaOUS/to6gSlVNiyPmLxz/rUcOoUSWRHboy4ZTR1DACoh3PTkW+fivyu04vHBFE72RM3RLRnIgYaqaMA3XBpYXGDRo397NdeRAPqx1tKAF1iur478n3rIk5NpI7RPxU+s9yKxiWy7m5FSjHFXfPJiNpdzwGgCAYaEVsfdH9ZU/kjGyNOjqWOAaxWzb9LRpiyB+rHBQ+gC5xd3z2FO4u6Xyq8yjK/63TE6/OpYxRThV/Y6KVSlPVvqfmDFi/uAEBCzrmvrVLdLwOXV/OX+w/e347BwUH9FVAbLngAXWC6vjsUO1HZ4j6/7/rqHnWwUutbi6vDWZZSPnyse2k/2Y6YHUwdAwDqq6LfMbi6/MCWiJOPFvcIKeDqav49MiLiw388vWZ+fj51DIC+cIY9wCo5u76LTj6aOkF6b51Bec/F1Em6Kvv2GxF31HR7wuUMNJT1K5DvW1e+sj5i8QzCu06nTpFMtnvWuaoAkNJb3zHuPu+c+xrJHnhpsezbMJQ6CrASzrKPhx9+2DNXoDZM2AOskun67sgPtiKeHUkdo3gquMbSivyI2PFcZCNHU6colUqch26rQuSDx015AUBqa5sRn/lmZHtL+CIkK5JPDUfMDrsPg7IxZR9/yo+vWVhw7QKqT2EPsArOru8eJe41VOzsslqvyK/Yf8t+qNQLPUp7pT0AFMVAI2Lrg+5NayR/ZGPEybHUMYDlqPkzhNEdW2LPnj16LKDyXOgAVsF0fXc433iJ1jYj/vPfVWYyOz+wJeL5Palj9NemXYvHA7Bklbw+OEc28rvPl/N4AwCoqgpu9uLKvDAPJWLK3pQ9UAvOsAdYoaGhIWV9t/z0u6kTlMPr8xFPf74y59tnD7wUseO5+pxrvb6lrF+mxdWdFSvrIxbPkd23LnWKpLIjN0asb6WOAQC85dTE4jn3Nb9HqYvsyc0Rtx9KHQNYCmfZx4MPPugZLFB5JuwBVui5557rfHWsGpPOqeXbp1JHKKcKrUWr/LStN+JXpPKr002yLZYCpyZSxwAA3stGoNrI77kYcW46dQzgajxTiFdPTOmygEozYQ+wAs1mM5T13ZHfd33qCOX1/J7ForsCsiM3RmzalTpG77RdL5ar8mV9xOIkW82n2LL9r0XcMpo6BgDwXuemFyfu77m4uPWIysqeuCHijqn6bD6DMjJlH6Ojo6bsgUrzVhLAChw6dKgz8XQ1JptTM13fJRWZtq/kufZbxyN76GzqFKVSi7L+nUzaV/PPPgBUydpmxN88HNnu2dRJ6CHT9lBgpuxN2QOVZsIeYAWU9d1R98nSrqrItH32wEsR7ZnqTHesbynrlym/+3y9yvqIxUn7g/U+z/3tP/sAQDG9Ph8xOxj5Xacjn2ynTkOPmLaHAjNlH7t27TJlD1SWN5IAlmnXrl2dH//7G6ljVELtpmj7YaAR8Z/2R7a3/OfBl/7nw9vvy5bffT7iQvl/dlesPVP7qbV8sh0xO5g6BgBwLWubEc27K7Hli8vL77s+4szh1DGAd/KcwZQ9UFkm7AGWaefOnakjVEJ+sFXuMraoLi1EPDuy+HCl5LKZbRHryzt1XPcv0cuV71tX77I+YnFqreYTa9nu2ciOjZjqAoCie31+ccvX4PHaT3xWVfbtNyJ2POe+DIrElH20Wi1T9kAleRsJYBmazWb87oOb3Rh2QX7X6cWHPPTO2mZkT25OnWLVSjnZcfsh00bL4Pzy9zBpHxEV2LIBAHUy0IjY+qB74Ioq5XcyqKqaT9kfvL8dg4ODei2gckzYAyzDnXfeqazvgnyyrazvh9fnI98+VfqzsbNvvxFxy2jqGEu3YciDymXIJ9vK+vcyaR8R5d+yAQC1cmnBxH2FmbaHAqn5lP3ex2aj0XAtAqpHYQ+wDN8/djZ1hGo4/Q+pE9TLsyOL68ZLLNv/WsQdU6ljXNvaZmRP3JA6Rbk4r/zyZgcjnxpOnSK57MiNSnsAKJN3FvePbEydhi7KRo4uvlC5aVfqKMDJR1MnSGrnzp0GqoDKUdgDLJEzkrro3HTqBPVzaiLyu8+nTrEq2d65iPZM6hhXVYUjCPopHzyeOkKxzSrsI94s7T0YBoByubQQcXJsceNXyV8e5t1M20MB1HzKfvv27akjAHSdsz4AlmhqaqozNjmXOkbp5fvWRZyaSB2jvgYaEe2jkY0cTZ1kVQp5tvUdU4svFbAk+V2nHY2xFDU/n/CdfH4AQMndMrq4OYvKcLY9JFTz74p/yo+vWVgo2HMhgFUwYQ+wRMr6LlG2pHVpIeLpz5f/XPuZbcWa6Ni0S1m/DPnd55X1S3VpwSaCN2X7X4vYOp46BgCwUqcmTNxXjGl7SKjmU/bW4gNVo7AHWIKhoSE3gV1Q5y8ShVOFc+1nthXjbOv1rcUHVSxJvm9dxAUvNyyL0v5t2UNnC380BgBwDYr7Snn7bPsNQ6mjQP3U+Cx7a/GBqlHYAyzBV77yldQRqmH+SOoEvFMVzrU/cmPa0n6gsZiBJckf2WjLxkop7d+W7Z5V2gNAFSjuKyV74oaIO6ZM20M/1XjK/qtjR6PRcL0BqsMZ9gBL8NFbR0zYr1I+NRzx9OdTx+By1rdKXzrnd59PM7XdnlksD7mmfLIdMTuYOkb51fycwvfKB48vHvUBAJTbQCNi64ORPfBS6iR0QX7PxYhz06ljQD3U+Dvil29dFxMTEzouoBJM2ANcw65du5T13fDT76VOwJVcmCv95G525Mb+r2C8ZVRZvxzK+u64tFD6zRjdlM1sM8UFAFVwaSHi+T2RDx6v7bRolWRP3BBx+6HUMaAeajxlby0+UCXePgK4hpmZmc7ex2ZTxyi9fPtU6ghcy0Aj4o7HS11C5/vW9WflegW2EvSTKege8DP4Lsm2bAAAvWHivjLcp0Ef1HjK/k/58TULC543AOVnwh7gGpT1q5c/sjF1BJbi0kLE7ODi6vKSyva/FnHLaG9/E+fWL4uyvkcuzJm0f4fsyI0R61upYwAA3WLivjKyIzdGbB1PHQOqrcZT9jt37rQZFagEhT3AVQwNDbnp64ZTf586AcsxOxj5wfIWXz0v7e94vHe/dsXkd59X1veS0v5dsiM39v6FHQCgv95Z3Jf4O0rdZQ+djezYSMTaZuooUF0nH02dIAlr8YGqUNgDXMWXvvSl1BFKL59sK+zK6NmRxfXyJdWz0t659UuW71tn9WU/KO3fpS9bNgCA/ru0sPgd5a7Tpd4IVnfZk5sjNu1KHQOqqaZT9l8dOxqNRiN1DIBVU9gDXMXYpLJp1X763dQJWKlTE0r7d1rfWvw1uab8kY0RpyZSx6iPC3OR33d96hSFke1/LaI9kzoGANALr88vbgRT3JdW9u03InY8FzGgYIOuq++UvQ2pQOkp7AGuoNVqudnrBhO25aa0//Ov5dz6Jckn2xEnx1LHqJ8zh0v9Z7Xbst2zi6W9B8EAUE1vFfc2DZVSNnI0spltERuGUkeBaqnplP0Xv/jF1BEAVk1hD3AFIyMjqSOUnvKoIpT2EXdMdSdMHcwOpk5QXyX/s9pt2e7ZxQfBSnsAqK4Lc5Fvn4r8noupk7AC2RM3RNx+KHUMqJYaTtnvfWw2dQSAVVuTOgBAUX301hET9quUDx53fn2V3DJa6pXw+b51K1vTvmnX4tpGrsmf+YIo+Z/VXsjvOr04iQcAVJt799JyvwZddPuhyB54KXWKvvrCx6+Pw4cP67uA0jJhD3AZzWYzdYTSyw+2FHdVc2qi1CsnVzRpP9DwwG+J8rvP+zNfFCbt3yd7cnPE+lbqGABAr505vDhx716odLInN0ds2pU6BlRDDafsrcUHyk5hD3AZd955p+n61frpd1InoBcuzNWqtM9mtvUwTXXk910fcWEudQzeSWn/PtmRG52TCgB1cWpisbiv4VnOZZZ9+42I9owjjWC1aniWvbX4QNkp7AEu4/vHzqaOUH5W2VVXXUp7ZykuSf7Ixogzh1PH4HJOTSxuO+Ft2RM3LH/TBgBQXs/viXzweO2KqzLLds8uvjhtOxKsTg2n7Hft2mUACygthT3Ae1iHv3qmOmvgwlyp/ztfs7Rf36rdeW8rkU+2I06OpY7B1Tw7svjfibdl+1+L2DqeOgYA0C+XFhaL+7tOuy8qkezIje7ZYDUuLdTuBW5r8YEyU9gDvId1+F1w5qnUCeiHkq/cvmJpP9BYfDjEtc0Opk7AUswOejj9HtlDZxfXrQIA9fH6/OJ9UYm3hdVN9tDZyI6NWJEPK1Wz4yqtxQfKTGEP8B633npr6gillk+2FycYqIcqlvbto2nClEw+eDx1BJZDaf8+2e5ZZ6QCQB1dmFs83/6ei6mTsETZzLaIDUOpY0D5vD5fu++BQ0NDBrGAUlLYA7xDo9GIr44p61blp99NnYB+q0Jp/9b5iLeMRjbiGnAt+d3nvZhTRkr793n7jFSlPQDUz7npxeK+xN9l6iR74oaI2w+ljgHl8/KPUifoqy996UupIwCsyJrUAQCKZHR0tPPMiddSxyi1fPtU6gikcsvoYvldUvm+daXO3y/5fddHnDmcOgar0Z5ZnC7nXfK7Ti+uygUA6megEbH1wcgeeCl1EpYgHzzuBWJYhuzYSOoIffXqiSm9F1A6JuwB3mH79u2pI5SayYSaOzUR+cFW6hQrpqy/tvyRjcr6KpgdTJ2gkLInN/952wYAUC+XFiKe3xP54HEbiUrAinxYnjI/q1mJVqtlLT5QOgp7gDdZh98FZ55KnYDUnh3xgKui8sl2xMmx1DHoknzweOoIhZQduVFpDwB1dmlh8Rihu8+nTsI1WJEPy3C6XtswR0bqtVEAqAaFPcCbdu7c6e3LVcgn21bSscg52dX07L2pE9BNlxaU9leQHbkx4pbR1DEAgJQuzC2eb3/PxdRJuIrsgZcWV30PNFJHgWK7MJc6QV+NTdbr/16gGhT2AG+yDn+VTv9D6gQUiZXbleKMyIpS2l9Rtv81pT0AEHFuerG4f2Rj6iRchRX5cG3W4gMUm8IeIKzD74pz06kTUDCKwGrI7z6vrK8ypf0VZftfi2jPpI4BABTBybHF8+1rVniViRX5cA0//U7qBH1lLT5QNgp7gLAOf7XyA1tSR6CIFIGll+9bV7vVebXkz+oVZbtnlfYAwKJLCxHPjkR+1+nUSbgCK/LhKl6fT52gr6zFB8pGYQ8Q1uGv2vyR1AkoqksLixPalE4+2Y44NZE6Bv2itL+ibPesB78AwJ+9Pu98+4KzIh8ur27HezSbzdQRAJZMYQ/UnnX4XVCzt3RZpgtzHmaV0exg6gT0mxdsriqb2aa0BwD+7K3z7W2cK6TsiRsito6njgHF8ssfpk7QV3feeaeNqkBpKOyB2rMOf3XyfetSR6AMzk37WSkRk9Y1dmFOaX8V2cy2iPXOrgUA3uH5PYvn20+2UyfhPbKHzkbseM5Ll/CWmg3cfP/Y2dQRAJZMYQ/U3jMnXksdodzOPJU6AWVxasL0SQnkd59fPJ+T+lLaX1V25EalPQDwbpcWImYHbRYroGzkqJcu4R3qNkxhLT5QFgp7oNbctK1OPtlW7LE8z+8xeVJg+b51ERfmUsegCJT2V5UduTHiltHUMQCAonlrTX7NCrEycP8Gb6rZ4I21+EBZKOyBWvvmN7/ppm01Tv9D6gSU0bP3pk7AZeST7YhTE6ljUCRK+6vK9r/moS8AcHmnJhbX5B801V0k2f7XItozqWNAWpcWIp8aTp2ib6zFB8pCYQ/U2tikSdJVOTedOgFldGnBGelFNDuYOgFFpLS/qmz/axF3TKWOAQAU0aWFiGdH3EsVTLZ7NrJjI861p95ePpY6QV/ZsAqUgcIeqK1Wq2W6fhVMCrAqlxY8uCqQ/K7TqSNQZBfmnMd6FdneOZNaAMCVXZhbXJN/3/Wpk/AO2cy2iA1DqWNAGjVbi79t2zbPgIHCU9gDtTUyMpI6Qrn99DupE1B2F+ac7VgA+T0XI16fTx2Dojs37c/rVZjUAgCu6czhxTX5B7akTsKbsiduiNg6njoG9N+lhcVj8Wpi+/btqSMAXNOa1AEAUvnorSPerlyFfLsVwHTJ7Ycie+Cl1ClqKX9kY8TJsdQxKJNbRhfXwHNF+eDxxRW4AABXsrYZ2ZObU6fgTflkO+LZe93DUS+bdkX27TdSp+ibP+XH1yws+DMOFJcJe6CWrMNfnfyRjakjUCXP74l8ajh1itrJJ9vKepbv1IRJ+2vIZrZFrHdsDABwFa/PL67Jd19VCNnu2cV7uLXN1FGgf84cTp2gr3bu3OlZMFBoCnuglqzDX6VTf586AVUzq7Dvu2fvTZ2AslLaX1N25EalPQBwbacmFtfkH3TfUATZk5uda0+tWIsPUBxW4gO1ZB3+yuVTwxFPfz51DKpofWux5KLn8rtOO7ee1bMe/5ry+66v3eQKALBCvg8VhqPDqI2aXXesxQeKzIQ9UDvNZjN1hHJ7+VjqBFTVhbnFcoueyu+5qKynO0zaX1P27TcibhlNHQMAKIMLc4tr8h1Bl1z20NmI9kzEQCN1FOitC3OpE/SVtfhAkSnsgdq588473ZytxpmnUiegys4cjvzAltQpKis/sCXi3HTqGFSJ0v6asv2vRdx+KHUMAKAsTo4trsmv0arqInKuPXVRpyM5rMUHisxKfKB2rMNfuXyyHTE7mDoGdbDjuchGjqZOUTn59qnUEagq6/GvyWcoALBsG4Yie+KG1ClqL7/nohefqa6arcV/9cSUTgwoJBP2QK00GtaZrcrLP0qdgLqYHU6doHLyweOpI1BlJu2vKds9G7HjOatVAYClOze9uCbfFrKksiducMwR1VWztfi7du0yyAUUksIeqJXt27e7KVuNM4dTJ6AuLi1Efvf51CkqI7/7fMSlhdQxqDql/TVlI0cXV6sq7QGA5Xh+T+R3nU6dotay/a8tnmsPFZQ/sjF1hL754he/mDoCwGUp7IFa+dznPpc6Qmk5P4++uzCn/OuC/JGNtXtjnoSU9kviPFQAYNlen1+ctnevlUy2ezayYyNevqR6fvnD1An6Zu9js6kjAFyWwh6olbFJpdWKWYdPCqcmvCyyCvnUcMTJsdQxqBul/ZJkT26OWN9KHQMAKJtTE5EPHl+81yeJbGab+ziq5fX51An6amhoyAZWoHAU9kBtNJvN1BHKzTp8UpkdTJ2gvGY9xCMRpf2SZEdujNgwlDoGAFA2lxYinv585PdcTJ2ktrIjN0Zs2pU6BnRNnb6/felLX0odAeB9FPZAbWzbts3bkyuUH/TmOGk5r3H5nFtPckr7JcmeuCHiltHUMQCAMjo3vTht7zt7Etm334jYOp46BnTHmadSJ+gbG1iBIlLYA7Xx2c9+NnWE8jo9lToBdff6fOT3XZ86RWnk+9Y5t55iUNovSbb/tYjbD6WOAQCU0aWFiGdHFl/Ype+yh85GtGdSx4DVu7RQq6M2Go1G6ggA76KwB2pj72OzqSOUl+KPIjhz2OTIEuST7YhTE6ljwJ8p7Zcke+AlD3sBgJW7MBf59qnID2xJnaR2st2zkR0biRhQAFJyLx9LnaBvtm/fbhMrUCgKe6AWvDW5cgpSCuXZkdQJiu/Ze1MngPc7NeHh8RJku2cjdjznYS8AsHLP73GkWCLZzLaI9Z6hUGI1evn/c5/7XOoIAO+isAdqwVuTq2AdPgWT33MxdYTCcm49hfb8nsUNEFxVNnJ08WGv0h4AWKnX5xen7R/ZmDpJ7WRHbozYMJQ6BqxYXb6zOcceKBqFPVAL3ppcBevwKZjsiRtSRygk59ZTCrODtXkAtFomtACAVTs5Zto+geyJGyJuGU0dA1bm5R+lTtA3NrICRaKwB2rBW5MrYx0+hbN1PHWCQsoPtmq1uo6SU9ovWXbkRqU9ALA6b03b71uXOkmtZPtfi2jPpI4By3fmcOoEfbN161YbWYHCUNgDcGXW4VMkA43IHjqbOkUxPTuSOgEsj9J+ybIjN5rQAgBW79RE5IPHI58aTp2kNrLdsxE7nnPUEaVTlwGe2267LXUEgLcp7IHKGxoa8rbkSlmvTZG0j6ZOUEhWXFJaSvsly/a/prQHAFbv0kLE05+P/L7rUyepjWzk6OJRR0p7yqQmAzwTT7+UOgLA2xT2QOVt3rw5dYRSqsvbtJTEpl2RjSjs3yu/7/qI1+dTx4CVU9ovmbWqAEDXnDls2r7PspltjjqiPAzwAPSdwh6ovL/6q79KHaGcXv7H1Alg0UAjsm+/kTpF4eQHW7U6W44KU9ovWbZ7VmkPAHSHafu+y47cGLFhKHUMWJL8wJbUEfqi2WymjgAQEQp7oAb2PjabOkI5nZtOnQAW3fF46gTF9F/3pU4A3aO0X7Js92xkx0asVQUAusO0fV9lT9zgqCPKYf5I6gR98alPfcpRqkAhKOyBSms0PMxeCaUJhbFhaHGilHfJ7z6/OBEDVaK0X5ZsZlvE2mbqGABAFZi276ts/2sRd9TjjHBKrCbH733yk59MHQEgIhT2QMVt3brVW5Ir8fKPUieAxVX4T9yQOkXh5PvWOU+O6lLaL0v25GZnoQIA3WPavm+yvXOOOqLw8kc2po7Qc5/4xCdSRwCICIU9UHG33XZb6gjl5FxsimDrg6kTFE4+NRxxaiJ1DOgtpf2yOAsVAOiqt6bt961LnaTyHHVE4f3yh6kT9NxXx46mjgAQEQp7oOK8Jbl8ShIKYX0rsgdeSp2ieGZNulATSvtlcRYqANB1pyYiv+t06hS1kM1sU9pTTDVZi+9IVaAIFPZApXlLcgXyn6ROAIsTo7yLc+upHaX9smT7X4u4/VDqGABAlbw+H/n2qVqsxU4tm9nmqCMKKT9Y/Z9LR6oCRaCwB+DdzjyVOgF1t3U8dYLCyQ9scW499aS0X5bsgZechQoAdN/JMdP2fZAduVFpT/G8/I+pE/Tc5s2bU0cAUNgD1TU0NOTtyGXKp4ZN8JLWQCOyh86mTlE8z+9JnQDSUdovS7Z7NmLHc9aqAgDd9da0/YEtqZNUWnbkRkcdUSznplMn6LmPfvSjqSMAKOyB6vJ25Aq8fCx1Auqu7RiL98oHj6eOAOkp7ZclGznqLFQAoDee37N4XBc9k+1/TWkPfTQ2aaMhkJ7CHqisv/qrv0odoXxeUQyS0IahyEYU9u+UH9hi6wW8RWm/bM5CBQB64sJc5IPHa3G2dSrZ/tci7phKHQMiImzWAOgDhT1QWXsfm00doXxen0+dgLoaaET2xA2pUxRO9sBLqSNAsSjtl81ZqABAT1xaiHh2JPJ7LqZOUlnZ3rmI9kzqGBDxygupE/Rcs9lMHQGoOYU9ABERkT+yMXUE6mzrg6kTFJdViPBuSvtlcxYqANAz56YXp+2nhlMnqaRs92zEjuccdURaNTjH/lOf+lQndQag3hT2QCUNDQ25yVquV55PnYC6Wt8ySX4V2f7XUkeA4lHaL5uzUAGAnrm0EPH05yPfty51kkrKRo4uHnWktIee+eQnP5k6AlBzCnugkm666abUEcrnwlzqBNRUduTG1BGKT8kG76e0XzZnoQIAPXVqIvK7TqdOUVlKe1LKD1b7mK1PfOITqSMANaewByrpr//6r1NHKJWq33RTYFvHUycoBVP2cAVK+2VzFioA0FOvz0e+fSryA1tSJ6mkbGZbxHrPcEggfzF1gp766tjR1BGAmlPYA5U0NmlafFkqftNNQQ00InvobOoU5WHKHi5Pab9s2e7ZyI6NmNACAHrn+T2R330+dYpKyo7cqLSn/37zz6kTAFSawh6AiDOHUyegju54PHWCUjFlD1ehtF8Ra1UBgJ66MBf54PHIp4ZTJ6kcpT199/p86gQ9NzQ01EmdAagvhT1QOc1mM3WEUvHFmSQ2DEW2ezZ1ivIxZQ9XprRfEWtVAYCeurQQ8fTnI9+3LnWSysmO3Og7InTR5s2bU0cAakxhD1TOpz71KW9DLsfLx1InoIayJ25IHaGUTNnDNSjtV8SEFgDQc6cmIr/rdOoUlZPtf01pT9/kB7akjtBTH/3oR1NHAGpMYQ9Uzic/+cnUEcrlleOpE1A3tx9KnaDcPIyBq1Par4gJLQCg516fj3z7VOQHvSjYTUp7+uY3P0+doKfGJudSRwBqTGEPVM7E0y+ljlAuNTiDigJZ24zsAX9GV8OUPSyB0n5FPOwFAPri2ZHI77mYOkWlZPtf83I8vfebf06dAKCyFPYANeatdvruP/9d6gTVsGEodQIoPqX9imT7X4toz6SOAQBU3bnpyAdt/Oum7IGX3MfRWzUY+mm1Wo5aBZJQ2AOV0mw2U0col5f/MXUC6mTDUGQjR1OnqIbNX0mdAMpBab8i2e7ZxYe9A43UUQCAKru0sLgi/5GNqZNUxtv3ccCK/I//4/+YOgJQUwp7oFI2btzoLcjlODedOgE1kj1xQ+oIlZHtno1Y20wdA8pBab8i2e7ZyGa2Ke0BgN47ORb53edTp6gMpT29lB/YkjpCT33yk59MHQGoKYU9UCm33XZb6gilkU8Np45AnThLr/s+883UCaA8lPYrls1s84IQANB7F+YiHzzuWUWXKO3pmVdeSJ2gpz7xiU+kjgDUlMIeqBQ3Vcvw8rHUCaiLtc3Fs/ToqmzvnMlXWA6l/YplT26OWN9KHQMAqLpLCxFPf96K/C7Jds9GdmzE90a668LJ1Al66qtjjnIE0lDYA5XipmoZXjmeOgF18Z//LnWC6tq0M3UCKBel/YplR26M2DCUOgYAUAdW5HeVY47oqksLqRMAVJLCHqCuXp9PnYA62DAU2YgXaXol2/9a6ghQPkr7FcueuCHiltHUMQCAOrAiv6uU9nRT1b9PDQ0NdVJnAOpHYQ9UhpuppcsPWmtLf2RP3JA6QvVZUw3Lp7RfsWz/axG3H0odAwCoAyvyu0ppT9fkP0mdoKc2b96cOgJQQwp7oDLcTC1D/mLqBNTB1vHUCerhM99InQDKSWm/YtkDL0W0Z1LHAADqwor8rlHa0xUVP2bzr/7qr1JHAGpIYQ9UhpupZThzOHUCqm6gEdlDZ1OnqIVs96wHLrBSSvsVy3bPRux4zvUHAOgPK/K7RmnPqlX8mM29j82mjgDUkMIeqAw3U1AgdzyeOkG9bNqZOgGU1+xg5PvWpU5RStnIUQ98AYD+sSK/a9zDAUCxKOwBasYXW3puw9Di5CV9k+1/LXUEKLdTE0r7VchmtkWsb6WOAQDUhRX5XfH/Z+9vQ+w6zwTv99LTx0wx+hArIGylqF5WH0FaSbcltUKC3EzSlkXGohmoYoRRPKBijEPN+KQl2l2WQSCHuKAg7hoHqXM8jxhRPiVo2zTVVMEhyM8gb8+4SUQPo1Yp3RlNDuLIK2JPOQgi+4BDDSbofCgn8Yte6mXvfe211u/3qTtxpH/il9p7Xeu+L5/hWI/yhd3ZCV21d+/em9kNQLMY2AO1cODAAR+iVurtN7MLqLnipY3ZCc3kQQusj6H9uhTTQ/45BAD0zodX5LM+PsOxZu/8OLugq/7oj/4oOwFoGAN7oBZ27NiRnVAdi63sAups13h2QXPtGM0ugOoztF+XYnrIzwEAoHeW2lHun6n9Sd9uM7RnTd7579kFXfWHf/iH2QlAwxjYA7XwB3/wB9kJlVCeGs5OoM4GBl3Nnqg44mUc6AhD+3UpJq8b2gMAvfXm4Sifej+7otIM7Vm1GwvZBV11/JRnLEBvGdgDtXDkL+ezE6qh/GF2AXW259nsArY/mV0A9WBovy7F5PWI4bnsDACgSa7ORvn4peyKSjO0Z7UcDALoHAN7gCZ52343umTTziiOXsiuYMc3sgugPgzt16UYm18e2g8MZqcAAE1xY2H5inxDxDUztGdVfv5P2QVdtXPnzuwEoEEM7IHKO3DgwM3shsqo+XVVJPqX/yG7gIgoRs8YjkEnGdqvSzE2H8XcPv9cAgB6a37EZ7h1MLRnxd5+M7ugq770pS955gz0jIE9UHkPPPBAdkIleMOcrtl6YHlQTH/Y7pQ9dJSh/boVc/s89AUAeuviVJRPXMuuqCxDe1Zksd573h988MHsBKBBDOyByvvDP/zD7IRqsL+eLile2pidwEcUk9ezE6B+Lk5F+dT72RWV5qEvANBzi60oR6wGXCuf31iJcuZQdkLXfPGLX8xOABrEwB6ovOOn6v02Z8fYX0837BrPLuBWNu3MLoD6uTrrlNY6FdNDfm4AAL211F7ea3/C4HktDO25q/JH2QVd82+Pu00S6B0De4CmsL+eThsYdJq7X/3+v84ugHpabBnar1Mxed3QHgDovddHo3z6nuyKSjK0545qvsceoFcM7IFKGxwczE6oBG+S0xV7ns0u4DaK565kJ0B9GdqvWzF5PWJ4LjsDAGiay6d9jlujYnooYsAzOG6h5nvs9+7dezO7AWgGA3ug0vbs2eND00qUf5ddQN1s2hnF0QvZFdyJa/Ghewzt160Ym18e2nvwCwD00od77eu8d7tbirl9PrvROL/3e7+XnQA0hIE9UGkPPPBAdkI1XD2bXUDdfO3b2QXcjWvxobsM7detGJv34BcA6L2ldsRrj0T5wu7sksrx2Y1bqfPfSw8++GB2AtAQBvZApf3u7/5udkI1LLWzC6iTLXuXT0bS11yLDz1gaN8Rxdw+e1EBgN5787C99mtgaM+nvP1WdkHXDA0NZScADWFgD1SaD013Z389nVZM+/uuMlyLD91naN8RxfSQoT0A0Hv22q+JoT0fc3U2u6BrjvzlfHYC0BAG9kCl+dC0Aj//x+wC6mT7k9kFrIZr8aE3DO07opgeitg1np0BADTNh3vtWR1DewDoHAN7gLp725dOOqd48YPsBFbBtfjQQ4utKB+/lF1RecXkdUN7AKD3ltpR7p9xS+EqGdrza+Wp4ewEgEozsAeouxsL2QXUxcMnswtYCw9PoHduLDid1QHF5PWI4bnsDACgiV4fjfLY5uyKSjG0JyIi3qvvjWODg/76BrrPwB6gxrzdSscMDEZx9EJ2BWux/RvZBdAsS21D+w4oxuaXh/Ye/gIAvXZxyrqj1Ro+k11Atrffyi7omj179tzMbgDqz8AeoM7KH2YXUBd7ns0uSFc+fU92wtp8fn92ATSPoX1HFGPzTmwBADnstV+VYvSMG5Ka7l0r+QDWw8AeqCzXEa2A/fV0wqadjT9dXz71fsTl09kZa1KMOukAKQztO6aY2xexxT5ZAKDHPvw85/bClfnNDUk0U41Xct57773ZCUADGNgDleU6ohWo8Ydleuhr384uSFWeGo64Orv8f88cyo1Zq+1PZhdAMxnad0wxPWRoDwD03lI7Yn4kyhd2Z5dUgqE9dfTggw9mJwANYGAPUFOVHSzSX7bsXf7C3WSvf+u3/3f5o7yO9fj8n2YXQHMZ2ndMMT0UsWs8OwMAaKI3D1d3TVqPFWPzEY/OZGcAQKUY2APUVVUHi/SVYnooOyFV+fQ9yycqfu3tN/Ni1qHxL11ANkP7jikmrxvaAwA5Lp+O8olr2RWVUBxp+czWQG6iAFg7A3ugsuwPuot3LmUXUHVbD2QX5Pvk3vrFVk5HJ7hKGnLZgdoxxeR1V60CADkWW17EXCEvWgLAyhnYA5Vlf9BdfLhzG9aqeGljdkKq8vFbv/RS2XUTDzycXQD8egeqof26/WY/6sBgdgoA0DRexFwxQ/uGWXovu6Arhoaaffsk0BsG9gDAp21/MrsgVfn8togbC7f5N6u5bqJ47kp2AvBrhvYdUYzNRzG3z9AeAOi9X7+I6Qrwuyomr7vBrylqetvnkb+cz04AGsDAHqCGfGFkvYoXP8hOyHX++O3/vYrusY8IQy3oJ4b2HVPM7bP2AwDI8ebhKI9tzq7oe8VLG31eA4A7MLAHKuszn/lMdkL/eufH2QVUWcOvqyufuHbnP6DKe+y37s8uAD7K0L5jiukhD4EBgBwXp+7+PRKf15pg6RfZBQCVZWAPVNbxUxUemnXb1bPZBVTVwODydXUNVZ7YW+2B/N18/k+zC4BPMrTvmGJ6qPErXQCAJIstQ/sVKKaHIjbtzM6gW+r8PAWgywzsAepoqZ1dQFXteTa7INd/ObaiP6yqayeKsfnsBOBWDO07pnjxg8bfFAMAJFlsRTlyLrui7xWv7LCuDQA+wcAeoGY88GfNBgajOHohuyJN+fQ9K3/Z5e23uhvTTa4ghP40PxLl89uyK2qhmLwe8ehMdgYA0ERL7Sj3z3g2cxfF3D5DewD4CAN7gLr5+T9lF1BVDT5dX84cirh8euX/gcXz3Yvptgcezi4Abuf88SiPbc6uqIXiSCtieC47AwBoqvmRyt7M1ivF3L7sBADoGwb2AHXzzqXsAqpo085Gn66P/+svVvfHV3ntRPFQdgFwJxenDO07pBibj+LsqNNbAECONw/7XHc3XrAEgIgwsAeon6uz2QVU0de+nV2Qpnx+W8SNhdX/5yp6xWExeiY7AbgbQ/uOcuUqAJDm4lSUT1zLruhbxdi8oT0AhIE9ALBp5/KX5KY6f3xt/7nyh53t6KWtB7ILgLsxtO+oYm5fxJa92RkAQBMttgzt76AYm4/YM5GdQYfUdRXEgQMHbmY3APVmYA9U0uCgU1K3Up7wIJo1aPLp+vU8NHnnHzoX0msPfDW7AFgJQ/uOKqaHvLAEAORYbEU5ci67om8Vz12J2DWenQEAaQzsgUras2ePtxpv5ef/mF1A1WzZ29jT9eWJvRGLrbX/Auv5zyYrjl7ITgBW6uJUlE+9n11RG8VLGz0MBgByLLWjHDkX5cyh7JK+VExej9j+ZHYGAKQwsAeok7e9rc3qFNND2Ql5/sux7AKAlbk66xrVDiomr0c8fDI7AwBooqV2xGuPRHlqOLukLxUvfmCNUdW9/VZ2AUAlGdgD1MmNhewCqqTB1wKXxzYvPyhZ769T5TUUDf7zD5Vk92lHFUcvRAzPZWcAAE01PxLl89uyK/pSMT1kaE/fuffee7MTgJozsAcqyYckWL/ipY3ZCXkuTnXm16nyGgp77KF6DO07qhibj+LsaMTAYHYKANBE548vv0zOpxTTQz6j0VcefPDB7ASg5gzsgUryIenTyhd2ZydQJQ0+XV0+fqlzv9g7/9C5X6vH7LGHijK077hibl/Epp3ZGQBAE12civKp97Mr+lIxt8/QvoquzmYXAFSSgT1AXbzz4+wCKqSpp+vLF3Z3dnXEYqtzvxbAShnad1zxyg5XrwIAOa7O+mx3O8NnsgsAoCcM7AHq4p3/nl1AVTT4dH2c/252QX9p8l8LUHWLrShHzmVX1EoxPRSx/cnsDACgiRZbnb0NriaK0TMRw3PZGQDQdQb2AHXRyVPD1FpjT9c/fU/EUrvzv+6JCp/ItMceqm2pbWjfYcWLH0TsGs/OAACa6MaCz3a3UIzNR+yZyM6g4T7zmc9kJwA1Z2APVNLUa3Yvw5o0+UT15dPd+XV//o/d+XV7wB57qAFD+44rJq87yQUA5Pjws105cyi7pK8Uz13xUiWpjp+yEhHoLgN7gBooX9idnUBFNPZ0fTevFnz37e792gArYWjfccXYfMTBNyIGBrNTAICmWWpHvPZIlKeGs0v6SjF5PWJLhW+4A4A7MLAHqIN3fpxdQBU09HR9+cLu7q6MuDrbvV+7Fxr61wXUzq9PY3mw2zHF6Jko5vYZ2gMAOeZHfLb7hGJ6yNC+Aiq9OhAgiYE9QB2889+zC6iApp6uj/PfzS7ob/bYQ30stT3Y7YJibp8HwwBAjvmRKI9tzq7oK8X0kBcq+93/fi+7AKByDOwB6qCbp4eph4aeoi6fvmd5gNXt36fK+wXv+2J2AdBphvYdV0wPNfZnKQCQ7OKUof0nuAUJgLoxsAeABmjs6frLp3vz+/z8J735fbqgGD2TnQB0g6F9xxUvbYzYNZ6dAQA00cWp5RfS+a1Hv59dwO28+7PsAoDKMbAHgLpr6InA8olrvfvN3n6rd79XN7jqGeppfiTK57dlV9RKMXk94tGZ7AwAoIkun+7t99w+V4zNRzx8MjuDW3n37ewCgMoxsAeouPL/VeGruOmJJp6uL0/sjVhs9e43fPdK736vbrj/j7ILgG45f9wVqh1WHGlFDM9lZwAATbTYMrT/iOLoBTcgAVALBvZA5QwO2lH1Mf/7/5ddQD9r6On6+C/Hevv73Vjo7e/XacUfZxcA3WTvaccVY/NRnB21OxUA6D1D+48pJq+7Na7fVP1QA0ACA3ugcvbs2XMzu6Gv/PQH2QX0sUaerj+2OWKpnZ1RKcXYfHYC0G2G9l1RzO3zgBgA6L3FVpQj57Ir+kYxPeQzWT+p+qGG29i7d69n0kDXGNgDVN3Su9kF9Kumnq6/OJXy25anhlN+345xShTq7+KU01hd4AExAJBiqW1o/xHF9JDvtXTVZz/72ewEoMYM7AGgphp5uv6p9/N+8/cqPgTbuj+7AOgFV6h2RTE9ZH8qANB7hvYfU8zty04AgDUxsAeoOnuhuJUGnq4vTw1HXJ3NC3j7rbzfuxPufzC7AOgVQ/uuKCavR+yZyM4AAJpmqR3l/pnq3/rWKcNz2QUAsGoG9kDl7NixIzuhv9R0LxTr08TT9fFfv5P7+1f85Zni6IXsBKCXFltRPn4pu6J2iueueEgMAOSYHzG0j4hibN7NRwBUjoE9UDmf+cxnshOgv23amV3Qc+ULu/NfXsn+/QFW68aCK1S7oBibjzj4hh2qAEDvGdpHxIc3HzXw5sF+Us4cyk7oOIfIgG4ysAeAuvnat7MLeu/8d7ML6mHL3uwCoNfsPe2KYvTM8g5VQ3sAoNcM7SPiw5sHfcfN8/OfZBd0nENkQDcZ2ANAnWzauXyyr0HKp++JWGpnZ0REVP+hyP1/lF0AZDC075pibp8HxQBA782PRHlsc3ZFumJ6yAuUAFSCgT1QOUNDQ9kJ0L+aeLr+8unsgt9671p2wfoUf5xdAGT5cGhfx6srsxXTQ65kBQB67+KUoX18+AIlvbf0XnYBQKUY2AOVc+Qv57MToD818XT9E302IH/nx9kF69K0v36AT1hqR7z2SPVvC+lDxUsbI3aNZ2cAAE1jaL9seC67oHneuZRdAFApBvYAFVa+sDs7gX7SsNP15anhiMVWdsbHvfv/zS4AWD97T7uimLwe8fDJ7AwAoGkM7ZdfTvfyJOs09dqF7ASgxgzsAaAOBgabdzr6v34nu+DT+u0FgrVwbTMQYWjfJcXRC054AQC9Z2i//PLklr3ZGQBwSwb2AFAHe57NLuip8oXdETcWsjPq6YGvZhcA/WJ+xG0+XVCMzUdxdjRiYDA7BQBokotTUT59T3ZFqmJ6KGLTzuyMZrg6m10AUCkG9gBVVvF92XTIwODyib0mOf/d7IL6uu+L2QVAP3nzcONPY3VLMbfP0B4A6K3Lp6N84lp2RarilR0+gwHQdwzsAaps6d3sAvpB007XH9scsdTOzritqp9GLUbPZCcA/cYVql1TzO1zNSsA0FuLrcYP7ePR72cXAMDHGNgDQJU18XT9xansgjtbei+7YP2cNgA+ydC+a4rpoYitB7IzAIAmafjQvhibj9gzkZ0BAL9hYA9QZe9eyS4g265/l13QU+VT72cn3N07l7IL1m/LnuwCoB9dnGr0g91uKl7aGLFrPDsDAGiSpg/tn7vipUkA+oaBPVApe/fuvZnd0FduLGQXkKx4rjkvbZQzhyKuzmZn3F0dXqR54KvZBUC/aviD3W4qJq9HPDqTnQEANEnDP9sVL22M2LQzOwMADOyBavnsZz+bnQD9o2kn8f6vv8guWJk6vEhz3xezC4B+1vAHu91UHGlFDM9lZwAATdLwz3bFKzusheuS8sTe7ASAyjCwByrlF7/4RXYC9I1i8np2Qs+UJ/bWYxBeEcXomewEoN81/MFuNxVj81GcHfXgGADonaZ/tnv0+9kFtVQcaWUnAFSGgT1QKa1Wa0N2A/SF7U9mF/TWfzmWXbAq5cyh7IT1MygC7maxFeXIueyK2irm9rmiFQDonQYP7Yux+Yg9E9kZADSYgT1AlW1xtVRTFS9+kJ3QM+ULuyOW2tkZq/Pzn2QXrN+WPdkFQBUstQ3tu6h4ZYfPewBA7zR5aP/clYitB7IzAGgoA3uAKhv4bHYBGZr2BfLNw9kFq7f0XnbB+j3w1ewCoCoM7buqmB5q3s06AECeJg/tX9rohiMAUhjYA0DV7Pg32QU9Ux7bnJ2wNu9cyi5Yv/u+mF0AVMlSO8r9M1GeGs4uqaXixQ8ido1nZwAATdHkof0rO7IT6FMTY26+ArrHwB4AqmTTzuXdak1xcSq7YG3evZJdsG7F6JnsBKCK5kcM7bukmLweMTyXnQEANEWDh/Y+c3Er771Xg9sUgb5lYA8AVfK1b2cX9Ez51PvZCWt3YyG7oDMGBrMLgCqaH4nyhNMn3VCMzUccfMM/nwGA3mjo0L4Ym3e7EQA9ZWAPAFUxMNis0/VXZ7ML2LInuwCoqtdHq7vWpM8Vo2eimNtnaA8A9EZTh/aT1yO2eAmV3/rZz36WnQDUmIE9QJUN3JtdQC/teTa7oGea+DCgLz3w1ewCoMouThnad1Ext89DZACgN5o6tJ8e8pIkv/H2229nJwA1ZmAPUGX3P5hdQA8VRy9kJ/REeWo4YrGVnbFu5Qu7sxPW7zND2QVA1V2civLpe7IraquYHorY/mR2BgDQBA0d2sfwmeyCavKiA8CqGNgDlXPimeHsBOi9Ju1O+6/fyS7gQ41awQB0z+XTzXy42yPFix8063MCAJCngUP7YvRMxMMnszOqp4Yr9n7xi19kJwA1ZmAPVM61a836YgARH+5Oa4DyxN6IGwvZGZ3x9lvZBQD9o4EPd3upmLweMTyXnQEANEEDP9cVRy9EbD2QnUGyVqu1IbsBqC8DewDod036UvhfjmUXdM5STd68btJff0B3NfDhbi8VY/MRB99w/SgA0H0N/FxXvLTR5ywAusbAHgD6XPHSxuyEnihf2B2x1M7O6JzFVnZBZ9z7QHYBUCeLrShHzmVX1FYxeiaKuX0eJgMA3dfEof3cvuwEAGrKwB4A+tmmndkFvXP+u9kF3Mp9f5hdANTNUtvQvsuKuX0RW/ZmZwAAddfAoX08OpNdAEANGdgDlfPjH/84O6F/fGYou4Bu+9q3swt6ojy2uV6n62ukOFKTmwKA/vLh0L48NZxdUlvF9FDE9iezMwCAumvY0L440vIZayUe+Gp2AUClGNgDlfPuu+9mJ/SNYmw+O4FuGhhszp/ji1PZBV1RzhzKTgDoX0vtiPkRQ/suKl78IGLXeHYGAFB3TRvav/hBs25EBKDrDOwBoF/teTa7oCfKY5uzE7rn5z/JLugMDyKAbpofifKE69u7pZi8HjE8l50BANTdYqve3+8/oXhlR3YCPTQx5vsK0F0G9gDQp4qjF7ITeqOmp+sjImLpveyCzrj/S9kFQN29PtqoB7y9VozNRxx8I2JgMDsFAKizi1PN+kxnn31jvPdeTZ7vAH3LwB4A+lFDrq8tn3o/O6G73rmUXdAZ9z+YXQA0QdMe8PZYMXomirl9hvYAQHc16DOdffZ38M8+k10AUCkG9kDlzM7ObshugG4rJq9nJ/TG1dnsgu5690p2QWfc98XsAqApLk5F+fQ92RW1Vszti9jiSk8AoIuaNLS3z/6WiiOt7ISO+vGPf5ydANScgT0A9JuGPESv/en6iIgbC9kFHVGMnslOAJrk8ukon7iWXVFrxfSQ02AAQHc1aWhvn33tvfvuu9kJQM0Z2ANAv/nKn2UX9EbdT9cDsHaLLUP7Lite/KAxK3gAgCQXp6J8YXd2RW/YZw/AOhjYA0A/GRiMYmw+u6LrGnG6vm62HsguAJpmsRXlyLnsilorJq97uAwAdNebh6M8NZxd0XX22dfblStXrGgFusrAHgD6yZ5nswt6o0Gn68uZQ9kJnXG/K/6ABEttQ/suK460IobnIgYGs1MAgLqaH2nG0N4++9paWFjITgBqzsAeAPpIcfRCdkLXNe6K45//JLugMz7zu9kFQFN9OLSvzQtQfagYm49ibp+hPQDQPU0Z2ttnD8AaGNgDQL9owB7Z8tRwxGIrO6O3lt7LLuiI4kjD/rwB/WWpHfHaI414yJupmNsXsWVvdgYAUFcNGdrHwyezCwCoGAN7AOgTxeT17ITu+6/fyS7ovXcuZRcA1EdTHvImKqaHIrYeyM4AAOrq9W9lF3RdcfSCz1MArIqBPQD0gwacZitPDUfcWMjO6L2lX2QXdI5dfEA/mB+J8tjm7IpaK17a2IibfwCABB+uO6q74qWN1g0BsGIG9gDQD77yZ9kF3dfE0/UR9VoBcO+27AKAZRenDO27rJi8HvHoTHYGAFBHDRnax/CZ7IIcNXtR4eWJQ9kJQAMY2ANUnSu2qm9gMIqx+eyKrmrs6fq6eeCr2QUAv3VxKsqn78muqLXiSCtieK52D10BgD7QgKF9MXomYs9EdkbvbdmTXdBRP/nJT7ITgAYwsAcqaWKs/teH0yC7/l12Qfc19XR93XxmKLsA4OMun47yiWvZFbVWjM1HMbfP0B4A6Lyldu0/yxXPXWnEGkQA1sfAHqik9957LzsBOqZ47kp2Qlc5XV8fdb8JAqioxVbtH/T2g2Jun4fNAEDnNeCzXDE95OXHCvMcGugFA3uAqrt/R3YB67H9yeyC7nO6PsoXdmcnANTbYqv2V6r2g2J6yNAeAOi8Bgzt408mswtYo0uXLmUnAA1gYA9U0s9+9rPshP4x8JnsAtZjxzeyC7rK6foaMqgB+lUD9qD2g2J6KGLXeHYGAFA3i60oj23Oruia4kirGYc2IiIG7s0uAKgcA3ugkt5+++3sBFi/TTujGD2TXdFdTtcve/ut7ILOuff3sgsAbu/DoX15aji7pNaKyesRD5/MzgAA6ubiVL2H9i9+0Iyr8e9/MLugo37xi19kJwANYGAPUHHF0QvZCazVzieyC7rK6fqaqtkXb6CGltoR8yOG9l1WHL0QMTyXnQEA1E3dh/Zz+7ITWKVWq7UhuwGoPwN7oJLOnz/vgxKVV/uXLZyu/63F89kFnXPfF7MLAFZmfiTKE9Z4dFMxNh/F2dFmnBQDAHrn4lS9X77cM5FdAECfMbAHKqndbmcnwPrUfPer0/WfsFSff2bVfo0DUC+vj9b6hFa/KOb2RWzxcgQA0EE1vjGpeO6Kz04AfIyBPQAkKCavZyd0l9P1APSLml+r2i+K6SEPngGAzpofiXLmUHZFVxTTQ9kJ3fOZGv93A+gSA3uAOvBwtFo27cwu6Cqn6xvAP3OAqrk4FeUT17Iraq+YHqr9LUIAQI/N13NgHxERj85kF3RFMTafnQBQOQb2QGW9PFHjD+yrNfDZ7AJW4yt/nl3QXU7X31KtrvK79/eyCwBWb7FlaN8DxeT1iIdPZmcAAHWx1I5y5Fx2RVcUR1oRWw9kZwDQBwzsgcr6yU9+kp3QP+7fkV3AKhRHWtkJXeN0/R28V6Mh0f0PZhcArI2hfU8URy9EDM9lZwAAdbHUjvLxS9kVXVG8tDFiYDA7g9sYP7g7OwFoCAN7oLLee++97IT+MfCZ7AJWqu7XxDpdf3tLNfpn1n1fzC4AWLvFVm1PafWTYmw+irOjHkADAJ1xY6G+L14On8kuACCZgT1QWZcu1fPN2jUxPKuMYvJ6dkLXOF1/F+/U559ZxaiHCUDF1fhq1X5TzO2L2LI3OwMAqIOa3pZUjJ6J2P5kdgYAiQzsgcr6xS9+kZ3QNwzPKmLTzuyC7nK6HoAqWWpHuX9m+YUzuqqYHjK0BwA6Y7EV5bHN2RUdV7z4Qf2fG1XQj3/84+wEoCEM7IHKarVaG7IbYFW+8ufZBV3jdP0KXJ3NLugsgxegLuZHDO17oJgeqv9qIACgNy5O1XNo/8qO7AQ+4d13381OABrCwB6gLuwH7XvFkVZ2Qvc4Xd889/5edgFA58yPRPn8tuyK2ismr0c8fDI7AwCog4tT9Xzpcs9EdgEACQzsAepiy57sAu6k7ifKnK5vnvsfzC4A6Kzzx2t5UqvfFEcvRAzPZWcAAHVQw5uSiueuuBofoIEM7IFKO/HMcHZC/7j3gewC7qCYvJ6d0DXlU+9nJ5Dhvi9mFwB03sUpP9d6oBibj+LsqBuiAID1mx/JLui4Sl+Nv/VAdkFHzc7OWskK9ISBPVBp165dy07oH/f+bnYBt1P3N6Prtpu9i+r05n8xeiY7AaA7rs5G+YTPmL1QzO2L2LI3OwMAqLhy5Fx2QudZIwTQKAb2QKX97Gc/y07oH0679q+dT2QXdI1TiKv0ngEQQCUstqJ8/FJ2RSMU00O1O4kFAPTYUrt2n92Koxeq+WLjA1/NLgCoJAN7oNLefvvt7IS+4bRr/yqOXshO6B6n61dn6b3sgs6q4sMDgJW6sVDP01p9qHhpY8Su8ewMAKDKbizU7pakYnooO2H1/tlnsgsAKsnAHqi08+fP2yNEf9v+ZHZB1zhdvwbv1OuN/7j397ILALprqR3lyLlarTTpV8Xk9YhHZ7IzAIAqW2xF+fQ92RWdVbGr8YsjrewEgEoysAcqrd1uZyf0l4HB7AI+6fN/ml3QPU7Xc/+D2QUA3bfUjpgfMbTvgeJIK2J4zmdaAGDtLp+O8tjm7IqOqezV+DXw8sSh7ASgQQzsAepky57sAj5qYDCKsfnsiq6o05ffnqrbSw73fTG7AKB35keifH5bdkXtFWPzUcztM7QHANbu4lSUJ+oz5K7M1fibdmYXdNRPfvKT7ASgQQzsgcrztuNHDNybXcBHbf9GdkH3XJzKLqAPFKNnshMAeuv8cS+t9Ugxt89pMgBg7V4frdcNSVW4Gv/+L2UXdNTPfvaz7ASgQQzsgcrztuNHuJ66rxST17MTusKgAoBGuzgV5RPXsisaoZgeitj+ZHYGAFBVr38ru6BjKnE1fs2eS7799tvZCUCDGNgDledtx4/4Z5/JLuDXanYN2Mc4Xc9H9fsDA4BuWGwZ2vdI8eIHEXsmsjMAgCpaakc5ci67omP6/Wr84uiF7ISOmp2d3ZDdADSHgT1Qed52/K3iSCs7gV/7yp9nF3RF+cLu7ITKq9WVfBER9/5edgFAjsVWrR4A97PiuSsRw3PZGQBAFS216/WiZRWuxgdg1QzsgcrztiP9qLYvT5z/bnZB9b1XowcFEbW78g5gVWp2aqufFWPzUZwdjRgYzE4BAKpmsRXlU+9nV3RE316NX7ObJl+eOJSdADSMgT0AdFpNd62WL+yOWGpnZ1Tf0nvZBZ31mf6+kg+g65baUe6fqd8NKn2qmNvXnw+pAYD+dnU2ymObsys6oi+vxr//S9kFHfWTn/wkOwFoGAN7AOi0z/9pdkF3LExnF9TDO5eyCzqqGJvPTgDoD/MjUZ4wSO6FYnrI0B4AWL2LU/X5vNZvV+PX7Pa9t956KzsBaBgDe6AWTjwznJ3QP7YeyC5otoHBWg4wy1PDETcWsjMAoL+9Plqbk1v9rpgeitg1np0BAFTN66O1uBmp367GL45eyE7oqPPnz1vBCvSUgT1QC9eu1WwnNNW1/RvZBd3xX7+TXVAfi+ezCzqvZrvqANbl4lSUT9+TXdEIxeT1iEdnsjMAgKp5/VvZBR3Rl1fj10S7bSUk0FsG9kAt/PjHP85O6B8PfDW7oNGKyevZCR1Xzhxyur6Tlmr4pe/ebdkFAP3l8ukon/BCaS8UR1oRw3MRA4PZKQBAVSy1oxw5l13RGXsmsgtq9xK/m1yBDAb2QC28++672Qn9474vZhc0V82+oPzG3//H7AL6nReFAD5tsRXl45eyKxqhGJuPYm6foT0AsHJL7Vq8YFk8dyX/edT9X8r9/Tvshz/8YXYC0EAG9kAtzM7O2iv0oWL0THZCc+18IrugO67OZhfQ7z7jGj6AW7qxUJ/TWxVQzO3rq12uAECfW2zVYpVR8cqO3ID7H8z9/TvsH/7hH7ITgAYysAeoIw8qUxRHL2QndFx5bHN2Qi2VM4eyEzqqGJvPTgDoX0vtKPfPRHlqOLukEYrpoYjtT2ZnAABVcfl0lM/XYM1b4tX4dXse1mq1HAwDes7AHqCO7v+j7ILmqetLEhensgvq6ec/yS4AoNfmRwzte6R48YOIXePZGQBAVZw/XvnPacVzV6wHAqgwA3ugNibGajowXYv7/jC7oHm+8mfZBR3ndD2rkr0zD6AK5kf8fO2RYvJ6xPBcdgYAUBXzI9kF6zdsTeZ6jR/cnZ0ANJSBPVAb7733XnZC3yiOtLITGqeWV4JffjW7oL7efiu7oPPurcEVggC9cHHK0L5HirH5KM6OOm0GAKxIOXIuO2FditEzvV8NVLMbJ996q4bPa4BKMLAHasMHKtLUcE9q+cLuiKV2dgZVcv+O7AKA6rg4FeUT17IrGqOY2+cmGADg7pbalf+MVrz4QW9fVqzZWs7Z2Vn764EUBvYAdbX1QHZBc3z+T7MLOm9hOrug3hbPZxd03md+N7sAoFoWW5V/IFwlxSs7ancCDADogsVWlE/fk12xPn8y2bvfy1pOgI4wsAdqwxuQn+C0a28MDNbuOvzy1HDEjYXsjHqr4e0FVnEArMFiq/JXr1ZJMT0UsWs8OwMA6HeXTy/fPFhRxZFWzw7y1OlZwMSYlzuBPAb2AHV13x9kFzTD9m9kF3Te3/9VdgEANMdSO8qRc8svzNF1xeT1iIdPZmcAAP3uzcOV/nxWvLQxO6Fy/vEf/zE7AWgwA3uAmqrbqe++9fn92QWdt1ift6MBoBKW2hHzI5V+KFwlxdELEcNz2RkAQL97/VvZBevT7ZcUN+3s7q/fY+fOnXN7K5DGwB6olfGD1b2uigratDOK0TPZFR1V+T1tFVLOHMpO6LweXbkHUFvzI1E+vy27ohGKsfkozo5GDAxmpwAA/erDm5Cqqjh6obtD9fu/1L1fO8HCwkJ2AtBgBvZArfz4xz/OTugvhmfd9fv/Orug8y6fzi5ojp//JLug8+59ILsAoPrOH4/y2ObsisYo5vZFbLGvFAC4jaV2lE9cy65Ys+KVHd37xe9/sHu/NkDDGNgDtXL27FlXF33U/V38UE4Uz13JTugowwHW7d7fzS4AqIeLU5V+MFw1xfSQF10BgNtbbFX7mcmu8e78uvd9sTu/bgK3tgLZDOyBWmm329kJ/eW+P8guqK+a7emKiIjLr2YXNMvbb2UXdFxx9EJ2AkB9LLYM7XuoeGlj9x5mAwDVd3EqylPD2RVrUkxe78oaoDqtifzZz36WnQA0nIE9UDsnnhnOTugbxdh8dkJ91ew6/PLE3oglL7wAQF9ZbFV6b2rVFJPXI4bnsjMAgH41P5JdsHaPfr+zv14XXgDI9A//8A/ZCUDDGdgDtfPDH/4wO6G/1OwDdL+o23X48fffyy5onsXz2QUAVMFS29C+h4qx+YiDb/gMDQDcUlU/lxVj851dAbRlT+d+rT7QarWsWQVSGdgDtXPu3DkfsD6qZh+g+8KWvdkFHVWeGo64sZCd0Tx1vdGgZn9/APSFpXaU+2cqew1r1RSjZ6KY21fPFUgAwPostSu7tqh4aWPnfrH7d3Tu1wLAwB6on4WFheyE/vLAV7ML6mfHaHZBZ1366+wC6uTe38suAKiv+ZEoX9idXdEYxSs7vIgGAHzaYivKY5uzK9bm4ZOd+XXu+4PO/Dp9YPygz9dAPgN7oJZenjiUndA/7vtidkHtFEda2QmddXU2u4A6uf/B7AKAenvzcHUfEFdQMT0UsWs8OwMA6DcXp6I8Ub0X+4qjFzpyi1AxNr/uX6NfvPXWW9kJAAb2QD395Cc/yU7oG8XomeyEeqnZKSsP/HOVMzV8uchLQgDdd3Eqyqfez65ojGLyeudOowEA9fF6RW9g/Jf/Ibugr5w/f956VSCdgT1QS96M/ISBweyC+qjbdfgXp7ILmu3n9Xu5yEtCAD1ydbay+1OrqDh6IWJ4LjsDAOgz5ci57IRVK0bPRGx/cu2/QM0Os7Tb7ewEAAN7oJ5mZ2e9GflRW/dnF9RGna7DtwMXACpusVXJh8RVVYzNR3F21MuwAMBvLbUr+RJl8eIHa/9Mc/8fdTYm0YlnhrMTACLCwB6gGeyU7oyavUEcC9PZBbxd09tAOrAPD4AVWmpHOXIuylPD2SWNUcztq9/nQgBg7RZb1Vw5uOfZtf3n7vvDznYk+qd/+qfsBICIMLAHaswbkr9VHL2QnVAPNboOvzw1HHFjITuDurp3W3YBQLMstSPmRwzte6iYHlrfVbIAQL1cnIryRLVe6CuOXljTC/d1un3y0qVL2QkAEWFgD9TYD3/4w+wEaqZOX0ji0l9nFxARsXg+u6A7HvhqdgFAM82PVPN0V0UVL34QsWs8OwMA6BevV++gR/HKjuyEVNaqAv3CwB6orX/4h3/ITugvru1cn7r973d1NruAiOUTkXX0maHsAoDmujgV5dP3ZFc0RjF5PWJ4LjsDAOgT5ci57ITVW82tQVbgAXSFgT1QW61WyxuSH/XAw9kF1Van6/CdvKPLirH57ASAZrt8OsonrmVXNEYxNh/F2dGIgcHsFAAg21K7cp/Dihc/WPnnmPu/1N2YHpoYq9nhHKDSDOwBmuK+P8guqLRaXYd/+dXsAgCg2xZb1TzhVWHF3D6nzgCA5c9hVTsssefZlf1x9z/Y3Y4e+sd//MfsBIDfMLAHam384O7shL7hxOs61Og6/PLE3vpew15R5cyh7ITucMoQIN9SO8qRc1GeGs4uaYzilR21+uwIAKzRxalKfQYrjl5Y2YuH932x6y29Yp0q0E8M7IFa+/GPf5yd0F+c+FmbGl2HH3//vewCPunnP8ku6I4te7ILAIhYflFvfmT5pT16opgeitg1np0BAGR7/VvZBatSvLLj7n/M6JkelPSGdapAPzGwB2rt7NmzPnh91AP7sgsqqVbX4d9YyC6gKe6/+xd9AHro9dHqXc1aYcXk9YhHZ7IzAIBMS+0oH7+UXbE6Ww/c/t9zkx5A1xjYA7XWbrv6+2OKP84uqJ4aXWnqIX2fevut7ILu+MzvZhcA8EkXp6J86v3sisYojrQihuc83AaAJruxEOXT92RXrFjx0sbb/5s1uknPGlWg3xjYA7V34pnh7IS+YY/9GtTpOvyLU9kFNEitbqYAqJOrs1E+cS27ojGKsfko5vYZ2gNAk10+HeULFRoQP3zy1v96jW7Ss0YV6DcG9kDt/dM//VN2Qn+p0YnxXqjL0LFSXwybZvF8dgEATbPYinLkXHZFoxRz+3wOB4Ame/NwdsGKFUcvRGzaeYt/46Get3SLNapAvzGwB2rvzTffzE7oLw88nF1QHbf6clJVC9PZBdzOktUdACRYakc5ci7KU8PZJY1RTA9F7BrPzgAAklTqhcmvfftT/1IxeiYhpDusUQX6jYE9UHutVssbkx9RPHclO6E6fv9fZxd0RDlzKOLGQnYGTbT1QHYBAHey1I6YH4nyhJPfvVJMXo/YM5GdAQBkWGpXZjVRMTb/8e/0259Ma+k061OBfmRgD9BEdmiuSG1ebvj7/5hdQFPd+0B2AQAr8fpolMc2Z1c0RvHclYjhuewMACDDYivK57dlV6xI8dLG3/4/n//TvJAOsz4V6EcG9kAjjB+0v/tjtn8ju6D/1ek6/Kuz2QXcRW2vI773d7MLAFipi1NRPvV+dkVjFGPzUZwd9SItADTR+ePLtyFWwYfrfIqx+dyODrI+FehHBvZAI7z11lvZCf3l8/uzC/rfA/uyCzqiKm9tN9571bgSb7WKoxeyEwBYjauzlbmmtS6KuX0RW6wkAIDGma/GwL6YvB7x4JHsjI6yPhXoRwb2QCPMzs76IPYRxeiZ7IT+V5eXGi7+n9kFrMTSe9kFALBssRXlyLnsikYppodqtRcWAFiBKu2z/+672QkAtWdgD9BUHgre3sBgLV5qKE8NRyy1szNYiXcuZRcAwG8ttaPcP1PflS19qHjxg99cOQsANMRiK8pjm7MrGsXaVKBfGdgDjTEx5qrJj/n8n2YX9K/t38gu6IxLf51dABFbD2QXALBW8yNRvuChZq8Uk9cjhueyMwCAXro45SXJHrI2FehXBvZAY/zd3/1ddkJfKcbmsxP6V/HH2QWdcXU2u4CVqvOfq4F7swsAWI83Dzv51UPF2HwUZ0cjBgazUwCAXnn9W9kFjXH+/HlrU4G+ZGAPNMbZs2d9IPskJ19vqQ4vM5TPb8tOgGX3P5hdAMB6XZyqzI7Vuijm9kVscUMYADRChfbZV127bXUk0J8M7IHG8IHsFh74anZB/6nLSwwX/8/sAlh23xezCwDohMWWB8k9VkwP1eezKQBwZ/bZd511qUA/M7AHGmX8oB2cH1UcvZCd0H8+/6+yC9atPDUcseQFFfpDMXomOwGATllsRTlyLruiUYqXNkbsGs/OAAB6wT77rrIuFehnBvZAo7z11lvZCf3HfsyPKY60shPW76c/yC5gDcoT3vQGoAKW2lHun/EwuYeKyesRj85kZwAAvWCffddYlwr0MwN7oFFmZ2d9MPuk7d/ILugfddkTevl0dgFr8b/fyy7onrr8vQXAb82PRPn8tuyKxiiOtCIOvuFlWwCoO/vsu+LliUPWpQJ9zcAeaJyXJw5lJ/SX4o+zC/rHAw9nF6xb+YK1D5X1zo+zC7rn3t/LLgCgG84ft2u1h4rRM1HM7YvYtDM7BQDoJvvsO+7s2bPZCQB3ZGAPNM6PfvSj7IS+UozNZyf0jeK5K9kJ67cwnV3AWi29m13QPfc/mF0AQLdcnHIKrMeKV3a4vQYA6s4++4569dVX3boK9DUDe6Bx/vZv/9YHtE/aeiC7IF8NrhctZw5F3FjIzmCt3q3BCyO3c98XswsA6KbFVpQj57IrGqWYHorYNZ6dAQB0k332HXHimWHX4QN9z8AeaJyFhYXshP7z+X+VXZBv+zeyC9bvp673qrQav2xRjJ7JTgCg25baUY6cW36BkJ4oJq9HPDqTnQEAdIt99h3xgx/8IDsB4K4M7IFGmhhzheRHFUda2Qn5ij/OLli/i1PZBQBAky21I157JMoTPmv3SnGkFXHwjVrcFgUA3IJ99ut2+vRpt60Cfc/AHmikv/u7v8tO6D8N34NZjM1nJ6yLB+P0vYb/MwagUV4f9WC5h4rRM1HM7TO0B4C6ss9+zU48M5ydALAiBvZAI3mz8hZ2jGYX5Nl6ILtg/S65DrUOav0F/N7fyy4AoJcuTrnCtceKuX1ekAOAurLPfk1chw9UhYE90FjesPy4Rl+L//l/lV2wfosN/vNXJ+/VeLBx/4PZBQD02mLL0L7HiumhiF3j2RkAQKfZZ78mDm0BVWFgDzSWNyxvYdPO7IIUVX9ZwZWzNbL0XnZB99z3xewCADIstqIcOZdd0SjF5PWIh09mZwAAnbbYivL5bdkVlTEx5uYhoDoM7IHG8oblLfz+v84u6L06vKRw+dXsAjrlnUvZBV1TjJ7JTgAgy1I7yv0z9V790meKoxcihufstQeAujl/PMqZQ9kVlTAzY30kUB0G9kCjuRb/44rnrmQn9N4D+7IL1qU8NRyx1M7OoFOWfpFdAADdMz/iZqAeKsbml/faG9oDQL3MG9ivRKvVclgLqAwDe6DRXIt/C1sadl3U5/dnF6zPT/01XCuL1V7PcFdN++cLAJ92cSrKp+/JrmiUYm6fn8EAUCdL7Sifej+7oq+5Dh+oGgN7oNFci38LO0azC3qq8td0Xz6dXQArd+/vZRcA0A8un47yiWvZFY1STA9F7BrPzgAAOuXqbJQv7M6u6Fvf+973PPMFKsXAHmg81+J/XHGk5id8P2rrgeyCdSlPeFuYirn/wewCAPrFYivKkXPZFY1STF6PePhkdgYA0ClvHs4u6FsLCwvZCQCrYmAPNN4Pf/jD7IT+05QrMz//r7IL1ufvv5ddQBeUMzXeRXffF7MLAOgnS+0o989EeWo4u6QxiqMXIobn7LUHgJooH7+UndB3vrl/W3YCwKoZ2AON9+qrr7oi6ZMaci1+5W8TuLGQXUA3/Pwn2QVdU/kVFAB0x/xIlM97sNorxdj88l57Q3sAqL4bC1Ee25xd0Vf+9m//1rNeoHIM7IHGa7fb2Ql9p/KD7JXYtDO7YF18GauxpfeyCwCg984fj/Lpe7IrGqWY29ecm7UAoM4uTrmx6CNchw9UkYE9QLgq6Za2P5ld0F0P7MsuWJ/Lr2YX0C3v1Pw6O4MBAG7n8ukon7iWXdEoxfRQxK7x7AwAYL1e/1Z2QV947CEHXIBqMrAHCFcl3dKOb2QXdFfxx9kFa1bOHIpYcjNEbS39Irugu+79vewCAPrZYivKkXPZFY1STF6PePhkdgYAsB5LbS8+htWnQHUZ2AOEq5JupRg9U+u9lsXYfHbC2l1yur7WFmu+kuL+B7MLAOh3S+0o98+42rWHiqMXIobnav35HwBqb7EV5Qu7syvSvDxxyOpToLIM7AE+NDHmmuZP2fXvsgu6o+pXcl8+nV0Aa3ffF7MLAKiK+ZEon7e6qleKsfnlvfaG9gBQXW8ezi5Ic/bs2ewEgDUzsAf40MzMTHZC3ymeu5Kd0B2/P5xdsGZOmlF1xeiZ7AQAquT88Sifvie7olGKuX3Vf8EVABqsfPxSdkIK1+EDVWZgD/ChVqvlQ92t1PBhXXH0QnbC2v39X2UX0APlzKHsBADoH5dP28naY8X0UMSu8ewMAGAtbiw07oXHE88Muw4fqDQDe4CPcC3+LXzlz7ILOqvqV3zWfb85y37+k+yC7qrhi0AAdNliK8qRc9kVjVJMXo94+GR2BgCwFpdPN+qWxh/84AfZCQDrYmAP8BGuxf+0Ymy++kPuj9q6P7tgzcoXdmcn0CtL72UXdNe9v5ddAEAVLbWj3D/TqIfP2YqjFyKG5+r1fQAAmuL1b2UX9Mzp06fdnApUmoE9wEe4Fv82tn8ju6Bzin+RXbB2C9PZBfTKOzXfN3f/g9kFAFTZ/EiUz2/LrmiMYmx+ea+9oT0AVMtSO8qn3s+u6LoTzwxnJwCsm4E9wCe4Fv/Tisnr2QkdUxyp8JXyNxayC+iVpV9kF3RVcfRCdgIAVXf+eON2s2Yr5vZZawMAVXN1tvY3Nv7VX/1VdgLAuhnYA3yCa/Fvow4P5zbtzC5YM6fIGmaxwi+WAECvXD4d5RPXsisapZgeitg1np0BAKzGm4ezC7rKjalAHRjYA3yCD3m38ZU/yy5Yvwf2ZRes3cX/M7sAAKD/LLaiHDmXXdEoxeT1iIdPZmcAAKtQPl7P1XtuSgXqwsAe4BZ82Pu0Ymy++nsriz/OLliTcuZQxFI7OwM6a+uB7AIA6mKpHeX+mShPDWeXNEZx9ELE8Fz1vx8AQFPcWKjl7Y1uSgXqwsAe4BZ82LuN7d/ILliXYmw+O2Ftfno2u4AEtR863PtAdgEAdTM/UssH0f2qGJtf3mtvaA8A1XD+eHZBx7kpFagLA3uAW/Bh79aKyevZCWtX4f31cfnV7AIyvFfznbz3/m52AQB1dP54lE+9n13RKMXcvogtbigDgCoo/5+PZid0zDf3e1ETqA8De4DbGD+4OzuhP1X1Guvf/9fZBWtSnhp2HX5TvfPj7IKuKo5eyE4AoK6uzkb5RM1ffOszxfRQxK7x7AwA4C6K/8fr2Qkd87d/+7cOXAG1YWAPcBvT09M+9N3KV/59dsHaFA9lF6zNT3+QXUCWpXezCwCguhZbUY6cy65olGLyesTDJ7MzAIDb2f5kdkFHLSwsZCcAdIyBPcBt+NB3a8XomUpeL1+MnslOWJvLp7MLyLJ4Prug++y8BaCbltpR7p+J8oTr2nulOHohYnjOz3gA6Ec7vpFd0DGPPbQ5OwGgowzsAe7Ah7/b+MqfZxesTkV3apanhrMTyNSEVQhb9mQXANAEr49Geczn+l4pxuaX99ob2gNA/9i0s7qHWW7h1VdfdTMqUCsG9gB34MPfrRVHWtV6APfAw9kFa+M6fOru/h3ZBQA0xcUpe+17rJjbV9kXZwGgdqp2+OYOXp44FO12Aw45AI1iYA9wB+12O16eOJSd0Z+2V+gararur3cdPnV33x9kFwDQJIutKB+/lF3RKMX0UMSu8ewMAGi2gcHlwzc1cfbs2ewEgI4zsAe4i1dffTU7oS8Vk9ezE1asild+2bVKRET5wu7shK4qxuazEwBomhsLUY6cs3qoh4rJ6xGPzmRnAEBz7Xk2u6Cj3IgK1JGBPcBdnD592ofA29n+ZHbB3VX1Gs5LHmoSEUvvZRcAQP0stSPmR2r/Ylw/KY60Ig6+Ua21WgBQBwODURy9kF3RMSeeGXYdPlBLBvYAKzAxVtGhb5cVL36QnXB3Vd1fv1ifq8pYh3cacG3vpp3ZBQA01ZuHo3z6nuyKxihGzyzvtfezHwB6p2an63/wgx9kJwB0hYE9wAp873vfc8r+dvr9BHsF99e7Dp/fePdKdkH33f+l7AIAmuzy6SifuJZd0SjFKzv6/zsEANRBzU7XR7gJFagvA3uAFVhYWMhO6F9f+bPsgjuq4v561+HzGzcWsgu67/4HswsAaLrFVpQj57IrGqWYHorYNZ6dAQD1VrPT9SeeGc5OAOgaA3uAFXrsoc3ZCX2pGJvv32stq3pyx3X4NMl9X8wuAICIpXaU+2eiPDWcXdIYxeT1iEe9qAoA3VK30/V//dd/nZ0A0DUG9gAr9Oqrr7py6Xa+8ufZBbdWwf31rsOnaSp5CwYA9TU/EuUxL+r2SnGkFXHwjYiBwewUAKiXGt5kMzs769ksUFsG9gAr1G63Xb10G8WRVn8+ZKvg/nrX4fNJXuIAgB67OGWvfQ8Vo2eimNtX3duxAKAPFZPXsxM6avzg7uwEgK4ysAdYhb/6q7/KTuhffbgXq5Ind12Hzyf97/eyC7pv64HsAgD4uMVWlI9fyq5olGJ6yGcCAOiEGp6un56edroeqDUDe4BVaLVaPhzeRt/txargCR0nqbmlt9/KLui++3dkFwDAp91YiHLknL32PVS8tLGWQwYA6KW6na6PiFhYWMhOAOgqA3uAVXrsITstb6ufHq5VcH+96/C5paVfZBd032d+N7sAAG5tqb281/75bdkljVFMXo8YnsvOAIBqquFtNZ7FAk3gpCjAGvzuQ6M3sxv6Vbm/T4bOw3NRjM1nV6xK3/xvR98pzo5mJ3Sdv/4B6Hvbn4zixQ+yKxqlHDm3/NIEALAidXx+8LMfzZhjAbXnhD3AGkyMubr8tvrklH3lhvWuwwcA6G+XT0f5xLXsikYp5vZVctUVAKSo4el6z2CBpjCwB1iD733ve97svI2+2JO1aWd2weq5Dp+mq+LftwA0z2Jrea/9zKHsksYopocitj+ZnQEA/W/Hv8ku6DjPYIGmMLAHWIOFhYV4ecJDutvKfqP3gX25v/9aLLayC+hjjbiB4f4vZRcAwMostSNee6QZP5/7RPHiBxF7JrIzAKB/bdpZudsm7+bliUOxsLCQnQHQEwb2AGv0H//jf8xO6FvFSxtzA+77w9zff5U87OWu3vtZdkH33f9gdgEArM7ro1Ee25xd0RjFc1cihueyMwCgP33t29kFHefZK9AkBvYAazQ7O+tKpjtJPGVfHKnYaXXX4XM371zKLui++76YXQAAq3dxyl77HirG5qM4OxoxMJidAgD9Y2CwdqfrIzx7BZrFwB5gHR57yIma20k7ZV/Fh3euw+du3r2SXdB1xeiZ7AQAWJsP99rTO8XcvogtbqkCgIiI2PNsdkHHeeYKNI2BPcA6vPrqq970vJOMU/Zb9vT+91yH8tRwdgJVcGMhu6A3qvjCDQBERCy1o9w/47NdDxXTQxG7xrMzACBdcfRCdkLHTU1NeeYKNIqBPcA6tNvtmBhzsuN2Uk7ZP/DV3v+e6/HTH2QXQP+o2As3APAp8yP22vdQMXk94uGT2RkAkKeGL685XQ80kYE9wDp973vf88bnnfT4lH3l3iq+fDq7APrH/TuyCwBg/ey176ni6IWIg2+4qQeARiomr2cndJzT9UATGdgDrNPCwkKceGY4O6Nvpe2yrwBXprIa5Qu7sxO6774/yC4AgM6w176nitEzy3vtN+3MTgGA3slYRdllTtcDTWVgD9ABf/3Xf52d0N969eBsS8XWE7gOn9V492fZBV1XjM1nJwBA59hr33PFKzuq950AANaojodknK4HmsrAHqADZmdnfZi8k699uze/zwMP9+b36ZSrZ7MLqJJ3384uAADWwl77niqmh2q5zxcAPqaGL6h9+XPvZycApDGwB+gQVzbdXjE235tT9hW6TrucORSx1M7OoEoWz2cX9EYNr/QDAHvte6uYvB4xPJedAQDd85U/yy7oOAeigCYzsAfoEFc23UUPTtlX6jrtnzpdzyo15QWPex/ILgCA7rDXvqeKsfkozo5GDAxmpwBAZ23aWa1nYCvgdD3QdAb2AB3klP3tdf2UfdUexF1+NbsA+tN9f5hdAADdY699zxVz+2p5bTAADfaVP88u6Din64GmM7AH6KBXX33Vh8s76eYp+y17uvdrd0NTTkvTUU14uF8caWUnAED32WvfU8X0UMT2J7MzAGD9BgZr973Z6XoAA3uAjmq32zF+cHd2Rt/q6in7B77anV+3C8rnt2UnUFXv2X0LALVxcSrKpzyg7pXixQ8i9kxkZwDA+ux5Nrug45yuBzCwB+i47373uz5k3kmXTtkXRy905dftiv/5t9kFVNXbb2UX9IZrawFoiquzUT5+KbuiMYrnrkQMz2VnAMCaVer51wo4XQ+wzMAeoMPa7XZMjBk23U7Xd9lXwY2F7AKqaukX2QW9cf8fZRcAQO/cWIhy5FwjVt/0g2JsPoqzoxEDg9kpALA6u8azCzrO6XqAZQb2AF3wve99z4fNO+n0KfsKvQBQnvAyB+uwWK89dbd13x9mFwBAby217bXvsWJun1t9AKiUYvJ6dkJHOV0P8FsG9gBdsLCwECeeGc7O6FvF2HxnH449sK9zv1a3XZrJLoC+VxxpyIsJAPBJF6eifOJadkVjFNNDtTytCEAN1fDnldP1AL9lYA/QJd/5znd86LyDYnqoc79YlU7jNuWENAAAa7PYinLkXHZFYxST1yMe9VItAP3N6XqAejOwB+gSp+xXYOuBjvwyVTmNay8pnVC+sDs7oTcqtOoCADpuqR3l/hmfH3ukONKKOPiGvfYA9Cen6wFqz8AeoIv++q//OjuhrxUvbcxO6K2f/iC7gDp492fZBb1x/5eyCwAgn732PVOMnrHXHoC+5HQ9QP0Z2AN0kbdFV2C9p+yr9EDt8unsAurg3bezC3rj/gezCwCgP9hr31PF9FDHbgIDgHWr4c8kz0sBPs3AHqDLvDV6Z+s+Zf/Aw50J6bJy5lB2AnVxdTa7oCeKoxeyEwCgf9hr31PFSxsj9kxkZwBA7W6nfOwhNwcB3IqBPUCXeWt0BdbztvB9f9C5jm766dnsAgAAqsxe+54qnrsSMTyXnQFAk9XwdP3U1JTnpAC3YGAP0ANO2d/Zet4WLsbmOxfSTW87EQWrtmlndgEA9B977XumGJuP4uxoxMBgdgoADeR0PUBzGNgD9IBT9itQw7eGP+bGQnYBNVKe2Jud0Bv3fym7AAD6k732PVXM7YvY0pDPXwD0h13j2QUd53Q9wO0Z2AP0iFP2d7amt4YrMuQvX9idnUDdvPez7ILeuP/B7AIA6F/22vdUMT1Uy+EJAP2pmLyendBRTtcD3JmBPUCPOGW/Ag+fXN0ff/+O7nR02v+czy6gbt65lF3QE8XRC9kJANDffr3Xvim37yQrJq9HPDqTnQFA3dXwBTGn6wHuzMAeoIecsr+z4uiF1e2svu8PutbSUYut7ALqZvF8dgEA0E9eH7XXvkeKI62Ig2/Yaw9AdwwMOl0P0EAG9gA95JT9Cnzt2yv+Q4ux+e51dEh5ajg7gTpaamcX9M5qXuIBgCaz175nitEz9toD0B17ns0u6Din6wHuzsAeoMecsr+zYmy+MrvpV6T8YXYBVNv9X8ouAIDq+HCvfTlzKLukEYrpoXp9dwEg18Bg7VbDOV0PsDIG9gA95pT93RUvbbz7H1SV0yyXX80uoKYas6u2+BfZBQBQLUvtiNceifKF3dkljVC8tDFiz0R2BgB18Oj3sws6zul6gJUxsAdI4JT9Ctztodf9f9SbjvVq0tXl9NbP/zG7oCeKI63sBACopjcPR/mU7x29UDx3JWJ4zl57ANZuy95KrH5cDafrAVbOwB4ggVP2d1c8d+XOD7zu+8PexaxR+fy27ATq7N23swsAgH53dTbKxy9lVzRCMTa/vNfe0B6ANSimh7ITOs7peoCVM7AHSOKU/Qrc4SqwSpy6ffvN7ALq7OpsdkHvVGUFBgD0oxsLy3vtTw1nlzRCMbfPZxcAVmf7k9kFHed0PcDqGNgDJHHK/u6KsfmIrQeyM9ZusQIvFUAVVGUFBgD0q6V2xPxIlMc8PO+FYnooYtd4dgYAVTAwGMWLH2RXdJzT9QCrY2APkMgp+7srXtr46X9x086ed6yWE0zQQRVYgQEAlXBxKsonrmVXNEIxeT3i0ZnsDAD63Z9MZhd0nNP1AKtnYA+QyCn7Fdoz8fH///4v5XSsxk9/kF1AA5Qv7M5O6IlKrMAAgKpYbEU5ci67ohGKI60ozo7aaw/ArW3ZW8vvu07XA6yegT1Asm0DTrjcTfHclY8/5Lr/wbyYlbp6NruAJnj3Z9kFAEAVLbWj3D8T5Qm71nvBXnsAbqWYHspO6Din6wHWxsAeIFmr1dpw4pnh7Iz+N3zmt//3fV/M61ippXZ2AU3wzj9kF/TO1gPZBQBQP6+PRvn0PdkVjVBMD0VsfzI7A4B+8fDJ7IKucLoeYG0M7AH6wHe+8x0fZu+iGD3zm4FdMXrmLn90rqZcU04fWKzf1Xm3df+O7AIAqKfLp+2175HixQ9qO6ABYBW27I3i6IXsio5zuh5g7QzsAfrAwsJCOGV/d8VLG7MTVuZ/zmcXQP3c9wfZBQBQXx/utS9PDWeX1F5x9ELE8Jy99gANVser8COcrgdYDwN7gD7hlP0KDc9lF9xdk049k66cOZSd0BPF2Hx2AgDU21I7Yn4kyue3ZZfUXjE2v7zXftPO7BQAeq2mN618/QtW7ACsh4E9QJ9wyn5l+n1o15ThKX3k5z/JLugdJ9EAoPvOH3dFfo8Ur+z4zdovABpg085aXoUfEXH69GkHkQDWwcAeoI9861vf8uG26n56NruApnn7reyC3tmyJ7sAAJrhwyvy6b7ipY0Ru8azMwDohX/5H7ILuuLLn3s/OwGg8gzsAfpIu92O8YO7szNYj7c92KTH3r2SXdA7D3w1uwAAmmOpHeX+mShP7M0uqb1i8no1Vn8BsHZbD0Qxeia7oitmZ2cdQAJYJwN7gD7z3e9+14fcKruxkF1A0zTor7m6Xh0IAH3t9dEon7aXttuKsfkozo5aAQRQRwODyzeq1NBnf3nJc0yADjCwB+gzTtlXl9NHAADU0uXT9tr3SDG3L2KL7xUAtbLn2eyCrjjxzHAsLCxkZwDUgoE9QB86fPiwt1OrqPy77AIaqlEvi3iADQA5PtxrX54azi6pvWJ6yF57gLrYtLO2t8V961vf8vwSoEMM7AH61GMPbc5OYLWuns0uoKl+/o/ZBb1z/x9lFwBAcy21I+ZHonx+W3ZJ7RWT1yMencnOAGCdild2ZCd0xfjB3dFut7MzAGrDwB6gT01NTXlLtWqWfFEhybtvZxf0TvHH2QUAwPnjrsjvgeJIy157gCrb/mR2Qdd897vf9dwSoIMM7AH62Ne/cE92AitUvrA7O4EmuzqbXdAzxdh8dgIAEPGbK/LpPnvtASpoYDCKFz/IruiKr3/hHqfrATrMwB6gj50+fdrbqlXx9lvZBQAA0FtL7Sj3z3h5tQeK6aFan9QEqJ0/mcwu6BrPKwE6z8AeoM99+XPvZyewEg064Ux/Kk8NZyf0ztYD2QUAwEe9eTjKp90O1m3Fix9EPHwyOwOAu9myN4ojreyKrtg2YCUOQDcY2AP0udnZ2Q0vTxzKzuAOyhl/fugD7zXoS/MDX80uAAA+6fLpKB+/lF1Re8XRCxEH37DXHqCPFdND2QldMTG2N1qtltP1AF3gH64AFbBz5874xT/fcTO7g1srn98Wcf54dgZNt/VAFC9tzK7omXL/THYCAHA7w3NRjM1nV9Re+filiBsL2RkAfNSu8Sgmr2dXdMWvynMb7K4H6A4n7AEqYGFhIU48M5ydwe28/WZ2AUQsns8uAABYNj8S5bHN2RW1V7yyw6oggH4yMFjbYf3Xv3BPGNYDdI+BPUBFfOtb33IrSr9arOdeMipmqWFfnLfszS4AAO7k4lSUTzRoZU+S4qWNEXsmsjMAiIh49PvZBV1z+vRpzyUBusjAHqAi2u12PPaQUyr9pjw1nJ0Av1HOHMpO6J37/yi7AAC4m8VWlCPnmvUZJUHx3JWI4Tl77QEybT1Q23Uwn/3lJcN6gC4zsAeokKmpKR+Q+035w+wC+K2f/yS7oHeKP84uAABWYqkd8dojUT6/Lbuk1oqx+Sjm9hnaAyQpXtqYndAV39y/LRYWFrIzAGrPwB6gYrzV2mfePpddAL/1zo+zC3qmricXAKC2zh93RX4PFHP7rA4C6LUaryY5fvy455AAPWBgD1AxCwsLMX5wd3YGv3ZjIbsAfuud/55d0FtOkAFAtXx4RT7dVUwPRewaz84AaIaBweXVJDXk0BBA7xjYA1TQ4cOHfWDuA/bX03ea9gLJ1v3ZBQDAai21o9w/E+ULXkLupmLy+vJeewC6a/hMdkFXuAofoLcM7AEq6sufez87AfvrIdf9D2YXAABr9ebhKJ/ynaabirH5KM6OupUIoFu2HohitJ4De1fhA/SWgT1ARc3Ozm448cxwdkaz2V9PH2rSabXi6IXsBABgPa7OuiK/B+y1B+iO4qWN2Qld8avynGE9QI8Z2ANU2Le+9S0foDM17fpxquGdH2cXAACs3K+vyD9hoNxN9toDdNjDJ7MLuuLrX7gn2u12dgZA4xjYA1RYu92Or3/hnuyMRrK/nr71zn/PLuitrQeyCwCATnh9NMqnfbfppmLyesSjM9kZANW3aWctb3x7eeJQnD592uEggAQG9gAV54N0Evvr6VdNu/nh/h3ZBQBAp1w+HeXjl7Iraq040rLXHmCdilfq+T300KFDnjECJDGwB6iBz/7ykg/UvWZ/PfSH4qHsAgCgk24suCK/B+y1B1ijPRPZBV3hKnyAXAb2ADWwsLAQ39y/LTujWZp2iplKKV/YnZ3QM8XomewEAKAbXJHfdfbaA6zSpp1RPHclu6LjXIUPkM/AHqAmjh8/7oN1j9hfT99758fZBb3ldBgA1JMr8rvOXnuAlXMVPgDdYmAPUCPbBq5lJzSD/fX0u3f+e3ZBbz3wcHYBANAtv74i30uzXVMcaUUcfMNee4A7efhkdkFXfHP/NlfhA/QBA3uAGmm1WhvGDzbnKuw09tfT75q2suG+P8guAAC6bX4kymObsytqqxg9Y689wO1sPRDF0QvZFV3hxk6A/mBgD1Azhw8f9kG725o2DKWSyplD2Qk9U4zNZycAAL1wcSrKJ9wq1k3F9FDE9iezMwD6x8BgFC9tzK7ois/+8pJniAB9wsAeoIa+/Ln3sxNqy1WcVMbPf5Jd0FubdmYXAAC9sNiKcuScz+VdVLz4QW2vfgZYrWJuX3ZCV3xz/7ZYWFjIzgDgQwb2ADU0Ozu7YWLMVYZd8fN/yi6AlXn7reyC3nqgng9RAIBbWGq7Ir/LiqMX7LUHqPHLS67CB+gvBvYANXXs2DEfvLvh7TezC2BlFs9nF/RW8cfZBQBAr7kiv6vstQcarcZ7612FD9B/DOwBaqrdbrsavxsWW9kFsDJL7eyCnrLHHgAayhX5XWevPdA4Nd5bP35wt6vwAfqQgT1Ajbkav7PKmUPZCbAqjXtwbY89ADSTK/K7rnjxg4g9E9kZAD1R1731ERGHDx92uh6gDxnYA9Scq/E7qPxRdgGszs//Kbugt+7/UnYBAJDJFfldVTx3JWJ4zl57oN4encku6JptA35GAvQrA3uAmmu32/H1L9yTnVEP71zKLoDVadpfs8W/yC4AALK5Ir+rirH55ZOnbjYC6mjXeBRH6rkKcfzg7mi1Wg71APQp/4AGaIg33njj5r89fiY7o9LK/fV9y5r6Ks6OZif0lL9PAYDf2DUexeT17IraKp96P+LqbHYGQGds2RvF9FB2Rdf87EczZkEAfcwJe4CGOHTokA/mQP25ohUA+DVX5HdV8dJGe+2BehgYrPWw/sufez87AYC7MLAHaAhX469P+cLu7ARYk/LE3uyE3tq6P7sAAOgnrsjvKnvtgVoYru+NlBNje2N2dtYhHoA+Z2AP0CCnT5/e8PLEoeyManr7rewCWJuf/2N2QW/ZYw8AfNJSO2J+JMpjm7NLaslee6DSHj4ZxWh9B/bHjh0zrAeoAAN7gIZxNf4a3fj/ZBfA2rx9Lrugp4ojrewEAKBfuSK/q4pXdkRsPZCdAbBy25+M4uiF7Iqu+fLn3o92u52dAcAKGNgDNEy73ba7ai3+5DvZBbA2NxayC3rP6S4A4HZckd9V9toDlbFpZxQvfpBd0TWuwgeoFgN7gAaanZ3dMDHWsL3W61SMzXvwRGWVMw1bhfHAvuwCAKCfuSK/q+y1B/rewODyrSA15ip8gGoxsAdoKB/cV6947krEFi86UEE//0l2QW8Vf5xdAABUwcWpKB+/lF1RS/baA33t0e9nF3TV179wj6vwASrGwB6goVyNvzbF9JCTIlTP229lF/RUMTafnQAAVMWNhSj3z0R5wou53WCvPdB3do3X+jvjyxOH4vTp0w7pAFSMgT1Ag7kaf22KOddtUzFXZ7MLes9pLgBgNV4fjfLpe7Iraslee6BvbNkbxeT17IquOnTokGE9QAUZ2AM03OjoqA/yazE8l10A3Ik99gDAal0+7Yr8LrHXHkg3MLh8a2KNuQofoLoM7AGIbQPXshMqpxibd0qESmncNa/22AMAa+GK/K6x1x5INXwmu6CrXIUPUG0G9gBEq9XaMH5wd3ZG5RTPXbGPkeoo/y67oKfqvJMQAOiB10ejfOr97Ipastce6LmHT0YxWu+BvavwAarNwB6AiIg4fPiwD/ZrULy0MWKL0zdUwDv/Pbug9/y9CQCsx9XZKEfOZVfUkr32QM9sPRDF0QvZFV3lKnyA6jOwB+A3PvvLS4b2a1BMD9nFSP+7sZBd0HsPPJxdAABU3VJ7+Yr8F9xI1mn22gNdNzC4/IJQjU2M7XUVPkANGNgD8BsLCwvx9S/ck51RScXcvuwEuKvy1HB2Qm8VD2UXAAB18eZhV+R3gb32QDc14VnN6OioYT1ADRjYA/Axp0+f3vDyxKHsjGoanssugDv7+T9lF/RU3XcUAgA99uEV+eWM70udZq890HGPzmQXdJ2bMgHqw8AegE85dOiQD/xrUIzN28NIf3v7zeyC3vPgFwDopKV2xGuPRPn8tuyS2rHXHuiY7U9GcaSVXdFVX//CPbGwsJCdAUCHGNgD8Cntdju+/DnXPa5F8dyViF3j2Rlwa4v1fmBxSw98NbsAAKij88ejfOJadkXt2GsPrNumnVG8+EF2RVeNH9xtbz1AzfiHOgC3dfLkyZtTr13Izqik8olrzRyO0veKs6PZCT1X7q//VYgAQJKBwYjhM1bxdEH5+KWIGwvZGUCVDAzWfm/9yxOH4pFHHjHXAagZJ+wBuK3Dhw/7ArBGxfSQUyH0pfKF3dkJvefvRQCgW359Rf6xzdkltWOvPbBqj34/u6DrrLEEqCcDewDu6LO/vOSLwBrV/a1uKurtt7ILem/r/uwCAKDuLk65Ir8L7LUHVmzXeBRj89kVXbVt4Fq02+3sDAC6wMAegDtaWFiIr3/hnuyM6nrUVdz0mauz2QW9V/yL7AIAoAkWW1Hun4nyxN7sklqx1x64qy17o5i8nl3RVV//wj3RarUcqgGoKf+AB2BFZmZmbh4/ZSf7WpTHNkdcnMrOgN+wxx4AoMu2PxnFix9kV9SOvfbApzRgb/34wd3WVgLUnBP2AKzIsWPHfDFYo2LyesQWp2zoH43cY79pZ3YBANAkl08vD5fpKHvtgU8ZPpNd0FUvTxwyrAdoAAN7AFak3W7HtgE7GdeqmB4yMKR/vPPj7ILee6DeJy4AgD50Y2H5ivwmvizZRfbaA7/x8MkoRus9sD906JBhPUADGNgDsGKtVmvDYw9tzs6orOKVHfYu0h+uns0u6L3P788uAACa6s3DUT71fnZFrdhrD8TWA1EcvZBd0VWf/eWlDe12OzsDgB7wdhYAqzY3N3fzyF/OZ2dUUjlzKOK1R7IzwB57AIBeGxiMGD5T+9OgvWavPTTQlr3LNxnW2LaBa9FqtcxvABrCCXsAVu1b3/qWLwxrVIyeWT4JAsnKE3uzE3pvSwP/OwMA/WOpHfHaI1E+vy27pFbstYeGGRis/bD+sYc2G9YDNIyBPQCrZp/9+hRj83Yukq/8u+yC3vv94ewCAICI88ejfML3qU6y1x4aZLjet5RMjO2Nqakpw3qAhjGwB2BN7LNfn+K5KxG7xrMzaLIG7rGv+35DAKBCFltRjpxr5q1HXVI8dyXi4Bv22kOdDc/Veq3IyxOHYnR01LAeoIH8wx+AdbHPfn3KY5sjLk5lZ9BQjdxjP3Ju+TpaAIB+sf3JKF78ILuiVsonrkUstrIzgE7aNR7F5PXsiq76VXluQ7vt+ypAEzlhD8C62Ge/PsXkdXu1SdPIE11b92cXAAB83OXTUT5+KbuiVorpoYjtT2ZnAJ3SgGH9toFrYVgP0FwG9gCsS7vdjs/+8pKh/ToU00OG9uRo4h77z/9pdgEAwKfdWIhy/0yUL+zOLqmN4sUPIh4+mZ0BrNeWvbUf1n/5c+9Hq9XybA2gwQzsAVi3hYWF+PoX7snOqDRDe1I0cY/92Hx2AgDA7b15OMqn3s+uqI3i6AV77aHKtuxdfl5SY489tDlmZ2cN6wEazg8CADrm5MmTN6deu5CdUWn2a9Nrjdxjb6cpANDvBgYjhs9EMXomu6Q2fAaEimnAsP7EM8MxMjJiRgOAE/YAdM7hw4d9yVinYm6f0x/0VCP32D/wcHYBAMCdLbUjXnskymObs0tqw157qJAGDOsjwrAegN8wsAego35VnvNlY50M7empBu6xL567kp0AALAyF6eifPxSdkVt2GsPFdCQYb3nZwB8lIE9AB3Vbrdj28C17IzKM7SnZxq4xz4i/P0FAFTHjYUo988082akLiiOXlheC+XzIPSfhgzrtw1ci3bbOkQAfsvAHoCOa7VaGx57yNWN62VoT08sNfQhwdb92QUAAKvz+miUT72fXVEbxdy+iC1egoC+MTDYiGH9Yw9tjlar5XQ9AB9jYA9AV0xNTW2YGPPwY70M7emF8oXd2Qm99/k/zS4AAFi9q7NRjpyLcuZQdkktFNNDEbvGszOAgcHl5x81N35wd0xNTRnWA/ApBvYAdM3o6KgvIZ3w6PezC6i7t9/KLui5Ymw+OwEAYG2W2hGvPRLl89uyS2qhmLwe8ehMdgY0V0OG9SeeGY7Dhw97TgbALfkBAUBXDQ4Oxu8U+25md1RdeWo4Yn4kO4MaK86OZif0XPnEtYjFVnYGAMDaNWTfc6+UI+eauzIKMjRkWB8R8avy3AZ76wG4HSfsAeiqdrsd2wauZWdUXjE2HzE8l50B9fL7w9kFAADrs9iKcv9MlCesI+sEe+2hhxo0rP/sLy8Z1gNwRwb2AHRdq9Xa8PUv3JOdUXmG9nRTE69ULY5eyE4AAOiM10ejfOr97IpasNceeqBBw/ovf+79WFhYyM4AoM8Z2APQE6dPn97wzf3NGwh2mqE9XfP2m9kFOTbtzC4AAOiMq7NRjpyLcuZQdknlFZPXfe+CbmnQsP6xhzbH7OystcQA3JWBPQA9c/z48Q0nnhnOzqg8Q3u6oqm73B9oxoMiAKAhltoRrz3SyNuTOq0Ym4/i7GjEwGB2CtTLo9/PLuiJE88Mx9TUlGE9ACtiYA9AT42MjPiy0gHF2HzEnonsDGqmkaexPr8/uwAAoPPOH4/yiWvZFbVgrz100PDc8vOMBvD8C4DVMLAHoOd+VZ7zpaUDiueu2K1IZ/30bHZBzxWjZ7ITAAC6Y7EV5f6ZKE8YNq9XMT3khWlYrwYN6z33AmC1DOwB6Ll2ux3bBpz26IRi8rqhPZ3z9rnsghzbn8wuAADontdHo3zq/eyKyiueu7K8mswV+bB6DRrWbxu4Fu12OzsDgIoxsAcgRavV2mBo3xmG9nTMjYXsghyf/9PsAgCA7ro6G+XIuWauQOqgYmx++Yr8TTuzU6A6GjSsf+yhzdFqtZyuB2DVDOwBSNNqtTY89tDm7IxaKCavR2w9kJ1BDTTxytSmPDwCABpuqR3x2iNRHvMdbL2KV3b4/gUr0aBh/YlnhmNqasqwHoA1MbAHINXU1NSG8YO7szNqoXhpY8SW5g1b6bDy77ILcvh7BwBoiotTUT5+Kbui8oqXNkY8fDI7A/pXg4b1EREjIyOG9QCsmYE9AOkOHz684cQzw9kZtVBMDxk8sj5Xz2YX5Ngxml0AANA7Nxai3D8T5Qtenl6P4uiFiINv2GsPn7RrvFHD+l+V5wzrAVgXP0gA6Bu/+9DozeyGuihHzi1feQlrUJxt5vC63D+TnQAA0HtbDyyfFmddyieuRSy2sjMg367x5bV9DbFt4Jq99QCsmxP2APQNbyR3TjG3z0l71qx8flt2Qg5/zwAATXR1NsqRc1GeGs4uqbRieihi13h2BuRq2LD+61+4x7AegI4wsAegb7TbbUP7DnI9Pmv29pvZBTkeeDi7AAAgx1I7Yn4kyqfvyS6ptGLyesSjbm2ioRo2rP/m/m1x+vRpz7AA6Ag/UADoO3v37r15ZWkoO6M2XM3IWrgWHwCgoTbtjOKVHdkVlWdNGY2yZe/yoYGGOPHMcIyMjJitANAxTtgD0HdardaGbQPXsjNqw9WMrEVjr0TdtDO7AAAg142FKPfPNHdNUodYU0ZjNGxYHxGG9QB0nIE9AH2p1Wpt+PLn3s/OqI1i8rqhPatT/jC7IMfv/+vsAgCA/nD++PJtXayZl6epvQYO661yBKAbDOwB6Fuzs7MbHntoc3ZGbRjasyqXX80uyFE8lF0AANA/FlvLp+1POCm+VsXk9YjhuewM6LxNOxs5rG+3rboAoPO8DQZA35uZmbl5/JQd7J1SHtsccXEqO4MKaOwee/tGAQA+beuBKF7amF1RaeXjlyJuLGRnwPoNDC6vfWiQbQPXotVqmacA0BVO2APQ90ZHRze8PHEoO6M2isnrEY/OZGdQAeULu7MTcmz/RnYBAED/uTob5ci5KGd8N1ur4pUdEVsPZGfA+hjWA0DHGdgDUAmHDh3yxaiDiiMt1zJyd/9zPrsgx+f3ZxcAAPSnpXbEa49E+fQ92SWVVby0MWLPRHYGrI1hPQB0hYE9AJXQbrfjV+U5X5A6qBibN7TnzhabuYqiGD0TMTCYnQEA0L8un16+3p01KZ67EnHwDZ85qRbDegDoGgN7ACqj3W7HtoFr2Rm1YmjP3ZSnhrMTcrgWHwDgzm4sRLl/Jsrnt2WXVFIxemZ5+Lllb3YK3J1hPQB0lYE9AJXSarU2GNp31m+G9k53cCs//UF2QY7ij7MLAACq4fzxKJ/wHW2tiumhiO1PZmfA7RnWA0DX+aEDQCWNj4/f/JsfXc/OqJ1y5NzyXkr4tQY+nPm1cv9MdgIAQLU8fDKKoxeyKyqpPLE34vXR7Az4uE07o3hlR3ZFTxnWA5DBCXsAKmlqamrDYw9tzs6onWJun5P2fFyTX+Bw0gkAYHXePBzlU+9nV1RScaQVxdlR38foH1v2GtYDQI8Y2ANQWVNTUxu+ud++xE4ztOeTGruX9PN/ml0AAFA9V2ejHDm3fGKcVbPXnr6wZe/yuoYGMawHIJMfQABU3tzc3M0jfzmfnVE7rsfnNxp4DeKvuRYfAGAdtj8ZxYsfZFdUUnlsc8TFqewMmsiwHgB6zgl7ACpvZGRkw4lnhrMzasfJDn7jxkJ2QR7X4gMArN3l08un7WcOZZdUTjF5PWJ4zu1n9NauccN6AEhgYA9ALRjad0cxPWRoT0REc680dS0+AMD6LLUjXntk+cQ4q1KMzS+/SL1pZ3YKTbBrfPlFkQYxrAegXxjYA1AbhvbdYWhPRET89P+dXZCiGJvPTgAAqIeLU1E+fim7opKKV3ZEbD2QnUGd7ZkwrAeARAb2ANSKoX13FNNDEbvGszPIdHU2uyCPa/EBADrjxkKU+2eifH5bdknlFC9tjHj4ZHYGdTQ8F8VzV7IresqwHoB+Y2APQO2MjIxseHnCjsROKyavG9o3XHlqODshh2vxAQA66/zxKJ+4ll1ROcXRCxEH37DXns4YGFwe1jfsVjHDegD6kR9MANTS4OBg/E6x72Z2Rx2Vz2+LOH88O4MM25+M4sUPsitSlPtnshMAAOrp4ZPLg2hWpXziWsRiKzuDqhoYjGJuX3ZFzxnWA9CvnLAHoJba7Xb8qjznS1gXFM9diRiey84gw9Wz2QV5XIsPANAdbx522n4NrC1jzbbsNawHgD5jYA9AbRnad08xNm9o30RL7ShnGrpuwrX4AADds9iKcuRclCf2ZpdUSjF5PeJRN0GxClv2Lr/s0TCG9QD0Oz+kAKg91+N3VzlyLmKpnZ1Br+waX34w2ED+WgcA6IGtB6J4aWN2ReX4rMpdNfS7nGE9AFXghD0AteekfXcVc/siNu3MzqBXLr+aXZBn+zeyCwAA6u/q7PJp+1PD2SWVUszti9h6IDuDfvXwScN6AOhjBvYANIKhfXcVr+yI2OL6ykZo8qmdz+/PLgAAaIaldsT8SJRP35NdUinFSxsj9kxkZ9BvhueiOHohu6LnDOsBqBI/sABonLm5uZtH/nI+O6OWymObIy5OZWfQbXsmonjuSnZFCleNAgD02MBgxPCZKEbPZJdURjlzKGL+kM+tTTcwuHzzQgMZ1gNQNU7YA9A4IyMjG048M5ydUUvF5HUnOprgf/5tdkEe1+IDAPTWUjvitUectl+FYvTM8qDWLWjNtWWvYT0AVIiBPQCNZGjfPcVzVyKG57Iz6KYbC9kFeVyLDwCQ4/Lp5duOWLFieihi+5PZGfTa1gPLf+4byLAegKrywwuARnM9fne5PrzGHj7ZyD2IERHl45ea/dICAEC2Bq9oWovyxN6I10ezM+iFXePLN981kGE9AFXmhD0AjeakfXe5hrHG/ud8dkGe3//X2QUAAM12/vjyS5SsSHGkFcXZ0YiBwewUuunRGcN6AKgoA3sAGs/QvruK6aGIXePZGXTaYiu7II3TXAAAfeDGQpT7Z6J8flt2SWV4obqmBgYjDr4RxZFmfkd77KHNhvUAVJ6BPQCEoX23FZPXIx6dyc6gw8oTDX7Yt2lndgEAABFO269SMT0UsWciO4NOGRiMYm5fFKNnsktSPPbQ5piamjKsB6DyDOwB4EOG9t1VHGlFHHzDNYx1cqnBL2F85c+zCwAA+DWn7VeleO5KxPCc72ZVt2Xv8q0JDWVYD0Cd+IEGAJ8wNzd388hfzmdn1Fr5+KWIGwvZGXRAcXY0OyFNub/BLywAAPSrTTujeGVHdkVllE9ca/S6q8raNd7YffURhvUA1I8T9gDwCU7ad1/xyo6IrQeyM+iARl+Lb/8nAED/cdp+VYrpoYjtT2ZnsBp7JgzrDesBqBkDewC4BUP77ite2hixazw7g/Vq9LX4f5ZdAADA7dhtv2LFix9EPNrgz/VVMjy3vNKgoQzrAagrP9wA4A5cj9995anhiPmR7AzWwbX4AAD0tYdPRnH0QnZFJZQj5yKW2tkZfNLAYKP31UcY1gNQb37AAcBdGNr3hgdDFfboTBRHmrn3sjy2OeLiVHYGAAB3s2Xv8vXv3JW99n1m087ltXINZlgPQN25Eh8A7sL1+L1RzO2zE7yqmnwt/uf3ZxcAALASi63l3fYv7M4u6XvF9FDEnonsDCKWXzQxrDesB6D2DOwBYAVGRkY2vDxxKDuj9orpIXvtq6jBp2+K0TMRA4PZGQAArNSbh5dPkHNHxXNXIobnfNbNtGu88bdCGNYD0BR+2AHACg0ODsbvFPtuZnc0QfnC7og3D2dnsBpNvhb/+W0R549nZwAAsFp226+IK/IT7JlYfmmiwQzrAWgSP/AAYJXstO+NcuZQxPwhe+2rouE7Qcv9DV4LAABQZQ3/HLtS5dP3RFw+nZ1RfwODEY9+P4qx+eySVNsGrkWr1TK7AKAx/NADgDU4efLkzanXnMToBac5qqM4O5qdkMZfpwAAFee0/V2VJ/ZGvN7cz/xdNzAYxdy+7Ip0hvUANJEd9gCwBocPH97w2EObszMaoZgeitj+ZHYGK1Ce2JudkGeHB5cAAJVmt/1dFUdayy/p2mvfeVv2GtaHYT0AzeWHHwCsw5NPPnnzP/+PD7IzGsFe+wpo+HWirsUHAKgJp+3vyg1THbRrPIrJ69kV6X5VntvQbluJB0AzOWEPAOtw+vTpDdsGnMLoheLohYiDbzjN0c+a/sDOTRAAAPXgtP1dFdNDEXsmsjOqb3iu8cP6lycOGdYD0HhO2ANAB+zdu/fmlaXmnizuNac5+tijM1Ecaeafm3LmUMRrj2RnAADQSU7b31F5ajji9W9FLBm2rop99RERceKZ4RgZGTGjAKDx/DAEgA4ZHByM3yn23czuaIry2OaIi1PZGXxS06/FHznnYSUAQN00/DPuSnipehX89RQREeMHd8fhw4fNJwAgXIkPAB3TbrfjV+U5XzZ7pJi8HvGoneF9p+kP6Xb9u+wCAAA6bbEV5f6ZKF/YnV3St4rpoYhd49kZ/W/XuGF9RDz20GbDegD4CD8UAaAL5ubmbh75y/nsjMYoH78UcWMhO4Nf2zMRxXNXsivSlPu9SAIAUFtOR99ReWJvxOuj2Rn9Z2Aw4tHvRzE2n12SbtvAtWi1WuYSAPARfjACQJcY2vdW+fQ9EZdPZ2cQEbFpZxSv7MiuSOM6UACABrDb/o6sivqIhn8/+ijDegC4NVfiA0CXjIyMbHjsoc3ZGY1RvPiBK/L7RdNvO/jKn2UXAADQbW8eXn5Rk1sq5vZFbD2QnZFv+5OG9R/6VXlug2E9ANyaH5AA0GXj4+M3/+ZH17MzGsUV+X1g13gUk839696JIgCABnHa/rbK57dFnD+enZHDXxcREXHimeEYGRkxhwCAO3DCHgC6bGpqasOXP/d+dkajFK/siNj+ZHZGs11+Nbsg1/ZvZBcAANArbx5efmmYTymeuxJx8I3lHe5NMTAYxdlRw/qI+Ob+bYb1ALACflgCQI/s3bv35pWloeyMRilPDUe8/i0nnbMcfCOK0TPZFWnK/VY0AAA0zp6J5SE1n1I+cS1isZWd0V1bD0Tx0sbsir7w9S/cE6dPnzZ/AIAV8AMTAHpo586d8Yt/vuNmdkfTNOLBUD9q+rX4VjMAADTTpp32lt9GeWxzxMWp7IzucAX+b2wbuBb21QPAyvmhCQA9Njg4GL9T7DO077Hyhd0Rbx7Ozmic4uxodkKa8sTeiNeb+98fAKDxGv4C6+2Up4Yj5keyMzpnYDCKuX3ZFX3jV+W5De22W+4AYDUM7AEgweDgYHz/+9+/eeQv57NTGsep5x4bnotibD67Io1r8QEAGm5gMGL4TKNXRd1OLb6buQL/N048M2xfPQCs0f+RHQAATdRut2NkZGTDiWeGs1Map3hlR8Su8eyM5rj019kFufy1BgDQbEvtiNceifLpe7JL+k7xyo6I7U9mZ6zdwycN6z/02EObDesBYB38EAWAZBMTEzf/09kr2RmNU54ajnj9W8sP0OiqJl+LH+GUPQAAH3La/pYqt77MFfgf8+XPvR+zs7PmDACwDn6QAkAfGB8fv/k3P7LbMEP5xLWIxVZ2Rr09OhPFkeb+b1yLqz4BAOgc16jfUjlyrv9fqPbn7mM++8tLGxYWFrIzAKDyXIkPAH1gampqw7aBa9kZjVRMD0XsmcjOqLe//152Qa6v/Hl2AQAA/eTqbJQj56I8sTe7pK8Uc/sitvTx/yaPzhjWf+jliUPxq/KcYT0AdIgT9gDQR/bu3XvzytJQdkYjlTOHIuYP9f+JjopyLb5r8QEAuAUntj+lfH5bxPnj2Rm/tWlnFK/syK7oG+MHd8fhw4fNFQCgg/xgBYA+Mzg4GL9T7LuZ3dFU5VPvR1ydzc6on13jUUw2d+1DeWxzxMWp7AwAAPrRwGDEn0w2eo3UJ/XNC9UN/x7zSV//wj1x+vRpMwUA6DBX4gNAn2m32/Gr8tyGE88MZ6c0UvHSxohHnYbuuMuvZhek8pAPAIDbWmpHvD4a5RPWpP1aMXom94r8gcGIg2/4HP8R2wauGdYDQJf4AQsAfWxmZubm8VNOWWQpn7gWseh//44ZnotibD67Io2/ngAAWJGHT0Zx9EJ2Rd/o+W1V1hR8yq/KcxvabevjAKBbnLAHgD42Ojq64bGHNmdnNFYxPRSxZyI7oz5++oPsglxf+bPsAgAAquDNw07bf0Qxeb13t6A9fNKw/iNOPDMcP/vRjGE9AHSZE/YAUAF79+69eWVpKDuj0crHL0XcWMjOqLzi7Gh2Qqpy5Fz+Hk4AAKpjz0QUz13JrugbXftetmlnFK/s6PyvW2GPPbQ5pqamzA8AoAecsAeACmi1Whs++8tLvignKl7Z4bR9B5QnknZQ9otd/y67AACAKjl/fHlITUR8+L1s64HO/qJ7JgzrP+HLn3vfsB4AesgPXQCokMHBwThz5szNf3v8THZKY5UzhyLmDzklvVZOrkS5v0fXeQIAUC+7xpevhyfKF3ZHvHl4fb/IwGAUc/s6E1Qjn/3lpQ0LCwvZGQDQKAb2AFBBJ0+evDn12oXsjEYrn74n4vLp7IxKavy1+E+9H3F1NjsDAIAqGhiMGD4TxaiXuCPWsXJq+5NRvPhB54Mq7OWJQ3Ho0CH76gEggSvxAaCCDh8+vOHrX7gnO6PRihc/iDj4xvIDM1alPLY5OyHXV/59dgEAAFW11I547ZHlF4hZPiG/ZRVrtwYGIw6+YVj/CRNje+ORRx4xrAeAJE7YA0CF7d279+aVpaHsjMZz2n6VXD25vIf0xkJ2BgAAVTYwGPEnk1EcaWWXpCuf3xZx/vid/6CtB6J4aWNvgirksYc221cPAMmcsAeACmu1Wht+VZ7b8PLEoeyURite/GD5mvdNO7NTqmGpHeWp4eyKXF/58+wCAACqbqkd8fro8sqlhiueu3L7G9AGBiMenTGsv4VtA9cM6wGgD/hhDAA1MTExcfM/nb2SndF4KzrZQcSWvVFMN/t2iHL/THYCAAB18vDJKI5eyK5IVz5xLWLxw1sHnKq/rV+V51yBDwB9wsAeAGrEFfn9w5Xnd1ecHc1OSFUe2xxxcSo7AwCAOvFibERElN8uIj77f7cu4BYmxvbG6OiouQAA9BE/mAGgZgYHB+N3in03szuIKF/YHfHm4eyM/rVrPIrJ69kVqZyyBwCgK/ZMLF8TDx9hXz0A9Cc/nAGgpmZmZm4eP+U0QT/42JWM/NbAYBRz+7IrUpVPvR9xdTY7AwCAOhoYjBg+E8XomewS+sC2gWvRarXMAwCgD/0f2QEAQHeMjo5u+PoX7snOIGL5SspHZ5YfmPFbS+0oTw1nV+T6yr/PLgAAoK6W2hGvPbL8kiiN9fLEofhVeW6DYT0A9C8/pAGg5uy17y9OVH/C1gNRvLQxuyJV+filiBsL2RkAANTZwGDEn0za6d4w39y/LY4fP24GAAB9zgl7AKi5Vqu14VfluQ0nnhnOTiFieTh98A2n7X/NywsRX/nz7AIAAOpuqR3x+ujyui4aYdvANcN6AKgIP7ABoEEmJiZu/qezV7Iz+FD5/LaI88ezM/LtGo9i8np2Rapy5NzyQ1QAAOiFPRNRPOe7YV39qjy3od32/QIAqsLAHgAaxhX5/ad84lrEYoOvphwYjGJuX3ZFKi9vAADQc5t2RvzL/xDF6JnsEjpk/ODuOHz4sGf+AFAxfngDQAMNDg7G7xT7bmZ38FvlC7sjzn+3uaesh+eiGJvPrkhV7p/JTgAAoIm2PxnFix9kV7BOX/7c+zE7O+t5PwBUkB/gANBgMzMzN4+favDJ7j5UPvV+M/e6b9kbxXSzb34oj22OuDiVnQEAQBMNDEb8yWQUR3w/rCJX4ANAtf0f2QEAQJ7R0dENX//CPdkZfETx0saIg28sPzBrkiavBPhQMXk9OwEAgKZaake8Prr8AjGVMX5wd/zsRzOG9QBQcU7YAwCxc+fO+MU/3+GK/D7TuL3mu8YbP7Ru7A0LAAD0l4dPRnH0QnYFd7Bt4Fq0Wi3P9wGgBvxABwB+Y25u7uaRv5zPzuATyscvRdxYyM7oieLsaHZCqvLUcMT8SHYGAABEbNoZxSs7siv4hJcnDsWhQ4ecqgeAGnElPgDwGyMjIxsee2hzdgafULyyI+Lhk424Jr88sTc7IVUxNh+xaWd2BgAARNxYiHL/TJTHfEfsF9/cvy0eeeQRw3oAqBkn7AGAT9m7d+/NK0tD2RncQu2vTHeKZ/mlhdebfdMAAAB9ZmAw4tHvL79gSgpX4ANAfTlhDwB8SqvV2vCr8tyGE88MZ6fwCcVLGyMOvlHfU9g3FqKcOZRdkao40mrEbQoAAFTIUjtifmT5BWJ6amJsb/yqPLfBsB4A6ssPeQDgjsbHx2/+zY+uZ2dwC+ULuyPePJyd0Xnbn4zixQ+yK1LV9s8tAAD18PDJKI5eyK6ova9/4Z44ffq0Z/gAUHN+2AMAd+WK/P5Wx2vyi7OuhC/3z2QnAADA7Vln1VW/Ks/ZVQ8ADeFKfADgrn59Rf7E2N7sFG6hjtfkl89vy07It2s8uwAAAG7vxkKU+2eifPqe7JJa+eb+bfGzH80Y1gNAgzhhDwCsypNPPnnzP/+PZl9X3s9qc5X6wGAUc/uyK9I5ZQ8AQCUMDEb8yWQUR1rZJZW2beBa2FUPAM3jhz8AsGo7d+6MX/zzHTezO7i98ul7Ii6fzs5Yn+G5KMbmsytSlcc2R1ycys4AAICV2bI3imnr1FZrYmxvjI6OelYPAA3lQwAAsGYnT568OfXahewM7qB8/FLEjYXsjLWxEzMinLIHAKBifI5flS9/7v2YnZ31nB4AGswOewBgzQ4fPrzhy597PzuDOyhe2RHx6MzyFZVVU9UXDTpt64HsAgAAuLuBwYhHZwzrV+jEM8Pxq/LcBsN6AMCHAQBg3QYHB+P73//+zSN/OZ+dwh2Uz2+LOH88O2N1tj8ZxYsfZFekc8oeAIC+tms8isnr2RWV8fUv3BOnT5/2bB4AiAgDewCgg5588smb//l/GK72u/Kp9yOuzmZnrFhxdjQ7IV35xLWIxVZ2BgAAfNzWA1G8tDG7ojJenjgUhw4d2tBut7NTAIA+4kp8AKBjTp8+veFX5bkNL08cyk7hDoqXNi4PwbfszU5ZkfL5bdkJ+b7yZ9kFAADwWwODEcNzhvWr8NhDm+ORRx4xrAcAPsUJewCgKyYmJm7+p7NXsjO4i/LUcMTr34pY6uOHRgODUczty65IVz5+KeLGQnYGAABN9/DJKI5eyK6olM/+8tKGhYWF7AwAoE8Z2AMAXbNz5874xT/fcTO7g7srX9gdcf67/Tu4f3QmiiPNvhK+PDUcMT+SnQEAQFNtfzKKF61AW41v7t8Wx48f9wweALgjHxYAgK5z2r46ymObIy5OZWd82qadUbyyI7sinVP2AAD03Ja9UUwPZVdUjlP1AMBK2WEPAHTd8ePHN3z2l5fstq+AYvL68n77rQeyUz7uxkKUM/76ia99O7sAAICm+PWeesP6Vfnm/m3xsx/NGNYDACvmhD0A0FPj4+M3/+ZH17MzWKHyqfcjrs5mZyzbeiCKlzZmV6Rzyh4AgK6zp35NnKoHANbCCXsAoKempqY2fPaXl7w0WBHFSxsjhuciNu3MTumfFwey7XwiuwAAgLraNR7F2VHD+lVyqh4AWA8PywGANCdPnrw59ZoHQVVRnhqO+K/fyT3dvWs8ikk3NJQj5yKW2tkZAADUhdus1uTliUNx6NChDe22z+YAwNo5YQ8ApDl8+PCGbQPXsjNYoWJsPopXdkQ8fHJ5n2WGi1M5v2+/2fNsdgEAAHWwaWfEwTcM69fg61+4Jx555BHDegBg3ZywBwD6gtP21VO+sDvi/Hd7f9J7z0QUz13p7e/Zh5yyBwBgzQYGI/Y86+r7NXCqHgDoNAN7AKBvHDhw4OZ/+19OdlRNeWxzb0++DwxGMbevd79fnypf2B3x5uHsDAAAqsaaqTX78ufej9nZWc/UAYCO8uECAOgrg4ODMTk5efP4qVZ2CqvU08H9wyedBgqn7AEAWAV76tdsYmxvHDt2zKl6AKArDOwBgL7ktH119WRwv2lnFK/s6O7vUQFO2QMAcFebdkb8y/8QxeiZ7JJK2jZwLVqtlufoAEDX+KABAPStwcHBePbZZ+22r6jy6XsiLp/u3m8wPBfF2Hz3fv2KcMoeAIBb2rQz4mvf9pl5jcYP7o7Dhw97fg4AdJ0PHABA39u7d+/NK0tD2RmsUfnU+xFXZzv/CztlHxFO2QMA8AkDgxGPft+gfh0++8tLGxYWFrIzAICGMLAHACrj5MmTTttXWFcG9wffcLVnOGUPAEAsD+r3PBvFUd+Z1urrX7gnTp8+7Zk5ANBTPnwAAJWyc+fO+MU/33Ezu4O16+jgfuuBKF7a2Jlfq8KcsgcAaDCD+nWbGNsbx44d29BuewkWAOg9A3sAoJImJiZu/qezV7IzWIdODe6Ls6MdqKk+p+wBABrGoL4jvvy592N2dtZzcgAgjQ8iAEBlDQ4OxpkzZ27+2+OuRK+ydQ/unbKPCKfsAQAaY9POiK/8eRRHWtkllfbN/dvi+PHjno8DAOl8IAEAKu/JJ5+8+Z//xwfZGazTegb3TtkvKx+/FHFjITsDAIBu2LQz4mvfjmJsPruk0l6eOBR/8Rd/sWFhYSE7BQAgIgzsAYCaGBwcjGefffbm1Guug6y6NQ3ud41HMXm9O0EVUp4ajpgfyc4AAKCTDOo7xvX3AEA/8uEEAKiVvXv33ryyNJSdQQesdnDvlP0yp+wBAGpi64GIr/z7KEatAFuv8YO74/Dhw56FAwB9yYcUAKCWxsfHb/7Nj5y4roMVD+6dso8Ip+wBACpv64EoXtqYXVELrr8HAKrAwB4AqK3BwcH4/ve/f/PIX85np9AB5bHNERen7vjHOGW/zCl7AIAK8gJqR7n+HgCoCh9YAIDaO3DgwM3/9r+cUKmLOw7uPeSMCKfsAQAqY2AwYte/i+K5K9klteH6ewCganxwAQAaY2Ji4uZ/OutBWF3cbnDvlP2yFa8SAACg9wYGI/Y8G8XRC9kltXHimeH4zne+4/p7AKByDOwBgEZxTX79lMc2R1x+NWKpvfwvOGX/G+X+mewEAAA+atPOiK99O4qx+eySWnH9PQBQZT7EAACNtHfv3ptXloayM+ig8oXdEee/G7HUdsr+Q07ZAwD0ia0HInb8G4P6Dnvsoc0xNTXlGTcAUGk+zAAAjTY+Pn7zb37kNHadlC/sjvi//bMonv5RdkpfcMoeACDR1gNRvLQxu6J2Jsb2xrFjxza02+3sFACAdTOwBwAab3BwMJ599tmbU6/ZH0n9OGUPAJDAmqau+ewvL9lTDwDUioE9AMCHdu7cGb/45ztuZndApzllDwDQIwb1XWNPPQBQVz7gAAB8woEDB27+t//l2krqozy2OeLiVHYGAEA9DQxG7Hk2iqNu7OqGb+7fFsePH/ccGwCoLR90AABuY2Ji4uZ/OnslOwM6wil7AIAOM6jvKnvqAYCmMLAHALiDwcHB+P73v3/zyF/OZ6fAupQv7I5483B2BgBA9RnUUEd3sQAA6UJJREFUd9XLE4fiL/7iL+ypBwAaw8AeAGAF9u7de/PK0lB2BqxLOXIuYskJJQCANdm0M2LnEwb1XWRPPQDQRD78AACswvj4+M2/+dH17AxYE6fsAQDWYNPOiK99O4qx+eyS2nrsoc0xNTXlWTUA0Eg+BAEArNLg4GA8++yzN6dec7KG6ikfvxRxYyE7AwCg/xnUd934wd3x3e9+1556AKDRDOwBANbIfnuqqDw1HDE/kp0BANC/th6I+Mq/j2L0THZJbU2M7Y1jx44Z1AMAhIE9AMC62W9P1ZRPvR9xdTY7AwCgv+waj2LS+qtuenniUPzFX/zFhoWFhewUAIC+YWAPANAhBw4cuPnf/tfG7AxYkXL/THYCAEC+gcGIPc9GcdS6q2778ufej9nZWc+jAQA+wQckAIAOGx8fv/k3P3Iyh/5WPn1PxOXT2RkAADm27I34yp/ZT98DBvUAAHfmgxIAQBcMDg7Gs88+e3PqNSd16F9O2f//2fv/0LrPO2/4vDRJuEXCksS7pnEO9kkGLZ02ia3EJQ9WiRefmFIxDEhPhG+n5ZFIUNDMbMZmulILvVFL53AHMtF0Vm7oNFTEyDB1NshIUIzmCcrxPi6WIZukx07d7h9iJsfipPeDIY1vNlk/T/Ce/SOV6zj+oR/nnOv74/WCYRLXOeedWDr6fr/v6/pcAECudBZC+MrTxt63yb6ezWFiYsLzZwCAW3DBBADQQoVCIbzwwguN8VcqsaPAF9T+oSuE0+OxYwAAtNa93SH8D38figddk7fD6P6d4cCBA547AwCskgsnAIA26O7uDj/84Q8bB1+aix0FPqfWvxDCpXrsGAAAzWU3fduVR0rh+9//fke97toSAGAtFPYAAG3U3d0dPrxzRyN2DlhRmyyF8G9DsWMAADSHs+nbbnKsL/zoRz/qqFarsaMAAKSSwh4AIIKBgYHGWx/cFTsGhBBCqH3rTAh/qMaOAQCwPvd2h/AXT4XiD5ZiJ8mdx+//OMzMzHjGDACwAS6mAAAiUtyTFLXe6dgRAADW5tHREL7cG4pDR2InyR1FPQBA87ioAgBIgOHh4cYbv/00dgxyrPadO0L43VTsGAAAN2fkfVT7ejaHiYkJz5QBAJrIxRUAQIKMjo42Xl+8EDsGOWWXPQCQSPd2h9D9bCh+953YSXJLUQ8A0DousgAAEkhxTwy1f9wZwokDsWMAAITQWQjhK0+H4guuiWNS1AMAtJ6LLQCABFPc0261b50J4Q/V2DEAgLz6ynAIX/5LI+8jU9QDALSPiy4AgBRQ3NMutVf6Qpjrjx0DAMiTLaUQdgyF4sFK7CS5942v3hGmpqY8MwYAaCMXXwAAKaK4px1qf/txCP8xEzsGAJBl93aH8BdPheIPlmInIYTw+P0fh5mZGc+KAQAicBEGAJBCintardY7HTsCAJBFj46G8OXeUBw6EjtJ7k2O9YV//dd/VdQDAETmYgwAIMUU97RK7R+6Qjg9HjsGAJAFW0oh/A9/51z6hJgc6ws/+tGPOqrVauwoAAAEhT0AQCYo7mmFWv9CCJfqsWMAAGnUWQjh0b828j5BRvfvDC+++GJHve76DgAgSRT2AAAZorhvnsWfPhN6/vZw7BhR1V7pC2GuP3YMACBNvjIcwo6njbxPkH09m8PRo0cV9QAACaWwBwDIoIGBgcZbH9wVOwYZUPvbj0P4j5nYMQCAJLu3O4TuZ0Pxu+/ETsJVvvHVO8LU1JTnvwAACeeCDQAgwxT3NEOtdzp2BAAgae7tDuEvnjLyPmEmx/rCT37yk1CpVDz3BQBICRduAAA5UCqVGn/3d38XDr40FzsKKVT7h64QTo/HjgEAxNZZCOErT4fw5V4j7xNmdP/O8Oqrr3ZUq9XYUQAAWCOFPQBAjnR3d4cf/vCHDcX9rb058Z/Dk6P/j9gxEqPWvxDCJeeeAkDuKOkTzfn0AADpp7AHAMih7u7u8OyzzzYmXnPO6I3Mfa8n9L24GDtGYtRe6Qthrj92DACgHYy7Tzzn0wMAZIeLOgCAHCsUCuF73/ue4v46jv39zvC1LSEUv+u/zYra334cwn/MxI4BALSCkj7xJsf6wo9+9CNj7wEAMkZhDwBACCGE0dHRxuuLF2LHSIxf/KAvfP2950Nxdm/sKIlS652OHQEAaBYlfSqM7t8ZXnzxRWPvAQAySmEPAMDnKO7/pNY7HcKjo6H4gv8eK2r/uDOEEwdixwAA1mtLKYQdQ6F4sBI7Cbewr2dzmJiY8PwWACDjXPABAHBdAwMDjb/5m78Jz4wfiR0lmpXd5MX5ochJkqX2rTMh/KEaOwYAsFoPDoTw5b9S0qfE4/d/HGZmZjy3BQDICRd+AADcVHd3d/jhD3/YOPjSXOwobXdl/PuDA6H407vihkkYo/EBIOG+MhzCl/8yFEfmYidhFZxPDwCQXwp7AABWpVAohO9973uNidfeiR2lbT5XSvfNeuB9ldp37gjhd1OxYwAAKzoLIXzl6RC+3BuKQ/mdkJQ2o/t3hldffVVRDwCQYwp7AADWLC/n3H+usO8shOLs3nhhEqjWvxDCpXrsGACQX/d2h/AXT4XiD5ZiJ2GNRvfvDC+++GJHve5aCgAg7xT2AACs28DAQOOtD7I7Kv4LY9/3HArF7+ZnwsCt1CZLIfzbUOwYAJAvzqNPtX09m8PExIRnsgAAXOHiEACADSuVSo3/8l/+S3hmPFvjV693TntxXkF9tdrffhzCf8zEjgEA2WXUfSYo6gEAuBEXiQAANEWhUAi3Ffc2YudopusV9uHBgVD8aXanCqzHdf87AQDrt6UUwl/0meyTcofLg+Ff/uVfwszMjGewAADc0J/FDgAAQDbk5vxNu8m/aM+h2AkAIN06CyF8ZTiEvtlQnB8KxVe3KutTbHKsL2z65EzHk08+2aGsBwDgVlwwAgDQNNt6hrK/wz6EEO7tDsVf7GhvmISrfetMCH+oxo4BAOlhF33mPNfbFX72s5915GYhKwAATaGwBwCgaXJT2IcQwp5DHrBfw2h8ALiJe7tDeGBvCMWvh+LIXOw0NImx9wAAbNTtsQMAAEAqnX4xhLA3dopk2VUO4fR47BQAkBxfGQ6h+EQoHqz88RcuhBDmIgaiWUb37wyvvvpqx5NPPhk7CgAAKWflJwAATZO1HfYL/5eF8H++8yYjTb8yHIo//rR9gVLAaHwAcm1LKYQH9oTiD5ZiJ6EFDpcHw9GjR8PU1JRnqgAANI0d9gAAcAP/v/t2hfDfZ278G343FUIYalueNCj+Ykeo9VZjxwCA9vhjQR+KPaE4dOSPv6isz5rnervCsWPH7KYHAKAlFPYAALABtW+dCcVf7IgdI1keHQ3h1xOxUwBA8133HPqloKTPnsmxvvCTn/wkVCqVjvHF2GkAAMgy45sAAGiarI3Ef+M/fxy+fLMd9iv2HArF777T+kApUutfCOHSTY4TAIA0uG5BT1YdLg+G+fn5MDEx4ZkpAABtY4c9AABs1OkXQwh7Y6dIlr4jIbxmbCwAKbOlFMJ9j11T0F8IIczd+J8h9Z7r7Qo/+9nPOp58cjp2FAAAcshqUQAAmia3O+xDCOHBgVD86V2tDZQyte/cEcLvpmLHAIAbu+4Z9ORBeaQU/vmf/7mjWq3GjgIAQM4p7AEAaJqsFfZz/+PH4dH/7yoL+xBC2P+mh/3XMBofgMToLISwZVcID+x2lE1OlUdKYXp6OlQqFc9EAQBIDCPxAQDgBj75P+0IYXkNhf3//H8LIexoWZ5UMhofgFiuO94+hBCU9XkyOdYXjh8/HqampjqGFo28BwAgeawmBQCgaWZnZxsHX5qLHaNpjv39zvC1//eBtf1Du8qh+IOl1gRKKaPxAWi5zkIID/aGcN92u+f5XEkfOwsAANyKHfYAADTN8vJy7AjxnR4PIQzFTpEoxR9/Gmr9BaPxAWiOq0bbhy89dNVxNJ8Gu+fz63B5MMzPz4ejR4929PfbSQ8AQHoo7AEAoMlqzy6H4qtbY8dIFqPxAViPq8v5u7deZ7S9gj7Pri7pn3xSSQ8AQDop7AEAoNl+Xwm1yelQPFiJnSQxikNHQu0fyn+cQAAA13Fvdwj3dF1n53wIynmu9lxvVzh27FjHk09aDAgAQPop7AEAoBX+n98PIeyNnSJRij9YCrVvdYfwh2rsKADE9uBACPc8EMKXHrnOAjflPF+0UtJXq9Uwvhg7DQAANI/CHgAAbuC//+8b+Icv1UPtO3eE4o8/bVqeLCj+Ykeo9VZjxyCGR0dD8YULoTZZCuF/uxjC+ydDuPRhCL83iQIy78GBG+yavxBC8BnAjZVHSmF6ejpUKpUOJT0AAFnVETsAAADZcejQocbEa9naEVfr3eB5qPvfvKacoPYPXUbj580fy/pb+VyZ/9GSaQyQRltKIdz32A12zsOtTY71hePHj4epqSnPLQEAyAUXvgAANM3w8HDjjd9ma0f5hgv7zkIozhqNf63as8t2VufFKsv6W7EzHxKmsxDCll0h3LcjhC89HIojc7ETkWKHy4Nhfn4+TExMeFYJAEDuuAgGAKBpBgYGGm99cFfsGE214cI+hBB2lUPxB0sbf52Macp/W5JtSykUX93a8repTQ+G8L+eC+HSxRD+2xmFPjTTvd0h3NP1WTF/9za75mmqq8+lBwCAvFLYAwDQNAr7GyvODzXldbKk9o87QzhxIHYMWqVNZf1qXCn0Q/hsh34IIfzHTLxAkDRbSiF0bvqslO+8OxS/m63jbUiWq8+lj50FAACSwIUxAABNo7C/iXu7Q/EXO5rzWhlS+9uPFadZlKCyfrVqr/SFcHH5T7v0Q/C1SXY8OPDZ//9jIR++9FAoDh2Jm4lcGd2/M8zNzSnpAQDgOlwkAwDQNAr7W9hzyK7F66j1L4RwqR47Bs2SwrJ+tZT6JM7KOfIhhPDA7s/+/91bnSdPIhh3DwAAq6OwBwCgaRT2t2Y0/hfVXukLYa4/dgyaIcNl/WpdKfVD+NP4/d+ftiiFtbm6iF/ZFf+f7nZ+PIl2uDwY5ufnw9GjRzvqdZ95AACwWgp7AACaplQqNZYuZausa3Zhr9C8vtp37gjhd1OxY7ARvrZXzU79HLu6iL/ngRDu2aaIJ9Umx/rC8ePHw/z8vJIeAADWSWEPAEBTbesZasTO0ExNL+xDMBr/BmrfOhPCH6qxY7AeyvqmU+qn0JZSCJ2bFPFkXnmkFH75y1+GmZkZzxUBAKAJXFgDANBUCvvVMRr/+lr135sWUtZHVfvHnZ/9xUfnQ/jo/c/+WrHfXCtFfAjOiSe3nEcPAACto7AHAKCpFParpOS8rto/7gzhxIHYMVgtX8epUZseDOF/PfenX/hvZ0O49FG0POuyUpY3mYkn8EWTY33h1KlTzqMHAIA2UNgDANBUCvs1MBr/umrPLofwe2OkE6+zEIqze2OnAKBJjLoHAIA4/ix2AAAASLL/z//ewhe3k/y6iq9uDaGzEDsGt6CsB0i3w+XBsK9nc9j0yZmO84vTHUNDQx3KegAAaD+FPQAA3MT5O0stff3as8stff3U+ubLsRNwM32zsRMAsA7lkVJ4/P6Pw/nF6Y4nn3yyY2Jiwrn0AAAQmcIeAABu4rY7N7X2DX5f+ezcdj6nODIXwqOjsWNwPY+OfvbnA0Di2UUPAADJ5wIdAICmytoZ9m/854/Dl//7TMvfpzg/1PL3SKPat86E8Idq7Bis+MpwKP7409gpALiJ0f07w9zcXKhUKp77AQBACthhDwAACWA0/vUVf7EjdgRWbCkp6wESqDxSCt/46h3hcm2h4/zidMeBAwc6lPUAAJAeCnsAAEgCo/Fv7JvTsRPQWQjFV7fGTgFACGFyrO8LY+6npqY66vV67GgAAMA6WG0LAEBTGYm/MUbjX1/tO3eE8Lup2DFyy9clQDyHy4NhcXExnDhxwph7AADIIDvsAQDgJv7b5Xva+n61b51p6/ulRfHHn4Zwb3fsGPnUNxs7AUDujO7fGbo6l8P5xemOJ598smN8fNyYewAAyCiFPQAA3MRdW7e39w3/UA21f+hq73umhPPsI9hVDsWRudgpADJvdP/O8Pj9H4fzi9POoQcAgJxR2AMA0FSj+53DvmGnx2MnSC7n2bfPo6Oh+IOl2CkAMul6Bf3MzIyCHgAAckhhDwAACVTrX4gdIZGKByshfGU4dozs21IKxRcuxE4BkAmHy4Phud6uKyPuFfQAAMDVbo8dAAAAuI5L9VD7zh2fnd3O5xR//Gmofas7hD9UY0fJps5CKL66NXYKgNSaHOsLv/nNb8KJEydCpVLpePJJ02EAAIAbU9gDAEBS/W4q1F6ZdYb4dRR/sSPUequxY2RPZyEUZ/fGTgGQKuWRUnjvvffCwsJCR7VaDf39CnoAAGD1FPYAAJBk//Z8CEGBel3fnA7h34Zip8iWb74cwuxc7BQAiTa6f2c4efJkOH36dEe9Xg9Diwp6AABg/RT2AABwE//b/yHyaPBL9VD7249D8ad3xc2RQMWDlVD7znAIv5uKHSUb9hwyzQHgGpNjfeHUqVPh3XffDZVKpSOEEA4o6AEAgCbqiB0AAIBsKZfLjZ/PL8WO0VS13gQ8mN9zKBS/+07sFIlUe3Y5hN9XYsdIt0dHQ/GFC7FTAER37e55AACAVlPYAwDQVAMDA423PsjWbvBEFPYhhOK88e83UutfCOGSYmVdtpRC8dXIkyQAIiiPlMKvfvWr8Pbbb3dUq9XYcQAAgJwyEh8AAFKi9q0zofiLHbFjJNM3Xw5hrj92ivS5t1tZD+RCeaQU3nvvvc+Ntnf2PAAAkAR22AMA0FR22LeY0eU3VPuHrhBOj8eOkR6dhVCc3Rs7BUDTXa+cBwAASCo3LQAANJXCvg36ZkNxZC52ikRynv0a7H8zFIeOxE4BsCHKeQAAIO2MxAcAgLT5t+dDCHZGX0/x1a2h1l9wnv2t9M0q64HUGd2/M5w9ezb8+7//u7H2AABAZlh5DABAU9lh3yZbSs4ev4lE/pklhWMVgISbHOsLy8vL4eTJk+H06dMd9bpFWAAAQHYp7AEAaKpCoRBuK+5txM7RTIktf3eVQ/EHS7FTJFJtshTCvw3FjpE8Dw6E4k+ztaAGSDcj7QEAgLxzIwQAQNNt6xlS2LeLc8hvqPb9zSH8eiJ2jOQwlQGI7HB5MCwuLoYzZ86EmZkZz6QAAACCwh4AgBZQ2LdRZyEUZ51nfyO1Z5dD+H0ldoz4fJ0AbTY51hd+85vfKOcBAABuwQ0TAABNp7BvM2POb6rWvxDCpXyff1ycdzwA0BpXnze/tLTUUa1WY0cCAABIFYU9AABNl7nC/ltnQvhDNXaMm9tzKBS/+07sFImV+EUXrdQ3G4ojc7FTACk3un9nuHjxYjhz5kw4ffp0R72e74VQAAAAzXJ77AAAAJB0y3/WFbaGauwYN3fiQAjBLuob6psNYa4/dor221VW1gOrsrJT/vz58+H999//Qil/YDHHC58AAABayA57AACaLms77P+X/+vm8MC/T8SOcWvOKb+p2vc3h/DrFPw5NstXhkPxx5/GTgEkxLWFvPH1AAAAyaCwBwCg6bJW2J/+wc5w///rQOwYq+M8+5uqPbscwu8rsWO03pZSKL66NXYKoI3KI6Vw8eLFcPbs2fDRRx8p5AEAAFJCYQ8AQNNlrbB/9//eF/6P/3OKxqk7z/6mav0LIVzK8NnLJi1AJl1byDtHHgAAIBsU9gAANF3WCvsQQqj1puzs3v1vhuLQkdgpEivLpX1xfih2BGAdDpcHw7lz58LFixfDmTNn7JAHAADIidtjBwAAIHtG9+8ME6/Z4R3V3GAIwS7rG/rmyyHMpWhqwmr1zYYwPxc7BXATo/t3XreUf/LJlC0MAwAAoCkU9gAAkEWX6qH27LJzzG+gODIXav94KIQTB2JHaZ49h0JxZC52Csi9W42uP7ComAcAAOBPjMQHAKDpBgYGGm99cFfsGE2V2hHqj46G4gsXYqdIrNr3N4fw64nYMTbOnzO0xUoZf/78+fD++++HEEKYmZnxbAUAAIB1c1MJAEDTZbKw/9uPQ/iPmdgx1qdv1s7rm6g9uxzC7yuxY6zflpJJCrABKyV8CCGcPHnyyq8r4gEAAGgHN58AALTEtp6hRuwMzVT7zh0h/G4qdoz16SyE4qzz7G8mtRMU/NnCFZNjfWF5efnK36+MpA8hhA8//DBUKhXPQAAAAEgcN6sAALRE5gr7f9yZ7vPO7+0OxV/siJ0i0VJX2ivryZjD5cFw7ty5K39/8eLFcObMmSt/r3QHAAAgi26PHQAAAGiDP1RD7TtfC8Uffxo7SXJ98+UQ5vpjp1i9b74cwuxc7BTwBdcW76vd6f7kk9NtyQcAAABJYmU6AAAtkbUd9iGEUOvNQJm051Aofved2CkSKzWTFL45HYoHK7FTkAOj+3de+evz58+H999//8rfO+MdAAAANs7NNQAALTE9Pd0YfyVbhWImCvsQQtj/ZigOHYmdIrFq398cwq8nYse4sUdHQ/GFC7FTJMrj938c9f1Pnz7dUa8n5ziFQqEQdu3adcNFU0nLCwAAAHlmJD4AAC1x8eLF2BG4kbnBEIKzz2+k+MKFUHu2FMLvE7jgZEtJWX+Ny7WFjplF5fPV6vW63e8AAACQEn8WOwAAANl0/vz52BG4kUv1UHt2OXaKRCu+ujWELaXYMT7v3u7PcnFFV+dysFMcAAAASDOFPQAALXH1OceZ8eBA7ATN8/vKZ6PfuaHiq1tD6CzEjvGZzkIo/mJH7BSJ0tW5HCqVil3kAAAAQKop7AEAaImlpSVFWtL9eiLU/nFn7BSJVpzdm4jSvjjrCIOr7evZrKwHAAAAMkFhDwBAS1Sr1dgRmu++DO5wPnEg1KYHY6dItm++HPf9+2bjvn/ClEdKYWJiQlkPAAAAZILCHgAAVqvz7tgJWmNOYX8zxZG5eKX5o6OfvT8hhBAOlwfD0NCQsh4AAADIDIU9AACs1pceip2gNS7VQ+3Z5dgpEq04MhfCo6PtfdMHB0LxhQvtfc+EGxwcVNYDAAAAmaKwBwCgZQ6Xs7Vzuzh0JHaE1vl9JdS+c0fsFIlWfOFC+0r7LaVQ/Old7XmvlLhcW+io1+uxYwAAAAA0lcIeAICWOXfuXOwIrMXvpkLtH7pip0i04gsXQthSau2bdBZC8dWtrX2PlOnqXA7KegAAACCLFPYAAMCfnB4PtVf6YqdItOKrW1ta2hdn97bstdNoX8/mUKlUjMIHAAAAMklhDwBAy5w8eTJ2hOa7tzt2gtab64+dIPGKr24NobPQ/Bfum23+a6bY6P6dYWJiQlkPAAAAZJbCHgAA1uKefIyMr/UvxI6QeMXZvc0t7XeVQ3Fkrnmvl3KTY33hwIEDynoAAAAg0xT2AAC0zMzMTPbKts57Yidoj0v1UHt2OXaKxGva+PqvDIfiD5aa81oZ8fzzz2fv8wMAAADgGgp7AABYi/u2x07QPr+vhNp37oidIvk2OsZ+SykUf/xpc7JkxOXaQke9Xo8dAwAAAKDlFPYAALAW/+nu2Ana63dTofYP+TgGYL2KI3PrL+07C6H46tam5km7rs7loKwHAAAA8kJhDwAAa1A8WIkdof1Oj4faK32xUyRacWQuhD2H1vYPdRaaN1I/I77x1TtCpVIxCh8AAADIDYU9AAAtVR4pxY5AM8z1x06QeMXvvhPCo6Or/we++XLrwqTQc71dYWpqSlkPAAAA5IrCHgCAlrp48WLsCDRJrX8hdoTEK75wYXWl/Z5Dn+3KJ4QQwuRYXxgfH1fWAwAAALmjsAcAoKXOnz8fOwLNcqkeas8ux06ReMUXLoTw4MCNf8Ojo5/txueK/v5+ZT0AAACQSwp7AABa6v33348dofluVsZm3e8rSvtVKP70rhC2XOc4iC2lzwp9rrhcW1DWAwAAALmlsAcAoKWWlpaUcVnz+0qofX9z7BSJV3x16+dL+87CZ7/GFV2dy6Fer8eOAQAAABCNwh4AgJaqVquxIzTffTtiJ4jv1xOh9g9dsVMk3pXSvrMQirN7Y8dJlMfv/zhUKhULegAAAIBcU9gDAMBadd4dO0EynB4PtVf6YqdIvOKrW0P4H38RO0ai7OvZHGZmZpT1AAAAQO4p7AEAYK2+9FDsBMkx1x9q04OxUyRe8X96NXaExJgc6wsTExPKegAAAICgsAcAoA0Ol7NV6BaHjsSOkCxz2frzpbX6+/uV9QAAAAB/pLAHAKDlzp07FzsCrXSpHmr9C7FTkAKXawvKegAAAICrKOwBAICNu1QPtWeXY6cgwTZ9cqajXq/HjgEAAACQKAp7AABa7uTJk7EjNN+93bETJM/vK0p7rqurczlUq9XYMQAAAAASR2EPAADrcU9X7ATJ9PtKqH1/c+wUJMi+ns2hUqkYhQ8AAABwHQp7AABabmZmJntlXec9sRMk168nlPaEEEIoj5TCxMRE9r7/AQAAAJpEYQ8AAOtx3/bYCZLt1xOh9o87Y6cgosPlwTA0NKSsBwAAALgJhT0AAKzHf7o7doLkO3Eg1F7pi52CSAYHB5X1AAAAALegsAcAgHUoHqzEjpAOc/1K+xy6XFvoqNfrsWMAAAAAJJ7CHgCAtiiPlGJHIJa5/tgJaKOuzuWgrAcAAABYHYU9AABtcfHixdgRiKjWvxA7Am2wr2dzqFQqRuEDAAAArJLCHgCAtjh//nzsCMR0qa60z7jR/TvDxMSEsh4AAABgDRT2AAC0xfvvvx87QvM9OBA7Qboo7TNrcqwvHDhwQFkPAAAAsEYKewAA2mJpaUmZx2el/bPLsVPQZP39/b6/AQAAANZBYQ8AQFtUq9XYEZrvgd2xE6TT7ytK+wy5XFtQ1gMAAACsk8IeAABoP6V9JnR1Lod6vR47BgAAAEBqKewBAGCdit99J3aEdPt9JdS+c0fsFKzTN756R6hUKnbXAwAAAGyAwh4AgLY5XB6MHYGk+d1UqH1/c+wUrNFzvV1hampKWQ8AAACwQQp7AADa5ty5c7EjkES/nlDap8jkWF8YHx9X1gMAAAA0gcIeAIC2uXjxYuwIJJXSPjX6+/uV9QAAAABNorAHAKBtzpw5EztC820pxU6QHUr7xLtcW1DWAwAAADSRwh4AgLb58MMPY0dovs5NsRNky68nQu0fd8ZOwXV0dS6Her0eOwYAAABApijsAQBom0qlkr3dufftiJ0ge04cCLVX+mKn4CqP3/9xNr9/AQAAACJT2AMAwEZ03h07QTbN9SvtE2Jfz+YwMzOjrAcAAABoAYU9AABsxJceip0gu5T20U2O9YWJiQllPQAAAECLKOwBAGADikNHYkfINqV9NIfLg6G/v19ZDwAAANBCCnsAANpqdP/O2BFIG6V9FIODg8p6AAAAgBZT2AMAAMmntG+rTZ+c6ajX67FjAAAAAGSewh4AgLY6efJk7AjNt6UUO0E+KO3boqtzOVSr1dgxAAAAAHJBYQ8AABvVuSl2gvxQ2rfUvp7NoVKpGIUPAAAA0CYKewAA2mpmZiZ7ZeB9O2InyBelfUuUR0phYmIie9+fAAAAAAmmsAcAgI3qvDt2gvxR2jfV5FhfGBoaUtYDAAAAtJnCHgAANupLD8VOkE9K+6Z5/vnnlfUAAAAAESjsAQBgg4pDR2JHyC+l/YZdri101Ov12DEAAAAAcklhDwBA243u3xk7AlmitF+3rs7loKwHAAAAiEdhDwAAzdBZiJ0g35T2a7avZ3OoVCpG4QMAAABEpLAHAKDtTp48GTtC823ZFTsBc/2hNlmKnSIVnuvtChMTE8p6AAAAgMgU9gAA0AwP7I6dgBBC+LehUPv+5tgpEm1yrC+Mj48r6wEAAAASwEMaAACi2NYz1IidodlqvdOxI7Di0dFQfOFC7BSJdH5x2n0gAAAAQELYYQ8AAGTPrydC7cVHY6dInMu1BWU9AAAAQIIo7AEAoFnu7Y6dgBWdhVD83q9jp0iUrs7lUK/XY8cAAAAA4CoKewAAojhcHowdofnu+1rsBITwWVk/uzd2ikT5xlfvCJVKxe56AAAAgIRR2AMAEMW5c+diR2i++7bHTkAIIXzz5dgJEmVfz+YwNTWlrAcAAABIoNtjBwAAIJ8uXrwYO0LTFb/7Tqj1xk6Rc3sOheLIXOwUiTE51hf6+/uV9QAAAAAJZYc9AABRnDlzJnYEsubR0VD87juxUySKsh4AAAAg2RT2AABEMTMzk80i8d7u2AnyaUspFF+4EDtFolyuLWTzewwAAAAgQxT2AADQTPd9LXaC/Lm3OxRf3Ro7RaJ0dS6Her0eOwYAAAAAt6CwBwAgmvJIKXaE5rtve+wE+dJZCMVf7IidIlEev//jUKlU7K4HAAAASAGFPQAA0bz33nuxIzSdM9TbrO9I7ASJsq9nc3aPmwAAAADIoNtjBwAAIL/efffdEIJR5qzTN6dDcUhhv6I8UgpDQ0PKegAAAIAUscMeAIBoMju2e0sGR/0nzaOjoXiwEjtFYhwuDyrrAQAAAFJIYQ8AAM1232OxE2TbgwOh+MKF2CkSZXBwUFkPAAAAkEIKewAAoiqPZHA3+pceiZ0gu7aUQvGnd8VOkSibPjnTUa/XY8cAAAAAYB0U9gAARPXee+/FjtB0RrW3SGchFF/dGjtFonR1LodqtRo7BgAAAADrpLAHACCqd999N3YEUqI4uzd2hETZ17M5VCoVo/ABAAAAUkxhDwBAVJktHLdkcNR/TH2zsRMkyuj+nWFiYiKb3zsAAAAAOaKwBwCAVrjvsdgJsuPR0VAcmYudIjEmx/rCgQMHlPUAAAAAGaCwBwAguvJIBnejf+mR2Amy4SvDofjChdgpEuX5559X1gMAAABkhMIeAIDo3nvvvdgRmq54sBI7QvptKYXijz+NnSJRLtcWOur1euwYAAAAADSJwh4AgOjefffd2BFIms5CKL66NXaKROnqXA7KegAAAIBsUdgDABBdpVLJ5ojvLRkc9d8mxdm9sSMkyr6ezdn9PgEAAADIMYU9AAC0yn2PxU6QTn2zsRMkynO9XWFiYkJZDwAAAJBBCnsAABKhPJLB3ehfeiR2gvTZcygUR+Zip0iMybG+MD4+rqwHAAAAyCiFPQAAifDee+/FjtB0xYOV2BHS5dHRUPzuO7FTJEp/f7+yHgAAACDDFPYAACTCwsKCYjLPtpRC8YULsVMkyuWa7wkAAACArFPYAwCQCNVqNXaE1tiSwVH/zdZZCMVXt8ZOkShdncuhXq/HjgEAAABAiynsAQCgle57LHaCZOsshOLs3tgpEuXx+z8OlUrF7noAAACAHFDYAwCQGKP7d8aO0HxfeiR2gmT75suxEyTKvp7NYWZmRlkPAAAAkBO3xw4AAAArzp49GztC0xUPVkKtN3aKhPrmdCiOzMVOkRiTY32hv79fWQ8AAACQI3bYAwCQGG+//bayMi8eHQ3Fg5XYKRJFWQ8AAACQPwp7AAASo1qtxo7QGltKsRMky5ZSKL5wIXaKRLlcW1DWAwAAAOSQwh4AAFrtvsdiJ0iOe7tD8dWtsVMkSlfncqjX67FjAAAAABCBwh4AgEQZ3b8zdoTm+9IjsRMkQ2chFH+xI3aKROnqXA6VSsXuegAAAICcUtgDAJAoZ8+ejR2h6ZzV/kd9R2InSJR9PZuV9QAAAAA5d3vsAAAAcLW33367I9y5oxE7B03WNxuKQwr7FeWRUhgaGlLWAwAAAOScHfYAACRKtVqNHaE1HhyInSCeR0dDcWQudorEOFweVNYDAAAAEEJQ2AMAQHvcl9Oz2x8cCMUXLsROkSiDg4PKegAAAABCCAp7AAASaHT/ztgRmu9LD8dO0H5bSqH407tip0iUTZ+c6ajX67FjAAAAAJAQCnsAABLn7NmzsSM0Xe5GwncWQvHVrbFTJEpX53J2j3wAAAAAYF0U9gAAJM7bb79tZHjKFWf3xo6QKPt6NodKpeLrGgAAAIDPUdgDAJA4md2F/OBA7ATt0TcbO0GijO7fGSYmJpT1AAAAAHyBwh4AANrlvh2xE7TernL+xv/fxORYXzhw4ICyHgAAAIDrUtgDAJBIo/t3xo7QfF96OHaC1vrKcCj+YCl2ikR5/vnnlfUAAAAA3JDCHgCARDp79mzsCE2X6Z3nW0qh+ONPY6dIlMu1hY56vR47BgAAAAAJprAHACCR3n77bTuT06KzEIqvbo2dIlG6OpeDsh4AAACAW1HYAwCQSNVqNXaE1nhwIHaC5uoshOLs3tgpEuUbX70jVCoVC04AAAAAuCWFPQAAtNN9O2InaK5vvhw7QaI819sVpqamlPUAAAAArIrCHgCAxBrdvzN2hOYr9sRO0Dx7DoXiyFzsFIkxOdYXxsfHlfUAAAAArJrCHgCAxDp79mzsCE1XHDoSO0JzPDoait99J3aKROnv71fWAwAAALAmCnsAABJrfn4+mwVoZyF2go3ZUgrFFy7ETpEol2sL2fxaBQAAAKClFPYAACRWvV6PHaE1tuyKnWD9Oguh+OrW2CkSpatzObtfqwAAAAC0lMIeAIBEO1wejB2h+R7YHTvB+nQWQnF2b+wUifL4/R+HSqVidz0AAAAA66KwBwAg0c6dOxc7QvN96aHYCdan70jsBImyr2dzmJmZUdYDAAAAsG4KewAAEu3kyZOxIzRdcSiFxfc3p9OZu0Umx/rCxMSEsh4AAACADVHYAwCQaKdPn85mKdpZiJ1g9R4dDcWDldgpEqW/vz+bX5cAAAAAtJXCHgCARKvX67EjtMaDvbETrM6WUii+cCF2ikS5XFtQ1gMAAADQFAp7AAAS73B5MHaE5rtve+wEt3Zvdyi+ujV2ikTZ9MmZjswuIgEAAACg7RT2AAAk3rlz52JHaLrid9+JHeHmOguh+IsdsVMkSlfncqhWq7FjAAAAAJAhCnsAABLv5MmTsSPkTnF2b+wIibKvZ3OoVCpG4QMAAADQVAp7AAASb2ZmJptF6b3dsRNcX99s7ASJUh4phYmJiWx+DQIAAAAQ1e2xAwAAQG49sDeEP1Rjp/i8R0dDcWQudorEOFweDE8++aSyHgAAAICWsMMeAIBUmBzrix2h+b70SOwEn/fgQCi+cCF2ikQZHBxU1gMAAADQMgp7AABS4Te/+U3sCE1XPFiJHeFPtpRC8ad3xU6RKJdrCx31ej12DAAAAAAyTGEPAEAqnDlzJnaE7OoshOKrW2OnSJSuzuWgrAcAAACg1RT2AACkwszMTDZHk28pxU4QirN7Y0dIlH09m0OlUsnm1xsAAAAAiaKwBwCAmB7YE/f9+2bjvn/CjO7fGSYmJpT1AAAAALSFwh4AgNQoj8Tfjd50X3o43nvvKofiyFy890+YybG+cODAAWU9AAAAAG2jsAcAIDXee++92BGaLlph/pXhUPzBUpz3Tqjnn39eWQ8AAABAWynsAQBIjXfffTd2hNboLLT3/baUQvHHn7b3PRPucm2ho16vx44BAAAAQM4o7AEASI1KpZLNHdBfebp979VZCMVXt7bv/VKgq3M5KOsBAAAAiEFhDwAAsRW/3p736SyE4uze9rxXSnzjq3dkdyEIAAAAAImnsAcAIFVG9++MHaHp2naO/Tdfbs/7pMRzvV1hampKWQ8AAABANLfHDgAAAGtx9uzZ2BFa48GBEP5jpnWvv+dQ+xYGpMDkWF/o7+9X1gMAAAAQlR32AACkyttvv53NkvXLf9W61350NBS/+07rXj+FlPUAAAAAJIHCHgCAVKlWq7EjtETxYKU1L7ylFIovXGjNa6fU5dqCsh4AAACARFDYAwCQOofLg7EjtMa93U1/veKrW5v7minX1bkc6vV67BgAAAAAEEJQ2AMAkELnzp2LHaE1HtjbvNfqLITiL3Y07/Uy4PH7Pw6VSsXuegAAAAASQ2EPAEDqnDx5MnaE1vhyb/Neq+9I814rA/b1bA4zMzPKegAAAAASxQMrAABSp1AohNuKexuxc7RCrXd64y/yzelQPFjZ+OtkxORYX+jv73fvAwAAAEDi2GEPAEDqZPoM8gcHNvbPPzqqrL/K4fKgsh4AAACAxFLYAwCQSpNjfbEjtMaX/2r9/+yWUii+cKF5WTJgcHBQWQ8AAABAYinsAQBIpVOnTsWO0BLr3h2/pRSKr25tbpiU2/TJmY5MT2MAAAAAIPUU9gAApNLRo0ezu3P63u61/f7OgrL+Gl2dy6FarcaOAQAAAAA3pbAHACCVMr1z+oG9a/rtxdm1/f6s29ezOVQqlewu6AAAAAAgMxT2AACk1uj+nbEjtMaXe1f/e/tmW5cjhcojpTAxMaGsBwAAACAVPMgCACC1SqVSY+lSNkfB13qnb/2bHh0NxRcutD5MSkyO9YX+/n73OAAAAACkhodZAACk2raeoUbsDK1Q+84dIfxu6sa/4cGBUPzpXe0LlAKXawsdmT4qAQAAAIDMMRIfAIBUmxzrix2hNYpP3Ph/21JS1l9DWQ8AAABAGinsAQBItePHj8eO0BLFg5Xr/w+dhVB8NZvHAKxXV+dyUNYDAAAAkEYKewAAUm1+fj67xzzd2/2FXyrO7m1/jgTb17M5VCqV7H4NAAAAAJBpCnsAAFIt0zur/+Kpz/9932ycHAk1un9nmJiYUNYDAAAAkFoKewAAUu+53q7YEVqj2POnv95VDsWRuWhRkmZyrC8cOHBAWQ8AAABAqnnABQBA6pVKpcbSpWye617rnQ7hK8Oh+ONPY0dJlPOL0+5lAAAAAEg9O+wBAEi9TJ9hvueQsv4al2sL2f3zBgAAACBXFPYAAGTC5Fhf7AgtUfzuO7EjJEpX53Ko1+uxYwAAAABAUyjsAQDIhOPHj8eOQIt946t3ZHuaAgAAAAC5o7AHACAT5ufnFbkZ9lxvV5iamvJnDAAAAECm3B47AAAANEO9Xg/birFT0AqTY32hv79fWQ8AAABA5thhDwBAZjzX2xU7Ai2grAcAAAAgqxT2AABkxrFjxxS7GXO5tuDPFAAAAIDMUtgDAJAZ1Wo1dgSaqKtzOdTr9dgxAAAAAKBlFPYAAGRKeaQUOwJN8Pj9H4dKpWJ3PQAAAACZprAHACBTfvWrX8WOwAbt69kcZmZmlPUAAAAAZJ6HYAAAZM62nqFG7AysT3mkFIaGhtynAAAAAJALdtgDAJA5h8uDsSOwDofLg8p6AAAAAHJFYQ8AQOYsLi7GjsA6DA4OKusBAAAAyBWFPQAAmXPs2DHFb8ps+uRMR71ejx0DAAAAANpKYQ8AQOZUq9XYEViDrs5lf2YAAAAA5JLCHgCATCqPlGJHYBX29WwOlUrFRAQAAAAAcun22AEAAKAVfvWrX8WOwC2M7t8ZDhw4oKwHAAAAILc8HAMAILO29Qw1Ymfg+ibH+kJ/f7/7EQAAAAByzUh8AAAy63B5MHYEbuD5559X1gMAAACQewp7AAAya35+PnYEruNybaGjXq/HjgEAAAAA0SnsAQDIrIWFBbu4E6arczko6wEAAADgMwp7AAAyq1qtxo7AVfb1bA6VSsUiCgAAAAD4I4U9AACZVh4pxY5ACOG53q4wMTGhrAcAAACAq9weOwAAALTSL3/5yxDCXbFj5NrkWF/o7+9X1gMAAADANTw0AwAg87b1DDViZ8iz84vT7jsAAAAA4DqMxAcAIPMOlwdjR8ity7UFZT0AAAAA3IDCHgCAzJufn48dIZe6OpdDvV6PHQMAAAAAEkthDwBA5i0s2OXdbt/46h2hUqn47w4AAAAAN6GwBwAg86rVauwIubKvZ3OYmppS1gMAAADALSjsAQDIhfJIKXaEXJgc6wsTExPKegAAAABYBQ/SAADIhVKp1Fi6tDV2jMw7vzjtHgMAAAAAVskOewAAcsF56q13ubbgvzEAAAAArIHCHgCA3Jgc64sdIbO6OpdDvV6PHQMAAAAAUkVhDwBAbpw6dSp2hEx6/P6PTTAAAAAAgHVQ2AMAkBtHjx5VKjfZvp7NYWZmxn9XAAAAAFiH22MHAACAdqnX62FbMXaK7CiPlMLQ0JCyHgAAAADWyQ57AAByZXT/ztgRMuFweVBZDwAAAAAb5AEbAAC5UiqVGkuXtsaOkXqXawsd9Xo9dgwAAAAASDU77AEAyJVKpWLR6gZt+uSMsh4AAAAAmkBhDwBA7kyO9cWOkFpdncuhWq3GjgEAAAAAmaCwBwAgd06dOhU7Qirt69lsQgEAAAAANJGHbQAA5E6hUAi3Ffc2YudIk9H9O8OBAwfcPwAAAABAE90eOwAAALRbvV4P24qxU6TH5Fhf6O/vV9YDAAAAQJMZiQ8AQC4919sVO0JqPP/888p6AAAAAGgBhT0AALl04sSJ2BFS4XJtoaNer8eOAQAAAACZpLAHACCXKpWKXeO30NW5HJT1AAAAANA6CnsAAHJrcqwvdoTE+sZX77CoAQAAAABaTGEPAEBuHT9+PHaERHqutytMTU0p6wEAAACgxTyEAwAgtwqFQrituLcRO0eSTI71hf7+fvcJAAAAANAGdtgDAJBbzmf/ImU9AAAAALSPwh4AgFx7rrcrdoTEuFxbUNYDAAAAQBsp7AEAyLUTJ07EjpAIXZ3LJg4AAAAAQJsp7AEAyLVKpZL7XeWP3/+x/w4AAAAAEIHCHgCA3Jsc64sdIZp9PZvDzMyMsh4AAAAAIrg9dgAAAIjt+PHjsSNEMTnWF/r7+5X1AAAAABCJh3MAAOReoVAItxX3NmLnaLfzi9PuBwAAAAAgIiPxAQDIvXq9Hg6XB2PHaKvLtQVlPQAAAABEprAHAIAQwuLiYuwIbdPVuRzq9XrsGAAAAACQe3bVAABACKG7uzt8eOeOzI/F7+pcDpVKxX0AAAAAACSAHfYAABBCqFarsSO03L6ezcp6AAAAAEgQhT0AAPxReaQUO0LLlEdKYWJiQlkPAAAAAAlye+wAAACQFL/61a9iR2iJw+XB8OSTTyrrAQAAACBhPLQDAICrbOsZytw59pdrCx31ej12DAAAAADgGgp7AIAmKJVKjcceeyxs27YtPPTQQ+GZ8SOxI6VaeaQULl68GE6ePBlOnz7d1rL5zTffbGTpz09ZD/kxMDDQ2LFjR7j77rvDxGvvxI6TeuWRUjh//nw4c+ZMmJmZ8fwEAACAlnDDCQCwTgMDA41vf/vb4eBLc7Gj5MJzvV3hZz/7WcvL53K53Pj5/FJL36NdujqXQ6VScc0PGTY6Otro7e21UKwNDpcHw/z8fJiYmPC5CgAAQNO4yQQAWKOBgYHGWx/cFTtGbo3u3xlefPHFlhX33d3d4cM7d6R+LP6+ns1KJciw0dHRxuuLF2LHyK3nervC+Pi4z1gAAAA2zM0lAMAazM7ONuyoT4ZW7h5P+zn2o/t3hgMHDrjWhwwqFArhtuLeVH9GZcmmT850VKvV2DEAAABIMQ/xAABWQUGSTN/46h1hamqq6de009PTjfFXKs1+2baYHOsL/f39rvMhg/wsSibHjwAAALARfxY7AABAGrz88ssKkgR647efhlKp1PQ/m1/+8pfNfsm2ef7555VGkEHK+uRaurQ1FAqF2DEAAABIKYU9AMAtDA8PG4OfYEuXtjb9NWdmZlJZel+uLXTU6/XYMYAW+N73vqesTzAL+wAAAFivVD6IBABop7SfZ54H+3o2h4mJiaZe27755puNZ8aPNPMlW8pIZsiu7u7u8OGdO/wsSrg8nmc/MDBw5evynnvuCdu3b48ZpynOnz8f3n///St/f/r0aYvhAACAlvJADwDgJkZHRxuvL16IHYNVOL843dRr2zT92X/jq3eEqakp1/aQUdPT043xVyqxY3ALk2N9ob+/P3OfxQMDA40dO3aEbdu2BV+Hn/05Ly8vh5MnTyrzAQCApsjcjSQAQDOlbZd1njV7h3ladrQ+19sVxsfHXddDhpn0kh7NXjwWw/DwcOOJJ55Qzq/B5FhfOHXqVDh69KgCHwAAWLPU30gCALSSkiQ9RvfvDAcOHGjq9W3S//yzupsT+JNSqdRYurQ1dgxWKa0TT0qlUuPv/u7vwsGX5mJHSb3D5cFw9OjRVH4dAAAAcfxZ7AAAAEl19bmsJN/Ea+80/TXLI6Wmv2YzKesh+/r6+mJHYA2eeOKJ2BHWZGBgoLGtZ6ixdGmrsr5Jnhk/Et747adhW89QY3R01LUkAABwSwp7AIAb2L17d+wIRPbLX/4ydoQbulxbUNZDDjz00EOxI7AGaRkjXyqVGtt6hhpvfXBX7CiZ9vrihbCtZ6gxPDysuAcAAG5IYQ8AcANbtxpBnDbd3d1Nfb2ZmZlEluJdncvBGbmQD8+MH4kdgYw5dOiQYxba7I3ffhpmZ2cbhUIhdhQAACCBFPYAADdgNGz6dHV1NX0H2+HyYLNfckMev//jUKlUErmQAIDkKhQK4c0332y04ggZbu3gS3PhtuLeRqlUstseAAD4nNtjB1it7u7usHfv3sa2bdtacj4pkF3lkVI4f/58OHPmTGJ3SgKQXPPz87EjXLGvZ3OYmJj2swwgwUqlUiNpC6sKhUK4rbi3YWJDfEuXtibyawQAAIgn0TcHAwMDjW9/+9t2twFNdbg8GObn58PRo0c7jBMGbmZbz5AdUCkzun9nOHDgQFOvcbu7u8OHd+6I/rUwOdYX+vv7E339DjRXqVQyujyFHr//40QtFF4p62Pn4PM2fXKmo1qtxo4BAAAkQCJH4g8MDDS29Qw13vrgLmU90HTPjB8Jry9eCLcV9zYOHTrkHEEAbiopD9OV9ZA/mzZtih2BDHj55ZeV9Qn04Z073IsCAAAhhIQV9oVCIczOzjbe+uCu2FGAnJh47R3nCAJwS6P7d0Z9/8u1BWU9AGs2OjrasBEiuV544QX3oQAAQHIK+5URbW4kgRiWLm0No6OjHpYAcF1zc3PR3nvTJ2cc4QLAmhUKhfD64oXYMbiJ8VcqYWBgwH0oAADkXCIKe+epAUnw+uKFMDw87LMIgC+oVCpRdrh3dS4nZiQ/AOliFH46mDIJAAAkorA3AgxIijd++2no7u6OHQOABJoc62vr++3r2RxtoQAA6dbd3R1MMEwP094AACDfohf2AwMDjfFXKrFjAFzxwx/+0MMSAL7g1KlTbXuv8kgpTExMKOsBWBf3NOni6AIAAMi36IW90V9A0hx8ac4uewC+4OjRo20p0A+XB8PQ0JCyHoB1KRQKdtenkLPsAQAgv6IW9qVSyc0IkEh2pABwrXq93pb3GRwcVNYDsG5PP/20e5kU+va3vx07AgAAEEnUwn5oaCjm2wPckB0pAFzP6P6dLX39y7WFjnYtDAAgm3p7e2NHYB3cgwIAQH5FLeydXQ8kmZGEAFxrbm6uZa/d1bnctl38AGRToVAIz4wfiR2DdXIPCgAA+RStsC8UCrHeGmBVdu/eHTsCAAlTqVRaMq5+X8/mlr02APnR29ur8E2xv/qrv4odAQAAiCBaYb9r1y43kUCiTbz2TuwIACTQ5FhfU19vdP/OMDExoawHYMOeeOKJ2BHYAJMoAQAgn6IV9nauAgCQRqdOnWraa02O9YUDBw4o6wFoCoUvAABA+kQr7O++++5Ybw0AAOt29OjRphXs/f39ynoA4Arn2AMAQP5EK+yt+gbSoFQqeVgCwOfU6/WmvM7l2oKyHoCm6e7ujh2BJnjggQdiRwAAANosWmEPkAabNm2KHQGABHqut2tD/3xX53LTin8ACCGErq4ui40zYNu2bbEjAAAAbaawBwCANTpx4sS6/9lvfPWOUKlU7K4HoKl2794dOwJNMPHaO7EjAAAAbaawBwCANVpv4f5cb1eYmppS1gMAAAAAIQSFPQAArMvkWN+af//4+LiyHoCWsDMbAAAgnRT2ADdxzz33xI4AQEIdP358Tb+/v79fWQ8AAAAAfI7CHuAmtm/fHjsCAAk1Pz+/6gL+cm1BWQ8AAAAAfIHCHgAA1qFer6/q93V1Lq/69wIADAwMNGJnAAAA2kdhDwAA6/Rcb9dN//fH7/84VCoVu+sBAAAAgOtS2AMAwDqdOHHihv/bvp7NYWZmRlkPAAAAANyQwh4AANbpRrvnJ8f6wsTEhLIeAAAAALgphT0AAGzA5Fjf5/7+cHkw9Pf3K+sBAAAAgFtS2AMAwAYcP378c38/ODiorAcAAAAAVkVhDwAAGzA1NXWloN/0yZmOer0eMw4AOTQwMNCInQEAAID1UdgDAMAGHS4Phq7O5VCtVmNHAQAAAABS5PbYAQAAIO2efPJJY/ABAAAAgDWzwx4AAAAAAAAAIlDYAwAAAAAAAEAECnsAAAAAAAAAiEBhDwAAAAAAAAARKOwBAAAAAAAAIAKFPQAAAAAAAABEoLAHAAAASLHTp093xM4AAADA+ijsAQAAAFKsXq/HjgAAAMA6KewBAAAAAAAAIAKFPQAAAAAAAABEoLAHAAAAAAAAgAgU9gAAAAAAAAAQgcIeAAAAABLi9OnTHbEzAAAA7aOwBwAAAICEqNfrsSMAAABtpLAHAAAAAAAAgAgU9gAAAAApVx4pxY4AAADAOijsAQAAAFLu4sWLsSMAAACwDgp7AAAAgJQ7e/Zs7Ag0gUkJAACQPwp7AAAAgJT793//99gRaILz58/HjgAAALSZwh4AAAAg5SqVSkfsDGzcmTNnYkcAAADaTGEPAAAAAAlw+vRpCy8AACBnFPYAAAAAGTA51hc7AhtUr9djRwAAANpMYQ8AAACQAadOnYodgQ2w4AIAAPJJYQ8AAACQAQsLC8app9jx48djRwAAACJQ2AMAAABkQLVajR2BDZifn7fgAgAAckhhDwAAAJARz/V2xY7AOhwuDzq/HgAAckphDwAAAJARx44ds0s7hebn52NHAAAAIlHYAwAAAGREtVoNh8uDsWOwRhMTExZaAABATinsAQAAADLkX/7lX2JHYA1G9++MHQEAAIhIYQ8AAACQITMzM3Zrp8iLL77ozwsAAHJMYQ8AAACQMV2dy7EjsArP9XaFer0eOwYAABCRwh4AAAAgYyqVSkd5pBQ7BrcwPj5udz0AAOScwh4AAAAgg4aGhpTBCbbpkzP+fAAAAIU9AAAAQFYphZPp8fs/DtVqNXYMAAAgART2AAAAABlVrVadZ58w+3o2h5mZGQspAACAEILCHgAAACDTKpVKh9I+Gfb1bA4TExPKegAA4AqFPQAAAEDGVSqVjsu1BUVxRF2dy8p6AADgCxT2AAAAADlQr9fD+cXpjud6u2JHyZXySClcri10VCoVZT0AAPAFCnsAAACAHBkfH++4XFvoGN2/M3aUTJsc6wubPjnTMTQ01FGv12PHAQAAEkphDwAAAJAz9Xo9HDhwoONybcGO+yYrj5TCpk/OdPT393dUq9XYcQAAgIRT2AMAAADkVL1eD+Pj4x3nF6c7ujqXQ3mkFDtSKk2O9YVvfPWOcH5xumNoaEhRDwAArNrtsQMAAAAAEF+lUumoVCohhBAKhULYtWtXY/fu3eGhhx4Kz4wfiZwuWUb37wxnz54Nb7/9dke1Wg39/dOxIwEAACmlsAcAAADgc+r1epiZmemYmZn53K93d3eHrq6uRggh7N69+8qv33333WH8lUp7Q7bA5FhfWF5evvL3Z8+eDR999FH48MMPQ6VS6Vj59QOLCnoAAKA5FPYAAAAArEq1Wg3VarUjhBCuLfOzwE55AACg3ZxhDwAAAAAAAAARKOwBbuLixYuxIwAAAAAAAJBRCnuAmzhz5kzsCAAAAAAAAGSUwh4AAAAAAAAAIlDYAwAAAAAAAEAECnsAAAAAAAAAiEBhDwAAAAAAAAARRCvsD5cHY701wKqdPn26I3YGAAAAAAAAsilaYX/u3LlYbw2wavV6PXYEAAAAAAAAMipaYX/+/PlYbw0AAAAAAAAA0UUr7N9///1Ybw2wKpNjfbEjAAAAAAAAkGG3x3rjmZmZjm09Q41Y7w9wK7/5zW9iR8iEgYGBK5/1u3fvvvLrDz30UHhm/Ejb85RHSuHixYshhM+mvawsIFtaWuqoVqttzwNA6638LLrnnnvC9u3br/z6xGvvRMkzun/nlb8+e/Zs+Oijj0IIIZw+fbrDcTwAAMBGFQqFsGvXrkYIITzwwANh27ZtV/63WPdBnslBdlz9zD+EEHbs2BHuvvvuz/2eWJ81VztcHgznzp0LJ0+eDDMzMx2x89xM1HBvvvlmI0ZZA7Aamz4542LxFlYu/lcu/Ldu3RoOvjQXO1bTrBQqJ0+eDCGExP9Qp/ksLkyf0f07w4EDB3yv5kh3d3fo6upqrNwcxloQ1ipX/yz68MMPQ6VS8fWdIwMDA423PrgrdgzW6PH7P3bdCAC0VKlUamzatOnK5pgkFGPN5JkctMfVi3uSssmhlSbH+sK//uu/JvIzJWqg0dHRxuuLF2JGALih84vTifvQjmWlDNm9e3fmSvn1Ko+Uwvnz58OZM2fsiMwwhX36KOyzq1QqNf78z/88bN++PXOl/HqN7t95ZWdKEm822TiFfTop7AGAZhkYGGjs2LEjbNu2LYy/UokdJxE8k4NbW3meH8Kfpt56rv95XZ3LidoUETVIoVAItxX3ehAOJM6+ns1hYmIiMR/W7VQqlRqPPfZYeOSRR9wIrMPo/p3h7Nmz4e233zahIQMU9umjsM+GUqnU2LNnT3j44YfdTK7R1ePePLxKP4V9OinsAYC1Wtnlunv3bguU12nlmdz8/Lz7IDJvZcpGVqcNtkuSeqDoIQ4dOtTI4lgFIN0u1xZyc2E3MDDQ2L17dyZH3CTB4fJgWFxcDCdOnEjUij1WR2GfPgr79CkUCqG3t7exfft2P4taZHKsL5w6dSq8++67fhaljMI+nRT2AMCtrGyY+frXv26RcotMjvWF3/zmN57JkVoDAwONlTH1dse3TlJK++gB7LIHkiYpH9CtoqCPS4GfLgr79FHYp8Pw8HDjiSeeMMklksPlwTA/Px8WFhZMg0k4hX06KewBgGt1d3eHvXv3Nnp7e+2CjWTlmdyxY8fcB5EYK9M1HH0R1ze+ekeYmpqKeg+XiBvI4eHhxhu//TR2DIBwuDwYnnzyyUR8NjaLG4JkW9n1ePTo0dxMdUgThX36KOyTqbu7Ozz11FONn88vxY7CdZRHSuFXv/pV9JtTvkhhn04KewAgBAuVk859EO22Mllj27ZtNtMlUOypy4n5IBodHW28vnghdgwg52J/KDeLYiS9nuvtstI3QRT26aOwT45SqdQYGhrycCplVnbfW0iWDAr7dEpjYb+ys+eBBx4I27Ztu/LrzsK8tdH9O6/89cWLF8OZM2fC0tJSqq7nV/78V0auXs341S+aHOsLy8vLX/j18+fPh/fffz+EEFL3GZAW3d3doaurqxFCCLt3777u7/G5dWtXf26tOHnyZAghhNOnT7sG3IBCoRCefvppm2ZSyH0QzbZSzj/yyCOei6RE7GeKibp4VNoDMaW9rFfSZ4/yPj6FffrEvrjOOyV9tnhoFZ/CPp3SUNgrFNonidf0K/eOPT09/vzbYGUH5/z8vJ+na1AqlRp79uwJvk7jMDp89fxMzZ6V+6AsH5lKcxUKhdDb29vYvn27nfMpd35xWmG/olQqNZYubY0dA8iRNJc7KzcFFjtl376ezQqTCBT26ZPmz/S06u7uDs8++2zDTWm2HS4PhqNHjxoX2WYK+3RKcmHf3d0dfvjDHzbsmG6/w+XB8F//638NlUol2tdGd3d3+Kd/+qeGQikeJdDNFQqF8Nd//dc2IiRMEj6/kmh4eLjxl3/5l6aQZNzkWF/413/918Re2xHHyhG0X//6130GZEzMs+wT+yFjtz3QaqP7d4YXX3wxlQXowMBA49vf/rYLghxyo9BeCvv0Udi3j+v1/CqPlMI///M/223VBgr7dEpqYe9zOxnKI6UwNDTU9q8Pf/7J47r183yNJt9zvV1hfHw811+z3d3d4e///u8bJorl03O9XeFnP/tZKp8lszEK+vyYHOsL/f39CvvrMaYLaKaVUXRp3B1mpTnXsuu+9RT26ePBZ2vZTc+19vVstkuwhRT26ZTEwn52dtau+oRp55FsitBk6+pczvXO5UKhEF5++WWfUSmR19J+eHi48cZvP40dg4SYHOsLP/nJT3L92Z0Hw8PDjSeeeMKRfzkUayx+6j5QCoVC2LVrVyOEEHbv3h07Tmp4qJoto/t3xo6QCufPnw/vv/9++PDDD1N9AWVsJbdip2PrKOzTR2HfGia7cCtpnlyUZAr7dEpaYT89PW0nYEK142Fgd3d3+PDOHa5pEy7PC+Dcc6XPpk/O5OL5g40zrEbM8dk018rRs729vTYP55zCnpZy8Zsdioj8UI6wVlb4Np+fn+nj52RzKQtZq8mxvvCjH/0oFw9x28H3YDolqbD3NZRs7bhuMV0hPfJY2ltQlE4xxwW3Q6FQCN/73vdMFWNN8vgZngUrE74tzOFqse7n/qzdbwjAzQ0MDDS29Qw13vrgLmU9a3LwpbmwdGlr2NYz1BgYGFA0A+s2Ojp65WcRrMXBl+bCh3fuaMzOzja6u7tjx4Hc8zmebBOvvRNa/VnpnjI9Xl+8EEqlUm7u4wYGBpT1KZXVz5VCoRAOHTrUuK24V1nPmr2+eCFs6xlqjI6O5uZzPK26u7tDuVxubOsZanx45w5lPV9wzz33RHlfhT1AQlxd1MNGvfXBXYp7YM1WfhY555aNUtxDfB4Yp8MPf/jDlv055an8zYqlS1tDoVCIHaMtPPtItyx9nSrqaSbFfTIVCoUwOjraePPNN5X03NL27dujvK/CHiCy7u7uMDs7q6inJd764K6gLAFuxaIxWmWluD906FAjSw92IQ16e3tjR2AVWrlTddOmTS17bVrnhRdeyHzJo8hKv127dqX+z1BRTyutFPc20sRVKpUas7OzjduKexuvL15wNj2JprAHiGTlxuDDO3c4U5CWWilLpqenlSXA53R3d4c333xTUU/LTbz2TrituLdRLpc9sII2KBQKHkimyPDwsM9Grhh/pdLyoxJiM82J2EZHRxX1tMVbH9wV3nzzTRtp2mhlN/22nqHG0qWtmT3Gg+xR2ANE4MaAGMZfqYTbinuN5QI+t2hMoUM7/Xx+yU4TaIPe3l7fYynyxBNPxI5AwrTyqITYHNVATKVSyRFgtN0z40euTB2LnSXLuru7r0zN8D1OGinsAdrIjQFJsDKWy4MSyKeBgQGLxohuZaeJyS/QGrHOXWR9xl+pxI5Awhx8aS6zu+yHhoZiR6AJlpaWOmJnWItCoRCmp6cbS5e2xo5Cjk289o7Fyy2w8v394Z07POcg1RT2AG1y6NAhNwYkytKlrcGZwpAfhULB+HsS5ZnxI8bkQ4t4WAnp99RTT2Xy56MFKtlQrVZjR1i1lQXLvvZIirc+uCs4trI5VnbU+/4mCxT2AC22sqveQzOSaOVMYat7IduGh4cbtxX3Gn9PIq2Myc/qTkKA1WjFQ/u07YDl834+vxQ7QtP5WU87WbBMkq0cW+l53Pp43k4WKewBWsiuetLirQ/uCs7SguxZeUj1xm8/jR0FbunDO3c0RkdH/SwCcmnXrl1N//xL0w5Yri9rx5jt3bs3U/8+eTU51hc7wi2t7Kq3YJmk8zxu7TxvJ6sU9gAt0N3dHazyI21WztKy6wGywUMq0uj1xQvOtgeAP+rr64sdoam+/vWvx45AE/zmN7+JHeGmpqen7aonVTyPW52VDQmet5NVCnuAJhsdHW18eOcOKyNJLTscIf0OHTrkIRWptXK2fdZ2FQLEUB4pxY7ABmStlDj40lzsCDTBiRMnYke4rpXNM86yJq0+vHOHEfk3UCgUgg0JZJ3CHqCJZmdnG68vXogdAzbs9cULYXZ21k0CpEyhUDDhhcxYurQ1lMtlP4tgjSx2Sad77rmnJa/73nvvteR1aZ+sTJ3Jyr8HIVQqlY7YGa41MDBg8wyZYET+9d1WdKQK2aewB2iClYLEanGy5OBLc2Fbz5CxxJASpVKp4SaWrPn5/FKYnZ31swjWYNOmTbEjsA7bt29vyesuLCwkrlhjbXp7ezNxfZeVf4+8O1wejB3hC0wXI2smXnvHPdBVbCgiLxT2ABukICHrjCWG5BsdHW0sXdoaOwa0xMGX5sJtxb0eWAGsQ7VajR2BDXriiSdiR2iKVi1Kob3m5+djR7iiUCiE2dlZ08XIJPdAnxkeHrZBjtxQ2ANsgIKEvFi6tDU41x6S6dChQ45jIRcsIANYH+fYp1tWzuNWqmZDUqZ2rJxnrcgj6/J8D1QoFMIbv/00dgxoG4U9wDqNjo4qSMiV1xcvKO0hYewoIW+WLm0NAwMDfhYBrMGvfvWr2BHYoLzvsCQ5kjC1w6RL8mbp0taQx9L+e9/7Xu7+nck3hT3AOszOzirryaXXFy84OwoSoFAohDfffNOOEnLprQ/usoAMYA2mpqYSsSOW9Uv7+e95LJqy6LnertgRQqlUMumSXFq6tDUMDw/n5rO0UCiYzELuKOwB1mh2dlZBQq4dfGlOaQ8RrYx/fGb8SOwoEI2pLwBrc7g8GDsCG5D2898fe+yx2BFogmPHjkVd/KOsJ+/e+O2nubkHevrpp3Px7wlXU9gDrIGyHj6jtIc4Vsr62DkgCZT2AKs3Pz8fOwIbkPZdho888kjsCDRBzHH4ynr4TF7ugUy2JY8U9gCrpKyHz1PaQ3sp6+GL8vLACmCjjh49aiw+0Yy/UokdgQ2KOQ5fWQ+fl/V7oO7u7tgRIAqFPcAqKOvh+pT20B7KerixrD+wAmiGer0eOwIbNDAw4Gcd0cQah6+sh+vL8j3Q3r2efZBPCnuAW1DWw80p7aG1lPVwa1l+YAXQLDF3yLJxu3fvjh1hXSw0yIYY4/CV9XBzry9eCKVSKXOfsY5RIa8U9gA3MT09rayHVTj40lw4dOhQ5m4SIAmOHDniewtWQWkPcHOxdsjSHA899FDsCOuS1oUG/EmMxT7KelidpUtbM1faO0aFvFLYA9zA6OhowwUCrN7Ea+8oSqDJZmdnG8+MH4kdA1Ijq7tMAJohxg5Zmiet14RpXWjAn7R7sU+hUAjKeli9LJb2kEcKe4DrGB4ebry+eCF2DEid1xcvGHkITXLo0CFTXmAdli5tDd3d3bFjACSSsfjplsZCJq0LDfiTdi72cRwYrM/Spa2hUCjEjrFh7uPIM4U9wDVKpVLjjd9+GjsGpNZbH9yVygdJkCSjo6ONidfeiR0DUuvDO3c0svDACqDZTpw4ETsCG7Bnz57YEdZE8ZJ+7V7k8/LLL3uWAOuUhcUuXV1dqf93gPVS2ANcxdgtaI6srOyFGEqlkikv0ARHjhzxsAfgGpVKxTn2Kfbwww/HjrAmX/va1/wsTrl2jsM3YQw2bnZ21ucupJTCHuAqWViJCEmhKIG1s3AMmueZ8SPh0KFDfhYBXKM8UoodgXVKW5n5xBNPxI7ABhwuD7ZtHP7AwIAJY9AEB1+aC+VyObX3QLt3744dAaJR2AP80fT0dGovZiCJFCWwdhaOQXNNvPZOGBgY8H0FcJXp6enYEdiANI2ZH3+lEjsCGzA/P9+W9+nu7g5vfXBXW94L8uDn80vugSCFFPYAIYTh4eGGG0loPkUJrJ4FLtAab31wl2NaAK5iLH667d1rgSftcfTo0bZ8Vnx45w5f09Bkb31wV6oWeAEKe4BQKBTCG7/9NHYMyCxFCdyaEZDQWqZXAHze5Fhf7Ais0yOPPBI7wqqUSiU/e1PscHkw1Ov1lr+PRcvQOhbDQLoo7IHc8wAXWs959nBjhULBCEhogzSf5QjQbMePH48dgXVKy3TAPXv2xI7ABrRjHL5Fy9B6joCF9FDYA7nmwS20xzPjR8Lw8LDvN7iOl19+2fcGtMHP55fs9gP4o6mpKWPxUywNE8wefvjh2BHYgFaPw7doGdpj/JWKoyohJRT2QG51d3eHn88vxY4BufHGbz9NxYMlaKfh4eHGwZfmYseA3Fi6tDV2BIDEMBY/vXp7exNfvrjGTa92jMN/4YUXEv81DFnhqEpIB4U9kFvO8YH2Mxof/qRQKIQ3fvtp7BiQOyYsAXzm1KlTsSOwTtu3b48d4aYUQ+nW6nH4AwMDjbQc7QBZ4XkcJJ/CHsil0dFRFykQwTPjR4zigj+yqwTi+Pn8Uuju7o4dAyC6Vo+8pnWSfu73rl27XOemWCs/G4zChzgcVQnJp7AHcqdQKITXFy/EjgG5ZRQX2FUCsf3TP/2Th1VA7tXr9XC4PBg7Bhm0e/fu2BFYp1aPw//e977nGgwicVQlJJvCHsidl19+2c0BROYmnbyzqwTiMvEF4DOtHn1N6yT551jSJwBwY638TOju7va1AZEZjQ/JpbAHcqVUKjUOvjQXOwbk3sRr7xhHTG45lgWSwcIZgBAWFhaMxU8pu9hphVaOw//wzh3ugyAyC5chuRT2QK4sXdoaOwLwRz/84Q/dIJA7jmWBZCmXy34WAblWrVZjR2CdHnroodgRrsvC7PRq5Th8BSEkh4XLkEwKeyA3hoeH3RxAghx8aS6USiXfl+SK4yAgWX4+v+QcRyD3nuvtih2BdXhm/EjsCNe1d+9e17sp1cpx+ApCSJZDhw75rIaEUdgDufHGbz+NHQG4hqkX5EmhUHBmIySQhTRA3h07dsxY/JRK4gLoRx55JHYE1qlV4/AdCQbJ46hKSB6FPZALbg4guYzGIy9efvllX+uQQBOvvWOXPZBrxuKn1549e2JH+ILxVyqxI7AOrRyH70gwSCZHVUKyKOyBXHBzAMllNB550N3dHQ6+NBc7BnADdtkDeVceKcWOwDo8/PDDsSOQEa0ah28DDSSXoyohWRT2QOa5OYDks8uerLNyHZLNLnsg76anp2NHYB2StiDUfV16tWocvg00kGyOqoTkUNgDmefmAJLvb/7mb2JHgJYpFAqJe5gKfJFd9kCeVSoV59inVJLOIN6xY0fsCKxDq8bh20AD6WCxFSSDwh7ItOHhYRcckALPjB9J1IMmaCYlIKTDxGvvxI4AEJWx+Om0d+/exFxr9vT0xI7AOrRqHL4NNJAOjqqEZFDYA5n2xm8/jR0BWCUjw8miQqGgBIQUsRMMyLNf/epXsSOwDo888kjsCFc8M34kdgTWoRXj8G2ggXSxyx7iU9gDmVUqlVxoQIocfGnO+cFkztNPP+1nEaSInWBAnk1NTRmLn0Ljr1RiRwghJGs0P6vXqnH4NtBAuthlD/Ep7IHM+ru/+7vYEYA1+uu//mvlJpmi/IP0sbsEyLPJsb7YEViHJCx8/trXvubnZwodPXq06a9pAw2kk+9diEthD2RSoVAIB1+aix0DWKOfzy/FjgBNo/SDdPr2t78dOwJANMePH48dgXXo7e2Nft25ffv22BFYh1ZM1rCBBtLJ9y7EpbAHMskuXUgvJSdZofSDdHJEC5BnxuKnUxLK8onX3okdgTVqxUQNG2ggvQ6+NOd4E4hIYQ9kkl26kF5KTrLAgypIN4s/gTw7XB6MHYE1UpazHq2YqPH000+7hoIUe/bZZ30PQyQKeyBznLcD6WZnI1ngQRWkm8WfQJ7Nz8/HjkDKeA6TTq2YqPH64oVmvyTQRhaAQTwKeyBznLcD6afsJO08qIL0Uz4AeXX06FFj8VMo5tFie/bsifXWrFMrxuG7doJsGB0d9b0MESjsgcwxghjSr7e3N3YEWDdnvkE2DA0NxY4AEEW9Xo8dgXXYvXt3tPd++OGHo70369OKcfiunSAbPJODOBT2QKYMDw9bAQgZ8Mz4EWPxSa2nnnrKzyLIgPFXKrEjAETzXG9X7Ais0UMPPRTtvW2cSJ9WjMN37QTZ8Mz4ERsRIAKFPZApf/mXfxk7AtAkxuKTVs6+huww2hXIq2PHjhmLnzLPjB+J8r4WWqePcfjArdiIAO13e+wAAM1kVTdkR29vb5iYmIgdA9aku7s7fBg7BNA0Q0NDoVKxWwzIn2q1Grb17IgdgzUqlUqNSqXS1sUWu3btarz1QTvfkY1q1Th8O+yzYXT/znDy5Mlw+vTpjrUckTIwMNDYsWNHePjhhz2fzQAbEaD97LAHMmNgYMDKP8gQY/FJI6vQIVs8eAbyzFj89NmzZ0/b33P37t1tf082xjh8rjW6f2fY9MmZjvOL0x0HDhzomJmZWVNZH0IIMzMzHePj4x39/f0d5xenO77x1TtalJZ2MTkD2kthD2TGX/3VX8WOADRZb2+vmwNSxSp0yB7nNwJ5deLEidgRWKOHH3647e858do7bX9P1s84fK5WHimFy7WFjgMHDnRUq9WmvvbU1FTH+cXpjsfv/7ipr0v7DA0NxY4AuaKwBzLDal7Inr/8y7+MHQFWzUQIyKa9e/d6CA3kUrtHq7NxxlBzK60Yh9/X19f016T1Hr//4zA0NLTmnfRrNTMz03G5tuDnSQp51g7tpbAHMsHOJ8gmD5xIExMhIJt6e3tjRwCIpjxSih2BNWrn8xHPYtKnFePwTVlIn67O5TAzM9O2Er1er4fzi9Mdh8uD7XpLmsTnPLSPwh7IBDufILvcHJAWJkJANj0zfiR2BIBopqenY0dgjdr5fMSzmHRpxTh8U8bS5/H7P442QWVwcNBO+5R56qmnfM6TOxcvXozyvgp7IBO+/vWvx44AtIibA9LCRAjILmezAnllLH76PPLII5l8LzauFePwn376addIKTK6f2dbd9Zfq16vB2fap8vP55diR4C2O3PmTJT3VdgDmaAkgezq6emJHQFuySQIyLY9e/bEjgAQTSt25dI67Txz2PnG6dKKcfg20KTLiy++GH0R1szMTIefK+likgZ58+GHH0Z5X4U9kHpKEsg2o4hJA+NAIdssHgPyrBW7cmkt5QrXalVBagNNejzX2xXq9XrsGCGEEH7yk5/EjsAa9Pb2et5BrsSaMKWwB1JPSQLZZ2EOSWccKGSbxWNAnrViVy6t1Y5yZWBgwLOYFGnFwhv36enys5/9LDGf5Y5bSZcnnngidgTIBYU9kHrGb0H2fe1rX/MwiEQzDhSyz0NpIM+ML06X7du3t/w9duzY0fL3oHlasfDGBpr0OFweTMzu+hWj+3fGjsAqed5BnjzX2xXtvRX2QOoZvwXZZzUvALF5KA3k2alTp2JHYA0mXnun5e/huJj0aNWCGxto0mN+fj52hC84efJk7AisgaNWyItjx45FmwCisAcAEs9qXpLMOFDIB0dfAHl29OhR44v5HMfFpEcrxuGHYANNmiwsLCTuM3xmZiZxmbixXbt2ee5BLlSr1WjvrbAHUk1JAkBsxoFCPlg8BuRZvV4Ph8uDsWOwBq18XmKnZbq0Yhw+6RKzgCIbdu/eHTsCtNzj938c9f0V9kCqKUkgP5wdTFI9/PDDsSMAALRcEkcqc2OtLFd6e3ttnkiJ8kipJa9rAw3NYCFYerTjqBWI6XB5MPrkD4U9kGrbtm2LHQFok6997WseCJBIRkFCflg8BuSZsfjp8tBDD7Xstbdv396y16a5pqenW/K6dtumR6sWbTTDuXPnYkcACCGEMDg4GP06V2EPpJrRpJAfHgoBEFtXV5fFY0Bu1ev12BFYg1aeMW+nZXpUKpWWFBBbt25txcvSAhcvXowdgYyweJms6upcTsR1rsIeAEiFVu4QgfVywwr5YjcZkHfP9XbFjsAalEolC81yrJU7q00ZS48kF/bnz5+PHYE1sHiZLNr0yZmOVi1uWyuFPZBahUIhdgSgjVq5QwTWyw0r5Mvdd98dOwJAVMeOHUvEA01WZ8+ePU1/TYsA0qNV4/BJlzNnzsSOcEPvv/9+7AisgcXLZMno/p3h/OJ0R7VajR3lCoU9kFq7du1ykwhAVG5YIV8cxwTkXZIeanJrDz/8cNNf87HHHmv6a9IardoxaNEG5JOjMMiC53q7wuXaQseBAwcStwj19tgBANbrgQceCG99cCF2DFpodP/OcP78+SsrbmdmZj73g7RUKjU2bdoUQvisNNu6dauxbBlXKBQScaYQrLDbNtsOlwfDuXPnwtmzZ8NHH30UPvzwwy88+BwYGGiEEMI999wTtm/fHh566CETQQDItPJIyQKmlGjF/fHXv/718Ppi81+X5iqPlMLQYmt22P/5n/95WPrtpy15bSC5PHMljUb37wxnz54Nb7/9dke1Wg3ji7ET3ZjCHkitbdu2hbCosM+SybG+cPz48TA1NdURQggHbnFzeXVpMjMzc+XXu7u7w1NPPdX4+fxSq6ISya5duxrXLtyAmDyszp7ySClMT0+HSqXS8eSTt37IeaPPpFKp1Ojr6wsTr73T9IwAENNnY7btskuL7u7upk5GUNikQyvH4W/fvj288VvXuAB83rWb70K48TOTdrlVv5AkCnsgtT4bw+MGIQtG9+8ML774Ykd/f3N+gFar1VCtVjtC+Gzn41sf3NWU1yW+e+65J3YEIKP29WwOExMTHc3aiVSpVDoqlc8WdIyOjjZet8gwM0qlUqNVI2YB0qBSqXRs6xkyEjsl9u7d21i5P96oQqHQjJehDVp5reJ5HOSXyZdcz+j+neHAgQMdaSrHk8gZ9kBqWdWdDV2dy+HAgQMdrbrYm5mZ6Ti/ON3xXG9XS16f9tq+fXvsCEDGHC4Phsu1hY6JiYmWPdScmJjoOL843VEeKbXqLWijleN4APLMz7T0eOSRR5r2Wrt27bJQIwVa/f3peRzkl58DXM+LL75oQXsTKOwBiGKlIGnXDrXx8fGOrs7ldrwVACkxOdYXnnzyyZYtGrvW0NBQx76ezW15L1rngQceiB0BILpf/vKXsSOwSs08wmn37t1Ney1ap5Xj8IF8M/mS6zF1oTmMxAcgisHBwbYVJCsqlUpHqVRqLF1y3mJaOQuaJPnsyI3YKVivybG+0N/f3/ZV4BMTEx1G5Kfbtm3bYkcAiG5mZsZY/BRp1gjjhx56KBiFnnyO7uFqO3bsCCGERH5e79ixI7z1wVLsGKyByZfQOgp7ANrucm2h7WX9ikqloigBIEpZv2JiYqJjenq60cwdbwDQbpNjfUZjp0Rvb29jampqw9c+z4wfaUYcWqg8UgpDLTxD+LNNEC17eVrg5/NLIYS7Yse4LmU9wJ8YiQ+kUqlUSuTKUG5tX8/m6GNyWnlOMZAfRsGlVxKOSPn+97/vZ1FKfba7EIDjx4/HjsAqNWNHZHd398aD0HKtHoe/adOmlr4+kGwmX0LrKOyBVHKDkF5JKcsfv//j2BGAlDMKLp0mx/oSMSa0Xq8H59mnk92FAJ9pxo5t2qMZBcvevXttnEiBVl/nPvDAA618eQDILYU9AG3zXG9X7AhXzMzMeLgEkENJ2g149OhRP4sASLXD5cHYEWiTRx55JHYEbqE8Umr5e2zbtq3l7wEAeaSwB1LJit50OnbsWKKKiSQtIACgPZK0G7Ber4fJsb7YMQBg3ebn52NHYJUGBgY2tEN+/JVKs6LQIq0ehw8AtI7CHkglK3rTqVqtxo7wOSdOnIgdgXUolUpGMZIIzm5LnyTuAjx16lTsCACwbqbFpMfu3btjR6DF2nHsk3sgAGgNhT0AbZHEkiQJZxizdps2bYodAUipc+fOxY7wBe+++27sCACwbvV6PZH3enzRQw89tO5/dqO782m9dozDBwBaR2EPQFsksSQBIF9OnjwZO8IXWDwGQNotLi7GjsAqPDN+ZN3/rGMJk884fKBdCoVC7AiQSQp7AAAAAGBdjh07ZvFZSnR3d6/rn3vkkUeaG4SmswgUaJddu3aZugItoLAHUmnr1q2xI7BGZ8+ejR0BAACAJqtWq7EjsEpf+9rX1lWyjL9SaXYUmui53q7YEQCADVLYA6l08KW52BFYo48++ih2BACApnCWL8DnKQzTYfv27bEj0AKmXABA+insAQAAAIB1O3HiROwIrMLEa++s+Z9Z7xh92seUCwBIP4U9AJAqO3bsiB0BAAC4ivOzs6urq8tUmQRr53SLQqHQtvcCgLxR2AMAqXL33XfHjgAAAFyjPFKKHYEW2L17d+wI3EQ7x+Hv2rXL4g0AaBGFPQAAAACwIdPT07EjsAoDAwNrKl23bt3aqig0gXH4AJANCnsAAAAAYEOMxU+HBx54YE2//+BLcy3Jwca1cxw+ANBaCnsAAAAAYMMmx/piR+AWtm3bFjsCTdLOcfgAQGsp7AEAAACADTt+/HjsCNzCQw89FDsCTWIcPgBkh8IeAAAAANiwqakpO34T7pnxI6v+vWs97572MQ4fALJFYQ8AAAAANIWx+Nlxzz33xI7ADRiHDwDZorAHAAAAAJri1KlTsSNwC4VCYVW/b/v27S1OwnoZhw8A2aKwBwAAAACa4ujRo3b+JtyuXbtWNer+7rvvbnUU1sE4fADIHoU9AAAAANAU9Xo9HC4Pxo7BTax21P34K5XWBmFdjMMHgOxR2AMAAAAATTM/Px87Ajdh1H26GYcPANmjsAcAAAAAmsZYfGgN4/ABIJsU9gAAAABA09Tr9dgRuImJ19655e8pFAptSMJaGYcPANmksAcAAAAAmspO4HTbtWtXI3YGvsg4fADIJoU9AAAAANBUdgJDc1kEAwDZpbAHAAAAAJrKTuB027FjR+wIXMMiGADILoU9AAAAANB05ZFS7AjcwK3OqL/77rvblITVsggGALJLYQ8AAAAANN309HTsCNzArc6oV9gni3H4AJBtCnsAAAAAoOkqlYoR3ik1/koldgSu8rOf/cz3EgBkmMIeAAAAAGgJY/GTyRn16XG4PBjq9XrsGABACynsAQAAAICW+OUvfxk7Atdh5H16zM/Px44AALSYwh4AAAAAaImZmRmjvGEDjh496nsIADJOYQ8AAAAAtMzkWF/sCFxj4rV3YkdgFYzDB4B8UNgDAAAAAC1z/Pjx2BFYg+7u7tgR+CPj8AEgHxT2AAAAAEDLTE1NGemdIl1dXY3YGfiMcfgAkA8KewAAAACgpQ6XB2NHgFQxDh8A8kNhDwAAAAC0lNHesDa+ZwAgPxT2AAAAAEBLGe2dHrt3744dgeB7BgDyRGEPAAAAALRUvV43Fj9hCoVC7AjcgHH4AJAvCnsAAAAAoOUWFxdjR+Aqu3btasTOwPUZhw8A+aKwBwAAAABa7tixY0Z8p8Ddd98dO0LuGYcPJNXp06d9PkELKOwBAAAAgJarVquxI7AK469UYkfINePwgSTz+QStobAHAAAAANriud6u2BH4o3vuuSd2BK7DOHwAyB+FPQAAAADQFidOnIgdgT/avn177Ahch3H4AJA/CnsAAAAAoC0qlYoyEm7AOHwgyUb374wdATJLYQ8AAAAAtE15pBQ7AiSScfhAkp08eTJ2BMgshT0AAAAA0DbT09OxI0AiGYcPJNnMzIzPKGgRhT0AAAAA0DbG4ifD3XffHTsCVzEOH0iyw+XB2BEg0xT2AAAAAEBbTY71xY6Qe+OvVGJH4CrG4QNJ5jMKWkthDwAAAAC01fHjx2NHgEQxDh9IsomJCZ9R0EIKewAAAACgraampjz4hz+aHOszDh9IrNH9O2NHgMxT2AMAAAAAbWcsfvIUCoXYEXLJxAkgyV588UWL7KDFFPYAAAAAQNudOnUqdgSusWvXrkbsDHlk4gSQVPt6NpsAAm2gsAcAAAAA2s6Z3WDSBJBszq6H9lDYAwAAAABtV6/Xw+HyYOwYEJVx+EBSXa4tKOuhTRT2AAAAAEAU8/PzsSNAVMbhA0nU1blsFD60kcIeAAAAAIjCWHzyzDh8IIm6OpdDpVLx8xnaSGEPAAAAAERh9x55Zhw+kDSbPjnToayH9lPYAwAAAADRPNfbFTsCRGEcPpAU5ZFSOL843VGtVmNHgVxS2AMAAAAA0Rw7dkxpSe4Yhw8kRVfnchgaGvKzGCJS2AMAAAAA0djNRx4Zhw/ENDnWFx6//+NwfnHaCHxIAIU9AAAAABBVeaQUOwK0VdrG4c/MzKQqL/BFh8uDYV/P5nC5ttDR39/f4fsakuP22AEAANbi7NmzsSMAAABNNj09HULYGjsGtMXkWF/o75+OHQPIuNH9O8P58+fDu+++GyqVSseTT/rcgaRS2AMAqfLRRx/FjgAAADRZpVLp2NYz1IidI+92794d3nrtndgxMs84fNrl8fs/Nh0hxw4sKughLYzEB1LpcHkwdgQAAHLq9OnTHnoCtICx+ORF2sbhAwCtpbAHUuncuXOxI7BGu3fvjh0BAKAp6vV67AgAmfTLX/4ydgRoucmxvtgRAICEUdgDAAAAANEZ20weGIcPAFxLYQ9AW2zdujV2BABybseOHbEjfEGpVHJWLwBcxe5jss44fADgWgp7ANri4EtzsSN8gZIEIF8efvjh2BG+4LHHHosdAQASxe5jsiztC1IOlwdjRwCATFLYA9A23d3dsSN8zp49e2JHYB2MySQpyiOl2BFYoyQuHvv6178eOwIAJIrdx+01MDDQuPr/TMdrrbQvSDl37lzsCACQSbfHDgCwHidPngwh3BU7Bmv01FNPNarVamIevvx8fil2BCDFLl68GDsC6zAwMNBIysKfQqGQyEUEABDb4fJgeGb8SOwYufDWB59/tvKWa5OWsiAFWq9QKIRdu3Z9Yarm6dOnO+r1eoxIALdkhz0AbZOkgnxgYMA4fIAc+va3vx07whVPP/20n0UAcB3z8/OxI0DTpX0cfgghnD17NnYEuKHR0dHGtp6hxm3FvY23PrgrXPt/txX3Nrb1DDW29Qw1Dh061PBsEEgShT0AbVUulxNxMXztLgKAtbLDPp0OvjSXiEVbhUIhvL54IXYMAEiko0eP2oVM5vzkJz+JHWHDPvroo9gR4AtKpVJjW89QYy33VxOvvRPe+uCucHWBXyqVot8nAvmlsAdS6fTp027eU+rn80vRz7JPyqIBIN3OnDkTOwLr9NYHd4VCoRA1w8svv+xnUUqN7t8ZOwJA5tXr9XC4PBg7BjRVpVJJ/bOspaWl1P875M3u3btjR2ipUqnUWLq0dcOvM/HaO2Hp0tawrWeoMTs72xgeHna/BrSVwh5IJecNpduHd+5oxCpKSqVSI0mj+QGII2ZhPjo62nB2PQDc3OLiYuwI0DTlkVLsCE1RrVZjR4ArmlXWX+vgS3Phjd9+eqW8t/MeaAeFPQBR3Fbc2/bSfnh4uCUX8rRPVh5ykA2mvaTbwZfmwuzsbNsfvJTL5TWNaiR5HIcB0B7Hjh1zrUVmTE9Px45ATm3dms3nYK0q66918KW5KzvvR0dHFfdAyyjsAYjmtuLeRjvOES4UCmF6errxxm8/bfVb0WJKEpLEtJf0O/jSXNjWM9SWHROFQiG8+eabprxkgOMwANrDTl6yJAvj8EmnLE72KhQKIcaGnNcXL4RtPUON6enpRuzjPoHsUdgDENVbH9wV3nzzzZaVJaOjo43binsb469UWvHytNn58+djRwAyaOnS1jA7O9uShy6FQiEcOnSocVtxb+OZ8SNNf30AyLLnertiR4ANy9qkuKz9+5A+txX3Rt3pPv5KJXx4547Gm2++6ax7oGkU9kBqje7fGTsCTfLM+JEr46XK5fKGC5Ph4eHG7OxsY1vP0P+/vfsLjepaH///zMcjiF5EAt64ySiHudLWDLUIjjTQbRCCHMjQQSIHMlgiaaGNlDNB6I9BZKBQnC8laeFYDJUJlIiMTOAgAUlGSOkIUsskrV6FgyaMN0JoLhRBZP8uPDuNNomZ2Wvvtf+8X/DhU4/Ozsrsf2ut51nPouxwyDx8+FB3EwCE1LlLk6uTLrlcztG2LYZhSC6XsyqVirVtX7dVvHZPYUuhW7lcZoUcAHjk9u3bupsAOBa2cvhUvgueMK0GHx0d9U2A/Ex+fHWv+9HRUc+3/gQQLn/T3QAAaBUDhHC6MrUgsrPTiqc6ReTPxIz5+Xn5448//vLvu7q6RETk4MGDYq9cvPXghdx6MOlJe+GthYUFgiTwlZHh3lCWGIwy+12ybV+3Fd8ncrXQL/fv3xcRkdnZ2XU/s9676HrtiVyvTbrfYAAAQqxarcbiqaxvgjNAK8JWDv9Vn3iX7magCe+//75Vr9cDfx3mcjnfJkMXr92Tbfu6rcp3vfLjjz+S5AugaQTsAQTWq/1DGSCE3esd8b+e77urf+/PDjvUYh9L+M3S0pLuJsBlr5exX7/fwbsIAAD3FAZNYYszBFVh0JRsLVwr7BcWFmKys5NEmgD54IMPZGxsTHczHDFNMxBVNF8l9O+SeCprnUrtkYmJiVij0dDdLAABQEl8AIHFSlsAgG7z8/O6mwDAQ1cL/bqbAACRE7Zy4oiWMF6/JNIHT9CTnkzTtBaed+huRtOu1568WnVfqTje/hNA+BGwBxBYDBAAALqtt1UHgPCyt0cAAHgnbOXEES1cv/AL0zQDWRXBMAwJYrB+rXOXJmV5Z6cVT2WtXC4XyPMAwH0E7AEAQCDk+g7rbgLwF+xLB0QLVTUAQI+R4V7dTQCaVhg0dTfBNWH+3cLq888/192EppmmaW3b1x2qAPf12hOJp7LW6Ogoq+4BvIaAPYBAoywpEB2Li4u6mwAAiLj//ve/upsAAJF08+ZN3U0AmhbGcvi23377TXcT0KRzlyYlSAHioJbB36ritXuyvLPTmpmZsTKZTKiSEgC0hoA9gECjLCkQHQ8fPtTdBGBdJI8B0UFZWwDQY2xsjOcvAifM/YZff/1VdxPQggsXLgQiMJzJZEIdrF/rTH5c7j7eJfFU1ioUCpZhGLqbBEATAvYAAm12dlZ3EwB4hNLj8CuSxwAAANxHWXwESdhLxoc5GSHMzl2a9P1e9oVCwbr7eJfuZmhxZWpBtu3rtiqViuX38wRAPQL2AALtzp07DBAAAFqRPAZEA4EiANDr559/1t0EYMvCXA4fwebXleuGYcjMzIx1ZWpBd1O0O3dpUhaed0g8lbVyuRyBeyAiCNgDCLRGo6G7CQA8QJAEfkbyGBANv//+u+4mAECkTUxM0OdCYERhBXqu77DuJqBFlUrFV0HggYEBa9u+butMflx3U3zneu2JxFNZq1QqWclkUndzALiIgD2AwGPvYCD8CJLAz0geA6Jhbm5OdxMAINIajQbjfwRC2Mvh2+bn53U3AS06d2nSF0H7ZDIpMzMz1q0HL3Q3xffy31dleWenNTMzYw0MDGg/dwDUI2APIPBqtZruJgBw2e3bt3U3AdgUVSCA8CuXy6FfKQcAfjc1NaW7CcBbRaUc/tTUFH2jALOD9oZheP6zk8mkVCoVa3lnJ6vqm3QmPy63HryQeCprjY6Oajl/ANxBwB5A4LHaCQi/KJQTRLBRBQIAAMB9lMVHEERl/EqlseA7d2lStu3rtkzT9GTFtmmalh2oP3dp0osfGWrFa/dk275uq1KpWJlMhlX3QMARsAcQeKx2AgDoRhUIINzYoxUA/IEAIfwuKuXwbVH7fcNq4XmHVCoVV/ZITyaTUigUrHgqay087xAC9eqduzQpdx/vkngqa+VyOQL3QEARsAcAAL5GkARBEJVVNEBUzc7O6m4CAOB/zvYkdDcB2FBUyuHbfvrpJ91NgCLnLk3K8s5Oyw76thq8NwxDMpmMNTo6asVTWWt5Z6d1ZWpBbWOxoeu1JwTugYD6m+4GAIAKZ3sSQucPCCeCJAiKq4V+Yf89IJyo6AQA/nHjxo2Y7OwkEAFfiloi79jYWCyeynI/hsz12hORnZ1WPNUpIq8vpLDnaDo7O6WtrU1ERDo6Xl85f/exyN1r97xrMP7CDtwf2fuUsQwQEATsAYTCq1LEHbqbAcAFDCwQFFNTU7qbAAAAEHr1el3sIBLgJ2d7EpKv6W6F90hcDr/ia8H3XSIicvfx2oVTBOf96u7jXVIqlawvv/wyxrYygL9REh9AKEQtgxmIiquFft1NALZsenqadxEQQmzNAgD+w7MZfnTjxo1IjgdqtQhmKQABkv++Ktv2dVumaVINA/AxAvYAQmNkuFd3EwAoxoplBEm9XtfdBAAumJyc1N0EAMAbeDbDj6I6HohqogIQNAvPO4SgPeBfBOwBhMbPP/+suwkAFGPFMoKmMGjqbgIAxajkBAD+w7MZfnO2J6G7CdpENVEBCCKC9oB/EbAHEBoTExMM2IGQYeCPoCmVSrqbAEAhKjgBgH+RKAk/ifoq8ygnLABBQ9Ae8CcC9gBCo9FosN81ECLsS4kgYrUXEC43b97U3QQAwAb+85//6G4CsCrqyeZRT1gAgmbheYfuJgB4AwF7AKHCftdAeLAvJYKKFblAeIyNjTH5DAA+VS6XeUbDF1hdTsICEESjo6Ossgd8hIA9gFChLD4QHqxURlD9+OOPupsAQAGSbwDA/3hWww9YXf4KiQtAsBSv3RPDMHQ3A8D/ELAHECqUxQfCgYE+gozVXkA4UA4fAPyPZzX8gNXlr1y+fJlxEBAw58+fZ5U94BME7AGEzsTEhO4mAHCIFQoIusKgqbsJAByiHD4A+B/PauhGsvmfWEQDBE/x2j3dTQDwPwTsAYQOA3Yg+FihgKD75ptveBcBAUbSDQAEBwFC6ESy+etYRAMETzKZ1N0EAELAHkBIMckKBNep1B7dTQAcI+kECLZSqaS7CQCALZqamtLdBEQY/f7XsYgGCJ5EIkFZfMAHCNgDCCVWNgLBNTExwf2LUCD5BAiuarXKuwgAAoLxA3ShHP76cn2HdTcBQBO6urp0NwGAELAHEFJkOAPBNDLcK41GQ3czACWKxSKTx0AAkWwDAMHCvtnQhXL46/vhhx/4XgAAaBIBewChxWQrEDwXL15kYI9QYYsWIHhItgGA4KnVarqbgAhiscj66vW6jAz36m4GAACBQsAeQGgx2QoEDxMeCBu2aAGChRKuABBMrHSG1yiHv7lvv/1WdxMAAAgUAvYAQo1JVyA4ThzYrrsJgHKsLgGChRKuABBMJP7CaySJbK5arfL9AAGxuLiouwkAhIA9gJD7+uuvGSAAATE2Nsb9ilBidQkQDCPDvQR8ACDAWPEML9FneLsje5/qbgKALXj48KHuJgAQAvYAQq7RaLDKHgiAU6k9upsAuIbVJUAwXLx4kXsVAAKMFc/wCskhW1Mul7kngQC4c+cO9yrgAwTsAYQeq+wB/ysWi9ynCDVWlwD+xup6AAg+nuPwCskhW8c4CPC/RqOhuwkAhIA9gAhglT3gb6yuRxSwugTwN1bXA0A4FAZN3U1ABJAcsnWMgwB/470J+AcBewCRwCp7wL9YXY+oYHUJ4E+srgeA8CiVSrqbgJAj4bx5jIMA/+K9CfgHAXsAkcAqe8CfmOxAlJTL5djVQr/uZgB4A6vrASA8qtUqz3S4amJigmusSayyB/yL9ybgHwTsAUQGq+wB/2F1PaLmX//6F9c84COsrgeA8BkZ7tXdBITU1UI/ez23qP3ZHOMgwGdYRAP4CwF7AJHRaDToiAA+Qlk8RFG9XmePOMBHPvvsMyaPASBkbt68qbsJCKmpqSndTQiser1OMg3gM1QMAfyFgD2ASGE1L+APVwv9lMVDZH355Zdc+4AP5PoOs0oOAEJobGyMvhZcQXDLGRIlAf9gLAT4DwF7AJGT2LGkuwlA5FEWHFFGxRfAH4aGhngXAUBIsZIXqlEO37lGoyFnexK6mwFA2DoW8CMC9gAip1qtxihHDOiT6zvMfsGIPCq+AHqxLQsAhBtl8aEa5fDVyOfzjIMAzc72JEhAAnyIgD2ASKIcMaAPKxqBV6j4AujBtiwAEH5TU1M856EU5fDVYRwE6EXiDOBPBOwBRFKj0ZATB7brbgYQOQzMgT9Vq9VYru+w7mYAkdPf388EFQCEXKPRkKuFft3NQEhQDl8txkGAPlQaA/yLgD2AyBobG4uxrx3gncKgKdVqlSAJsAYVJwBvnTiwnQl3AIgISphDFa4l9RgHAd4bGe6l0hjgYwTsAUTaZ599RicF8Eg2m+V+A9ZB5QnAG1cL/TI2Nsa7CAAighLmUIVryR2MgwBvMQ8O+BsBewCR1mg0KAUEeICBOLCxarUaO9uT0N0MIPQohQ8A0UJFFahAOXz3MA4CvEOlMcD/CNgDiLxyuczeWYCLzvYkKIUPvEU+n4+xzyrgniN7nzJBBQARRDAQTlEO3135fJ65AsBlVBoDgoGAPQAIe2cBbrla6GcADmwRq38Bd+T6DrNXIwBE1I0bN3j+wxHK4bvv5aNpvmPARcw1AMFAwB4A/ocBAqAegwJg6xqNBttHAC4gMRMAoqter+tuAgKMcvjeYBwEuIdS+EBwELAHgP9hgAColdixxKAAaFK1Wo2dSu3R3QwgNEjIBACwBR5aRTl87zAOAtQrDJqUwgcChIA9AKzBAAFQ41RqD/vWAy0qFouxkeFe3c0AAo/EMQCAiMjk5KTuJiCgKIfvLcZBgFrZbJZnGBAgBOwB4A3FYjFWGDR1NwMIrFzfYSkWiwwKAAfS6TT3EODAiQPbSRwDAIiI8D5ASyiHrwfjIEANKo0BwUPAHgDWkc1myeoFWjAy3MtewYAiDLCB1pxK7aH0IwDgNSTlo1mUw9eHcRDgDJXGgGAiYA8AG/jss88YIABNIhseUKfRaDBZBTRpZLiXKi8AgL/4z3/+o7sJCBjK4evTaDSk/dkc3z/QAraoBIKLgD0AbIBACdAc7hdAvUajIYkdS7qbAQTCyHAviWMAgHWVy2XeD9gyyuHrV6/XGQcBTWKLSiDYCNgDwCYI2gNb8/LRdIwJDcAd1Wo1xmQVsDmC9QCAt2HbO2wV5fD9gXEQsHVsUQkEHwF7AHgLgvbA5gjWA+5jsgrYHMF6AMDb3Lx5U3cTEBCsUPUPxkHA25G8DIQDAXsA2AKC9sD6CNYD3mGyClgffTQAwFaMjY3xvsBbUYnBfxgHAZsjWA+EAwF7ANgigvbA6wjWA95jsgr408hwryzWSryLAABbdrXQr7sJ8DkqMfgT4yBgfcxVA+FBwB4AmkDQHniFYD2gD5NVAGUfAQCtYW9yvA2VGPyLcRDwOubmgHAhYA8ATSJoj6hjQADoV61WY+3P5ngXIZII1gMAWjUxMcH7AxuiHL7/EbQHqDQGhBUBewBoQaPRkMVaKcZgDlHCgADwl3q9TgIZIudUag/BegBAyxqNBmXxsSHK4QdDtVqNMQ5CVJG8DIQXAXsAcCCdTsfO9iR0NwNw3dmeBAMCwIdIIEOUnDiwXYrFIu8iAIAjtVpNdxPgU5TDDw67+iUJOIiSXN9h5uaAECNgDwAO5fP52IkD23U3A3DNiQPbJZ/PMyAAfIwEMoRdYscSk+gAACVu3LjB+wR/QQJs8DQaDTl+/HisMGjqbgrgulOpPTI0NMT7CwgxAvZAwCwuLupuAtYxNjbGHloIJQIkQHDk8/nYkb1PdTcDUO7lo+lYtVrlXQQg1Bjre6der+tuAnyIcvjBlc1mY6dSe3Q3A3BNYscSlcaACCBgDwTMw4cPdTcBG7D30CIrG2FwtdBPgAQIoHK5HGt/Nsd9i1DI9R2WxVop1mg0dDcFCJRyucx7IIAY63uLykR4E4nqwVYsFllIg1Bibg6IDgL2AKBQo9GQdDpNZi8C7WxPQo4fP06ABAioer0ui7USpSERaEf2PqXko4gsLy/rbgIAhNLly5cj/47Bn+g3h4O9kIZ97REGhUGT5GUgYgjYAwGzsLDAoDIAyOxFUCV2LLFfPQJtdnZWdxN8I5vNUiIfgWNXeGGF8CuspgkmEi0A/2s0GuxZjlXffPMN79uQsPe1ZyENguzI3qeSzWYj+VxaWVnR3QRAGwL2EZHrO6y7CVCEvdaCo1qtxhZrpRj3H4LALjtMYAAIl3K5zCoTBAYVXhAW9KfQCpLzvXfx4kW+c8jIcC9zbSFULBbZKgyBQ/KyyNzcnO4moEkkQKpDwD4iFhcXdTcBiKyhoSFW28PXEjuWKDu8ATqdwcNk91/Zq0xOHNiuuynAhtqfzcWo8AIgyggYeq9er9PfB4kbIWZvFXa2J6G7KcBbnTiwneRlYU4niJaWiHuoQsA+In799VfdTYAC7KkVXKy2hx+xqv7t6HQGD5PdGxsbG4u9fDTN3vbwlRMHtstirRTj3t0YFTLQCp71wNYQrI02VtdHQz6fZ7U9fMteVT82NsY1KszpBBFbU6pDwD4iCMaEw08//aS7CXBoaGgo1v5sjtLE0OpqoV/an83FWFX/dnQ6ETaNRoO97eELhUGTiaktun//vu4moAl+CZT/9ttvupuAJrDKWx9W2UcbCRvRYa+2p+oY/OTI3qesqkfg3blzh3epIgTsI4QBSPBNTU3x8AuBer0ux48fJ1gCLezBABmrW0OnM1ioYrJ15XI5tlgrxU6l9uhuCiIosWNJstksE1NbRPJYsPglyXp6epo+TID8/PPPupsQaZ999hn3SwTl+g6zkjOC7KpjjB2hU67vcOT3qt8M21gEC+N6dQjYR8iPP/6ouwlwYGS4l4dfyNjBEjoh8MLZnoQs1koMBprUaDQoRRwgk5OTupsQOMVikQkreMYuf0/1r+bw7g4Wv1SNIAgVLCRY6NVoNIRVt9Hz9ddfc99FVKPRoAImtBgZ7l2teMk8/8Zu3LjB8zkgiGuoRcA+QpjoCTYSLsIrn88TLIFr7KzdfD7PO6BFU1NTupuALSII2Jq1E1ZUZIIbTqX2yGKtRPl7B/xSZh2b89szlPFFMFwt9JNg4QNjY2P0gyIksWOJRTGgAiY81f5sLpZOp6l4uQV8R8Fx+fJlxvgK8WVGTCaTse4+3qW7GWjBYq3E/RoBhmHI+fPnreK1e7qbgoDL9R2Wr7/+moxdReKprKW7DdjcqdQeKRaLvCsVSCaTcuHCBevcpUndTUHAcV+qk0wmZXlnJ+8in2t/NuerSVjDMGTbvm6uG587svcpCyx8gnsmGuifYCPMm8MNvOdbw/3of7m+wzI0NMS1rRBfZgTNzMxYZ/LjupuBJvht4gfuI3CPVhGod8fAwIB168EL3c3AJkhsU4/APVrFRLg7SqWSlf++qrsZ2MDIcK+k02nfXfejo6OMKXyOPoy/ELQPN78+q+EvBArh1NVCv/z73/8mUO8Q4x9/e/lomvlnxXhgRBCDj2A5cWC7b/ZBhPcMw5BPPvnEujK1oLsp8LlTqT0yMTFBR8lFlUqFwKVPJXYsUQ7fRclkUj7++GMCPngrAvXuYhznb36esKJSkH/5+bqJMp634VQYNCWbzdJPwZZlMhnrn//8pzAPgK0aGe6VixcvsvBOEd7H/sU8nDv4QiOKh10wMOmJtXK5nHW99kR3M+AzJPV4h3enP3EPeMcwDDl9+jTvIrxmZLhXfvzxR1aPeIR3kT/5fcKK68af/H7dRJ1hGPLdd9+RsBsSzK/BiWQyKV988QUrfbEhql26h36s//BOdQ9faoQZhiFfffUVnQ2fYvCOjTBQQGHQlG+++YaMXU1Yae8fvCv1YbUJzvYk5PLly0xKacCklb8EZfsywzBkfHyc7fF8gj5McFAaO/iC8pyG/5HAjLWuFvplYmKCBQQeYPzjH0f2PiVZ30V8sWDw4TNk5KEZuVzO6unpESbewu9qoV+mpqbIYPQJ3p16FQZN+fLLL3lX+gBbt0QLq+n9hepLeuX6DsvQ0FDg7gWuG70Y7wcX907wEFSAm0zTtLLZrLCYJnrO9iTkxo0bJAJpwLtYH+bhvEGnBavoaOhDIA5OJZNJ+eijjwiYhBArGP2NVcbe4n7wNyrAhJPdT52YmODe8ykSOL0TpvthYGDAOn36NNeNR06l9oTiugFzZ35HIA06DAwMWCdPnmReIMQKg6aUSiWq4/gE4x/vMA/nLR4wWJdhGHL06FGrq6tL2traGIgodLXQL/fv35fFxUX59ddfedFDOYL3wcckQzCZpmm99957Eo/HpXjtnu7mBN7IcK8sLS3J7Oys3Llzh8FBwDCZHWxhCkpGTSaTsTo7OyUej3P/KVAYNGVxcVHm5uZCvUrTvm7a2trowyhQGDRlZWVFZmdnQ33d4JW198/BgwcJHnhk7dzaw4cPudfgC3bJfAKJ4UCQPhgY/6jDPJx+PGwAIMSSyaR0d3czWPA5AiMAwoxEsmAYGe6VmzdvsgcjAAAAoAAr74PlaqFfarUaC2gAaMNkDABESCaTsf7xj3+QcegDub7DrLoBEDmGYUhPTw8TVz5gT0jdvn2bVSMAAACAi0zTtD788ENJpVIsqPER5uYA+AkPIgCIKDto8sEHHxDA9wCDAAD4K7sSzLFjxwjgu8wO0Ie9tDcAAADgd5lMxurq6mIrGo8xNwfAz3gwAQBW2QMG9t5zZmS4V37//XdWLQJAkwzDkKNHjzJ5pUBh0JTffvtNfv31V95FAAAAgI+Zpmm99957QiKzOoyHAAQNDyoAwIbswElnZ6e88847DBrWYQ8AHj58SIYuALggmUxKIpEgoWwTub7DMj8/L//973+ZjAIAAABCIJPJWPv375d3332XypibuFrol/v378v8/Lz88ssv7D8PILCYzAEANG1tIL+trS30qyBHhntlaWlJ5ufn5Y8//iAwDwA+sDaQLyKhfxcVBk1ZWVkhMA8AAABEmB3Ij8fj0tHREYnFNXZQfmVlRebm5mRhYYHAPIDQYZIHAKCcaZpWe3u72AMIEfHtqkg7ACIiMjs7KyJCxx8AQiCTyVgiInZymYh/g/q5vsMiIqsTUCIid+7ciTUaDZ3NAgAAABAgdlLz7t275dChQyIivg/q22MhEeblAEQbAXsAgHb2iv2N/n7tQONNi4uL8vDhww2Pvby8zCpEAMBb2ZNbG/392iS0N9kVWDbChBMAAAAAP7ITnTdiVzRbz9vGQSJClUoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADALTHdDQAAAPBCJpOxurq63vrvVlZW5Pbt21KtVuknAfCcYRhy+vRpKx6Pb/rveFYB7jNN0/rwww+lra1t03/np/txq/2dxcVFmZ6ejtXrdfcbBQAAoEAymZTu7u63jpVERGZnZ6VcLmvvmwHAVvHAAgAAoRdPZa1mPzMy3CvpdJq+EgDP5HI563rtSVOf4VkFuKNUKln576tNfUbn/WgYhmzb1910f+fEge0yNjbGMwQAAPhaK2MlEZGXj6ZjjUbDhRYBgFoMygAAQKhlMhnr7uNdLX22/dkcK88AeKaV5CIRAm6AaslkUpZ3drZ0P+rqOxQKBevK1EJLn12slXh+AAAAX2t1rHS2JyH5fJ6+DgDf+z/dDQAAAHDTVsrCbiSRSLQ0IASAZmUymZafN4cOHVLZFCDyurubX6lu09V3SKVSOn4sAACAr73zzju6mwAAW/I33Q0AAAAAALSueO2e7iYAoRKPx0VaKLmq05n8uO4mICBM07Ta29uls7NT2trapKOjQ85dmlRy7FzfYRERWVxclIcPH8rCwgLVqgAAWql6xwGA2wjYAwAAAAAAACFiGIb09PRYhw4dkoMHD64mdSw8F5HHIncf21soqEv6ej2BbJfIzk4rnuoUEZGrhX65f/++zM7Oyp07d9hPGAAAAFiDgD0AAAAAAAAQYIZhyOnTp61jx46tria89eCF3HpwT1QG5Vv1ZxWIXbJtX7cV3ycyMtwrP//8s0xMTBDABwAAQKQRsAc8kMlkrE8//ZQyheuws+xFRGZnZymZBwAAAADAFiSTSfnoo4+sK1OvVstfrz2R67VJvY1qgp1YYAfwz/Yk5MaNG8wJAAAAIHII2AMuSyaTcvfxLrlLsH5drycxvF4yL9d3WGZnZ6VcLsf0tA4AAAAAAP8wDEM++eQT68rUgiyLiB2sD4MrUwurcwKnUntYeQ8AAIDI+D/dDQDC7uOPP7Z0tyGoitfuyd3HuySeylozMzNWLpezDMPQ3SwAAAAAADyVTCalUqlY2/Z1W2EK0m/keu2JbNvXbVUqFSuZTOpuDgAAAOAqAvaAyw4ePKi7CaFwJj++OmCfmZmxMpkMiRAAAAAAgFDLZDJWPJW1lnd2WnYJ+Sg5d2lSlnd2ErgHAABAqBGwB1zGvvXqncmPr668z+VyBO4BAAAAAKFimqYVT2Wtu4936W6KLxC4BwAAQJgRsAcQaNdrTySeyrLiHgAAAAAQeIZhSKVSsRaed+huii/ZgfvR0VHmAAAAABAaBOwBhIK94p5MewAAAABAEA0MDFjb9nVHsvR9s4rX7kk8lbVM0yRwDwAAgMAjYA8gVJZ3dlImHwAAAAAQGIZhyMzMjHXrwQvdTQmchecdUigUmAMAAABAoBGwBxA612tPpFKpMGAHAAAAAPhaJpOxtu3rts7kx3U3JbCuTC3IzMyMZRiG7qYAAAAALSFgDyCUzl2alHgqy4AdAAAAAOBLuVzOuvt4l+5mhMKZ/Lhs29fNNnkAAAAIJAL2AEJt275ugvYAAAAAAF+pVCrW9doT3c0IneWdnexrDwAAgMAhYA8g9AjaAwAAAAD8olKpWOcuTepuRmgtPO8QgvYAAAAIkr/pbgAAeGHbvm7LkOlYo9HQ3RQAAAAAQET5JVif6zssKysrMjc3J8vLy1KtVmNOjpfJZCwRka6uLmlra5P891U1DW2RHbR3+nsBAAAAXiBgDyAyvvvuOyudTjNYBwAAAAB4TlewfmS4V37++WeZnp6O1et1EREZqpWU/oxyuRz73/9/7X9PJpPS3d1tHTt2TLz+3Reed0gymRT7dwYAAAD8ipL4ACLj3KVJKRQKlMUDAAAAAHjK62D92Z6EJHYsyWKtFEun07FisRjTEbiu1+tSLBZj6XQ6tlgrxRI7lqQwaHr285d3drJFHgAAAHyPFfaAzy3WSqFZEW4Yhhw9elRrmbwrUwtk2AMAAAAAPFMoFDwJ1o8M98q3334r1Wo1lq+5/uNaUq1WY9Xqq3mAgYEB6/Tp03ImP+7qzxwfH7eOHz8emrkVAAAAhA8BewCeaTQaG5bJy2Qy1j/+8Q9PAvjLOzstkTqDdQAAfCSZTMpHH31ktbW1vfXfLi4uysTERKzRaHjQMgAAWpfJZKwrUwuu/oxc32H5+uuvY+m02jL3bhsbG4uNjY1JMpmUCxcuuJbUcCY/LqOjo9bQ0BDzAAAAAPAlAvYAfKFcLsfsIP7AwIB168ELV39eLpezisUig3UAAHzAfvc3E9DYtq/bMmSaoD0AwLcMw5C7j3e5dvzCoClffvllbGgoWIH6N9XrdUmn07FMJmO59X0Vr90T0zStarXKPAAAAAB8hz3sAfjO2NhYbLFWih3Z+9S1n3G99sS1YwMAgOa0mqh3+vRpS3FTAABQZtu+btfeU4kdS5LNZkOVuFYul2OLtVLsbE/CleMvPO8Q9rMHAACAHxGwB+Bb9mD9xIHtrhw/l8sxyQ8AgGbJZLLlz8bjcXUNAQBAoUKh4Mp4M9d3WBZrpViYV4rn8/lYYseSK8c+f/488wAAAADwHQL2AHxvbGws1v5sTvlkBKvsAQDQL5FIMHEOAAiVZDLZ1DYvW5XYsSRR2Ye9Wq3GXj6ajl0t9Cs9rl0aX+lBAQAAAIcI2AMIhHq9Li8fTSufmBgYGGCgDgAAAABQ5sKFC8rHmS8fTYd6Vf16Go2GHD9+PDYy3Kv0uAvPO5QeDwAAAHCKgD2AwGg0GsqD9qdPn1Z5OAAAAABAhGUyGevcpUmlx3z5aDpUe9U3K51OKw/aZzIZkvcBAADgGwTsAQSK6qD9mfy4GIah6nAAAAAAgAi7+3iX0uNFPVhvUx20V32eAAAAACcI2AMInEajIYkdS8qOd/r0aTLrAQAAAACOqF61TbD+del0WmnFvVwux1wAAAAAfIGAPYBAqlarscKgqeRYPT09So4DAAAAAIgulau2EzuWhGD9X6msuHe99kTVoQAAAABHCNgDCKwvv/xSyUD9TH5cxWEAAAAAABGVTCaVHevEge1SrVaVriYPi0ajIScObFd2PPayBwAAgB8QsAcQWI1GQ3J9h5UcyzRNBukAAAAAgJZcuHBByZiyMGjK2NgYwfpNjI2NKau49+mnnyo5DgAAAOAEAXsAgfb1118rmcj48MMPVRwGAAAAABAxhmHIuUuTSo6lqpJc2KmsuKeyOgIAAADQCgL2AAKt0WjIyHCv4+O88847zhsDAAAAAIic06dPK1ldfyq1h33rt6jRaMip1B4lx/r444+puAcAAACtCNgDCLybN286Poaq1RAAAAAAgGjp6elRcpxiscjq+iao+r6K1+6pOAwAAADQMgL2AAKP/f0AAAAAADoYhiFn8uOOj3Nk71MFrYkeVavsM5kMq+wBAACgDQF7APgfwzB0NwEAAAAAECA9PT1KAr3lcplE9BaoWmX/z3/+U8VhAAAAgJYQsAcQCrm+w46PcfToUTLqAQAAAABbdvLkScfHULVKPKpUfH9skwcAAACdCNgDCIX5+XndTQAAAAAARIyKQO/ExASr6x1QtcreNE2S+AEAAKAFAXsAofDf//7X8TF2797tvCEAAAAAgEhIJpOOjzEy3CuNRsN5YyKuMGg6PkZvb6/zhgAAAAAtIGAPIBSq1arjjPpDhw6paAoAAAAAIAK6u7sdr8i+efOmiqZE3jfffEOVAgAAAAQWAXsAAAAAAACgSe+++67jY4yNjRFoVqBerzs+xsrKivOGAAAAAC0gYA8AAAAAAAA0Kf991dHnrxb6FbUEIiJnexKOPn/58mWSJwAAAKDF33Q3AADgvWQyKYlEwtq/f7/E43ERESleu9f0cQqDpqysrMjKyorMzc3J8vKyku0JsL5MJmPt3r17dfuGjo4OOXdpsunjcN6Azal6Rub6DouIyOLiojx8+FDu3LkTY49aBJFpmlZ7e7t0dnZKW1ubtLW1NR2kst899v2wsLAQU7EaEn+VyWQsEZGuri4Rab2/YD/D5ufn5Y8//uAZBrjg/v37upsQKjdu3IjJzs6mtyk4ldojxWIx1OMhFe9yEcaSOhmGIUePHn1tTuDgwYNyJj/e1HGuFvpXnz32O75cLnMOPeDmOaSf5h17vkDkz/62SGtzBrY35w4YKwHRxMsYcFk8lXW0p91ircR9ukVOv+tc32EZGhoK3fedTCalu7vbevfddx2vAGnGyHCv/P7773L79m0G8E0yDEN6enqsQ4cOOerwt8Ie+M3OzoZmwDc6Omq1+j0e2fuUyYuQM03Teu+998TrZ2Rh0JTffvtNpqenIz8Qz2Qy1t3Hu1r6bJje3U6+BxE1fcZkMinvv/++5++fwqApP/30k0xNTYXiveOlTCZjdXV1tTTZ60Su77DMz8+H9pwFse/gZCzEmLM1hmHItn3O9rCnr6leqVSyttKny/Udlh9++CGU/bBMJmN1dnbKO++801LCVqvsOYC5uTmua4d0zQmsnQ/gHDqjay5OJLz9NK/7OplMZjWJ3+u5ubXssdIvv/wSyncWgD/x4gVcRsDeOwTsX7EHdidPnvR0cP42I8O98vPPP8vExESoBgyqZDIZ6x//+IfnA7mtyPUdlsnJycAmXgRx0h3uMQxDTp8+bR07dsx3z8ibN29Gch9bAvav6AjY28FenRNQ6ykMmlIqlQL73nFTMpmUjz76yLoytaC7Ka8J2zkLYt+BgL33nD63Rfju3VKpVKz1+nlhe1bZ/PpuEHm1TQFJ/FtjmqaVzWZ9NydwtichN27cIFD4Fn6dixN59ez7z3/+E/i5DTf7Ovb5++CDD3x3D74prO8yAATsAdcRsPdO1AP2AwMDvhwYrCfKgam1TNO0Pv/880CcM1sQBwZBnHTXxTRNq7e3V0S2VpqvMGjK4uKiXL582feJOLlczurp6fF0BWqr/PqMzOVyWlaI+Jm9kkzFPeBFwN7PyWEbOduTCMQzxk1+DsSsJwyrVoPYdyBg772BgQHr1oMXjo7Bd+8e0zStv//97yIioSz5HbR3g8irscM333wT6PeDan4N0m/kVGoPizDeEKRxpsir8cu3334bqDkdm+q+jj3/4bfk5WaEod8N4E+BezADQUPA3jtOv+sTB7b7LjjyNoZhyPnz51ueUPSDKOwX+KZcLmddrz3R3QzHgnLugjjp7jUVJV39+L5KJpPy8ccfB/oZmes7LF9//bX2STGn79goePlo2tF5ciNgb0/mp1KpwEwibmRkuFcuXrwYqcmoTCZjffrpp4E9d0E+Z0HsOxCw956T68TGd49mqUgU8YOgjCXdEvQ5gagHCZPJpHzxxRdb2n7Dz4J2H6ro64RhjmA9I8O98uOPP0Zi/goIs//T3QAA8Is//vhDdxO2zDAMGR0dtbbt6w58J/N67YnEU1krl8uFPhiUy+WseCob6IH5WlE6d2GmIljvN8lkUiqVirW8szPwz8jitXuybV+3NTo6ahmGoaUNAwMDobo+3PLJJ5/44nsyTdMqlUpWPJW1lnd2WlemFgIb8F3r3KVJWd7ZaVUqFSuZTOpujqsymYwVT2Wtu493BfrcRemcAa0oDJq6m4AAsceSYQjWi/w5ltTZx9UhLHMCxWv3ZHlnZ+TO39pxZtCD9SLRmtOx770wzBGs59ylSbn7eJfMzMzQ7wYCjIA9AARMWAL1b7IHCqZphm6gYE+8B31QvhH73BHUC6bvvvsuNOfNTmZa3tm57r6lQaYzcH/o0CFPf15Q6S5JawfpF553BKasaivsIHChUAjNs8tmmuZqoD5M7HM2OjoaunOGaOvo6HD0+ZWVFUUtQZiFJcC7EbuPG8b3+lphnROwz1/YA76GYUipVArlOFPkzzmdTCYT2vMYtntvI2fy45FMpgHCgoA9APzPnTt3fF02yB7ghS1Q/6aF5x0SlgldwzBkZmYmdBPvG7n14IXEU1myeQMkl8spmXA4cWC788Y4NDAwEMpkpjfZk2JhnkxBa8IcpF/PlamF0Lxz7EnghefOgn9+V7x2L7TJmYgmp32oxcVFNQ1BKNlJXFEJMtnv9bD1cZPJZCTmBK7XnsjMzEwoA4T2ODMKfW17hXYYz2PU2PMG9LuBYCFgDyAUVAzqdO8PvBF7EjfsA7y17AndIA8STNO0tu3rtoJcyrZVYV35GDamaSqZABwZ7pWxsTFtCU92YkxYyoNu1d3Hu6RSqQT6OQmosLyzM9AVXuz+QhQmgW0Lzzsk7CvxgK14+PCh7ibAp0ZHR0OfxLWRu493SalUCkUfN5fLWcs7OyMzJ3AmPx6qAGFUx5n2eQxy/xp/ot8NBAsBewChsH//ft1NcEUymZSoTeKuFdTBXi6Xi+wEi+3K1ALBRB8zDENUXaOfffaZtmB9lBNjRF6t7AvqcxJQ6daDF4GciCoUCpHtL1yvPZFSqRS4cwYAbjIMQ6JQVe9t8t9XA93HNQxDKpVKZKojvCkMAcKojzNFXvWv6auFw/XaE6lUKpxLIAAI2AMIhXfffdfR50eGe9U0RKFMJmMt7+yMfIdq4XmHBGmgPjo6GtmB+ZvsYCJBe//Ztq9byT3V/mwupqs6CYkxfwrDpBjg1PXak0DdB5VKxboytaC7GVrlv68yeQgA/2MHCHW3w0+C2Mc1DEO27esO5T7nzQhav2wtxpl/yn9fpUR+SJy7NEm/GwgAAvYAQsHpCvTff/9dUUvUyOVykSqB/zZBCdqXSqXIr4ZYT5BXR4SRqiz5I3ufSr1eV3GopuVyORJj3hDkSTFAlSDcB/bqyahP5NuYPAQAAoSbuV57IqOjo4F4T5B08bog9MvexDjzr+wS+QTtg49+N+B/BOwBBJ6KTuPt27cVtEQNBgjrW3jeoeRcuyWXy0V264KtCErSRdipuk7P9iSkXC5rKYUf5fKSb0OpO8Dfk8P2qjvd7fCbc5cmAxOMAQDVGP+/XfHaPd/3cU3TJOliHddrTyQoe6FzL26OoH04ELQH/O1vuhsAAE6dPn3acae6Wq1q24N5LZ0DhJHhXllaWhIRkZWVFZmbm3vt7/fv3y/xeHz1zzpWkm/b121Jo+SLc7VWJpPxxcAu13d4w787ePCg6N5/zU660FVCPepM01RynY4M90o6ndZyH+ZyOU9XpV4t9Mv9+/dlcXFRHj58KAsLC7GtVBVIJpOSSCSs3bt3y6FDhzy9/85dmpRSqWRls1nfPSsBr1yvPRHTNC2/9O9E9Afr1/YR5ufn5Y8//njt77u6ulb/u6OjQ7yuAFC8dk8GBgassbEx35wzAHCbnwKEa+cD1tLxTliPHWTSNQ7ZjM5gvT1esc3Ozr729/Z4xKZjXuDWgxe+65e9Sfe9+LZ+Wmdnp7S1tYmISFtbm+Mqo63y65wcmnPu0qTkcjmrWCxyLgGfIWAPIPB6enrkeq31Acer4FNJYYtaMzAw4NkAIdd3WGZnZ+XOnTur+087+Q5M07Tee+89OXbsmOuDeb8FogzDEC+2L7AH4rOzsxsGDYdqzZ1DO6jY2dkp77zzjicTMdv2dVuGTGvb9zyqDMMQVZNIn332mbZgvdvPyJHhXvn5559leno6Vq/X5fjx1p6L9Xpd6vX6X74nwzCkp6fHOnnypKv3W/77qtIB+MrKiorDhJ5f+hOqvJmwsry83FKCYyaTWU1e8TLZz29JYl4F6+3n2K+//vra+XpbH6FcLq/7vxuGIUePHrW6urpcP3+3HryQZDKpbbsVAPCSjqTvXN9hmZ+fl19++eUv48lm+jD2OLKrq8vzxNTR0VFraGjIV/MBXgXrC4Om/PTTT6+dv1bHKyKvzuP7779vffDBB64HgP1cfcDLubj1zqFI6/00EW/Po4j4NnHGK4VBU1ZWVlYTK1odI4n82c+2F0h5OVbyY4IzABFuSMBl8VTW0eTcYo3Mxc0kk0lZ3tnp6Ds+ldojurMK3c7Ivlrol6mpKZmYmPAkUGqappXNZl0bLBzZ+1RbOe43Ob3HN3O2JyE3btzY0opeVZLJpHR3d1s9PT2uTbx4vUJ7dHTUanXg46drzYmZmRlLxflsfzbn6fVoc/MZebXQLxMTE6JjVWcmk7H++c9/uha8V3X96l4ZHBSJHUuOKvZkMhnLiwSw9WwU5HWLaZpWb2+v65NShUFT/JDkV6lUXK0OUhg0pVQqeXLuDMNQUt1qM34Y/wSx7+CkT+qH7zyInI4DwtLPRPNUzGNshZfvB9M0rQ8//FCuTC24/aN8MYcj4k0f2cs5gWQyKR999JHl1jnM9R0WPyVbiHhTHeFUas9qQrgX3D6PIq+uy3w+H6i+TrNGhnvl999/l7m5udcWO3khk8lY//jHPzxJwKAPCPgLNyTgMgL27iqVSo73Y375SO9qXzcHebm+w/L1119r+/3cnNT1w70xMDBg3XrwQukxC4OmfPPNN1qCom9KJpPy8ccftzxhvRkvB3hBnHRXycnvv5au78KtZ+TIcK9cvHjRF/eaYRhy/vx5V+41VUkWpmla/9//9/9p31rDr1TcH14G7EeGe+XmzZsyNTWlveKJaZrW559/7vvElVYVCgXXJkxPHNiuJdnI5ta580MgJoh9BwL23iNgj1a5GXQaGe6Vb7/9Vuu2f8lkUr744gvHczWbcZooqYJbCXl+OIdu9Uv9cN7Wcute9MtY081+to5z6eaz017o5GVyxVZkMhnr008/dW0c7sdEGiDKuBkBlxGwd4+KrHSdezHbVK18XUt3oP5NbgSjdGX0rqVysFAYNOXLL7/0zTlby61golertYM46a6KqokWnfeb6mfk1UK//Otf//LVINxmGIZ89dVXyic3/d6XcHKdhmmCwe2A/dmehNy+fdtXk6RrJZNJuXDhgisT37ruAbdWbfnt3eTGtas7oTaIfQcC9t4jYI9WqFh0sB6/zQGIuJuUKqL32eVGQp5fgrxrubEtmV/eOaoS29fy4zkUca+qh9fnUnXA3k5i1pkAu1VuVmbRVUkRwF/9n+4GAECr/t//+3+OOyo//vijiqa0rFAoKA9EtT+biw0NDflqoN5oNGRoaCiW2LGk7JhXphbEMAxlx2tWLpdT1lFO7FiSbDbrq3O2ln3+Xj6ajl0t9Cs7rhdlIKMsmUyKigDKyHCvtmD9wMCA0mfkiQPb5fjx474djDYaDclms0qflSKvJqOUHhCBcbYnIe3P5mKLtVIsn8/H/BqsFxGp1+uSTqdjR/Y+VX5sle/srXJjT9tTqT2yWCvF/BbgK5fLscVaKVYYNJUd8/z58zy3AIROJpNRHqz36xyAyOvjSJXvCJuuPm4ymVRe+v/I3qeSTqd9N04pFovK5wEymYz2d7xpmsqD9X49hyKv+tmLtVLsxIHtSo8b1HGm3adOp9OxIATrRdw7hyIiFy5cCOR5BMKIgD2AQFIVxNE54al6kHcqtcfXgSgRkWq1Gnv5aFrZd65zMldFlvnVQr+8fDTt6wDKWo1GQ44fPx47ldqj7Jg6gihRoSoh4rPPPtNyfRqGISq3nHj5aDowg3H7WTky3KvkeMVr9ySZTCo5FvyvMGi+FqT3c79gPeVyWen1L6Lmnd0s1X2Ul4+mY7rLxL9NNptV1kcoXrunNTETANyguhqJ35NRbW4lperq46pMPC8MmvLy0bTvkvHWsucBVCVdeLUF1GZUJlUWBk1fJlSuZ2xsLNb+bE5ZO4M0zhwZ7l0dI/m9T72ZsbEx5Uk05y5NBuY8AmFHwB5A4CSTSSVBHDdWcDVDRYUAW2LHkva9Preq0WiIqqC9W6X13mZgYMDxuRsZ7pXjx4/7bhXEVhSLRWWTLddrT5iQd0GlUlHyfGl/NqftGlUV7BoZ7pXFWilw91qj0ZB0Oq0s+EVFi/A7cWC7LNZKsWw26/uJ+7exr/+zPQllx/QyQUzlqi17Ejgoz7BisajsufXJJ5/w3AIQGqrfQ0FKRrWpTkoV8b6Pq/I8nkrt8XWlvTepTMzTucpe5c+2z6Gq43mhXq+LyoCvyrlNN/m1+kEr7CQalc9SVtkD/kDAHkCgGIahbECmM/s1k8koK/McpBXaNpVBex0rtE+ePOn4GOl0OlDn7E3ValVZ0J6yt2rlcjkle0AndiyJrgFtMplUkpAzMtwb+HtNZfDLD+Un4Z6gTdpvRT6fV3b9e7nKXtWqrSBOAouoe26pLjcMADqpeg8FNRnV5kZSnld9XMMwlJ3HIC26WKtYLCoJEv7zn/903pgWqVrhfyq1J5DnUERtwPdMfpxxpibpdFpZ0P7cpUkW0wA+QMAeQGAYhiHb9nUr6QSqLsXWLFUDhJePpgM9UFdRiktHmVunwVCVJch0UhW011UpIYxM07RU3BOnUntEZyKQiuzuMATrbaqCX34oPwk0q1gsKivB6kWpR1UTlkGeBBZRd96YAAYQBqqSzMPUv1WZlOdVH1dVonlix5LWsZZTKq5BXcFB+mmvU7X9HeNMfVQG7U+fPk2/G9CMgD2AQEgmk8qC9YVBU+vgSEU5dZFgB+tt9XpdVAzSvdxryekA72xPQtuqZTdUq1UlEy3sZe+cYRhKVnWODPdqnXwwDMNxUoxI8KtYvIngF6JM1SrzL774wvXrX8WEZVgmgVWcN50r8ABAFRUJtWEK1tuKxWIs13dYybG8mBNQkWge9GC9TcUiBB3BwU8//dTxMc72JELRTxNRW/2SPdD1UfVu0LEgCsDrCNgD8L2BgQFL5b5kukuLHjp0yPExEjuWJOjBepuKgc5HH33k2UCvq6vL0efz+XwoBnZrqQgkMjBwTlVSk+6JQBUrV1RNOviNivcXqx8QVComhvPfV1U0xVW6k6ZUO7L3qaPPq0jgAgCdVCVLqloJ6zdDQ0NKVoe6vf+yivOou4qZSvV6XZwmW/T09ChqzdYkk0lxujXl1UJ/6OZ0Go2G4/6aCHug66aqkieJF4BeBOwB+FYymZR4KmvdevBC2TF1l8JX4cSB7aEZ5NmcDg5SqZSilrydk6x6VasH/OjLL790fE2apskAr0WlUklZ5Q4Vx3HC6cqVEwe2hyahaT0qBuIMwhFE9XpdVOx36/frX3fSlGrlcjl2tdDv6BhUBgEQZCoqhbQ/mwt8db3NqEhG8HuCV9gS8kReJVs4+fyZ/LinZfFVLPTo7+8P1Tm0lctlx4sw2ANdLxVJNCIi3d1qFoIAaA0BewC+Y5qmValUlK6qF/FPoHtlZaXlzxYGTRkbG9P+O6hWLpcdD/SC4IcffgjdubOpyMpub29X1JpoGRgYsFSsGvVD5Q6nW4ZcLfSH8hm5loqgpRdlwQE3qFjR5GVVnmaFIbF0Pf/+978dfd5pdSMA0MlpIDlsW6qtR9UKX1XbD65nYWHBUR8krBUSnG6P19PT41m/7MrUgqPPn0rt0T5edpOKRRjsga6X0yQaEe8rXwB4HQF7AL6QTCalUChY8VTWWnjeoTw7+lRqj2+COE4mm1V0oP3qxIHtjj4fhNVXYZ9ocZp4cefOndBe324xTVNJFRK/lGc8efKko8//61//0v47eMFp0DIIZcGBjTidGHa7Kk+rQfdc32FfPIfd4LR/oGLPYADQQUUAOWzltzeioiKL07HEZur1est9kCN7n4Y20DsxMeHo+vzggw9UNWVTKiosha1CwpsajYaKBAxFrUGrnJ7DoCyIAsKKgD0AzxmGIZlMxioUClalUrHiqay1vLPTcprtupFTqT2+61gv1kqxZjtRYc/mdZpQ4cXqKydJAU4nH4Ki1ZURYb++3WAYhiw873B8HD+VZ3SSrDUy3Bv6pJi1nA7E2YICQeX0eeX2JFS1Wo21P5trej9eFSti/MzpMwsAgshpMNJpUnvQOE2+dbssfrFYjB3Z+1SaecePDPc6Tlzzs0aj0dT38SavEomdVliKSj9GRT+bsvh6qZjbYa4A0OdvuhsAYHPxVDaUL8m7j0XuPl4QcSlIb/NjsN5mt8s0Tevzzz/fdHB5tdAvx48f9+XvoVJh0Gx5wHbw4EHFrVHr/v37upvgiXK5HGvmuVUYNOWbb76JFYt1F1sVTuPj45aKwJNf9kvOZDLW3cetf/7ixYu++D28UiwWm7rX3pTNZqVaZaU9gslJf0Hk1SorNxN86vW6pNPpmGEYcvr0aet67cmm/z6xY0kWXWuNP0xMTMS27Wt9T8xMJmOFOeABIJycBiP9UiXQK/V6XWZm/p+j5Dq33/HlcjlWLpclmUzKxx9/bL2tCkxYS+GvdfPmTd1NeKtUKuWoJL5f5xXdcCq1R97Wd93M6dOnrSh9X37kdKz03nvvMVcAaMIKewChldixFIhOdbVajaXT6djLR9Ox9fYlHhnulf7+ft//Hir89NNPLX/W72WbVlZWdDfBM1spB3wqtUdePpqOZbPZWJRWRatSKBSUBOtfPpr2zbPFaZWMKF5Hub7DLX+WsvgIslKp5Ojz77//vicJsY1GQ4rFYmyxVtpwRd6JA9tDWwp/LadVdDo7OxW1BACCYb25gSiYmJhw9Pnu7taTw5pRr9dlaGgotln1xMSOpUhUkXOaWOLFal4nY2cnY64gcrrNQTweV9UUtMjpWOndd99V1BIAzSJgDyB0rhb65eWj6VjQJj8bjYbk8/nVSd0je59K+7O5WDqdjkVhkCfi/xUETiaL5+bmFLbE36rV6oaTFicObJfFWilWLBYjc12rlslklGwh4rcJJCd7FEelROGbfvjhB0fPTMoVIqic9vEOHTqkqilbVi6XY+l0Otb+bG61n7dYK8X83vdRycmEN5O/AILGyXZqIiKXL1+OzPthLafvRR2BJjs5L7FjSda+44M2J6XL3//+d1eP73T/eqdjrqBxus1BR4fzbfvgjNNnD8n9gD4E7AGEyokD2+X48eOBDwT+r8waK4+b5HRS5G3a2tpa/uz+/fvVNSQAisVirP3ZXOxUao+cSu2R9mdzsagFJtyQTCbl7uNdjo9zKrUnVCs6na4CCCqn74ienp5QbruDaHAykahzG516vb7az9PWCE1mZ2db/iwThwCCxmllkKDPaTgRhD3R11OtVmNRfcc7ScpzO5HSaWWlKM7Lffvtty1/9vfff1fYErTKyXMUgD4E7AGEQq7vsLx8NE0wMAScdCp3796trB2qRXFlWL1el2KxGCsWiySfKLK8s9NxgHVkuNd324U4TbaJ8oSmnyfHADf9/PPPLX/W79vohNWdO3d89e4BADc5SfaOWgnuNzl5x0OP+fn5lj/r9opsJ2OewqCpsCXB4SS5P6rVQfyG5ygQTATsAQSaHagfGhoK/Kp6vLK09Pb9zzfidvDJycowJxM2gIhIpVJRsho6nU77bgDtZAVS1Cc0nTyXnGxDAOj266+/6m4CmkRfHUCUOOlnOenfhcH09LTvxivY3C+//NLyOTt3aVJhS/7KSULAb7/9prAlwdJKskL7sznmZn3C6XPUNE2q8QEaELAHEFhXC/0yPz/P5F/IhHVyglKucCKXy1kqJjJePvLn5JeTChRhfWZsVRRLbgIizvdmBADArxYWFiL9jnNanc3pnuVonp8r6jkZR0c5QfTLL7/c0nOoMGhKYseSLNZKVFb0Eafnor29XU1DADSFgD2AwDqTH5dbD15IPJW1KpWKNTAwQPZfxOnckxZwi2ma1vXaE8fHSexY8m2Ck5OEFgLWAFphGIbuJkTS1UJ/y591un0KAAQFQS9nEokE7wsoEeUE0UajIUf2Pl3370aGe+XI3qeyWCvFstlsLMrfEwCoRMAeQCicuzS5GrwfHR21mIQNLifBN7f3pHW60oFMfzTLMAxZeO58T79TqT2RnmwIu5Hh3pY/S6k7RNXRo0e59jW4f/++7iYAAABgC8rlcuzlo+nYqdQeOduTWA3Sp9PpGInz4dbV1aW7CUAkEbAHEDrFa/dk275uAvdQzulKh+7uboIDaMq2fc6vmZHhXikWiwymQ2xpaanlz1LqDkHWyt6aAAAAALam0WhIsViM5fN5gvQBk+s7rLsJAJpEwB5AaNmBe0rlwy96enp0NwEBUiqVlDy70ul0aAfVTlaWh8ni4mLLn92/f7+6hgAeW1lZ0d0EAADgAvr5wePknPlxsY2TbXwAAGgFAXsAoXfrwQuZmZlhtT2UcDIIPZMf9+VAFP4zMDBgOdnX3fby0bTvg/VOSrI7WVkeJg8fPmz5s/F4XF1DAOAt5ufnW/7s7t271TUEAOBr9PODx8k5c2urokwm0/Jx2cYHAOA1AvYAIuFMfly27eu2nHTWARGR33//3dHnz58/zzWITZmmad168MLxcRI7lqTRaChokbsoyQ4A0fHHH3+0/NlDhw6pawgAAAAAAD5CwB5ApNx9vEtyuRwBU7Ts9u3bjj5fvHaPVfbYkGEYsvC8w/FxTqX2SLVa9f3qegAAAAAAAKjlpLIVAD3+prsBADaX6zusuwnKtbW1iYpSz626Xnsio6Oj1tDQEMEsNK1arcbiqayjpI/x8XHr+PHjXH/4i/HxcetMftzRMUaGe0O9bz0AAAAAAAA29qqy1S7dzQDQBAL2gM9FJahsGIYcPXrU6urqkoMHD4rTgNXbFK/dk0KhYOXz+Uh8v1CrMGg6Sjo5kx/n+sNfFAoFx8F6ESFYH0HlctlxIhEAAAAAAAAAPSiJD8AXGo2GlMvl2NDQUOz48eOxxVopduLAdhkZ7nXtZ16ZWqA8PlpSKpUcH+PK1IKMjo5y/UFERDKZjHVlasHxcV4+miZYDwAAAAAAAAABQsAegG+NjY3F0ul07OWj6djZnoQrP+N67YmYpknQFE1RtTd48do9mZmZsdjTPtqSyaTcfey8TFlix5I0Gg0FLQIAAAAAAAAAeIWAPQDfazQaks/nY4u1UizXd1j58ReedwgBUzTrVGqPkuOcyY/Ltn3d1ujoKIH7iFre2ek4aehUao+yRBIAAAAAAAAAgHcI2AMIlKGhoVj7sznlQanx8XFW2aMpxWJR6XVYvHZPtu3rtiqVikXVh+ioVCqOz/XIcK/y6xEAAAAAAAAA4A0C9gACp16vi+rV9mfy4zIwMECQFE05cWC78mOeuzQpC887JJ7KWpVKxcrlclYymVT+c6BfLpezzl2adHycdDpNsB4AAAAAAAAAAupvuhsAAK0aGhqK5XI563rtiZLj3XrwQslxgiCTybyWnNDV1dXScRYXF+Xhw4erf15YWIjV63UnTQuUsbGxWDyVdS3RYzWYu7PTiqc65WqhX2q1mszNzcmdO3di7Ffuvs7OThER5ed49+7douLZ9fLRNMF6AMCqZDIpiURi9b21f/9+icfjLR1rdnb2tT+Xy2XeOQAAaGKaptXe3r76587OTmlra2v6OCsrKzI3N7f65+XlZbZXAwDABwjYAwi0YrGoNGify+WsMJSWzmQylj1Be/DgQTmTH3/t7+8+fv3f3712z8FP2/Xnf/4vsPymq4V+uX//voiIzM/Pyx9//BGaQWH7s7mYij3It+LP87hLtu3rtuL7Xv2pMGjKysrK6ncbtcQJN12ZWpDXrnFVHjtPEErsWJJqxJM2itfuyejoKNVR5NV3ASD87IB8V1eXtLW1Sf776mt/vyyv9/PuPn4i0nI/+fX330ZJinY/ZG0AgMRCAACaY5qm9fe//10OHTokHR0d8mY1toXnIvLaO37BwU/b9dp/b/SOtytbrn3Hk8AHAIA7CNgDCLxisRgbHR21VAQrVAX+vWSapvXhhx9KKpVaDejefbx2glZ/EOfNhIFXg8O/DgpHhntlaWkpUIGner0uAwPva63Q8Ppk/a51EyfWJk0w2A6+U6k9UiyWOHdCoBpAeBmGIT09PdYHH3yw+q63A/LOki3V+ks/ROS1xEJbru+wdHR0yF0F28EAABBkyWRSuru7rWPHjq0G5heeiyw8eCG3HtwTP8zjiLw51nr1jn9zHseea2BcBgCAMwTsAYTC0NCQstLkfl9lbxiGnD592urp6ZEz+fFXg7qphf+tBA42Fft56zA2NqYsacQt6ydN/HWwnes7vLrVAcF8//r11191NwEA4ALTNK1sNrsaBL/14IXcelB9y6eC4VU/yb99JQAA3DQwMLCahLcsrxaMXK9N6m6WY3+dawAAAK34P90NAABV2p/NKQku+nWV/cDAgDUzM2Nt29dtXa89YVDkM0NDQ7GR4V7dzXCseO2eXK89kbuPX1VAiKeyVqVSsXK5nGWaJqXHfWLheYfEU1lrdHTUSiaTupsDAHAgmUzK6OioFU9lrYXnHX8pcw8AAILJNE2rUqlY8VTWuvXgBe94AACwIQL2AEKjXq+v7q/llF8CYIZhSKFQWB3cEaT3t3Q6HTvbk9DdDOXOXZqU67Unq0FiO4BvGIbupkVe8do9Wd7ZaVUqFc4HAARMMpmUSqViLe/s9HWVHgAA0JxMJrOaiBfUSoIAAMBbBOwBhMrQ0JCSVfYff/yx9pXEuVzO2rav2wpDqfsoyefzsRMHtutuhqvsAP62fd3WzMyMlcvltN8vUXfu0qRs29dtFQoFzgUA+NzaQD2T+AAAhIcdqL/7eJfupgAAgIAhYA8gdFSscNa5ysk0TSueylp+Lc2PtxsbG4u9fDQdihL5b3MmPy7Xa09WV977pTpFVF2ZWpB4KstqewDwqdHRUQL1AACEjGEYUqlUCNQDAICWEbAHEDqXL19WsspeR+CxUChYC887PP+5UK/RaEg6nY4d2ftUd1M8c+7SpCzv7LTiqayVyWRY6a3Rtn3dlmmanAMA8IlkMinxVJbS9wAAhIxpmta2fd0k4wEAAEcI2AMInUajISpWNnd3d3sa7KpUKpS/D6FyuRxbrJViiR1LSq7LoLj7eJcQuNdr4XmHELTH20xOTupuAhB6pmlayzs7eR4DABAyuVyORRcAAEAJAvYAQunmzZuOj3Hs2DEFLXk7wzAknsqSjR1y1Wo1lk6nYy8fTcdOpfbI1UK/7iZ5wg7cUypfD4L2eJtqtaqkKg2A9Q0MDDCRDwBACOVyObYyBAAAyhCwBxBKU1NTjgMQXgXQt+3zdiU/9Go0GlIsFmPHjx+PVPB+eWenlcvluNY1IGiPjbx8NE2wHnCRaZrWrQcvdDcDAAAoRrAeAACoRsAeQCg1Gg3dTdiSSqVCEC3C1gbvF2ul2JG9TyXXd1h3s1xzvfaEa16ThecdYhiG7mbAJ872JOTlo+lYUN6VQBAlk0lhZT0AAOEzMDBAsB4AACj3N90NAAC3FAZNyX9fdXQM0zQtt8oFDwwMeF4GvzBoysrKiszOzoqIyJ07d5QEbJLJpCQSidVA7P79+yUej6/+ffHaPcc/IwrK5XKsXC6v/jmTyVidnZ3yzjvveFbxwW3nLk3KzMyM1d/fT7DQY+Pj49bx48dDtaI613dYhoaGQvU7eSFf090CIPy83rP+aqFf7t+/L4uLi/Lw4UNZXl5WtuVFJpN57Xfp6upa/e+Ojo7Q9FEAAHibZDIpXlfPGRnulaWlJZmfn5c//vhDFhYWYvV63fFxDcOQo0ePrr7jd+/eLYcOHVr9+4MHD8qZ/LjjnwMAALaGgD2A0Prtt98cH6O9vV1BS/7KMAzXB3kjw73y888/y/T09OpgLlsrufKz6vW61Ov1piaF1w4O1wb4Ce7/6c0AvsifyRGdnZ3S1tYWyO/rTH5cvvvuOyudTvs+0Hq2JyFzc3Ou/gw78OF20ONMflwKhYKVz+d9/70DQJCNjo5abr+fc32HZXZ2VsrlckxE5Phxd/p4IrL6M9b8+a2fMU3TsvvRXr3nAABwmxcJeWd7EnL79u3VxLt02p13fKPR+Ms7fivsRL61AX7e8QAAOEfAHkBoPXz4UER2OTpGV1fXliYlm/Xdd9+5srp+ZLhXbt68KWNjYzG3BnWqbDY4jKeylE3fgJ0csdF1uTYRwg7q+3HwfO7SpJRKJSubzfo6eDw3N9fSJEYz1juXAwMD1smTJ5WftytTC5JMJkXFigwAwF8lk0nXkulyfYflhx9+iNXrdRlyKQlTlbWr+9+sHnT3sbP+OQAAOri5b/2p1B6ZmJiINRoN31fD2mh87EXCIgAAYUbAHkBolcvlmB8Dv8lkUnkQbmS4Vy5evOj7ID3ctzYRYqOgvr3qraurS9ra2hxvHdGq/PdVGRgYsMbGxnwdtNdhbGwsNjY2JiLqJ4ZerQppriIGAGBrLly4oDwp81RqjxSLxZjfg/QAAISZG8H6I3ufSrlcjhV9HqQHAADu+z/dDQAAPzt48KDyY164cEFpEkFix5Kk02kle5ghGqrVaqxcLseGhoZi2Ww2tlgrxRZrpVj7s7nYiQPbpTBoetaWWw9eiGEYnv28ICoWi7GXj6Zjub7Dyo6Zy+V8l8wEAEGnOikz13dYFmulWLFYJMkKAACNVI+fThzYLou1Usztam4AACA4CNgDwCbO5MeVHk/lRO7IcK8s1kqxtSVHASfq9bqMjY2tBvFfPpqOnTiwXUaGe139uV999RXB47doNBoyNDQUO7L3qZLjXa89IVECABRTmZSZ2LEkQ0ND9PGAEOvq6tLdBABbpHJ1/ctH0zGqzAEAgDcRsAcAD3300UdKJnJPpfZIOp1mgAdXNRoNGRsbi6XT6dhirRQ7cWC7XC30K/85+e+rkkwmlR83jMrlciyxY0nJsc6fP0+iBAAopCops/3ZHAmZQACorH4EwL9M01Q2bnr5aDrWaDRUHQ4AAIQIAXsA8NCVqQXHxygMmkJpVOgwNjYWO378eKz92VxM9ar7L774guDxFlWr1Vj7sznHz4DitXussgcARQYGBpS8xxI7loRtjoBocGP7NQDqZbNZJcchWA8AADZDwB4APKJqBXE2myVYD63q9bqk02llK71FXq2yx9bV63VR8f2zyh4A1Dh58qTjYxzZ+1RYWQ8Ex8rKiqPPq95+Da9LJpMyOjpq2f+nKrEK0aNirNr+bI5gPQAA2BQBewDwSHd3t+MJAhWragFVqtVqbLFWUrbaPpfLMYnWhGq1Gjvbk3B0DFbZA4AaTsvhjwz3Srlcpp8HBMjc3JzuJmADuVzOWt7ZaRWv3RP7/249eCHxVNYaHR212I4LW6XiWjnbk6B6DgAAeCsC9gDgkWPHjjn6/MhwL4M8+FI6nVYStHd6j0RRPp93HNxhlT0AOKNiMv/ixYsE64GAWV5ednwMAsfqZTIZ63rtyYZ/X7x2T5Z3dlozMzMWCcN4m/fff9/xNaJizAYAAMKPgD0AeMTpyismcuFnKoL2Tu+RqHJaeYNV9gDgjNPJfJIygWBSsYWFiipseN2nn366pX93Jj8u12tPVlfd0x/Geg4dOuTo86dSexS1BAAAhB0BewAIgKuFfiZy4XufffaZ40lL0zSZtGxSvV6XXN9hR8dglT0AtM7pZP7NmzcVtQRA0FBhSi3DMORMfrzpzxWv3ZNt+7oJ2uMvitfuOfr8xMQECy8AAMCWELAHAA84DULWajVVTQFc02g05Mjep46O8d577ylqTbR8/fXXrLJHJLW1teluAiAHDx509PmxsTEm84GAulrod/R5Kkypdfr0aUfj7q+++ookVihztdAvjUZDdzMAAEBAELAHEFp+Wqnb3t7u6PO3b99W1BLAXeVy2VHQIR6Pq2pKpDQaDVbZI7CcPDfy31dVNgVoSSurOW1Og30A9Lp//77jY7CPvTo9PT2OPk+/Aiqx8EK/5eXllj9LYjAAwGsE7AGEltMguYi6SdSuri5Hn1exPyLglbM9iZY/67TkYJT98MMPrLIHEClheGeoCPYB0Gd2dtbxMT766COSJhVotRw+/Kmjo0N3Exwn08zNzalpCFrmZC6NBB4AgNcI2AMILadBchEmUYFW3LhxgwQTDer1uowM9zo6ho5V9nfu3Gn5emHVA4BWOa0Io4qKYB8AfVQ8S65MLahoSuR98sknjvuxTvvSUMcP20UkEglH15STcQ7gJ5lMxioUCtbAwIDlp2qmABA2BOwBhJbT/URFRFZWVhS0BIiWer2uuwmRdfHixcCtsneyryOrHgAAQBhkMhkCIA6pSHy4efOmgpYAr7B/PYLOMAyJp7LW3ce75MrUgtx68EIWnndIPJW1SqWSNTAwwLsLABQiYA8gtFSUw/NDCTOn+1IDiI6grrIHgGaFZc9nVt8BwedkOyjbP//5TwUtia5cLqek/zo2NsYzGQD+Z9u+7g2frfnvq3LrwQuJp7JWpVIheA8AChCwBxBKqko0LSwsKBmwh2GPVaAZJJroE8RV9gDQrPfff98Xk4JOn5esvgOC7/bt246Pce7SZGgSkXS4Xnvi+Bh+KofPteCMqnkcIMrVT5pJhDp3aXI1eM9cAgC0joA9gFD68MMPlRyH0t54G8MwJJfLWTMzM1Y8lbVmZmasKA/qoF8QV9k7aS/3G7gGoumDDz5o+bMqgzJHjx7l+gMirlqtKgkOXrhwgedJC1T1A3788UcVh1l1tdDf8mf9kpSmi9MFGMzjYK3CoNnyZzs7OxW2JFh6enpa+txmq/IBAJsjYA8glFTsXwdsZG2Qftu+but67cnqFgxn8uNy9/EuZWUZgVYEbZX90tJSy5+N8iTKejKZjJXJZKygrcxyEkDdvXu3snYgOPLfV1v+rJNnDgCsx0lAyMYq+9bcfbxLyXHK5bLSVdn3799v+bOHDh1S2JLgee+993Q3ASGysrLS8mffeecdhS0JDsMwHG0zyrsMAFpDwB5A6KjKsKekN96UyWSsSqXylyD9eq7XnjBIgTZBW2U/Ozvb8mdTqZTClgSXaZpWPJW17j7eJXcf75LlnZ1WPJUNTMUPJwHUqE9qR5HT9+v8/Lyahgh70AN4pVQqKTnO8s7OQLy3/aJQKPh27L+4uNjyZ6O+pd6xY8d0NwEh4mSsee7SpLqGBMjp06cdPVsTiQTvMgBoAQF7AKGjKsN+cnJSyXFECP6HwczMjHX38a6mBmxffPEFgxRoE6RV9k4CXmfy455WA/Aj0zSthecd6/7d3ce7JAiBeya10YzubmelNn/55RdlQXane9BH/fkFhIWqsvgiIgMDA75+Z/uFYRjKKuv98MMPypOvHj586OjzUU7+dhIkVVHtAuHiNLkyis/k67Unjj6vumIJAEQFAXsAoaIyIKFy0sUJAhH6FQoFq5VyYPnvq0zEQ5sgrbJ3GvByugIg6DYK1q9lB+6d7gnqFqeT2ogWp5OIftrb9ujRo768JwE071Rqj5Lj3HrwItLB2q0aHx9X8vwcGe515b3gNGD18ccfR/L94DQ4+ttvv6lqCkLC6Vjz5MmTiloSDE7nVa8W+lU1BQAih4A9gFBRtbreaZAL4dLW1tbyZ70sK+4nJJr4w48//ujo816usneyGsZp8C7IRkdHm3rGLDzvkFKp5LvnktOVL35NRIB6Ts81k4gA3FIsFpUlfFMaf3O5XK6lhOr1fPvtt0qOo1pUx1O3Hrxw9Pnp6WlfLLwQoYqOnziZ4zt3aTJS59LpvOrU1JSilgBA9BCwBxAazQYtNnPz5k1VhxIRkZWVFaXHQ3B4GfAE3qSiFJ1XSSc//fSTo8/7veS7G0zTtFqZzM1/X1X6zlTB6cqXDz/8UFFL4Heff/65o8/XajVFLVGjq6tLdxMAKKRyK7RKpeKrd7VfmKZpqUzWdLOyntPrIZfLReoaUFFZQmW1BKcJpVTR8Y+ff/7Z0eejshBDxZh6YmLCN0kzABA0BOwBhEImk2kpaLGRsbExpR3Mubk5R5+nJKJes7Ozjj4flcGdzcn1SnUL9Y7sfero814lnTh97qqqsBIkWymFv5GwrdpStYct/C2ZTDra11ZE5MaNG76aROzoaP0+BuA/X3/9tbJnzLlLk1IoFCI1jngbwzAc9X/e5LSf/DaTk5OOPn+99iRSyd9OK0uoHks6TSjt7OxU1BI45TSIHJWFGE7H1CPDvY7vGwCIMgL2AALPNE1LZaBG5aoI2/LysqPPd3d3M1GjkdNVysVr9yJVrvmjjz5q+XddWlpS2RRIsFbZOy1VHaVV9n4sa++U0/cvyW3hp6JEtBv7FDstswogPBqNhtLx5JWphcitst6IYRiybZ+6cfHVQr+SfvJmVKzej0ryt9O960XUV0p0KpVK6W4C/kdFEDns96KKCmx+3WIEAIKCgD2AQDNN01KZYS+idlWEzelA/dixY6qaghad7Uk4+rzq69TPnKx0dVrNAOsLyir7iYkJR5+Pyir7XC5n5b+v6m6GcvPz844+/8UXX4R6Ei3qVEzkFwZNFU35C6fJZlFK6gOiQPV48nrtSeRX2qsO1ouI/Otf//Kk4orTd08Ukr8Nw3C8d72I+kqJTp3Jj+tuAtY4ldrj6PNhvhdb3WrtTW5uMQIAUUDAHkBgZTIZ5cF6v5ZvOndpMhLlt/zs8uXLjgceYVwR+yanK5zdXuUSVUFZZa9iks1ve7OrpmrfVjeqyTg1NTXl6Pznv6/yrgypZDKpZCL/m2++ceUd4zTZLJvNKmoJAD9oNBpy4sB2pce8MrUQ2T3t3QjWFwZNVyqurEfFu2fheUeo+zgqzq9bSXlO+8wqEg6hhoq91cN4L6raasTtLUYAIAoI2AMIpNHRUaVl8G2fffaZa8FCpwPI06dPM9DTSEV5y/z31dCXtIzKCucgCsoqe6f3WfHavdBOjKmsKjM0NOS75BgVCXNfffVVKM99lBmGoaQUvog75fBFRO7cuUOyCYDXuLHS99ylSYmnslaUnhemaVqqg/UiIl9++aVn/SBV755t+7pDee5VJaK4lZTntAKUioRDqNFoNBxtY2T77rvvQjXeGB8fV/L7sPgCAJwjYA8gUDKZjBVPZZWUanpTru+wq6vrf/vtN0efv157wmSuZirKW16vPQlt0N7pyman2w5gc0FZZa/iPrv14EXoyhWqDNarXvWnkorEKKeVPuAvqiYRnZZB3Qz7ogJYT/uzOVeCF9v2dVthTU5cK5fLKa+oJ/KqH+R1VT1VK0/DFrSvVCrWuUuTjo9ztdDvWlKe0wpQIs6r0EEdFXusn7s0GZrqiZVKxVKxdQOr6wFADQL2AALBNE2rUqm4sqre5sbe9WupKL/FZK5eKlbZi4QzaD8wMOA4kebGjRtkZLssCKvsVa18WHjeEZqgveoJa7/t77nW5OSk42PcfbxLksmk4+NAL8MwZGZmRskkoohIsVh09bpXsUcx1y0QLvV63bVkoVsPXsjMzIwVxudGMpmUmZkZJVsAvWlkuFdLP0jlytOwBO1VBetFRP79738rOc56VCR3UIXOP1TtsZ7/viqFQiHQY02V9yCr6wFADQL2AHzLMAzJ5XJWPJW1Fp53iKqO5HqO7H3qepa9iuMXr90jO1szVYkd12tPQrPXtmmaltNSf26uisCfgrLKXtX2JGEI2pdKJaUT1m6t9lNF1STa8s5OK+jnvllhCtrY+xWrCta7ubreViqVHB9DVel/P+vs7NTdBMBTxWIxpiIRcT1n8uOyvLPTGh0dDUUA1zAMGR0dtZZ3dip7/r/JzS3w3kblCtRt+7oD288xDEPiqayyQOHIcK/rwUIVleDCsiJ7Mx0d6itiuEHVvXhlakHZlg5eMgxDabA+sWNJyXEAAATsAfhMJpOxCoWCNTMzY23b1+1KVv2bCoOmZ9mgKiaM7z7eFfgA1Gb8PtnUaDSUlZMuXrsn8VQ20CtjVK38dXNVBF7n9Dnk1Sp7FdUsRF4F7YNY0cI0TSueylr576vKjnm2JxGIxBhV22MsPO+IVJLb8s7OQL9PbJlMRvl+xW6vrhdRl2wSxInfZsTjcd1NADzndpC4eO2ebNvXbY2OjgbyPWAH6rft63Zl6ztbYseS56Xw1yqXy7GrhX5lx1t43hG4BPCBgQHl7/iLFy+6/o5XUQku/301kGOSZri5yEalcrmsLJHq3KVJiaeygUmaSiaTsm1ft7Jgfa7vsLI+MABAhAcq4LJ4KuuoQx7GfYB2794thw4dEhGRtrY2URmMaMVireTZs9BeMabiWEf2Pg1l2anR0VFHEzVenU+VZXpFXgWo8vl8YM6nYRjy1VdfKQsmunnenFxTYb3PnL6bcn2HZWhoyPXvxWk717pa6Jf+/v6YzonarTAMQ86fP698wvpqoV+OHz8eiGtZ5btS5FVi3pdffun7c5/JZJRs/TMy3CsXL16MBSE5Yy3DMOS7775TNoFoO3Fgu2flj532YWxBeV41y+m97dW7RySYfQcn70wvx0NRlUwmPauicbXQLxMTE77eAkfkVXLi559/7kmQ71RqjyfJW2/j1nXg9zGLW7+3l+8FVeMSL9vsJdM0HSXye30Nu3FN+uU5s5FCoWBdmVpQesyXj6Y97a/S12mOk/FlWJ9VgN9x0wEuUxlsgHpedy5F1O4TFbYOlIoBhFedcNUBJZuXgYVW5XI5pdUv3B6cB3HS3W0qzqEXz09VAcy1/Jwco/reWkvH+84Jle9KW67vsPzwww++DWSrvt6vFvplampKJiYmfH3u3UpSEfE+UUX15G9ix1JoVi2p+G4I2G+OSWz/cxrQasXIcK/cvHlTpqamfPEuyGQy1j/+8Q9Pk/YLg6Zks1nfXONu9vf8NnZJJpNy4cIF5X06m5fPLtX9tPZnc77tkzZLxXej49p1I4At4r/70I0xtYiefip9neYQsAeCh5L4ACJLV0k8lSXb7JLqQS+tlsvlrHgq68pgyS2NRsOVvbpuPXixek79VFbNMIzV86RygsmLPQfxVyoy/73Yy75cLsdUlca3XZla8NU9ZhiGFAoF5ffWWrpLwLbCjfKmxWv3ZHlnpzUzM2PlcrlAlg1uxpn8uFyvPZFt+7qtmZkZq1Ao+Op3Nk3TqlQqrpZA/te//uXp+6Ver4vKvaoXnndIpVLx1XlrVjKZlEqlYqlIZJifn1fRJECbarUa83qv33OXJuXWgxeybV+3FU9lrdHRUWtgYMCT54phGJLJZKzR0VErnspa8VTWuvt4l6fB+pHhXl8F60Ve9cNVvivWuvt4l8RTWa3v/LXjxuWdna4F69ufzXl6XlWPWZd3dlqjo6O+GI+0KpPJWJVKRUkweHl5WUGLmuNWErd9H+remmtgYGD1uava2Z5EaJJKAcBPeLACLmOFvT/pXrFUKpWU7ktsO5Xa4/uVdCKvBvE9PT3WyZMnlZdA9Dpr1s0VEiJ6V8UYhiGnT5+2enp6RGX5/7W8WPUbxFVyXgjKKnsRd9+lI8O98u2333r+ThgYGHDlGfgm3e87J9xYZb+ekeFe+f3332Vubk7u3Lmj7R3qZblk+3e+ffu2p9fHwMCA9cEHH3gSrNFVscat8zgy3Cs//vhjIN5JpmlaH374oahOxPTynRzEvgOrzoJDx0r7zVwt9Mv9+/dFRGR2dnb1f19eXl73HWEYhhw9enT1elu75d3BgwddGzc0a2S4V9LptC+vbbeqta3nbE/C9fd9MpmU7u5uV8eNa+l6zrq1UrkwaMo333wTiBX3pmla2WxWeV9O13vIi3uxMGhKqVTypM9tmqbV29srbiXDiuh9ttLXaQ4r7IHg4aYDXEbA3n/8ELxwe1BwtdAvtVrN84n4jSSTSXn//fddn6TXtUezV0ElkVed5vn5efnll1+UD+gzmYy1f/9+effddz0Jpng10RLESXevBGUve68mNUeGe+Xnn3+W6elpV+6vzs5OSaVSnk1k+30fxbfxMoC9mc2qPMzPzytNqNLZb7QDNisrKzI3Nycira8mM03Tam9vl66uLuno6PBkf+K1dJc/VrWX/UYKg6b89NNPvipx3dnZKe+8846r55qA/eaYxA4WvwXtw8bPwXqbl0H7tXJ9h2VxcVEePnzYdKKinaxhJ2m4+a7biO7+7czMjOVmX74waMp//vMfX4xB7fPd1dXlejKOzveQl89je7z566+/KpmrM03Teu+99+TYsWOe9bd1niv6Os0hYA8EDzcd4DIC9v7ih2C9bWBgwLr14IVnP68waMri4qLjSfiN2OW+9u/fL/F4XMsEvc4OpZdB+/UUBk1ZWVlZ/fP8/Lz88ccfq3+2z8taOiZYbF7uIx7ESXevBGmVva6J7ZHhXllaWlqd2NyKrq4uEdF7j+mezFTFrb0lVVO1mtvtSeAo0JW89yYvxwB2soX97l9YWFCadJRMJiWRSFgiep9vXk60BrHvwCR28BC0d0cQgvU2roHm+KF/63WihT0WsatfqK4GZSdZ2kkYbW1tnm5bYdP9HnK7cuLbrJ3PWZs8K/LXuRydY0yvxv4boa/THAL2QPBw0wEuI2DvH7o7luvRHeQNG93BVc7n1ng9iRbESXcvBWWVvQiTmlsVtus2KH0pFZNAuicLw8Av/T2/VIgIEwL2m2MSO5h0rbIOKz8EdJtF/3Zr/HRuvV58EXa6KyPZ6Idvzg99bPo6zSFgDwTP/+luAAC4Ldd3WBZrJe0dy/UEJfM/KHQHqNLpdKwwaOpsgu8FacVLVJxK7XH0+eK1e2IYhqLWbK5arcYSO5Y8+VlBldixpP1ZqNrLR9OB+H3sSjNO+GUiOqj8MJFoq9frcmTvU93NCI2zPQndTQBc0Wg0ZLFWim22/Qq25sjep4F8j1ar1Vj7s7nAtdtLfgrWi4iMjY3FeC+pUyqVdDdBRF71w52OjcPKT31sAAgzAvYAQi2xY8n3GYFBCUT4nV8GVtlslkHeBgjW+5OKya/z5897tjKMSc2NvXw0HfPLti8qNRoNiVKiBv2C5o0M9/pyIrFcLtMnUOTy5cvcFwi1oaEhkhJbdLXQLy8fTceCnLBYr9fl5aPp2NVCv+6m+I5fEzHy+XxsZLhXdzNCwU/jl2KxGCPh8k8jw72+XQAFAGFEwB5AKJ1K7ZHFWikQgYtGo8HkvEMjw72+GsQXi0Um3N5wKrWHYL2POV3V5eUqe5E/JzWZJHvFz5VkVIlSdQW7X8Ck/dbk+g5LOp327fXPai3nEjuWxK/nF1CpWq3GXj6aZrV9E872JOT48eO+fQc0o9FoyPHjxzn/a7Q/m/N1IgYV9pzz41xYuVwmQVyYwwEAHQjYAwiVXN9hefloOuan4O1W2KUQCT41z6+rtu0JNwbwrybag3ZPRs3XX38dqFX2Iq+em+l0OvKBsCBUklElakH748ePs8LnLY7sfRqI659EvtYldiz5auUd4LZGoyFDQ0MEi97CrqySz+dD9z1RbeFVIsZirRSr1+u6m/JWVNhrXfuzOd8m29gJ4lGdz2EOBwD0IGAPIBROpfbIy0fTsaGhId92+LeC4FNzThzY7stgva3RaEg2m41swMVOoGGi3f8ajUbgVtmv/txiMdb+bC5yq5HtVfVRu7/sZKionO9yuRxbrJXoG7zBDtT4edXdm+xrV3c7gsI+x1F7xgG2er0ui7VSZMcRm0nsWPJ1ZRUVqtVqbLFWiuRq+/Znc4FLxCAxrzn2OMbvCRlRnM+J6hgTAPyCgD3gMlZMu2dkuFcSO5ZksVaKFYvF0AzYoxp8aoa95cHY2FggBhFRDLi0P5sLfAJN1KhYZX/69GlPV9nb6vV6ZFYjFwbN1QQ13W3RxV59fuLAdt1N8UyxWIzce2QjR/Y+DWygxq6oxHnc2Mhwr7Q/m4vpPseLi4vafjawlj2OiEIf522O7H0auUCSXW0hCvNK9vn1exB3I1FOstgqO6E/aOMY+zkc5nNr97+Cdm62ivlVAEFBwB5w2e+//667CaFSGDRXB3LpdDq0g/UoBZ+26mqhX04c2L6aoKG7Pa0oFouxl4+mQz1R78eJltnZ2ZY/e+fOnUBea61oNBriNAAaj8cVtaY1YU6OyfUdlvZnc7FsNhvIQKUbxsbGIrfXrx24T+xYkqiV6LST9YK0qn4jdn8gStfu29jPuHQ67Ys+xK+//tryZ5eXlxW2ZOvO9iS0/Fx4w+7jJHYsRWpRgB1ECsvzvxX1el3S6XRoA/f2+DEs5zdKSRZbFZaKmENDQ6Hrv61NlPRD/8sttVpNdxO0WFhYaPm5Oj8/r7IpALYoFJ0hwM8Mw5Bt+7q1rDgMuquFfrl//77Mzs7KnTt3At2xdyqZTMqFCxesc5cmdTfFU1cL/TI1NSUTExOhPP+5XM7q6emRM/lx3U1xZGS4Vy5evOjrAV48lW36OTwy3OvrLRfcMjo6ahWv3Wvps2d7EuKnEpaZTMb69NNPA32PnUrtCe0zUCXDMOT8+fMtX7sqHNn7VHRMNg8MDFgnT56UMPYRrhb65d///reW79VLuVzOul57orsZnisMmlIqlXy7R/3MzIzVyvtjsVbS8vu0Ou7M9R2WsK6oCzPDMOT06dOhGEu8KexjQKcMw5BPPvnEujK1oLspLRsZ7pVvv/3Wt89/VcJwrlpVGDTlm2++8fUcgRP2Mzio/begnp9W5ypePpqO7PukVCpZ+e+rTX3maqFfjh8/HurnM+BX3HiAB+yOXDwel46OjlBOqG6VHYR/0/z8vPzxxx+ysLAQuA6j18I8MS/yavB+8+ZNmZqaikyHOplMykcffRSogfzVQr9MTExIULYl2OpzeGS4V5aWlmRxcVGCWslBBfuabGtrExGRgwcPbjgZbH9n8/Pzvr0egnaPBXUCxS90vSd1BezXMk3T6u3tFZ2JCyqc7UnIjRs3IncPBO1Z1YqzPQm5fft2YII0uVzOisfjW3oP+qHvYAeH2traNn0OFAZNWVlZkdnZWe3PLTgXhuA9QfrWmKZpZbNZaTYYo4M9zvfreMFtQTpXrbha6JdarRbJ/ltQzq39nNXdV3Eqk8lYXV1d0tbWtul3nus7LCsrK3L58uXIv1fs72yz/qw9X++H/iwQZdx8ABBgpmlaH374oaRSqcBOzuT6Dsv8/HykAvSbsSfcjh075rukjMKgKf/5z3+Y2EWgJZNJ6e7u9tWktj15Mj09HbkJLrcNDAxYH3zwgScTaO3P5nx3/rYyOeMH3AN/ZRiG9PT0eHb9umFkuFd+//13mZubo+8AeCgIz/611fR4Pqhhzw34KemL8eP67PGIH8f8W1UYNOW3336TX3/9NTBJeF7wW/JsFBfEAECQ8UIFgBAxDEOOHj1qdXZ2yttW1njJnpBZWVmRubm5yG9x0Az7nHo96VYYNGVxcZFJdoSePWEWj8c9eWbaz8P5+Xn55ZdfCE56LJPJWJ2dnRKPx5UGQYO0hUYmk7H2798vb1s17CY7WY97oDmmaVp///vf5dChQ76q2rW20sp///tfJu4Bn0kmk/L+++9bup4d9jNidnaWinoeMk3Teu+99+Tdd9/1JPGLJC1n/NA/W8/aiizcv82zxx7vvPOO68/eteNMAvQAEEx0oAAgQkzTtNrb20VExB4MrmejoJU9WHuTHYi3EZB3nx3IF1n/XK43yM/1Hf7LcWZnZ0VEZHl5mQl2YA37ebl79245dOjQa3+33mT3m/fX2uciz0T/SyaTkkgkLBERO+ltrY0mTu3VRWEpG7j2e1jv2heRDctPbvaOYYLXfWv7BSIiXV1d6/67jYJ1G21bJfLn1lUi9BeAsFk7PlzvubHeuHC9MeHi4qI8fPhQRHjm+91mfdw3+zvrvRvWnmsC897YSv9MZOP+qp00sx67rybCveulTCaz4bjjzefueuePPjYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhMD/D6Id2wLJRlhiAAAAAElFTkSuQmCC";

const PDF_CSS=`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
*{box-sizing:border-box}
body{font-family:'Montserrat',Arial,sans-serif;color:#1e293b;font-size:13px;line-height:1.6;background:#fff;margin:0;padding:0}
.page{max-width:740px;margin:0 auto;padding:32px 36px}
.pdf-header{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:3px solid #1d4ed8;margin-bottom:22px}
.pdf-header-left{display:flex;flex-direction:column;gap:2px}
.pdf-club{font-size:10px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:1.5px}
.pdf-title{font-size:21px;font-weight:800;color:#1e293b;line-height:1.1;margin-top:4px}
.pdf-subtitle{font-size:11px;color:#64748b;margin-top:4px}
.pdf-logo{width:60px;height:60px;object-fit:contain;flex-shrink:0}
.section{margin-bottom:16px}
.section-title{font-size:12px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;padding-bottom:3px;border-bottom:1.5px solid #dbeafe}
.section-body{font-size:13px;color:#334155;line-height:1.65}
.section-body p{margin-bottom:3px}
.item{display:flex;gap:8px;align-items:flex-start;margin-bottom:4px}
.item-dot{width:6px;height:6px;border-radius:50%;background:#f97316;flex-shrink:0;margin-top:6px}
.item-text{flex:1;font-size:13px;color:#334155}
.item-text strong,.section-body strong{color:#1e293b;font-weight:700}
table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px}
thead tr{background:#1d4ed8}
thead th{padding:7px 8px;text-align:center;color:#fff;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.5px}
tbody tr:nth-child(even){background:#f8fafc}
td{padding:6px 8px;border-bottom:1px solid #e2e8f0;color:#334155;text-align:center}
td.left{text-align:left;font-weight:600;color:#1e293b}
td.note{text-align:left;font-size:11px;color:#64748b}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:8px 0 16px}
.kpi{background:#f8fafc;border:1px solid #dbeafe;border-radius:7px;padding:10px;text-align:center}
.kpi-val{font-size:22px;font-weight:800;color:#1d4ed8;line-height:1;margin-bottom:2px}
.kpi-lbl{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.pdf-footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between}
.pdf-footer span{font-size:10px;color:#94a3b8}
@media print{body{padding:0}.page{padding:18px 22px}}`;

function pdfOpen(title){return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>${PDF_CSS}</style></head><body><div class="page">`;}
function pdfClose(){return `<div class="pdf-footer"><span>Tololiver · Basketball Coach</span><span>${new Date().toLocaleDateString("es")}</span></div></div></body></html>`;}
function pdfHeader(title,subtitle){return `<div class="pdf-header"><div class="pdf-header-left"><div class="pdf-club">Tololiver · Basketball Coach</div><div class="pdf-title">${title}</div><div class="pdf-subtitle">${subtitle}</div></div><img class="pdf-logo" src="${LOGO_B64}" alt="Logo"/></div>`;}
function mdToHtml(text){
  if(!text)return"";
  const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>");
  let html="";let inSec=false;
  const lines=text.split("\n");
  for(const line of lines){
    const hm=line.match(/^#+\s*(.+)/);
    if(hm){if(inSec){html+="</div></div>";inSec=false;}html+=`<div class="section"><div class="section-title">${fmt(hm[1])}</div><div class="section-body">`;inSec=true;continue;}
    const bm=line.match(/^[-*]\s+(.+)/)||line.match(/^\d+\.\s+(.+)/);
    if(bm){if(!inSec){html+='<div class="section"><div class="section-body">';inSec=true;}html+=`<div class="item"><div class="item-dot"></div><div class="item-text">${fmt(bm[1])}</div></div>`;continue;}
    if(line.trim()){if(!inSec){html+='<div class="section"><div class="section-body">';inSec=true;}html+=`<p>${fmt(line)}</p>`;}
    else{if(inSec){html+="</div></div>";inSec=false;}}
  }
  if(inSec)html+="</div></div>";
  return html;
}

/* ── PDF EXPORT FOR TRAINING ─────────────────────────────── */
function exportSessionPDF(session){
  const w=window.open("","_blank");
  const exsHtml=(session.exs||[]).map((e,i)=>`<div class="item"><div class="item-dot"></div><div class="item-text"><strong>${i+1}.</strong> ${e}</div></div>`).join("");
  w.document.write(pdfOpen(`Sesión: ${session.title}`)
    +pdfHeader(session.title,`${session.date} · ${session.dur} min · ${session.type}`)
    +(session.notes?`<div class="section"><div class="section-title">Notas y objetivos</div><div class="section-body">${mdToHtml(session.notes)}</div></div>`:"")
    +(exsHtml?`<div class="section"><div class="section-title">Contenido de la sesión</div><div class="section-body">${exsHtml}</div></div>`:"")
    +pdfClose()
  );
  w.document.close();setTimeout(()=>w.print(),400);
}

/* ══════════════════════════════════════════════════════════
   1. DASHBOARD
══════════════════════════════════════════════════════════ */
function Dashboard(){
  const{th}=useTheme();const{players,matches,sessions,attDates}=useData();
  const active=players.filter(p=>p.active);
  const wins=matches.filter(m=>m.pts_us!=null&&m.pts_us>m.pts_them).length;
  const losses=matches.filter(m=>m.pts_us!=null&&m.pts_us<=m.pts_them).length;
  const avgPts=active.length?(active.reduce((a,p)=>a+calcStats(p).pts_p,0)/active.length).toFixed(1):"—";
  const avgMin=active.length?(active.reduce((a,p)=>a+calcStats(p).min_p,0)/active.length).toFixed(1):"—";

  // Attendance summary
  const datesWithData=Object.keys(attDates).filter(d=>ALL_TRAINING_DATES.includes(d));
  const avgAtt=datesWithData.length>0&&active.length>0
    ? Math.round(datesWithData.reduce((a,d)=>a+(attDates[d]||[]).filter(id=>active.some(p=>p.id===id)).length,0)/(datesWithData.length*active.length)*100)
    : 0;

  const kpis=[
    {label:"Record",    value:`${wins}–${losses}`,sub:"victorias–derrotas",color:"#f97316",icon:Trophy},
    {label:"PTS/P",     value:avgPts,             sub:"media equipo",      color:"#3b82f6",icon:Activity},
    {label:"Min/P",     value:avgMin+"'",          sub:"media equipo",      color:"#8b5cf6",icon:Target},
    {label:"Asistencia",value:`${avgAtt}%`,        sub:"media entrenos",    color:"#10b981",icon:Check},
  ];
  const chartData=matches.map(m=>({
    name:m.rival.split(" ")[0].slice(0,8),
    Nosotros:m.pts_us,
    Rival:m.pts_them,
  }));
  const allPts=matches.flatMap(m=>[m.pts_us,m.pts_them]);
  const minPts=allPts.length?Math.max(0,Math.min(...allPts)-10):0;
  const maxPts=allPts.length?Math.max(...allPts)+10:100;
  const top5=[...active].map(p=>({...p,...calcStats(p)})).sort((a,b)=>b.pts_p-a.pts_p).slice(0,5);
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};

  // Player attendance rates for summary
  const topAttendees=[...active].map(p=>({
    ...p,
    rate:datesWithData.length?Math.round(datesWithData.filter(d=>(attDates[d]||[]).includes(p.id)).length/datesWithData.length*100):0
  })).sort((a,b)=>b.rate-a.rate).slice(0,5);

  return <div>
    <SH title="Panel Principal" sub="CB Binissalem Sénior A · Temporada 2025/26"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
      {kpis.map(k=><div key={k.label} className="card" style={{padding:"20px 22px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</p>
            <p style={{fontFamily:"DM Mono",fontSize:34,fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</p>
            <p style={{fontSize:11,color:th.muted,marginTop:5}}>{k.sub}</p>
          </div>
          <k.icon size={17} color={k.color} style={{opacity:.5}}/>
        </div>
      </div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:18}}>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Resultados de Partidos</p>
        {matches.length>0?<ResponsiveContainer width="100%" height={185}>
          <BarChart data={chartData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false} domain={[minPts,maxPts]}/>
            <Tooltip contentStyle={tt}/>
            <Bar dataKey="Nosotros" fill="#f97316" radius={[4,4,0,0]}/>
            <Bar dataKey="Rival"    fill={th.border2} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>:<div style={{height:185,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:th.muted,fontSize:13}}>Sin partidos registrados aún</p></div>}
      </div>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Asistencia Top 5</p>
        {datesWithData.length===0?<p style={{color:th.muted,fontSize:12}}>Sin datos de asistencia aún</p>:
        topAttendees.map((p,i)=><div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:24,height:24,borderRadius:12,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{p.num}</div>
          <div style={{flex:1}}>
            <p style={{fontSize:11,color:th.text,marginBottom:3}}>{p.name.split(" ")[0]}</p>
            <div style={{height:4,background:th.border2,borderRadius:2,overflow:"hidden"}}><div style={{width:`${p.rate}%`,height:"100%",background:p.rate>=80?"#10b981":p.rate>=60?"#f59e0b":"#ef4444",borderRadius:2}}/></div>
          </div>
          <span style={{fontFamily:"DM Mono",fontSize:11,color:th.sub,minWidth:32,textAlign:"right"}}>{p.rate}%</span>
        </div>)}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Top Anotadores</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {top5.map((p,i)=><div key={p.id} style={{background:th.card2,borderRadius:12,padding:"16px 10px",textAlign:"center",border:`1px solid ${th.border}`}}>
          <div style={{width:40,height:40,borderRadius:20,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:i===0?"#fff":th.sub}}>{p.num}</div>
          <p style={{fontSize:11,color:th.text,fontWeight:600,marginBottom:6}}>{p.name.split(" ")[0]}</p>
          <p style={{fontFamily:"DM Mono",fontSize:22,color:"#f97316",fontWeight:700,lineHeight:1}}>{p.pts_p}</p>
          <p style={{fontSize:10,color:th.muted,marginTop:3}}>pts/jgo</p>
        </div>)}
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   2. PLANTILLA — con edición de estadísticas
══════════════════════════════════════════════════════════ */
/* ── PLAYER EDIT COMPONENTS — defined outside Plantilla to avoid focus loss ── */
function StatInput({label,field,state,setState}){
  return <div>
    <Lbl>{label}</Lbl>
    <input type="number" min="0" value={state[field]??0}
      onChange={e=>{const v=e.target.value;setState(f=>({...f,[field]:v}));}}
      style={{textAlign:"right"}}/>
  </div>;
}

const PLAYER_POS=["Base","Escolta","Alero","Ala-Pívot","Pívot"];

function PlayerEditPanel({state,setState}){
  const{th}=useTheme();
  return <>
    <div style={{display:"grid",gridTemplateColumns:"1fr 90px 150px",gap:12,marginBottom:12}}>
      <div><Lbl>Nombre completo</Lbl>
        <input value={state.name||""} onChange={e=>{const v=e.target.value;setState(f=>({...f,name:v}));}} placeholder="Nombre del jugador"/>
      </div>
      <div><Lbl>Dorsal</Lbl>
        <input type="number" value={state.num||""} onChange={e=>{const v=e.target.value;setState(f=>({...f,num:v}));}}/>
      </div>
      <div><Lbl>Posición</Lbl>
        <select value={state.pos||"Base"} onChange={e=>setState(f=>({...f,pos:e.target.value}))}>
          {PLAYER_POS.map(p=><option key={p}>{p}</option>)}
        </select>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
      <div>
        <Lbl>Estado</Lbl>
        <div style={{display:"flex",gap:6}}>
          {[["activo","#10b981"],["lesionado","#f59e0b"],["baja","#ef4444"]].map(([v,c])=>{
            const active=(v==="activo"&&state.active&&!state.lesionado)||(v==="lesionado"&&state.lesionado)||(v==="baja"&&!state.active&&!state.lesionado);
            return <button key={v} type="button"
              onClick={()=>setState(f=>({...f,active:v==="activo",lesionado:v==="lesionado"}))}
              style={{flex:1,padding:"6px 4px",borderRadius:6,border:`1px solid ${active?c:th.border2}`,background:active?c+"18":"transparent",cursor:"pointer",fontSize:10,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,color:active?c:th.muted,textTransform:"uppercase"}}>
              {v}
            </button>;
          })}
        </div>
      </div>
      <div>
        <Lbl>Equipo</Lbl>
        <div style={{display:"flex",gap:6}}>
          {[["A","#f97316"],["B","#3b82f6"],["Convocado","#8b5cf6"]].map(([v,c])=>(
            <button key={v} type="button"
              onClick={()=>setState(f=>({...f,equipo:v}))}
              style={{flex:1,padding:"6px 4px",borderRadius:6,border:`1px solid ${state.equipo===v?c:th.border2}`,background:state.equipo===v?c+"18":"transparent",cursor:"pointer",fontSize:10,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,color:state.equipo===v?c:th.muted,textTransform:"uppercase"}}>
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div style={{background:th.card2,borderRadius:10,padding:14,marginBottom:4}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Datos acumulados de temporada</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <StatInput label="PJ (Partidos Jugados)" field="pj" state={state} setState={setState}/>
        <StatInput label="PT (Puntos Totales)" field="pt" state={state} setState={setState}/>
        <StatInput label="Min (Minutos Totales)" field="min" state={state} setState={setState}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
        <div style={{background:th.card,borderRadius:8,padding:10,border:`1px solid ${th.border}`}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Tiros Libres (TL)</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <StatInput label="Intentados" field="tl_i" state={state} setState={setState}/>
            <StatInput label="Metidos" field="tl_m" state={state} setState={setState}/>
          </div>
        </div>
        <div style={{background:th.card,borderRadius:8,padding:10,border:`1px solid ${th.border}`}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Tiros de 2 (T2)</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <StatInput label="Intentados" field="t2_i" state={state} setState={setState}/>
            <StatInput label="Metidos" field="t2_m" state={state} setState={setState}/>
          </div>
        </div>
        <div style={{background:th.card,borderRadius:8,padding:10,border:`1px solid ${th.border}`}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:"#8b5cf6",fontWeight:700,textTransform:"uppercase",marginBottom:8}}>Tiros de 3 (T3)</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <StatInput label="Intentados" field="t3_i" state={state} setState={setState}/>
            <StatInput label="Metidos" field="t3_m" state={state} setState={setState}/>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
        <StatInput label="FC (Faltas Cometidas)" field="fc" state={state} setState={setState}/>
        <div style={{padding:"8px 12px",background:th.card,borderRadius:8,border:`1px solid ${th.border}`}}>
          <p style={{fontSize:10,color:th.muted,fontFamily:"Barlow Condensed",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Preview calculado</p>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            {[
              ["Min/P",(state.pj?+(state.min/state.pj).toFixed(1):0)+"'"],
              ["PTS/P",(state.pj?+(state.pt/state.pj).toFixed(1):0)],
              ["TL%",(state.tl_i?+((state.tl_m/state.tl_i)*100).toFixed(1):0)+"%"],
              ["T2%",(state.t2_i?+((state.t2_m/state.t2_i)*100).toFixed(1):0)+"%"],
              ["T3%",(state.t3_i?+((state.t3_m/state.t3_i)*100).toFixed(1):0)+"%"],
              ["FC/P",(state.pj?+(state.fc/state.pj).toFixed(1):0)],
            ].map(([l,v])=><div key={l}>
              <p style={{fontSize:9,color:th.muted,fontFamily:"Barlow Condensed",textTransform:"uppercase"}}>{l}</p>
              <p style={{fontFamily:"DM Mono",fontSize:14,color:"#f97316",fontWeight:700}}>{v}</p>
            </div>)}
          </div>
        </div>
      </div>
    </div>
  </>;
}

function Plantilla(){
  const{th}=useTheme();const{players,setPlayers}=useData();
  const[ed,setEd]=useState(null);const[ef,setEf]=useState({});
  const[sa,setSa]=useState(false);const[xlsxMsg,setXlsxMsg]=useState(null);
  const[af,setAf]=useState({name:"",num:"",pos:"Base",active:true,lesionado:false,equipo:"A",...emptyStats()});
  const rawFields=["pj","pt","min","tl_i","tl_m","t2_i","t2_m","t3_i","t3_m","fc"];
  const xlsxRef=useRef();

  const se=p=>{setEd(p.id);setEf({name:p.name,num:p.num,pos:p.pos,active:p.active??true,lesionado:p.lesionado??false,equipo:p.equipo||"A",...Object.fromEntries(rawFields.map(k=>[k,p[k]??0]))});};
  const sv=()=>{setPlayers(prev=>prev.map(p=>p.id===ed?{...p,...ef,num:+ef.num,...Object.fromEntries(rawFields.map(k=>[k,+ef[k]]))}:p));setEd(null);};
  const dl=id=>setPlayers(prev=>prev.filter(p=>p.id!==id));
  const add=()=>{if(!af.name||!af.num)return;const id=Math.max(0,...players.map(p=>p.id))+1;setPlayers(prev=>[...prev,{id,...af,num:+af.num,...Object.fromEntries(rawFields.map(k=>[k,+af[k]]))}]);setAf({name:"",num:"",pos:"Base",active:true,lesionado:false,equipo:"A",...emptyStats()});setSa(false);};

  // Excel import — columnas esperadas: Nombre, Dorsal, Posicion, PJ, PT, Min, TL_i, TL_m, T2_i, T2_m, T3_i, T3_m, FC
  const handleXLSX=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const wb=XLSX.read(ev.target.result,{type:"array"});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const rows=XLSX.utils.sheet_to_json(ws,{defval:0});
        let updated=0,added=0;
        const colMap={Nombre:"name",Dorsal:"num",Posicion:"pos",PJ:"pj",PT:"pt",Min:"min",TL_i:"tl_i",TL_m:"tl_m",T2_i:"t2_i",T2_m:"t2_m",T3_i:"t3_i",T3_m:"t3_m",FC:"fc"};
        setPlayers(prev=>{
          let next=[...prev];
          rows.forEach(row=>{
            const name=(row.Nombre||row.nombre||"").trim();if(!name)return;
            const patch=Object.fromEntries(Object.entries(colMap).map(([exk,stk])=>[stk,row[exk]??row[exk.toLowerCase()]??0]));
            patch.name=name;patch.num=+(row.Dorsal||row.dorsal||0);patch.pos=row.Posicion||row.posicion||"Base";
            const idx=next.findIndex(p=>p.name.toLowerCase()===name.toLowerCase()||p.num===patch.num);
            if(idx>=0){next[idx]={...next[idx],...patch,num:+patch.num,...Object.fromEntries(rawFields.map(k=>[k,+patch[k]]))};updated++;}
            else{next.push({id:Date.now()+Math.random(),...patch,active:true,...Object.fromEntries(rawFields.map(k=>[k,+patch[k]]))});added++;}
          });
          return next;
        });
        setXlsxMsg(`✅ ${updated} jugadores actualizados, ${added} nuevos añadidos`);
      }catch(err){setXlsxMsg(`❌ Error leyendo Excel: ${err.message}`);}
      e.target.value="";
      setTimeout(()=>setXlsxMsg(null),5000);
    };
    reader.readAsArrayBuffer(file);
  };

  return <div>
    <SH title="Plantilla" sub="Gestión de jugadores y estadísticas" right={<div style={{display:"flex",gap:8}}>
      <input ref={xlsxRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleXLSX}/>
      <Btn onClick={()=>xlsxRef.current?.click()} variant="ghost" icon={<Upload size={14}/>} sm>Excel</Btn>
      <Btn onClick={()=>{setSa(!sa);setEd(null);}} icon={<Plus size={14}/>}>Añadir Jugador</Btn>
    </div>}/>
    {xlsxMsg&&<div style={{background:xlsxMsg.startsWith("✅")?"rgba(16,185,129,.07)":"rgba(239,68,68,.07)",border:`1px solid ${xlsxMsg.startsWith("✅")?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.text}}>{xlsxMsg}</div>}
    <div style={{background:"rgba(249,115,22,.06)",border:"1px solid rgba(249,115,22,.2)",borderRadius:8,padding:"8px 14px",marginBottom:14,fontSize:12,color:th.sub}}>
      💡 <strong style={{color:"#f97316"}}>Excel:</strong> columnas esperadas: <code style={{fontFamily:"DM Mono",fontSize:11}}>Nombre · Dorsal · Posicion · PJ · PT · Min · TL_i · TL_m · T2_i · T2_m · T3_i · T3_m · FC</code>
    </div>

    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Jugador</p>
      <PlayerEditPanel state={af} setState={setAf}/>
      <div style={{display:"flex",gap:8,marginTop:12}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    {ed&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640",borderWidth:2}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Editando: {ef.name} · #{ef.num}</p>
      <PlayerEditPanel state={ef} setState={setEf}/>
      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:12}}>
        <Btn onClick={sv}>Guardar cambios</Btn>
        <Btn onClick={()=>setEd(null)} variant="ghost">Cancelar</Btn>
      </div>
    </div>}

    <div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
        <thead><tr style={{background:th.tableHead}}>
          {["#","Jugador","Pos","PJ","Min/P","PTS/P","TL%","T2%","T3%","FC/P","Estado",""].map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:i>2?"right":"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {players.map(p=>{const c=calcStats(p);
          const estadoColor=p.lesionado?"#f59e0b":p.active?"#10b981":"#ef4444";
          const estadoLabel=p.lesionado?"Lesión":p.active?"Activo":"Baja";
          const equipoColor={A:"#f97316",B:"#3b82f6",Convocado:"#8b5cf6"}[p.equipo||"A"]||"#f97316";
          return <tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`,background:ed===p.id?"rgba(249,115,22,.05)":p.lesionado?"rgba(245,158,11,.03)":"transparent"}}>
            <td style={{padding:"10px 12px"}}><div style={{width:30,height:30,borderRadius:15,background:p.lesionado?"#f59e0b":p.active?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#fff"}}>{p.num}</div></td>
            <td style={{padding:"10px 12px",fontSize:13,color:p.active&&!p.lesionado?th.text:th.muted,whiteSpace:"nowrap"}}>{p.name}</td>
            <td style={{padding:"10px 12px"}}><Badge color={POC[p.pos]||"#64748b"} sm>{p.pos}</Badge></td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:th.sub}}>{p.pj??0}</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{c.min_p}'</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:13,color:"#f97316",fontWeight:700}}>{c.pts_p}</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:"#f59e0b"}}>{c.tl_pct}%</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:"#3b82f6"}}>{c.t2_pct}%</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:"#8b5cf6"}}>{c.t3_pct}%</td>
            <td style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{c.fc_p}</td>
            <td style={{padding:"10px 10px"}}>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                <Badge color={estadoColor} sm>{estadoLabel}</Badge>
                <Badge color={equipoColor} sm>{p.equipo||"A"}</Badge>
              </div>
            </td>
            <td style={{padding:"10px 12px"}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={()=>ed===p.id?setEd(null):se(p)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:`1px solid ${ed===p.id?"#f97316":th.border2}`,background:ed===p.id?"rgba(249,115,22,.1)":th.card2,cursor:"pointer",color:ed===p.id?"#f97316":th.sub,fontSize:11,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                  <Edit2 size={11}/>{ed===p.id?"Cerrar":"Editar"}
                </button>
                <Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>dl(p.id)}/>
              </div>
            </td>
          </tr>;})}
        </tbody>
      </table>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   3. PARTIDOS
══════════════════════════════════════════════════════════ */
function Partidos(){
  const{th}=useTheme();
  const{matches,setMatches,players}=useData();
  const[sa,setSa]=useState(false);
  const[ed,setEd]=useState(null);const[ef,setEf]=useState({});
  const[exp,setExp]=useState(null); // expanded match id
  const[tab,setTab]=useState({}); // {matchId: "convocatoria"|"valoracion"}
  const[f,setF]=useState({date:"",time:"",rival:"",location:"Casa",pts_us:"",pts_them:"",notes:""});

  const availablePlayers=players.filter(p=>p.active&&!p.lesionado);
  const played=matches.filter(m=>m.pts_us!=null);
  const w=played.filter(m=>m.pts_us>m.pts_them).length;
  const l=played.filter(m=>m.pts_us<=m.pts_them).length;
  const af=played.length?(played.reduce((a,m)=>a+(m.pts_us||0),0)/played.length).toFixed(1):"—";
  const aa=played.length?(played.reduce((a,m)=>a+(m.pts_them||0),0)/played.length).toFixed(1):"—";

  const add=()=>{
    if(!f.date||!f.rival)return;
    const id=matches.length?Math.max(...matches.map(m=>m.id))+1:1;
    setMatches(prev=>[...prev,{id,...f,
      pts_us:f.pts_us!==""?+f.pts_us:null,
      pts_them:f.pts_them!==""?+f.pts_them:null,
      convocados:[],valoraciones:{},
    }]);
    setF({date:"",time:"",rival:"",location:"Casa",pts_us:"",pts_them:"",notes:""});setSa(false);
  };
  const startEdit=m=>{setEd(m.id);setEf({date:m.date,time:m.time||"",rival:m.rival,location:m.location,pts_us:m.pts_us??"",pts_them:m.pts_them??"",notes:m.notes||""});};
  const saveEdit=()=>{
    setMatches(prev=>prev.map(m=>m.id===ed?{...m,...ef,pts_us:ef.pts_us!==""?+ef.pts_us:null,pts_them:ef.pts_them!==""?+ef.pts_them:null}:m));
    setEd(null);
  };
  const toggleConv=(mid,pid)=>setMatches(prev=>prev.map(m=>{
    if(m.id!==mid)return m;
    const c=m.convocados||[];
    return{...m,convocados:c.includes(pid)?c.filter(x=>x!==pid):[...c,pid]};
  }));
  const setValoracion=(mid,pid,field,val)=>setMatches(prev=>prev.map(m=>{
    if(m.id!==mid)return m;
    const v={...(m.valoraciones||{})};
    v[pid]={...(v[pid]||{}),[field]:val};
    return{...m,valoraciones:v};
  }));
  const exportConvPDF=m=>{
    const conv=(m.convocados||[]).map(id=>players.find(p=>p.id===id)).filter(Boolean);
    const w=window.open("","_blank");
    const rows=conv.map((p,i)=>`<tr><td>${i+1}</td><td class="left">#${p.num} ${p.name}</td><td>${p.pos}</td><td>${p.equipo||"A"}</td></tr>`).join("");
    w.document.write(pdfOpen(`Convocatoria vs ${m.rival}`)
      +pdfHeader(`Convocatoria vs ${m.rival}`,`${m.date} · ${m.location} · ${conv.length} jugadores`)
      +`<div class="section"><div class="section-title">Jugadores convocados</div>
        <table><thead><tr><th>#</th><th style="text-align:left">Jugador</th><th>Posición</th><th>Equipo</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`
      +pdfClose()
    );
    w.document.close();setTimeout(()=>w.print(),400);
  };

  const ks=[{label:"Record",value:`${w}–${l}`,color:"#f97316"},{label:"Pts a favor",value:af,color:"#10b981"},{label:"Pts en contra",value:aa,color:"#ef4444"},{label:"Jugados/Total",value:`${played.length}/${matches.length}`,color:"#3b82f6"}];

  return <div>
    <SH title="Partidos" sub="Resultados · Convocatorias · Valoraciones" right={<Btn onClick={()=>{setSa(!sa);setEd(null);}} icon={<Plus size={14}/>}>Añadir Partido</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
      {ks.map(k=><div key={k.label} className="card" style={{padding:"18px 20px"}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</p>
        <p style={{fontFamily:"DM Mono",fontSize:32,color:k.color,fontWeight:700,lineHeight:1}}>{k.value}</p>
      </div>)}
    </div>

    {/* Formulario nuevo partido */}
    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Partido</p>
      <div style={{display:"grid",gridTemplateColumns:"130px 100px 1fr 120px 80px 80px",gap:12,marginBottom:12}}>
        <div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))}/></div>
        <div><Lbl>Hora</Lbl><input type="time" value={f.time||""} onChange={e=>setF(x=>({...x,time:e.target.value}))}/></div>
        <div><Lbl>Rival</Lbl><input value={f.rival} onChange={e=>setF(x=>({...x,rival:e.target.value}))} placeholder="Nombre del rival"/></div>
        <div><Lbl>Lugar</Lbl><select value={f.location} onChange={e=>setF(x=>({...x,location:e.target.value}))}><option>Casa</option><option>Fuera</option></select></div>
        <div><Lbl>Nos.</Lbl><input type="number" value={f.pts_us} onChange={e=>setF(x=>({...x,pts_us:e.target.value}))} placeholder="—"/></div>
        <div><Lbl>Riv.</Lbl><input type="number" value={f.pts_them} onChange={e=>setF(x=>({...x,pts_them:e.target.value}))} placeholder="—"/></div>
      </div>
      <div style={{marginBottom:14}}><Lbl>Notas</Lbl><textarea rows={2} value={f.notes} onChange={e=>setF(x=>({...x,notes:e.target.value}))} placeholder="Notas previas o post-partido…"/></div>
      <p style={{fontSize:11,color:th.muted,marginBottom:10}}>💡 Resultado opcional — puedes añadirlo después</p>
      <div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {matches.length===0&&<div className="card" style={{padding:48,textAlign:"center"}}>
        <Trophy size={36} color={th.muted} style={{margin:"0 auto 14px",display:"block"}}/>
        <p style={{color:th.muted,fontSize:14}}>No hay partidos registrados</p>
      </div>}

      {[...matches].sort((a,b)=>b.date?.localeCompare(a.date)).map(m=>{
        const hasResult=m.pts_us!=null&&m.pts_them!=null;
        const win=hasResult&&m.pts_us>m.pts_them;
        const c=hasResult?(win?"#10b981":"#ef4444"):"#6366f1";
        const d=hasResult?m.pts_us-m.pts_them:null;
        const isEditing=ed===m.id;
        const isExp=exp===m.id;
        const convocados=m.convocados||[];
        const valoraciones=m.valoraciones||{};
        const curTab=tab[m.id]||"convocatoria";
        const convPlayers=convocados.map(id=>players.find(p=>p.id===id)).filter(Boolean);

        if(isEditing)return(
          <div key={m.id} className="card" style={{padding:20,borderColor:"#f9731640"}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Editar: {m.rival}</p>
            <div style={{display:"grid",gridTemplateColumns:"130px 100px 1fr 120px 80px 80px",gap:12,marginBottom:12}}>
              <div><Lbl>Fecha</Lbl><input type="date" value={ef.date} onChange={e=>setEf(x=>({...x,date:e.target.value}))}/></div>
              <div><Lbl>Hora</Lbl><input type="time" value={ef.time||""} onChange={e=>setEf(x=>({...x,time:e.target.value}))}/></div>
              <div><Lbl>Rival</Lbl><input value={ef.rival} onChange={e=>setEf(x=>({...x,rival:e.target.value}))}/></div>
              <div><Lbl>Lugar</Lbl><select value={ef.location} onChange={e=>setEf(x=>({...x,location:e.target.value}))}><option>Casa</option><option>Fuera</option></select></div>
              <div><Lbl>Nos.</Lbl><input type="number" value={ef.pts_us} onChange={e=>setEf(x=>({...x,pts_us:e.target.value}))} placeholder="—"/></div>
              <div><Lbl>Riv.</Lbl><input type="number" value={ef.pts_them} onChange={e=>setEf(x=>({...x,pts_them:e.target.value}))} placeholder="—"/></div>
            </div>
            <div style={{marginBottom:14}}><Lbl>Notas</Lbl><textarea rows={2} value={ef.notes} onChange={e=>setEf(x=>({...x,notes:e.target.value}))} placeholder="Análisis, aspectos a mejorar…"/></div>
            <div style={{display:"flex",gap:8}}><Btn onClick={saveEdit}>Guardar</Btn><Btn onClick={()=>setEd(null)} variant="ghost">Cancelar</Btn></div>
          </div>
        );

        return <div key={m.id} className="card" style={{borderLeft:`4px solid ${c}`,overflow:"hidden"}}>
          {/* Cabecera partido */}
          <div style={{padding:"16px 20px",display:"flex",alignItems:"center",gap:16}}>
            <div style={{minWidth:58,textAlign:"center",flexShrink:0}}>
              <p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted,marginBottom:4}}>{m.date}</p>
              <Badge color={c} sm>{hasResult?(win?"VICTORIA":"DERROTA"):"PLANIF."}</Badge>
            </div>
            <div style={{flex:1}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,lineHeight:1,marginBottom:3}}>{m.rival}</p>
              <p style={{fontSize:11,color:th.muted}}>{m.location}{m.time?` · ${m.time}h`:""}
                {hasResult?` · ${d>0?"+":""}${d} pts`:" · Sin resultado"}
                {convocados.length>0&&<span style={{color:th.sub}}> · {convocados.length} convocados</span>}
              </p>
            </div>
            <p style={{fontFamily:"DM Mono",fontSize:28,fontWeight:700,color:c,lineHeight:1,flexShrink:0}}>
              {hasResult?<>{m.pts_us}<span style={{color:th.muted,fontSize:16}}>–</span>{m.pts_them}</>:<span style={{fontSize:16,color:th.muted}}>vs</span>}
            </p>
            {/* Botones de acción */}
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              {/* Convocatoria */}
              <button onClick={()=>setExp(isExp&&curTab==="convocatoria"?null:m.id)&&setTab(t=>({...t,[m.id]:"convocatoria"}))||setExp(m.id)&&setTab(t=>({...t,[m.id]:"convocatoria"}))||(()=>{setExp(isExp&&curTab==="convocatoria"?null:m.id);setTab(t=>({...t,[m.id]:"convocatoria"}));})()}
                style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${isExp&&curTab==="convocatoria"?"#6366f1":th.border2}`,background:isExp&&curTab==="convocatoria"?"rgba(99,102,241,.1)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:12,fontWeight:700,color:isExp&&curTab==="convocatoria"?"#6366f1":th.sub,display:"flex",alignItems:"center",gap:4}}>
                <Users size={11}/>Conv.{convocados.length>0?` (${convocados.length})`:""}
              </button>
              {/* Valoración */}
              <button onClick={()=>{setExp(isExp&&curTab==="valoracion"?null:m.id);setTab(t=>({...t,[m.id]:"valoracion"}));}}
                style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${isExp&&curTab==="valoracion"?"#f59e0b":th.border2}`,background:isExp&&curTab==="valoracion"?"rgba(245,158,11,.1)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:12,fontWeight:700,color:isExp&&curTab==="valoracion"?"#f59e0b":th.sub,display:"flex",alignItems:"center",gap:4}}>
                <Star size={11}/>Val.
              </button>
              <button onClick={()=>startEdit(m)}
                style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}>
                <Edit2 size={13}/>
              </button>
              <Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>setMatches(prev=>prev.filter(x=>x.id!==m.id))}/>
            </div>
          </div>

          {/* Notas del partido */}
          {m.notes&&!isExp&&<div style={{padding:"0 20px 14px",fontSize:12,color:th.sub,lineHeight:1.6,borderTop:`1px solid ${th.border}`}}>
            <span style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:c,textTransform:"uppercase",marginRight:8}}>Notas</span>{m.notes}
          </div>}

          {/* Panel expandido — Convocatoria o Valoración */}
          {isExp&&<div style={{borderTop:`1px solid ${th.border}`,padding:"16px 20px"}}>
            {/* Sub-tabs */}
            <div style={{display:"flex",gap:6,marginBottom:14}}>
              <button onClick={()=>setTab(t=>({...t,[m.id]:"convocatoria"}))}
                style={{padding:"5px 14px",borderRadius:7,border:`1px solid ${curTab==="convocatoria"?"#6366f1":th.border2}`,background:curTab==="convocatoria"?"rgba(99,102,241,.1)":"transparent",cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:13,fontWeight:700,color:curTab==="convocatoria"?"#6366f1":th.sub}}>
                Convocatoria {convocados.length>0&&`(${convocados.length})`}
              </button>
              <button onClick={()=>setTab(t=>({...t,[m.id]:"valoracion"}))}
                style={{padding:"5px 14px",borderRadius:7,border:`1px solid ${curTab==="valoracion"?"#f59e0b":th.border2}`,background:curTab==="valoracion"?"rgba(245,158,11,.1)":"transparent",cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:13,fontWeight:700,color:curTab==="valoracion"?"#f59e0b":th.sub}}>
                Valoración post-partido
              </button>
              {convocados.length>0&&<button onClick={()=>exportConvPDF(m)}
                style={{marginLeft:"auto",padding:"5px 12px",borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:12,color:th.sub,display:"flex",alignItems:"center",gap:5}}>
                <Printer size={12}/>PDF Convocatoria
              </button>}
              <button onClick={()=>setExp(null)} style={{width:28,height:28,borderRadius:7,border:`1px solid ${th.border2}`,background:"transparent",cursor:"pointer",color:th.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✕</button>
            </div>

            {/* CONVOCATORIA */}
            {curTab==="convocatoria"&&<div>
              <p style={{fontSize:11,color:th.muted,marginBottom:12}}>Selecciona los jugadores convocados — solo activos y no lesionados</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {availablePlayers.map(p=>{
                  const sel=convocados.includes(p.id);
                  const equipoColor={A:"#f97316",B:"#3b82f6",Convocado:"#8b5cf6"}[p.equipo||"A"];
                  return <div key={p.id} onClick={()=>toggleConv(m.id,p.id)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:`1px solid ${sel?"#6366f1":th.border}`,background:sel?"rgba(99,102,241,.08)":th.card2,cursor:"pointer",transition:"all .15s"}}>
                    <div style={{width:28,height:28,borderRadius:14,background:sel?"#6366f1":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{p.num}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:11,color:th.text,fontWeight:sel?600:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.split(" ")[0]} {p.name.split(" ")[1]||""}</p>
                      <p style={{fontSize:10,color:equipoColor}}>{p.pos}</p>
                    </div>
                    {sel&&<Check size={12} color="#6366f1"/>}
                  </div>;
                })}
              </div>
            </div>}

            {/* VALORACIÓN */}
            {curTab==="valoracion"&&<div>
              {convPlayers.length===0?
                <div style={{textAlign:"center",padding:"24px 0"}}>
                  <p style={{color:th.muted,fontSize:13,marginBottom:8}}>Primero define la convocatoria del partido</p>
                  <Btn onClick={()=>setTab(t=>({...t,[m.id]:"convocatoria"}))} variant="ghost" sm>Ir a Convocatoria</Btn>
                </div>
              :(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {convPlayers.map(p=>{
                    const val=valoraciones[p.id]||{nota:5,notas:""};
                    const nc=val.nota>=8?"#10b981":val.nota>=6?"#f97316":"#ef4444";
                    return <div key={p.id} style={{background:th.card2,borderRadius:10,padding:"12px 14px",border:`1px solid ${th.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                        <div style={{width:30,height:30,borderRadius:15,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{p.num}</div>
                        <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:th.text,flex:1}}>{p.name}</p>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:11,color:th.muted}}>1</span>
                          <input type="range" min={1} max={10} value={val.nota||5}
                            onChange={e=>setValoracion(m.id,p.id,"nota",+e.target.value)}
                            style={{width:120,accentColor:"#f97316"}}/>
                          <span style={{fontSize:11,color:th.muted}}>10</span>
                          <div style={{width:38,height:38,borderRadius:8,background:nc+"20",border:`1px solid ${nc}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{fontFamily:"DM Mono",fontSize:18,fontWeight:700,color:nc}}>{val.nota||5}</span>
                          </div>
                        </div>
                      </div>
                      <input value={val.notas||""} onChange={e=>setValoracion(m.id,p.id,"notas",e.target.value)}
                        placeholder="Notas individuales: rendimiento, actitud, aspectos a mejorar…" style={{fontSize:12}}/>
                    </div>;
                  })}
                </div>
              )}
            </div>}
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   4. PLANIFICACIÓN — Totalmente editable
══════════════════════════════════════════════════════════ */
const TIPO_OPTIONS=["Pretemporada","Temporada","Transición","Playoffs","Otro"];
const SESSION_TYPES=["Técnico-Táctico","Físico","Técnico","Táctico","Recuperación","Partido","Libre","Otro"];
const INTENS_OPTIONS=["Mínima","Baja","Media-Baja","Media","Media-Alta","Alta","Máxima","—"];
const COLOR_OPTIONS=["#f97316","#3b82f6","#8b5cf6","#10b981","#ef4444","#f59e0b","#06b6d4","#ec4899","#4b5563","#64748b"];

const DEFAULT_MESOS_EDIT=[
  {id:1,name:"Preparación General",    s:"Sem 1", e:"Sem 4", type:"Pretemporada",weeks:4, color:"#3b82f6",goal:"Base física y adaptación motriz"},
  {id:2,name:"Preparación Específica", s:"Sem 5", e:"Sem 8", type:"Pretemporada",weeks:4, color:"#8b5cf6",goal:"Trabajo técnico-táctico intensivo"},
  {id:3,name:"Competición I",          s:"Sem 9", e:"Sem 20",type:"Temporada",   weeks:12,color:"#f97316",goal:"Rendimiento competitivo sostenido"},
  {id:4,name:"Recuperación Activa",    s:"Sem 21",e:"Sem 22",type:"Transición",  weeks:2, color:"#10b981",goal:"Descarga y regeneración"},
  {id:5,name:"Playoffs",               s:"Sem 23",e:"Sem 34",type:"Playoffs",    weeks:12,color:"#ef4444",goal:"Pico de forma – Fase final"},
];
const DEFAULT_MICRO_EDIT=[
  {day:"Lunes",    type:"Libre",            focus:"Descanso activo",           intens:"—",          color:"#4b5563",load:10},
  {day:"Martes",   type:"Técnico-Táctico",  focus:"Ataque + sistemas",         intens:"Media-Alta", color:"#f97316",load:85},
  {day:"Miércoles",type:"Técnico",          focus:"Tiro y bote",               intens:"Media",      color:"#f59e0b",load:65},
  {day:"Jueves",   type:"Físico",           focus:"Fuerza / Potencia",         intens:"Alta",       color:"#3b82f6",load:75},
  {day:"Viernes",  type:"Táctico",          focus:"Defensa / Sistemas",        intens:"Media",      color:"#8b5cf6",load:60},
  {day:"Sábado",   type:"Partido",          focus:"Competición",               intens:"Máxima",     color:"#ef4444",load:100},
  {day:"Domingo",  type:"Recuperación",     focus:"Regenerativo post-partido", intens:"Mínima",     color:"#10b981",load:15},
];

function Planificacion(){
  const{th}=useTheme();const{planMesos,setPlanMesos,planMicro,setPlanMicro}=useData();
  const[tab,setTab]=useState("meso");
  const[edMeso,setEdMeso]=useState(null);const[mf,setMf]=useState({});
  const[edMicro,setEdMicro]=useState(null);const[micf,setMicf]=useState({});
  const[addMeso,setAddMeso]=useState(false);
  const[newM,setNewM]=useState({name:"",s:"",e:"",type:"Temporada",weeks:4,color:"#f97316",goal:""});

  const mesos=planMesos||DEFAULT_MESOS_EDIT;
  const micro=planMicro||DEFAULT_MICRO_EDIT;

  const saveMeso=()=>{setPlanMesos(prev=>(prev||DEFAULT_MESOS_EDIT).map(m=>m.id===edMeso?{...m,...mf,weeks:+mf.weeks}:m));setEdMeso(null);};
  const delMeso=id=>setPlanMesos(prev=>(prev||DEFAULT_MESOS_EDIT).filter(m=>m.id!==id));
  const addNewMeso=()=>{if(!newM.name)return;const id=Date.now();setPlanMesos(prev=>[...(prev||DEFAULT_MESOS_EDIT),{...newM,id,weeks:+newM.weeks}]);setNewM({name:"",s:"",e:"",type:"Temporada",weeks:4,color:"#f97316",goal:""});setAddMeso(false);};
  const saveMicro=idx=>{setPlanMicro(prev=>{const n=[...(prev||DEFAULT_MICRO_EDIT)];n[idx]={...n[idx],...micf,load:+micf.load};return n;});setEdMicro(null);};
  const resetPlan=()=>{if(confirm("¿Resetear la planificación a los valores por defecto?")){{setPlanMesos(DEFAULT_MESOS_EDIT);setPlanMicro(DEFAULT_MICRO_EDIT);}}};

  return <div>
    <SH title="Planificación" sub="Estructura de temporada editable · Adáptala a tu realidad"
      right={<button onClick={resetPlan} style={{background:"transparent",border:`1px solid ${th.border2}`,color:th.muted,cursor:"pointer",padding:"6px 12px",borderRadius:7,fontSize:11,fontFamily:"Barlow Condensed,sans-serif"}}>Resetear valores</button>}/>
    <TB tabs={[["meso","Mesociclos"],["micro","Microciclo Semanal"]]} active={tab} onChange={setTab}/>

    {tab==="meso"?<>
      {/* Timeline */}
      <div className="card" style={{padding:22,marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Timeline de Temporada</p>
        <div style={{display:"flex",height:46,gap:2,borderRadius:8,overflow:"hidden"}}>
          {mesos.map(m=><div key={m.id} style={{flex:m.weeks,background:m.color+"22",border:`1px solid ${m.color}40`,display:"flex",alignItems:"center",justifyContent:"center",minWidth:30}}>
            <span style={{fontFamily:"Barlow Condensed",fontSize:10,color:m.color,fontWeight:700,textTransform:"uppercase",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",padding:"0 4px"}}>{m.name.split(" ")[0]}</span>
          </div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          {mesos.map(m=><span key={m.id} style={{fontFamily:"DM Mono",fontSize:9,color:th.muted}}>{m.s}</span>)}
          <span style={{fontFamily:"DM Mono",fontSize:9,color:th.muted}}>{mesos[mesos.length-1]?.e}</span>
        </div>
      </div>

      {/* Mesociclos editables */}
      {mesos.map((m,idx)=><div key={m.id}>
        {edMeso===m.id?(
          <div className="card" style={{padding:20,marginBottom:10,borderLeft:`4px solid ${mf.color||m.color}`}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#f97316",textTransform:"uppercase",marginBottom:14}}>Editando mesociclo</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><Lbl>Nombre</Lbl><input value={mf.name} onChange={e=>setMf(f=>({...f,name:e.target.value}))}/></div>
              <div><Lbl>Tipo</Lbl><select value={mf.type} onChange={e=>setMf(f=>({...f,type:e.target.value}))}>{TIPO_OPTIONS.map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px",gap:12,marginBottom:12}}>
              <div><Lbl>Semana inicio</Lbl><input value={mf.s} onChange={e=>setMf(f=>({...f,s:e.target.value}))} placeholder="Sem 1"/></div>
              <div><Lbl>Semana fin</Lbl><input value={mf.e} onChange={e=>setMf(f=>({...f,e:e.target.value}))} placeholder="Sem 8"/></div>
              <div><Lbl>Semanas</Lbl><input type="number" min="1" max="34" value={mf.weeks} onChange={e=>setMf(f=>({...f,weeks:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:12}}><Lbl>Objetivo principal</Lbl><input value={mf.goal} onChange={e=>setMf(f=>({...f,goal:e.target.value}))} placeholder="Describe el objetivo de este bloque…"/></div>
            <div style={{marginBottom:14}}>
              <Lbl>Color identificativo</Lbl>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                {COLOR_OPTIONS.map(c=><div key={c} onClick={()=>setMf(f=>({...f,color:c}))} style={{width:28,height:28,borderRadius:14,background:c,cursor:"pointer",border:`3px solid ${mf.color===c?"#fff":"transparent"}`,outline:mf.color===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}><Btn onClick={saveMeso}>Guardar</Btn><Btn onClick={()=>setEdMeso(null)} variant="ghost">Cancelar</Btn></div>
          </div>
        ):(
          <div className="card" style={{padding:20,marginBottom:10,borderLeft:`4px solid ${m.color}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                  <h3 style={{fontFamily:"Barlow Condensed",fontSize:21,fontWeight:700,color:th.text}}>{m.name}</h3>
                  <Badge color={m.color}>{m.type}</Badge>
                </div>
                <p style={{fontSize:13,color:th.sub}}>{m.goal}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{m.s} — {m.e}</p>
                <p style={{fontFamily:"DM Mono",fontSize:26,color:m.color,fontWeight:700,lineHeight:1}}>{m.weeks}<span style={{fontSize:12,color:th.muted}}> sem</span></p>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>{setEdMeso(m.id);setMf({name:m.name,s:m.s,e:m.e,type:m.type,weeks:m.weeks,color:m.color,goal:m.goal});}} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:11,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}><Edit2 size={11}/>Editar</button>
                  {mesos.length>1&&<button onClick={()=>delMeso(m.id)} style={{width:26,height:26,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={11}/></button>}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:4,marginTop:14,flexWrap:"wrap"}}>
              {Array.from({length:m.weeks},(_,i)=><div key={i} style={{width:28,height:28,borderRadius:5,background:m.color+"18",border:`1px solid ${m.color}38`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"DM Mono",fontSize:9,color:m.color}}>{i+1}</span></div>)}
            </div>
          </div>
        )}
      </div>)}

      {/* Añadir mesociclo */}
      {addMeso?(
        <div className="card" style={{padding:20,borderColor:"#f9731640"}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#f97316",textTransform:"uppercase",marginBottom:14}}>Nuevo Bloque</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div><Lbl>Nombre</Lbl><input value={newM.name} onChange={e=>setNewM(f=>({...f,name:e.target.value}))} placeholder="Ej: Competición II"/></div>
            <div><Lbl>Tipo</Lbl><select value={newM.type} onChange={e=>setNewM(f=>({...f,type:e.target.value}))}>{TIPO_OPTIONS.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px",gap:12,marginBottom:12}}>
            <div><Lbl>Semana inicio</Lbl><input value={newM.s} onChange={e=>setNewM(f=>({...f,s:e.target.value}))} placeholder="Sem 1"/></div>
            <div><Lbl>Semana fin</Lbl><input value={newM.e} onChange={e=>setNewM(f=>({...f,e:e.target.value}))} placeholder="Sem 8"/></div>
            <div><Lbl>Semanas</Lbl><input type="number" value={newM.weeks} onChange={e=>setNewM(f=>({...f,weeks:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:12}}><Lbl>Objetivo</Lbl><input value={newM.goal} onChange={e=>setNewM(f=>({...f,goal:e.target.value}))} placeholder="Objetivo principal de este bloque"/></div>
          <div style={{marginBottom:14}}><Lbl>Color</Lbl><div style={{display:"flex",gap:6,marginTop:4}}>{COLOR_OPTIONS.map(c=><div key={c} onClick={()=>setNewM(f=>({...f,color:c}))} style={{width:26,height:26,borderRadius:13,background:c,cursor:"pointer",border:`3px solid ${newM.color===c?"#fff":"transparent"}`,outline:newM.color===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}</div></div>
          <div style={{display:"flex",gap:8}}><Btn onClick={addNewMeso}>Añadir</Btn><Btn onClick={()=>setAddMeso(false)} variant="ghost">Cancelar</Btn></div>
        </div>
      ):(
        <button onClick={()=>setAddMeso(true)} style={{width:"100%",padding:"12px",borderRadius:10,border:`2px dashed ${th.border2}`,background:"transparent",cursor:"pointer",color:th.muted,fontSize:13,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,marginTop:4}}>+ Añadir bloque de temporada</button>
      )}
    </>:<>
      {/* Microciclo editable */}
      <p style={{fontSize:12,color:th.muted,marginBottom:14}}>Haz clic en cualquier día para editarlo. Define el tipo de sesión, foco, intensidad y carga relativa para cada día de la semana.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:14}}>
        {micro.map((m,i)=><div key={m.day}>
          {edMicro===i?(
            <div className="card" style={{padding:14,borderTop:`3px solid ${micf.color||m.color}`,gridColumn:"span 1"}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:micf.color||m.color,textTransform:"uppercase",marginBottom:10}}>{m.day}</p>
              <div style={{marginBottom:8}}><Lbl>Tipo sesión</Lbl><select value={micf.type} onChange={e=>setMicf(f=>({...f,type:e.target.value}))} style={{fontSize:11}}>{SESSION_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{marginBottom:8}}><Lbl>Foco</Lbl><input value={micf.focus} onChange={e=>setMicf(f=>({...f,focus:e.target.value}))} placeholder="Descripción breve" style={{fontSize:11}}/></div>
              <div style={{marginBottom:8}}><Lbl>Intensidad</Lbl><select value={micf.intens} onChange={e=>setMicf(f=>({...f,intens:e.target.value}))} style={{fontSize:11}}>{INTENS_OPTIONS.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{marginBottom:10}}><Lbl>Carga (1-100)</Lbl><input type="number" min="0" max="100" value={micf.load} onChange={e=>setMicf(f=>({...f,load:e.target.value}))} style={{fontSize:11}}/></div>
              <div style={{marginBottom:10}}><Lbl>Color</Lbl><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{COLOR_OPTIONS.map(c=><div key={c} onClick={()=>setMicf(f=>({...f,color:c}))} style={{width:20,height:20,borderRadius:10,background:c,cursor:"pointer",border:`2px solid ${micf.color===c?"#fff":"transparent"}`,outline:micf.color===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}</div></div>
              <div style={{display:"flex",gap:6}}><Btn onClick={()=>saveMicro(i)} sm>✓</Btn><Btn onClick={()=>setEdMicro(null)} variant="ghost" sm>✗</Btn></div>
            </div>
          ):(
            <div className="card" style={{padding:14,borderTop:`3px solid ${m.color}`,cursor:"pointer"}} onClick={()=>{setEdMicro(i);setMicf({type:m.type,focus:m.focus,intens:m.intens,color:m.color,load:m.load});}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{m.day}</p>
              <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:m.color,marginBottom:4}}>{m.type}</p>
              <p style={{fontSize:11,color:th.sub,marginBottom:8,lineHeight:1.4}}>{m.focus}</p>
              <Badge color={m.color} sm>{m.intens}</Badge>
              <div style={{marginTop:8,height:4,background:th.border2,borderRadius:2,overflow:"hidden"}}><div style={{width:`${m.load}%`,height:"100%",background:m.color,borderRadius:2}}/></div>
              <p style={{fontSize:9,color:th.muted,marginTop:3,fontFamily:"DM Mono"}}>Carga: {m.load}%</p>
            </div>
          )}
        </div>)}
      </div>

      {/* Gráfico de carga */}
      <div className="card" style={{padding:20}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Distribución de Carga Semanal</p>
        <div style={{display:"flex",gap:4,alignItems:"flex-end",height:80}}>
          {micro.map((m,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontFamily:"DM Mono",fontSize:9,color:m.color,fontWeight:600}}>{m.load}%</span>
            <div style={{width:"100%",background:m.color,height:`${m.load}%`,minHeight:4,borderRadius:"4px 4px 0 0",opacity:.8}}/>
          </div>)}
        </div>
        <div style={{display:"flex",marginTop:6}}>
          {micro.map(m=><div key={m.day} style={{flex:1,textAlign:"center",fontSize:9,color:th.muted,fontFamily:"DM Mono"}}>{m.day.slice(0,3)}</div>)}
        </div>
      </div>
      <p style={{fontSize:11,color:th.muted,marginTop:8}}>💡 Haz clic en cualquier día para editar su contenido</p>
    </>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   5. ESTADÍSTICAS
══════════════════════════════════════════════════════════ */
function Estadisticas(){
  const{th}=useTheme();const{players}=useData();
  const[sortBy,setSortBy]=useState("pir");
  const[view,setView]=useState("performance"); // performance | detailed
  const active=players.filter(p=>p.active&&p.pj);
  const withCalc=active.map(p=>({...p,...calcStats(p)}));
  const sorted=[...withCalc].sort((a,b)=>(b[sortBy]||0)-(a[sortBy]||0));
  const chartData=sorted.slice(0,8).map(p=>({name:"#"+p.num+" "+p.name.split(" ")[0].slice(0,7),val:+(p[sortBy]||0)}));
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};

  const sortCols=[
    {key:"pir",   lbl:"PIR",   color:"#f97316", desc:"Valoración FIBA"},
    {key:"pts_p", lbl:"PTS/P", color:"#ef4444", desc:"Puntos por partido"},
    {key:"ts",    lbl:"TS%",   color:"#10b981", desc:"True Shooting %"},
    {key:"efg",   lbl:"eFG%",  color:"#3b82f6", desc:"Effective FG%"},
    {key:"min_p", lbl:"Min/P", color:"#64748b", desc:"Minutos por partido"},
    {key:"tl_pct",lbl:"TL%",   color:"#f59e0b", desc:"% Tiro libre"},
    {key:"t2_pct",lbl:"T2%",   color:"#3b82f6", desc:"% Tiro de 2"},
    {key:"t3_pct",lbl:"T3%",   color:"#8b5cf6", desc:"% Triple"},
    {key:"fc_p",  lbl:"FC/P",  color:"#ef4444", desc:"Faltas por partido"},
  ];

  const Th=({children,k,right})=><th onClick={()=>k&&setSortBy(k)} style={{padding:"10px 10px",textAlign:right?"right":"left",fontFamily:"Barlow Condensed",fontSize:10,color:sortBy===k?"#f97316":th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,cursor:k?"pointer":"default",whiteSpace:"nowrap",borderBottom:`2px solid ${sortBy===k?"#f97316":"transparent"}`}}>{children}</th>;
  const Td=({children,accent,color})=><td style={{padding:"9px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:color||(accent?"#f97316":th.text),fontWeight:accent?700:400}}>{children}</td>;

  const curCol=sortCols.find(c=>c.key===sortBy)||sortCols[0];

  return <div>
    <SH title="Estadísticas" sub="CB Binissalem Senior A · PIR · eFG% · TS% · Ordenar por columna"/>

    {/* KPIs equipo — estilo CourtStat */}
    {(()=>{
      const tot=active;
      const totalPts=tot.reduce((a,p)=>a+(p.pt||0),0);
      const maxPJ=Math.max(0,...tot.map(p=>p.pj||0));
      const teamPtsPP=maxPJ?+(totalPts/maxPJ/tot.length*tot.length).toFixed(1):0;
      const avgPIR=tot.length?+(tot.reduce((a,p)=>a+calcStats(p).pir,0)/tot.length).toFixed(1):0;
      const allTi=tot.reduce((a,p)=>a+(p.t2_i||0)+(p.t3_i||0),0);
      const allTm=tot.reduce((a,p)=>a+(p.t2_m||0)+(p.t3_m||0),0);
      const allT3i=tot.reduce((a,p)=>a+(p.t3_i||0),0);
      const allT3m=tot.reduce((a,p)=>a+(p.t3_m||0),0);
      const teamEfg=allTi?+(((allTm+(allT3m*0.5))/allTi)*100).toFixed(1):0;
      const allTLi=tot.reduce((a,p)=>a+(p.tl_i||0),0);
      const allTLm=tot.reduce((a,p)=>a+(p.tl_m||0),0);
      const teamTL=allTLi?+((allTLm/allTLi)*100).toFixed(1):0;
      const kpis=[
        {lbl:"PIR Medio",val:avgPIR,color:"#f97316",sub:"Valoración FIBA/pj"},
        {lbl:"eFG% Equipo",val:teamEfg+"%",color:"#10b981",sub:"Eficiencia real de campo"},
        {lbl:"TL% Equipo",val:teamTL+"%",color:"#f59e0b",sub:"% Tiro libre total"},
        {lbl:"T3% Equipo",val:allT3i?+((allT3m/allT3i)*100).toFixed(1)+"%":"—",color:"#8b5cf6",sub:"% Triple total"},
      ];
      return <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
        {kpis.map(k=>(
          <div key={k.lbl} className="card" style={{padding:"16px 18px",borderTop:`3px solid ${k.color}`}}>
            <p style={{fontFamily:"DM Mono",fontSize:28,fontWeight:700,color:k.color,lineHeight:1,marginBottom:4}}>{k.val}</p>
            <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.text,marginBottom:2}}>{k.lbl}</p>
            <p style={{fontSize:10,color:th.muted}}>{k.sub}</p>
          </div>
        ))}
      </div>;
    })()}

    {/* Selector de vista */}
    <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
      {[["performance","📊 Performance"],["detailed","📋 Estadísticas detalladas"]].map(([v,l])=>(
        <button key={v} onClick={()=>setView(v)} style={{padding:"5px 16px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:13,background:view===v?"#f97316":th.card2,color:view===v?"#fff":th.sub}}>{l}</button>
      ))}
      <div style={{marginLeft:"auto",display:"flex",gap:5,flexWrap:"wrap"}}>
        {sortCols.map(c=><button key={c.key} onClick={()=>setSortBy(c.key)} title={c.desc} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"Barlow Condensed",background:sortBy===c.key?c.color:th.card2,color:sortBy===c.key?"#fff":th.sub}}>{c.lbl}</button>)}
      </div>
    </div>

    {/* Gráfico */}
    <div className="card" style={{padding:"16px 16px 8px",marginBottom:14}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
        Ranking — <span style={{color:curCol.color}}>{curCol.lbl}</span> · {curCol.desc}
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
          <XAxis dataKey="name" tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:th.muted,fontSize:9}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={tt} formatter={v=>[v,curCol.lbl]}/>
          <Bar dataKey="val" fill={curCol.color} radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Vista Performance — tabla tipo CourtStat */}
    {view==="performance"&&<div className="card" style={{overflow:"auto",padding:0}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
        <thead>
          <tr style={{background:"#1e3a5f"}}>
            <th style={{padding:"10px 14px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase",letterSpacing:.8}}>Jugador</th>
            <th style={{padding:"10px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase"}}>PJ</th>
            {[{k:"pir",l:"PIR",c:"#f97316"},{k:"pts_p",l:"PTS/P",c:"#ef4444"},{k:"efg",l:"eFG%",c:"#10b981"},{k:"ts",l:"TS%",c:"#3b82f6"},{k:"t3_pct",l:"T3%",c:"#8b5cf6"},{k:"tl_pct",l:"TL%",c:"#f59e0b"},{k:"fc_p",l:"FC/P",c:"#94a3b8"}].map(col=>(
              <th key={col.k} onClick={()=>setSortBy(col.k)} style={{padding:"10px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:sortBy===col.k?col.c:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase",cursor:"pointer",borderBottom:sortBy===col.k?`2px solid ${col.c}`:"2px solid transparent"}}>{col.l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p,i)=>{
            const isTop=i<3;
            const rowBg=i===0?"rgba(249,115,22,.06)":i%2===0?th.card:th.card2;
            const pir=p.pir||0;
            const pirColor=pir>12?"#f97316":pir>7?"#10b981":pir>3?"#3b82f6":th.muted;
            return <tr key={p.id} className="hrow" style={{background:rowBg,borderTop:`1px solid ${th.border}`,borderLeft:isTop?`3px solid #f97316`:"3px solid transparent"}}>
              <td style={{padding:"10px 14px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:16,background:isTop?"#f97316":"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0}}>{p.num}</div>
                  <div>
                    <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:isTop?"#f97316":th.text,lineHeight:1.2}}>{p.name.split(" ").slice(0,2).join(" ")}</p>
                    <p style={{fontSize:9,color:th.muted}}>{p.pos} · {p.min_p}' /pj</p>
                  </div>
                </div>
              </td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{p.pj}</td>
              {/* PIR — badge de color */}
              <td style={{padding:"10px",textAlign:"center"}}>
                <span style={{display:"inline-block",minWidth:38,padding:"3px 8px",borderRadius:6,background:pirColor+"22",color:pirColor,fontFamily:"DM Mono",fontSize:13,fontWeight:700}}>{pir}</span>
              </td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:13,fontWeight:700,color:"#ef4444"}}>{p.pts_p}</td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:"#10b981"}}>{p.efg}%</td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:"#3b82f6"}}>{p.ts}%</td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:"#8b5cf6"}}>{p.t3_pct}%</td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:"#f59e0b"}}>{p.tl_pct}%</td>
              <td style={{padding:"10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:"#ef4444"}}>{p.fc_p}</td>
            </tr>;
          })}
        </tbody>
      </table>
      <div style={{padding:"8px 16px",borderTop:`1px solid ${th.border}`,display:"flex",gap:16,flexWrap:"wrap"}}>
        {[{c:"#f97316",t:"PIR: Valoración FIBA — suma de contribuciones positivas menos negativas"},
          {c:"#10b981",t:"eFG%: Eficiencia real (pondera el triple x1.5)"},
          {c:"#3b82f6",t:"TS%: True Shooting — eficiencia total incluyendo TL"}].map(l=>(
          <span key={l.t} style={{fontSize:9,color:th.muted}}>
            <span style={{color:l.c,fontWeight:700}}>●</span> {l.t}
          </span>
        ))}
      </div>
    </div>}

    {/* Vista detallada — tabla original mejorada */}
    {view==="detailed"&&<div className="card" style={{overflow:"auto",padding:0}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:960}}>
        <thead>
          <tr style={{background:th.tableHead}}>
            <Th>Jug.</Th>
            <Th>Jugador</Th>
            <Th>Pos</Th>
            <Th k="pj" right>PJ</Th>
            <Th k="min_p" right>Min/P</Th>
            <Th k="pts_p" right>PTS/P</Th>
            <Th k="pir" right>PIR</Th>
            <Th k="efg" right>eFG%</Th>
            <Th k="ts" right>TS%</Th>
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",background:th.tableHead}}>TL</th>
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",background:th.tableHead}}>T2</th>
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#8b5cf6",fontWeight:700,textTransform:"uppercase",background:th.tableHead}}>T3</th>
            <Th k="fc_p" right>FC/P</Th>
          </tr>
          <tr style={{background:th.tableHead}}>
            <th colSpan={9} style={{background:th.tableHead}}/>
            {["Int","Met","%"].map(h=><th key={"tl"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#f59e0b",fontWeight:600,textTransform:"uppercase",background:th.tableHead}}>{h}</th>)}
            {["Int","Met","%"].map(h=><th key={"t2"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#3b82f6",fontWeight:600,textTransform:"uppercase",background:th.tableHead}}>{h}</th>)}
            {["Int","Met","%"].map(h=><th key={"t3"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#8b5cf6",fontWeight:600,textTransform:"uppercase",background:th.tableHead}}>{h}</th>)}
            <th style={{background:th.tableHead}}/>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p,i)=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`,background:i===0?"rgba(249,115,22,.04)":"transparent"}}>
            <td style={{padding:"9px 12px"}}><div style={{width:28,height:28,borderRadius:14,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:"#fff"}}>{p.num}</div></td>
            <td style={{padding:"9px 12px",fontSize:12,color:th.text,whiteSpace:"nowrap"}}>{p.name}</td>
            <td style={{padding:"9px 10px"}}><Badge color={POC[p.pos]||"#64748b"} sm>{p.pos}</Badge></td>
            <Td color={th.sub}>{p.pj}</Td>
            <Td>{p.min_p}'</Td>
            <Td accent={sortBy==="pts_p"}>{p.pts_p}</Td>
            <td style={{padding:"9px 10px",textAlign:"right"}}>
              <span style={{display:"inline-block",padding:"2px 7px",borderRadius:5,background:(p.pir>12?"#f97316":p.pir>7?"#10b981":"#3b82f6")+"22",color:p.pir>12?"#f97316":p.pir>7?"#10b981":"#3b82f6",fontFamily:"DM Mono",fontSize:12,fontWeight:700}}>{p.pir}</span>
            </td>
            <Td color="#10b981" accent={sortBy==="efg"}>{p.efg}%</Td>
            <Td color="#3b82f6" accent={sortBy==="ts"}>{p.ts}%</Td>
            <Td color={th.muted}>{p.tl_i}</Td><Td color={th.muted}>{p.tl_m}</Td><Td accent={sortBy==="tl_pct"} color="#f59e0b">{p.tl_pct}%</Td>
            <Td color={th.muted}>{p.t2_i}</Td><Td color={th.muted}>{p.t2_m}</Td><Td accent={sortBy==="t2_pct"} color="#3b82f6">{p.t2_pct}%</Td>
            <Td color={th.muted}>{p.t3_i}</Td><Td color={th.muted}>{p.t3_m}</Td><Td accent={sortBy==="t3_pct"} color="#8b5cf6">{p.t3_pct}%</Td>
            <Td accent={sortBy==="fc_p"} color="#ef4444">{p.fc_p}</Td>
          </tr>)}
        </tbody>
      </table>
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   6. ENTRENAMIENTOS — con notas y exportar PDF
══════════════════════════════════════════════════════════ */
/* ── PDF para playbook ─────────────────────────────────────── */
function exportPlaybookPDF(plays,filter){
  const list=filter==="Todos"?plays:plays.filter(p=>p.cat===filter);
  const w=window.open("","_blank");
  const rows=list.map(p=>{
    const cat=PC[p.cat]||"#f97316";
    const tagsHtml=(p.tags||[]).length?'<div class="tags">'+p.tags.map(t=>'<span class="tag">'+t+'</span>').join("")+"</div>":"";
    const imgsHtml=(p.images||[]).length?'<div class="imgs">'+p.images.map(img=>'<img src="'+img+'" class="play-img"/>').join("")+"</div>":"";
    return '<div class="play">'
      +'<div class="play-header">'
      +'<span class="play-name">'+p.name+'</span>'
      +'<span class="play-cat" style="background:'+cat+'20;color:'+cat+'">'+p.cat+'</span>'
      +'</div>'
      +(p.desc?'<p class="play-desc">'+p.desc+'</p>':"")
      +tagsHtml+imgsHtml
      +'</div>';
  }).join("");
  w.document.write(pdfOpen("Playbook")
    +pdfHeader("Playbook",(filter!=="Todos"?filter+" · ":"")+list.length+" jugadas")
    +'<style>.play{margin-bottom:18px;padding:14px;border:1px solid #e2e8f0;border-radius:8px;page-break-inside:avoid}'
    +'.play-header{display:flex;align-items:center;gap:10px;margin-bottom:6px}'
    +'.play-name{font-weight:700;font-size:15px;color:#1e293b}'
    +'.play-cat{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase}'
    +'.play-desc{font-size:13px;color:#475569;line-height:1.6;margin-bottom:6px}'
    +'.tags{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px}'
    +'.tag{font-size:10px;background:#f8fafc;border:1px solid #e2e8f0;padding:2px 8px;border-radius:4px;color:#64748b}'
    +'.imgs{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}'
    +'.play-img{width:100px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #e2e8f0}</style>'
    +rows+pdfClose());
  w.document.close();setTimeout(()=>w.print(),400);
}

/* ── PDF para ejercicios ───────────────────────────────────── */
function exportEjerciciosPDF(ejercicios,filter){
  const list=filter==="Todos"?ejercicios:ejercicios.filter(e=>e.cat===filter);
  const w=window.open("","_blank");
  const rows=list.map(ex=>{
    const cat=CC[ex.cat]||"#f97316";
    const imgsHtml=(ex.images||[]).length?'<div class="imgs">'+ex.images.map(img=>'<img src="'+img+'" class="ex-img"/>').join("")+"</div>":"";
    return '<div class="ex">'
      +'<div class="ex-header">'
      +'<span class="ex-name">'+ex.name+'</span>'
      +(ex.dur?'<span class="ex-dur">'+ex.dur+'</span>':"")
      +'<span class="ex-badge" style="background:'+cat+'20;color:'+cat+'">'+ex.cat+'</span>'
      +'<span class="ex-badge" style="background:#e0f2fe;color:#0284c7">'+(ex.diff||"Básico")+'</span>'
      +'</div>'
      +(ex.desc?'<p class="ex-desc">'+ex.desc+'</p>':"")
      +imgsHtml
      +'</div>';
  }).join("");
  w.document.write(pdfOpen("Biblioteca de Ejercicios")
    +pdfHeader("Biblioteca de Ejercicios",(filter!=="Todos"?filter+" · ":"")+list.length+" ejercicios")
    +'<style>.ex{margin-bottom:16px;padding:12px 14px;border-left:3px solid #1d4ed8;background:#f8fafc;border-radius:0 8px 8px 0;page-break-inside:avoid}'
    +'.ex-header{display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap}'
    +'.ex-name{font-weight:700;font-size:15px;color:#1e293b;flex:1}'
    +'.ex-dur{font-family:monospace;font-size:12px;color:#f97316;font-weight:700;background:#fff7ed;padding:2px 8px;border-radius:4px}'
    +'.ex-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase}'
    +'.ex-desc{font-size:12px;color:#475569;line-height:1.6;margin-bottom:5px}'
    +'.imgs{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px}'
    +'.ex-img{width:90px;height:70px;object-fit:cover;border-radius:5px;border:1px solid #e2e8f0}</style>'
    +rows+pdfClose());
  w.document.close();setTimeout(()=>w.print(),400);
}

/* ── Componente modal ejercicio ────────────────────────────── */
function EjercicioModal({ex,onClose}){
  const{th}=useTheme();
  const c=CC[ex.cat]||"#f97316";const dc=DC[ex.diff]||"#10b981";
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{background:th.card,borderRadius:16,padding:28,maxWidth:580,width:"100%",maxHeight:"85vh",overflowY:"auto",border:`1px solid ${th.border}`,boxShadow:"0 24px 60px rgba(0,0,0,.4)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <h2 style={{fontFamily:"Barlow Condensed",fontSize:24,fontWeight:800,color:th.text,marginBottom:6}}>{ex.name}</h2>
          <div style={{display:"flex",gap:6}}><Badge color={c}>{ex.cat}</Badge><Badge color={dc}>{ex.diff}</Badge>{ex.dur&&<Badge color="#3b82f6">{ex.dur}</Badge>}</div>
        </div>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${th.border2}`,borderRadius:8,cursor:"pointer",color:th.muted,padding:"4px 10px",fontSize:16}}>✕</button>
      </div>
      {ex.desc&&<p style={{fontSize:14,color:th.sub,lineHeight:1.7,marginBottom:14,whiteSpace:"pre-wrap"}}>{ex.desc}</p>}
      {(ex.images||[]).length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
        {ex.images.map((img,i)=><img key={i} src={img} alt="" style={{width:"100%",borderRadius:8,objectFit:"cover",border:`1px solid ${th.border}`}}/>)}
      </div>}
    </div>
  </div>;
}

/* ── Selector de ejercicios para entrenos ──────────────────── */
function EjercicioPicker({ejercicios,onAdd,onClose}){
  const{th}=useTheme();
  const[filter,setFilter]=useState("Todos");
  const[sel,setSel]=useState([]);
  const cats=["Todos","Técnico","Táctico","Físico","Recuperación","Mental"];
  const filtered=filter==="Todos"?ejercicios:ejercicios.filter(e=>e.cat===filter);
  const toggle=id=>setSel(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div onClick={e=>e.stopPropagation()} style={{background:th.card,borderRadius:16,padding:24,maxWidth:680,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column",border:`1px solid ${th.border}`,boxShadow:"0 24px 60px rgba(0,0,0,.4)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text}}>Añadir ejercicios al entreno</p>
        <button onClick={onClose} style={{background:"transparent",border:`1px solid ${th.border2}`,borderRadius:8,cursor:"pointer",color:th.muted,padding:"4px 10px",fontSize:16}}>✕</button>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"4px 14px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Barlow Condensed",background:filter===c?(CC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub}}>{c}</button>)}
      </div>
      <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:6}}>
        {filtered.length===0&&<p style={{color:th.muted,fontSize:12,textAlign:"center",padding:24}}>Sin ejercicios en esta categoría</p>}
        {filtered.map(ex=>{
          const c=CC[ex.cat]||"#f97316";const isSel=sel.includes(ex.id);
          return <div key={ex.id} onClick={()=>toggle(ex.id)}
            style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:8,border:`1px solid ${isSel?c:th.border}`,background:isSel?c+"10":th.card2,cursor:"pointer",transition:"all .15s"}}>
            <div style={{width:22,height:22,borderRadius:4,border:`2px solid ${isSel?c:th.border2}`,background:isSel?c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {isSel&&<Check size={12} color="#fff"/>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text}}>{ex.name}</p>
              <p style={{fontSize:11,color:th.muted}}>{ex.cat} · {ex.diff}{ex.dur?` · ${ex.dur}`:""}</p>
            </div>
            {(ex.images||[]).length>0&&<img src={ex.images[0]} alt="" style={{width:40,height:40,objectFit:"cover",borderRadius:6,flexShrink:0}}/>}
          </div>;
        })}
      </div>
      <div style={{marginTop:14,display:"flex",gap:8,justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontSize:12,color:th.muted}}>{sel.length} ejercicio{sel.length!==1?"s":""} seleccionado{sel.length!==1?"s":""}</p>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onClose} variant="ghost">Cancelar</Btn>
          <Btn onClick={()=>{onAdd(sel);onClose();}} disabled={sel.length===0}>Añadir al entreno</Btn>
        </div>
      </div>
    </div>
  </div>;
}

/* ── Formulario sesión (nuevo/editar) ──────────────────────── */
function SesionForm({session,ejercicios,onSave,onCancel}){
  const{th}=useTheme();
  const isEdit=!!session;

  // Migrate legacy exs (textarea) to unified exObjs on load
  const migrateExObjs=()=>{
    const objs=(session?.exObjs||[]).map(e=>e.type?e:{...e,type:"catalog"});
    // Only migrate legacy exs if exObjs is empty (old sessions without unified list)
    if(objs.length>0)return objs;
    const legacy=Array.isArray(session?.exs)?session.exs:((session?.exs||"").split("\n").filter(Boolean));
    return legacy.map((line,i)=>{
      const parts=line.split("|");const hasTime=parts.length>1&&/^\d+$/.test(parts[0].trim());
      return{type:"free",id:"legacy_"+i,name:hasTime?parts.slice(1).join("|").trim():line.trim(),desc:"",sesMin:hasTime?parts[0].trim():""};
    });
  };

  const[f,setF]=useState({
    date:session?.date||"",
    time:session?.time||"",
    type:session?.type||"Técnico",
    dur:session?.dur||90,
    title:session?.title||"",
    exObjs:migrateExObjs(),
    notes:session?.notes||"",
    images:session?.images||[],
  });
  const[showPicker,setShowPicker]=useState(false);
  const[viewEx,setViewEx]=useState(null);

  const addExFromCatalog=ids=>{
    const toAdd=ids.map(id=>ejercicios.find(e=>e.id===id)).filter(Boolean)
      .filter(e=>!f.exObjs.some(o=>o.id===e.id))
      .map(e=>({...e,type:"catalog",sesMin:e.dur||"",sesNotes:""}));
    setF(prev=>({...prev,exObjs:[...prev.exObjs,...toAdd]}));
  };
  const addFreeEx=()=>{
    const newEx={type:"free",id:"free_"+Date.now(),name:"",desc:"",sesMin:"",sesNotes:""};
    setF(prev=>({...prev,exObjs:[...prev.exObjs,newEx]}));
  };
  const updateEx=(idx,field,val)=>setF(prev=>({...prev,exObjs:prev.exObjs.map((e,i)=>i===idx?{...e,[field]:val}:e)}));
  const removeEx=idx=>setF(prev=>({...prev,exObjs:prev.exObjs.filter((_,i)=>i!==idx)}));
  const moveEx=(idx,dir)=>setF(prev=>{
    const a=[...prev.exObjs];const t=idx+dir;
    if(t<0||t>=a.length)return prev;
    [a[idx],a[t]]=[a[t],a[idx]];return{...prev,exObjs:a};
  });

  const save=()=>{
    if(!f.title||!f.date)return;
    onSave({
      ...(session||{}),
      id:session?.id||Date.now(),
      date:f.date,time:f.time,type:f.type,dur:+f.dur,
      title:f.title,exs:[],exObjs:f.exObjs,
      notes:f.notes,images:f.images,
    });
  };

  const totalMin=f.exObjs.reduce((a,e)=>a+(parseInt(e.sesMin)||0),0);

  return <div className="card" style={{padding:22,marginBottom:14,borderColor:"#f9731640",position:"relative"}}>
    {viewEx&&<EjercicioModal ex={viewEx} onClose={()=>setViewEx(null)}/>}
    {showPicker&&<EjercicioPicker ejercicios={ejercicios} onAdd={addExFromCatalog} onClose={()=>setShowPicker(false)}/>}
    <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:16,textTransform:"uppercase"}}>{isEdit?"Editar Sesión":"Nueva Sesión"}</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 110px 1fr 110px",gap:12,marginBottom:12}}>
      <div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div>
      <div><Lbl>Hora inicio</Lbl><input type="time" value={f.time} onChange={e=>setF(p=>({...p,time:e.target.value}))}/></div>
      <div><Lbl>Tipo</Lbl><select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))}>{Object.keys(TC).map(t=><option key={t}>{t}</option>)}</select></div>
      <div><Lbl>Duración (min)</Lbl><input type="number" value={f.dur} onChange={e=>setF(p=>({...p,dur:e.target.value}))}/></div>
    </div>
    <div style={{marginBottom:12}}><Lbl>Título</Lbl><input type="text" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Título de la sesión"/></div>

    {/* ── Lista unificada de ejercicios ── */}
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Lbl style={{margin:0}}>Ejercicios</Lbl>
          {f.exObjs.length>0&&<span style={{fontSize:11,color:th.muted,fontFamily:"DM Mono"}}>
            {f.exObjs.length} ejerc. · {totalMin} min planificados
          </span>}
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setShowPicker(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",fontSize:11,color:"#f97316",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            <Plus size={11}/>Del catálogo
          </button>
          <button onClick={addFreeEx} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:6,border:"1px solid rgba(59,130,246,.4)",background:"rgba(59,130,246,.07)",cursor:"pointer",fontSize:11,color:"#3b82f6",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            <Plus size={11}/>Ejercicio libre
          </button>
        </div>
      </div>

      {f.exObjs.length===0
        ?<div style={{padding:"20px",textAlign:"center",background:th.card2,borderRadius:10,border:`1px dashed ${th.border2}`}}>
          <p style={{fontSize:12,color:th.muted,marginBottom:6}}>Sin ejercicios. Añade del catálogo o crea uno libre.</p>
          <p style={{fontSize:11,color:th.muted}}>Los ejercicios con tiempo asignado activan el <strong>Modo Gimnasio</strong> con timer automático.</p>
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {f.exObjs.map((ex,idx)=>{
            const isFree=ex.type==="free";
            const c=isFree?"#3b82f6":(CC[ex.cat]||"#f97316");
            return <div key={ex.id||idx} style={{display:"grid",gridTemplateColumns:"56px 1fr 28px",gap:8,padding:"12px",background:th.card2,borderRadius:10,border:`1px solid ${c}35`,alignItems:"start"}}>

              {/* Timer */}
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <p style={{fontSize:8,color:th.muted,fontFamily:"Barlow Condensed",textTransform:"uppercase",letterSpacing:.5}}>Min</p>
                <input type="text" inputMode="numeric" maxLength={3}
                  value={ex.sesMin||""}
                  onChange={e=>{if(/^\d*$/.test(e.target.value))updateEx(idx,"sesMin",e.target.value);}}
                  placeholder="—"
                  style={{width:48,textAlign:"center",fontFamily:"DM Mono",fontSize:18,fontWeight:700,color:c,borderRadius:7,border:`2px solid ${c}50`,background:c+"0d",padding:"6px 2px"}}/>
                {ex.sesMin&&<p style={{fontSize:8,color:th.muted,textAlign:"center"}}>⏱ timer</p>}
              </div>

              {/* Contenido */}
              <div style={{minWidth:0}}>
                {isFree
                  ? /* Ejercicio libre — inputs editables */
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:9,fontFamily:"Barlow Condensed",fontWeight:700,color:"#3b82f6",textTransform:"uppercase",background:"rgba(59,130,246,.1)",padding:"1px 6px",borderRadius:4,flexShrink:0}}>Libre</span>
                        <input
                          value={ex.name}
                          onChange={e=>updateEx(idx,"name",e.target.value)}
                          placeholder="Título del ejercicio…"
                          style={{flex:1,fontSize:13,fontWeight:700,fontFamily:"Barlow Condensed",color:th.text,border:"none",borderBottom:`1px solid ${th.border2}`,background:"transparent",padding:"2px 0",outline:"none"}}/>
                      </div>
                      <textarea
                        value={ex.desc||""}
                        onChange={e=>updateEx(idx,"desc",e.target.value)}
                        placeholder="Descripción, variantes, instrucciones…"
                        rows={2}
                        style={{width:"100%",fontSize:11,lineHeight:1.5,resize:"vertical",borderRadius:6,border:`1px solid ${th.border2}`,background:th.inputBg,color:th.text,padding:"5px 8px",fontFamily:"inherit"}}/>
                    </div>
                  : /* Ejercicio del catálogo */
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,cursor:"pointer"}} onClick={()=>setViewEx(ex)}>
                        {(ex.images||[]).length>0&&<img src={ex.images[0]} alt="" style={{width:26,height:26,objectFit:"cover",borderRadius:4,flexShrink:0}}/>}
                        <div style={{minWidth:0}}>
                          <p style={{fontSize:13,color:th.text,fontWeight:700,fontFamily:"Barlow Condensed",lineHeight:1.1}}>{ex.name}</p>
                          <p style={{fontSize:10,color:c}}>{ex.cat}{ex.diff?` · ${ex.diff}`:""}</p>
                        </div>
                        <span style={{fontSize:9,fontFamily:"Barlow Condensed",fontWeight:700,color:c,textTransform:"uppercase",background:c+"12",padding:"1px 6px",borderRadius:4,flexShrink:0,marginLeft:"auto"}}>Catálogo</span>
                      </div>
                      <textarea
                        value={ex.sesNotes||""}
                        onChange={e=>updateEx(idx,"sesNotes",e.target.value)}
                        placeholder="Notas para esta sesión: variantes, énfasis, instrucciones…"
                        rows={2}
                        style={{width:"100%",fontSize:11,lineHeight:1.5,resize:"vertical",borderRadius:6,border:`1px solid ${th.border2}`,background:th.inputBg,color:th.text,padding:"5px 8px",fontFamily:"inherit"}}/>
                    </div>
                }
              </div>

              {/* Controles orden + borrar */}
              <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center",paddingTop:4}}>
                <button onClick={()=>moveEx(idx,-1)} disabled={idx===0}
                  style={{width:22,height:22,border:`1px solid ${th.border2}`,borderRadius:5,background:th.card,cursor:"pointer",fontSize:11,color:th.muted,opacity:idx===0?.25:1,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
                <button onClick={()=>moveEx(idx,1)} disabled={idx===f.exObjs.length-1}
                  style={{width:22,height:22,border:`1px solid ${th.border2}`,borderRadius:5,background:th.card,cursor:"pointer",fontSize:11,color:th.muted,opacity:idx===f.exObjs.length-1?.25:1,display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>
                <button onClick={()=>removeEx(idx)}
                  style={{width:22,height:22,border:"none",background:"transparent",cursor:"pointer",color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",marginTop:2}}><Trash2 size={11}/></button>
              </div>
            </div>;
          })}
          <p style={{fontSize:10,color:th.muted,marginTop:2}}>💡 Asigna minutos a cada ejercicio para activar el timer en el <strong>Modo Gimnasio</strong>. Usa ↑↓ para reordenar.</p>
        </div>}
    </div>

    <div style={{marginBottom:12}}><Lbl>Notas de la sesión</Lbl><textarea rows={2} value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))} placeholder="Objetivos, instrucciones, observaciones…"/></div>
    <div style={{marginBottom:16}}><Lbl>Imágenes de la sesión (hasta 4)</Lbl><ImageUploader images={f.images} setImages={imgs=>setF(p=>({...p,images:imgs}))}/></div>
    <div style={{display:"flex",gap:8}}><Btn onClick={save}>Guardar</Btn><Btn onClick={onCancel} variant="ghost">Cancelar</Btn></div>
  </div>;
}

function Entrenamientos(){
  const{th}=useTheme();const{sessions,setSessions,sesionTemplates,setSesionTemplates,ejercicios}=useData();
  const[exp,setExp]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const[editSes,setEditSes]=useState(null);
  const[showTemplates,setShowTemplates]=useState(false);
  const[saveAsTemplate,setSaveAsTemplate]=useState(null);const[tplName,setTplName]=useState("");
  const[viewEx,setViewEx]=useState(null);
  const[viewImg,setViewImg]=useState(null);
  // Gym Mode
  const[gymMode,setGymMode]=useState(false);
  const[gymIdx,setGymIdx]=useState(0);
  const[gymSec,setGymSec]=useState(0);
  const[gymRunning,setGymRunning]=useState(false);
  const[gymSessionId,setGymSessionId]=useState(null);
  const[gymAutoAdv,setGymAutoAdv]=useState(false); // transitioning to next
  const gymTimer=useRef(null);
  const wakeLock=useRef(null);
  const gymIdxRef=useRef(0); // ref to avoid stale closure in interval
  const gymExsRef=useRef([]);

  const acquireWakeLock=async()=>{
    if("wakeLock" in navigator){
      try{wakeLock.current=await navigator.wakeLock.request("screen");}catch(e){}
    }
  };
  const releaseWakeLock=()=>{
    if(wakeLock.current){try{wakeLock.current.release();}catch(e){}wakeLock.current=null;}
  };

  const getGymExs=s=>(s?.exObjs||[]).filter(e=>parseInt(e.sesMin||e.dur||0)>0);

  const startGym=s=>{
    const exs=getGymExs(s);
    if(!exs.length){alert("Asigna tiempo (Min) a al menos un ejercicio para usar el Modo Gimnasio.");return;}
    gymExsRef.current=exs;gymIdxRef.current=0;
    setGymMode(true);setGymIdx(0);setGymRunning(false);setGymSessionId(s.id);setGymAutoAdv(false);
    setGymSec(parseInt(exs[0].sesMin||exs[0].dur||5)*60);
  };

  const stopGym=()=>{
    setGymMode(false);setGymRunning(false);setGymAutoAdv(false);
    clearInterval(gymTimer.current);releaseWakeLock();
  };

  // Play beep sound
  const playBeep=(freq=880,dur=0.8)=>{
    try{
      const ac=new AudioContext();const o=ac.createOscillator();const g=ac.createGain();
      o.connect(g);g.connect(ac.destination);o.frequency.value=freq;
      g.gain.setValueAtTime(0.4,ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur);
      o.start();o.stop(ac.currentTime+dur);
    }catch(e){}
  };

  // Auto-advance to next exercise
  const advanceToNext=()=>{
    const exs=gymExsRef.current;
    const next=gymIdxRef.current+1;
    if(next>=exs.length){
      // All done — play final beep pattern and exit
      playBeep(660,0.3);
      setTimeout(()=>playBeep(880,0.3),350);
      setTimeout(()=>playBeep(1100,0.6),700);
      setTimeout(()=>stopGym(),1800);
      return;
    }
    gymIdxRef.current=next;
    setGymIdx(next);setGymAutoAdv(false);
    setGymSec(parseInt(exs[next].sesMin||exs[next].dur||5)*60);
    setGymRunning(true); // auto-start next exercise
  };

  useEffect(()=>{
    if(gymRunning){
      acquireWakeLock();
      // Use Date-based timer to survive screen sleep
      const startTime=Date.now();
      const startSec=gymSec; // capture current remaining seconds
      gymTimer.current=setInterval(()=>{
        const elapsed=Math.floor((Date.now()-startTime)/1000);
        const remaining=startSec-elapsed;
        if(remaining<=0){
          clearInterval(gymTimer.current);
          setGymRunning(false);setGymAutoAdv(true);
          setGymSec(0);
          playBeep(880,0.5);
          setTimeout(()=>playBeep(1100,0.5),600);
          // Auto-advance after 2s pause
          setTimeout(()=>advanceToNext(),2000);
        } else {
          setGymSec(remaining);
        }
      },500); // poll every 500ms for accuracy after sleep
    } else {
      clearInterval(gymTimer.current);
      if(!gymMode)releaseWakeLock();
    }
    return()=>clearInterval(gymTimer.current);
  },[gymRunning]);

  // Sync ref when idx changes externally (manual nav)
  useEffect(()=>{gymIdxRef.current=gymIdx;},[gymIdx]);

  const gymNextEx=(s,exs)=>{
    const next=gymIdx+1;
    if(next>=exs.length){stopGym();return;}
    gymIdxRef.current=next;gymExsRef.current=exs;
    setGymIdx(next);setGymSec(parseInt(exs[next].sesMin||exs[next].dur||5)*60);
    setGymRunning(false);setGymAutoAdv(false);
  };
  const gymPrevEx=(s,exs)=>{
    const prev=gymIdx-1;if(prev<0)return;
    gymIdxRef.current=prev;gymExsRef.current=exs;
    setGymIdx(prev);setGymSec(parseInt(exs[prev].sesMin||exs[prev].dur||5)*60);
    setGymRunning(false);setGymAutoAdv(false);
  };
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Gym Mode overlay
  if(gymMode){
    const s=sessions.find(x=>x.id===gymSessionId);
    const exs=getGymExs(s);const ex=exs[gymIdx]||{};
    // Sync exsRef when session loads
    if(exs.length)gymExsRef.current=exs;
    const durSec=parseInt(ex.sesMin||ex.dur||5)*60;
    const pct=durSec>0?Math.max(0,gymSec/durSec*100):0;
    const exName=ex.name||(ex.type==="free"?"Ejercicio libre":"Ejercicio");
    const exDesc=ex.desc||ex.sesNotes||"";
    const arcColor=gymAutoAdv?"#10b981":gymSec<30&&gymSec>0?"#ef4444":"#f97316";
    return <div style={{position:"fixed",inset:0,background:"#0f172a",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Header */}
      <div style={{position:"absolute",top:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:2}}>Modo Gimnasio</p>
          {gymRunning&&<p style={{fontSize:10,color:"#10b981",marginTop:2}}>● Activo — pantalla bloqueada</p>}
        </div>
        <button onClick={stopGym} style={{padding:"6px 16px",borderRadius:8,border:"1px solid rgba(239,68,68,.4)",background:"rgba(239,68,68,.1)",color:"#ef4444",cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14}}>✕ Salir</button>
      </div>
      {/* Ejercicio */}
      <p style={{fontFamily:"Barlow Condensed",fontSize:20,color:"#f97316",fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Ejercicio {gymIdx+1} / {exs.length}</p>
      <h1 style={{fontFamily:"Barlow Condensed",fontSize:52,fontWeight:700,color:"#f8fafc",textAlign:"center",marginBottom:6,lineHeight:1}}>{exName}</h1>
      <p style={{fontSize:16,color:"#64748b",marginBottom:gymAutoAdv?16:32,textAlign:"center"}}>{ex.cat||""}{ex.diff?" · "+ex.diff:ex.type==="free"?"Ejercicio libre":""}</p>
      {/* Auto-advance banner */}
      {gymAutoAdv&&<div style={{background:"rgba(16,185,129,.15)",border:"1px solid rgba(16,185,129,.4)",borderRadius:10,padding:"8px 24px",marginBottom:24,color:"#10b981",fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,letterSpacing:1}}>
        ✓ Tiempo completado — pasando al siguiente…
      </div>}
      {/* Timer ring */}
      <div style={{position:"relative",width:200,height:200,marginBottom:32}}>
        <svg width="200" height="200" style={{transform:"rotate(-90deg)"}}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/>
          <circle cx="100" cy="100" r="88" fill="none" stroke={arcColor} strokeWidth="8"
            strokeDasharray={2*Math.PI*88} strokeDashoffset={2*Math.PI*88*(1-pct/100)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 0.5s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <p style={{fontFamily:"DM Mono",fontSize:48,fontWeight:700,color:gymSec<30&&gymSec>0?"#ef4444":gymAutoAdv?"#10b981":"#f8fafc",lineHeight:1}}>
            {gymAutoAdv?"✓":fmt(gymSec)}
          </p>
          <p style={{fontSize:12,color:"#64748b",marginTop:4}}>{ex.sesMin?ex.sesMin+" min":ex.dur?ex.dur+" min":"sin límite"}</p>
        </div>
      </div>
      {/* Controles */}
      <div style={{display:"flex",gap:16,marginBottom:24,alignItems:"center"}}>
        <button onClick={()=>gymPrevEx(s,exs)} disabled={gymIdx===0} style={{width:56,height:56,borderRadius:28,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"#fff",fontSize:22,cursor:"pointer",opacity:gymIdx===0?.3:1}}>‹</button>
        <button onClick={()=>{setGymRunning(r=>!r);setGymAutoAdv(false);}}
          style={{width:80,height:80,borderRadius:40,border:"none",
            background:gymRunning?"#10b981":gymAutoAdv?"#10b981":"rgba(249,115,22,.9)",
            color:"#fff",fontSize:28,cursor:"pointer",
            boxShadow:`0 0 30px ${gymRunning?"rgba(16,185,129,.5)":"rgba(249,115,22,.4)"}`,
            transition:"background .3s,box-shadow .3s"}}>
          {gymRunning?"⏸":"▶"}
        </button>
        <button onClick={()=>gymNextEx(s,exs)} disabled={gymIdx>=exs.length-1} style={{width:56,height:56,borderRadius:28,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"#fff",fontSize:22,cursor:"pointer",opacity:gymIdx>=exs.length-1?.3:1}}>›</button>
      </div>
      {/* Siguiente */}
      {gymIdx<exs.length-1&&<div style={{padding:"10px 24px",borderRadius:10,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.04)"}}>
        <p style={{fontSize:11,color:"#64748b",textAlign:"center",marginBottom:2}}>Siguiente</p>
        <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#94a3b8"}}>{exs[gymIdx+1]?.name||"Ejercicio libre"}</p>
      </div>}
      {exDesc&&<p style={{fontSize:13,color:"#475569",marginTop:20,maxWidth:400,textAlign:"center",lineHeight:1.6}}>{exDesc}</p>}
    </div>;
  }

  const saveSession=s=>{
    if(editSes?.id){
      // Editar sesión existente
      setSessions(prev=>prev.map(x=>x.id===s.id?s:x));
      setEditSes(null);
    } else {
      // Nueva sesión (o desde plantilla)
      const newId=Date.now();
      setSessions(prev=>[...prev,{...s,id:newId}]);
      setShowAdd(false);setEditSes(null);
    }
  };

  const loadTemplate=tpl=>{
    setShowAdd(true);setShowTemplates(false);
    // SesionForm will handle it via editSes=null with pre-filled values
    // We pass it as a "template" session (no id)
    setEditSes({...tpl,id:null,date:"",title:tpl.title});
  };
  const doSaveTemplate=sid=>{
    if(!tplName.trim())return;
    const s=sessions.find(x=>x.id===sid);if(!s)return;
    setSesionTemplates(prev=>[...prev,{
      id:Date.now(),name:tplName.trim(),
      type:s.type,dur:s.dur,title:s.title,
      exs:[],// deprecated, now all in exObjs
      exObjs:(s.exObjs||[]).map(e=>({...e,sesNotes:"",sesMin:e.sesMin||e.dur||""})),
      notes:s.notes||"",images:[],
    }]);
    setSaveAsTemplate(null);setTplName("");
  };
  const delTemplate=id=>setSesionTemplates(prev=>prev.filter(t=>t.id!==id));

  const exportPDF=s=>{
    const w=window.open("","_blank");
    const exObjsHtml=(s.exObjs||[]).map(ex=>{
      const imgsH=(ex.images||[]).length?'<div class="exobj-imgs">'+ex.images.map(img=>'<img src="'+img+'" class="exobj-img"/>').join("")+"</div>":"";
      return '<div class="exobj">'
        +'<div class="exobj-header">'
        +'<span class="exobj-name">'+ex.name+'</span>'
        +(ex.dur?'<span class="exobj-dur">'+ex.dur+'</span>':"")
        +'<span class="exobj-badge">'+ex.cat+'</span>'
        +'</div>'
        +(ex.desc?'<p class="exobj-desc">'+ex.desc+'</p>':"")
        +imgsH+'</div>';
    }).join("");
    const exsHtml=(s.exs||[]).map((e,i)=>'<div class="item"><div class="item-dot"></div><div class="item-text"><strong>'+(i+1)+'.</strong> '+e+'</div></div>').join("");
    const imgsHtml=(s.images||[]).length?'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'+s.images.map(img=>'<img src="'+img+'" style="height:120px;border-radius:8px;object-fit:cover;border:1px solid #e2e8f0"/>').join("")+"</div>":"";
    const timeStr=s.time?" · "+s.time+"h":"";
    w.document.write(pdfOpen("Sesión: "+s.title)
      +pdfHeader(s.title,s.date+timeStr+" · "+s.dur+" min · "+s.type)
      +'<style>.exobj{margin-bottom:14px;padding:12px;border-left:3px solid #1d4ed8;background:#f8fafc;border-radius:0 8px 8px 0;page-break-inside:avoid}'
      +'.exobj-header{display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap}'
      +'.exobj-name{font-weight:700;font-size:14px;color:#1e293b}'
      +'.exobj-dur{font-size:11px;color:#f97316;font-weight:700;background:#fff7ed;padding:1px 7px;border-radius:4px}'
      +'.exobj-badge{font-size:10px;font-weight:700;padding:1px 7px;border-radius:4px;background:#dbeafe;color:#1d4ed8;text-transform:uppercase}'
      +'.exobj-desc{font-size:12px;color:#475569;line-height:1.6;margin-bottom:5px}'
      +'.exobj-imgs{display:flex;gap:6px;flex-wrap:wrap}'
      +'.exobj-img{height:90px;border-radius:6px;object-fit:cover;border:1px solid #e2e8f0}</style>'
      +(s.notes?'<div class="section"><div class="section-title">Notas y objetivos</div><div class="section-body"><p>'+s.notes+'</p></div></div>':"")
      +(exObjsHtml?'<div class="section"><div class="section-title">Ejercicios del catálogo</div>'+exObjsHtml+'</div>':"")
      +(exsHtml?'<div class="section"><div class="section-title">Ejercicios adicionales</div><div class="section-body">'+exsHtml+'</div></div>':"")
      +(imgsHtml?'<div class="section"><div class="section-title">Imágenes de la sesión</div>'+imgsHtml+'</div>':"")
      +pdfClose()
    );
    w.document.close();setTimeout(()=>w.print(),400);
  };

  return <div>
    {viewEx&&<EjercicioModal ex={viewEx} onClose={()=>setViewEx(null)}/>}
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8}}/></div>}

    <SH title="Entrenamientos" sub="Sesiones · Ejercicios · Notas · PDF" right={<div style={{display:"flex",gap:8}}>
      <Btn onClick={()=>setShowTemplates(!showTemplates)} variant="ghost" icon={<Copy size={14}/>} sm>Plantillas {sesionTemplates.length>0&&`(${sesionTemplates.length})`}</Btn>
      <Btn onClick={()=>{setShowAdd(true);setEditSes(null);setShowTemplates(false);}} icon={<Plus size={14}/>}>Nueva Sesión</Btn>
    </div>}/>

    {/* Plantillas */}
    {showTemplates&&<div className="card" style={{padding:18,marginBottom:14,borderColor:"rgba(139,92,246,.3)"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#8b5cf6",marginBottom:12,textTransform:"uppercase"}}>Plantillas guardadas</p>
      {sesionTemplates.length===0?<p style={{fontSize:12,color:th.muted}}>Aún no tienes plantillas. Guarda una sesión como plantilla para reutilizarla.</p>:(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {sesionTemplates.map(t=>{const c=TC[t.type]||"#f97316";return <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:th.card2,borderRadius:8,border:`1px solid ${th.border}`}}>
            <div style={{flex:1}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:th.text}}>{t.name}</p>
              <p style={{fontSize:11,color:th.muted}}><Badge color={c} sm>{t.type}</Badge> · {t.dur}' · {t.title}</p>
            </div>
            <Btn onClick={()=>loadTemplate(t)} sm>Usar</Btn>
            <Trash2 size={13} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>delTemplate(t.id)}/>
          </div>;})}
        </div>
      )}
    </div>}

    {/* Formulario nueva sesión */}
    {showAdd&&!editSes&&<SesionForm ejercicios={ejercicios} onSave={saveSession} onCancel={()=>setShowAdd(false)}/>}
    {/* Cargar desde plantilla (editSes sin id) */}
    {showAdd&&editSes&&!editSes.id&&<SesionForm session={{...editSes,id:null}} ejercicios={ejercicios} onSave={saveSession} onCancel={()=>{setShowAdd(false);setEditSes(null);}}/>}

    {/* Lista sesiones */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sessions.length===0&&<div className="card" style={{padding:48,textAlign:"center"}}><Dumbbell size={36} color={th.muted} style={{margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted}}>Sin sesiones registradas</p></div>}
      {[...sessions].sort((a,b)=>b.date.localeCompare(a.date)).map(s=>{
        const c=TC[s.type]||"#f97316";const op=exp===s.id;const isEditing=editSes?.id===s.id;

        if(isEditing)return <SesionForm key={s.id} session={s} ejercicios={ejercicios} onSave={s2=>{saveSession(s2);setExp(s.id);}} onCancel={()=>setEditSes(null)}/>;

        return <div key={s.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:12}}>
          {/* Cabecera */}
          <div style={{padding:"14px 18px",display:"flex",alignItems:"center",cursor:"pointer"}} onClick={()=>setExp(op?null:s.id)}>
            <div style={{minWidth:64,textAlign:"center",flexShrink:0}}>
              <p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{s.date}</p>
              {s.time&&<p style={{fontFamily:"DM Mono",fontSize:10,color:c,fontWeight:600}}>{s.time}h</p>}
              <p style={{fontFamily:"DM Mono",fontSize:13,color:c,fontWeight:700}}>{s.dur}'</p>
            </div>
            <div style={{flex:1,marginLeft:12}}>
              <h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:4}}>{s.title}</h4>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                <Badge color={c}>{s.type}</Badge>
                {(s.exObjs||[]).length>0&&<Badge color="#3b82f6" sm>{s.exObjs.length} ejerc.</Badge>}
                {s.notes&&<span style={{fontSize:10,color:th.muted}}>📝</span>}
                {(s.images||[]).length>0&&<span style={{fontSize:10,color:th.muted}}>🖼️ {s.images.length}</span>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
              <button onClick={()=>setEditSes(s)} title="Editar" style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={13}/></button>
              <button onClick={()=>setSaveAsTemplate(s.id)} title="Guardar como plantilla" style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#8b5cf6"}}><Copy size={13}/></button>
              <button onClick={()=>exportPDF(s)} title="PDF" style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Printer size={13}/></button>
              {(s.exObjs||[]).length>0&&<button onClick={()=>startGym(s)} title="Modo Gimnasio" style={{display:"flex",alignItems:"center",gap:5,padding:"0 10px",height:30,borderRadius:7,border:"1px solid rgba(16,185,129,.4)",background:"rgba(16,185,129,.1)",cursor:"pointer",color:"#10b981",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:12}}>▶ Gimnasio {getGymExs(s).length>0?"("+getGymExs(s).length+"ex)":""}</button>}
              <Trash2 size={13} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>setSessions(p=>p.filter(x=>x.id!==s.id))}/>
              <ChevronRight size={14} color={th.muted} style={{transform:op?"rotate(90deg)":"none",transition:"transform .2s"}}/>
            </div>
          </div>

          {/* Guardar plantilla */}
          {saveAsTemplate===s.id&&<div style={{padding:"10px 18px",borderTop:`1px solid ${th.border}`,display:"flex",gap:8,alignItems:"center"}}>
            <input value={tplName} onChange={e=>setTplName(e.target.value)} placeholder="Nombre de la plantilla…" style={{flex:1}}/>
            <Btn onClick={()=>doSaveTemplate(s.id)} sm>Guardar</Btn>
            <Btn onClick={()=>setSaveAsTemplate(null)} variant="ghost" sm>Cancelar</Btn>
          </div>}

          {/* Detalle expandido */}
          {op&&<div style={{padding:"0 18px 18px",borderTop:`1px solid ${th.border}`,marginTop:0,paddingTop:14}}>
            {/* Notas */}
            {s.notes&&<div style={{background:c+"0f",borderLeft:`3px solid ${c}`,padding:"8px 12px",borderRadius:4,marginBottom:12,fontSize:12,color:th.sub,lineHeight:1.6}}>
              <strong style={{color:c,fontFamily:"Barlow Condensed",fontSize:12}}>NOTAS</strong><br/>{s.notes}
            </div>}

            {/* Imágenes */}
            {(s.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {s.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{height:70,borderRadius:7,objectFit:"cover",cursor:"pointer",border:`1px solid ${th.border}`}}/>)}
            </div>}

            {/* Ejercicios del catálogo — clicables */}
            {(s.exObjs||[]).length>0&&<div style={{marginBottom:12}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:6}}>Ejercicios del catálogo</p>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {s.exObjs.map((ex,idx)=>{const ec=CC[ex.cat]||"#f97316";const min=ex.sesMin||ex.dur||null;return <div key={ex.id}
                  style={{display:"grid",gridTemplateColumns:"52px 1fr",gap:8,padding:"8px 10px",background:th.card2,borderRadius:8,border:`1px solid ${ec}30`}}>
                  {/* Tiempo */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:ec+"12",borderRadius:6,padding:"4px 0",cursor:"default"}}>
                    <p style={{fontFamily:"DM Mono",fontSize:20,fontWeight:700,color:ec,lineHeight:1}}>{min||"—"}</p>
                    <p style={{fontSize:8,color:ec,opacity:.7,textTransform:"uppercase",letterSpacing:.5}}>min</p>
                  </div>
                  {/* Info */}
                  <div style={{minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:ex.sesNotes?4:0,cursor:"pointer"}} onClick={()=>setViewEx(ex)}>
                      {(ex.images||[]).length>0&&<img src={ex.images[0]} alt="" style={{width:26,height:26,objectFit:"cover",borderRadius:4,flexShrink:0}}/>}
                      <div>
                        <p style={{fontSize:13,color:th.text,fontWeight:700,fontFamily:"Barlow Condensed"}}>{ex.name}</p>
                        <p style={{fontSize:10,color:ec}}>{ex.cat}{ex.diff?` · ${ex.diff}`:""}</p>
                      </div>
                    </div>
                    {ex.sesNotes&&<p style={{fontSize:11,color:th.sub,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{ex.sesNotes}</p>}
                  </div>
                </div>;})}
              </div>
            </div>}

            {/* Ejercicios libres — soporta formato "min | descripción" */}
            {(s.exs||[]).length>0&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:.8,marginBottom:4}}>Ejercicios adicionales</p>
              {s.exs.map((ex,i)=>{
                const hasPipe=ex.includes("|");
                const min=hasPipe?ex.split("|")[0].trim():"";
                const desc=hasPipe?ex.split("|").slice(1).join("|").trim():ex;
                return <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                  {hasPipe
                    ?<div style={{minWidth:44,background:"rgba(249,115,22,.08)",borderRadius:6,padding:"3px 6px",textAlign:"center",flexShrink:0}}>
                        <p style={{fontFamily:"DM Mono",fontSize:14,fontWeight:700,color:c,lineHeight:1}}>{min}</p>
                        <p style={{fontSize:8,color:c,opacity:.7}}>min</p>
                      </div>
                    :<div style={{width:22,height:22,borderRadius:11,background:c+"18",border:`1px solid ${c}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}><span style={{fontFamily:"DM Mono",fontSize:9,color:c}}>{i+1}</span></div>}
                  <span style={{fontSize:13,color:th.sub,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{desc}</span>
                </div>;
              })}
            </div>}
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   7. ASISTENCIA — Todo el año, Mar+Mié+Jue+Vie, paginación mensual
══════════════════════════════════════════════════════════ */
function Asistencia(){
  const{th}=useTheme();const{players,attDates,setAttDates}=useData();
  const today=new Date();
  const[monthIdx,setMonthIdx]=useState(()=>{
    const start=new Date(SEASON_START);
    return Math.max(0,(today.getFullYear()-start.getFullYear())*12+(today.getMonth()-start.getMonth()));
  });
  const startMonth=new Date(SEASON_START.getFullYear(),SEASON_START.getMonth(),1);
  const endMonth=new Date(SEASON_END.getFullYear(),SEASON_END.getMonth(),1);
  const totalMonths=Math.floor((endMonth-startMonth)/(30.44*24*3600*1000))+1;

  const curMonthDate=new Date(startMonth.getFullYear(),startMonth.getMonth()+monthIdx,1);
  const curMonthDates=ALL_TRAINING_DATES.filter(d=>{const dt=new Date(d);return dt.getFullYear()===curMonthDate.getFullYear()&&dt.getMonth()===curMonthDate.getMonth();});

  const toggle=(date,pid)=>setAttDates(prev=>{const c=prev[date]||[];return{...prev,[date]:c.includes(pid)?c.filter(id=>id!==pid):[...c,pid]};});
  const rate=pid=>{const withData=ALL_TRAINING_DATES.filter(d=>attDates[d]!==undefined);return withData.length?Math.round(withData.filter(d=>(attDates[d]||[]).includes(pid)).length/withData.length*100):0;};

  const monthName=curMonthDate.toLocaleDateString("es",{month:"long",year:"numeric"});
  const allPresent=pid=>curMonthDates.every(d=>(attDates[d]||[]).includes(pid));
  const toggleAll=pid=>{
    if(allPresent(pid)){setAttDates(prev=>{const n={...prev};curMonthDates.forEach(d=>{n[d]=(n[d]||[]).filter(id=>id!==pid);});return n;});}
    else{setAttDates(prev=>{const n={...prev};curMonthDates.forEach(d=>{if(!(n[d]||[]).includes(pid))n[d]=[...(n[d]||[]),pid];});return n;});}
  };

  return <div>
    <SH title="Asistencia" sub="Control de presencia · Mar · Mié · Jue · Vie"/>
    {/* Month navigation */}
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <button onClick={()=>setMonthIdx(m=>Math.max(0,m-1))} disabled={monthIdx===0} style={{width:34,height:34,borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub,opacity:monthIdx===0?.35:1}}><ChevronLeft size={16}/></button>
      <p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text,textTransform:"capitalize",flex:1,textAlign:"center"}}>{monthName}</p>
      <button onClick={()=>setMonthIdx(m=>Math.min(totalMonths-1,m+1))} disabled={monthIdx>=totalMonths-1} style={{width:34,height:34,borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub,opacity:monthIdx>=totalMonths-1?.35:1}}><ChevronRight size={16}/></button>
    </div>
    {curMonthDates.length===0?<div className="card" style={{padding:32,textAlign:"center"}}><p style={{color:th.muted}}>No hay días de entrenamiento en este mes</p></div>:
    <div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
        <thead><tr style={{background:th.tableHead}}>
          <th style={{padding:"10px 14px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,position:"sticky",left:0,background:th.tableHead,minWidth:170,zIndex:1}}>Jugador</th>
          {curMonthDates.map(d=>{const dt=new Date(d+"T12:00:00");const dow=TRAIN_DAY_NAMES[dt.getDay()]||"?";return <th key={d} style={{padding:"10px 8px",textAlign:"center",minWidth:52}}>
            <span style={{display:"block",fontFamily:"DM Mono",fontSize:9,color:th.muted}}>{dow}</span>
            <span style={{display:"block",fontFamily:"DM Mono",fontSize:10,color:th.accent,fontWeight:600}}>{dt.getDate()}</span>
          </th>;})}
          <th style={{padding:"10px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,minWidth:80}}>Total</th>
        </tr></thead>
        <tbody>{players.map(p=>{const r=rate(p.id);const rc=r>=80?"#10b981":r>=60?"#f59e0b":"#ef4444";return <tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`}}>
          <td style={{padding:"8px 14px",position:"sticky",left:0,background:th.card,zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:26,height:26,borderRadius:13,background:th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,color:th.sub,fontWeight:700,flexShrink:0}}>{p.num}</div>
              <span style={{fontSize:12,color:p.active?th.text:th.muted,cursor:"pointer"}} onClick={()=>toggleAll(p.id)} title="Clic para marcar/desmarcar todos">{p.name.split(" ")[0]} {p.name.split(" ")[1]||""}</span>
              {!p.active&&<Badge color="#ef4444" sm>Baja</Badge>}
            </div>
          </td>
          {curMonthDates.map(d=>{const pr=(attDates[d]||[]).includes(p.id);return <td key={d} style={{padding:"8px 8px",textAlign:"center"}}>
            <div onClick={()=>toggle(d,p.id)} style={{width:26,height:26,borderRadius:6,cursor:"pointer",margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",background:pr?"#10b981":"transparent",border:`1px solid ${pr?"#10b981":th.border2}`,transition:"all .15s"}}>
              {pr?<Check size={12} color="#fff"/>:<span style={{fontSize:11,color:th.border2}}>–</span>}
            </div>
          </td>;})}
          <td style={{padding:"8px 10px",textAlign:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{flex:1,height:4,background:th.border2,borderRadius:2,overflow:"hidden"}}><div style={{width:`${r}%`,height:"100%",background:rc,borderRadius:2}}/></div>
              <span style={{fontFamily:"DM Mono",fontSize:10,color:rc,minWidth:28,fontWeight:600}}>{r}%</span>
            </div>
          </td>
        </tr>;})}
        </tbody>
      </table>
    </div>}
    <p style={{fontSize:11,color:th.muted,marginTop:8}}>💡 Haz clic en el nombre para marcar/desmarcar todos los días del mes</p>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   8. QUINTETO — 5 configuraciones + IA
══════════════════════════════════════════════════════════ */
function Quinteto(){
  const{th}=useTheme();const{players,quintets,setQuintets,apiKey}=useData();
  const[activeQ,setActiveQ]=useState(0);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiResult,setAiResult]=useState(null);
  const[selected,setSelected]=useState(null);
  const[editName,setEditName]=useState(false);
  const[nameVal,setNameVal]=useState("");

  const q=quintets[activeQ]||DEFAULT_QUINTETS[0];
  const lineup=q.lineup||{};

  const setLineup=newLineup=>{
    setQuintets(prev=>prev.map((qt,i)=>i===activeQ?{...qt,lineup:newLineup}:qt));
  };
  const onSpot=id=>setSelected(s=>s===id?null:id);
  const assign=player=>{
    if(!selected)return;
    const n={...lineup};
    Object.keys(n).forEach(k=>{if(n[k]?.id===player.id)delete n[k];});
    n[selected]=player;
    setLineup(n);setSelected(null);
  };
  const si=CS.find(s=>s.id===selected);

  const saveQuintetName=()=>{
    setQuintets(prev=>prev.map((qt,i)=>i===activeQ?{...qt,name:nameVal}:qt));
    setEditName(false);
  };

  const generateAIQuintets=async()=>{
    if(!apiKey){setAiResult({error:"Introduce tu API Key de Anthropic en ⚙️ Ajustes (sidebar inferior)."});return;}
    setAiLoading(true);setAiResult(null);
    const activePl=players.filter(p=>p.active&&!p.lesionado&&(p.equipo||"A")!=="B"&&(p.pj||0)>0);
    if(activePl.length<5){setAiResult({error:"Necesitas al menos 5 jugadores con PJ > 0 para generar quintetos."});setAiLoading(false);return;}
    const statsStr=activePl.map(p=>{const c=calcStats(p);return `${p.name} (${p.pos}): PJ ${p.pj}, PTS/P ${c.pts_p}, Min/P ${c.min_p}', TL% ${c.tl_pct}%, T2% ${c.t2_pct}%, T3% ${c.t3_pct}%, FC/P ${c.fc_p}`;}).join("\n");
    try{
      const data=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:900,messages:[{role:"user",content:`Eres analista de baloncesto. Jugadores CB Binissalem:\n\n${statsStr}\n\nSugiere 2 quintetos basándote SOLO en estos datos:\n1. OFENSIVO: mayores PTS/P, T2%, T3%, Min/P\n2. DEFENSIVO: equilibrio posicional, FC/P bajo, al menos 1 pívot\n\nResponde SOLO JSON sin texto extra:\n{"ofensivo":["nombre 1","nombre 2","nombre 3","nombre 4","nombre 5"],"defensivo":["nombre 1","nombre 2","nombre 3","nombre 4","nombre 5"],"razon_ofensivo":"15 palabras max","razon_defensivo":"15 palabras max"}`}]});
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      setAiResult(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    }catch(e){console.error(e);setAiResult({error:`Error: ${e.message}. Verifica tu API Key.`});}
    setAiLoading(false);
  };

  return <div>
    <SH title="Quinteto" sub="Hasta 5 configuraciones · Sugerencias por IA"/>
    {/* Quintet tabs */}
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {quintets.map((qt,i)=><button key={qt.id} onClick={()=>setActiveQ(i)} style={{padding:"7px 16px",borderRadius:8,border:`1px solid ${activeQ===i?"#f97316":th.border2}`,background:activeQ===i?"rgba(249,115,22,.1)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:13,fontWeight:activeQ===i?700:500,color:activeQ===i?"#f97316":th.sub,transition:"all .15s"}}>{qt.name}</button>)}
      <Btn onClick={generateAIQuintets} disabled={aiLoading} variant="ghost" sm icon={aiLoading?<Loader size={12} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={12}/>}>
        {aiLoading?"Generando…":"Sugerencia IA"}
      </Btn>
    </div>

    {/* AI Result */}
    {aiResult&&<div className="card" style={{padding:18,marginBottom:16,borderColor:"rgba(139,92,246,.3)"}}>
      {aiResult.error?<p style={{color:"#ef4444",fontSize:13}}>{aiResult.error}</p>:<>
        <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#8b5cf6",textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Sugerencias IA</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[{key:"ofensivo",label:"⚡ Ofensivo",color:"#f97316",razon:"razon_ofensivo"},{key:"defensivo",label:"🛡 Defensivo",color:"#3b82f6",razon:"razon_defensivo"}].map(({key,label,color,razon})=><div key={key} style={{background:color+"0d",border:`1px solid ${color}30`,borderRadius:10,padding:14}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color,marginBottom:8}}>{label}</p>
            {(aiResult[key]||[]).map((n,i)=><p key={i} style={{fontSize:12,color:th.text,marginBottom:4}}>• {n}</p>)}
            {aiResult[razon]&&<p style={{fontSize:11,color:th.muted,marginTop:8,fontStyle:"italic"}}>{aiResult[razon]}</p>}
          </div>)}
        </div>
      </>}
      <button onClick={()=>setAiResult(null)} style={{marginTop:10,background:"transparent",border:"none",color:th.muted,cursor:"pointer",fontSize:11}}>Cerrar</button>
    </div>}

    {/* Court + roster */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 270px",gap:20}}>
      <div className="card" style={{padding:22,display:"flex",flexDirection:"column",alignItems:"center"}}>
        {/* Quintet name edit */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          {editName?<>
            <input value={nameVal} onChange={e=>setNameVal(e.target.value)} style={{width:160,fontSize:13}}/>
            <Btn onClick={saveQuintetName} sm>Guardar</Btn>
            <Btn onClick={()=>setEditName(false)} variant="ghost" sm>✗</Btn>
          </>:<>
            <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:th.text}}>{q.name}</p>
            <button onClick={()=>{setNameVal(q.name);setEditName(true);}} style={{background:"transparent",border:"none",cursor:"pointer",color:th.muted}}><Edit2 size={13}/></button>
          </>}
        </div>
        <div style={{marginBottom:12,padding:"8px 16px",borderRadius:8,background:selected?"rgba(249,115,22,.1)":th.card2,border:`1px solid ${selected?"#f97316":th.border}`,transition:"all .2s",width:"100%",textAlign:"center"}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:13,color:selected?"#f97316":th.muted,fontWeight:700}}>{selected?`▶ Asigna jugador: ${si?.name}`:"Toca una posición en la cancha"}</p>
        </div>
        <svg viewBox="0 0 400 365" style={{width:"100%",display:"block"}}>
          <defs><linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c8841a"/><stop offset="100%" stopColor="#b06610"/></linearGradient></defs>
          <rect width="400" height="365" rx="6" fill="url(#wg2)"/><rect x="6" y="6" width="388" height="353" rx="4" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.2"/><rect x="136" y="196" width="128" height="155" fill="rgba(0,0,0,.12)" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><path d="M 145 196 A 55 22 0 0 0 255 196" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><rect x="178" y="346" width="44" height="6" rx="1" fill="rgba(255,255,255,.92)"/><ellipse cx="200" cy="344" rx="13" ry="6" fill="none" stroke="#ff6b00" strokeWidth="3"/><path d="M 22 238 C 22 95 378 95 378 238" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><line x1="22" y1="353" x2="22" y2="238" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><line x1="378" y1="353" x2="378" y2="238" stroke="rgba(255,255,255,.8)" strokeWidth="2"/>
          {CS.map(sp=>{const pl=lineup[sp.id];const is=selected===sp.id;return <g key={sp.id} onClick={()=>onSpot(sp.id)} style={{cursor:"pointer"}}><circle cx={sp.x} cy={sp.y} r="23" fill={pl?"#f97316":is?"rgba(249,115,22,.4)":"rgba(8,8,18,.65)"} stroke={pl||is?"#f97316":"rgba(255,255,255,.5)"} strokeWidth={is?2.5:1.8}/>{pl?<><text x={sp.x} y={sp.y-3} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="'Barlow Condensed',sans-serif">{pl.num}</text><text x={sp.x} y={sp.y+12} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.85)" fontSize="8.5" fontFamily="sans-serif">{pl.name.split(" ")[0].slice(0,9)}</text></>:<text x={sp.x} y={sp.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.55)" fontSize="13" fontWeight="bold" fontFamily="'Barlow Condensed',sans-serif">{sp.abbr}</text>}</g>;})}
        </svg>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div className="card" style={{padding:16}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Quinteto Actual</p>
          {CS.map(sp=>{const pl=lineup[sp.id];return <div key={sp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${th.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><Badge color={selected===sp.id?"#f97316":"#64748b"} sm>{sp.abbr}</Badge><span style={{fontSize:12,color:pl?th.text:th.muted}}>{pl?pl.name:"—"}</span></div>
            {pl&&<X size={12} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>{const n={...lineup};delete n[sp.id];setLineup(n);}}/>}
          </div>;})}
          {Object.keys(lineup).length>0&&<button onClick={()=>setLineup({})} style={{marginTop:8,width:"100%",padding:"5px",borderRadius:6,border:`1px solid ${th.border2}`,background:"transparent",color:"#ef4444",cursor:"pointer",fontSize:11,fontFamily:"Barlow Condensed"}}>Limpiar quinteto</button>}
        </div>
        <div className="card" style={{padding:16,flex:1}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Plantilla disponible</p>
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:280,overflowY:"auto"}}>
            {players.filter(p=>p.active).map(p=>{
              const a2=Object.values(lineup).some(l=>l?.id===p.id);
              const isLes=p.lesionado;
              const equipoColor={A:"#f97316",B:"#3b82f6",Convocado:"#8b5cf6"}[p.equipo||"A"];
              return <div key={p.id} onClick={()=>!a2&&!isLes&&selected&&assign(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:a2?"rgba(16,185,129,.07)":isLes?"rgba(245,158,11,.05)":th.card2,border:`1px solid ${a2?"rgba(16,185,129,.3)":isLes?"rgba(245,158,11,.3)":th.border}`,cursor:selected&&!a2&&!isLes?"pointer":"default",opacity:a2||isLes?.5:1,transition:"all .15s"}}>
                <div style={{width:24,height:24,borderRadius:12,background:isLes?"#f59e0b":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,color:"#fff",fontWeight:700,flexShrink:0}}>{p.num}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:12,color:isLes?th.muted:th.text}}>{p.name}</p>
                  <p style={{fontSize:10,color:th.muted}}>{p.pos} · <span style={{color:equipoColor,fontWeight:700}}>{p.equipo||"A"}</span>{isLes&&<span style={{color:"#f59e0b"}}> · Lesión</span>}</p>
                </div>
                {a2&&<Check size={12} color="#10b981"/>}
              </div>;
            })}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   9. PLAYBOOK — con añadir jugadas + imágenes
══════════════════════════════════════════════════════════ */
/* ─ helper: llamada a Claude API con api key ─ */
async function callClaude(apiKey, body){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify(body)
  });
  if(!res.ok){
    if(res.status===429) throw new Error("Límite de requests alcanzado (429). Espera 30 segundos e inténtalo de nuevo.");
    if(res.status===401) throw new Error("API Key incorrecta (401). Revisa la clave en ⚙️ Ajustes.");
    if(res.status===403) throw new Error("Sin permisos (403). Verifica tu plan en console.anthropic.com.");
    throw new Error(`API error ${res.status}`);
  }
  return res.json();
}

/* ── 9. PLAYBOOK ── */
function PlaybookEditForm({play,onSave,onCancel}){
  const{th}=useTheme();
  const cats=["Ataque","Defensa","Especial"];
  const[f,setF]=useState({name:play?.name||"",cat:play?.cat||"Ataque",desc:play?.desc||"",tags:(play?.tags||[]).join(", "),images:play?.images||[]});
  const save=()=>{if(!f.name)return;const tags=f.tags.split(",").map(t=>t.trim()).filter(Boolean);onSave({...(play||{}),id:play?.id||Date.now(),...f,tags});};
  return <div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
    <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>{play?"Editar Jugada":"Nueva Jugada"}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 150px",gap:12,marginBottom:12}}>
      <div><Lbl>Nombre</Lbl><input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Nombre de la jugada"/></div>
      <div><Lbl>Categoría</Lbl><select value={f.cat} onChange={e=>setF(x=>({...x,cat:e.target.value}))}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
    </div>
    <div style={{marginBottom:12}}><Lbl>Descripción</Lbl><textarea rows={3} value={f.desc} onChange={e=>setF(x=>({...x,desc:e.target.value}))} placeholder="Explica cómo funciona la jugada…"/></div>
    <div style={{marginBottom:12}}><Lbl>Etiquetas (separadas por comas)</Lbl><input value={f.tags} onChange={e=>setF(x=>({...x,tags:e.target.value}))} placeholder="Pick & Roll, Bloqueo, Corte…"/></div>
    <div style={{marginBottom:16}}><Lbl>Imágenes (hasta 4)</Lbl><ImageUploader images={f.images} setImages={imgs=>setF(x=>({...x,images:imgs}))}/></div>
    <div style={{display:"flex",gap:8}}><Btn onClick={save}>Guardar</Btn><Btn onClick={onCancel} variant="ghost">Cancelar</Btn></div>
  </div>;
}

function Playbook(){
  const{th}=useTheme();const{plays,setPlays,apiKey}=useData();
  const[filter,setFilter]=useState("Todos");
  const[showAdd,setShowAdd]=useState(false);
  const[editPlay,setEditPlay]=useState(null);
  const[viewImg,setViewImg]=useState(null);
  const[pdfLoading,setPdfLoading]=useState(false);const[pdfMsg,setPdfMsg]=useState(null);
  const cats=["Todos","Ataque","Defensa","Especial"];
  const filtered=filter==="Todos"?plays:plays.filter(p=>p.cat===filter);
  const fr=useRef();

  const savePlay=p=>{
    if(!editPlay){setPlays(prev=>[...prev,{...p,id:Date.now()}]);}
    else{setPlays(prev=>prev.map(x=>x.id===editPlay.id?{...x,...p}:x));}
    setEditPlay(null);setShowAdd(false);
  };
  const delPlay=id=>setPlays(prev=>prev.filter(p=>p.id!==id));

  const[pdfProgress,setPdfProgress]=useState(""); // progress text for multi-pass

  const handlePDF=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(!apiKey){setPdfMsg("❌ Introduce primero tu API Key de Anthropic en Ajustes (⚙️ en el sidebar).");e.target.value="";return;}
    setPdfLoading(true);setPdfMsg("Preparando análisis por bloques…");setPdfProgress("");

    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});

      // Multi-pass: ask for plays in batches by index range
      // Pass 1: jugadas 1-25, Pass 2: 26-50, Pass 3: 51+
      const passes=[
        {label:"Bloque 1/3 (jugadas 1-25)…",   from:1,  to:25},
        {label:"Bloque 2/3 (jugadas 26-50)…",  from:26, to:50},
        {label:"Bloque 3/3 (jugadas 51+)…",    from:51, to:999},
      ];

      const makePrompt=(from,to)=>
        "Analiza este playbook de baloncesto. "
        +"Extrae las jugadas numeradas "+from+" a "+to+" del documento (o las que existan en ese rango). "
        +"Para cada jugada incluye nombre, categoría, descripción completa, variantes y puntos clave. "
        +"Si en el documento no hay numeración explícita, trátalas en orden de aparición. "
        +"Si el rango pedido supera las jugadas existentes, extrae las que queden. "
        +"Devuelve ÚNICAMENTE JSON en una sola línea sin markdown:\n"
        +'{"jugadas":[{"nombre":"nombre","categoria":"Ataque|Defensa|Especial","descripcion":"descripción completa","etiquetas":["tag1"]}]}\n'
        +"Si no hay jugadas en ese rango devuelve: {\"jugadas\":[]}";

      let todas=[];
      for(const pass of passes){
        setPdfProgress(pass.label);
        try{
          const data=await callClaude(apiKey,{
            model:"claude-sonnet-4-20250514",max_tokens:5000,
            messages:[{role:"user",content:[
              {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
              {type:"text",text:makePrompt(pass.from,pass.to)}
            ]}]
          });
          const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
          const jStart=txt.indexOf("{");const jEnd=txt.lastIndexOf("}");
          if(jStart<0||jEnd<0)continue;
          const parsed=JSON.parse(txt.slice(jStart,jEnd+1).replace(/[\r\n]+/g," "));
          const batch=(parsed.jugadas||[]).filter(j=>j.nombre||j.name);
          todas=[...todas,...batch];
          setPdfProgress(pass.label.replace("…","")+" → "+batch.length+" jugadas encontradas");
          // Small delay between passes
          await new Promise(r=>setTimeout(r,800));
        }catch(passErr){
          console.warn("Pass error:",passErr.message);
          // Continue with next pass even if one fails
        }
      }

      // Deduplicate by name (in case passes overlap)
      const seen=new Set();
      const deduped=todas.filter(j=>{
        const key=(j.nombre||j.name||"").toLowerCase().trim();
        if(!key||seen.has(key))return false;
        seen.add(key);return true;
      });

      if(deduped.length===0){
        setPdfMsg("⚠️ No se encontraron jugadas. El PDF puede estar escaneado sin texto seleccionable.");
        setPdfLoading(false);setPdfProgress("");e.target.value="";return;
      }

      const nuevas=deduped.map((j,i)=>({
        id:Date.now()+i,
        name:j.nombre||j.name||`Jugada ${i+1}`,
        cat:j.categoria||j.cat||"Ataque",
        desc:j.descripcion||j.desc||"",
        tags:(j.etiquetas||j.tags||[]).slice(0,6),
        images:[]
      }));
      setPlays(prev=>[...prev,...nuevas]);
      setPdfMsg(`✅ ${nuevas.length} jugada${nuevas.length!==1?"s":""} importada${nuevas.length!==1?"s":""} en 3 pasadas.`);
    }catch(err){
      console.error(err);
      setPdfMsg(`❌ Error: ${err.message?.slice(0,60)||"Inténtalo de nuevo"}.`);
    }
    setPdfLoading(false);setPdfProgress("");e.target.value="";
    setTimeout(()=>setPdfMsg(null),10000);
  };

  return <div>
    <SH title="Playbook" sub="Jugadas y sistemas · Todas editables" right={<div style={{display:"flex",gap:8}}>
      <input ref={fr} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePDF}/>
      <Btn onClick={()=>exportPlaybookPDF(plays,filter)} variant="ghost" icon={<Printer size={14}/>} sm>PDF</Btn>
      <Btn onClick={()=>fr.current?.click()} variant="ghost" icon={pdfLoading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<FileText size={14}/>} disabled={pdfLoading}>
        {pdfLoading?"Analizando…":"Importar PDF"}
      </Btn>
      <Btn onClick={()=>{setShowAdd(true);setEditPlay("new");}} icon={<Plus size={14}/>}>Nueva Jugada</Btn>
    </div>}/>
    {(pdfMsg||pdfProgress)&&<div style={{background:pdfMsg?.startsWith("✅")?"rgba(16,185,129,.07)":pdfMsg?.startsWith("⚠️")?"rgba(245,158,11,.07)":"rgba(239,68,68,.07)",border:`1px solid ${pdfMsg?.startsWith("✅")?"rgba(16,185,129,.3)":pdfMsg?.startsWith("⚠️")?"rgba(245,158,11,.3)":"rgba(239,68,68,.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.text}}>
      {pdfProgress&&!pdfMsg&&<div style={{display:"flex",alignItems:"center",gap:8,color:th.sub}}><Loader size={13} style={{animation:"spin 1s linear infinite",flexShrink:0}}/>{pdfProgress}</div>}
      {pdfMsg&&pdfMsg}
    </div>}
    {(showAdd)&&<PlaybookEditForm play={null} onSave={savePlay} onCancel={()=>setShowAdd(false)}/>}
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(PC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(play=>{
        const c=PC[play.cat]||"#f97316";
        if(editPlay&&editPlay.id===play.id)return <div key={play.id} style={{gridColumn:"1/-1"}}><PlaybookEditForm play={editPlay} onSave={savePlay} onCancel={()=>setEditPlay(null)}/></div>;
        return <div key={play.id} className="card" style={{padding:20,borderTop:`3px solid ${c}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <h3 style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text,flex:1,marginRight:8}}>{play.name}</h3>
            <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              <Badge color={c}>{play.cat}</Badge>
              <button onClick={()=>{setEditPlay(play);setShowAdd(false);}} title="Editar" style={{width:26,height:26,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={11}/></button>
              <button onClick={()=>delPlay(play.id)} title="Eliminar" style={{width:26,height:26,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={11}/></button>
            </div>
          </div>
          <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:12}}>{play.desc}</p>
          {(play.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{play.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{width:60,height:60,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}</div>}
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(play.tags||[]).map(t=><span key={t} style={{fontSize:10,color:th.muted,background:th.card2,padding:"2px 8px",borderRadius:4,border:`1px solid ${th.border}`}}>{t}</span>)}</div>
        </div>;
      })}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   10. EJERCICIOS — con añadir ejercicios + imágenes
══════════════════════════════════════════════════════════ */
/* EjercicioEditForm is defined inside the Ejercicios section below */

function Ejercicios(){
  const{th}=useTheme();const{ejercicios,setEjercicios}=useData();
  const[filter,setFilter]=useState("Todos");const[editEx,setEditEx]=useState(null);const[showAdd,setShowAdd]=useState(false);const[viewImg,setViewImg]=useState(null);
  const cats=["Todos","Técnico","Táctico","Físico","Recuperación","Mental"];
  const filtered=filter==="Todos"?ejercicios:ejercicios.filter(e=>e.cat===filter);

  const saveEx=ex=>{
    if(!editEx){setEjercicios(prev=>[...prev,{...ex,id:Date.now()}]);}
    else{setEjercicios(prev=>prev.map(x=>x.id===editEx.id?{...x,...ex}:x));}
    setEditEx(null);setShowAdd(false);
  };
  const delEx=id=>setEjercicios(prev=>prev.filter(e=>e.id!==id));

  return <div>
    <SH title="Ejercicios" sub="Biblioteca por categoría · Todos editables" right={<div style={{display:"flex",gap:8}}><Btn onClick={()=>exportEjerciciosPDF(ejercicios,filter)} variant="ghost" icon={<Printer size={14}/>} sm>PDF</Btn><Btn onClick={()=>{setShowAdd(true);setEditEx(null);}} icon={<Plus size={14}/>}>Nuevo Ejercicio</Btn></div>}/>
    {showAdd&&<EjercicioEditForm ex={null} onSave={saveEx} onCancel={()=>setShowAdd(false)}/>}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(CC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(ex=>{
        const c=CC[ex.cat]||"#f97316";const dc=DC[ex.diff]||"#10b981";
        // Inline edit — replace card with form
        if(editEx&&editEx.id===ex.id)return <div key={ex.id} style={{gridColumn:"1/-1"}}><EjercicioEditForm ex={editEx} onSave={saveEx} onCancel={()=>setEditEx(null)}/></div>;
        return <div key={ex.id} className="card" style={{padding:20,borderTop:`3px solid ${c}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{flex:1,marginRight:8}}>
              <h3 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:6}}>{ex.name}</h3>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}><Badge color={c} sm>{ex.cat}</Badge><Badge color={dc} sm>{ex.diff}</Badge>{ex.dur&&<Badge color="#3b82f6" sm>{ex.dur}</Badge>}</div>
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <button onClick={()=>{setEditEx(ex);setShowAdd(false);}} title="Editar" style={{width:28,height:28,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={12}/></button>
              <button onClick={()=>delEx(ex.id)} title="Eliminar" style={{width:28,height:28,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={12}/></button>
            </div>
          </div>
          {ex.desc&&<p style={{fontSize:12,color:th.sub,lineHeight:1.6,marginBottom:8}}>{ex.desc}</p>}
          {(ex.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ex.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{width:60,height:60,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

function EjercicioEditForm({ex,onSave,onCancel}){
  const{th}=useTheme();
  const cats=["Técnico","Táctico","Físico","Recuperación","Mental"];
  const diffs=["Básico","Medio","Alto"];
  const[f,setF]=useState({name:ex?.name||"",cat:ex?.cat||"Técnico",dur:ex?.dur||"",diff:ex?.diff||"Básico",desc:ex?.desc||"",images:ex?.images||[]});
  const save=()=>{if(!f.name)return;onSave({...(ex||{}),id:ex?.id||Date.now(),...f});};
  return <div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
    <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>{ex?"Editar Ejercicio":"Nuevo Ejercicio"}</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 130px 100px 80px",gap:12,marginBottom:12}}>
      <div><Lbl>Nombre</Lbl><input value={f.name} onChange={e=>setF(x=>({...x,name:e.target.value}))} placeholder="Nombre del ejercicio"/></div>
      <div><Lbl>Categoría</Lbl><select value={f.cat} onChange={e=>setF(x=>({...x,cat:e.target.value}))}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
      <div><Lbl>Dificultad</Lbl><select value={f.diff} onChange={e=>setF(x=>({...x,diff:e.target.value}))}>{diffs.map(d=><option key={d}>{d}</option>)}</select></div>
      <div><Lbl>Duración</Lbl><input value={f.dur} onChange={e=>setF(x=>({...x,dur:e.target.value}))} placeholder="15'"/></div>
    </div>
    <div style={{marginBottom:12}}><Lbl>Descripción</Lbl><textarea rows={3} value={f.desc} onChange={e=>setF(x=>({...x,desc:e.target.value}))} placeholder="Describe el ejercicio…"/></div>
    <div style={{marginBottom:16}}><Lbl>Imágenes (hasta 4)</Lbl><ImageUploader images={f.images} setImages={imgs=>setF(x=>({...x,images:imgs}))}/></div>
    <div style={{display:"flex",gap:8}}><Btn onClick={save}>Guardar</Btn><Btn onClick={onCancel} variant="ghost">Cancelar</Btn></div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   11. PIZARRA — Guardar jugadas + 4 pasos
══════════════════════════════════════════════════════════ */
const CW=820,CH=500;
function dCourt(ctx){
  const g=ctx.createLinearGradient(0,0,CW,CH);g.addColorStop(0,"#c8841a");g.addColorStop(1,"#b06610");ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
  const W="rgba(255,255,255,.88)",m=14;ctx.strokeStyle=W;ctx.lineWidth=2.5;ctx.strokeRect(m,m,CW-m*2,CH-m*2);ctx.lineWidth=2;
  const CX=CW/2,BL=CH-m,KW=190,KH=235,KX=CX-KW/2,KY=BL-KH;
  ctx.strokeStyle=W;ctx.strokeRect(KX,KY,KW,KH);
  [.28,.54,.78].forEach(r=>{const hy=KY+KH*r;ctx.beginPath();ctx.moveTo(KX,hy);ctx.lineTo(KX-13,hy);ctx.stroke();ctx.beginPath();ctx.moveTo(KX+KW,hy);ctx.lineTo(KX+KW+13,hy);ctx.stroke();});
  const FTR=KW/2;ctx.beginPath();ctx.arc(CX,KY,FTR,Math.PI,0,true);ctx.stroke();
  ctx.setLineDash([9,7]);ctx.beginPath();ctx.arc(CX,KY,FTR,Math.PI,0,false);ctx.stroke();ctx.setLineDash([]);
  const RY=BL-42;ctx.beginPath();ctx.arc(CX,RY,13,0,Math.PI*2);ctx.strokeStyle="#ff6300";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=W;ctx.lineWidth=2;
  ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(CX-38,BL-20);ctx.lineTo(CX+38,BL-20);ctx.stroke();ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(CX,RY,38,Math.PI,0,false);ctx.stroke();
  const C3=m+80;ctx.beginPath();ctx.moveTo(C3,BL);ctx.lineTo(C3,BL-140);ctx.stroke();ctx.beginPath();ctx.moveTo(CW-C3,BL);ctx.lineTo(CW-C3,BL-140);ctx.stroke();
  const dx=CX-C3,dy=RY-(BL-140),R3=Math.round(Math.sqrt(dx*dx+dy*dy));
  const a1=Math.atan2((BL-140)-RY,C3-CX),a2=Math.atan2((BL-140)-RY,(CW-C3)-CX);
  ctx.beginPath();ctx.arc(CX,RY,R3,a1,a2,false);ctx.stroke();
}
function rEl(ctx,el,pv){
  ctx.globalAlpha=pv?.5:1;ctx.lineCap="round";ctx.lineJoin="round";
  if(el.type==="line"||el.type==="dash"||el.type==="arrow"){
    if(el.type==="dash")ctx.setLineDash([14,9]);ctx.strokeStyle=el.color;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(el.x1,el.y1);ctx.lineTo(el.x2,el.y2);ctx.stroke();ctx.setLineDash([]);
    if(el.type==="arrow"){const a=Math.atan2(el.y2-el.y1,el.x2-el.x1);ctx.beginPath();ctx.moveTo(el.x2,el.y2);ctx.lineTo(el.x2-16*Math.cos(a-Math.PI/6),el.y2-16*Math.sin(a-Math.PI/6));ctx.lineTo(el.x2-16*Math.cos(a+Math.PI/6),el.y2-16*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fillStyle=el.color;ctx.fill();}
  }else if(el.type==="player"){
    ctx.beginPath();ctx.arc(el.x,el.y,16,0,Math.PI*2);ctx.fillStyle=el.color;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=2.2;ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold 13px 'Barlow Condensed',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+.5);
  }
  ctx.globalAlpha=1;
}

function Pizarra(){
  const{th}=useTheme();const{savedDrawings,setSavedDrawings}=useData();
  const cr=useRef(null);
  const[tool,setTool]=useState("arrow");
  const[color,setColor]=useState("#f97316");
  const[playerMode,setPlayerMode]=useState("atk"); // "atk" | "def"
  const[atkNum,setAtkNum]=useState(1);
  const[defNum,setDefNum]=useState(1);
  const[step,setStep]=useState(0);
  const[steps,setSteps]=useState([[],[],[],[]]);
  const[hist,setHist]=useState([[],[],[],[]]);
  const dr=useRef(false),or=useRef(null);
  const[showSave,setShowSave]=useState(false);const[saveName,setSaveName]=useState("");
  const[selPlay,setSelPlay]=useState(null);

  const els=steps[step];
  const setEls=fn=>setSteps(prev=>{const n=[...prev];n[step]=typeof fn==="function"?fn(prev[step]):fn;return n;});

  // ── Helpers de dibujo ──────────────────────────────────────
  const drawArrowHead=(ctx,x1,y1,x2,y2,color)=>{
    const a=Math.atan2(y2-y1,x2-x1);const s=16;
    ctx.beginPath();ctx.moveTo(x2,y2);
    ctx.lineTo(x2-s*Math.cos(a-Math.PI/6),y2-s*Math.sin(a-Math.PI/6));
    ctx.lineTo(x2-s*Math.cos(a+Math.PI/6),y2-s*Math.sin(a+Math.PI/6));
    ctx.closePath();ctx.fillStyle=color;ctx.fill();
  };
  const drawWavy=(ctx,x1,y1,x2,y2,color,withArrow)=>{
    const dx=x2-x1,dy=y2-y1;const len=Math.sqrt(dx*dx+dy*dy);
    if(len<2)return;
    const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
    const waves=Math.max(3,Math.floor(len/30));const seg=len/waves;
    ctx.strokeStyle=color;ctx.lineWidth=2.8;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(x1,y1);
    for(let i=0;i<waves;i++){
      const t1=(i+.33)*seg;const t2=(i+.67)*seg;const t3=(i+1)*seg;
      const side=i%2===0?1:-1;const amp=8;
      ctx.bezierCurveTo(
        x1+ux*t1+nx*side*amp, y1+uy*t1+ny*side*amp,
        x1+ux*t2+nx*side*amp, y1+uy*t2+ny*side*amp,
        x1+ux*Math.min(t3,len), y1+uy*Math.min(t3,len)
      );
    }
    ctx.stroke();
    if(withArrow)drawArrowHead(ctx,x1,y1,x2,y2,color);
  };
  const drawCurve=(ctx,x1,y1,x2,y2,color,withArrow,dashed)=>{
    const mx=(x1+x2)/2,my=(y1+y2)/2;
    const dx=x2-x1,dy=y2-y1;
    const cx=mx-dy*0.35,cy=my+dx*0.35;
    if(dashed)ctx.setLineDash([12,8]);
    ctx.strokeStyle=color;ctx.lineWidth=2.8;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);
    ctx.stroke();ctx.setLineDash([]);
    if(withArrow)drawArrowHead(ctx,cx+(x2-cx)*.5,cy+(y2-cy)*.5,x2,y2,color);
  };
  // Bloqueo (Screen) — rectángulo perpendicular a la dirección de llegada
  const drawScreen=(ctx,x1,y1,x2,y2)=>{
    const dx=x2-x1,dy=y2-y1;const len=Math.sqrt(dx*dx+dy*dy)||1;
    const nx=-dy/len,ny=dx/len;const hw=14;
    ctx.strokeStyle="#fff";ctx.lineWidth=3.5;
    ctx.beginPath();
    ctx.moveTo(x2+nx*hw,y2+ny*hw);ctx.lineTo(x2-nx*hw,y2-ny*hw);
    ctx.stroke();
    // Line from x1,y1 to x2,y2
    ctx.strokeStyle="#f59e0b";ctx.lineWidth=2;ctx.setLineDash([8,5]);
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);
    ctx.stroke();ctx.setLineDash([]);
  };
  // Tiro — arco semicircular + línea
  const drawShot=(ctx,x1,y1,x2,y2,color)=>{
    ctx.strokeStyle=color;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    // Arco parabólico simulando trayectoria
    const mx=(x1+x2)/2,my=(y1+y2)/2;
    const dx=x2-x1,dy=y2-y1;
    const cx=mx-dy*0.5,cy=my+dx*0.5-30;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cx,cy,x2,y2);
    ctx.setLineDash([6,5]);ctx.strokeStyle=color+"aa";ctx.lineWidth=2;
    ctx.stroke();ctx.setLineDash([]);
    // Circle at destination (basket area)
    ctx.beginPath();ctx.arc(x2,y2,7,0,Math.PI*2);
    ctx.fillStyle=color+"33";ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();
  };

  const rElCustom=(ctx,el,pv=false)=>{
    ctx.globalAlpha=pv?.4:1;ctx.lineCap="round";ctx.lineJoin="round";
    switch(el.type){
      case"player_atk":
        ctx.beginPath();ctx.arc(el.x,el.y,15,0,Math.PI*2);
        ctx.fillStyle="#f97316";ctx.fill();
        ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle="#fff";ctx.font="bold 13px 'Barlow Condensed',sans-serif";
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+.5);
        break;
      case"player_def":
        ctx.beginPath();ctx.arc(el.x,el.y,15,0,Math.PI*2);
        ctx.fillStyle=th.mode==="dark"?"#1e293b":"#f1f5f9";
        ctx.fill();ctx.strokeStyle="#3b82f6";ctx.lineWidth=2.5;ctx.stroke();
        {const s=7;ctx.strokeStyle="#3b82f6";ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(el.x-s+3,el.y-s+3);ctx.lineTo(el.x+s-3,el.y+s-3);ctx.stroke();
        ctx.beginPath();ctx.moveTo(el.x+s-3,el.y-s+3);ctx.lineTo(el.x-s+3,el.y+s-3);ctx.stroke();
        ctx.fillStyle="#3b82f6";ctx.font="bold 9px 'Barlow Condensed',sans-serif";
        ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+6);}
        break;
      case"arrow": drawCurve(ctx,el.x1,el.y1,el.x2,el.y2,el.color,true,false); break;
      case"curve_arrow": drawCurve(ctx,el.x1,el.y1,el.x2,el.y2,el.color,true,false); break;
      case"line": drawCurve(ctx,el.x1,el.y1,el.x2,el.y2,el.color,false,false); break;
      case"dash": drawCurve(ctx,el.x1,el.y1,el.x2,el.y2,el.color,true,true); break;
      case"wavy": drawWavy(ctx,el.x1,el.y1,el.x2,el.y2,el.color,true); break;
      case"screen": drawScreen(ctx,el.x1,el.y1,el.x2,el.y2); break;
      case"shot": drawShot(ctx,el.x1,el.y1,el.x2,el.y2,el.color); break;
      case"cone":
        {ctx.beginPath();ctx.moveTo(el.x,el.y-12);ctx.lineTo(el.x-10,el.y+10);ctx.lineTo(el.x+10,el.y+10);ctx.closePath();
        ctx.fillStyle="#f59e0b";ctx.fill();ctx.strokeStyle="#d97706";ctx.lineWidth=1.5;ctx.stroke();}break;
      case"ball":
        {ctx.beginPath();ctx.arc(el.x,el.y,9,0,Math.PI*2);ctx.fillStyle="#f97316";ctx.fill();
        ctx.strokeStyle="#ea580c";ctx.lineWidth=1.5;ctx.stroke();
        ctx.strokeStyle="#ea580c90";ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(el.x-9,el.y);ctx.lineTo(el.x+9,el.y);ctx.stroke();
        ctx.beginPath();ctx.arc(el.x,el.y,9,0,Math.PI);ctx.stroke();}break;
      case"ladder":
        {const w=18,h=36,rungs=4;ctx.strokeStyle="#64748b";ctx.lineWidth=2;
        ctx.strokeRect(el.x-w/2,el.y-h/2,w,h);
        for(let i=1;i<rungs;i++){const ry=el.y-h/2+i*(h/rungs);
        ctx.beginPath();ctx.moveTo(el.x-w/2,ry);ctx.lineTo(el.x+w/2,ry);ctx.stroke();}}break;
      default: rEl(ctx,el,false);
    }
    ctx.globalAlpha=1;
  };

  const gp=e=>{const r=cr.current.getBoundingClientRect();return{x:(e.clientX-r.left)*(CW/r.width),y:(e.clientY-r.top)*(CH/r.height)};};
  const rd=useCallback((es,pv=null)=>{const ctx=cr.current?.getContext("2d");if(!ctx)return;ctx.clearRect(0,0,CW,CH);dCourt(ctx);es.forEach(el=>rElCustom(ctx,el,false));if(pv)rElCustom(ctx,pv,true);},[th.mode]);
  useEffect(()=>rd(els),[els,rd,step]);

  const oD=e=>{
    const p=gp(e);
    if(tool==="player"){
      const isAtk=playerMode==="atk";
      const el={type:isAtk?"player_atk":"player_def",x:p.x,y:p.y,num:isAtk?atkNum:defNum};
      setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});
      setEls(ps=>[...ps,el]);
      if(isAtk)setAtkNum(n=>n<5?n+1:1);
      else setDefNum(n=>n<5?n+1:1);
      return;
    }
    if(["cone","ball","ladder"].includes(tool)){
      const el={type:tool,x:p.x,y:p.y};
      setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});
      setEls(ps=>[...ps,el]);
      return;
    }
    or.current=p;dr.current=true;
  };
  const oM=e=>{if(!dr.current||!or.current)return;const p=gp(e);rd(els,{type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color});};
  const oU=e=>{if(!dr.current||!or.current)return;const p=gp(e);if(Math.abs(p.x-or.current.x)>5||Math.abs(p.y-or.current.y)>5){const el={type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color};setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});setEls(ps=>[...ps,el]);}dr.current=false;or.current=null;};
  const undo=()=>{const h=hist[step];if(!h||!h.length)return;const prev=h[h.length-1];setHist(hh=>{const n=[...hh];n[step]=n[step].slice(0,-1);return n;});setEls(prev);};
  const clr=()=>{setHist(hh=>{const n=[...hh];n[step]=[...n[step],els];return n;});setEls([]);};

  const savePlay=()=>{if(!saveName)return;const id=Date.now();setSavedDrawings(prev=>[...prev,{id,name:saveName,steps:steps.map(s=>[...s])}]);setSaveName("");setShowSave(false);};
  const loadPlay=play=>{setSteps(play.steps.map(s=>[...s]));setHist([[],[],[],[]]);setSelPlay(null);};

  const[animating,setAnimating]=useState(false);
  const[animStep,setAnimStep]=useState(0);
  const animRef=useRef(null);
  const[animSpeed,setAnimSpeed]=useState(800);// ms per step

  const playAnimation=()=>{
    if(animating){clearInterval(animRef.current);setAnimating(false);setAnimStep(0);return;}
    const nonEmpty=steps.map((s,i)=>({s,i})).filter(({s})=>s.length>0);
    if(nonEmpty.length<2){alert("Necesitas al menos 2 pasos con elementos para animar");return;}
    setAnimating(true);setAnimStep(0);let cur=0;
    animRef.current=setInterval(()=>{
      cur++;if(cur>=steps.length){clearInterval(animRef.current);setAnimating(false);setAnimStep(0);return;}
      setAnimStep(cur);setStep(cur);
    },animSpeed);
  };
  useEffect(()=>()=>clearInterval(animRef.current),[]);

  const lineTools=[
    {id:"arrow",  label:"Flecha",   icon:"→",  desc:"Movimiento"},
    {id:"dash",   label:"Pase",     icon:"⤑",  desc:"Pase (curvo)"},
    {id:"wavy",   label:"Bote",     icon:"〰",  desc:"Con bote"},
    {id:"line",   label:"Línea",    icon:"—",  desc:"Continua"},
    {id:"screen", label:"Bloqueo",  icon:"⊣",  desc:"Screen/Block"},
    {id:"shot",   label:"Tiro",     icon:"⊙",  desc:"Tiro a canasta"},
  ];
  const equipTools=[
    {id:"cone",   label:"Cono",     icon:"△",  desc:"Cono"},
    {id:"ball",   label:"Balón",    icon:"●",  desc:"Balón"},
    {id:"ladder", label:"Escalera", icon:"⊞",  desc:"Escalera agilidad"},
  ];

  return <div>
    <SH title="Pizarra" sub="Atacantes · Defensores · 4 pasos por jugada · Equipamiento · Animación"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:16}}>
      <div className="card" style={{padding:16}}>
        {/* Pasos + Animar */}
        <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
          <span style={{fontSize:11,color:th.muted,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase",marginRight:4}}>Paso:</span>
          {[0,1,2,3].map(i=><button key={i} onClick={()=>{if(!animating)setStep(i);}} style={{width:32,height:32,borderRadius:8,border:`1px solid ${step===i?"#f97316":th.border2}`,background:step===i?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:14,color:step===i?"#f97316":th.sub,position:"relative"}}>
            {i+1}{steps[i].length>0&&<span style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:4,background:"#f97316"}}/>}
          </button>)}
          {/* Animate */}
          <button onClick={playAnimation} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:`1px solid ${animating?"#ef4444":"rgba(139,92,246,.4)"}`,background:animating?"rgba(239,68,68,.1)":"rgba(139,92,246,.07)",cursor:"pointer",color:animating?"#ef4444":"#8b5cf6",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            {animating?"⏹ Parar":"▶ Animar"}
          </button>
          {!animating&&<select value={animSpeed} onChange={e=>setAnimSpeed(Number(e.target.value))} style={{fontSize:10,padding:"3px 6px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,color:th.sub}}>
            <option value={400}>Rápido</option>
            <option value={800}>Normal</option>
            <option value={1500}>Lento</option>
          </select>}
          <div style={{flex:1}}/>
          <button onClick={()=>{setSaveName("");setShowSave(!showSave);}} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:"1px solid rgba(16,185,129,.4)",background:"rgba(16,185,129,.07)",cursor:"pointer",color:"#10b981",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}><Save size={12}/>Guardar</button>
        </div>
        {showSave&&<div style={{display:"flex",gap:8,marginBottom:12}}>
          <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="Nombre de la jugada…" style={{flex:1}}/>
          <Btn onClick={savePlay} sm>Guardar</Btn><Btn onClick={()=>setShowSave(false)} variant="ghost" sm>✗</Btn>
        </div>}

        {/* Toolbar principal */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>

          {/* Atacante / Defensor */}
          <div style={{display:"flex",gap:0,borderRadius:8,overflow:"hidden",border:`1px solid ${th.border2}`}}>
            <button onClick={()=>{setTool("player");setPlayerMode("atk");}} style={{padding:"6px 12px",border:"none",background:tool==="player"&&playerMode==="atk"?"rgba(249,115,22,.2)":th.card2,cursor:"pointer",display:"flex",alignItems:"center",gap:5,borderRight:`1px solid ${th.border2}`}}>
              <div style={{width:18,height:18,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:10,fontWeight:700,color:"#fff"}}>{atkNum}</div>
              <span style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:12,fontWeight:700,color:tool==="player"&&playerMode==="atk"?"#f97316":th.sub}}>ATK</span>
            </button>
            <button onClick={()=>{setTool("player");setPlayerMode("def");}} style={{padding:"6px 12px",border:"none",background:tool==="player"&&playerMode==="def"?"rgba(59,130,246,.2)":th.card2,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:18,height:18,borderRadius:9,background:"transparent",border:"2px solid #3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:9,fontWeight:700,color:"#3b82f6"}}>✕</div>
              <span style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:12,fontWeight:700,color:tool==="player"&&playerMode==="def"?"#3b82f6":th.sub}}>DEF</span>
            </button>
          </div>

          {/* Reset counters */}
          {tool==="player"&&<button onClick={()=>{setAtkNum(1);setDefNum(1);}} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:10,color:th.muted,fontFamily:"Barlow Condensed,sans-serif"}}>Reset 1-5</button>}

          <div style={{width:1,height:26,background:th.border2}}/>

          {/* Líneas */}
          {lineTools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} title={t.label} style={{height:32,padding:"0 10px",borderRadius:8,border:`1px solid ${tool===t.id?"#f97316":th.border2}`,background:tool===t.id?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontSize:14,color:tool===t.id?"#f97316":th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t.icon}</button>)}

          <div style={{width:1,height:26,background:th.border2}}/>

          {/* Equipamiento */}
          {equipTools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} title={t.label} style={{height:32,padding:"0 10px",borderRadius:8,border:`1px solid ${tool===t.id?"#f59e0b":th.border2}`,background:tool===t.id?"rgba(245,158,11,.15)":th.card2,cursor:"pointer",fontSize:14,color:tool===t.id?"#f59e0b":th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t.icon}</button>)}

          {/* Colores (solo para líneas) */}
          {tool!=="player"&&<>
            <div style={{width:1,height:26,background:th.border2}}/>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>{DC2.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:20,height:20,borderRadius:10,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,outline:color===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}</div>
          </>}

          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <button onClick={undo} disabled={!(hist[step]||[]).length} style={{width:32,height:32,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub,opacity:(hist[step]||[]).length?1:.35}}><RotateCcw size={13}/></button>
            <button onClick={clr} style={{width:32,height:32,borderRadius:7,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={13}/></button>
          </div>
        </div>

        {/* Leyenda rápida ATK/DEF */}
        <div style={{display:"flex",gap:16,marginBottom:8}}>
          {[1,2,3,4,5].map(n=><div key={n} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:18,height:18,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:10,fontWeight:700,color:"#fff"}}>{n}</div>
            <div style={{width:18,height:18,borderRadius:9,background:"transparent",border:"2px solid #3b82f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#3b82f6",fontWeight:700}}>✕</div>
          </div>)}
          <span style={{fontSize:10,color:th.muted,marginLeft:4}}>🟠 Atacantes · 🔵 Defensores</span>
        </div>

        <div style={{borderRadius:8,overflow:"hidden",lineHeight:0,border:`1px solid ${th.border}`}}>
          <canvas ref={cr} width={CW} height={CH} style={{width:"100%",height:"auto",display:"block",cursor:tool==="player"?"crosshair":"crosshair",touchAction:"none"}}
            onMouseDown={oD} onMouseMove={oM} onMouseUp={oU}
            onMouseLeave={()=>{if(dr.current){dr.current=false;or.current=null;rd(els);}}}/>
        </div>
        <p style={{fontSize:11,color:th.muted,marginTop:8}}>Paso {step+1}/4 · {els.length} elementos · Haz clic para colocar jugadores, arrastra para trazar líneas</p>
      </div>

      {/* Sidebar */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {/* Info jugadores */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Posiciones</p>
          <div style={{marginBottom:10}}>
            <p style={{fontSize:11,color:"#f97316",fontFamily:"Barlow Condensed",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Atacantes</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[1,2,3,4,5].map(n=><button key={n} onClick={()=>{setTool("player");setPlayerMode("atk");setAtkNum(n);}}
                style={{width:30,height:30,borderRadius:15,background:atkNum===n&&tool==="player"&&playerMode==="atk"?"#f97316":"#f9731630",border:`2px solid ${atkNum===n&&tool==="player"&&playerMode==="atk"?"#f97316":"transparent"}`,cursor:"pointer",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:atkNum===n&&tool==="player"&&playerMode==="atk"?"#fff":"#f97316"}}>
                {n}
              </button>)}
            </div>
          </div>
          <div>
            <p style={{fontSize:11,color:"#3b82f6",fontFamily:"Barlow Condensed",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>Defensores</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[1,2,3,4,5].map(n=><button key={n} onClick={()=>{setTool("player");setPlayerMode("def");setDefNum(n);}}
                style={{width:30,height:30,borderRadius:15,background:"transparent",border:`2px solid ${defNum===n&&tool==="player"&&playerMode==="def"?"#3b82f6":th.border2}`,cursor:"pointer",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:defNum===n&&tool==="player"&&playerMode==="def"?"#3b82f6":th.muted}}>
                {n}
              </button>)}
            </div>
          </div>
        </div>

        {/* Equipamiento */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Equipamiento</p>
          {equipTools.map(t=>{
            const ac=tool===t.id;
            return <div key={t.id} onClick={()=>setTool(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",background:ac?"rgba(245,158,11,.12)":th.card2,border:`1px solid ${ac?"#f59e0b":th.border}`,marginBottom:4}}>
              <span style={{fontSize:16,minWidth:22,textAlign:"center",color:ac?"#f59e0b":th.sub}}>{t.icon}</span>
              <div>
                <p style={{fontSize:12,fontFamily:"Barlow Condensed",fontWeight:700,color:ac?"#f59e0b":th.text,lineHeight:1}}>{t.label}</p>
                <p style={{fontSize:9,color:th.muted,lineHeight:1,marginTop:2}}>{t.desc}</p>
              </div>
            </div>;
          })}
        </div>

        {/* Herramientas */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Herramientas</p>
          {lineTools.map(t=>{
            const toolColors={arrow:"#f97316",dash:"#3b82f6",wavy:"#f59e0b",line:"#94a3b8",screen:"#fff",shot:"#10b981"};
            const ac=tool===t.id;const tc=toolColors[t.id]||"#f97316";
            return <div key={t.id} onClick={()=>setTool(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",background:ac?tc+"18":th.card2,border:`1px solid ${ac?tc:th.border}`,marginBottom:4}}>
              <span style={{fontSize:16,minWidth:22,textAlign:"center",color:ac?tc:th.sub}}>{t.icon}</span>
              <div>
                <p style={{fontSize:12,fontFamily:"Barlow Condensed",fontWeight:700,color:ac?tc:th.text,lineHeight:1}}>{t.label}</p>
                <p style={{fontSize:9,color:th.muted,lineHeight:1,marginTop:2}}>{t.desc}</p>
              </div>
            </div>;
          })}
        </div>

        {/* Jugadas guardadas */}
        <div className="card" style={{padding:14,flex:1}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Guardadas</p>
          {savedDrawings.length===0?<p style={{fontSize:11,color:th.muted}}>Sin jugadas guardadas</p>:
          <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:200,overflowY:"auto"}}>
            {savedDrawings.map(play=><div key={play.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 8px",borderRadius:7,background:th.card2,border:`1px solid ${th.border}`}}>
              <div style={{flex:1}}>
                <p style={{fontSize:11,color:th.text,fontFamily:"Barlow Condensed",fontWeight:700}}>{play.name}</p>
                <p style={{fontSize:9,color:th.muted}}>{play.steps.filter(s=>s.length>0).length} pasos</p>
              </div>
              <button onClick={()=>loadPlay(play)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Copy size={10}/></button>
              <button onClick={()=>setSavedDrawings(prev=>prev.filter(p=>p.id!==play.id))} style={{width:24,height:24,borderRadius:6,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={10}/></button>
            </div>)}
          </div>}
        </div>
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   12. RECURSOS — búsqueda arreglada + edición
══════════════════════════════════════════════════════════ */
function Recursos(){
  const{th}=useTheme();const{recursos,setRecursos}=useData();
  const[q,setQ]=useState("");const[showAdd,setShowAdd]=useState(false);
  const[editing,setEditing]=useState(null);const[ef,setEf]=useState({});
  const[f,setF]=useState({title:"",url:"",desc:"",tags:""});

  const filtered=recursos.filter(r=>{
    if(!q.trim())return true;
    const s=q.toLowerCase().trim();
    return (
      (r.title||"").toLowerCase().includes(s)||
      (r.desc||"").toLowerCase().includes(s)||
      (r.url||"").toLowerCase().includes(s)||
      (Array.isArray(r.tags)?r.tags:[]).some(t=>(t||"").toLowerCase().includes(s))
    );
  });

  const allTags=[...new Set(recursos.flatMap(r=>Array.isArray(r.tags)?r.tags:[]))].slice(0,14);
  const add=()=>{if(!f.title||!f.url)return;const tags=f.tags.split(",").map(t=>t.trim()).filter(Boolean);setRecursos(prev=>[...prev,{id:Date.now(),...f,tags}]);setF({title:"",url:"",desc:"",tags:""});setShowAdd(false);};
  const del=id=>setRecursos(prev=>prev.filter(r=>r.id!==id));
  const startEdit=r=>{setEditing(r.id);setEf({title:r.title,url:r.url,desc:r.desc,tags:(Array.isArray(r.tags)?r.tags:[]).join(", ")});};
  const saveEdit=()=>{const tags=ef.tags.split(",").map(t=>t.trim()).filter(Boolean);setRecursos(prev=>prev.map(r=>r.id===editing?{...r,...ef,tags}:r));setEditing(null);};
  const openUrl=url=>{const u=url.startsWith("http")?url:"https://"+url;window.open(u,"_blank","noopener");};

  return <div>
    <SH title="Recursos" sub="Repositorio de URLs con buscador y etiquetas" right={<Btn onClick={()=>setShowAdd(!showAdd)} icon={<Plus size={14}/>}>Añadir Recurso</Btn>}/>
    {/* Search */}
    <div style={{position:"relative",marginBottom:12}}>
      <Search size={15} color={th.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nombre, descripción, URL o etiqueta…" style={{paddingLeft:38}}/>
    </div>
    {/* Tag quick filter */}
    {allTags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
      <button onClick={()=>setQ("")} style={{padding:"3px 12px",borderRadius:20,border:`1px solid ${!q?"#f97316":th.border2}`,background:!q?"rgba(249,115,22,.1)":"transparent",cursor:"pointer",fontSize:11,color:!q?"#f97316":th.muted,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>Todos</button>
      {allTags.map(t=><button key={t} onClick={()=>setQ(q===t?"":t)} style={{padding:"3px 12px",borderRadius:20,border:`1px solid ${q===t?tagColor(t):th.border2}`,background:q===t?tagColor(t)+"18":"transparent",cursor:"pointer",fontSize:11,color:q===t?tagColor(t):th.muted,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t}</button>)}
    </div>}
    {/* Add form */}
    {showAdd&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Recurso</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div><Lbl>Título</Lbl><input value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))} placeholder="Nombre del recurso"/></div>
        <div><Lbl>URL</Lbl><input value={f.url} onChange={e=>setF(x=>({...x,url:e.target.value}))} placeholder="https://…"/></div>
      </div>
      <div style={{marginBottom:12}}><Lbl>Descripción</Lbl><input value={f.desc} onChange={e=>setF(x=>({...x,desc:e.target.value}))} placeholder="Para qué sirve…"/></div>
      <div style={{marginBottom:14}}><Lbl>Etiquetas (separadas por comas)</Lbl><input value={f.tags} onChange={e=>setF(x=>({...x,tags:e.target.value}))} placeholder="jugadas, sistemas, vídeo…"/></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setShowAdd(false)} variant="ghost">Cancelar</Btn></div>
    </div>}
    {/* Results */}
    {filtered.length===0&&<div className="card" style={{padding:40,textAlign:"center"}}><Globe size={32} color={th.muted} style={{margin:"0 auto 12px",display:"block"}}/><p style={{color:th.muted,fontSize:14}}>{q?"Sin resultados para esa búsqueda":"No hay recursos añadidos"}</p>{q&&<button onClick={()=>setQ("")} style={{marginTop:8,background:"transparent",border:`1px solid ${th.border2}`,color:th.sub,cursor:"pointer",padding:"5px 14px",borderRadius:8,fontSize:12}}>Limpiar búsqueda</button>}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(r=><div key={r.id} className="card" style={{padding:18,display:"flex",flexDirection:"column",gap:10}}>
        {editing===r.id?(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div><Lbl>Título</Lbl><input value={ef.title} onChange={e=>setEf(x=>({...x,title:e.target.value}))}/></div>
              <div><Lbl>URL</Lbl><input value={ef.url} onChange={e=>setEf(x=>({...x,url:e.target.value}))}/></div>
            </div>
            <div style={{marginBottom:8}}><Lbl>Descripción</Lbl><input value={ef.desc} onChange={e=>setEf(x=>({...x,desc:e.target.value}))}/></div>
            <div style={{marginBottom:10}}><Lbl>Etiquetas</Lbl><input value={ef.tags} onChange={e=>setEf(x=>({...x,tags:e.target.value}))}/></div>
            <div style={{display:"flex",gap:6}}><Btn onClick={saveEdit} sm>Guardar</Btn><Btn onClick={()=>setEditing(null)} variant="ghost" sm>Cancelar</Btn></div>
          </div>
        ):(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <h3 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:4,lineHeight:1.2}}>{r.title}</h3>
                <p style={{fontSize:11,color:"#f97316",fontFamily:"DM Mono",cursor:"pointer",wordBreak:"break-all"}} onClick={()=>openUrl(r.url)}>{(r.url||"").replace(/^https?:\/\//,"").slice(0,40)}{(r.url||"").length>40?"…":""}</p>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>openUrl(r.url)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><ExternalLink size={12}/></button>
                <button onClick={()=>startEdit(r)} style={{width:28,height:28,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={12}/></button>
                <button onClick={()=>del(r.id)} style={{width:28,height:28,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={12}/></button>
              </div>
            </div>
            {r.desc&&<p style={{fontSize:12,color:th.sub,lineHeight:1.6}}>{r.desc}</p>}
            {(Array.isArray(r.tags)?r.tags:[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {(Array.isArray(r.tags)?r.tags:[]).map(t=><span key={t} onClick={()=>setQ(t)} style={{fontSize:10,color:tagColor(t),background:tagColor(t)+"18",padding:"2px 8px",borderRadius:20,border:`1px solid ${tagColor(t)}35`,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t}</span>)}
            </div>}
          </>
        )}
      </div>)}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   13. CALENDARIO — Vista mensual con entrenos y partidos
══════════════════════════════════════════════════════════ */
function Calendario(){
  const{th}=useTheme();const{sessions,setSessions,matches,setMatches}=useData();
  const today=new Date();
  const[year,setYear]=useState(today.getFullYear());
  const[month,setMonth]=useState(today.getMonth());
  const[showAdd,setShowAdd]=useState(false);
  const[addDate,setAddDate]=useState("");
  const[addType,setAddType]=useState("partido");
  const[pf,setPf]=useState({rival:"",location:"Casa",pts_us:"",pts_them:""});
  const[gcalMsg,setGcalMsg]=useState(null);

  const monthDate=new Date(year,month,1);
  const monthName=monthDate.toLocaleDateString("es",{month:"long",year:"numeric"});
  const firstDay=(monthDate.getDay()+6)%7; // 0=Mon
  const daysInMonth=new Date(year,month+1,0).getDate();

  const prev=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const next=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};

  // Eventos del mes
  const yymm=`${year}-${String(month+1).padStart(2,"0")}`;
  const monthSessions=sessions.filter(s=>s.date?.startsWith(yymm));
  const monthMatches=matches.filter(m=>m.date?.startsWith(yymm));

  const eventsForDay=day=>{
    const d=`${yymm}-${String(day).padStart(2,"0")}`;
    return{
      sessions:monthSessions.filter(s=>s.date===d),
      matches:monthMatches.filter(m=>m.date===d),
    };
  };

  // Añadir partido sin resultado (planificado)
  const addMatch=()=>{
    if(!pf.rival||!addDate)return;
    const id=matches.length?Math.max(...matches.map(m=>m.id))+1:1;
    const newM={id,date:addDate,rival:pf.rival,location:pf.location,pts_us:pf.pts_us!==""?+pf.pts_us:null,pts_them:pf.pts_them!==""?+pf.pts_them:null};
    setMatches(prev=>[...prev,newM]);
    setPf({rival:"",location:"Casa",pts_us:"",pts_them:""});setShowAdd(false);
  };

  // Google Calendar export
  const gcalUrl=(title,date,desc="")=>{
    const dt=date.replace(/-/g,"");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dt}/${dt}&details=${encodeURIComponent(desc)}&sf=true`;
  };
  const exportAll=()=>{
    const events=[
      ...monthSessions.map(s=>({title:`Entreno: ${s.title}`,date:s.date,desc:`${s.type} · ${s.dur}'`})),
      ...monthMatches.map(m=>({title:`${m.rival} (${m.location})`,date:m.date,desc:m.pts_us!=null?`Resultado: ${m.pts_us}-${m.pts_them}`:"Partido planificado"})),
    ];
    if(!events.length){setGcalMsg("No hay eventos en este mes");setTimeout(()=>setGcalMsg(null),3000);return;}
    // Open first event, notify user to repeat for others
    events.forEach((ev,i)=>setTimeout(()=>window.open(gcalUrl(ev.title,ev.date,ev.desc),"_blank"),i*600));
    setGcalMsg(`✅ Abriendo ${events.length} evento${events.length>1?"s":""} en Google Calendar…`);
    setTimeout(()=>setGcalMsg(null),5000);
  };

  const DAYS_HEADER=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  const TC_COLOR={"Técnico-Táctico":"#f97316","Físico":"#3b82f6","Técnico":"#f59e0b","Táctico":"#8b5cf6","Recuperación":"#10b981","Partido":"#ef4444","Mental":"#06b6d4","Libre":"#4b5563"};

  return <div>
    <SH title="Calendario" sub="Entrenamientos y partidos · Vista mensual"
      right={<div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{setShowAdd(true);setAddDate(yymm+"-01");}} icon={<Plus size={14}/>} sm>Añadir Partido</Btn>
        <Btn onClick={exportAll} variant="ghost" icon={<ExternalLink size={14}/>} sm>→ Google Calendar</Btn>
      </div>}/>

    {gcalMsg&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:13,color:"#10b981"}}>{gcalMsg}</div>}

    {/* Nav mensual */}
    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <button onClick={prev} style={{width:34,height:34,borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><ChevronLeft size={16}/></button>
      <p style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:700,color:th.text,textTransform:"capitalize",flex:1,textAlign:"center"}}>{monthName}</p>
      <button onClick={next} style={{width:34,height:34,borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><ChevronRight size={16}/></button>
    </div>

    {/* Formulario añadir partido */}
    {showAdd&&<div className="card" style={{padding:18,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#f97316",marginBottom:12,textTransform:"uppercase"}}>Añadir Partido al Calendario</p>
      <div style={{display:"grid",gridTemplateColumns:"150px 1fr 130px 80px 80px",gap:10,marginBottom:12}}>
        <div><Lbl>Fecha</Lbl><input type="date" value={addDate} onChange={e=>setAddDate(e.target.value)}/></div>
        <div><Lbl>Rival</Lbl><input value={pf.rival} onChange={e=>setPf(x=>({...x,rival:e.target.value}))} placeholder="Nombre del rival"/></div>
        <div><Lbl>Lugar</Lbl><select value={pf.location} onChange={e=>setPf(x=>({...x,location:e.target.value}))}><option>Casa</option><option>Fuera</option></select></div>
        <div><Lbl>Nos. (opt.)</Lbl><input type="number" value={pf.pts_us} onChange={e=>setPf(x=>({...x,pts_us:e.target.value}))} placeholder="—"/></div>
        <div><Lbl>Riv. (opt.)</Lbl><input type="number" value={pf.pts_them} onChange={e=>setPf(x=>({...x,pts_them:e.target.value}))} placeholder="—"/></div>
      </div>
      <p style={{fontSize:11,color:th.muted,marginBottom:10}}>💡 El resultado es opcional — puedes añadirlo después desde la sección Partidos</p>
      <div style={{display:"flex",gap:8}}><Btn onClick={addMatch}>Guardar</Btn><Btn onClick={()=>setShowAdd(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    {/* Calendario grid */}
    <div className="card" style={{padding:16,overflow:"hidden"}}>
      {/* Headers días semana */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS_HEADER.map(d=><div key={d} style={{textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,padding:"6px 0"}}>{d}</div>)}
      </div>
      {/* Días */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {/* Espacios vacíos al inicio */}
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} style={{minHeight:70}}/>)}
        {/* Días del mes */}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day=i+1;
          const dateStr=`${yymm}-${String(day).padStart(2,"0")}`;
          const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===day;
          const evs=eventsForDay(day);
          const hasEvents=evs.sessions.length>0||evs.matches.length>0;
          return <div key={day} style={{minHeight:70,padding:4,borderRadius:8,background:isToday?"rgba(249,115,22,.08)":hasEvents?th.card2+"80":"transparent",border:`1px solid ${isToday?"rgba(249,115,22,.4)":hasEvents?th.border:th.border+"40"}`,position:"relative"}}>
            <p style={{fontFamily:"DM Mono",fontSize:11,fontWeight:isToday?700:400,color:isToday?"#f97316":th.muted,marginBottom:3}}>{day}</p>
            {evs.sessions.map(s=><div key={s.id} style={{fontSize:10,background:(TC_COLOR[s.type]||"#f97316")+"22",color:TC_COLOR[s.type]||"#f97316",borderRadius:4,padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer"}} title={s.title}>
              🏀 {s.title.slice(0,16)}{s.title.length>16?"…":""}
            </div>)}
            {evs.matches.map(m=>{const res=m.pts_us!=null;const win=res&&m.pts_us>m.pts_them;return <div key={m.id} style={{fontSize:10,background:res?(win?"rgba(16,185,129,.15)":"rgba(239,68,68,.15)"):"rgba(99,102,241,.15)",color:res?(win?"#10b981":"#ef4444"):"#6366f1",borderRadius:4,padding:"2px 5px",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",cursor:"pointer",display:"flex",alignItems:"center",gap:3}} title={`${m.rival} · ${m.location}`}>
              <Trophy size={8}/> {m.rival.slice(0,12)}{!res&&" (pl.)"}
              {res&&<span style={{marginLeft:"auto",fontFamily:"DM Mono",fontSize:9}}>{m.pts_us}-{m.pts_them}</span>}
            </div>;})}
          </div>;
        })}
      </div>
    </div>

    {/* Leyenda */}
    <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>
      {[["🏀 Entrenamiento","#f97316"],["🏆 Partido jugado","#10b981"],["📅 Partido planificado","#6366f1"],["⚡ Hoy","#f97316"]].map(([l,c])=><div key={l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:2,background:c+"40",border:`1px solid ${c}60`}}/><span style={{fontSize:11,color:th.muted}}>{l}</span></div>)}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   14. IA ASISTENTE
══════════════════════════════════════════════════════════ */
/* ── PDF export helper ── */
function exportToPDF(title,content,subtitle,playersTable){
  const w=window.open("","_blank");
  const validPlayers=(playersTable||[]).filter(p=>p.name&&(p.pt||p.pj||p.min||p.tl_i||p.t2_i||p.t3_i||p.fc));

  // Score players: pts/pj primary, shooting pct secondary
  const scored=validPlayers.map(p=>{
    const pt=parseInt(p.pt)||0;const pj=Math.max(parseInt(p.pj)||1,1);
    const t2m=parseInt(p.t2_m)||0;const t3m=parseInt(p.t3_m)||0;const tlm=parseInt(p.tl_m)||0;
    const t2i=Math.max(parseInt(p.t2_i)||1,1);const t3i=Math.max(parseInt(p.t3_i)||1,1);
    const tli=Math.max(parseInt(p.tl_i)||1,1);
    const pct=(t2m/t2i+t3m/t3i+tlm/tli)/3;
    return{...p,_ppg:Math.round(pt/pj*10)/10,_score:pt/pj+(pct*8)};
  }).sort((a,b)=>b._score-a._score);
  const top10=scored.slice(0,10);

  const top10Html=top10.length>0?(
    '<div style="margin-bottom:22px">'
    +'<div style="font-family:Barlow Condensed,Arial;font-size:13px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f97316;padding-left:10px;margin-bottom:12px">Top 10 Jugadores Rivales</div>'
    +'<table style="width:100%;border-collapse:collapse;font-size:12px;font-family:Arial,sans-serif">'
    +'<thead><tr style="background:#1e3a5f;color:#fff">'
    +'<th style="padding:8px 10px;text-align:center;width:34px">Pos</th>'
    +'<th style="padding:8px 8px;text-align:center;width:30px">#</th>'
    +'<th style="padding:8px 12px;text-align:left">Jugador</th>'
    +'<th style="padding:8px 8px;text-align:center">PJ</th>'
    +'<th style="padding:8px 8px;text-align:center">PT</th>'
    +'<th style="padding:8px 8px;text-align:center">Pts/PJ</th>'
    +'<th style="padding:8px 8px;text-align:center">Min</th>'
    +'<th style="padding:8px 8px;text-align:center">%TL</th>'
    +'<th style="padding:8px 8px;text-align:center">%T2</th>'
    +'<th style="padding:8px 8px;text-align:center">%T3</th>'
    +'<th style="padding:8px 8px;text-align:center">FC</th>'
    +'</tr></thead><tbody>'
    +top10.map((p,i)=>{
      const isTop3=i<3;
      const bg=i===0?"#fff3e6":i===1?"#fff7ed":i===2?"#fffbf5":i%2===0?"#f8fafc":"#ffffff";
      const nameColor=isTop3?"#c2410c":"#1e293b";
      const ptColor=isTop3?"#ea580c":"#374151";
      const pctTL=parseInt(p.tl_i)?Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)+"%":"—";
      const pctT2=parseInt(p.t2_i)?Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)+"%":"—";
      const pctT3=parseInt(p.t3_i)?Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)+"%":"—";
      return '<tr style="background:'+bg+';border-left:3px solid '+(isTop3?"#f97316":"transparent")+';border-bottom:1px solid #e2e8f0">'
        +'<td style="padding:9px 10px;text-align:center;font-weight:700;font-size:13px;color:'+(isTop3?"#f97316":"#94a3b8")+'">'+(i+1)+'.</td>'
        +'<td style="padding:9px 8px;text-align:center;font-family:DM Mono,monospace;font-weight:'+(isTop3?700:400)+';color:'+nameColor+'">'+(p.num||"—")+'</td>'
        +'<td style="padding:9px 12px;font-weight:'+(isTop3?700:400)+';color:'+nameColor+'">'+(p.name||"—")+'</td>'
        +'<td style="padding:9px 8px;text-align:center;color:#64748b">'+(p.pj||"—")+'</td>'
        +'<td style="padding:9px 8px;text-align:center;font-weight:700;color:'+ptColor+'">'+(p.pt||"—")+'</td>'
        +'<td style="padding:9px 8px;text-align:center;color:'+ptColor+'">'+(p._ppg||"—")+'</td>'
        +'<td style="padding:9px 8px;text-align:center;color:#64748b">'+(p.min||"—")+'</td>'
        +'<td style="padding:9px 8px;text-align:center">'+pctTL+'</td>'
        +'<td style="padding:9px 8px;text-align:center">'+pctT2+'</td>'
        +'<td style="padding:9px 8px;text-align:center">'+pctT3+'</td>'
        +'<td style="padding:9px 8px;text-align:center;color:#64748b">'+(p.fc||"—")+'</td>'
        +'</tr>';
    }).join("")+'</tbody></table></div>'
  ):"";

  const pTable=validPlayers.length>top10.length?(
    '<div class="section"><div class="section-title">Estadísticas completas del equipo rival</div>'
    +'<table><thead><tr><th>#</th><th style="text-align:left">Jugador</th><th>PJ</th><th>PT</th><th>Min</th><th>%TL</th><th>%T2</th><th>%T3</th><th>FC</th></tr></thead>'
    +'<tbody>'+scored.slice(10).map(p=>{
      const pctTL=parseInt(p.tl_i)?Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)+"%":"—";
      const pctT2=parseInt(p.t2_i)?Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)+"%":"—";
      const pctT3=parseInt(p.t3_i)?Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)+"%":"—";
      return '<tr><td>'+(p.num||"")+'</td><td class="left">'+(p.name||"")+'</td>'
        +'<td>'+(p.pj||"—")+'</td><td>'+(p.pt||"—")+'</td><td>'+(p.min||"—")+'</td>'
        +'<td>'+pctTL+'</td><td>'+pctT2+'</td><td>'+pctT3+'</td><td>'+(p.fc||"—")+'</td></tr>';
    }).join("")+'</tbody></table></div>'
  ):"";

  w.document.write(pdfOpen(title)
    +pdfHeader(title,subtitle||new Date().toLocaleDateString("es"))
    +top10Html
    +pTable
    +'<div class="section">'+mdToHtml(content)+'</div>'
    +pdfClose()
  );
  w.document.close();setTimeout(()=>w.print(),400);
}

/* ── Top 10 ranking component — reutilizable ──────────────── */
function Top10Table({players,th}){
  const cols=[
    {h:"Pos",w:36,align:"center"},
    {h:"#",w:32,align:"center"},
    {h:"Jugador",w:"auto",align:"left"},
    {h:"PJ",w:40,align:"center"},
    {h:"PT",w:44,align:"center"},
    {h:"Pts/PJ",w:52,align:"center"},
    {h:"Min",w:44,align:"center"},
    {h:"%TL",w:44,align:"center"},
    {h:"%T2",w:44,align:"center"},
    {h:"%T3",w:44,align:"center"},
    {h:"FC",w:36,align:"center"},
  ];
  return <div style={{marginBottom:16,overflow:"auto"}}>
    <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8,borderLeft:"3px solid #f97316",paddingLeft:8}}>
      Top 10 Jugadores Rivales — incluidos en el PDF
    </p>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:580}}>
      <thead>
        <tr style={{background:"#1e3a5f"}}>
          {cols.map(c=><th key={c.h} style={{padding:"8px 8px",textAlign:c.align,fontFamily:"Barlow Condensed",fontSize:10,color:"#fff",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,width:c.w!=="auto"?c.w:undefined}}>{c.h}</th>)}
        </tr>
      </thead>
      <tbody>
        {players.map((p,i)=>{
          const isTop3=i<3;
          const bg=isTop3?`rgba(249,115,22,${0.1-i*0.025})`:i%2===0?th.card:th.card2;
          const nameColor=isTop3?"#f97316":th.text;
          const pctTL=parseInt(p.tl_i)?Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)+"%":"—";
          const pctT2=parseInt(p.t2_i)?Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)+"%":"—";
          const pctT3=parseInt(p.t3_i)?Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)+"%":"—";
          return <tr key={p.id||i} style={{background:bg,borderTop:`1px solid ${th.border}`,borderLeft:`3px solid ${isTop3?"#f97316":"transparent"}`}}>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:isTop3?"#f97316":th.muted}}>{i+1}.</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,fontWeight:isTop3?700:400,color:nameColor}}>{p.num||"—"}</td>
            <td style={{padding:"9px 12px",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:isTop3?700:500,color:nameColor}}>{p.name||"—"}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{p.pj||"—"}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:14,fontWeight:700,color:isTop3?"#f97316":th.text}}>{p.pt||"—"}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:isTop3?"#f97316":th.sub}}>{p._ppg||"—"}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{p.min||"—"}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{pctTL}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{pctT2}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{pctT3}</td>
            <td style={{padding:"9px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{p.fc||"—"}</td>
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}

function IAAsistente(){
  const{th}=useTheme();
  const{players,matches,sessions,sesionTemplates,setSesionTemplates,setSessions,scouting,setScouting,plays,apiKey}=useData();
  const[tab,setTab]=useState("rival");
  const[selScout,setSelScout]=useState(null);

  // Análisis rival
  const[rivalName,setRivalName]=useState("");
  const[rivalJornada,setRivalJornada]=useState("");
  const[rivalFecha,setRivalFecha]=useState("");
  const[rivalLugar,setRivalLugar]=useState("");
  const[rivalFase,setRivalFase]=useState("Liga Regular");
  const[rivalText,setRivalText]=useState("");const[rivalResult,setRivalResult]=useState(null);const[rivalLoading,setRivalLoading]=useState(false);
  const rivalFileRef=useRef();
  // Fichas individuales — "A tener en cuenta" por jugador (keyed by player id)
  const[rivalNotes,setRivalNotes]=useState({});
  const[rivalNotesEditing,setRivalNotesEditing]=useState({});
  const setRivalNote=(id,val)=>setRivalNotes(prev=>({...prev,[id]:val}));
  // Análisis colectivo estructurado
  const[analisisAtaque,setAnalisisAtaque]=useState("");
  const[analisisDefensa,setAnalisisDefensa]=useState("");
  const[clavesAtaque,setClavesAtaque]=useState("");
  const[clavesDefensa,setClavesDefensa]=useState("");
  const[rivalMensaje,setRivalMensaje]=useState("");
  // Stats de jugadores del rival para scouting
  const emptyRP=()=>({pj:"",pt:"",min:"",tl_i:"",tl_m:"",t2_i:"",t2_m:"",t3_i:"",t3_m:"",fc:""});
  const defaultRP=()=>[
    {id:1, num:"4", name:"Jugador 1", ...emptyRP()},
    {id:2, num:"7", name:"Jugador 2", ...emptyRP()},
    {id:3, num:"11",name:"Jugador 3", ...emptyRP()},
    {id:4, num:"14",name:"Jugador 4", ...emptyRP()},
    {id:5, num:"21",name:"Jugador 5", ...emptyRP()},
    {id:6, num:"8", name:"Jugador 6", ...emptyRP()},
    {id:7, num:"15",name:"Jugador 7", ...emptyRP()},
    {id:8, num:"3", name:"Jugador 8", ...emptyRP()},
    {id:9, num:"23",name:"Jugador 9", ...emptyRP()},
    {id:10,num:"33",name:"Jugador 10",...emptyRP()},
    {id:11,num:"9", name:"Jugador 11",...emptyRP()},
    {id:12,num:"17",name:"Jugador 12",...emptyRP()},
  ];
  const[rivalPlayers,setRivalPlayers]=useState(defaultRP());
  const setRP=(id,field,val)=>setRivalPlayers(prev=>prev.map(p=>p.id===id?{...p,[field]:val}:p));
  const addRP=()=>setRivalPlayers(prev=>[...prev,{id:Date.now(),num:"",name:`Jugador ${prev.length+1}`,...emptyRP()}]);
  const delRP=id=>setRivalPlayers(prev=>prev.filter(p=>p.id!==id));
  const resetRival=()=>{
    setRivalName("");setRivalJornada("");setRivalFecha("");setRivalLugar("");setRivalFase("Liga Regular");
    setRivalText("");setRivalResult(null);setRivalPlayers(defaultRP());setRivalNotes({});setRivalNotesEditing({});
    setAnalisisAtaque("");setAnalisisDefensa("");setClavesAtaque("");setClavesDefensa("");setRivalMensaje("");
    setSelScout(null);if(rivalFileRef.current)rivalFileRef.current.value="";
  };

  // Generador sesión
  const[sesObj,setSesObj]=useState("");const[sesDur,setSesDur]=useState("90");const[sesFocus,setSesFocus]=useState("Técnico-Táctico");
  const[sesDate,setSesDate]=useState(()=>new Date().toISOString().split("T")[0]);
  const[sesResult,setSesResult]=useState(null);const[sesLoading,setSesLoading]=useState(false);
  const[sesSaved,setSesSaved]=useState(false);

  // Resumen temporada
  const[resResult,setResResult]=useState(null);const[resLoading,setResLoading]=useState(false);

  const noKey=!apiKey;

  const analyzeRival=async()=>{
    if(noKey){setRivalResult({error:"Configura tu API Key en ⚙️ Ajustes del sidebar."});return;}
    if(!rivalText.trim()&&!rivalFileRef.current?.files?.[0]){setRivalResult({error:"Introduce información del rival o sube un PDF."});return;}
    setRivalLoading(true);setRivalResult(null);setSelScout(null);

    // ¿El usuario ya rellenó jugadores manualmente?
    const hasManualPlayers=rivalPlayers.some(p=>
      (p.name.trim()&&!p.name.match(/^Jugador \d+$/))||p.pt||p.pj||p.tl_i||p.t2_i||p.t3_i
    );

    try{
      const content=[];
      if(rivalFileRef.current?.files?.[0]){
        const f=rivalFileRef.current.files[0];
        const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
        content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}});
      }
      // Build rich player context for AI
      const playersForAI=hasManualPlayers
        ?rivalPlayers.filter(p=>p.name.trim()&&(!p.name.match(/^Jugador \d+$/)||p.pt||p.pj))
        :[];
      const rpStr=playersForAI.map(p=>{
        const pj=p.pj?` PJ:${p.pj}`:"";const pt=p.pt?` PT:${p.pt}`:"";const min=p.min?` Min:${p.min}`:"";
        const pctTL=parseInt(p.tl_i)?` %TL:${Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)}%`:(p.tl_i?` TL:${p.tl_m}/${p.tl_i}`:"");
        const pctT2=parseInt(p.t2_i)?` %T2:${Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)}%`:(p.t2_i?` T2:${p.t2_m}/${p.t2_i}`:"");
        const pctT3=parseInt(p.t3_i)?` %T3:${Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)}%`:(p.t3_i?` T3:${p.t3_m}/${p.t3_i}`:"");
        const ppg=parseInt(p.pt)&&parseInt(p.pj)?` Pts/pj:${Math.round(parseInt(p.pt)/parseInt(p.pj)*10)/10}`:"";
        const fc=p.fc?` FC:${p.fc}`:"";
        const pos=p.pos?` [${p.pos}]`:"";
        const existingNote=rivalNotes[p.id]?` NOTA_EXISTENTE:"${rivalNotes[p.id].slice(0,100)}":`:"";
        return `  #${p.num}${pos} ${p.name}${pj}${pt}${ppg}${min}${pctTL}${pctT2}${pctT3}${fc}${existingNote}`;
      }).join("\n");

      const playsCtx=plays&&plays.length>0
        ?"\n\nJugadas disponibles en nuestro Playbook:\n"+plays.map(p=>"- "+p.name+" ("+p.cat+"): "+(p.desc?.slice(0,80)||"")).join("\n")
        :"";

      const rivalIntro=(rivalName?"Rival: "+rivalName+".\n":"")+(rivalJornada?"Jornada: "+rivalJornada+". ":"")+(rivalFecha?"Fecha: "+rivalFecha+". ":"")+(rivalLugar?"Lugar: "+rivalLugar+".\n":"\n")+(rivalFase?"Fase: "+rivalFase+"\n":"")+(rivalText?"Información general:\n"+rivalText+"\n\n":"")+(rpStr?"Estadísticas de jugadores (con porcentajes calculados):\n"+rpStr+"\n\n":"");
      const playsRec=playsCtx?"\n- JUGADAS RECOMENDADAS: elige 2-3 jugadas de nuestro Playbook que encajen contra este rival":"";
      const jsonInstr=!hasManualPlayers?"\n\nAdemás, si encuentras jugadores identificables en el PDF, extráelos al FINAL en este bloque JSON (una sola línea):\nPLAYERS_JSON:[{\"num\":\"4\",\"name\":\"Apellido\",\"pj\":\"15\",\"pt\":\"\",\"min\":\"350\",\"tl_i\":\"30\",\"tl_m\":\"18\",\"t2_i\":\"120\",\"t2_m\":\"70\",\"t3_i\":\"40\",\"t3_m\":\"10\",\"fc\":\"25\"}]\nIMPORTANTE: Excluye entradas anónimas (ej: 'J Jugadors/es inscrits/es a mà', totales de equipo, etc.).\nSi no hay datos suficientes omite PLAYERS_JSON.":"";

      // ── LLAMADA 1: Análisis colectivo + secciones + PLAYERS_JSON ──
      const promptAnalisis=rivalIntro+`Eres el preparador del CB Binissalem Sénior A. Genera un informe de scouting profesional en español.

Genera EXACTAMENTE estas secciones con estos títulos:

ANÁLISIS COLECTIVO:
(2-3 párrafos: balance de temporada, estilo de juego, puntos fuertes y débiles del equipo)

ATAQUE RIVAL:
(8-10 puntos numerados: sistemas ofensivos, bloqueos directos, tiradores, penetradores, tendencias)

DEFENSA RIVAL:
(5-7 puntos numerados: sistema defensivo, vulnerabilidades, zonas débiles, cómo nos pueden presionar)

CLAVES DEL PARTIDO — ATAQUE:
(6-8 puntos numerados: qué debemos hacer nosotros en ataque para ganar este partido específico)

CLAVES DEL PARTIDO — DEFENSA:
(6-8 puntos numerados: qué debemos hacer nosotros en defensa para ganar este partido)
`+(playsRec?playsRec+"\n":"")+`
Sé muy específico, usa los datos de estadísticas y redacta como un scout profesional.`+jsonInstr+playsCtx;

      const contentAnalisis=[...content,{type:"text",text:promptAnalisis}];
      const data1=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:3000,messages:[{role:"user",content:contentAnalisis}]});
      let fullText=data1.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";

      // ── Extraer PLAYERS_JSON primero (necesitamos los IDs nuevos para mapear fichas) ──
      let extractedPlayers=null;
      if(!hasManualPlayers){
        const pjIdx=fullText.indexOf("PLAYERS_JSON:");
        if(pjIdx>=0){
          let raw=fullText.slice(pjIdx+"PLAYERS_JSON:".length).trim();
          const arrStart=raw.indexOf("[");
          if(arrStart>=0){
            raw=raw.slice(arrStart).replace(/\r?\n/g," ").replace(/\s+/g," ");
            let depth=0,end=-1;
            for(let i=0;i<raw.length;i++){if(raw[i]==="[")depth++;else if(raw[i]==="]"){depth--;if(depth===0){end=i;break;}}}
            let jsonStr=end>=0?raw.slice(0,end+1):raw;
            if(end<0){const lastObj=jsonStr.lastIndexOf("}");if(lastObj>=0)jsonStr=jsonStr.slice(0,lastObj+1)+"]";}
            try{
              const parsed=JSON.parse(jsonStr);
              if(Array.isArray(parsed)&&parsed.length>0){
                const ANON=[/jugador[s]?\s*\/?\s*es\s+inscrits/i,/inscrit[s]?\s*\/?\s*es/i,/a\s+m[àa]/i,/^jugador\s+an[oò]nim/i,/^total/i,/^\s*j\s+jugador/i];
                const isAnon=n=>{const t=(n||"").trim();return !t||t.length<3||t.split(/\s+/).filter(Boolean).length<2||ANON.some(r=>r.test(t));};
                const ts=Date.now();
                extractedPlayers=parsed.filter(p=>!isAnon(p.name)).map((p,i)=>({
                  id:ts+i,num:p.num||String(i+1),name:(p.name||`Jugador ${i+1}`).trim(),
                  pj:p.pj||"",pt:p.pt||"",min:p.min||"",tl_i:p.tl_i||"",tl_m:p.tl_m||"",
                  t2_i:p.t2_i||"",t2_m:p.t2_m||"",t3_i:p.t3_i||"",t3_m:p.t3_m||"",fc:p.fc||"",
                }));
                if(extractedPlayers.length===0)extractedPlayers=null;
              }
            }catch(e){console.warn("PLAYERS_JSON parse:",e.message);}
          }
        }
      }
      // La fuente de jugadores activos: los recién extraídos O los que ya hay en rivalPlayers
      const activePlayers=extractedPlayers||rivalPlayers;

      // ── Extraer FICHAS individuales — mapeadas contra activePlayers ──
      const fichasExtracted={};
      const fichaRegex=/FICHA_INICIO\s+([\s\S]*?)FICHA_FIN/g;
      let fichaMatch;
      while((fichaMatch=fichaRegex.exec(fullText))!==null){
        const bloque=fichaMatch[1];
        const numMatch=bloque.match(/NUM:\s*(\S+)/);
        const nomMatch=bloque.match(/NOMBRE:\s*(.+)/);
        const notasMatch=bloque.match(/NOTAS:\s*([\s\S]+)/);
        if(numMatch&&notasMatch){
          const num=(numMatch[1]||"").trim();
          const nombre=(nomMatch?nomMatch[1]:"").trim();
          const notas=notasMatch[1].replace(/FICHA_FIN[\s\S]*/,"").trim();
          // Buscar jugador en activePlayers (nuevos IDs)
          const player=activePlayers.find(p=>
            String(p.num)===String(num)||
            (nombre&&p.name.toLowerCase().includes(nombre.split(" ")[0].toLowerCase()))||
            (nombre&&nombre.toLowerCase().includes(p.name.toLowerCase().split(" ")[0]))
          );
          if(player){
            fichasExtracted[player.id]=notas;
          } else {
            fichasExtracted["_num_"+num]=notas; // fallback por dorsal
          }
        }
      }

      // Remove FICHA_ blocks from visible text
      const textClean=fullText.replace(/FICHA_INICIO[\s\S]*?FICHA_FIN/g,"").replace(/PLAYERS_JSON:[\s\S]*/,"").trim();
      const extractSection=(text,titulo)=>{
        const re=new RegExp(titulo+"[:\\s]*([\\s\\S]*?)(?=ANÁLISIS COLECTIVO:|ATAQUE RIVAL:|DEFENSA RIVAL:|CLAVES DEL PARTIDO — ATAQUE:|CLAVES DEL PARTIDO — DEFENSA:|JUGADAS RECOMENDADAS:|FICHA_INICIO|PLAYERS_JSON:|$)","i");
        const m=text.match(re);
        return m?m[1].trim():"";
      };
      const aiColectivo=extractSection(fullText,"ANÁLISIS COLECTIVO:");
      const aiAtaque=extractSection(fullText,"ATAQUE RIVAL:");
      const aiDefensa=extractSection(fullText,"DEFENSA RIVAL:");
      const aiClavesAtaque=extractSection(fullText,"CLAVES DEL PARTIDO — ATAQUE:");
      const aiClavesDefensa=extractSection(fullText,"CLAVES DEL PARTIDO — DEFENSA:");

      // Auto-fill structured fields only if user hasn't filled them
      if(aiAtaque&&!analisisAtaque.trim())setAnalisisAtaque(aiAtaque);
      if(aiDefensa&&!analisisDefensa.trim())setAnalisisDefensa(aiDefensa);
      if(aiClavesAtaque&&!clavesAtaque.trim())setClavesAtaque(aiClavesAtaque);
      if(aiClavesDefensa&&!clavesDefensa.trim())setClavesDefensa(aiClavesDefensa);

      // Auto-fill rivalNotes with extracted fichas (don't overwrite manually entered notes)
      if(Object.keys(fichasExtracted).length>0){
        setRivalNotes(prev=>{
          const updated={...prev};
          Object.entries(fichasExtracted).forEach(([id,notas])=>{
            if(!updated[id]||updated[id].trim()==="") updated[id]=notas;
          });
          return updated;
        });
      }

      // Update rivalPlayers if we extracted new ones from PDF
      if(extractedPlayers&&extractedPlayers.length>0) setRivalPlayers(extractedPlayers);

      // ── LLAMADA 2: Fichas individuales (llamada separada para no recortar) ──
      const fichasPlayers=extractedPlayers||rivalPlayers.filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)&&(p.pt||p.pj||p.min));
      if(fichasPlayers.length>0){
        // Top 10 por pts/pj para no exceder tokens
        const fichasTop=fichasPlayers.map(p=>({...p,_ppg:parseInt(p.pt)&&parseInt(p.pj)?parseInt(p.pt)/Math.max(parseInt(p.pj),1):0}))
          .sort((a,b)=>b._ppg-a._ppg).slice(0,10);
        const fichasContext=fichasTop.map(p=>{
          const pctTL=parseInt(p.tl_i)?Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)+"%":"—";
          const pctT2=parseInt(p.t2_i)?Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)+"%":"—";
          const pctT3=parseInt(p.t3_i)?Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)+"%":"—";
          const ppg=p._ppg?Math.round(p._ppg*10)/10:"";
          return `#${p.num} ${p.name}${p.pos?" ["+p.pos+"]":""}: PJ:${p.pj||"?"} PT:${p.pt||"?"} Pts/pj:${ppg||"?"} Min:${p.min||"?"} %TL:${pctTL} %T2:${pctT2} %T3:${pctT3} FC:${p.fc||"?"}`;
        }).join("\n");

        const promptFichas=`Eres el preparador del CB Binissalem Sénior A analizando al equipo "${rivalName||"rival"}".

Estadísticas de los jugadores del rival:
${fichasContext}

Información adicional: ${rivalText||"No hay información adicional."}

Para CADA jugador listado arriba genera una ficha táctica usando EXACTAMENTE este formato:

FICHA_INICIO
NUM: [dorsal]
NOMBRE: [nombre exacto del jugador]
NOTAS:
- [Análisis ofensivo: zonas de tiro, movimientos favoritos, porcentajes destacados con números reales]
- [Cómo defenderle: qué hacer para neutralizarle, guardia, ayudas, presión]
- [Sus debilidades: carencias técnicas, mano mala, situaciones donde pierde protagonismo]
- [Situaciones especiales: bloqueos directos, tiros libres, transición, faltas]
- [Dato clave concreto usando sus estadísticas reales: ej "TL 75% — muy seguro en la línea" o "T3 22% — no es tirador"]
FICHA_FIN

Genera UNA ficha por cada jugador. Sé muy específico y usa los datos estadísticos reales.`;

        const contentFichas2=[...content,{type:"text",text:promptFichas}];
        try{
          const data2=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:5000,messages:[{role:"user",content:contentFichas2}]});
          const fichasText=data2.content?.find(b=>b.type==="text")?.text||"";
          const fichaRegex2=/FICHA_INICIO\s+([\s\S]*?)FICHA_FIN/g;
          let fm2;
          while((fm2=fichaRegex2.exec(fichasText))!==null){
            const bloque=fm2[1];
            const numM=bloque.match(/NUM:\s*(\S+)/);
            const nomM=bloque.match(/NOMBRE:\s*(.+)/);
            const notasM=bloque.match(/NOTAS:\s*([\s\S]+)/);
            if(numM&&notasM){
              const num=(numM[1]||"").trim();
              const nombre=(nomM?nomM[1]:"").trim();
              const notas=notasM[1].replace(/FICHA_FIN[\s\S]*/,"").trim();
              const player=fichasTop.find(p=>String(p.num)===String(num)||(nombre&&p.name.toLowerCase().includes(nombre.split(" ")[0].toLowerCase())));
              if(player){
                fichasExtracted[player.id]=notas;
              } else {
                fichasExtracted["_num_"+num]=notas;
              }
            }
          }
        }catch(e2){console.warn("Fichas call error:",e2.message);}
      }

      setRivalResult({text:aiColectivo||textClean,rival:rivalName||"Sin nombre",saved:false,playersExtracted:!!extractedPlayers,players:extractedPlayers||null,fichasCount:Object.keys(fichasExtracted).length});
    }catch(e){setRivalResult({error:e.message});}
    setRivalLoading(false);
    if(rivalFileRef.current)rivalFileRef.current.value="";
  };

  const saveScoutReport=()=>{
    if(!rivalResult||rivalResult.error||rivalResult.saved)return;
    // Siempre guardar rivalPlayers completo (tiene todos los datos actualizados) + notas
    const playersWithNotes=rivalPlayers.map(p=>{const nk=rivalNotes[p.id]!==undefined?p.id:("_num_"+p.num);return{...p,notes:rivalNotes[nk]||""};});
    setScouting(prev=>[{
      id:Date.now(),
      rival:rivalResult.rival||"Sin nombre",
      date:new Date().toISOString().split("T")[0],
      jornada:rivalJornada,fecha:rivalFecha,lugar:rivalLugar,fase:rivalFase,
      text:rivalResult.text,
      players:playersWithNotes,
      analisisAtaque,analisisDefensa,clavesAtaque,clavesDefensa,rivalMensaje,
    },...prev]);
    setRivalResult(r=>({...r,saved:true}));
  };
  const delScout=id=>setScouting(prev=>prev.filter(s=>s.id!==id));

  // PDF profesional — bloques verticales, sin símbolos markdown
  const exportScoutPDF=(sc)=>{
    const players=sc.players||[];
    const validP=players.filter(p=>p.name&&p.name.trim()&&(parseInt(p.pt)||parseInt(p.pj)||parseInt(p.min)||parseInt(p.tl_i)||parseInt(p.t2_i)||parseInt(p.t3_i)||parseInt(p.fc)));
    const scored=validP.map(p=>{
      const pt=parseInt(p.pt)||0;const pj=Math.max(parseInt(p.pj)||1,1);
      const t2m=parseInt(p.t2_m)||0;const t3m=parseInt(p.t3_m)||0;const tlm=parseInt(p.tl_m)||0;
      const t2i=Math.max(parseInt(p.t2_i)||1,1);const t3i=Math.max(parseInt(p.t3_i)||1,1);const tli=Math.max(parseInt(p.tl_i)||1,1);
      return{...p,_ppg:Math.round(pt/pj*10)/10,_score:pt/pj+((t2m/t2i+t3m/t3i+tlm/tli)/3)*8};
    }).sort((a,b)=>b._score-a._score);

    const pct=(n,d)=>parseInt(d)?Math.round(parseInt(n)/parseInt(d)*100)+"%":"—";

    // Strip markdown symbols: **, __, ##, #, leading dashes used as bullets → keep text clean
    const cleanMd=(txt="")=>txt
      .replace(/\*\*(.*?)\*\*/g,"$1")   // **bold** → bold
      .replace(/__(.*?)__/g,"$1")        // __bold__ → bold
      .replace(/^#{1,3}\s*/gm,"")        // ## headings
      .replace(/^[-•]\s/gm,"— ")         // - bullet → — bullet
      .replace(/\n{3,}/g,"\n\n")         // triple+ newlines → double
      .trim();

    // Section block — vertical, full width
    const bloque=(titulo,contenido)=>{
      const txt=cleanMd(contenido||"");
      if(!txt)return "";
      return `<div style="break-inside:avoid;margin-bottom:20px">
        <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:14px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f97316;padding:4px 0 4px 12px;margin-bottom:10px;background:#f8fafc">${titulo}</div>
        <div style="font-size:12px;line-height:1.85;color:#1e293b;white-space:pre-wrap;padding:0 4px">${txt}</div>
      </div>`;
    };

    // ── TOP 10 TABLE ──────────────────────────────────────────────
    const tableHtml=scored.length>0?`
      <div style="margin-bottom:24px">
        <div style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:14px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f97316;padding:4px 0 4px 12px;margin-bottom:10px;background:#f8fafc">Top 10 Jugadores Rivales</div>
        <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Arial,sans-serif">
          <thead><tr style="background:#1e3a5f;color:#fff">
            <th style="padding:7px 8px;text-align:center;width:28px">Pos</th>
            <th style="padding:7px 6px;text-align:center;width:26px">#</th>
            <th style="padding:7px 12px;text-align:left">Jugador</th>
            <th style="padding:7px 8px;text-align:center">PJ</th>
            <th style="padding:7px 8px;text-align:center">PT</th>
            <th style="padding:7px 8px;text-align:center">Pts/PJ</th>
            <th style="padding:7px 8px;text-align:center">Min</th>
            <th style="padding:7px 8px;text-align:center">%TL</th>
            <th style="padding:7px 8px;text-align:center">%T2</th>
            <th style="padding:7px 8px;text-align:center">%T3</th>
            <th style="padding:7px 8px;text-align:center">FC</th>
          </tr></thead>
          <tbody>${scored.slice(0,10).map((p,i)=>{
            const isTop3=i<3;
            const bg=i===0?"#fff3e6":i===1?"#fff7ed":i===2?"#fffbf5":i%2===0?"#f8fafc":"#ffffff";
            return `<tr style="background:${bg};border-left:3px solid ${isTop3?"#f97316":"transparent"};border-bottom:1px solid #e2e8f0">
              <td style="padding:8px;text-align:center;font-weight:700;font-size:13px;color:${isTop3?"#f97316":"#94a3b8"}">${i+1}.</td>
              <td style="padding:8px 6px;text-align:center;font-weight:${isTop3?700:400};color:${isTop3?"#c2410c":"#374151"}">${p.num||"—"}</td>
              <td style="padding:8px 12px;font-weight:${isTop3?700:400};color:${isTop3?"#c2410c":"#1e293b"}">${p.name||"—"}</td>
              <td style="padding:8px;text-align:center;color:#64748b">${p.pj||"—"}</td>
              <td style="padding:8px;text-align:center;font-weight:700;color:${isTop3?"#ea580c":"#374151"}">${p.pt||"—"}</td>
              <td style="padding:8px;text-align:center;color:${isTop3?"#ea580c":"#374151"}">${p._ppg||"—"}</td>
              <td style="padding:8px;text-align:center;color:#64748b">${p.min||"—"}</td>
              <td style="padding:8px;text-align:center">${pct(p.tl_m,p.tl_i)}</td>
              <td style="padding:8px;text-align:center">${pct(p.t2_m,p.t2_i)}</td>
              <td style="padding:8px;text-align:center">${pct(p.t3_m,p.t3_i)}</td>
              <td style="padding:8px;text-align:center;color:#64748b">${p.fc||"—"}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>`:"";

    // ── FICHAS INDIVIDUALES ───────────────────────────────────────
    const fichasHtml=scored.filter(p=>p.notes&&p.notes.trim()).map(p=>`
      <div style="break-inside:avoid;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;margin-bottom:14px">
        <div style="background:#1e3a5f;padding:10px 16px">
          <table style="width:100%;border-collapse:collapse">
            <tr>
              <td style="width:44px;vertical-align:middle">
                <div style="width:36px;height:36px;border-radius:18px;background:#f97316;text-align:center;line-height:36px;font-family:Barlow Condensed,Arial;font-size:17px;font-weight:800;color:#fff">${p.num||"?"}</div>
              </td>
              <td style="vertical-align:middle;padding-left:8px">
                <div style="font-family:Barlow Condensed,Arial;font-size:16px;font-weight:700;color:#fff;text-transform:uppercase">${p.name||""}</div>
                <div style="font-size:10px;color:rgba(255,255,255,.7);margin-top:2px">${[p.pos,p.pt?"PT: "+p.pt+(p._ppg?" ("+p._ppg+" pts/pj)":""):""].filter(Boolean).join("  ·  ")}</div>
              </td>
              <td style="text-align:right;vertical-align:middle;color:rgba(255,255,255,.85);font-size:11px;white-space:nowrap">
                ${[p.tl_i?"TL: "+pct(p.tl_m,p.tl_i):"",p.t2_i?"T2: "+pct(p.t2_m,p.t2_i):"",p.t3_i?"T3: "+pct(p.t3_m,p.t3_i):""].filter(Boolean).join("  ")}
              </td>
            </tr>
          </table>
        </div>
        <div style="padding:12px 16px;font-size:12px;line-height:1.85;color:#1e293b;white-space:pre-wrap;background:#fff">${cleanMd(p.notes)}</div>
      </div>`).join("");

    // ── ANÁLISIS COLECTIVO — todos en vertical ────────────────────
    const analisisBlocks=[
      bloque("Análisis colectivo del rival",sc.text),
      bloque("Ataque rival",sc.analisisAtaque),
      bloque("Defensa rival",sc.analisisDefensa),
      bloque("Claves del partido — Ataque",sc.clavesAtaque),
      bloque("Claves del partido — Defensa",sc.clavesDefensa),
      sc.rivalMensaje?`<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:4px;padding:14px 18px;font-size:12px;font-style:italic;color:#1e293b;margin-top:8px">${cleanMd(sc.rivalMensaje)}</div>`:"",
    ].filter(Boolean).join("");

    const subtitle=[sc.fase,sc.jornada,sc.fecha,sc.lugar].filter(Boolean).join(" · ")||sc.date||"";
    const w=window.open("","_blank");
    w.document.write(pdfOpen(`Scouting — ${sc.rival}`)
      +pdfHeader(`SCOUTING — ${(sc.rival||"").toUpperCase()}`,subtitle)
      +tableHtml
      +(fichasHtml?`<div style="margin-bottom:24px"><div style="font-family:'Barlow Condensed',Arial,sans-serif;font-size:14px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f97316;padding:4px 0 4px 12px;margin-bottom:14px;background:#f8fafc">Fichas individuales</div>${fichasHtml}</div>`:"")
      +`<div>${analisisBlocks}</div>`
      +pdfClose());
    w.document.close();setTimeout(()=>w.print(),400);
  };

  const generateSession=async()=>{
    if(noKey){setSesResult({error:"Configura tu API Key en ⚙️ Ajustes."});return;}
    if(!sesObj.trim()){setSesResult({error:"Describe el objetivo del entrenamiento."});return;}
    setSesLoading(true);setSesResult(null);setSesSaved(false);
    try{
      const data=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Eres entrenador de baloncesto. Genera sesión completa:\n- Duración: ${sesDur} min\n- Tipo: ${sesFocus}\n- Objetivo: ${sesObj}\n- Nivel: Sénior amateur\n\nIncluye:\n1. TÍTULO (una línea, descriptivo)\n2. CALENTAMIENTO\n3. PARTE PRINCIPAL: 3-4 ejercicios\n4. VUELTA A LA CALMA\n5. PUNTOS CLAVE\n\nFormato práctico.`}]});
      const text=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";
      // Extract title from first line
      const lines=text.split("\n").filter(l=>l.trim());
      const titleRaw=lines[0]?.replace(/^#+\s*/,"").replace(/^1\.\s*/,"").replace(/^TÍTULO[:\s]*/i,"").trim()||sesObj;
      setSesResult({text,title:titleRaw,date:sesDate,type:sesFocus,dur:+sesDur,obj:sesObj});
    }catch(e){setSesResult({error:e.message});}
    setSesLoading(false);
  };

  const saveSessionToCalendar=()=>{
    if(!sesResult||sesResult.error)return;
    const id=sessions.length?Math.max(...sessions.map(s=>s.id))+1:1;
    const exsList=sesResult.text.split("\n").filter(l=>l.trim()&&l.length>10&&!l.startsWith("#")).slice(0,12);
    setSessions(prev=>[...prev,{id,date:sesResult.date,time:"",type:sesResult.type,dur:sesResult.dur,title:sesResult.title,exs:exsList,exObjs:[],notes:sesResult.text,images:[]}]);
    setSesSaved(true);
  };
  const saveSessionAsTemplate=()=>{
    if(!sesResult||sesResult.error)return;
    const id=Date.now();
    const exs=sesResult.text.split("\n").filter(l=>l.trim()&&l.length>10).slice(0,12).join("\n");
    setSesionTemplates(prev=>[...prev,{id,name:sesResult.title,type:sesResult.type,dur:sesResult.dur,title:sesResult.title,exs,notes:sesResult.text}]);
  };

  const generateResumen=async()=>{
    if(noKey){setResResult({error:"Configura tu API Key en ⚙️ Ajustes."});return;}
    setResLoading(true);setResResult(null);
    try{
      const played=matches.filter(m=>m.pts_us!=null);
      const wins=played.filter(m=>m.pts_us>m.pts_them).length;
      const active=players.filter(p=>p.active);
      const statsStr=active.map(p=>{const c=calcStats(p);return `${p.name}: PJ ${p.pj}, PTS/P ${c.pts_p}, T2% ${c.t2_pct}%, T3% ${c.t3_pct}%, TL% ${c.tl_pct}%`;}).join("\n");
      const matchStr=played.slice(-10).map(m=>`${m.date} vs ${m.rival}: ${m.pts_us}-${m.pts_them} (${m.pts_us>m.pts_them?"V":"D"})`).join("\n");
      const data=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:1400,messages:[{role:"user",content:`Eres analista del CB Binissalem Sénior A. Informe narrativo:\n\nRESULTADOS (${wins}V-${played.length-wins}D):\n${matchStr||"Sin partidos registrados"}\n\nESTADÍSTICAS:\n${statsStr||"Sin datos"}\n\nSESIONES: ${sessions.length}\n\nIncluye:\n1. RESUMEN EJECUTIVO\n2. ANÁLISIS OFENSIVO\n3. ANÁLISIS DEFENSIVO\n4. JUGADORES DESTACADOS\n5. ÁREAS DE MEJORA\n6. CONCLUSIÓN\n\nTono profesional, datos reales.`}]});
      setResResult({text:data.content?.find(b=>b.type==="text")?.text||"Sin respuesta."});
    }catch(e){setResResult({error:e.message});}
    setResLoading(false);
  };

  const ResultBox=({result,loading,onPDF,pdfTitle})=>{
    if(loading)return <div style={{textAlign:"center",padding:"40px 0"}}><Loader size={28} color="#f97316" style={{animation:"spin 1s linear infinite",margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted,fontSize:13}}>La IA está analizando…</p></div>;
    if(!result)return null;
    if(result.error)return <div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ef4444"}}>{result.error}</div>;
    return <div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
        <button onClick={()=>exportToPDF(pdfTitle,result.text,pdfTitle)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
          <Printer size={13}/>Descargar PDF
        </button>
      </div>
      <div style={{background:th.card2,borderRadius:10,padding:20,border:`1px solid ${th.border}`,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:520,overflowY:"auto"}}>{result.text}</div>
    </div>;
  };

  return <div>
    <SH title="IA Asistente" sub="Análisis táctico · Sesiones · Resumen de temporada"/>
    {noKey&&<div style={{background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.3)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#f59e0b"}}>
      ⚙️ Configura tu API Key de Anthropic en el botón <strong>⚙️ API Key</strong> del sidebar.
    </div>}
    <TB tabs={[["rival","🏀 Análisis Rival"],["sesion","📋 Generador de Sesión"],["resumen","📊 Resumen Temporada"]]} active={tab} onChange={setTab}/>

    {tab==="rival"&&<div>
      {/* Historial de informes — cabecera horizontal */}
      {scouting.length>0&&<div style={{marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>
          Historial de informes <span style={{color:"#f97316"}}>({scouting.length})</span>
        </p>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {scouting.map(s=>(
            <div key={s.id}
              onClick={()=>{setSelScout(selScout?.id===s.id?null:s);setRivalResult(null);}}
              style={{flexShrink:0,padding:"8px 14px",borderRadius:8,background:selScout?.id===s.id?"rgba(249,115,22,.1)":th.card2,
                border:`1px solid ${selScout?.id===s.id?"#f97316":th.border}`,cursor:"pointer",minWidth:140,maxWidth:180,position:"relative"}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:selScout?.id===s.id?"#f97316":th.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.rival}</p>
              <p style={{fontFamily:"DM Mono",fontSize:9,color:th.muted,marginTop:2}}>{s.date}</p>
              <button onClick={e=>{e.stopPropagation();delScout(s.id);if(selScout?.id===s.id)setSelScout(null);}}
                style={{position:"absolute",top:4,right:4,width:18,height:18,borderRadius:4,border:"none",background:"transparent",cursor:"pointer",color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>✕</button>
            </div>
          ))}
        </div>
      </div>}

      {/* Contenido principal — ancho completo */}
      <div>
        {/* ── CABECERA DEL PARTIDO ─────────────────────────────── */}
        <div className="card" style={{padding:20,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text,textTransform:"uppercase",letterSpacing:.5}}>Datos del partido</p>
            <button onClick={resetRival} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:12,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
              <RotateCcw size={12}/>Nuevo informe
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl>Rival</Lbl><input value={rivalName} onChange={e=>setRivalName(e.target.value)} placeholder="Ej: CB Inca A"/></div>
            <div><Lbl>Jornada</Lbl><input value={rivalJornada} onChange={e=>setRivalJornada(e.target.value)} placeholder="J-12"/></div>
            <div><Lbl>Fecha</Lbl><input type="date" value={rivalFecha} onChange={e=>setRivalFecha(e.target.value)}/></div>
            <div><Lbl>Lugar</Lbl><input value={rivalLugar} onChange={e=>setRivalLugar(e.target.value)} placeholder="Pabellón…"/></div>
            <div><Lbl>Fase</Lbl>
              <select value={rivalFase} onChange={e=>setRivalFase(e.target.value)}>
                {["Liga Regular","Play-off","Copa","Amistoso","Otro"].map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div><Lbl>Información general — contexto, estilo de juego, resultados recientes</Lbl>
            <textarea rows={3} value={rivalText} onChange={e=>setRivalText(e.target.value)}
              placeholder="Ej: Equipo rápido en transición, base muy peligroso #9 (20pts/pj), defienden en zona 2-3 cuando pierden…"/>
          </div>
        </div>

        {/* ── ESTADÍSTICAS DE JUGADORES ────────────────────────── */}
        <div className="card" style={{padding:20,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text,textTransform:"uppercase",letterSpacing:.5}}>
              Estadísticas de jugadores
            </p>
            <div style={{display:"flex",gap:8}}>
              <input ref={rivalFileRef} type="file" accept=".pdf" style={{display:"none"}}/>
              <button onClick={()=>rivalFileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:11,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <FileText size={11}/>PDF federación
              </button>
              <button onClick={addRP} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:11,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Plus size={11}/>Añadir fila
              </button>
            </div>
          </div>
          <p style={{fontSize:10,color:th.muted,marginBottom:10}}>Sube el PDF de la federación para autocompletar · O rellena manualmente · Los datos enriquecen el informe IA y el PDF</p>
          <div style={{overflow:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
              <thead>
                <tr style={{background:th.tableHead}}>
                  {["#","Nombre","Pos","PJ","PT","Min","TL-I","TL-M","T2-I","T2-M","T3-I","T3-M","FC",""].map((h,i)=>(
                    <th key={i} style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",textAlign:i<=2||i===13?"left":"center",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{rivalPlayers.map(p=>{
                const ni={type:"text",inputMode:"numeric",pattern:"[0-9]*",maxLength:3,style:{width:44,textAlign:"center",fontSize:11,padding:"3px 2px",borderRadius:4,border:`1px solid ${th.border2}`,background:th.inputBg,color:th.text}};
                return <tr key={p.id} style={{borderTop:`1px solid ${th.border}`}}>
                  <td style={{padding:"3px 4px"}}><input value={p.num} onChange={e=>setRP(p.id,"num",e.target.value)} maxLength={3} style={{width:44,textAlign:"center",fontSize:11,padding:"3px 2px",borderRadius:4,border:`1px solid ${th.border2}`,background:th.inputBg,color:th.text}}/></td>
                  <td style={{padding:"3px 6px"}}><input value={p.name} onChange={e=>setRP(p.id,"name",e.target.value)} style={{width:130,fontSize:11}}/></td>
                  <td style={{padding:"3px 4px"}}>
                    <select value={p.pos||""} onChange={e=>setRP(p.id,"pos",e.target.value)} style={{fontSize:10,padding:"2px 3px",width:70}}>
                      <option value="">—</option>
                      {["Base","Escolta","Alero","Ala-Pívot","Pívot"].map(pos=><option key={pos}>{pos}</option>)}
                    </select>
                  </td>
                  {["pj","pt","min","tl_i","tl_m","t2_i","t2_m","t3_i","t3_m","fc"].map(f=>(
                    <td key={f} style={{padding:"3px 2px",textAlign:"center"}}>
                      <input {...ni} value={p[f]} onChange={e=>setRP(p.id,f,e.target.value)}/>
                    </td>
                  ))}
                  <td style={{padding:"3px 4px"}}><button onClick={()=>delRP(p.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:2}}><Trash2 size={11}/></button></td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>

        {/* ── FICHAS INDIVIDUALES — A TENER EN CUENTA ─────────── */}
        {rivalPlayers.filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)).length>0&&(
          <div className="card" style={{padding:20,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text,textTransform:"uppercase",letterSpacing:.5}}>
                Fichas individuales — A tener en cuenta
              </p>
              <span style={{fontSize:10,color:th.muted}}>Clic en ✏️ para editar cada ficha</span>
            </div>
            <p style={{fontSize:10,color:th.muted,marginBottom:14}}>Para cada jugador anota sus tendencias, puntos fuertes/débiles, cómo atacarle y defenderle</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
              {rivalPlayers.filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)).map(p=>{
                const pct2=parseInt(p.t2_i)?Math.round(parseInt(p.t2_m)/parseInt(p.t2_i)*100)+"%":"—";
                const pct3=parseInt(p.t3_i)?Math.round(parseInt(p.t3_m)/parseInt(p.t3_i)*100)+"%":"—";
                const pctTL=parseInt(p.tl_i)?Math.round(parseInt(p.tl_m)/parseInt(p.tl_i)*100)+"%":"—";
                const ppg=parseInt(p.pt)&&parseInt(p.pj)?Math.round(parseInt(p.pt)/parseInt(p.pj)*10)/10:null;
                const _nk=rivalNotes[p.id]!==undefined?p.id:("_num_"+p.num); // fallback por dorsal
                const hasNote=!!(rivalNotes[_nk]||"").trim();
                const isEditing=rivalNotesEditing&&rivalNotesEditing[p.id];
                return <div key={p.id} style={{border:`1px solid ${th.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                  {/* Header ficha */}
                  <div style={{background:th.tableHead,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:18,background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:16,fontWeight:800,color:"#fff",flexShrink:0}}>
                      {p.num||"?"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</p>
                      <p style={{fontSize:10,color:th.muted}}>{p.pos||"Posición no indicada"}</p>
                    </div>
                    {ppg&&<div style={{textAlign:"right",marginRight:6}}>
                      <p style={{fontFamily:"DM Mono",fontSize:18,fontWeight:700,color:"#f97316",lineHeight:1}}>{ppg}</p>
                      <p style={{fontSize:9,color:th.muted}}>pts/pj</p>
                    </div>}
                    <button
                      onClick={()=>setRivalNotesEditing(prev=>({...prev,[p.id]:!prev?.[p.id]}))}
                      title={isEditing?"Guardar y ver":"Editar ficha"}
                      style={{width:28,height:28,borderRadius:7,border:`1px solid ${th.border2}`,background:isEditing?"rgba(249,115,22,.12)":th.card2,cursor:"pointer",color:isEditing?"#f97316":th.muted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                      {isEditing?"✓":"✏️"}
                    </button>
                  </div>
                  {/* Mini stats */}
                  {(p.pt||p.min||p.tl_i||p.t2_i||p.t3_i)&&(
                    <div style={{display:"flex",gap:0,borderBottom:`1px solid ${th.border}`,background:th.card2}}>
                      {[["PJ",p.pj],["PT",p.pt],["Min",p.min],["TL",pctTL],["T2",pct2],["T3",pct3]].map(([l,v])=>v&&v!=="—"?(
                        <div key={l} style={{flex:1,textAlign:"center",padding:"6px 4px",borderRight:`1px solid ${th.border}`}}>
                          <p style={{fontFamily:"DM Mono",fontSize:11,fontWeight:600,color:th.text}}>{v}</p>
                          <p style={{fontSize:9,color:th.muted}}>{l}</p>
                        </div>
                      ):null)}
                    </div>
                  )}
                  {/* Contenido — modo lectura o edición */}
                  <div style={{padding:10,flex:1}}>
                    {isEditing
                      ?<textarea
                          autoFocus
                          value={rivalNotes[_nk]||""}
                          onChange={e=>setRivalNote(_nk,e.target.value)}
                          placeholder={"A tener en cuenta:\n- Tendencias de tiro (mano, zona, tipo)\n- Cómo atacarle en defensa\n- Cómo defenderle en ataque\n- Situaciones especiales (BD, faltas…)"}
                          style={{fontSize:11,lineHeight:1.6,resize:"vertical",width:"100%",fontFamily:"inherit",minHeight:140}}/>
                      :<div style={{fontSize:11,color:hasNote?th.text:th.muted,lineHeight:1.7,whiteSpace:"pre-wrap",cursor:"pointer",minHeight:80}}
                          onClick={()=>setRivalNotesEditing(prev=>({...prev,[p.id]:true}))}>
                          {hasNote
                            ?rivalNotes[_nk]
                            :<span style={{fontStyle:"italic",opacity:.7}}>Sin notas — clic aquí o en ✏️ para añadir el análisis táctico de este jugador</span>}
                        </div>
                    }
                  </div>
                </div>;
              })}
            </div>
          </div>
        )}

        {/* ── ANÁLISIS COLECTIVO ESTRUCTURADO ─────────────────── */}
        <div className="card" style={{padding:20,marginBottom:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text,textTransform:"uppercase",letterSpacing:.5,marginBottom:14}}>
            Análisis colectivo
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div>
              <Lbl>⚔️ Ataque rival — puntos fuertes y sistemas</Lbl>
              <textarea rows={6} value={analisisAtaque} onChange={e=>setAnalisisAtaque(e.target.value)}
                placeholder={"1. Sistema principal: bloqueo directo base-pívot\n2. Tiradores: #4 (T3 45%), #21 pop en BD\n3. Penetradores: #9 muy rápido a campo abierto\n4. Rebote ofensivo peligroso con #1 (2.6pp)"}/>
            </div>
            <div>
              <Lbl>🛡 Defensa rival — sistema y vulnerabilidades</Lbl>
              <textarea rows={6} value={analisisDefensa} onChange={e=>setAnalisisDefensa(e.target.value)}
                placeholder={"1. Defienden en M-M individual todo el partido\n2. Vulnerables en el roll profundo del pívot\n3. Interiores lentos en el balance defensivo\n4. Pueden poner zona 2-3 si van perdiendo"}/>
            </div>
            <div>
              <Lbl>🏀 Claves del partido — qué hacemos en ATAQUE</Lbl>
              <textarea rows={6} value={clavesAtaque} onChange={e=>setClavesAtaque(e.target.value)}
                placeholder={"1. Explotar ventaja interior, meter el balón al poste\n2. Correr en transición antes de que organicen defensa\n3. Atacar el rebote ofensivo con exteriores\n4. Tiro liberado en esquinas tras penetración"}/>
            </div>
            <div>
              <Lbl>💪 Claves del partido — qué hacemos en DEFENSA</Lbl>
              <textarea rows={6} value={clavesDefensa} onChange={e=>setClavesDefensa(e.target.value)}
                placeholder={"1. No dejar correr a #9 — balance defensivo siempre\n2. BD de #4 y #21: pasar por delante, no por detrás\n3. Cerrar la derecha de #24 en el poste bajo\n4. Rebote defensivo obligatorio en cada posesión"}/>
            </div>
          </div>
          <div>
            <Lbl>💬 Mensaje motivacional (opcional)</Lbl>
            <textarea rows={2} value={rivalMensaje} onChange={e=>setRivalMensaje(e.target.value)}
              placeholder="Ej: Es el partido más importante de la temporada. Tenemos ventaja en el interior y si jugamos nuestro juego los podemos ganar."/>
          </div>
        </div>

        {/* ── GENERAR INFORME IA ───────────────────────────────── */}
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:14}}>
          <Btn onClick={analyzeRival} disabled={rivalLoading} icon={rivalLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={13}/>}>
            {rivalLoading?"Analizando…":"Generar análisis IA completo"}
          </Btn>
          <p style={{fontSize:11,color:th.muted}}>La IA leerá todos los datos y generará el análisis táctico · Requiere API Key configurada</p>
        </div>

        {/* Resultado generado */}
        {rivalLoading&&<div style={{textAlign:"center",padding:"40px 0"}}><Loader size={28} color="#f97316" style={{animation:"spin 1s linear infinite",margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted,fontSize:13}}>La IA está analizando…</p></div>}

        {/* Top 10 y resultado IA — solo cuando NO hay informe guardado seleccionado */}
        {!selScout&&!rivalLoading&&(()=>{
          // Siempre usar rivalPlayers — se actualiza con setRivalPlayers() tras extracción PDF
          const allP=rivalPlayers
            .filter(p=>p.name&&(parseInt(p.pt)||parseInt(p.pj)||parseInt(p.min)||parseInt(p.tl_i)||parseInt(p.t2_i)||parseInt(p.t3_i)||parseInt(p.fc)));
          if(!allP.length)return null;
          const ranked=[...allP].map(p=>{
            const pt=parseInt(p.pt)||0;const pj=Math.max(parseInt(p.pj)||1,1);
            const t2m=parseInt(p.t2_m)||0;const t3m=parseInt(p.t3_m)||0;const tlm=parseInt(p.tl_m)||0;
            const t2i=Math.max(parseInt(p.t2_i)||1,1);const t3i=Math.max(parseInt(p.t3_i)||1,1);const tli=Math.max(parseInt(p.tl_i)||1,1);
            return{...p,_ppg:Math.round(pt/pj*10)/10,_score:pt/pj+((t2m/t2i+t3m/t3i+tlm/tli)/3)*8};
          }).sort((a,b)=>b._score-a._score).slice(0,10);
          return <Top10Table players={ranked} th={th}/>;
        })()}

        {!selScout&&rivalResult&&!rivalLoading&&(
          rivalResult.error
          ?<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ef4444"}}>{rivalResult.error}</div>
          :<div>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <button onClick={saveScoutReport} disabled={rivalResult.saved}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(16,185,129,.4)",background:rivalResult.saved?"rgba(16,185,129,.15)":"rgba(16,185,129,.07)",cursor:rivalResult.saved?"default":"pointer",color:"#10b981",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Save size={12}/>{rivalResult.saved?"✓ Guardado en historial":"Guardar informe"}
              </button>
              <button onClick={()=>exportScoutPDF({rival:rivalResult.rival,date:new Date().toISOString().split("T")[0],jornada:rivalJornada,fecha:rivalFecha,lugar:rivalLugar,fase:rivalFase,text:rivalResult.text,players:rivalPlayers.map(p=>({...p,notes:rivalNotes[p.id]||rivalNotes["_num_"+p.num]||""})),analisisAtaque,analisisDefensa,clavesAtaque,clavesDefensa,rivalMensaje})}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Printer size={12}/>Descargar PDF
              </button>
            </div>
            {rivalResult.saved&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#10b981"}}>
              ✅ Informe guardado — visible en el historial de informes
            </div>}
            {rivalResult.playersExtracted&&<div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#8b5cf6",display:"flex",alignItems:"center",gap:6}}>
              <Users size={13}/>Jugadores detectados automáticamente del PDF — revisa la tabla y edita si es necesario
            </div>}
            {rivalResult.fichasCount>0&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#10b981",display:"flex",alignItems:"center",gap:6}}>
              ✓ {rivalResult.fichasCount} fichas individuales generadas y auto-rellenadas — revisa y edita en la sección "A tener en cuenta"
            </div>}
            <div style={{background:th.card2,borderRadius:10,padding:20,border:`1px solid ${th.border}`,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:480,overflowY:"auto"}}>{rivalResult.text}</div>
          </div>
        )}

        {/* Informe guardado seleccionado */}
        {selScout&&!rivalResult&&<div>
          {/* Cabecera */}
          <div className="card" style={{padding:"16px 20px",marginBottom:12,borderTop:"4px solid #1e3a5f"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
              <div>
                <p style={{fontFamily:"Barlow Condensed",fontSize:24,fontWeight:800,color:th.text,lineHeight:1}}>{selScout.rival}</p>
                <p style={{fontSize:11,color:th.muted,marginTop:4}}>
                  {[selScout.fase,selScout.jornada,selScout.fecha,selScout.lugar].filter(Boolean).join(" · ")||selScout.date}
                </p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>exportScoutPDF(selScout)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                  <Printer size={12}/>Descargar PDF
                </button>
                <button onClick={()=>setSelScout(null)}
                  style={{padding:"7px 12px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:12,fontFamily:"Barlow Condensed,sans-serif"}}>
                  ✕ Cerrar
                </button>
              </div>
            </div>
          </div>

          {/* Top 10 ranking */}
          {(()=>{
            const allP=(selScout.players||[]).filter(p=>p.name&&(p.pt||p.pj||p.min||p.tl_i||p.t2_i||p.t3_i||p.fc));
            if(!allP.length)return null;
            const ranked=[...allP].map(p=>{
              const pt=parseInt(p.pt)||0;const pj=Math.max(parseInt(p.pj)||1,1);
              const t2m=parseInt(p.t2_m)||0;const t3m=parseInt(p.t3_m)||0;const tlm=parseInt(p.tl_m)||0;
              const t2i=Math.max(parseInt(p.t2_i)||1,1);const t3i=Math.max(parseInt(p.t3_i)||1,1);const tli=Math.max(parseInt(p.tl_i)||1,1);
              return{...p,_ppg:Math.round(pt/pj*10)/10,_score:pt/pj+((t2m/t2i+t3m/t3i+tlm/tli)/3)*8};
            }).sort((a,b)=>b._score-a._score).slice(0,10);
            return <Top10Table players={ranked} th={th}/>;
          })()}

          {/* Fichas individuales con notas */}
          {(selScout.players||[]).filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)&&p.notes).length>0&&(
            <div className="card" style={{padding:16,marginBottom:12}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Fichas individuales</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
                {(selScout.players||[]).filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)&&p.notes).map((p,i)=>(
                  <div key={i} style={{border:`1px solid ${th.border}`,borderRadius:8,overflow:"hidden"}}>
                    <div style={{background:th.tableHead,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:30,height:30,borderRadius:15,background:"#1e3a5f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>{p.num||"?"}</div>
                      <div>
                        <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.text}}>{p.name}</p>
                        <p style={{fontSize:9,color:th.muted}}>{p.pos||""}</p>
                      </div>
                    </div>
                    <div style={{padding:"10px 12px",fontSize:12,color:th.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{p.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análisis colectivo estructurado */}
          {(selScout.analisisAtaque||selScout.analisisDefensa||selScout.clavesAtaque||selScout.clavesDefensa)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              {[
                ["⚔️ Ataque rival",selScout.analisisAtaque],
                ["🛡 Defensa rival",selScout.analisisDefensa],
                ["🏀 Claves — Ataque",selScout.clavesAtaque],
                ["💪 Claves — Defensa",selScout.clavesDefensa],
              ].filter(([,v])=>v).map(([titulo,contenido])=>(
                <div key={titulo} className="card" style={{padding:14}}>
                  <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:1,marginBottom:8,borderLeft:"3px solid #f97316",paddingLeft:8}}>{titulo}</p>
                  <div style={{fontSize:12,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{contenido}</div>
                </div>
              ))}
            </div>
          )}

          {/* Análisis IA */}
          {selScout.text&&<div className="card" style={{padding:16,marginBottom:12}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Análisis generado por IA</p>
            <div style={{fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto"}}>{selScout.text}</div>
          </div>}

          {/* Mensaje motivacional */}
          {selScout.rivalMensaje&&<div style={{background:"rgba(249,115,22,.06)",border:"1px solid rgba(249,115,22,.25)",borderRadius:8,padding:"14px 18px",fontSize:13,color:th.text,lineHeight:1.7,fontStyle:"italic"}}>
            {selScout.rivalMensaje}
          </div>}
        </div>}
      </div>
    </div>}

    {tab==="sesion"&&<div>
      <div className="card" style={{padding:20,marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text,marginBottom:14}}>Describe el entrenamiento que necesitas</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 120px 180px 140px",gap:12,marginBottom:14}}>
          <div><Lbl>Objetivo principal</Lbl><input value={sesObj} onChange={e=>setSesObj(e.target.value)} placeholder="Ej: defensa press y contraataque…"/></div>
          <div><Lbl>Duración (min)</Lbl><input type="number" value={sesDur} onChange={e=>setSesDur(e.target.value)}/></div>
          <div><Lbl>Tipo de sesión</Lbl><select value={sesFocus} onChange={e=>setSesFocus(e.target.value)}>{["Técnico-Táctico","Físico","Técnico","Táctico","Recuperación","Pre-partido"].map(t=><option key={t}>{t}</option>)}</select></div>
          <div><Lbl>Fecha del entreno</Lbl><input type="date" value={sesDate} onChange={e=>setSesDate(e.target.value)}/></div>
        </div>
        <Btn onClick={generateSession} disabled={sesLoading} icon={sesLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={13}/>}>
          {sesLoading?"Generando…":"Generar sesión completa"}
        </Btn>
      </div>

      {sesLoading&&<div style={{textAlign:"center",padding:"40px 0"}}><Loader size={28} color="#f97316" style={{animation:"spin 1s linear infinite",margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted,fontSize:13}}>Generando sesión…</p></div>}

      {sesResult&&!sesResult.error&&!sesLoading&&<div>
        {/* Acciones sobre la sesión generada */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <button onClick={saveSessionToCalendar} disabled={sesSaved}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(16,185,129,.4)",background:sesSaved?"rgba(16,185,129,.15)":"rgba(16,185,129,.07)",cursor:sesSaved?"default":"pointer",color:"#10b981",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            <Calendar size={13}/>{sesSaved?"✓ Añadido al calendario":"Añadir al calendario de entrenamientos"}
          </button>
          <button onClick={saveSessionAsTemplate}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(139,92,246,.4)",background:"rgba(139,92,246,.07)",cursor:"pointer",color:"#8b5cf6",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            <Copy size={13}/>Guardar como plantilla
          </button>
          <button onClick={()=>exportToPDF(`Sesión: ${sesResult.title}`,sesResult.text,`${sesResult.date} · ${sesResult.dur} min · ${sesResult.type}`)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
            <Printer size={13}/>Descargar PDF
          </button>
        </div>
        {sesSaved&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#10b981"}}>
          ✅ Sesión añadida para el {sesDate} — visible en Entrenamientos y Calendario
        </div>}
        <div style={{background:th.card2,borderRadius:10,padding:20,border:`1px solid ${th.border}`,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:520,overflowY:"auto"}}>{sesResult.text}</div>
      </div>}
      {sesResult?.error&&<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ef4444"}}>{sesResult.error}</div>}
    </div>}

    {tab==="resumen"&&<div>
      <div className="card" style={{padding:20,marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text,marginBottom:4}}>Informe narrativo de temporada</p>
        <p style={{fontSize:12,color:th.muted,marginBottom:14}}>La IA analiza todos tus datos actuales y genera un informe completo.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
          {[["Partidos jugados",matches.filter(m=>m.pts_us!=null).length],["Victorias",matches.filter(m=>m.pts_us!=null&&m.pts_us>m.pts_them).length],["Jugadores activos",players.filter(p=>p.active).length],["Sesiones",sessions.length]].map(([l,v])=>(
            <div key={l} style={{textAlign:"center",padding:"12px 8px",background:th.card2,borderRadius:8,border:`1px solid ${th.border}`}}>
              <p style={{fontFamily:"DM Mono",fontSize:24,fontWeight:700,color:"#f97316",marginBottom:4}}>{v}</p>
              <p style={{fontSize:10,color:th.muted,fontFamily:"Barlow Condensed",textTransform:"uppercase"}}>{l}</p>
            </div>
          ))}
        </div>
        <Btn onClick={generateResumen} disabled={resLoading} icon={resLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={13}/>}>
          {resLoading?"Analizando…":"Generar resumen de temporada"}
        </Btn>
      </div>
      <ResultBox result={resResult} loading={resLoading} pdfTitle="Resumen de Temporada — CB Binissalem Sénior A"/>
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE 3 — Modo Partido · Carga Trabajo · Evolución Stats · Informe PDF
══════════════════════════════════════════════════════════ */

/* ── QInput / SF — top-level para evitar pérdida de foco en ModoPartido ── */
function QInput({val,onChange,color="#f97316"}){
  const{th}=useTheme();
  return <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
    value={val} onChange={e=>{if(/^\d*$/.test(e.target.value))onChange(e.target.value);}}
    style={{width:64,height:44,textAlign:"center",fontFamily:"DM Mono",fontSize:18,fontWeight:700,
      color,padding:"4px",borderRadius:8,border:`2px solid ${val?color:th.border2}`,
      background:val?color+"0d":th.inputBg}}/>;
}
function SF({label,pid,field,small,getStat,setStat,statsCommitted}){
  const{th}=useTheme();
  return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
    <span style={{fontFamily:"Barlow Condensed",fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:.3}}>{label}</span>
    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
      value={getStat(pid,field)} onChange={e=>{if(/^\d*$/.test(e.target.value))setStat(pid,field,e.target.value);}}
      disabled={statsCommitted}
      style={{width:small?44:50,height:34,textAlign:"center",fontFamily:"DM Mono",fontSize:13,
        fontWeight:600,padding:"2px",borderRadius:6,border:`1px solid ${th.border2}`,
        background:statsCommitted?th.card2:th.inputBg,color:th.text,opacity:statsCommitted?.6:1}}/>
  </div>;
}

function ModoPartido(){  const{th}=useTheme();const{matches,setMatches,players,setPlayers,apiKey}=useData();
  const today=new Date().toISOString().split("T")[0];
  const allSorted=[...matches].sort((a,b)=>b.date.localeCompare(a.date));
  const[sel,setSel]=useState(null);
  const m=matches.find(x=>x.id===sel)||allSorted[0];
  const[tab,setTab]=useState("marcador");
  const[pdfLoading,setPdfLoading]=useState(false);
  const[pdfMsg,setPdfMsg]=useState(null);
  const pdfRef=useRef();

  // Cuartos — inicializamos del partido guardado o vacíos
  const initQ=side=>(m?.quarters?.[side]||[0,0,0,0]).map(String);
  const[qUs,setQUs]=useState(["","","",""]);
  const[qTh,setQTh]=useState(["","","",""]);

  // Stats por jugador {playerId: {pt,tl_i,tl_m,t2_i,t2_m,t3_i,t3_m,fc, min}}
  const[pStats,setPStats]=useState({});
  const[statsCommitted,setStatsCommitted]=useState(false);

  const convPlayers=(m?.convocados||[]).map(id=>players.find(p=>p.id===id)).filter(Boolean);

  // Cargar datos del partido seleccionado
  useEffect(()=>{
    if(!m)return;
    setQUs(m.quarters?.us?.map(String)||["","","",""]);
    setQTh(m.quarters?.them?.map(String)||["","","",""]);
    setPStats(m.playerStats||{});
    setStatsCommitted(!!m.statsCommitted);
    setTab("marcador");
  },[m?.id]);

  const totUs=qUs.reduce((a,v)=>a+(+v||0),0);
  const totTh=qTh.reduce((a,v)=>a+(+v||0),0);
  const hasQuarters=qUs.some(v=>v!=="");
  const finalUs=hasQuarters?totUs:(m?.pts_us??null);
  const finalTh=hasQuarters?totTh:(m?.pts_them??null);
  const hasResult=finalUs!=null;
  const win=hasResult&&finalUs>finalTh;
  const resultColor=hasResult?(win?"#10b981":"#ef4444"):"#6366f1";

  const setQVal=(arr,setArr,i,v)=>{const n=[...arr];n[i]=v;setArr(n);};
  const setStat=(pid,field,val)=>setPStats(prev=>({...prev,[pid]:{...(prev[pid]||{}), [field]:val}}));
  const getStat=(pid,field)=>pStats[pid]?.[field]??"";

  // Guardar cuartos + resultado total en el partido
  const saveQuarters=()=>{
    if(!m)return;
    setMatches(prev=>prev.map(x=>x.id===m.id?{
      ...x,
      quarters:{us:qUs.map(v=>+v||0),them:qTh.map(v=>+v||0)},
      pts_us:hasQuarters?totUs:x.pts_us,
      pts_them:hasQuarters?totTh:x.pts_them,
    }:x));
  };

  // Confirmar stats individuales → suman a totales de temporada
  const commitStats=()=>{
    if(!m||statsCommitted)return;
    if(!Object.keys(pStats).length){alert("Introduce al menos las estadísticas de un jugador.");return;}
    // Update players stats
    setPlayers(prev=>prev.map(p=>{
      const ms=pStats[p.id];
      if(!ms)return p;
      return{
        ...p,
        pj:(p.pj||0)+1,
        pt:(p.pt||0)+(+ms.pt||0),
        min:(p.min||0)+(+ms.min||0),
        tl_i:(p.tl_i||0)+(+ms.tl_i||0),
        tl_m:(p.tl_m||0)+(+ms.tl_m||0),
        t2_i:(p.t2_i||0)+(+ms.t2_i||0),
        t2_m:(p.t2_m||0)+(+ms.t2_m||0),
        t3_i:(p.t3_i||0)+(+ms.t3_i||0),
        t3_m:(p.t3_m||0)+(+ms.t3_m||0),
        fc:(p.fc||0)+(+ms.fc||0),
      };
    }));
    // Save stats in match + mark committed
    setMatches(prev=>prev.map(x=>x.id===m.id?{...x,playerStats:pStats,statsCommitted:true}:x));
    setStatsCommitted(true);
  };

  // ── PDF import for match stats ─────────────────────────────
  const importStatsPDF=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(!apiKey){setPdfMsg("❌ Configura tu API Key en ⚙️ Ajustes.");e.target.value="";return;}
    if(!m){e.target.value="";return;}
    setPdfLoading(true);setPdfMsg("Leyendo estadísticas del PDF…");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const convNames=convPlayers.map(p=>"#"+p.num+" "+p.name).join(", ");
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
          {type:"text",text:"Analiza esta estadística de partido de baloncesto. Extrae las estadísticas de TODOS los jugadores que encuentres.\n"
            +"Jugadores de CB Binissalem: "+convNames+"\n\n"
            +"Devuelve ÚNICAMENTE JSON válido en una sola línea (sin markdown):\n"
            +'{"nuestros":[{"num":"4","name":"Nombre","pt":"12","min":"25","tl_i":"3","tl_m":"2","t2_i":"8","t2_m":"5","t3_i":"4","t3_m":"2","fc":"3"}],'
            +'"rivales":[{"num":"5","name":"Nombre","pt":"15","min":"30","tl_i":"2","tl_m":"1","t2_i":"10","t2_m":"6","t3_i":"3","t3_m":"1","fc":"2"}]}\n'
            +"Si no puedes identificar a qué equipo pertenece un jugador, usa el contexto del documento. "
            +"Extrae TODOS los jugadores que encuentres con datos reales del PDF."}
        ]}]
      });
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      const jStart=txt.indexOf("{");const jEnd=txt.lastIndexOf("}");
      const parsed=JSON.parse(txt.slice(jStart,jEnd+1).replace(/[\r\n]+/g," "));
      let imported=0;
      // Our players
      if(parsed.nuestros?.length){
        const newStats={...pStats};
        (parsed.nuestros||[]).forEach(rp=>{
          const match=convPlayers.find(p=>
            p.num===rp.num||p.name.toLowerCase().includes((rp.name||"").toLowerCase().split(" ")[0])||
            (rp.name||"").toLowerCase().includes(p.name.toLowerCase().split(" ")[0])
          );
          if(match){
            newStats[match.id]={pt:rp.pt||"",min:rp.min||"",tl_i:rp.tl_i||"",tl_m:rp.tl_m||"",t2_i:rp.t2_i||"",t2_m:rp.t2_m||"",t3_i:rp.t3_i||"",t3_m:rp.t3_m||"",fc:rp.fc||""};
            imported++;
          }
        });
        setPStats(newStats);
      }
      // Rival players — save to match
      const rivales=(parsed.rivales||[]).map((p,i)=>({id:Date.now()+i,num:p.num||String(i+1),name:p.name||"Jugador "+(i+1),pt:p.pt||"",min:p.min||"",tl_i:p.tl_i||"",tl_m:p.tl_m||"",t2_i:p.t2_i||"",t2_m:p.t2_m||"",t3_i:p.t3_i||"",t3_m:p.t3_m||"",fc:p.fc||""}));
      if(rivales.length){
        setMatches(prev=>prev.map(x=>x.id===m.id?{...x,rivalStats:rivales}:x));
        imported+=rivales.length;
      }
      const our=(parsed.nuestros||[]).length;const riv=rivales.length;
      setPdfMsg("✅ "+imported+" jugadores importados"+(our?" · "+our+" CB Binissalem":"")+( riv?" · "+riv+" rival":""));
    }catch(err){setPdfMsg("❌ Error: "+err.message?.slice(0,50));}
    setPdfLoading(false);e.target.value="";
    setTimeout(()=>setPdfMsg(null),7000);
  };

  if(!m)return <div style={{textAlign:"center",padding:"60px 20px"}}>
    <Trophy size={48} color={th.muted} style={{margin:"0 auto 16px",display:"block"}}/>
    <p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text,marginBottom:8}}>No hay partidos</p>
    <p style={{color:th.muted,fontSize:13}}>Añade partidos desde la sección Partidos o el Calendario</p>
  </div>;

  // QInput and SF are top-level components (see before ModoPartido)

  return <div>
    <SH title="Modo Partido" sub="Cuartos · Estadísticas · Acumulación automática"/>

    {/* Selector partido */}
    <div style={{marginBottom:14}}><Lbl>Partido</Lbl>
      <select value={sel||m?.id||""} onChange={e=>setSel(+e.target.value)} style={{maxWidth:380}}>
        {allSorted.map(x=>{const hr=x.pts_us!=null;return <option key={x.id} value={x.id}>{x.date} · {x.rival}{hr?` (${x.pts_us}-${x.pts_them})`:""}{x.statsCommitted?" ✓":""}</option>;})}
      </select>
    </div>

    {/* Header partido */}
    <div className="card" style={{padding:"20px 24px",marginBottom:14,borderTop:`4px solid ${resultColor}`}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <p style={{fontFamily:"DM Mono",fontSize:11,color:th.muted,marginBottom:4}}>{m.date} · {m.location}</p>
          <p style={{fontFamily:"Barlow Condensed",fontSize:28,fontWeight:900,color:th.text,lineHeight:1}}>CB Binissalem <span style={{color:th.muted}}>vs</span> {m.rival}</p>
        </div>
        {hasResult&&<div style={{textAlign:"center"}}>
          <p style={{fontFamily:"DM Mono",fontSize:42,fontWeight:900,color:resultColor,lineHeight:1}}>{finalUs}<span style={{color:th.muted,fontSize:28}}>–</span>{finalTh}</p>
          <Badge color={resultColor} sm>{win?"VICTORIA":"DERROTA"}</Badge>
        </div>}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6}}>
        {[["marcador","🏀 Marcador"],["stats","📊 Stats"],["analisis","🧠 Análisis IA"],["notas","📝 Notas"]].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{padding:"6px 16px",borderRadius:8,border:`1px solid ${tab===k?"#f97316":th.border2}`,background:tab===k?"rgba(249,115,22,.1)":"transparent",cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontSize:13,fontWeight:700,color:tab===k?"#f97316":th.sub}}>
            {lbl}
          </button>
        ))}
      </div>
    </div>

    {/* ── TAB: MARCADOR POR CUARTOS ── */}
    {tab==="marcador"&&<div className="card" style={{padding:24}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:18}}>Puntos por cuarto</p>

      {/* Grid cuartos */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
          <thead>
            <tr>
              <th style={{padding:"8px 12px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,width:160}}>Equipo</th>
              {["1er Q","2º Q","3er Q","4º Q"].map(q=><th key={q} style={{padding:"8px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,width:70}}>{q}</th>)}
              <th style={{padding:"8px 12px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1}}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderTop:`1px solid ${th.border}`}}>
              <td style={{padding:"12px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:4,background:"#f97316"}}/>
                  <span style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text}}>CB Binissalem</span>
                </div>
              </td>
              {qUs.map((v,i)=><td key={i} style={{padding:"12px 8px",textAlign:"center"}}>
                <QInput val={v} onChange={val=>setQVal(qUs,setQUs,i,val)} color="#f97316"/>
              </td>)}
              <td style={{padding:"12px 12px",textAlign:"center"}}>
                <span style={{fontFamily:"DM Mono",fontSize:24,fontWeight:900,color:hasQuarters?(win?"#10b981":"#ef4444"):th.muted}}>{hasQuarters?totUs:"—"}</span>
              </td>
            </tr>
            <tr style={{borderTop:`1px solid ${th.border}`}}>
              <td style={{padding:"12px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:4,background:th.border2}}/>
                  <span style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:th.text}}>{m.rival}</span>
                </div>
              </td>
              {qTh.map((v,i)=><td key={i} style={{padding:"12px 8px",textAlign:"center"}}>
                <QInput val={v} onChange={val=>setQVal(qTh,setQTh,i,val)} color="#3b82f6"/>
              </td>)}
              <td style={{padding:"12px 12px",textAlign:"center"}}>
                <span style={{fontFamily:"DM Mono",fontSize:24,fontWeight:900,color:hasQuarters?(!win?"#10b981":"#ef4444"):th.muted}}>{hasQuarters?totTh:"—"}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Diferencia parcial por cuarto */}
      {qUs.some(v=>v!=="")&&<div style={{display:"flex",gap:8,marginTop:14,justifyContent:"center"}}>
        {qUs.map((v,i)=>{const d=(+v||0)-(+qTh[i]||0);return <div key={i} style={{textAlign:"center",padding:"6px 12px",borderRadius:8,background:d>0?"rgba(16,185,129,.1)":d<0?"rgba(239,68,68,.1)":th.card2,border:`1px solid ${d>0?"rgba(16,185,129,.3)":d<0?"rgba(239,68,68,.3)":th.border}`}}>
          <p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted,marginBottom:2}}>Q{i+1}</p>
          <p style={{fontFamily:"DM Mono",fontSize:14,fontWeight:700,color:d>0?"#10b981":d<0?"#ef4444":th.muted}}>{d>0?"+":""}{d}</p>
        </div>;})}
      </div>}

      <div style={{marginTop:18,display:"flex",gap:8}}>
        <Btn onClick={saveQuarters}>Guardar marcador</Btn>
        <p style={{fontSize:11,color:th.muted,alignSelf:"center"}}>El total se calcula automáticamente de los cuartos</p>
      </div>
    </div>}

    {/* ── TAB: ESTADÍSTICAS INDIVIDUALES ── */}
    {tab==="stats"&&<div>
      {/* PDF import — siempre visible, con o sin convocatoria */}
      <input ref={pdfRef} type="file" accept=".pdf" style={{display:"none"}} onChange={importStatsPDF}/>
      <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}}>
        <Btn onClick={()=>pdfRef.current?.click()} disabled={pdfLoading}
          icon={pdfLoading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<FileText size={14}/>}>
          {pdfLoading?"Leyendo PDF…":"Importar stats desde PDF"}
        </Btn>
        <p style={{fontSize:12,color:th.muted}}>Sube el acta del partido — la IA extrae automáticamente las estadísticas de ambos equipos</p>
      </div>
      {pdfMsg&&<div style={{background:pdfMsg.startsWith("✅")?"rgba(16,185,129,.07)":"rgba(239,68,68,.07)",border:`1px solid ${pdfMsg.startsWith("✅")?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`,borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,color:pdfMsg.startsWith("✅")?"#10b981":"#ef4444"}}>{pdfMsg}</div>}

      {statsCommitted&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:"#10b981"}}>
        ✅ Estadísticas ya confirmadas y sumadas a los totales de temporada.
      </div>}
      {convPlayers.length===0
        ?<div className="card" style={{padding:32,textAlign:"center"}}>
          <p style={{color:th.muted,fontSize:13}}>No hay convocatoria definida para este partido.<br/>Ve a la sección Partidos para añadir la convocatoria, o importa el acta PDF arriba.</p>
        </div>
        :<div className="card" style={{overflow:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:680}}>
            <thead>
              <tr style={{background:th.tableHead}}>
                <th style={{padding:"10px 12px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Jugador</th>
                <th style={{padding:"10px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>Min</th>
                <th style={{padding:"10px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>PT</th>
                <th colSpan={2} style={{padding:"6px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#f59e0b",textTransform:"uppercase",borderBottom:`2px solid rgba(245,158,11,.3)`}}>TL (int/met)</th>
                <th colSpan={2} style={{padding:"6px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#3b82f6",textTransform:"uppercase",borderBottom:`2px solid rgba(59,130,246,.3)`}}>T2 (int/met)</th>
                <th colSpan={2} style={{padding:"6px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#8b5cf6",textTransform:"uppercase",borderBottom:`2px solid rgba(139,92,246,.3)`}}>T3 (int/met)</th>
                <th style={{padding:"10px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#ef4444",textTransform:"uppercase"}}>FC</th>
              </tr>
              <tr style={{background:th.tableHead}}>
                <th/><th/><th/>
                {["I","M","I","M","I","M"].map((h,i)=><th key={i} style={{padding:"3px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:9,color:[0,1].includes(i)?"#f59e0b":[2,3].includes(i)?"#3b82f6":"#8b5cf6",textTransform:"uppercase",opacity:.7}}>{h}</th>)}
                <th/>
              </tr>
            </thead>
            <tbody>
              {convPlayers.map(p=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`}}>
                <td style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:14,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:"#fff"}}>{p.num}</div>
                    <div><p style={{fontSize:12,color:th.text,fontWeight:600}}>{p.name.split(" ")[0]}</p><p style={{fontSize:10,color:th.muted}}>{p.pos}</p></div>
                  </div>
                </td>
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="min" label="" getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="pt" label="" getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="tl_i" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="tl_m" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t2_i" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t2_m" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t3_i" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t3_m" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="fc" label="" small getStat={getStat} setStat={setStat} statsCommitted={statsCommitted}/></td>
              </tr>)}
            </tbody>
          </table>
          {!statsCommitted&&<div style={{padding:"16px 20px",borderTop:`1px solid ${th.border}`,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <Btn onClick={commitStats} icon={<Check size={14}/>}>Confirmar y acumular en temporada</Btn>
            <p style={{fontSize:11,color:th.muted}}>⚠️ Acumular a temporada es irreversible por partido.</p>
          </div>}
        </div>
      }
    </div>}

    {/* ── TAB: ANÁLISIS IA ── */}
    {tab==="analisis"&&<MatchAnalysisBlock m={m} players={players}/>}

    {/* ── TAB: NOTAS ── */}
    {tab==="notas"&&<div className="card" style={{padding:20}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Notas del partido</p>
      {m.notes&&<div style={{background:th.card2,borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:12,color:th.sub,lineHeight:1.7}}>{m.notes}</div>}
      <textarea rows={6} placeholder="Análisis táctico, ajustes realizados, rendimiento del equipo…"
        onBlur={e=>{if(e.target.value.trim())setMatches(prev=>prev.map(x=>x.id===m.id?{...x,notes:(x.notes||"")+(x.notes?"\n":"")+e.target.value.trim()}:x));e.target.value="";}}/>
      <p style={{fontSize:11,color:th.muted,marginTop:8}}>Las notas se guardan al salir del campo de texto</p>
    </div>}
  </div>;
}

function CargaTrabajo(){
  const{th}=useTheme();const{sessions}=useData();
  const[view,setView]=useState("semanal");
  const TC_LOAD={"Técnico-Táctico":75,"Físico":90,"Técnico":55,"Táctico":65,"Recuperación":30,"Partido":100,"Libre":10,"Otro":50};
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};
  const getWeek=d=>{const dt=new Date(d+"T12:00:00");const jan1=new Date(dt.getFullYear(),0,1);return Math.ceil(((dt-jan1)/86400000+jan1.getDay()+1)/7);};
  const weekMap={};sessions.forEach(s=>{const w=`${new Date(s.date+"T12:00:00").getFullYear()}-W${String(getWeek(s.date)).padStart(2,"0")}`;if(!weekMap[w])weekMap[w]=[];weekMap[w].push(s);});
  const weekData=Object.entries(weekMap).sort(([a],[b])=>a.localeCompare(b)).slice(-12).map(([w,ss])=>({week:`Sem ${+w.split("-W")[1]}`,load:Math.round(ss.reduce((a,s)=>a+(TC_LOAD[s.type]||50),0)/ss.length),sessions:ss.length}));
  const monthMap={};sessions.forEach(s=>{const dt=new Date(s.date+"T12:00:00");const k=dt.toLocaleDateString("es",{month:"short",year:"2-digit"});if(!monthMap[k])monthMap[k]=[];monthMap[k].push(s);});
  const monthData=Object.entries(monthMap).slice(-8).map(([month,ss])=>({month,load:Math.round(ss.reduce((a,s)=>a+(TC_LOAD[s.type]||50),0)/ss.length),sessions:ss.length}));
  const data=view==="semanal"?weekData:monthData;const key=view==="semanal"?"week":"month";
  const dist={};sessions.forEach(s=>{dist[s.type]=(dist[s.type]||0)+1;});const total=sessions.length||1;
  return <div>
    <SH title="Carga de Trabajo" sub="Análisis de la distribución e intensidad del entrenamiento"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
      {[["Sesiones totales",sessions.length,"#f97316"],["Carga media",sessions.length?Math.round(sessions.reduce((a,s)=>a+(TC_LOAD[s.type]||50),0)/sessions.length):0+"%","#3b82f6"],["Alta intensidad",sessions.filter(s=>(TC_LOAD[s.type]||50)>=80).length,"#ef4444"],["Recuperación",sessions.filter(s=>s.type==="Recuperación").length,"#10b981"]].map(([l,v,c])=>(
        <div key={l} className="card" style={{padding:"18px 20px"}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</p><p style={{fontFamily:"DM Mono",fontSize:32,color:c,fontWeight:700,lineHeight:1}}>{v}</p></div>
      ))}
    </div>
    {sessions.length===0?<div className="card" style={{padding:48,textAlign:"center"}}><p style={{color:th.muted}}>Sin sesiones registradas aún.</p></div>:<>
      <div className="card" style={{padding:22,marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1}}>Carga media por {view==="semanal"?"semana":"mes"} (%)</p>
          <div style={{display:"flex",gap:6}}>
            {["semanal","mensual"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"4px 12px",borderRadius:6,border:"none",background:view===v?"#f97316":th.card2,color:view===v?"#fff":th.sub,cursor:"pointer",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,textTransform:"capitalize"}}>{v}</button>)}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="30%"><CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/><XAxis dataKey={key} tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis domain={[0,100]} tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt} formatter={v=>[`${v}%`,"Carga"]}/><Bar dataKey="load" fill="#f97316" radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Distribución por tipo</p>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>{Object.entries(dist).sort(([,a],[,b])=>b-a).map(([type,count])=>{const c=TC[type]||"#f97316";const pct=Math.round(count/total*100);return <div key={type} style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.text,minWidth:140}}>{type}</span><div style={{flex:1,height:6,background:th.border2,borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:3}}/></div><span style={{fontFamily:"DM Mono",fontSize:11,color:th.muted,minWidth:50,textAlign:"right"}}>{count} ({pct}%)</span></div>;})}
        </div>
      </div>
    </>}
  </div>;
}

function EvolucionStats(){
  const{th}=useTheme();const{players}=useData();
  const[sel,setSel]=useState(null);
  const active=players.filter(p=>p.active&&(p.pj||0)>0);
  const p=active.find(x=>x.id===sel)||active[0];
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};
  if(active.length===0)return <div style={{textAlign:"center",padding:"60px 20px"}}><p style={{color:th.muted}}>Sin jugadores con estadísticas.</p></div>;
  const c=p?calcStats(p):null;
  return <div>
    <SH title="Rendimiento Individual" sub="Perfil estadístico y comparativa de jugadores"/>
    <div style={{marginBottom:16}}><Lbl>Seleccionar jugador</Lbl><select value={sel||p?.id||""} onChange={e=>setSel(+e.target.value)} style={{maxWidth:320}}>{active.map(pl=><option key={pl.id} value={pl.id}>#{pl.num} {pl.name} ({pl.pos})</option>)}</select></div>
    {p&&c&&<div>
      <div className="card" style={{padding:22,marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:28,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:26,fontWeight:900,color:"#fff"}}>{p.num}</div>
          <div><p style={{fontFamily:"Barlow Condensed",fontSize:26,fontWeight:800,color:th.text,lineHeight:1}}>{p.name}</p><p style={{fontSize:13,color:th.muted}}>{p.pos} · {p.pj} partidos · Equipo {p.equipo||"A"}</p></div>
          <div style={{marginLeft:"auto"}}>{p.lesionado&&<Badge color="#f59e0b">Lesión</Badge>}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10}}>
          {[["PTS/P",c.pts_p,"#f97316"],["Min/P",c.min_p+"'","#3b82f6"],["TL%",c.tl_pct+"%","#f59e0b"],["T2%",c.t2_pct+"%","#10b981"],["T3%",c.t3_pct+"%","#8b5cf6"],["FC/P",c.fc_p,"#ef4444"]].map(([lbl,val,col])=>(
            <div key={lbl} style={{textAlign:"center",padding:"14px 8px",background:th.card2,borderRadius:10,border:`1px solid ${th.border}`}}>
              <p style={{fontFamily:"DM Mono",fontSize:22,fontWeight:700,color:col,lineHeight:1,marginBottom:5}}>{val}</p>
              <p style={{fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{padding:22,marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Eficiencia de tiro</p>
        {[["Tiros Libres (TL)","#f59e0b",p.tl_m,p.tl_i,c.tl_pct],["Tiros de 2 (T2)","#3b82f6",p.t2_m,p.t2_i,c.t2_pct],["Tiros de 3 (T3)","#8b5cf6",p.t3_m,p.t3_i,c.t3_pct]].map(([lbl,col,met,int,pct])=>(
          <div key={lbl} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:col}}>{lbl}</span><span style={{fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{met||0}/{int||0} → <strong style={{color:col}}>{pct}%</strong></span></div>
            <div style={{height:10,background:th.border2,borderRadius:5,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:col,borderRadius:5}}/></div>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Comparativa con la media del equipo</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={[{stat:"PTS/P",jugador:c.pts_p,equipo:+(active.reduce((a,x)=>a+calcStats(x).pts_p,0)/active.length).toFixed(1)},{stat:"TL%",jugador:c.tl_pct,equipo:+(active.reduce((a,x)=>a+calcStats(x).tl_pct,0)/active.length).toFixed(1)},{stat:"T2%",jugador:c.t2_pct,equipo:+(active.reduce((a,x)=>a+calcStats(x).t2_pct,0)/active.length).toFixed(1)},{stat:"T3%",jugador:c.t3_pct,equipo:+(active.reduce((a,x)=>a+calcStats(x).t3_pct,0)/active.length).toFixed(1)}]} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/><XAxis dataKey="stat" tick={{fill:th.muted,fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/>
            <Bar dataKey="jugador" name={p.name.split(" ")[0]} fill="#f97316" radius={[4,4,0,0]}/><Bar dataKey="equipo" name="Media equipo" fill={th.border2} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>}
  </div>;
}

function InformeSemanal(){
  const{th}=useTheme();const{players,matches,sessions}=useData();
  const today=new Date();
  const monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
  const sunday=new Date(monday);sunday.setDate(monday.getDate()+6);
  const fmt=d=>d.toLocaleDateString("es",{day:"2-digit",month:"short"});
  const iso=d=>d.toISOString().split("T")[0];
  const weekSessions=sessions.filter(s=>s.date>=iso(monday)&&s.date<=iso(sunday));
  const weekMatches=matches.filter(m=>m.date>=iso(monday)&&m.date<=iso(sunday));
  const nextMatches=matches.filter(m=>m.date>iso(today)&&m.pts_us==null).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const active=players.filter(p=>p.active);
  const played=matches.filter(m=>m.pts_us!=null);
  const wins=played.filter(m=>m.pts_us>m.pts_them).length;

  const generatePDF=()=>{
    const top5=[...active].map(p=>({...p,...calcStats(p)})).sort((a,b)=>b.pts_p-a.pts_p).slice(0,5);
    const avgPts=played.length?(played.reduce((a,m)=>a+m.pts_us,0)/played.length).toFixed(1):"—";
    const w=window.open("","_blank");
    w.document.write(pdfOpen("Informe Semanal")
      +pdfHeader("Informe Semanal",`Semana ${fmt(monday)} – ${fmt(sunday)}`)
      +`<div class="kpi-grid">
          <div class="kpi"><div class="kpi-val">${wins}–${played.length-wins}</div><div class="kpi-lbl">Record</div></div>
          <div class="kpi"><div class="kpi-val">${played.length}</div><div class="kpi-lbl">Partidos</div></div>
          <div class="kpi"><div class="kpi-val">${avgPts}</div><div class="kpi-lbl">PTS/P</div></div>
          <div class="kpi"><div class="kpi-val">${sessions.length}</div><div class="kpi-lbl">Sesiones</div></div>
        </div>`
      +("<div class='section'><div class='section-title'>Entrenamientos esta semana</div>"
        +(weekSessions.length
          ?"<table><thead><tr><th style='text-align:left'>Fecha</th><th style='text-align:left'>Sesión</th><th>Tipo</th><th>Min</th></tr></thead><tbody>"
            +weekSessions.map(s=>"<tr><td class='left'>"+s.date+"</td><td class='left'>"+s.title+"</td><td>"+s.type+"</td><td>"+s.dur+"</td></tr>").join("")
            +"</tbody></table>"
          :"<p style='color:#94a3b8'>Sin sesiones esta semana</p>")
        +"</div>")
      +(weekMatches.length?("<div class='section'><div class='section-title'>Partidos esta semana</div>"
        +"<table><thead><tr><th style='text-align:left'>Rival</th><th>Lugar</th><th>Resultado</th></tr></thead><tbody>"
        +weekMatches.map(m=>{
          const rc=m.pts_us!=null?(m.pts_us>m.pts_them?"#10b981":"#ef4444"):"#64748b";
          const res=m.pts_us!=null?m.pts_us+"–"+m.pts_them:"—";
          return "<tr><td class='left'>"+m.rival+"</td><td>"+m.location+"</td><td style='color:"+rc+";font-weight:700'>"+res+"</td></tr>";
        }).join("")
        +"</tbody></table></div>"):"")
      +("<div class='section'><div class='section-title'>Próximos partidos</div>"
        +(nextMatches.length
          ?"<table><thead><tr><th style='text-align:left'>Fecha</th><th style='text-align:left'>Rival</th><th>Lugar</th></tr></thead><tbody>"
            +nextMatches.map(m=>"<tr><td class='left'>"+m.date+"</td><td class='left'>"+m.rival+"</td><td>"+m.location+"</td></tr>").join("")
            +"</tbody></table>"
          :"<p style='color:#94a3b8'>Sin partidos próximos</p>")
        +"</div>")
      +("<div class='section'><div class='section-title'>Top anotadores</div>"
        +"<table><thead><tr><th>#</th><th style='text-align:left'>Jugador</th><th>Pos.</th><th>PJ</th><th>PTS/P</th><th>T2%</th><th>T3%</th><th>TL%</th></tr></thead><tbody>"
        +top5.map((pl,i)=>"<tr><td>"+(i+1)+"</td><td class='left'>"+pl.name+"</td><td>"+pl.pos+"</td><td>"+pl.pj+"</td><td><strong>"+pl.pts_p+"</strong></td><td>"+pl.t2_pct+"%</td><td>"+pl.t3_pct+"%</td><td>"+pl.tl_pct+"%</td></tr>").join("")
        +"</tbody></table></div>")
      +pdfClose()
    );
    w.document.close();setTimeout(()=>w.print(),400);
  };

  return <div>
    <SH title="Informe Semanal" sub={`${fmt(monday)} – ${fmt(sunday)}`} right={<Btn onClick={generatePDF} icon={<Printer size={14}/>}>Descargar PDF</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
      {[["Sesiones semana",weekSessions.length,"#f97316"],["Partidos semana",weekMatches.length,"#3b82f6"],["Próximos partidos",nextMatches.length,"#8b5cf6"],["Jugadores activos",active.length,"#10b981"]].map(([l,v,c])=>(
        <div key={l} className="card" style={{padding:"18px 20px"}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</p><p style={{fontFamily:"DM Mono",fontSize:32,color:c,fontWeight:700,lineHeight:1}}>{v}</p></div>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div className="card" style={{padding:20}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Entrenamientos esta semana</p>
        {weekSessions.length===0?<p style={{fontSize:12,color:th.muted}}>Sin sesiones</p>:weekSessions.map(s=>{const c=TC[s.type]||"#f97316";return <div key={s.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${th.border}`}}><div style={{width:4,background:c,borderRadius:2,flexShrink:0}}/><div><p style={{fontSize:13,color:th.text,fontWeight:600}}>{s.title}</p><p style={{fontSize:11,color:th.muted}}>{s.date} · {s.type} · {s.dur}'</p></div></div>;})}
      </div>
      <div className="card" style={{padding:20}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Próximos partidos</p>
        {nextMatches.length===0?<p style={{fontSize:12,color:th.muted}}>Sin partidos planificados</p>:nextMatches.map(m=><div key={m.id} style={{padding:"8px 0",borderBottom:`1px solid ${th.border}`}}><p style={{fontSize:13,color:th.text,fontWeight:600}}>{m.rival}</p><p style={{fontSize:11,color:th.muted}}>{m.date} · {m.location}</p></div>)}
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE D — Análisis IA post-partido
══════════════════════════════════════════════════════════ */
function MatchAnalysisBlock({m,players}){
  const{th}=useTheme();
  const{matchAnalyses,setMatchAnalyses,apiKey}=useData();
  const existing=matchAnalyses.find(a=>a.matchId===m.id);
  const[loading,setLoading]=useState(false);
  const[editing,setEditing]=useState(false);
  const[editText,setEditText]=useState("");
  // Rival player stats state
  const emptyRP=()=>({pj:"",pt:"",min:"",tl_i:"",tl_m:"",t2_i:"",t2_m:"",t3_i:"",t3_m:"",fc:""});
  const[rivalPS,setRivalPS]=useState(m.rivalStats||[
    {id:1,num:"",name:"Jugador 1",...emptyRP()},
    {id:2,num:"",name:"Jugador 2",...emptyRP()},
    {id:3,num:"",name:"Jugador 3",...emptyRP()},
  ]);
  const[showRival,setShowRival]=useState(false);
  const setRP=(id,f,v)=>setRivalPS(prev=>prev.map(p=>p.id===id?{...p,[f]:v}:p));
  const addRP=()=>setRivalPS(prev=>[...prev,{id:Date.now(),num:"",name:`Jugador ${prev.length+1}`,...emptyRP()}]);
  const delRP=id=>setRivalPS(prev=>prev.filter(p=>p.id!==id));

  const convPlayers=(m.convocados||[]).map(id=>players.find(p=>p.id===id)).filter(Boolean);
  const pStats=m.playerStats||{};

  const analyze=async()=>{
    if(!apiKey){alert("Configura tu API Key en ⚙️ Ajustes.");return;}
    setLoading(true);

    // ── Pre-calculate ALL numbers in JS — never let the AI do maths ──
    const qu=m.quarters?.us||[];const qt=m.quarters?.them||[];
    const hasQ=qu.length===4&&qu.some(v=>v>0);

    // Quarter-by-quarter with cumulative (first half, etc.)
    let qLines="";
    if(hasQ){
      const q1u=+qu[0]||0,q1t=+qt[0]||0;
      const q2u=+qu[1]||0,q2t=+qt[1]||0;
      const q3u=+qu[2]||0,q3t=+qt[2]||0;
      const q4u=+qu[3]||0,q4t=+qt[3]||0;
      const h1u=q1u+q2u,h1t=q1t+q2t;
      const h2u=q3u+q4u,h2t=q3t+q4t;
      const totU=h1u+h2u,totT=h1t+h2t;
      const diff=q=>{const d=q[0]-q[1];return d>0?"+"+d+" CB":d<0?d+" (rival +"+Math.abs(d)+")":"empate";};
      qLines=
        "PARCIALES POR CUARTO (calculados):\n"
        +"  Q1: CB "+q1u+" - "+m.rival+" "+q1t+" → diferencia: "+diff([q1u,q1t])+"\n"
        +"  Q2: CB "+q2u+" - "+m.rival+" "+q2t+" → diferencia: "+diff([q2u,q2t])+"\n"
        +"  1ª PARTE: CB "+h1u+" - "+m.rival+" "+h1t+" → diferencia: "+diff([h1u,h1t])+"\n"
        +"  Q3: CB "+q3u+" - "+m.rival+" "+q3t+" → diferencia: "+diff([q3u,q3t])+"\n"
        +"  Q4: CB "+q4u+" - "+m.rival+" "+q4t+" → diferencia: "+diff([q4u,q4t])+"\n"
        +"  2ª PARTE: CB "+h2u+" - "+m.rival+" "+h2t+" → diferencia: "+diff([h2u,h2t])+"\n"
        +"  TOTAL FINAL: CB "+totU+" - "+m.rival+" "+totT+" → diferencia: "+diff([totU,totT])+"\n"
        +"IMPORTANTE: usa EXACTAMENTE estos números calculados. NO recalcules nada.\n";
    }

    const finalUs=m.pts_us??null;
    const finalTh=m.pts_them??null;
    const resultLine=finalUs!=null
      ?"CB Binissalem "+finalUs+" - "+m.rival+" "+finalTh
        +(finalUs>finalTh?" (VICTORIA por "+(finalUs-finalTh)+" puntos)":" (DERROTA por "+(finalTh-finalUs)+" puntos)")
      :"Sin resultado registrado";

    const ourStats=convPlayers.map(p=>{
      const s=pStats[p.id]||{};
      return "#"+p.num+" "+p.name+" ("+p.pos+"): "+[s.pt&&"PT:"+s.pt,s.min&&"Min:"+s.min,s.t2_m!=null&&s.t2_i!=null&&"T2:"+s.t2_m+"/"+s.t2_i,s.t3_m!=null&&s.t3_i!=null&&"T3:"+s.t3_m+"/"+s.t3_i,s.tl_m!=null&&s.tl_i!=null&&"TL:"+s.tl_m+"/"+s.tl_i,s.fc&&"FC:"+s.fc].filter(Boolean).join(" ");
    }).filter(l=>l.includes(":")).join("\n");

    const rivStr=rivalPS.filter(p=>p.pt||p.min).map(p=>"#"+p.num+" "+p.name+": "+[p.pt&&"PT:"+p.pt,p.min&&"Min:"+p.min,p.t2_m&&"T2:"+p.t2_m+"/"+p.t2_i,p.t3_m&&"T3:"+p.t3_m+"/"+p.t3_i,p.tl_m&&"TL:"+p.tl_m+"/"+p.tl_i,p.fc&&"FC:"+p.fc].filter(Boolean).join(" ")).join("\n");

    try{
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:1600,
        messages:[{role:"user",content:
          "Eres analista de baloncesto. Analiza este partido de CB Binissalem Sénior A.\n\n"
          +"PARTIDO: CB Binissalem vs "+m.rival+" ("+m.location+") "+m.date+"\n"
          +"RESULTADO FINAL: "+resultLine+"\n\n"
          +qLines
          +(ourStats?"NUESTRAS ESTADÍSTICAS:\n"+ourStats+"\n\n":"")
          +(rivStr?"ESTADÍSTICAS RIVAL:\n"+rivStr+"\n\n":"")
          +(m.notes?"NOTAS DEL ENTRENADOR:\n"+m.notes+"\n\n":"")
          +"Genera un análisis post-partido completo en español con:\n"
          +"1. RESUMEN DEL PARTIDO (usa los resultados exactos proporcionados)\n"
          +"2. PUNTOS POSITIVOS (qué funcionó bien)\n"
          +"3. PUNTOS A MEJORAR (errores y aspectos a trabajar)\n"
          +"4. RENDIMIENTO INDIVIDUAL (destacados positivos y negativos)\n"
          +"5. CONCLUSIONES Y PRÓXIMOS PASOS (qué entrenar esta semana)\n\n"
          +"CRÍTICO: Copia los marcadores EXACTAMENTE como se te proporcionan. No hagas ningún cálculo propio."
        }]
      });
      const text=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";
      const result=finalUs!=null?finalUs+"-"+finalTh:"Sin resultado";
      const analysis={id:Date.now(),matchId:m.id,rival:m.rival,date:m.date,result,text,rivalStats:rivalPS,created:new Date().toISOString()};
      setMatchAnalyses(prev=>[analysis,...prev.filter(a=>a.matchId!==m.id)]);
    }catch(e){alert("Error: "+e.message);}
    setLoading(false);
  };

  const exportPDF=a=>{
    const w=window.open("","_blank");
    w.document.write(
      pdfOpen("Análisis Post-Partido")
      +pdfHeader("Análisis Post-Partido","CB Binissalem vs "+a.rival+" · "+a.date+" · "+a.result)
      +mdToHtml(a.text)
      +pdfClose()
    );
    w.document.close();setTimeout(()=>w.print(),400);
  };

  const saveEdit=()=>{
    setMatchAnalyses(prev=>prev.map(a=>a.id===existing.id?{...a,text:editText}:a));
    setEditing(false);
  };

  const ni={type:"text",inputMode:"numeric",pattern:"[0-9]*",maxLength:3,style:{width:46,height:28,textAlign:"center",fontFamily:"DM Mono",fontSize:11,borderRadius:5,border:"1px solid",borderColor:th.border2,background:th.inputBg,color:th.text,padding:"0 2px"}};

  return <div>
    {/* Rival stats accordion */}
    <div className="card" style={{padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setShowRival(!showRival)}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text,textTransform:"uppercase",letterSpacing:.5}}>Estadísticas del equipo rival (opcional)</p>
        <ChevronRight size={14} color={th.muted} style={{transform:showRival?"rotate(90deg)":"none",transition:"transform .2s"}}/>
      </div>
      {showRival&&<div style={{marginTop:12}}>
        <div style={{overflowX:"auto"}}>
          <table style={{borderCollapse:"collapse",fontSize:11,width:"100%",minWidth:580}}>
            <thead><tr style={{background:th.tableHead}}>
              {["#","Nombre","PT","Min","TL-I","TL-M","T2-I","T2-M","T3-I","T3-M","FC",""].map((h,i)=>(
                <th key={i} style={{padding:"5px 4px",fontFamily:"Barlow Condensed",fontSize:9,color:th.muted,textTransform:"uppercase",textAlign:i<2?"left":"center"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{rivalPS.map(p=><tr key={p.id} style={{borderTop:"1px solid "+th.border}}>
              <td style={{padding:"3px 4px"}}><input value={p.num} onChange={e=>setRP(p.id,"num",e.target.value)} maxLength={3} style={{width:52,height:28,textAlign:"center",fontFamily:"DM Mono",fontSize:11,borderRadius:5,border:"1px solid "+th.border2,background:th.inputBg,color:th.text}}/></td>
              <td style={{padding:"3px 4px"}}><input value={p.name} onChange={e=>setRP(p.id,"name",e.target.value)} style={{width:130,height:28,fontSize:11,borderRadius:5,border:"1px solid "+th.border2,background:th.inputBg,color:th.text,padding:"0 4px"}}/></td>
              {["pt","min","tl_i","tl_m","t2_i","t2_m","t3_i","t3_m","fc"].map(f=>(
                <td key={f} style={{padding:"3px 3px",textAlign:"center"}}><input {...ni} value={p[f]} onChange={e=>setRP(p.id,f,e.target.value)}/></td>
              ))}
              <td style={{padding:"3px 4px"}}><button onClick={()=>delRP(p.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444"}}><Trash2 size={11}/></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <button onClick={addRP} style={{marginTop:8,display:"flex",alignItems:"center",gap:4,padding:"4px 12px",borderRadius:6,border:"1px solid "+th.border2,background:th.card2,cursor:"pointer",fontSize:11,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
          <Plus size={11}/>Añadir jugador
        </button>
      </div>}
    </div>

    {/* Generate button */}
    {!existing&&<Btn onClick={analyze} disabled={loading} icon={loading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={14}/>}>
      {loading?"Analizando partido…":"Generar análisis IA"}
    </Btn>}

    {/* Analysis result */}
    {existing&&<div className="card" style={{padding:20,marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:th.text}}>Análisis · {existing.date}</p>
        <div style={{display:"flex",gap:6}}>
          <Btn onClick={()=>exportPDF(existing)} variant="ghost" icon={<Printer size={13}/>} sm>PDF</Btn>
          <Btn onClick={()=>{setEditText(existing.text);setEditing(true);}} variant="ghost" icon={<Edit2 size={13}/>} sm>Editar</Btn>
          <Btn onClick={analyze} disabled={loading} variant="ghost" icon={<RotateCcw size={13}/>} sm>Regenerar</Btn>
        </div>
      </div>
      {editing?(
        <div>
          <textarea rows={18} value={editText} onChange={e=>setEditText(e.target.value)} style={{marginBottom:8,fontFamily:"DM Mono",fontSize:11,lineHeight:1.7}}/>
          <div style={{display:"flex",gap:8}}><Btn onClick={saveEdit} sm>Guardar</Btn><Btn onClick={()=>setEditing(false)} variant="ghost" sm>Cancelar</Btn></div>
        </div>
      ):(
        <div style={{fontSize:13,color:th.sub,lineHeight:1.8}} dangerouslySetInnerHTML={{__html:mdToHtml(existing.text)}}/>
      )}
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE G — Basketball IQ
══════════════════════════════════════════════════════════ */
const IQ_DIMENSIONS=[
  {id:"lectura",    label:"Lectura de juego",    desc:"Anticipación, toma de decisiones, visión",    color:"#f97316",icon:"🧠"},
  {id:"defensa",    label:"Comprensión defensiva",desc:"Posición, ayudas, rotaciones, comunicación",  color:"#3b82f6",icon:"🛡️"},
  {id:"ataque",     label:"Juego sin balón",      desc:"Cortes, bloqueos, espaciado, timing",         color:"#10b981",icon:"⚡"},
  {id:"situacional",label:"Situaciones especiales",desc:"Últimos segundos, bonus, presión",           color:"#8b5cf6",icon:"⏱️"},
  {id:"comunicacion",label:"Comunicación",        desc:"Liderazgo, llamadas, cohesión de equipo",     color:"#f59e0b",icon:"📣"},
  {id:"adaptacion", label:"Adaptabilidad",        desc:"Cambios tácticos, resiliencia, versatilidad", color:"#ef4444",icon:"🔄"},
];
const IQ_LEVELS=["—","1 Básico","2 En desarrollo","3 Competente","4 Avanzado","5 Elite"];

function BasketballIQ(){
  const{th}=useTheme();
  const{players,basketballIQ,setBasketballIQ,apiKey}=useData();
  const active=players.filter(p=>p.active);
  const[selPlayer,setSelPlayer]=useState(null);
  const[tab,setTab]=useState("evaluacion"); // evaluacion | historial | equipo
  const[genLoading,setGenLoading]=useState(false);
  const[aiReport,setAiReport]=useState(null);

  // Get scores for a player
  const getScores=pid=>(basketballIQ.find(r=>r.playerId===pid)?.scores)||{};
  const setScore=(pid,dim,val)=>{
    setBasketballIQ(prev=>{
      const existing=prev.find(r=>r.playerId===pid);
      if(existing){
        return prev.map(r=>r.playerId===pid?{...r,scores:{...r.scores,[dim]:val},updated:new Date().toISOString()}:r);
      }
      return [...prev,{playerId:pid,scores:{[dim]:val},notes:"",updated:new Date().toISOString()}];
    });
  };
  const getNote=pid=>(basketballIQ.find(r=>r.playerId===pid)?.notes)||"";
  const setNote=(pid,note)=>{
    setBasketballIQ(prev=>{
      const existing=prev.find(r=>r.playerId===pid);
      if(existing)return prev.map(r=>r.playerId===pid?{...r,notes:note}:r);
      return [...prev,{playerId:pid,scores:{},notes:note,updated:new Date().toISOString()}];
    });
  };

  const calcIQ=scores=>{
    const vals=IQ_DIMENSIONS.map(d=>+(scores[d.id]||0));
    const filled=vals.filter(v=>v>0);
    if(!filled.length)return null;
    return Math.round(filled.reduce((a,v)=>a+v,0)/filled.length*20);
  };

  const generateReport=async pid=>{
    if(!apiKey){alert("Configura tu API Key en ⚙️ Ajustes.");return;}
    const p=players.find(x=>x.id===pid);if(!p)return;
    const scores=getScores(pid);
    const note=getNote(pid);
    const iqVal=calcIQ(scores);
    setGenLoading(true);setAiReport(null);
    const dimStr=IQ_DIMENSIONS.map(d=>{
      const v=+(scores[d.id]||0);
      return d.label+": "+(v?IQ_LEVELS[v]+" ("+v+"/5)":"Sin evaluar");
    }).join("\n");
    try{
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:1200,
        messages:[{role:"user",content:
          "Eres analista de baloncesto especializado en desarrollo de jugadores.\n\n"
          +"JUGADOR: #"+p.num+" "+p.name+" ("+p.pos+")\n"
          +"IQ BALONCESTO GLOBAL: "+(iqVal!=null?iqVal+"/100":"No calculado")+"\n\n"
          +"EVALUACIÓN POR DIMENSIÓN:\n"+dimStr+"\n\n"
          +(note?"NOTAS DEL ENTRENADOR:\n"+note+"\n\n":"")
          +"Genera un informe de desarrollo del Basketball IQ en español con:\n"
          +"1. PERFIL COGNITIVO (análisis de sus puntos fuertes y débiles)\n"
          +"2. ÁREAS PRIORITARIAS DE MEJORA (máximo 3, con ejercicios concretos)\n"
          +"3. PLAN DE TRABAJO (sesiones específicas para mejorar el IQ)\n"
          +"4. PROYECCIÓN (potencial de mejora y timeline realista)\n\n"
          +"Sé específico, práctico y orientado al jugador amateur/semiprofesional."
        }]
      });
      const text=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";
      setAiReport({pid,text,player:p.name});
    }catch(e){alert("Error: "+e.message);}
    setGenLoading(false);
  };

  const exportPlayerPDF=(pid)=>{
    const p=players.find(x=>x.id===pid);if(!p)return;
    const scores=getScores(pid);const note=getNote(pid);const iqVal=calcIQ(scores);
    const dimRows=IQ_DIMENSIONS.map(d=>{
      const v=+(scores[d.id]||0);
      const pct=v*20;
      return "<tr><td style='padding:8px 12px;font-weight:600'>"+d.icon+" "+d.label+"</td>"
        +"<td style='padding:8px 12px;color:#64748b;font-size:12px'>"+d.desc+"</td>"
        +"<td style='padding:8px 12px;text-align:center'>"+(v?IQ_LEVELS[v]:"—")+"</td>"
        +"<td style='padding:8px 12px;min-width:120px'>"
        +"<div style='background:#e2e8f0;border-radius:4px;height:8px'>"
        +"<div style='background:"+d.color+";width:"+pct+"%;height:8px;border-radius:4px'></div></div></td>"
        +"</tr>";
    }).join("");
    const w=window.open("","_blank");
    w.document.write(
      pdfOpen("Basketball IQ — "+p.name)
      +pdfHeader("Basketball IQ","#"+p.num+" "+p.name+" · "+p.pos+(iqVal!=null?" · IQ: "+iqVal+"/100":""))
      +"<div class='section'><div class='section-title'>Evaluación por dimensiones</div>"
      +"<table style='width:100%;border-collapse:collapse'>"
      +"<thead><tr style='background:#f8fafc'><th style='padding:8px 12px;text-align:left'>Dimensión</th><th style='padding:8px 12px;text-align:left'>Descripción</th><th style='padding:8px 12px'>Nivel</th><th style='padding:8px 12px'>Progreso</th></tr></thead>"
      +"<tbody>"+dimRows+"</tbody></table></div>"
      +(note?"<div class='section'><div class='section-title'>Notas del entrenador</div><div class='section-body'><p>"+note+"</p></div></div>":"")
      +(aiReport&&aiReport.pid===pid?"<div class='section'>"+mdToHtml(aiReport.text)+"</div>":"")
      +pdfClose()
    );
    w.document.close();setTimeout(()=>w.print(),400);
  };

  const p=active.find(x=>x.id===selPlayer)||active[0];

  return <div>
    <SH title="Basketball IQ" sub="Coeficiente Intelectual de Baloncesto · Evaluación y desarrollo"/>
    <TB tabs={[["evaluacion","📋 Evaluación individual"],["equipo","📊 Vista equipo"]]} active={tab} onChange={setTab}/>

    {tab==="evaluacion"&&<div>
      {/* Selector jugador */}
      <div style={{marginBottom:16}}>
        <Lbl>Jugador</Lbl>
        <select value={selPlayer||p?.id||""} onChange={e=>setSelPlayer(+e.target.value)} style={{maxWidth:320}}>
          {active.map(x=>{
            const iq=calcIQ(getScores(x.id));
            return <option key={x.id} value={x.id}>#{x.num} {x.name} {iq!=null?"· IQ "+iq:""}</option>;
          })}
        </select>
      </div>

      {p&&<div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        {/* Dimensiones */}
        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:th.text,textTransform:"uppercase"}}>#{p.num} {p.name}</p>
            {calcIQ(getScores(p.id))!=null&&<div style={{textAlign:"center"}}>
              <p style={{fontFamily:"DM Mono",fontSize:32,fontWeight:900,color:"#f97316",lineHeight:1}}>{calcIQ(getScores(p.id))}</p>
              <p style={{fontSize:10,color:th.muted}}>IQ / 100</p>
            </div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {IQ_DIMENSIONS.map(d=>{
              const val=+(getScores(p.id)[d.id]||0);
              return <div key={d.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div>
                    <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text}}>{d.icon} {d.label}</span>
                    <span style={{fontSize:10,color:th.muted,marginLeft:8}}>{d.desc}</span>
                  </div>
                  <span style={{fontFamily:"DM Mono",fontSize:11,color:val?d.color:th.muted,fontWeight:700}}>{val?IQ_LEVELS[val]:"Sin evaluar"}</span>
                </div>
                {/* Rating bar — click to set */}
                <div style={{display:"flex",gap:4}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setScore(p.id,d.id,n===val?0:n)}
                      style={{flex:1,height:28,borderRadius:6,border:"none",cursor:"pointer",
                        background:val>=n?d.color:th.card2,
                        opacity:val>=n?1:.35,transition:"all .15s",
                        fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,
                        color:val>=n?"#fff":th.muted}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>;
            })}
          </div>
          <div style={{marginTop:16}}>
            <Lbl>Notas del entrenador</Lbl>
            <textarea rows={3} value={getNote(p.id)} onChange={e=>setNote(p.id,e.target.value)} placeholder="Observaciones, contexto, evolución del jugador…"/>
          </div>
        </div>

        {/* Panel derecho */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* IQ Visual radar simulado con barras */}
          <div className="card" style={{padding:18}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Perfil visual</p>
            {IQ_DIMENSIONS.map(d=>{
              const val=+(getScores(p.id)[d.id]||0);const pct=val*20;
              return <div key={d.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:th.sub,fontFamily:"Barlow Condensed",fontWeight:600}}>{d.icon} {d.label.split(" ")[0]}</span>
                  <span style={{fontFamily:"DM Mono",fontSize:10,color:d.color,fontWeight:700}}>{val}/5</span>
                </div>
                <div style={{background:th.card2,borderRadius:4,height:6}}>
                  <div style={{background:d.color,width:pct+"%",height:6,borderRadius:4,transition:"width .3s"}}/>
                </div>
              </div>;
            })}
          </div>
          {/* Acciones */}
          <div className="card" style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>generateReport(p.id)} disabled={genLoading} icon={genLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={13}/>}>
              {genLoading?"Generando…":"Informe IA de desarrollo"}
            </Btn>
            <Btn onClick={()=>exportPlayerPDF(p.id)} variant="ghost" icon={<Printer size={13}/>}>Exportar PDF</Btn>
          </div>
          {aiReport&&aiReport.pid===p.id&&<div className="card" style={{padding:16}}>
            <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:"#f97316",textTransform:"uppercase",marginBottom:10}}>Informe IA — {aiReport.player}</p>
            <div style={{fontSize:12,color:th.sub,lineHeight:1.7,maxHeight:400,overflowY:"auto"}} dangerouslySetInnerHTML={{__html:mdToHtml(aiReport.text)}}/>
          </div>}
        </div>
      </div>}
    </div>}

    {tab==="equipo"&&<div>
      <div className="card" style={{overflowX:"auto",padding:0}}>
        <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
          <thead>
            <tr style={{background:th.tableHead}}>
              <th style={{padding:"12px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:.5}}>Jugador</th>
              {IQ_DIMENSIONS.map(d=><th key={d.id} style={{padding:"10px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:d.color,textTransform:"uppercase",letterSpacing:.5,minWidth:80}}>{d.icon}<br/>{d.label.split(" ")[0]}</th>)}
              <th style={{padding:"10px 12px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,color:"#f97316",textTransform:"uppercase",letterSpacing:.5}}>IQ Global</th>
            </tr>
          </thead>
          <tbody>
            {active.map(p=>{
              const scores=getScores(p.id);
              const iq=calcIQ(scores);
              return <tr key={p.id} style={{borderTop:"1px solid "+th.border}}>
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:14,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:"#fff"}}>{p.num}</div>
                    <div><p style={{fontSize:13,fontWeight:600,color:th.text}}>{p.name}</p><p style={{fontSize:10,color:th.muted}}>{p.pos}</p></div>
                  </div>
                </td>
                {IQ_DIMENSIONS.map(d=>{
                  const v=+(scores[d.id]||0);
                  return <td key={d.id} style={{padding:"10px 8px",textAlign:"center"}}>
                    {v?<span style={{display:"inline-block",width:28,height:28,borderRadius:14,background:d.color+"20",border:"1px solid "+d.color+"50",fontFamily:"DM Mono",fontSize:12,fontWeight:700,color:d.color,lineHeight:"28px",textAlign:"center"}}>{v}</span>
                    :<span style={{color:th.border2,fontSize:16}}>—</span>}
                  </td>;
                })}
                <td style={{padding:"10px 12px",textAlign:"center"}}>
                  {iq!=null?<span style={{fontFamily:"DM Mono",fontSize:16,fontWeight:900,color:iq>=80?"#10b981":iq>=60?"#f97316":"#ef4444"}}>{iq}</span>:<span style={{color:th.border2}}>—</span>}
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE E — Informes personalizados
══════════════════════════════════════════════════════════ */
/* ── Formulario de informe — componente de nivel superior para evitar pérdida de foco ── */
function InformesEditForm({form,setForm,onSave,onCancel,aiLoading,aiMsg,correctWithAI,cats,th}){
  const taRef=useRef(null);

  // Insert formatting at cursor
  const insertFormat=(prefix,suffix="")=>{
    const ta=taRef.current;if(!ta)return;
    const start=ta.selectionStart,end=ta.selectionEnd;
    const sel=form.content.slice(start,end);
    const before=form.content.slice(0,start);
    const after=form.content.slice(end);
    const newText=before+prefix+sel+suffix+after;
    setForm(f=>({...f,content:newText}));
    // Restore cursor after state update
    requestAnimationFrame(()=>{
      ta.focus();
      const cur=start+prefix.length+(sel?sel.length:0)+(suffix&&!sel?0:suffix.length);
      ta.setSelectionRange(
        start+prefix.length,
        start+prefix.length+(sel?sel.length:0)
      );
    });
  };

  const FmtBtn=({label,title,onClick})=>(
    <button type="button" onClick={onClick} title={title}
      style={{padding:"3px 10px",borderRadius:5,border:`1px solid`,borderColor:"rgba(255,255,255,.12)",
        background:"rgba(255,255,255,.06)",cursor:"pointer",fontSize:12,fontFamily:"inherit",
        color:"#94a3b8",lineHeight:1.4}}>
      {label}
    </button>
  );

  return (
    <div className="card" style={{padding:22,marginBottom:14,borderColor:"#f9731640"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:12,marginBottom:12}}>
        <div><Lbl>Título</Lbl>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Título del informe"/>
        </div>
        <div><Lbl>Categoría</Lbl>
          <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
            {cats.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{marginBottom:10}}>
        {/* Header de contenido */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <Lbl>Contenido</Lbl>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {aiMsg&&<span style={{fontSize:11,color:aiMsg.startsWith("✅")?"#10b981":"#ef4444"}}>{aiMsg}</span>}
            <Btn onClick={correctWithAI} disabled={aiLoading} variant="ghost" sm
              icon={aiLoading?<Loader size={12} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={12}/>}>
              {aiLoading?"Revisando…":"IA: Corregir"}
            </Btn>
          </div>
        </div>

        {/* Barra de formato */}
        <div style={{display:"flex",gap:5,marginBottom:6,padding:"6px 8px",background:"rgba(0,0,0,.15)",borderRadius:"8px 8px 0 0",border:`1px solid ${th.border2}`,borderBottom:"none",flexWrap:"wrap"}}>
          <FmtBtn label="B" title="Negrita (**texto**)" onClick={()=>insertFormat("**","**")}/>
          <FmtBtn label="I" title="Cursiva (_texto_)" onClick={()=>insertFormat("_","_")}/>
          <FmtBtn label="H1" title="Título grande (# Título)" onClick={()=>insertFormat("# ")}/>
          <FmtBtn label="H2" title="Subtítulo (## Sección)" onClick={()=>insertFormat("## ")}/>
          <div style={{width:1,background:"rgba(255,255,255,.1)",margin:"0 2px"}}/>
          <FmtBtn label="— lista" title="Elemento de lista" onClick={()=>insertFormat("- ")}/>
          <FmtBtn label="↵ línea" title="Salto de párrafo" onClick={()=>{
            const ta=taRef.current;if(!ta)return;
            const start=ta.selectionStart;
            const before=form.content.slice(0,start);
            const after=form.content.slice(start);
            setForm(f=>({...f,content:before+"\n\n"+after}));
            requestAnimationFrame(()=>{ta.focus();ta.setSelectionRange(start+2,start+2);});
          }}/>
          <div style={{width:1,background:"rgba(255,255,255,.1)",margin:"0 2px"}}/>
          <span style={{fontSize:10,color:"#64748b",alignSelf:"center",marginLeft:2}}>
            Markdown: **negrita** _cursiva_ # título
          </span>
        </div>

        {/* Textarea principal */}
        <textarea
          ref={taRef}
          rows={16}
          value={form.content}
          onChange={e=>setForm(f=>({...f,content:e.target.value}))}
          onKeyDown={e=>{
            // Tab → inserta espacios sin perder foco
            if(e.key==="Tab"){e.preventDefault();insertFormat("  ");}
          }}
          placeholder={"Escribe tu informe aquí…\n\nUsa la barra de formato o escribe markdown directamente:\n**negrita**  _cursiva_  # Título  ## Sección\n- elemento de lista"}
          style={{fontFamily:"DM Mono",fontSize:12,lineHeight:1.8,borderRadius:"0 0 8px 8px",resize:"vertical",width:"100%"}}/>
      </div>

      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onSave}>Guardar</Btn>
        <Btn onClick={onCancel} variant="ghost">Cancelar</Btn>
      </div>
    </div>
  );
}

function Informes(){
  const{th}=useTheme();const{apiKey}=useData();
  const[informes,setInformes]=useState([]);
  const[editId,setEditId]=useState(null);
  const[showNew,setShowNew]=useState(false);
  const[form,setForm]=useState({title:"",category:"Táctico",content:""});
  const[aiLoading,setAiLoading]=useState(false);
  const[aiMsg,setAiMsg]=useState(null);
  const cats=["Táctico","Partido","Jugador","Temporada","Otro"];

  const saveNew=()=>{
    if(!form.title||!form.content)return;
    setInformes(prev=>[{id:Date.now(),date:new Date().toISOString().split("T")[0],...form},...prev]);
    setForm({title:"",category:"Táctico",content:""});setShowNew(false);
  };
  const saveEdit=()=>{
    setInformes(prev=>prev.map(r=>r.id===editId?{...r,...form}:r));
    setEditId(null);
  };
  const del=id=>setInformes(prev=>prev.filter(r=>r.id!==id));
  const startEdit=r=>{setForm({title:r.title,category:r.category,content:r.content});setEditId(r.id);};

  const correctWithAI=async()=>{
    if(!apiKey){setAiMsg("❌ Configura tu API Key.");return;}
    if(!form.content.trim()){setAiMsg("❌ Escribe contenido primero.");return;}
    setAiLoading(true);setAiMsg(null);
    try{
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:
          "Eres un asistente de redacción especializado en baloncesto y comunicación deportiva.\n\n"
          +"Corrige y mejora el siguiente texto de un informe de baloncesto. Mantén el significado y los datos exactos. Mejora:\n"
          +"- Gramática y ortografía\n- Tono profesional y deportivo\n- Claridad y estructura\n- Coherencia del discurso\n\n"
          +"TEXTO ORIGINAL:\n"+form.content+"\n\n"
          +"Devuelve ÚNICAMENTE el texto corregido, sin explicaciones ni comentarios."
        }]
      });
      const corrected=data.content?.find(b=>b.type==="text")?.text||form.content;
      setForm(f=>({...f,content:corrected}));
      setAiMsg("✅ Texto revisado y mejorado por IA");
    }catch(e){setAiMsg("❌ Error: "+e.message?.slice(0,50));}
    setAiLoading(false);setTimeout(()=>setAiMsg(null),4000);
  };

  const exportPDF=r=>{
    const w=window.open("","_blank");
    w.document.write(pdfOpen(r.title)+pdfHeader(r.title,r.date+" · "+r.category)+mdToHtml(r.content)+pdfClose());
    w.document.close();setTimeout(()=>w.print(),400);
  };

  const formProps={form,setForm,onCancel:()=>{setShowNew(false);setEditId(null);},aiLoading,aiMsg,correctWithAI,cats,th};
  const catColors={Táctico:"#3b82f6",Partido:"#f97316",Jugador:"#10b981",Temporada:"#8b5cf6",Otro:"#64748b"};

  return <div>
    <SH title="Informes" sub="Crear · Editar · Exportar PDF · Corrección IA"
      right={<Btn onClick={()=>{setShowNew(true);setEditId(null);setForm({title:"",category:"Táctico",content:"",date:new Date().toISOString().split("T")[0]});}} icon={<Plus size={14}/>}>Nuevo informe</Btn>}/>

    {showNew&&!editId&&<InformesEditForm {...formProps} onSave={saveNew}/>}

    {informes.length===0&&!showNew&&<div className="card" style={{padding:48,textAlign:"center"}}>
      <FileText size={36} color={th.muted} style={{margin:"0 auto 14px",display:"block"}}/>
      <p style={{color:th.muted,fontSize:14}}>Sin informes. Crea el primero con el botón superior.</p>
    </div>}

    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {informes.map(r=>{
        const c=catColors[r.category]||"#64748b";
        if(editId===r.id)return <InformesEditForm key={r.id} {...formProps} onSave={saveEdit}/>;
        return <div key={r.id} className="card" style={{padding:0,overflow:"hidden",borderLeft:`4px solid ${c}`}}>
          <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text}}>{r.title}</h4>
                <Badge color={c} sm>{r.category}</Badge>
              </div>
              <p style={{fontSize:11,color:th.muted}}>{r.date} · {r.content.length} caracteres</p>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <Btn onClick={()=>startEdit(r)} variant="ghost" sm icon={<Edit2 size={12}/>}>Editar</Btn>
              <Btn onClick={()=>exportPDF(r)} variant="ghost" sm icon={<Printer size={12}/>}>PDF</Btn>
              <button onClick={()=>del(r.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:4}}><Trash2 size={14}/></button>
            </div>
          </div>
          <div style={{padding:"0 18px 14px",borderTop:`1px solid ${th.border}`}}>
            <div style={{fontSize:12,color:th.sub,lineHeight:1.7,maxHeight:120,overflow:"hidden",maskImage:"linear-gradient(to bottom,black 60%,transparent)"}}
              dangerouslySetInnerHTML={{__html:mdToHtml(r.content.slice(0,300))}}/>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   BLOQUE F — Buscador semántico con IA
══════════════════════════════════════════════════════════ */
function BuscadorIA(){
  const{th}=useTheme();const{recursos,ejercicios,plays,apiKey}=useData();
  const[query,setQuery]=useState("");
  const[loading,setLoading]=useState(false);
  const[results,setResults]=useState(null);
  const[filter,setFilter]=useState("Todo");

  const search=async()=>{
    if(!query.trim())return;
    if(!apiKey){setResults({error:"Configura tu API Key en ⚙️ Ajustes."});return;}
    setLoading(true);setResults(null);

    // Build index
    const index=[
      ...recursos.map(r=>({tipo:"Recurso",id:r.id,titulo:r.title,desc:(r.tags||[]).join(", ")+" "+r.url,extra:r.url})),
      ...ejercicios.map(e=>({tipo:"Ejercicio",id:e.id,titulo:e.name,desc:e.cat+" "+e.diff+" "+(e.desc||""),extra:e.cat+" · "+e.diff+(e.dur?" · "+e.dur:"")})),
      ...plays.map(p=>({tipo:"Jugada",id:p.id,titulo:p.name,desc:p.cat+" "+(p.desc||"")+" "+(p.tags||[]).join(" "),extra:p.cat})),
    ].filter(x=>x.titulo);

    if(index.length===0){setResults({items:[],note:"No hay contenido indexado todavía. Añade recursos, ejercicios y jugadas."});setLoading(false);return;}

    const indexStr=index.map((x,i)=>`[${i}] ${x.tipo}: "${x.titulo}" — ${x.desc.slice(0,100)}`).join("\n");
    try{
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:600,
        messages:[{role:"user",content:
          "Eres un buscador semántico de una app de gestión de baloncesto.\n\n"
          +"BÚSQUEDA DEL ENTRENADOR: \""+query+"\"\n\n"
          +"ÍNDICE DE CONTENIDO:\n"+indexStr+"\n\n"
          +"Devuelve ÚNICAMENTE JSON válido en una sola línea con los índices más relevantes (máximo 8):\n"
          +'{"resultados":[{"idx":0,"relevancia":"alta","razon":"Ejercicio de bloqueo directo, muy relevante para la consulta"}]}'
        }]
      });
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      const jStart=txt.indexOf("{");const jEnd=txt.lastIndexOf("}");
      const parsed=JSON.parse(txt.slice(jStart,jEnd+1).replace(/\n/g," "));
      const items=(parsed.resultados||[]).map(r=>({...index[r.idx],...r})).filter(Boolean);
      setResults({items,query});
    }catch(e){setResults({error:"Error: "+e.message?.slice(0,60)});}
    setLoading(false);
  };

  const typeColors={Recurso:"#f97316",Ejercicio:"#3b82f6",Jugada:"#10b981"};
  const relColors={alta:"#10b981",media:"#f97316",baja:"#94a3b8"};
  const stats={total:(recursos.length+ejercicios.length+plays.length),recursos:recursos.length,ejercicios:ejercicios.length,jugadas:plays.length};

  return <div>
    <SH title="Buscador IA" sub="Busca entre recursos, ejercicios y jugadas en lenguaje natural"/>

    {/* Stats del índice */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
      {[["Total indexado",stats.total,"#f97316"],["Recursos",stats.recursos,"#f97316"],["Ejercicios",stats.ejercicios,"#3b82f6"],["Jugadas",stats.jugadas,"#10b981"]].map(([l,v,c])=>(
        <div key={l} className="card" style={{padding:"14px 16px"}}>
          <p style={{fontFamily:"DM Mono",fontSize:24,fontWeight:700,color:c,lineHeight:1}}>{v}</p>
          <p style={{fontSize:11,color:th.muted,marginTop:4}}>{l}</p>
        </div>
      ))}
    </div>

    {/* Buscador */}
    <div className="card" style={{padding:20,marginBottom:16}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>¿Qué buscas?</p>
      <div style={{display:"flex",gap:10}}>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&search()}
          placeholder="ej: ejercicios de bloqueo directo, jugadas para atacar zona, recursos de defensa presión…"
          style={{flex:1,fontSize:14}}/>
        <Btn onClick={search} disabled={loading||!query.trim()} icon={loading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={14}/>}>
          {loading?"Buscando…":"Buscar"}
        </Btn>
      </div>
      <p style={{fontSize:11,color:th.muted,marginTop:8}}>La IA entiende lenguaje natural y encuentra el contenido más relevante de tu biblioteca.</p>
    </div>

    {/* Resultados */}
    {results?.error&&<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:"12px 16px",color:"#ef4444",fontSize:13}}>{results.error}</div>}
    {results?.note&&<div style={{background:"rgba(245,158,11,.07)",border:"1px solid rgba(245,158,11,.3)",borderRadius:10,padding:"12px 16px",color:"#f59e0b",fontSize:13}}>{results.note}</div>}
    {results?.items&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:.5}}>
          {results.items.length} resultado{results.items.length!==1?"s":""} para «{results.query}»
        </p>
        <div style={{display:"flex",gap:6}}>
          {["Todo","Recurso","Ejercicio","Jugada"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{padding:"3px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontFamily:"Barlow Condensed",fontWeight:700,
                background:filter===f?(typeColors[f]||"#f97316"):th.card2,color:filter===f?"#fff":th.sub}}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {results.items.length===0?<div className="card" style={{padding:32,textAlign:"center"}}>
        <p style={{color:th.muted}}>Sin resultados relevantes. Prueba con otra búsqueda.</p>
      </div>:
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {results.items.filter(x=>filter==="Todo"||x.tipo===filter).map((item,i)=>{
          const c=typeColors[item.tipo]||"#f97316";
          return <div key={i} className="card" style={{padding:"14px 18px",borderLeft:`4px solid ${c}`}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <Badge color={c} sm>{item.tipo}</Badge>
                  <span style={{background:relColors[item.relevancia]+"20",color:relColors[item.relevancia],border:"1px solid "+relColors[item.relevancia]+"40",borderRadius:4,padding:"1px 7px",fontSize:9,fontFamily:"Barlow Condensed",fontWeight:700,textTransform:"uppercase"}}>{item.relevancia}</span>
                </div>
                <h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:3}}>{item.titulo}</h4>
                <p style={{fontSize:11,color:th.muted,marginBottom:item.razon?4:0}}>{item.extra}</p>
                {item.razon&&<p style={{fontSize:12,color:th.sub,fontStyle:"italic"}}>💡 {item.razon}</p>}
              </div>
              {item.tipo==="Recurso"&&item.extra?.startsWith("http")&&
                <a href={item.extra} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,color:th.sub,fontSize:12,textDecoration:"none",flexShrink:0,fontFamily:"Barlow Condensed",fontWeight:700}}>
                  <Link size={11}/>Abrir
                </a>}
            </div>
          </div>;
        })}
      </div>}
    </div>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   SHOT CHART — Mapa de tiros interactivo
══════════════════════════════════════════════════════════ */
function ShotChart(){
  const{th}=useTheme();const{players,matches}=useData();
  const cr=useRef(null);
  const[shots,setShots]=useState([]);
  const[filterPid,setFilterPid]=useState("all");
  const[filterMatch,setFilterMatch]=useState("all");
  const[showHeat,setShowHeat]=useState(false);
  const[showNums,setShowNums]=useState(true);
  const[view,setView]=useState("court");
  const lastTap=useRef(0);

  // ── Shot Chart court — exact same logic as Pizarra dCourt ──
  // Pizarra: CW=820,CH=500, basket at RY=BL-42, key KW=190,KH=235
  // Shot chart scaled down: CW=560,CH=380
  const SCW=560,SCH=380;
  const SC_m=10;                      // margin
  const SC_CX=SCW/2;                  // 280  horizontal centre
  const SC_BL=SCH-SC_m;              // 370  baseline y
  const SC_KW=160,SC_KH=200;         // key dimensions
  const SC_KX=SC_CX-SC_KW/2;        // 200  key left x
  const SC_KY=SC_BL-SC_KH;          // 170  key top y  (= FT line)
  const SC_FTR=SC_KW/2;             // 80   FT circle radius
  const SC_RY=SC_BL-32;             // 338  rim y
  const SC_C3=70;                   // corner 3 line x (11% of width)
  // 3pt radius: set directly so arc clears FT circle by ~30px
  const SC_R3=278;
  // Corner line top y: where arc meets the corner line x
  const SC_corner_dy=Math.sqrt(SC_R3*SC_R3-(SC_CX-SC_C3)*(SC_CX-SC_C3)); // ≈182
  const SC_corner_y=SC_RY-SC_corner_dy;   // ≈156
  const SC_C3h=SC_BL-SC_corner_y;         // ≈214 corner line height

  const zoneName=({x,y})=>{
    const d=Math.sqrt((x-SC_CX)**2+(y-SC_RY)**2);
    const inP=x>=SC_KX&&x<=SC_KX+SC_KW&&y>=SC_KY&&y<=SC_BL;
    if(inP&&d<55)return"TL";
    if(inP)return"T2_PAINT";
    const isCorner=y>SC_BL-SC_C3h&&(x<SC_C3||x>SCW-SC_C3);
    if(isCorner)return"T3";
    if(d>SC_R3)return"T3";
    if(x<SC_CX-65)return"T2_LEFT";
    if(x>SC_CX+65)return"T2_RIGHT";
    return"T2_MID";
  };

  const CW=SCW,CH=SCH; // aliases for canvas attrs

  const drawCourt=ctx=>{
    ctx.clearRect(0,0,SCW,SCH);
    // Floor
    ctx.fillStyle=th.mode==="dark"?"#1e293b":"#ecfdf5";
    ctx.fillRect(0,0,SCW,SCH);
    const LINE=th.mode==="dark"?"rgba(255,255,255,.55)":"rgba(30,58,95,.55)";
    ctx.strokeStyle=LINE;ctx.lineWidth=2;

    // Boundary
    ctx.strokeRect(SC_m,SC_m,SCW-SC_m*2,SCH-SC_m*2);

    // Key / paint
    ctx.strokeRect(SC_KX,SC_KY,SC_KW,SC_KH);

    // Key blocks (3 marks on each side, like Pizarra)
    [.28,.54,.78].forEach(r=>{
      const hy=SC_KY+SC_KH*r;
      ctx.beginPath();ctx.moveTo(SC_KX,hy);ctx.lineTo(SC_KX-10,hy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(SC_KX+SC_KW,hy);ctx.lineTo(SC_KX+SC_KW+10,hy);ctx.stroke();
    });

    // FT circle — solid half (above FT line, anticlockwise=true like Pizarra)
    ctx.beginPath();ctx.arc(SC_CX,SC_KY,SC_FTR,Math.PI,0,true);ctx.stroke();
    // Dashed half inside key (anticlockwise=false like Pizarra)
    ctx.setLineDash([7,5]);
    ctx.beginPath();ctx.arc(SC_CX,SC_KY,SC_FTR,Math.PI,0,false);ctx.stroke();
    ctx.setLineDash([]);

    // Rim circle
    ctx.beginPath();ctx.arc(SC_CX,SC_RY,12,0,Math.PI*2);
    ctx.strokeStyle="#f97316";ctx.lineWidth=2.5;ctx.stroke();
    ctx.strokeStyle=LINE;ctx.lineWidth=2;

    // Backboard (horizontal bar below basket toward baseline)
    ctx.lineWidth=4;
    ctx.beginPath();ctx.moveTo(SC_CX-30,SC_BL-18);ctx.lineTo(SC_CX+30,SC_BL-18);ctx.stroke();
    ctx.lineWidth=2;

    // Rim catch arc (small arc under rim, like Pizarra)
    ctx.beginPath();ctx.arc(SC_CX,SC_RY,30,Math.PI,0,false);ctx.stroke();

    // ── 3-POINT LINE ──────────────────────────────────────────
    ctx.strokeStyle="#3b82f6";ctx.lineWidth=2.5;
    // Corner straight lines (from baseline up to where arc starts)
    ctx.beginPath();
    ctx.moveTo(SC_C3,SC_BL);ctx.lineTo(SC_C3,SC_corner_y);
    ctx.moveTo(SCW-SC_C3,SC_BL);ctx.lineTo(SCW-SC_C3,SC_corner_y);
    ctx.stroke();
    // Arc centered on rim, sweeping UP from left corner through backcourt to right
    const a1=Math.atan2(SC_corner_y-SC_RY,SC_C3-SC_CX);
    const a2=Math.atan2(SC_corner_y-SC_RY,(SCW-SC_C3)-SC_CX);
    ctx.beginPath();ctx.arc(SC_CX,SC_RY,SC_R3,a1,a2,false);ctx.stroke();

    // Zone text labels
    ctx.fillStyle=th.mode==="dark"?"#475569":"#94a3b8";
    ctx.font="bold 10px 'Barlow Condensed',sans-serif";
    ctx.textAlign="center";
    ctx.fillText("ZONA 2",SC_CX,SC_KY+70);
    ctx.fillStyle="#3b82f6";
    ctx.fillText("T3",SC_CX,SC_RY-SC_R3+18);
    ctx.fillText("T3",38,240);
    ctx.fillText("T3",522,240);
  };


  const drawShots=ctx=>{
    const fil=shots.filter(s=>{
      if(filterPid!=="all"&&String(s.pid)!==String(filterPid))return false;
      if(filterMatch!=="all"&&String(s.matchId)!==filterMatch)return false;
      return true;
    });
    if(showHeat){
      const hc=document.createElement("canvas");hc.width=CW;hc.height=CH;
      const hx=hc.getContext("2d");
      fil.forEach(s=>{
        const g=hx.createRadialGradient(s.x,s.y,0,s.x,s.y,40);
        g.addColorStop(0,(s.made?"rgba(16,185,129,":"rgba(239,68,68,")+"0.45)");
        g.addColorStop(1,(s.made?"rgba(16,185,129,":"rgba(239,68,68,")+"0)");
        hx.fillStyle=g;hx.fillRect(s.x-40,s.y-40,80,80);
      });
      ctx.globalAlpha=0.7;ctx.drawImage(hc,0,0);ctx.globalAlpha=1;
    }
    fil.forEach(s=>{
      const r=showNums&&s.pid?9:7;
      ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);
      ctx.fillStyle=s.made?"#10b981":"#ef4444";
      ctx.globalAlpha=0.92;ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.stroke();
      if(showNums&&s.pid){
        const pl=players.find(p=>String(p.id)===String(s.pid));
        if(pl){
          ctx.font="bold 8px 'DM Mono',monospace";
          ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
          ctx.fillText(pl.num,s.x,s.y);ctx.textBaseline="alphabetic";
        }
      } else if(!s.made){
        ctx.strokeStyle="#fff";ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(s.x-4,s.y-4);ctx.lineTo(s.x+4,s.y+4);ctx.stroke();
        ctx.beginPath();ctx.moveTo(s.x+4,s.y-4);ctx.lineTo(s.x-4,s.y+4);ctx.stroke();
      }
    });
  };

  const redraw=useCallback(()=>{
    const canvas=cr.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    drawCourt(ctx);drawShots(ctx);
  },[shots,filterPid,filterMatch,showHeat,showNums,th]);

  useEffect(()=>{redraw();},[redraw]);

  const getPos=e=>{
    const rect=cr.current.getBoundingClientRect();
    // touchend: touches[] is empty, use changedTouches instead
    const touch=e.changedTouches?e.changedTouches[0]:e.touches?e.touches[0]:e;
    return{x:(touch.clientX-rect.left)*CW/rect.width,y:(touch.clientY-rect.top)*CH/rect.height};
  };

  const handleTap=e=>{
    e.preventDefault();
    const now=Date.now();const dbl=now-lastTap.current<350;lastTap.current=now;
    const{x,y}=getPos(e);
    setShots(prev=>[...prev,{id:Date.now(),x,y,made:dbl,zone:zoneName({x,y}),
      pid:filterPid==="all"?null:filterPid,matchId:filterMatch==="all"?null:filterMatch}]);
  };

  const filtered=shots.filter(s=>{
    if(filterPid!=="all"&&String(s.pid)!==String(filterPid))return false;
    if(filterMatch!=="all"&&String(s.matchId)!==filterMatch)return false;
    return true;
  });
  const made=filtered.filter(s=>s.made).length;
  const total=filtered.length;
  const pct=total?Math.round(made/total*100):0;
  const zones=["T2_PAINT","T2_LEFT","T2_MID","T2_RIGHT","T3","TL"];
  const zoneLabel={"T2_PAINT":"Pintura","T2_LEFT":"T2 Izq","T2_MID":"T2 Centro","T2_RIGHT":"T2 Der","T3":"Triples","TL":"TL"};

  const playerStats=players.filter(p=>p.active).map(p=>{
    const ps=shots.filter(s=>String(s.pid)===String(p.id));
    const pm=ps.filter(s=>s.made).length;
    const t2=ps.filter(s=>s.zone!=="T3"&&s.zone!=="TL");
    const t3=ps.filter(s=>s.zone==="T3");
    return{p,total:ps.length,made:pm,pct:ps.length?Math.round(pm/ps.length*100):null,
      t2m:t2.filter(s=>s.made).length,t2i:t2.length,t3m:t3.filter(s=>s.made).length,t3i:t3.length};
  }).filter(s=>s.total>0).sort((a,b)=>b.total-a.total);

  return <div>
    <SH title="Shot Chart" sub="1 clic = fallo · 2 clics rápidos = acierto"/>
    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
      <select value={filterPid} onChange={e=>setFilterPid(e.target.value)} style={{fontSize:11}}>
        <option value="all">Todos los jugadores</option>
        {players.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>#{p.num} {p.name.split(" ")[0]}</option>)}
      </select>
      <select value={filterMatch} onChange={e=>setFilterMatch(e.target.value)} style={{fontSize:11}}>
        <option value="all">Todos los partidos</option>
        {matches.map(m=><option key={m.id} value={m.id}>{m.date} vs {m.rival}</option>)}
      </select>
      <div style={{display:"flex",gap:4}}>
        {[["court","🏀 Pista"],["stats","📊 Stats"]].map(([v,l])=>(
          <button key={v} onClick={()=>setView(v)} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontFamily:"Barlow Condensed",fontWeight:700,background:view===v?"#f97316":th.card2,color:view===v?"#fff":th.sub}}>{l}</button>
        ))}
      </div>
      <button onClick={()=>setShowHeat(h=>!h)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:showHeat?"rgba(249,115,22,.12)":th.card2,color:showHeat?"#f97316":th.sub,fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700}}>🌡 Calor</button>
      <button onClick={()=>setShowNums(n=>!n)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:showNums?"rgba(59,130,246,.12)":th.card2,color:showNums?"#3b82f6":th.sub,fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700}}># Dorsales</button>
      <div style={{marginLeft:"auto",display:"flex",gap:6}}>
        <button onClick={()=>setShots(p=>p.slice(0,-1))} disabled={!shots.length} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,color:th.sub,fontSize:11,cursor:"pointer",opacity:shots.length?1:.4}}>↩</button>
        <button onClick={()=>setShots([])} disabled={!shots.length} style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",color:"#ef4444",fontSize:11,cursor:"pointer",opacity:shots.length?1:.4}}>Limpiar</button>
      </div>
    </div>

    {view==="court"&&<div style={{display:"grid",gridTemplateColumns:"1fr 190px",gap:14}}>
      <div className="card" style={{padding:12}}>
        <div style={{borderRadius:8,overflow:"hidden",lineHeight:0,border:`1px solid ${th.border}`}}>
          <canvas ref={cr} width={CW} height={CH} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair",touchAction:"none"}}
            onClick={handleTap} onTouchEnd={handleTap}/>
        </div>
        <p style={{fontSize:10,color:th.muted,marginTop:6,textAlign:"center"}}>
          🟢 Acierto (2 clics) &nbsp;🔴 Fallo (1 clic) &nbsp;·&nbsp; # = dorsal
        </p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div className="card" style={{padding:14,textAlign:"center"}}>
          <p style={{fontFamily:"DM Mono",fontSize:34,fontWeight:700,color:pct>=50?"#10b981":"#ef4444",lineHeight:1}}>{total?pct+"%":"—"}</p>
          <p style={{fontSize:10,color:th.muted,marginTop:3}}>Efectividad</p>
          <p style={{fontFamily:"DM Mono",fontSize:12,color:th.sub,marginTop:4}}>{made}/{total} tiros</p>
        </div>
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:10,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Por zona</p>
          {zones.map(z=>{
            const zS=filtered.filter(s=>s.zone===z);
            const zM=zS.filter(s=>s.made).length;
            const zP=zS.length?Math.round(zM/zS.length*100):null;
            if(!zS.length)return null;
            return <div key={z} style={{marginBottom:7}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:9,color:th.sub,fontFamily:"Barlow Condensed"}}>{zoneLabel[z]}</span>
                <span style={{fontSize:9,fontFamily:"DM Mono",color:zP>=50?"#10b981":"#ef4444",fontWeight:700}}>{zP}%</span>
              </div>
              <div style={{height:4,borderRadius:2,background:th.border2}}>
                <div style={{height:4,borderRadius:2,background:zP>=50?"#10b981":"#ef4444",width:zP+"%"}}/>
              </div>
              <p style={{fontSize:8,color:th.muted,marginTop:1}}>{zM}/{zS.length}</p>
            </div>;
          })}
          {!filtered.length&&<p style={{fontSize:10,color:th.muted}}>Haz clic en la pista para añadir tiros</p>}
        </div>
      </div>
    </div>}

    {view==="stats"&&<div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:540}}>
        <thead>
          <tr style={{background:th.tableHead}}>
            {["Jugador","Tiros","Aciert.","% Tot","T2 int","T2 met","% T2","T3 int","T3 met","% T3"].map(h=>(
              <th key={h} style={{padding:"8px 8px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",fontWeight:700}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {playerStats.length===0&&<tr><td colSpan={10} style={{padding:24,textAlign:"center",color:th.muted,fontSize:12}}>Sin tiros registrados. Ve a Pista, selecciona un jugador y añade sus tiros.</td></tr>}
          {playerStats.map(({p,total,made,pct,t2m,t2i,t3m,t3i})=>(
            <tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`}}>
              <td style={{padding:"8px 10px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:11,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{p.num}</div>
                  <span style={{fontSize:12,color:th.text,fontFamily:"Barlow Condensed",fontWeight:700}}>{p.name.split(" ")[0]}</span>
                </div>
              </td>
              {[total,made,pct!=null?pct+"%":"—",t2i,t2m,t2i?Math.round(t2m/t2i*100)+"%":"—",t3i,t3m,t3i?Math.round(t3m/t3i*100)+"%":"—"].map((v,i)=>(
                <td key={i} style={{padding:"8px 8px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,
                  color:String(v).includes("%")?(parseInt(v)>=50?"#10b981":"#ef4444"):th.text,fontWeight:String(v).includes("%")?700:400}}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>}
  </div>;
}


/* ══════════════════════════════════════════════════════════
   CLASIFICACIÓN — tabla editable + actualización por imagen IA
══════════════════════════════════════════════════════════ */
const INIT_CLASIFICACION=[
  {pos:1,equip:"CB CONSELL SFE19",         j:8,g:5,p:3,np:0,pe:0,pf:502,pc:485,pts:13},
  {pos:2,equip:"ESPORLES BC",              j:7,g:5,p:2,np:0,pe:0,pf:460,pc:405,pts:12},
  {pos:3,equip:"SA POBLA BC A MIQUEL SAMPOL TREBALLS D'OBRA",j:8,g:4,p:4,np:0,pe:0,pf:523,pc:552,pts:12},
  {pos:4,equip:"CB SON COTONER",           j:7,g:5,p:2,np:0,pe:0,pf:497,pc:418,pts:12},
  {pos:5,equip:"CB BINISSALEM BLAU - FORN NOU A",j:7,g:3,p:4,np:0,pe:0,pf:452,pc:474,pts:10},
  {pos:6,equip:"GUIDO SITGER BASQUET SON SERVERA",j:8,g:2,p:6,np:0,pe:0,pf:476,pc:521,pts:10},
  {pos:7,equip:"BC SANTANYÍ - CONSTRUCCIONES HLG MALLORCA",j:7,g:2,p:5,np:0,pe:0,pf:411,pc:466,pts:9},
];
const MY_TEAM="CB BINISSALEM";

/* ── ClasifNI — input numérico para edición de clasificación, top-level para evitar pérdida de foco ── */
function ClasifNI({field,wide,editRow,setEditRow,th}){
  return <input type="text" inputMode="numeric" maxLength={4}
    value={editRow[field]||""}
    onChange={e=>{if(/^\d*$/.test(e.target.value))setEditRow(r=>({...r,[field]:e.target.value}));}}
    style={{width:wide?52:44,textAlign:"center",fontFamily:"DM Mono",fontSize:12,padding:"3px 2px",
      borderRadius:5,border:"1px solid #f97316",background:"rgba(249,115,22,.08)",color:th.text}}/>;
}

function Clasificacion(){
  const{th}=useTheme();const{apiKey}=useData();
  const[tabla,setTabla]=useState(INIT_CLASIFICACION);
  const[editIdx,setEditIdx]=useState(null);
  const[editRow,setEditRow]=useState(null);
  const[addRow,setAddRow]=useState(false);
  const[newRow,setNewRow]=useState({equip:"",j:0,g:0,p:0,np:0,pe:0,pf:0,pc:0,pts:0});
  const[aiLoading,setAiLoading]=useState(false);
  const[aiMsg,setAiMsg]=useState(null);
  const[liga,setLiga]=useState("3a Autonòmica Masculina - Mallorca");
  const[temporada,setTemporada]=useState("2025/26");
  const imgRef=useRef();

  const sorted=[...tabla].sort((a,b)=>b.pts-a.pts||b.g-a.g||(a.pc-a.pf)-(b.pc-b.pf));

  const startEdit=(row,i)=>{setEditIdx(i);setEditRow({...row});};
  const saveEdit=()=>{
    setTabla(prev=>prev.map((r,i)=>i===editIdx?{...editRow}:r));
    setEditIdx(null);setEditRow(null);
  };
  const delRow=i=>setTabla(prev=>prev.filter((_,j)=>j!==i));
  const addNewRow=()=>{
    const pos=tabla.length+1;
    setTabla(prev=>[...prev,{...newRow,pos,pts:newRow.pts||newRow.g*2+newRow.p}]);
    setNewRow({equip:"",j:0,g:0,p:0,np:0,pe:0,pf:0,pc:0,pts:0});setAddRow(false);
  };

  // Update from image via AI
  const importFromImage=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(!apiKey){setAiMsg("❌ Configura tu API Key en ⚙️ Ajustes.");e.target.value="";return;}
    setAiLoading(true);setAiMsg("Leyendo clasificación de la imagen…");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      // Detect media type robustly (file.type can be empty on some browsers)
      const isPDF=file.type==="application/pdf"||file.name?.toLowerCase().endsWith(".pdf");
      const mt=isPDF?"application/pdf":(file.type||"image/jpeg");
      const contentBlock=isPDF
        ?{type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}}
        :{type:"image",source:{type:"base64",media_type:mt.startsWith("image/")?mt:"image/jpeg",data:base64}};
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:[
          contentBlock,
          {type:"text",text:"Extrae la clasificación de baloncesto de esta imagen/tabla. Para cada equipo extrae: posición, nombre, J (jugados), G (ganados), P (perdidos), NP (no presentados o similar), PE (puntos en contra extra o protestados), PF (puntos a favor), PC (puntos en contra), PTS (puntos clasificación).\n\nDevuelve ÚNICAMENTE JSON válido en una sola línea sin markdown:\n{\"equipos\":[{\"pos\":1,\"equip\":\"NOMBRE\",\"j\":8,\"g\":5,\"p\":3,\"np\":0,\"pe\":0,\"pf\":502,\"pc\":485,\"pts\":13}]}\n\nSi algún campo no existe usa 0."}
        ]}]
      });
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      const js=txt.slice(txt.indexOf("{"),txt.lastIndexOf("}")+1);
      const parsed=JSON.parse(js.replace(/[\r\n]+/g," "));
      if(parsed.equipos?.length){
        setTabla(parsed.equipos);
        setAiMsg("✅ "+parsed.equipos.length+" equipos importados");
      } else setAiMsg("⚠️ No se encontraron equipos");
    }catch(err){setAiMsg("❌ Error: "+err.message?.slice(0,50));}
    setAiLoading(false);e.target.value="";
    setTimeout(()=>setAiMsg(null),5000);
  };

  const COLS=["J","G","P","NP","PE","PF","PC","PTS"];
  const FIELDS=["j","g","p","np","pe","pf","pc","pts"];

  return <div>
    <SH title="Clasificación" sub={liga+" · "+temporada}
      right={<div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input ref={imgRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={importFromImage}/>
        <Btn onClick={()=>imgRef.current?.click()} variant="ghost" disabled={aiLoading}
          icon={aiLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Camera size={13}/>}>
          {aiLoading?"Leyendo…":"Actualizar con foto"}
        </Btn>
        <Btn onClick={()=>setAddRow(true)} icon={<Plus size={13}/>} sm>Añadir equipo</Btn>
      </div>}/>

    {/* Liga / temporada */}
    <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12,marginBottom:14}}>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input value={liga} onChange={e=>setLiga(e.target.value)} style={{flex:1,fontSize:12}} placeholder="Nombre de la liga"/>
        <input value={temporada} onChange={e=>setTemporada(e.target.value)} style={{width:90,fontSize:12}} placeholder="Temporada"/>
      </div>
      {aiMsg&&<span style={{fontSize:11,color:aiMsg.startsWith("✅")?"#10b981":aiMsg.startsWith("⚠️")?"#f59e0b":"#ef4444",alignSelf:"center"}}>{aiMsg}</span>}
    </div>

    {/* Añadir equipo */}
    {addRow&&<div className="card" style={{padding:14,marginBottom:12,borderColor:"#f9731640"}}>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input value={newRow.equip} onChange={e=>setNewRow(r=>({...r,equip:e.target.value}))}
          placeholder="Nombre del equipo" style={{flex:1,minWidth:200,fontSize:12}}/>
        {FIELDS.map((f,i)=>(
          <div key={f} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <span style={{fontSize:9,color:th.muted,fontFamily:"Barlow Condensed",textTransform:"uppercase"}}>{COLS[i]}</span>
            <input type="text" inputMode="numeric" maxLength={4} value={newRow[f]||""}
              onChange={e=>{if(/^\d*$/.test(e.target.value))setNewRow(r=>({...r,[f]:e.target.value}));}}
              style={{width:44,textAlign:"center",fontFamily:"DM Mono",fontSize:12,padding:"3px 2px",borderRadius:5,border:`1px solid ${th.border2}`,background:th.inputBg,color:th.text}}/>
          </div>
        ))}
        <Btn onClick={addNewRow} sm>Añadir</Btn>
        <Btn onClick={()=>setAddRow(false)} variant="ghost" sm>✗</Btn>
      </div>
    </div>}

    {/* Tabla */}
    <div className="card" style={{overflow:"auto",padding:0}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:680}}>
        <thead>
          <tr style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)"}}>
            <th style={{padding:"12px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:12,color:"#fff",fontWeight:700,width:40}}>#</th>
            <th style={{padding:"12px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:12,color:"#fff",fontWeight:700}}>Equip</th>
            {COLS.map(c=><th key={c} style={{padding:"12px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:12,color:"#fff",fontWeight:700,minWidth:38}}>{c}</th>)}
            <th style={{width:60}}/>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row,i)=>{
            const isUs=row.equip.toUpperCase().includes(MY_TEAM);
            const isEdit=editIdx!==null&&tabla.indexOf(row)===editIdx;
            const bg=isUs?"rgba(249,115,22,.08)":i%2===0?th.card:th.card2;
            if(isEdit)return(
              <tr key={i} style={{background:"rgba(249,115,22,.12)",borderTop:`1px solid ${th.border}`}}>
                <td style={{padding:"6px 10px",textAlign:"center",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{i+1}</td>
                <td style={{padding:"6px 10px"}}>
                  <input value={editRow.equip} onChange={e=>setEditRow(r=>({...r,equip:e.target.value}))}
                    style={{width:"100%",fontSize:12,fontFamily:"Barlow Condensed",fontWeight:700}}/>
                </td>
                {FIELDS.map(f=><td key={f} style={{padding:"4px 4px",textAlign:"center"}}><ClasifNI field={f} editRow={editRow} setEditRow={setEditRow} th={th}/></td>)}
                <td style={{padding:"4px 8px"}}>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={saveEdit} style={{padding:"3px 8px",borderRadius:5,border:"1px solid #10b981",background:"rgba(16,185,129,.1)",color:"#10b981",cursor:"pointer",fontSize:11,fontFamily:"Barlow Condensed",fontWeight:700}}>✓</button>
                    <button onClick={()=>setEditIdx(null)} style={{padding:"3px 6px",borderRadius:5,border:`1px solid ${th.border2}`,background:th.card2,color:th.muted,cursor:"pointer",fontSize:11}}>✗</button>
                  </div>
                </td>
              </tr>
            );
            return(
              <tr key={i} style={{background:bg,borderTop:`1px solid ${th.border}`,transition:"background .1s"}} className="hrow">
                <td style={{padding:"12px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:i<3?"#f97316":th.muted}}>{i+1}</td>
                <td style={{padding:"12px 16px"}}>
                  <span style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:isUs?700:500,color:isUs?"#f97316":th.text}}>
                    {isUs&&<span style={{marginRight:6}}>🏀</span>}{row.equip}
                  </span>
                </td>
                {FIELDS.map(f=><td key={f} style={{padding:"12px 10px",textAlign:"center",fontFamily:"DM Mono",fontSize:13,
                  color:f==="pts"?(isUs?"#f97316":"#0891b2"):th.text,
                  fontWeight:f==="pts"?700:400}}>{row[f]??0}</td>)}
                <td style={{padding:"8px 8px"}}>
                  <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                    <button onClick={()=>startEdit(row,tabla.indexOf(row))} style={{width:22,height:22,borderRadius:5,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.muted,display:"flex",alignItems:"center",justifyContent:"center"}}><Edit2 size={10}/></button>
                    <button onClick={()=>delRow(tabla.indexOf(row))} style={{width:22,height:22,borderRadius:5,border:"none",background:"transparent",cursor:"pointer",color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center"}}><Trash2 size={10}/></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Leyenda */}
    <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
      <span style={{fontSize:10,color:th.muted,fontFamily:"Barlow Condensed"}}>J=Jugados · G=Ganados · P=Perdidos · NP=No Presentados · PE=Puntos extra · PF=Puntos a favor · PC=Puntos en contra · PTS=Puntos clasificación</span>
      <span style={{fontSize:10,color:"#f97316",fontFamily:"Barlow Condensed",fontWeight:700}}>🏀 = Tu equipo</span>
    </div>
    <p style={{fontSize:11,color:th.muted,marginTop:6}}>Actualiza la clasificación subiendo una foto o captura de pantalla de la web de tu federación con el botón "Actualizar con foto".</p>
  </div>;
}

const NAV=[
  {id:"dashboard",label:"Panel",         icon:LayoutDashboard},
  {id:"plantilla",label:"Plantilla",     icon:Users},
  {id:"partidos", label:"Partidos",      icon:Trophy},
  {id:"calendario",label:"Calendario",   icon:Calendar},
  {id:"plan",     label:"Planificación", icon:Target},
  {id:"stats",    label:"Estadísticas",  icon:BarChart2},
  {id:"evolucion",label:"Rendimiento",   icon:Activity},
  {id:"train",    label:"Entrenamientos",icon:Dumbbell},
  {id:"carga",    label:"Carga trabajo", icon:Zap},
  {id:"informe",  label:"Informe PDF",   icon:Printer},
  {id:"attend",   label:"Asistencia",    icon:Check},
  {id:"lineup",   label:"Quinteto",      icon:Shield},
  {id:"partido",  label:"Modo Partido",  icon:Trophy},
  {id:"playbook", label:"Playbook",      icon:BookOpen},
  {id:"exercises",label:"Ejercicios",    icon:Target},
  {id:"shotchart",label:"Shot Chart",     icon:Target},
  {id:"pizarra",  label:"Pizarra",        icon:PenTool},
  {id:"ia",       label:"IA Asistente",  icon:Brain},
  {id:"iq",       label:"Basketball IQ", icon:Target},
  {id:"informes", label:"Informes",       icon:FileText},
  {id:"buscador", label:"Buscador IA",    icon:Search},
  {id:"clasificacion",label:"Clasificación",icon:Trophy},
  {id:"recursos", label:"Recursos",       icon:Link},
];
const VIEWS={dashboard:Dashboard,plantilla:Plantilla,partidos:Partidos,calendario:Calendario,plan:Planificacion,stats:Estadisticas,evolucion:EvolucionStats,train:Entrenamientos,carga:CargaTrabajo,informe:InformeSemanal,attend:Asistencia,lineup:Quinteto,partido:ModoPartido,playbook:Playbook,exercises:Ejercicios,shotchart:ShotChart,pizarra:Pizarra,ia:IAAsistente,iq:BasketballIQ,informes:Informes,buscador:BuscadorIA,clasificacion:Clasificacion,recursos:Recursos};

/* ── Season Modal ─────────────────────────────────────────────── */
function SeasonModal({seasons,currentSeason,onSwitch,onCreate,onClose,th}){
  const[newLabel,setNewLabel]=useState("");
  const[creating,setCreating]=useState(false);
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div className="card" style={{width:"100%",maxWidth:400,padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text}}>Temporadas</h3>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:th.muted,cursor:"pointer",fontSize:18}}>✕</button>
      </div>
      {/* Season list */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {seasons.map(s=>(
          <div key={s.id} onClick={()=>{if(s.id!==currentSeason){onSwitch(s.id);onClose();}}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:10,
              border:`1px solid ${s.id===currentSeason?"#f97316":th.border}`,
              background:s.id===currentSeason?"rgba(249,115,22,.08)":th.card2,
              cursor:s.id===currentSeason?"default":"pointer"}}>
            <span style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,
              color:s.id===currentSeason?"#f97316":th.text}}>Temporada {s.label}</span>
            {s.id===currentSeason&&<span style={{marginLeft:"auto",fontSize:10,color:"#f97316",fontFamily:"Barlow Condensed",fontWeight:700}}>ACTIVA</span>}
          </div>
        ))}
      </div>
      {/* Create new */}
      {creating
        ?<div>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
            Nueva temporada · Playbook y ejercicios se copian automáticamente
          </p>
          <input value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="Ej: 26/27"
            style={{marginBottom:10,fontSize:14,fontFamily:"Barlow Condensed",fontWeight:700}}
            onKeyDown={e=>e.key==="Enter"&&newLabel.trim()&&onCreate(newLabel.trim())}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>newLabel.trim()&&onCreate(newLabel.trim())}
              disabled={!newLabel.trim()}
              style={{flex:1,padding:"10px 0",borderRadius:8,border:"none",background:"#f97316",color:"#fff",cursor:"pointer",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,opacity:newLabel.trim()?1:.5}}>
              Crear temporada {newLabel}
            </button>
            <button onClick={()=>setCreating(false)}
              style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,color:th.sub,cursor:"pointer",fontSize:13}}>
              Cancelar
            </button>
          </div>
        </div>
        :<button onClick={()=>setCreating(true)}
          style={{width:"100%",padding:"11px 0",borderRadius:8,border:`2px dashed ${th.border2}`,background:"transparent",color:th.muted,cursor:"pointer",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700}}>
          + Nueva temporada
        </button>}
    </div>
  </div>;
}

export default function App(){
  const[dark,setDarkRaw]=useState(true);const[view,setView]=useState("dashboard");
  const[season,setSeason]=useState(()=>localStorage.getItem("cb_season")||"state_25_26");
  // Map season ID to Supabase row ID — 25/26 uses legacy "state" key to preserve existing data
  const dbId=(s)=>s==="state_25_26"?"state":s;
  const[allSeasons,setAllSeasons]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("cb_seasons")||"null")||[{id:"state_25_26",label:"25/26"}];}
    catch{return [{id:"state_25_26",label:"25/26"}];}
  });
  const[showSeasonModal,setShowSeasonModal]=useState(false);
  const[loading,setLoading]=useState(true);const[sync,setSync]=useState("loading");

  const[players,   setPlayersRaw]  = useState(DP);
  const[matches,   setMatchesRaw]  = useState(DM);
  const[sessions,  setSessionsRaw] = useState(DS);
  const[attDates,  setAttDatesRaw] = useState(DA);
  const[quintets,  setQuintetsRaw] = useState(DEFAULT_QUINTETS);
  const[recursos,  setRecursosRaw] = useState(DEFAULT_RECURSOS);
  const[plays,     setPlaysRaw]    = useState(DEFAULT_PLAYS);
  const[ejercicios,setEjerciciosRaw]=useState(DEFAULT_EJS);
  const[customEx,  setCustomExRaw] = useState([]);
  const[savedDrawings,setSavedDrawingsRaw]=useState([]);
  const[planMesos, setPlanMesosRaw]=useState(null);
  const[planMicro, setPlanMicroRaw]=useState(null);
  const[sesionTemplates,setSesionTemplatesRaw]=useState([]);
  const[scouting,     setScoutingRaw]     = useState([]);
  const[matchAnalyses,setMatchAnalysesRaw]= useState([]);
  const[basketballIQ, setBasketballIQRaw] = useState([]);
  const[apiKey,    setApiKeyRaw]   = useState(()=>localStorage.getItem("cb_apikey")||"");

  const stRef=useRef({players:DP,matches:DM,sessions:DS,attDates:DA,quintets:DEFAULT_QUINTETS,recursos:DEFAULT_RECURSOS,plays:DEFAULT_PLAYS,ejercicios:DEFAULT_EJS,customEx:[],savedDrawings:[],planMesos:null,planMicro:null,sesionTemplates:[],scouting:[],matchAnalyses:[],basketballIQ:[],dark:true});
  const tmr=useRef(null);

  const persist=useCallback((patch)=>{
    // Update ref immediately — ensures stRef always has latest values
    stRef.current={...stRef.current,...patch};
    setSync("saving");

    // attDates saves immediately (no debounce) — critical for sync between devices
    if(patch.attDates!==undefined){
      (async()=>{
        try{
          const{error}=await sb.from("dashboard").upsert({id:dbId(season),data:stRef.current,updated_at:new Date().toISOString()});
          if(error)throw error;
          setSync("saved");
        }catch(e){console.error("AttDates save error:",e);setSync("offline");}
      })();
      return; // skip debounced save — immediate save already scheduled
    }

    if(tmr.current)clearTimeout(tmr.current);
    tmr.current=setTimeout(async()=>{
      try{
        // Strip base64 images — too large for Supabase (5MB limit). Images stay in local state only.
        const stripImages=obj=>{
          if(!obj||typeof obj!=="object")return obj;
          if(Array.isArray(obj))return obj.map(stripImages);
          const out={};
          for(const[k,v]of Object.entries(obj)){
            if(k==="images"&&Array.isArray(v))out[k]=[];
            else out[k]=stripImages(v);
          }
          return out;
        };
        const safeData=stripImages(stRef.current);
        const{error}=await sb.from("dashboard").upsert({id:dbId(season),data:safeData,updated_at:new Date().toISOString()});
        if(error)throw error;
        setSync("saved");
      }
      catch(e){console.error("Save error:",e);setSync("offline");}
    },900);
  },[season]);

  const mk=(raw,set,key)=>useCallback(fn=>{set(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({[key]:next});return next;});},[persist]);

  const setDark=useCallback(fn=>{const n=typeof fn==="function"?fn(stRef.current.dark):fn;setDarkRaw(n);persist({dark:n});},[persist]);
  const setPlayers  =useCallback(fn=>setPlayersRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({players:n});return n;}),[persist]);
  const setMatches  =useCallback(fn=>setMatchesRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({matches:n});return n;}),[persist]);
  const setSessions =useCallback(fn=>setSessionsRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({sessions:n});return n;}),[persist]);
  const setAttDates =useCallback(fn=>{
    setAttDatesRaw(prev=>{
      const n=typeof fn==="function"?fn(prev):fn;
      // Update stRef synchronously before persist so it has the latest data
      stRef.current={...stRef.current,attDates:n};
      // Save immediately — no debounce for attendance
      setSync("saving");
      (async()=>{
        try{
          const{error}=await sb.from("dashboard").upsert({id:dbId(season),data:stRef.current,updated_at:new Date().toISOString()});
          if(error)throw error;
          setSync("saved");
        }catch(e){console.error("AttDates save:",e);setSync("offline");}
      })();
      return n;
    });
  },[]);
  const setQuintets =useCallback(fn=>setQuintetsRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({quintets:n});return n;}),[persist]);
  const setRecursos =useCallback(fn=>setRecursosRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({recursos:n});return n;}),[persist]);
  const setCustomEx =useCallback(fn=>setCustomExRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({customEx:n});return n;}),[persist]);
  const setPlays    =useCallback(fn=>setPlaysRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({plays:n});return n;}),[persist]);
  const setEjercicios=useCallback(fn=>setEjerciciosRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({ejercicios:n});return n;}),[persist]);
  const setSavedDrawings=useCallback(fn=>setSavedDrawingsRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({savedDrawings:n});return n;}),[persist]);
  const setSesionTemplates=useCallback(fn=>setSesionTemplatesRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({sesionTemplates:n});return n;}),[persist]);
  const setScouting      =useCallback(fn=>setScoutingRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({scouting:n});return n;}),[persist]);
  const setMatchAnalyses =useCallback(fn=>setMatchAnalysesRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({matchAnalyses:n});return n;}),[persist]);
  const setBasketballIQ  =useCallback(fn=>setBasketballIQRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({basketballIQ:n});return n;}),[persist]);
  const setPlanMesos=useCallback(fn=>setPlanMesosRaw(prev=>{const cur=prev||DEFAULT_MESOS_EDIT;const n=typeof fn==="function"?fn(cur):fn;persist({planMesos:n});return n;}),[persist]);
  const setPlanMicro=useCallback(fn=>setPlanMicroRaw(prev=>{const cur=prev||DEFAULT_MICRO_EDIT;const n=typeof fn==="function"?fn(cur):fn;persist({planMicro:n});return n;}),[persist]);
  const setApiKey   =useCallback(v=>{setApiKeyRaw(v);try{localStorage.setItem("cb_apikey",v);}catch{};},[]);

  // Reset all state to defaults (called when switching seasons)
  const resetToDefaults=()=>{
    setPlayersRaw(DP);setMatchesRaw(DM);setSessionsRaw(DS);setAttDatesRaw(DA);
    setQuintetsRaw(DEFAULT_QUINTETS);setScoutingRaw([]);setMatchAnalysesRaw([]);
    setBasketballIQRaw([]);setSesionTemplatesRaw([]);setPlanMesosRaw(null);setPlanMicroRaw(null);
    // Keep plays and ejercicios — carried over from previous season
  };

  const switchSeason=async(newSeasonId)=>{
    setLoading(true);setSync("loading");
    setSeason(newSeasonId);
    localStorage.setItem("cb_season",newSeasonId);
    // stRef will be reloaded by the useEffect [season] dependency
  };

  const createNewSeason=async(label)=>{
    const id="state_"+label.replace("/","_").replace(" ","_");
    // New season inherits plays and ejercicios from current
    const newData={
      players:DP,matches:DM,sessions:DS,attDates:DA,
      quintets:DEFAULT_QUINTETS,recursos:DEFAULT_RECURSOS,
      plays:stRef.current.plays||DEFAULT_PLAYS,           // keep playbook
      ejercicios:stRef.current.ejercicios||DEFAULT_EJS,   // keep exercises
      customEx:stRef.current.customEx||[],                // keep custom exercises
      scouting:[],matchAnalyses:[],basketballIQ:[],
      savedDrawings:[],sesionTemplates:[],
      planMesos:null,planMicro:null,dark:stRef.current.dark,
    };
    try{
      await sb.from("dashboard").upsert({id,data:newData,updated_at:new Date().toISOString()});
      const updated=[...allSeasons,{id,label}];
      setAllSeasons(updated);
      localStorage.setItem("cb_seasons",JSON.stringify(updated));
      await switchSeason(id);
      setShowSeasonModal(false);
    }catch(e){alert("Error creando temporada: "+e.message);}
  };

  useEffect(()=>{
    const applyData=(d)=>{
      if(!d)return false;
      let loaded=false;
      if(d.players&&d.players.length>0)   {setPlayersRaw(d.players);    stRef.current.players=d.players;    loaded=true;}
      if(d.matches&&d.matches.length>0)   {setMatchesRaw(d.matches);    stRef.current.matches=d.matches;    loaded=true;}
      if(d.sessions&&d.sessions.length>0) {setSessionsRaw(d.sessions);  stRef.current.sessions=d.sessions;  loaded=true;}
      if(d.attDates&&Object.keys(d.attDates).length>0){setAttDatesRaw(d.attDates);stRef.current.attDates=d.attDates;loaded=true;}
      if(d.quintets)  {setQuintetsRaw(d.quintets);  stRef.current.quintets=d.quintets;}
      if(d.recursos)  {setRecursosRaw(d.recursos);  stRef.current.recursos=d.recursos;}
      if(d.plays&&d.plays.length>0)     {setPlaysRaw(d.plays);           stRef.current.plays=d.plays;}
      if(d.ejercicios&&d.ejercicios.length>0){setEjerciciosRaw(d.ejercicios);stRef.current.ejercicios=d.ejercicios;}
      if(d.customEx)  {setCustomExRaw(d.customEx);  stRef.current.customEx=d.customEx;}
      if(d.savedDrawings){setSavedDrawingsRaw(d.savedDrawings);stRef.current.savedDrawings=d.savedDrawings;}
      if(d.sesionTemplates){setSesionTemplatesRaw(d.sesionTemplates);stRef.current.sesionTemplates=d.sesionTemplates;}
      if(d.scouting&&d.scouting.length>0){setScoutingRaw(d.scouting);stRef.current.scouting=d.scouting;loaded=true;}
      if(d.matchAnalyses&&d.matchAnalyses.length>0){setMatchAnalysesRaw(d.matchAnalyses);stRef.current.matchAnalyses=d.matchAnalyses;}
      if(d.basketballIQ&&d.basketballIQ.length>0){setBasketballIQRaw(d.basketballIQ);stRef.current.basketballIQ=d.basketballIQ;}
      if(d.planMesos) {setPlanMesosRaw(d.planMesos);stRef.current.planMesos=d.planMesos;}
      if(d.planMicro) {setPlanMicroRaw(d.planMicro);stRef.current.planMicro=d.planMicro;}
      if(d.dark!==undefined){setDarkRaw(d.dark);stRef.current.dark=d.dark;}
      return loaded;
    };

    const load=async()=>{
      try{
        // Step 1: try to load from season-specific row
        const{data:seasonData,error:seasonErr}=await sb.from("dashboard").select("data").eq("id",dbId(season)).single();

        // Step 2: check if season row has real data
        const hasRealData=(d)=>d&&(
          (d.players&&d.players.length>0)||
          (d.matches&&d.matches.length>0)||
          (d.attDates&&Object.keys(d.attDates||{}).length>0)||
          (d.scouting&&d.scouting.length>0)
        );

        if(!seasonErr && hasRealData(seasonData?.data)){
          // Season row exists and has data — use it
          applyData(seasonData.data);
        } else {
          // Season row missing or empty — try legacy "state" row
          const{data:legacy}=await sb.from("dashboard").select("data").eq("id","state").single();
          if(hasRealData(legacy?.data)){
            console.log("Loading from legacy 'state' row and migrating to",season);
            applyData(legacy.data);
            // Save under new season id for future loads
            await sb.from("dashboard").upsert({id:dbId(season),data:stRef.current,updated_at:new Date().toISOString()});
          } else if(seasonData?.data){
            // Season row exists but empty — just apply whatever is there
            applyData(seasonData.data);
          } else {
            // Truly fresh — create new row
            await sb.from("dashboard").upsert({id:dbId(season),data:stRef.current,updated_at:new Date().toISOString()});
          }
        }
      }catch(e){console.error("Load error:",e);setSync("offline");}
      setLoading(false);setSync("saved");
    };
    load();
    const sub=sb.channel("db_changes_"+season)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"dashboard",filter:`id=eq.${season}`},payload=>{
        const d=payload.new?.data;if(!d)return;
        if(d.players)    setPlayersRaw(d.players);
        if(d.matches)    setMatchesRaw(d.matches);
        if(d.sessions)   setSessionsRaw(d.sessions);
        if(d.attDates)   setAttDatesRaw(d.attDates);
        if(d.quintets)   setQuintetsRaw(d.quintets);
        if(d.recursos)   setRecursosRaw(d.recursos);
        if(d.plays)      setPlaysRaw(d.plays);
        if(d.ejercicios) setEjerciciosRaw(d.ejercicios);
        if(d.customEx)   setCustomExRaw(d.customEx);
        if(d.savedDrawings)setSavedDrawingsRaw(d.savedDrawings);
        if(d.sesionTemplates)setSesionTemplatesRaw(d.sesionTemplates);
        if(d.scouting)       setScoutingRaw(d.scouting);
        if(d.matchAnalyses)  setMatchAnalysesRaw(d.matchAnalyses);
        if(d.basketballIQ)   setBasketballIQRaw(d.basketballIQ);
        if(d.planMesos) setPlanMesosRaw(d.planMesos);
        if(d.planMicro) setPlanMicroRaw(d.planMicro);
        if(d.dark!==undefined)setDarkRaw(d.dark);
        setSync("saved");
      }).subscribe();
    return()=>sb.removeChannel(sub);
  },[season]);

  const[menuOpen,setMenuOpen]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[apiKeyInput,setApiKeyInput]=useState(apiKey);

  const th=dark?DARK:LIGHT;
  const AV=VIEWS[view]||Dashboard;

  if(loading)return <>
    <GS th={th}/>
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:th.bg,flexDirection:"column",gap:18}}>
      <div style={{width:44,height:44,borderRadius:11,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:20,fontWeight:900,color:"#fff"}}>CB</div>
      <p style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:700,color:th.text,letterSpacing:2,textTransform:"uppercase"}}>Cargando…</p>
      <Loader size={20} color="#f97316" style={{animation:"spin 1s linear infinite"}}/>
    </div>
  </>;

  return(
    <ThemeCtx.Provider value={{th,dark,setDark}}>
      <DataCtx.Provider value={{players,setPlayers,matches,setMatches,sessions,setSessions,attDates,setAttDates,quintets,setQuintets,recursos,setRecursos,plays,setPlays,ejercicios,setEjercicios,customEx,setCustomEx,savedDrawings,setSavedDrawings,planMesos,setPlanMesos,planMicro,setPlanMicro,sesionTemplates,setSesionTemplates,scouting,setScouting,matchAnalyses,setMatchAnalyses,basketballIQ,setBasketballIQ,apiKey,setApiKey}}>
        <GS th={th}/>
        {showSeasonModal&&<SeasonModal
          seasons={allSeasons} currentSeason={season}
          onSwitch={switchSeason} onCreate={createNewSeason}
          onClose={()=>setShowSeasonModal(false)} th={th}/>}
        <div style={{display:"flex",height:"100dvh",overflow:"hidden",background:th.bg}}>

          {/* ── OVERLAY móvil ── */}
          {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:40}}/>}

          {/* ── SIDEBAR ── */}
          <aside className={`sidebar${menuOpen?" open":""}`} style={{width:222,flexShrink:0,background:th.nav,display:"flex",flexDirection:"column",height:"100dvh",overflowY:"auto",borderRight:"1px solid rgba(255,255,255,.06)",zIndex:50}}>
            <div style={{padding:"18px 18px 10px",paddingTop:"max(18px, calc(env(safe-area-inset-top) + 12px))"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:-.5,flexShrink:0}}>CB</div>
                <div>
                  <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:800,color:"#f1f5f9",letterSpacing:.5,lineHeight:1.1}}>Tololiver</p>
                  <button onClick={()=>setShowSeasonModal(true)}
                    style={{background:"transparent",border:"none",cursor:"pointer",padding:0,
                      fontFamily:"DM Mono",fontSize:10,color:"rgba(255,255,255,.45)",
                      display:"flex",alignItems:"center",gap:4,textDecoration:"underline dotted"}}>
                    Temp. {allSeasons.find(s=>s.id===season)?.label||"25/26"} ▾
                  </button>
                </div>
                <button className="close-sidebar" onClick={()=>setMenuOpen(false)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:4}}>✕</button>
              </div>
              <div style={{marginTop:10}}><SyncBadge status={sync}/></div>
            </div>
            <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"0 14px 4px"}}/>
            <nav style={{flex:1,padding:"4px 0",overflowY:"auto"}}>
              {NAV.map(item=>{const Icon=item.icon;const ac=view===item.id;return(
                <div key={item.id} onClick={()=>{setView(item.id);setMenuOpen(false);}} className={`nav-item${ac?" active":""}`}>
                  <Icon size={15} color={ac?"#f97316":"rgba(255,255,255,.32)"}/>
                  <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:ac?700:500,color:ac?"#f97316":"rgba(255,255,255,.42)",letterSpacing:.4}}>{item.label}</span>
                </div>
              );})}
            </nav>
            <div style={{padding:"10px 12px",paddingBottom:"max(10px, calc(env(safe-area-inset-bottom) + 8px))",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",gap:6}}>
              {/* API Key settings */}
              {showSettings&&<div style={{background:"rgba(255,255,255,.05)",borderRadius:8,padding:10,marginBottom:4}}>
                <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>API Key Anthropic</p>
                <input value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} placeholder="sk-ant-..." style={{fontSize:11,padding:"6px 8px",marginBottom:6,fontFamily:"DM Mono"}}/>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setApiKey(apiKeyInput);setShowSettings(false);}} style={{flex:1,padding:"5px 0",borderRadius:6,border:"none",background:"#f97316",color:"#fff",cursor:"pointer",fontSize:11,fontFamily:"Barlow Condensed",fontWeight:700}}>Guardar</button>
                  <button onClick={()=>setShowSettings(false)} style={{flex:1,padding:"5px 0",borderRadius:6,border:"1px solid rgba(255,255,255,.15)",background:"transparent",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:11}}>Cancelar</button>
                </div>
                <p style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:6,lineHeight:1.4}}>Necesaria para IA (quintetos, PDF). Se guarda solo en este navegador.</p>
              </div>}
              <button onClick={()=>setShowSettings(s=>!s)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",cursor:"pointer",color:apiKey?"#10b981":"rgba(255,255,255,.4)"}}>
                <span style={{fontSize:13}}>⚙️</span>
                <span style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:600}}>{apiKey?"API Key ✓":"Configurar API Key"}</span>
              </button>
              <div onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)"}}>
                {dark?<Sun size={13} color="#f59e0b"/>:<Moon size={13} color="#8b5cf6"/>}
                <span style={{fontFamily:"Barlow Condensed",fontSize:12,color:"rgba(255,255,255,.45)",fontWeight:600}}>{dark?"Modo Claro":"Modo Oscuro"}</span>
                <div style={{marginLeft:"auto",width:26,height:14,borderRadius:7,background:dark?"rgba(255,255,255,.12)":"#f97316",position:"relative",transition:"background .2s"}}><div style={{position:"absolute",top:2,left:dark?2:12,width:10,height:10,borderRadius:5,background:"#fff",transition:"left .2s"}}/></div>
              </div>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* Mobile topbar */}
            <div className="mobile-topbar" style={{background:th.nav,paddingLeft:16,paddingRight:16,paddingBottom:10,paddingTop:"max(10px, calc(env(safe-area-inset-top) + 8px))",display:"none",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
              <button onClick={()=>setMenuOpen(true)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>☰</button>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:7,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,fontWeight:900,color:"#fff"}}>CB</div>
                <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:800,color:"#f1f5f9"}}>Tololiver</span>
              </div>
              <div style={{marginLeft:"auto"}}><SyncBadge status={sync}/></div>
            </div>
            <main style={{flex:1,overflowY:"auto",padding:"clamp(14px,3vw,28px) clamp(14px,3vw,32px)",background:th.bg}}>
              <AV/>
            </main>
          </div>
        </div>
      </DataCtx.Provider>
    </ThemeCtx.Provider>
  );
}
