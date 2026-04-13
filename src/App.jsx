// CB BINISSALEM DASHBOARD v3 — Supabase + Todas las mejoras
import { useState, useRef, useEffect, useCallback, useContext, createContext } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Calendar, BarChart2, Dumbbell, Users, BookOpen, PenTool,
  Sun, Moon, Plus, Check, X, Activity, Target, Upload, ChevronRight, ChevronLeft,
  Trash2, RotateCcw, Edit2, Trophy, Shield, Wifi, WifiOff, Loader, Link,
  Search, ExternalLink, Globe, Save, Star, Zap, Image, FileText, Printer,
  Copy, Brain, ChevronDown
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
  return{
    min_p:pj?+(p.min/pj).toFixed(1):0,
    pts_p:pj?+(p.pt/pj).toFixed(1):0,
    tl_pct:p.tl_i?+((p.tl_m/p.tl_i)*100).toFixed(1):0,
    t2_pct:p.t2_i?+((p.t2_m/p.t2_i)*100).toFixed(1):0,
    t3_pct:p.t3_i?+((p.t3_m/p.t3_i)*100).toFixed(1):0,
    fc_p:pj?+(p.fc/pj).toFixed(1):0,
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
      const r=new FileReader();
      r.onload=e=>setImages(prev=>[...prev,e.target.result].slice(0,max));
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
const LOGO_B64="data:image/png;base64,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";

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
function pdfClose(){return `<div class="pdf-footer"><span>C.B. Binissalem · Sénior A · Temp. 25/26</span><span>${new Date().toLocaleDateString("es")}</span></div></div></body></html>`;}
function pdfHeader(title,subtitle){return `<div class="pdf-header"><div class="pdf-header-left"><div class="pdf-club">C.B. Binissalem · Sénior A</div><div class="pdf-title">${title}</div><div class="pdf-subtitle">${subtitle}</div></div><img class="pdf-logo" src="${LOGO_B64}" alt="Logo"/></div>`;}
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
  const[sortBy,setSortBy]=useState("pts_p");
  const active=players.filter(p=>p.active);
  const withCalc=active.map(p=>({...p,...calcStats(p)}));
  const sorted=[...withCalc].sort((a,b)=>(b[sortBy]||0)-(a[sortBy]||0));
  const chartData=sorted.slice(0,8).map(p=>({name:p.name.split(" ")[0].slice(0,8),val:+(p[sortBy]||0)}));
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};

  const sortCols=[
    {key:"pts_p",lbl:"PTS/P",color:"#f97316"},
    {key:"min_p",lbl:"Min/P",color:"#3b82f6"},
    {key:"tl_pct",lbl:"TL%",color:"#f59e0b"},
    {key:"t2_pct",lbl:"T2%",color:"#3b82f6"},
    {key:"t3_pct",lbl:"T3%",color:"#8b5cf6"},
    {key:"fc_p",lbl:"FC/P",color:"#ef4444"},
  ];

  const Th=({children,k,right})=><th onClick={()=>k&&setSortBy(k)} style={{padding:"10px 10px",textAlign:right?"right":"left",fontFamily:"Barlow Condensed",fontSize:10,color:sortBy===k?"#f97316":th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,cursor:k?"pointer":"default",whiteSpace:"nowrap",borderBottom:`2px solid ${sortBy===k?"#f97316":"transparent"}`}}>{children}</th>;
  const Td=({children,accent,color})=><td style={{padding:"9px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:color||(accent?"#f97316":th.text),fontWeight:accent?700:400}}>{children}</td>;

  return <div>
    <SH title="Estadísticas" sub="CB Binissalem Senior A · Haz clic en una columna para ordenar"/>

    {/* Gráfico ranking */}
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1}}>Ranking visual</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {sortCols.map(c=><button key={c.key} onClick={()=>setSortBy(c.key)} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Barlow Condensed",background:sortBy===c.key?c.color:th.card2,color:sortBy===c.key?"#fff":th.sub,transition:"all .15s"}}>{c.lbl}</button>)}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={chartData} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/>
          <XAxis dataKey="name" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={tt}/>
          <Bar dataKey="val" fill={sortCols.find(c=>c.key===sortBy)?.color||"#f97316"} radius={[4,4,0,0]}/>
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Tabla completa */}
    <div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
        <thead>
          <tr style={{background:th.tableHead}}>
            <Th>Jug.</Th>
            <Th>Jugador</Th>
            <Th>Pos</Th>
            <Th k="pj" right>PJ</Th>
            <Th k="min_p" right>Min/P</Th>
            <Th k="pts_p" right>PTS/P</Th>
            {/* TL group */}
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#f59e0b",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,borderBottom:"2px solid #f59e0b22",background:th.tableHead}}>Tiros Libres</th>
            {/* T2 group */}
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,borderBottom:"2px solid #3b82f622",background:th.tableHead}}>Tiros de 2</th>
            {/* T3 group */}
            <th colSpan={3} style={{padding:"6px 10px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:10,color:"#8b5cf6",fontWeight:700,textTransform:"uppercase",letterSpacing:.8,borderBottom:"2px solid #8b5cf622",background:th.tableHead}}>Tiros de 3</th>
            <Th k="fc_p" right>FC/P</Th>
          </tr>
          <tr style={{background:th.tableHead}}>
            <th colSpan={6} style={{background:th.tableHead}}/>
            {/* TL sub */}
            {["Int.","Met.","%"].map(h=><th key={"tl"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#f59e0b",fontWeight:600,textTransform:"uppercase",background:th.tableHead,opacity:.8}}>{h}</th>)}
            {/* T2 sub */}
            {["Int.","Met.","%"].map(h=><th key={"t2"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#3b82f6",fontWeight:600,textTransform:"uppercase",background:th.tableHead,opacity:.8}}>{h}</th>)}
            {/* T3 sub */}
            {["Int.","Met.","%"].map(h=><th key={"t3"+h} style={{padding:"4px 8px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:9,color:"#8b5cf6",fontWeight:600,textTransform:"uppercase",background:th.tableHead,opacity:.8}}>{h}</th>)}
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
            {/* TL */}
            <Td color={th.muted}>{p.tl_i}</Td><Td color={th.muted}>{p.tl_m}</Td><Td accent={sortBy==="tl_pct"} color="#f59e0b">{p.tl_pct}%</Td>
            {/* T2 */}
            <Td color={th.muted}>{p.t2_i}</Td><Td color={th.muted}>{p.t2_m}</Td><Td accent={sortBy==="t2_pct"} color="#3b82f6">{p.t2_pct}%</Td>
            {/* T3 */}
            <Td color={th.muted}>{p.t3_i}</Td><Td color={th.muted}>{p.t3_m}</Td><Td accent={sortBy==="t3_pct"} color="#8b5cf6">{p.t3_pct}%</Td>
            <Td accent={sortBy==="fc_p"} color="#ef4444">{p.fc_p}</Td>
          </tr>)}
        </tbody>
      </table>
    </div>

    {/* Totales del equipo */}
    <div className="card" style={{padding:20,marginTop:14}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Totales de equipo</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
        {[
          {lbl:"Total TL%",val:`${active.reduce((a,p)=>a+(p.tl_i||0),0)?+((active.reduce((a,p)=>a+(p.tl_m||0),0)/active.reduce((a,p)=>a+(p.tl_i||0),0))*100).toFixed(1):0}%`,color:"#f59e0b"},
          {lbl:"Total T2%",val:`${active.reduce((a,p)=>a+(p.t2_i||0),0)?+((active.reduce((a,p)=>a+(p.t2_m||0),0)/active.reduce((a,p)=>a+(p.t2_i||0),0))*100).toFixed(1):0}%`,color:"#3b82f6"},
          {lbl:"Total T3%",val:`${active.reduce((a,p)=>a+(p.t3_i||0),0)?+((active.reduce((a,p)=>a+(p.t3_m||0),0)/active.reduce((a,p)=>a+(p.t3_i||0),0))*100).toFixed(1):0}%`,color:"#8b5cf6"},
          {lbl:"Jugadores activos",val:active.length,color:"#10b981"},
          {lbl:"Partidos disputados",val:Math.max(0,...active.map(p=>p.pj||0)),color:"#f97316"},
          {lbl:"PTS/P equipo",val:active.length&&active.some(p=>p.pj)?+(active.reduce((a,p)=>a+calcStats(p).pts_p,0)/active.filter(p=>p.pj).length).toFixed(1):0,color:"#f97316"},
        ].map(item=><div key={item.lbl} style={{textAlign:"center",padding:"14px 8px",background:th.card2,borderRadius:10,border:`1px solid ${th.border}`}}>
          <p style={{fontFamily:"DM Mono",fontSize:24,fontWeight:700,color:item.color,lineHeight:1,marginBottom:5}}>{item.val}</p>
          <p style={{fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",letterSpacing:.5}}>{item.lbl}</p>
        </div>)}
      </div>
    </div>
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
  const gymTimer=useRef(null);

  const getGymExs=s=>(s?.exObjs||[]).filter(e=>parseInt(e.sesMin||e.dur||0)>0);
  const startGym=s=>{
    const exs=getGymExs(s);
    if(!exs.length){alert("Asigna tiempo (Min) a al menos un ejercicio para usar el Modo Gimnasio.");return;}
    setGymMode(true);setGymIdx(0);setGymRunning(false);setGymSessionId(s.id);
    setGymSec(parseInt(exs[0].sesMin||exs[0].dur||5)*60);
  };
  const stopGym=()=>{setGymMode(false);setGymRunning(false);clearInterval(gymTimer.current);};

  useEffect(()=>{
    if(gymRunning){
      gymTimer.current=setInterval(()=>setGymSec(s=>{
        if(s<=1){
          clearInterval(gymTimer.current);setGymRunning(false);
          if(typeof window!=="undefined"&&window.AudioContext){
            try{const ac=new AudioContext();const o=ac.createOscillator();const g=ac.createGain();o.connect(g);g.connect(ac.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.8);o.start();o.stop(ac.currentTime+0.8);}catch(e){}
          }
          return 0;
        }
        return s-1;
      }),1000);
    } else {clearInterval(gymTimer.current);}
    return()=>clearInterval(gymTimer.current);
  },[gymRunning]);

  const gymNextEx=(s,exs)=>{
    const next=gymIdx+1;
    if(next>=exs.length){stopGym();return;}
    setGymIdx(next);setGymSec(parseInt(exs[next].sesMin||exs[next].dur||5)*60);setGymRunning(false);
  };
  const gymPrevEx=(s,exs)=>{
    const prev=gymIdx-1;if(prev<0)return;
    setGymIdx(prev);setGymSec(parseInt(exs[prev].sesMin||exs[prev].dur||5)*60);setGymRunning(false);
  };
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Gym Mode overlay
  if(gymMode){
    const s=sessions.find(x=>x.id===gymSessionId);
    const exs=getGymExs(s);const ex=exs[gymIdx]||{};
    const durSec=parseInt(ex.sesMin||ex.dur||5)*60;
    const pct=durSec>0?gymSec/durSec*100:100;
    const exName=ex.name||(ex.type==="free"?"Ejercicio libre":"Ejercicio");
    const exDesc=ex.desc||ex.sesNotes||"";
    return <div style={{position:"fixed",inset:0,background:"#0f172a",zIndex:9999,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      {/* Header */}
      <div style={{position:"absolute",top:20,left:20,right:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:2}}>Modo Gimnasio</p>
        <button onClick={stopGym} style={{padding:"6px 16px",borderRadius:8,border:"1px solid rgba(239,68,68,.4)",background:"rgba(239,68,68,.1)",color:"#ef4444",cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700,fontSize:14}}>✕ Salir</button>
      </div>
      {/* Ejercicio actual */}
      <p style={{fontFamily:"Barlow Condensed",fontSize:20,color:"#f97316",fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>Ejercicio {gymIdx+1} / {exs.length}</p>
      <h1 style={{fontFamily:"Barlow Condensed",fontSize:52,fontWeight:700,color:"#f8fafc",textAlign:"center",marginBottom:6,lineHeight:1}}>{exName}</h1>
      <p style={{fontSize:16,color:"#64748b",marginBottom:32,textAlign:"center"}}>{ex.cat||""}{ex.diff?" · "+ex.diff:ex.type==="free"?"Ejercicio libre":""}</p>
      {/* Timer */}
      <div style={{position:"relative",width:200,height:200,marginBottom:32}}>
        <svg width="200" height="200" style={{transform:"rotate(-90deg)"}}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8"/>
          <circle cx="100" cy="100" r="88" fill="none" stroke={gymSec===0?"#ef4444":"#f97316"} strokeWidth="8"
            strokeDasharray={2*Math.PI*88} strokeDashoffset={2*Math.PI*88*(1-pct/100)} strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1s linear"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <p style={{fontFamily:"DM Mono",fontSize:48,fontWeight:700,color:gymSec<30?"#ef4444":"#f8fafc",lineHeight:1}}>{fmt(gymSec)}</p>
          <p style={{fontSize:12,color:"#64748b",marginTop:4}}>{ex.sesMin?ex.sesMin+" min":ex.dur?ex.dur+" min":"sin límite"}</p>
        </div>
      </div>
      {/* Controles */}
      <div style={{display:"flex",gap:16,marginBottom:24}}>
        <button onClick={()=>gymPrevEx(s,exs)} disabled={gymIdx===0} style={{width:56,height:56,borderRadius:28,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"#fff",fontSize:22,cursor:"pointer",opacity:gymIdx===0?.3:1}}>‹</button>
        <button onClick={()=>setGymRunning(r=>!r)} style={{width:80,height:80,borderRadius:40,border:"none",background:gymRunning?"#ef4444":"#f97316",color:"#fff",fontSize:28,cursor:"pointer",boxShadow:`0 0 30px ${gymRunning?"#ef444440":"#f9731640"}`}}>
          {gymRunning?"⏸":"▶"}
        </button>
        <button onClick={()=>gymNextEx(s,exs)} disabled={gymIdx>=exs.length-1} style={{width:56,height:56,borderRadius:28,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.05)",color:"#fff",fontSize:22,cursor:"pointer",opacity:gymIdx>=exs.length-1?.3:1}}>›</button>
      </div>
      {/* Siguiente */}
      {gymIdx<exs.length-1&&<div style={{padding:"10px 24px",borderRadius:10,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.04)"}}>
        <p style={{fontSize:11,color:"#64748b",textAlign:"center",marginBottom:2}}>Siguiente</p>
        <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#94a3b8"}}>{exs[gymIdx+1]?.name||"Ejercicio libre"}</p>
      </div>}
      {/* Descripción */}
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
  const pTable=playersTable&&playersTable.length>0?(
    '<div class="section"><div class="section-title">Estadísticas de jugadores</div>'
    +'<table><thead><tr><th>#</th><th style="text-align:left">Jugador</th><th>PJ</th><th>PT</th><th>Min</th><th>TL int</th><th>TL met</th><th>T2 int</th><th>T2 met</th><th>T3 int</th><th>T3 met</th><th>FC</th></tr></thead>'
    +'<tbody>'+playersTable.filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)).map(p=>
      '<tr>'
      +'<td>'+(p.num||"")+'</td><td class="left">'+(p.name||"")+'</td>'
      +'<td>'+(p.pj||"—")+'</td><td>'+(p.pt||"—")+'</td><td>'+(p.min||"—")+'</td>'
      +'<td>'+(p.tl_i||"—")+'</td><td>'+(p.tl_m||"—")+'</td>'
      +'<td>'+(p.t2_i||"—")+'</td><td>'+(p.t2_m||"—")+'</td>'
      +'<td>'+(p.t3_i||"—")+'</td><td>'+(p.t3_m||"—")+'</td>'
      +'<td>'+(p.fc||"—")+'</td>'
      +'</tr>'
    ).join("")+'</tbody></table></div>'
  ):"";
  w.document.write(pdfOpen(title)
    +pdfHeader(title,subtitle||new Date().toLocaleDateString("es"))
    +pTable
    +mdToHtml(content)
    +pdfClose()
  );
  w.document.close();setTimeout(()=>w.print(),400);
}

function IAAsistente(){
  const{th}=useTheme();
  const{players,matches,sessions,sesionTemplates,setSesionTemplates,setSessions,scouting,setScouting,plays,apiKey}=useData();
  const[tab,setTab]=useState("rival");
  const[selScout,setSelScout]=useState(null);

  // Análisis rival
  const[rivalName,setRivalName]=useState("");
  const[rivalText,setRivalText]=useState("");const[rivalResult,setRivalResult]=useState(null);const[rivalLoading,setRivalLoading]=useState(false);
  const rivalFileRef=useRef();
  // Stats de jugadores del rival para scouting
  const emptyRP=()=>({pj:"",pt:"",min:"",tl_i:"",tl_m:"",t2_i:"",t2_m:"",t3_i:"",t3_m:"",fc:""});
  const defaultRP=()=>[
    {id:1,num:"4", name:"Jugador 1",...emptyRP()},
    {id:2,num:"7", name:"Jugador 2",...emptyRP()},
    {id:3,num:"11",name:"Jugador 3",...emptyRP()},
    {id:4,num:"14",name:"Jugador 4",...emptyRP()},
    {id:5,num:"21",name:"Jugador 5",...emptyRP()},
  ];
  const[rivalPlayers,setRivalPlayers]=useState(defaultRP());
  const setRP=(id,field,val)=>setRivalPlayers(prev=>prev.map(p=>p.id===id?{...p,[field]:val}:p));
  const addRP=()=>setRivalPlayers(prev=>[...prev,{id:Date.now(),num:"",name:`Jugador ${prev.length+1}`,...emptyRP()}]);
  const delRP=id=>setRivalPlayers(prev=>prev.filter(p=>p.id!==id));
  const resetRival=()=>{setRivalName("");setRivalText("");setRivalResult(null);setRivalPlayers(defaultRP());setSelScout(null);if(rivalFileRef.current)rivalFileRef.current.value="";};

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
      const rpStr=hasManualPlayers
        ?rivalPlayers.filter(p=>p.name.trim()&&(!p.name.match(/^Jugador \d+$/)||p.pt||p.pj)).map(p=>{
            const pj=p.pj?` PJ:${p.pj}`:"";const pt=p.pt?` PT:${p.pt}`:"";const min=p.min?` Min:${p.min}`:"";
            const tl=p.tl_m&&p.tl_i?` TL:${p.tl_m}/${p.tl_i}`:"";const t2=p.t2_m&&p.t2_i?` T2:${p.t2_m}/${p.t2_i}`:"";const t3=p.t3_m&&p.t3_i?` T3:${p.t3_m}/${p.t3_i}`:"";
            const fc=p.fc?` FC:${p.fc}`:"";
            return `  #${p.num} ${p.name}${pj}${pt}${min}${tl}${t2}${t3}${fc}`;
          }).join("\n")
        :"";

      const playsCtx=plays&&plays.length>0
        ?"\n\nJugadas disponibles en nuestro Playbook:\n"+plays.map(p=>"- "+p.name+" ("+p.cat+"): "+(p.desc?.slice(0,80)||"")).join("\n")
        :"";

      const rivalIntro=(rivalName?"Rival: "+rivalName+".\n":"")+(rivalText?"Información general:\n"+rivalText+"\n\n":"")+(rpStr?"Jugadores conocidos:\n"+rpStr+"\n\n":"");
      const playsRec=playsCtx?"\n6. JUGADAS DE NUESTRO PLAYBOOK recomendadas — analiza cuáles encajan mejor contra este rival y por qué":"";
      const jsonInstr=!hasManualPlayers?"\nAdemás, si encuentras jugadores identificables, extráelos al FINAL en este bloque JSON (una sola línea):\nPLAYERS_JSON:[{\"num\":\"4\",\"name\":\"Apellido\",\"pj\":\"15\",\"pt\":\"\",\"min\":\"350\",\"tl_i\":\"30\",\"tl_m\":\"18\",\"t2_i\":\"120\",\"t2_m\":\"70\",\"t3_i\":\"40\",\"t3_m\":\"10\",\"fc\":\"25\"}]\nSi no hay datos suficientes omite PLAYERS_JSON.":"";
      const promptText=rivalIntro+"Genera el informe táctico en español:\n1. PUNTOS FUERTES del rival\n2. PUNTOS DÉBILES a explotar\n3. PLAN DE PARTIDO (ataque y defensa)\n4. JUGADORES A VIGILAR (con datos concretos)\n5. JUGADAS CLAVE a preparar"+playsRec+jsonInstr+"\n\nSé específico y práctico."+playsCtx;
      content.push({type:"text",text:promptText});

      const data=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:1800,messages:[{role:"user",content}]});
      let fullText=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";

      // Extracción robusta del JSON — limpia saltos de línea dentro del bloque antes de parsear
      let extractedPlayers=null;
      if(!hasManualPlayers){
        const pjIdx=fullText.indexOf("PLAYERS_JSON:");
        if(pjIdx>=0){
          // Tomar todo desde PLAYERS_JSON hasta el final y limpiar saltos de línea
          let raw=fullText.slice(pjIdx+"PLAYERS_JSON:".length).trim();
          // Eliminar todo lo que no sea el array JSON (texto posterior al bloque)
          // Buscar el inicio del array
          const arrStart=raw.indexOf("[");
          if(arrStart>=0){
            raw=raw.slice(arrStart);
            // Limpiar saltos de línea dentro del fragmento (los nombres largos los generan)
            raw=raw.replace(/\r?\n/g," ").replace(/\s+/g," ");
            // Encontrar el ] de cierre del array (robusto: recorrer balanceando)
            let depth=0,end=-1;
            for(let i=0;i<raw.length;i++){
              if(raw[i]==="[")depth++;
              else if(raw[i]==="]"){depth--;if(depth===0){end=i;break;}}
            }
            let jsonStr=end>=0?raw.slice(0,end+1):raw;
            // Intentar reparar JSON truncado si falta el cierre
            if(end<0){
              const lastObj=jsonStr.lastIndexOf("}");
              if(lastObj>=0)jsonStr=jsonStr.slice(0,lastObj+1)+"]";
            }
            try{
              const parsed=JSON.parse(jsonStr);
              if(Array.isArray(parsed)&&parsed.length>0){
                extractedPlayers=parsed.map((p,i)=>({
                  id:Date.now()+i,
                  num:p.num||String(i+1),
                  name:(p.name||`Jugador ${i+1}`).trim(),
                  pj:p.pj||"",pt:p.pt||"",min:p.min||"",
                  tl_i:p.tl_i||"",tl_m:p.tl_m||"",
                  t2_i:p.t2_i||"",t2_m:p.t2_m||"",
                  t3_i:p.t3_i||"",t3_m:p.t3_m||"",
                  fc:p.fc||"",
                }));
                // Eliminar el bloque PLAYERS_JSON del texto visible
                fullText=fullText.slice(0,pjIdx).trim();
              }
            }catch(e){console.warn("PLAYERS_JSON parse error:",e.message);}
          }
        }
      }

      if(extractedPlayers&&extractedPlayers.length>0){
        setRivalPlayers(extractedPlayers);
      }

      setRivalResult({text:fullText,rival:rivalName||"Sin nombre",saved:false,playersExtracted:!!extractedPlayers,players:extractedPlayers||null});
    }catch(e){setRivalResult({error:e.message});}
    setRivalLoading(false);
    if(rivalFileRef.current)rivalFileRef.current.value="";
  };

  const saveScoutReport=()=>{
    if(!rivalResult||rivalResult.error||rivalResult.saved)return;
    // Use players from rivalResult if auto-extracted, otherwise use current rivalPlayers state
    const playersToSave=rivalResult.players&&rivalResult.players.length>0?rivalResult.players:rivalPlayers;
    setScouting(prev=>[{id:Date.now(),rival:rivalResult.rival||"Sin nombre",date:new Date().toISOString().split("T")[0],text:rivalResult.text,players:playersToSave},...prev]);
    setRivalResult(r=>({...r,saved:true}));
  };
  const delScout=id=>setScouting(prev=>prev.filter(s=>s.id!==id));

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

    {tab==="rival"&&<div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
      {/* Panel izquierdo — generación */}
      <div>
        <div className="card" style={{padding:20,marginBottom:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:th.text,marginBottom:12}}>Scouting del rival</p>
          {/* Botón nuevo informe */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <button onClick={resetRival}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:12,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
              <RotateCcw size={12}/>Nuevo informe
            </button>
          </div>
          <div style={{marginBottom:10}}><Lbl>Nombre del rival</Lbl><input value={rivalName} onChange={e=>setRivalName(e.target.value)} placeholder="Ej: CB Inca A"/></div>
          <div style={{marginBottom:14}}><Lbl>Información general (sistema, estilo, puntos débiles…)</Lbl>
            <textarea rows={3} value={rivalText} onChange={e=>setRivalText(e.target.value)} placeholder="Sistema defensivo, jugadores clave, estadísticas, tendencias..."/>
          </div>

          {/* Tabla jugadores rival */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Lbl>Estadísticas de jugadores del rival (opcional — enriquece el análisis y el PDF)</Lbl>
              <button onClick={addRP} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:11,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Plus size={11}/>Añadir jugador
              </button>
            </div>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:780}}>
                <thead>
                  <tr style={{background:th.tableHead}}>
                    <th style={{padding:"6px 6px",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",whiteSpace:"nowrap"}}>#</th>
                    <th style={{padding:"6px 8px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>Nombre</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>PJ</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>PT</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase"}}>Min</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#f59e0b",textTransform:"uppercase"}}>TL-I</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#f59e0b",textTransform:"uppercase"}}>TL-M</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#3b82f6",textTransform:"uppercase"}}>T2-I</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#3b82f6",textTransform:"uppercase"}}>T2-M</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#8b5cf6",textTransform:"uppercase"}}>T3-I</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#8b5cf6",textTransform:"uppercase"}}>T3-M</th>
                    <th style={{padding:"6px 4px",fontFamily:"Barlow Condensed",fontSize:10,color:"#ef4444",textTransform:"uppercase"}}>FC</th>
                    <th/>
                  </tr>
                </thead>
                <tbody>{rivalPlayers.map(p=>{
                  const ni={type:"text",inputMode:"numeric",pattern:"[0-9]*",maxLength:3,style:{width:46,textAlign:"center",fontSize:11,padding:"3px 2px"}};
                  return <tr key={p.id} style={{borderTop:`1px solid ${th.border}`}}>
                    <td style={{padding:"4px 4px"}}><input value={p.num} onChange={e=>setRP(p.id,"num",e.target.value)} maxLength={3} style={{width:50,textAlign:"center",fontSize:12,padding:"3px 4px"}}/></td>
                    <td style={{padding:"4px 6px"}}><input value={p.name} onChange={e=>setRP(p.id,"name",e.target.value)} style={{width:120,fontSize:12}}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.pj} onChange={e=>setRP(p.id,"pj",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.pt} onChange={e=>setRP(p.id,"pt",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.min} onChange={e=>setRP(p.id,"min",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.tl_i} onChange={e=>setRP(p.id,"tl_i",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.tl_m} onChange={e=>setRP(p.id,"tl_m",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.t2_i} onChange={e=>setRP(p.id,"t2_i",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.t2_m} onChange={e=>setRP(p.id,"t2_m",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.t3_i} onChange={e=>setRP(p.id,"t3_i",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.t3_m} onChange={e=>setRP(p.id,"t3_m",e.target.value)}/></td>
                    <td style={{padding:"4px 3px"}}><input {...ni} value={p.fc} onChange={e=>setRP(p.id,"fc",e.target.value)}/></td>
                    <td style={{padding:"4px 4px"}}><button onClick={()=>delRP(p.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:2}}><Trash2 size={11}/></button></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <input ref={rivalFileRef} type="file" accept=".pdf" style={{display:"none"}}/>
            <button onClick={()=>rivalFileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:12,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
              <FileText size={13}/>PDF scouting
            </button>
            <Btn onClick={analyzeRival} disabled={rivalLoading} icon={rivalLoading?<Loader size={13} style={{animation:"spin 1s linear infinite"}}/>:<Brain size={13}/>}>
              {rivalLoading?"Analizando…":"Generar informe"}
            </Btn>
          </div>
        </div>

        {/* Resultado generado */}
        {rivalLoading&&<div style={{textAlign:"center",padding:"40px 0"}}><Loader size={28} color="#f97316" style={{animation:"spin 1s linear infinite",margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted,fontSize:13}}>La IA está analizando…</p></div>}
        {rivalResult&&!rivalLoading&&(
          rivalResult.error
          ?<div style={{background:"rgba(239,68,68,.07)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"12px 16px",fontSize:13,color:"#ef4444"}}>{rivalResult.error}</div>
          :<div>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <button onClick={saveScoutReport} disabled={rivalResult.saved}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(16,185,129,.4)",background:rivalResult.saved?"rgba(16,185,129,.15)":"rgba(16,185,129,.07)",cursor:rivalResult.saved?"default":"pointer",color:"#10b981",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Save size={12}/>{rivalResult.saved?"✓ Guardado en historial":"Guardar informe"}
              </button>
              <button onClick={()=>exportToPDF(`Scouting — ${rivalResult.rival}`,rivalResult.text,rivalResult.rival,rivalResult.players&&rivalResult.players.length>0?rivalResult.players:rivalPlayers)}
                style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Printer size={12}/>Descargar PDF
              </button>
            </div>
            {rivalResult.saved&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#10b981"}}>
              ✅ Informe guardado — visible en el historial de informes
            </div>}
            {rivalResult.playersExtracted&&<div style={{background:"rgba(139,92,246,.07)",border:"1px solid rgba(139,92,246,.3)",borderRadius:8,padding:"8px 14px",marginBottom:10,fontSize:12,color:"#8b5cf6",display:"flex",alignItems:"center",gap:6}}>
              <Users size={13}/>Jugadores detectados automáticamente por la IA — revisa la tabla y edita si es necesario
            </div>}
            <div style={{background:th.card2,borderRadius:10,padding:20,border:`1px solid ${th.border}`,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:480,overflowY:"auto"}}>{rivalResult.text}</div>
          </div>
        )}

        {/* Informe guardado seleccionado */}
        {selScout&&!rivalResult&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text}}>{selScout.rival}</p>
              <p style={{fontSize:11,color:th.muted}}>{selScout.date}</p>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>exportToPDF(`Scouting — ${selScout.rival}`,selScout.text,selScout.rival,selScout.players||[])}
                style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Printer size={12}/>PDF
              </button>
              <button onClick={()=>setSelScout(null)}
                style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:12,fontFamily:"Barlow Condensed,sans-serif"}}>
                ✕ Cerrar
              </button>
            </div>
          </div>
          {/* Jugadores guardados */}
          {selScout.players&&selScout.players.some(p=>p.pt||p.pj||p.tl_i||p.t2_i||(p.name&&!p.name.match(/^Jugador \d+$/)))&&
            <div style={{marginBottom:14,overflow:"auto"}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Estadísticas de jugadores</p>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:560,fontSize:12}}>
                <thead><tr style={{background:th.tableHead}}>
                  {["#","Nombre","PJ","PT","Min","TL-I","TL-M","T2-I","T2-M","T3-I","T3-M","FC"].map((h,i)=>(
                    <th key={i} style={{padding:"6px 8px",textAlign:i<2?"left":"center",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>{selScout.players.filter(p=>p.name&&!p.name.match(/^Jugador \d+$/)||p.pt||p.pj).map(p=><tr key={p.id} style={{borderTop:`1px solid ${th.border}`}}>
                  <td style={{padding:"6px 8px",fontFamily:"DM Mono",color:th.muted,textAlign:"center"}}>{p.num||"—"}</td>
                  <td style={{padding:"6px 8px",fontWeight:600,color:th.text}}>{p.name||"—"}</td>
                  {["pj","pt","min","tl_i","tl_m","t2_i","t2_m","t3_i","t3_m","fc"].map(f=>(
                    <td key={f} style={{padding:"6px 8px",fontFamily:"DM Mono",color:p[f]?"#f97316":th.muted,textAlign:"center"}}>{p[f]||"—"}</td>
                  ))}
                </tr>)}</tbody>
              </table>
            </div>}
          <div style={{background:th.card2,borderRadius:10,padding:20,border:`1px solid ${th.border}`,fontSize:13,color:th.text,lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto"}}>{selScout.text}</div>
        </div>}
      </div>

      {/* Panel derecho — historial */}
      <div>
        <div className="card" style={{padding:16}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>
            Historial de informes {scouting.length>0&&<span style={{color:"#f97316"}}>({scouting.length})</span>}
          </p>
          {scouting.length===0
            ?<div style={{textAlign:"center",padding:"24px 0"}}>
              <FileText size={28} color={th.muted} style={{margin:"0 auto 8px",display:"block"}}/>
              <p style={{fontSize:12,color:th.muted,lineHeight:1.5}}>Sin informes guardados.<br/>Genera un informe y guárdalo.</p>
            </div>
            :<div style={{display:"flex",flexDirection:"column",gap:6}}>
              {scouting.map(s=><div key={s.id}
                style={{padding:"10px 12px",borderRadius:8,background:selScout?.id===s.id?"rgba(249,115,22,.08)":th.card2,border:`1px solid ${selScout?.id===s.id?"#f97316":th.border}`,cursor:"pointer",transition:"all .15s"}}
                onClick={()=>{setSelScout(s);setRivalResult(null);}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:selScout?.id===s.id?"#f97316":th.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.rival}</p>
                    <p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted,marginTop:2}}>{s.date}</p>
                  </div>
                  <button onClick={e=>{e.stopPropagation();delScout(s.id);if(selScout?.id===s.id)setSelScout(null);}}
                    style={{width:22,height:22,borderRadius:5,border:"none",background:"transparent",cursor:"pointer",color:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:6}}>
                    <Trash2 size={11}/>
                  </button>
                </div>
                <p style={{fontSize:11,color:th.muted,marginTop:5,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                  {s.text.slice(0,80)}…
                </p>
              </div>)}
            </div>}
        </div>
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

function ModoPartido(){
  const{th}=useTheme();const{matches,setMatches,players,setPlayers,apiKey}=useData();
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

  const QInput=({val,onChange,color="#f97316"})=>(
    <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} value={val} onChange={e=>{if(/^\d*$/.test(e.target.value))onChange(e.target.value);}}
      style={{width:64,height:44,textAlign:"center",fontFamily:"DM Mono",fontSize:18,fontWeight:700,color,padding:"4px",borderRadius:8,border:`2px solid ${val?color:th.border2}`,background:val?color+"0d":th.inputBg}}/>
  );

  const SF=({label,pid,field,small})=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontFamily:"Barlow Condensed",fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:.3}}>{label}</span>
      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3}
        value={getStat(pid,field)} onChange={e=>{if(/^\d*$/.test(e.target.value))setStat(pid,field,e.target.value);}}
        disabled={statsCommitted}
        style={{width:small?44:50,height:34,textAlign:"center",fontFamily:"DM Mono",fontSize:13,fontWeight:600,padding:"2px",borderRadius:6,border:`1px solid ${th.border2}`,background:statsCommitted?th.card2:th.inputBg,color:th.text,opacity:statsCommitted?.6:1}}/>
    </div>
  );

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
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="min" label=""/></td>
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="pt" label=""/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="tl_i" label="" small/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="tl_m" label="" small/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t2_i" label="" small/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t2_m" label="" small/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t3_i" label="" small/></td>
                <td style={{padding:"8px 4px",textAlign:"center"}}><SF pid={p.id} field="t3_m" label="" small/></td>
                <td style={{padding:"8px 6px",textAlign:"center"}}><SF pid={p.id} field="fc" label="" small/></td>
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
    // Build context
    const result=m.pts_us!=null?m.pts_us+"-"+m.pts_them:"Sin resultado";
    const qStr=m.quarters?"Q1:"+m.quarters.us[0]+"-"+m.quarters.them[0]+" Q2:"+m.quarters.us[1]+"-"+m.quarters.them[1]+" Q3:"+m.quarters.us[2]+"-"+m.quarters.them[2]+" Q4:"+m.quarters.us[3]+"-"+m.quarters.them[3]:"";
    const ourStats=convPlayers.map(p=>{
      const s=pStats[p.id]||{};
      return "#"+p.num+" "+p.name+" ("+p.pos+"): "+[s.pt&&"PT:"+s.pt,s.min&&"Min:"+s.min,s.t2_m&&"T2:"+s.t2_m+"/"+s.t2_i,s.t3_m&&"T3:"+s.t3_m+"/"+s.t3_i,s.tl_m&&"TL:"+s.tl_m+"/"+s.tl_i,s.fc&&"FC:"+s.fc].filter(Boolean).join(" ");
    }).filter(l=>l.includes(":")).join("\n");
    const rivStr=rivalPS.filter(p=>p.pt||p.min).map(p=>"#"+p.num+" "+p.name+": "+[p.pt&&"PT:"+p.pt,p.min&&"Min:"+p.min,p.t2_m&&"T2:"+p.t2_m+"/"+p.t2_i,p.t3_m&&"T3:"+p.t3_m+"/"+p.t3_i,p.tl_m&&"TL:"+p.tl_m+"/"+p.tl_i,p.fc&&"FC:"+p.fc].filter(Boolean).join(" ")).join("\n");

    try{
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:1600,
        messages:[{role:"user",content:
          "Eres analista de baloncesto. Analiza este partido de CB Binissalem Sénior A.\n\n"
          +"PARTIDO: CB Binissalem vs "+m.rival+" ("+m.location+") "+m.date+"\n"
          +"RESULTADO: "+result+(qStr?" | "+qStr:"")+"\n\n"
          +(ourStats?"NUESTRAS ESTADÍSTICAS:\n"+ourStats+"\n\n":"")
          +(rivStr?"ESTADÍSTICAS RIVAL:\n"+rivStr+"\n\n":"")
          +(m.notes?"NOTAS DEL ENTRENADOR:\n"+m.notes+"\n\n":"")
          +"Genera un análisis post-partido completo en español con:\n"
          +"1. RESUMEN DEL PARTIDO\n"
          +"2. PUNTOS POSITIVOS (qué funcionó bien)\n"
          +"3. PUNTOS A MEJORAR (errores y aspectos a trabajar)\n"
          +"4. RENDIMIENTO INDIVIDUAL (destacados positivos y negativos)\n"
          +"5. CONCLUSIONES Y PRÓXIMOS PASOS (qué entrenar esta semana)\n\n"
          +"Sé específico, usa los datos estadísticos disponibles."
        }]
      });
      const text=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";
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
  const[filterType,setFilterType]=useState("all");// all|T2|T3|TL
  const[filterMatch,setFilterMatch]=useState("all");
  const[showHeat,setShowHeat]=useState(true);
  const lastTap=useRef(0);

  // Court dimensions (half court, FIBA)
  const CW=520,CH=440;
  const PAINT={x:170,y:0,w:180,h:180};
  const THREE_RADIUS=195;const CENTER_X=260;const CENTER_Y=440;
  const TL_X1=170,TL_X2=350,TL_Y=180;

  const zoneName=({x,y})=>{
    const dx=x-CENTER_X,dy=CENTER_Y-y;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const inPaint=x>=PAINT.x&&x<=PAINT.x+PAINT.w&&y<=PAINT.y+PAINT.h;
    if(inPaint&&dist<90)return"TL";// near basket = FT simulation
    if(inPaint)return"T2_PAINT";
    if(dist>THREE_RADIUS)return"T3";
    if(x<CENTER_X-80)return"T2_LEFT";
    if(x>CENTER_X+80)return"T2_RIGHT";
    return"T2_MID";
  };

  const drawCourt=ctx=>{
    ctx.clearRect(0,0,CW,CH);
    // Floor
    ctx.fillStyle=th.card2;ctx.fillRect(0,0,CW,CH);
    // Lines
    ctx.strokeStyle=th.border;ctx.lineWidth=2;
    // Paint
    ctx.strokeRect(PAINT.x,PAINT.y,PAINT.w,PAINT.h);
    // FT circle
    ctx.beginPath();ctx.arc(CENTER_X,PAINT.y+PAINT.h,60,Math.PI,0);ctx.stroke();
    // Key blocks
    for(let i=1;i<=4;i++){ctx.fillStyle=th.border;ctx.fillRect(PAINT.x-1,PAINT.y+i*35,6,18);ctx.fillRect(PAINT.x+PAINT.w-5,PAINT.y+i*35,6,18);}
    // 3pt arc
    ctx.beginPath();
    const a1=Math.asin((CH-60)/THREE_RADIUS);
    const a0=Math.PI-a1;
    ctx.arc(CENTER_X,CENTER_Y,THREE_RADIUS,a0,a1*-1+Math.PI,true);
    // 3pt corner lines
    ctx.moveTo(PAINT.x-50,CH);ctx.lineTo(PAINT.x-50,CH-60);
    ctx.moveTo(PAINT.x+PAINT.w+50,CH);ctx.lineTo(PAINT.x+PAINT.w+50,CH-60);
    ctx.stroke();
    // Basket
    ctx.beginPath();ctx.arc(CENTER_X,PAINT.y+PAINT.h+4,14,0,Math.PI*2);ctx.strokeStyle="#f97316";ctx.lineWidth=2.5;ctx.stroke();
    ctx.beginPath();ctx.arc(CENTER_X,PAINT.y+PAINT.h+4,5,0,Math.PI*2);ctx.fillStyle="#f97316";ctx.fill();
    // Backboard
    ctx.strokeStyle="#f97316";ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(CENTER_X-28,PAINT.y+PAINT.h-8);ctx.lineTo(CENTER_X+28,PAINT.y+PAINT.h-8);ctx.stroke();
    // Labels
    ctx.font="bold 10px Barlow Condensed, sans-serif";
    ctx.fillStyle=th.muted;ctx.textAlign="center";
    ctx.fillText("ZONA 2",CENTER_X,PAINT.y+PAINT.h-20);
    ctx.fillText("T3",CENTER_X,30);ctx.fillText("T3",60,280);ctx.fillText("T3",460,280);
    ctx.lineWidth=2;ctx.strokeStyle=th.border;
  };

  const drawShots=ctx=>{
    const filtered=shots.filter(s=>{
      if(filterPid!=="all"&&s.pid!==filterPid)return false;
      if(filterType!=="all"&&s.zone!==filterType)return false;
      if(filterMatch!=="all"&&String(s.matchId)!==filterMatch)return false;
      return true;
    });
    if(showHeat){
      // Heat map: draw blobs
      const heatCanvas=document.createElement("canvas");heatCanvas.width=CW;heatCanvas.height=CH;
      const hCtx=heatCanvas.getContext("2d");
      filtered.forEach(s=>{
        const g=hCtx.createRadialGradient(s.x,s.y,0,s.x,s.y,38);
        const col=s.made?"rgba(16,185,129,":"rgba(239,68,68,";
        g.addColorStop(0,col+"0.35)");g.addColorStop(1,col+"0)");
        hCtx.fillStyle=g;hCtx.fillRect(s.x-38,s.y-38,76,76);
      });
      ctx.drawImage(heatCanvas,0,0);
    }
    // Dots
    filtered.forEach(s=>{
      ctx.beginPath();ctx.arc(s.x,s.y,7,0,Math.PI*2);
      ctx.fillStyle=s.made?"#10b981":"#ef4444";
      ctx.globalAlpha=0.85;ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle="#fff";ctx.lineWidth=1.5;ctx.stroke();
      if(!s.made){// X for miss
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
  },[shots,filterPid,filterType,filterMatch,showHeat,th]);

  useEffect(()=>{redraw();},[redraw]);

  const getPos=e=>{
    const rect=cr.current.getBoundingClientRect();
    const scaleX=CW/rect.width,scaleY=CH/rect.height;
    const touch=e.touches?e.touches[0]:e;
    return{x:(touch.clientX-rect.left)*scaleX,y:(touch.clientY-rect.top)*scaleY};
  };

  const handleTap=e=>{
    e.preventDefault();
    const now=Date.now();const isDouble=now-lastTap.current<350;
    lastTap.current=now;
    const{x,y}=getPos(e);
    const z=zoneName({x,y});
    const made=isDouble;
    const pid=filterPid==="all"?null:filterPid;
    setShots(prev=>[...prev,{id:Date.now(),x,y,made,zone:z,pid,matchId:filterMatch==="all"?null:filterMatch}]);
  };

  const undoLast=()=>setShots(prev=>prev.slice(0,-1));
  const clearAll=()=>setShots([]);

  const filtered=shots.filter(s=>{
    if(filterPid!=="all"&&s.pid!==filterPid)return false;
    if(filterMatch!=="all"&&String(s.matchId)!==filterMatch)return false;
    return true;
  });
  const made=filtered.filter(s=>s.made).length;
  const total=filtered.length;
  const pct=total?Math.round(made/total*100):0;

  const zones=["T2_PAINT","T2_LEFT","T2_MID","T2_RIGHT","T3","TL"];
  const zoneLabel={"T2_PAINT":"Zona 2 (pintura)","T2_LEFT":"T2 Izquierda","T2_MID":"T2 Centro","T2_RIGHT":"T2 Derecha","T3":"Triples","TL":"Tiro Libre"};

  return <div>
    <SH title="Shot Chart" sub="1 clic = fallo · 2 clics rápidos = acierto · Mapa de tiros del equipo"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
      {/* Canvas */}
      <div className="card" style={{padding:14}}>
        {/* Filters */}
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <select value={filterPid} onChange={e=>setFilterPid(e.target.value)} style={{fontSize:11}}>
            <option value="all">Todos los jugadores</option>
            {players.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>#{p.num} {p.name.split(" ")[0]}</option>)}
          </select>
          <select value={filterMatch} onChange={e=>setFilterMatch(e.target.value)} style={{fontSize:11}}>
            <option value="all">Todos los partidos</option>
            {matches.map(m=><option key={m.id} value={m.id}>{m.date} vs {m.rival}</option>)}
          </select>
          <button onClick={()=>setShowHeat(!showHeat)} style={{padding:"4px 12px",borderRadius:6,border:`1px solid ${th.border2}`,background:showHeat?"rgba(249,115,22,.12)":th.card2,color:showHeat?"#f97316":th.sub,fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed",fontWeight:700}}>
            {showHeat?"🌡 Mapa calor ON":"🌡 Mapa calor OFF"}
          </button>
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <button onClick={undoLast} disabled={!shots.length} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,color:th.sub,fontSize:11,cursor:"pointer",opacity:shots.length?1:.4}}>↩ Deshacer</button>
            <button onClick={clearAll} disabled={!shots.length} style={{padding:"4px 10px",borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",color:"#ef4444",fontSize:11,cursor:"pointer",opacity:shots.length?1:.4}}>Limpiar</button>
          </div>
        </div>
        <div style={{borderRadius:8,overflow:"hidden",lineHeight:0,border:`1px solid ${th.border}`,background:th.card2}}>
          <canvas ref={cr} width={CW} height={CH} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair",touchAction:"none"}}
            onClick={handleTap} onTouchEnd={handleTap}/>
        </div>
        <p style={{fontSize:11,color:th.muted,marginTop:8}}>
          ● Verde = acierto &nbsp;● Rojo = fallo &nbsp;·&nbsp; 1 clic = fallo · 2 clics rápidos = acierto
        </p>
      </div>
      {/* Sidebar stats */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {/* Global */}
        <div className="card" style={{padding:16,textAlign:"center"}}>
          <p style={{fontFamily:"DM Mono",fontSize:40,fontWeight:700,color:pct>=50?"#10b981":"#ef4444",lineHeight:1}}>{pct}%</p>
          <p style={{fontSize:11,color:th.muted,marginTop:4}}>Efectividad global</p>
          <p style={{fontFamily:"DM Mono",fontSize:14,color:th.sub,marginTop:6}}>{made}/{total} tiros</p>
        </div>
        {/* Por zona */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Por zona</p>
          {zones.map(z=>{
            const zShots=filtered.filter(s=>s.zone===z);
            const zMade=zShots.filter(s=>s.made).length;
            const zPct=zShots.length?Math.round(zMade/zShots.length*100):null;
            if(!zShots.length)return null;
            return <div key={z} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:10,color:th.sub,fontFamily:"Barlow Condensed"}}>{zoneLabel[z]}</span>
                <span style={{fontSize:10,fontFamily:"DM Mono",color:zPct>=50?"#10b981":"#ef4444",fontWeight:700}}>{zPct}%</span>
              </div>
              <div style={{height:5,borderRadius:3,background:th.border2}}>
                <div style={{height:5,borderRadius:3,background:zPct>=50?"#10b981":"#ef4444",width:zPct+"%"}}/>
              </div>
              <p style={{fontSize:9,color:th.muted,marginTop:2}}>{zMade}/{zShots.length} tiros</p>
            </div>;
          })}
          {!filtered.length&&<p style={{fontSize:11,color:th.muted}}>Haz clic en la pista para añadir tiros</p>}
        </div>
        {/* Leyenda */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Cómo usar</p>
          <p style={{fontSize:11,color:th.sub,lineHeight:1.6}}>
            <strong>1 clic</strong> → Fallo 🔴<br/>
            <strong>2 clics rápidos</strong> → Acierto 🟢<br/>
            Filtra por jugador o partido<br/>
            Activa el mapa de calor para ver zonas calientes
          </p>
        </div>
      </div>
    </div>
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
  {id:"recursos", label:"Recursos",       icon:Link},
];
const VIEWS={dashboard:Dashboard,plantilla:Plantilla,partidos:Partidos,calendario:Calendario,plan:Planificacion,stats:Estadisticas,evolucion:EvolucionStats,train:Entrenamientos,carga:CargaTrabajo,informe:InformeSemanal,attend:Asistencia,lineup:Quinteto,partido:ModoPartido,playbook:Playbook,exercises:Ejercicios,shotchart:ShotChart,pizarra:Pizarra,ia:IAAsistente,iq:BasketballIQ,informes:Informes,buscador:BuscadorIA,recursos:Recursos};

export default function App(){
  const[dark,setDarkRaw]=useState(true);const[view,setView]=useState("dashboard");
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
    stRef.current={...stRef.current,...patch};
    setSync("saving");
    if(tmr.current)clearTimeout(tmr.current);
    tmr.current=setTimeout(async()=>{
      try{const{error}=await sb.from("dashboard").upsert({id:"state",data:stRef.current,updated_at:new Date().toISOString()});if(error)throw error;setSync("saved");}
      catch(e){console.error("Save error:",e);setSync("offline");}
    },900);
  },[]);

  const mk=(raw,set,key)=>useCallback(fn=>{set(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({[key]:next});return next;});},[persist]);

  const setDark=useCallback(fn=>{const n=typeof fn==="function"?fn(stRef.current.dark):fn;setDarkRaw(n);persist({dark:n});},[persist]);
  const setPlayers  =useCallback(fn=>setPlayersRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({players:n});return n;}),[persist]);
  const setMatches  =useCallback(fn=>setMatchesRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({matches:n});return n;}),[persist]);
  const setSessions =useCallback(fn=>setSessionsRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({sessions:n});return n;}),[persist]);
  const setAttDates =useCallback(fn=>setAttDatesRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({attDates:n});return n;}),[persist]);
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

  useEffect(()=>{
    const load=async()=>{
      try{
        const{data,error}=await sb.from("dashboard").select("data").eq("id","state").single();
        if(!error&&data?.data){
          const d=data.data;
          if(d.players)   {setPlayersRaw(d.players);    stRef.current.players=d.players;}
          if(d.matches)   {setMatchesRaw(d.matches);    stRef.current.matches=d.matches;}
          if(d.sessions)  {setSessionsRaw(d.sessions);  stRef.current.sessions=d.sessions;}
          if(d.attDates)  {setAttDatesRaw(d.attDates);  stRef.current.attDates=d.attDates;}
          if(d.quintets)  {setQuintetsRaw(d.quintets);  stRef.current.quintets=d.quintets;}
          if(d.recursos)  {setRecursosRaw(d.recursos);  stRef.current.recursos=d.recursos;}
          if(d.plays)     {setPlaysRaw(d.plays);         stRef.current.plays=d.plays;}
          if(d.ejercicios){setEjerciciosRaw(d.ejercicios);stRef.current.ejercicios=d.ejercicios;}
          if(d.customEx)  {setCustomExRaw(d.customEx);  stRef.current.customEx=d.customEx;}
          if(d.savedDrawings){setSavedDrawingsRaw(d.savedDrawings);stRef.current.savedDrawings=d.savedDrawings;}
          if(d.sesionTemplates){setSesionTemplatesRaw(d.sesionTemplates);stRef.current.sesionTemplates=d.sesionTemplates;}
          if(d.scouting)      {setScoutingRaw(d.scouting);             stRef.current.scouting=d.scouting;}
      if(d.matchAnalyses) {setMatchAnalysesRaw(d.matchAnalyses);   stRef.current.matchAnalyses=d.matchAnalyses;}
      if(d.basketballIQ)  {setBasketballIQRaw(d.basketballIQ);     stRef.current.basketballIQ=d.basketballIQ;}
          if(d.planMesos) {setPlanMesosRaw(d.planMesos);stRef.current.planMesos=d.planMesos;}
          if(d.planMicro) {setPlanMicroRaw(d.planMicro);stRef.current.planMicro=d.planMicro;}
          if(d.dark!==undefined){setDarkRaw(d.dark);stRef.current.dark=d.dark;}
        }else if(error?.code==="PGRST116"){
          await sb.from("dashboard").upsert({id:"state",data:stRef.current});
        }
      }catch(e){console.error("Load error:",e);setSync("offline");}
      setLoading(false);setSync("saved");
    };
    load();
    const sub=sb.channel("db_changes")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"dashboard",filter:"id=eq.state"},payload=>{
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
  },[]);

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
        <div style={{display:"flex",height:"100dvh",overflow:"hidden",background:th.bg}}>

          {/* ── OVERLAY móvil ── */}
          {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:40}}/>}

          {/* ── SIDEBAR ── */}
          <aside className={`sidebar${menuOpen?" open":""}`} style={{width:222,flexShrink:0,background:th.nav,display:"flex",flexDirection:"column",height:"100dvh",overflowY:"auto",borderRight:"1px solid rgba(255,255,255,.06)",zIndex:50}}>
            <div style={{padding:"18px 18px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:900,color:"#fff",letterSpacing:-.5,flexShrink:0}}>CB</div>
                <div><p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:800,color:"#f1f5f9",letterSpacing:.5,lineHeight:1.1}}>Binissalem</p><p style={{fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"DM Mono"}}>Sénior A · 25/26</p></div>
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
            <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",gap:6}}>
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
            <div className="mobile-topbar" style={{background:th.nav,padding:"10px 16px",display:"none",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,.06)",flexShrink:0}}>
              <button onClick={()=>setMenuOpen(true)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",fontSize:20,padding:0,lineHeight:1}}>☰</button>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:7,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,fontWeight:900,color:"#fff"}}>CB</div>
                <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:800,color:"#f1f5f9"}}>Binissalem</span>
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
