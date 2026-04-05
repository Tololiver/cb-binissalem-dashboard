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
      position:fixed!important;left:0;top:0;width:240px!important;
      height:100dvh!important;z-index:50;
      transform:translateX(-100%);transition:transform .25s ease;
    }
    .sidebar.open{transform:translateX(0)!important;}
    .mobile-topbar{display:flex!important;}
    .close-sidebar{display:block!important;}
    /* Ajustes generales de layout en tablet */
    main{padding:16px 14px!important;}
    .card{border-radius:10px!important;}
    /* Grids inline reducidos */
    [style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    [style*="repeat(3,1fr)"]{grid-template-columns:1fr 1fr!important;}
    [style*="repeat(7,1fr)"]{grid-template-columns:repeat(4,1fr)!important;}
  }

  /* Móvil ≤600px */
  @media(max-width:600px){
    .sidebar{width:85vw!important;}
    main{padding:12px 10px!important;}
    /* Texto y cabeceras */
    h2{font-size:20px!important;}
    /* Cards de KPI — siempre 2 columnas en móvil */
    [style*="repeat(4,1fr)"]{grid-template-columns:1fr 1fr!important;}
    [style*="repeat(3,1fr)"]{grid-template-columns:1fr!important;}
    [style*="repeat(7,1fr)"]{grid-template-columns:repeat(2,1fr)!important;}
    /* Grids de 2 col → 1 col en móvil */
    [style*="gridTemplateColumns:\"1fr 1fr\""]{grid-template-columns:1fr!important;}
    /* Tablas con scroll horizontal */
    .card{overflow-x:auto;}
    /* Tipografía de stats grande → más pequeña */
    [style*="fontSize:32"]{font-size:24px!important;}
    [style*="fontSize:28"]{font-size:20px!important;}
  }

  /* Clases de ayuda para grids responsive */
  @media(max-width:900px){
    .rg4{grid-template-columns:1fr 1fr!important;}
    .rg3{grid-template-columns:1fr 1fr!important;}
    .rg2{grid-template-columns:1fr!important;}
  }
  @media(max-width:600px){
    .rg4{grid-template-columns:1fr 1fr!important;}
    .rg3{grid-template-columns:1fr!important;}
    .rg2{grid-template-columns:1fr!important;}
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

/* ── PDF EXPORT FOR TRAINING ─────────────────────────────── */
function exportSessionPDF(session){
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${session.title}</title><style>
    body{font-family:sans-serif;padding:30px;max-width:700px;margin:0 auto;color:#1e293b}
    h1{color:#f97316;font-size:24px;margin-bottom:4px}
    .meta{color:#64748b;font-size:13px;margin-bottom:20px}
    h2{font-size:16px;color:#334155;margin:16px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
    li{margin:6px 0;font-size:14px}
    .notes{background:#f8fafc;border-left:4px solid #f97316;padding:10px 14px;border-radius:4px;font-size:13px;color:#475569}
    @media print{body{padding:15px}}
  </style></head><body>
    <h1>${session.title}</h1>
    <div class="meta">📅 ${session.date} &nbsp;·&nbsp; ⏱ ${session.dur} min &nbsp;·&nbsp; 🏷 ${session.type}</div>
    ${session.notes?`<h2>Notas</h2><div class="notes">${session.notes.replace(/\n/g,"<br>")}</div>`:""}
    <h2>Contenido de la sesión</h2>
    <ol>${(session.exs||[]).map(e=>`<li>${e}</li>`).join("")}</ol>
    <div style="margin-top:40px;color:#94a3b8;font-size:11px">CB Binissalem Senior A · Generado ${new Date().toLocaleDateString("es")}</div>
  </body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),300);
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
  const[f,setF]=useState({date:"",rival:"",location:"Casa",pts_us:"",pts_them:"",notes:""});

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
    setF({date:"",rival:"",location:"Casa",pts_us:"",pts_them:"",notes:""});setSa(false);
  };
  const startEdit=m=>{setEd(m.id);setEf({date:m.date,rival:m.rival,location:m.location,pts_us:m.pts_us??"",pts_them:m.pts_them??"",notes:m.notes||""});};
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
    w.document.write(`<html><head><title>Convocatoria ${m.rival}</title><style>
      body{font-family:Arial,sans-serif;padding:30px;max-width:500px;margin:0 auto}
      h1{color:#f97316;font-size:24px;margin-bottom:4px}
      h2{color:#64748b;font-size:14px;font-weight:normal;margin-bottom:24px}
      .player{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #e2e8f0}
      .num{width:36px;height:36px;border-radius:50%;background:#f97316;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;flex-shrink:0}
      .name{font-size:15px;font-weight:600}
      .pos{font-size:12px;color:#64748b}
      .footer{margin-top:24px;font-size:11px;color:#94a3b8;text-align:center}
    </style></head><body>
      <h1>CONVOCATORIA</h1>
      <h2>${m.date} · vs ${m.rival} · ${m.location}</h2>
      ${conv.map(p=>`<div class="player"><div class="num">${p.num}</div><div><div class="name">${p.name}</div><div class="pos">${p.pos}</div></div></div>`).join("")}
      <div class="footer">CB Binissalem Sénior A · ${conv.length} jugadores convocados</div>
    </body></html>`);
    w.document.close();setTimeout(()=>w.print(),300);
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
      <div style={{display:"grid",gridTemplateColumns:"150px 1fr 130px 80px 80px",gap:12,marginBottom:12}}>
        <div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))}/></div>
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
            <div style={{display:"grid",gridTemplateColumns:"150px 1fr 130px 80px 80px",gap:12,marginBottom:12}}>
              <div><Lbl>Fecha</Lbl><input type="date" value={ef.date} onChange={e=>setEf(x=>({...x,date:e.target.value}))}/></div>
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
              <p style={{fontSize:11,color:th.muted}}>{m.location}{hasResult?` · ${d>0?"+":""}${d} pts`:" · Sin resultado"}
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
function Entrenamientos(){
  const{th}=useTheme();const{sessions,setSessions,sesionTemplates,setSesionTemplates}=useData();
  const[exp,setExp]=useState(null);const[add,setAdd]=useState(false);
  const[editNotes,setEditNotes]=useState(null);const[notesVal,setNotesVal]=useState("");
  const[showTemplates,setShowTemplates]=useState(false);
  const[saveAsTemplate,setSaveAsTemplate]=useState(null);const[tplName,setTplName]=useState("");
  const[f,setF]=useState({date:"",type:"Técnico",dur:90,title:"",exs:"",notes:""});

  const save=()=>{
    if(!f.title||!f.date)return;
    const id=sessions.length?Math.max(...sessions.map(s=>s.id))+1:1;
    setSessions(p=>[...p,{id,...f,dur:+f.dur,exs:f.exs.split("\n").filter(Boolean)}]);
    setAdd(false);setF({date:"",type:"Técnico",dur:90,title:"",exs:"",notes:""});
  };
  const saveNotes=sid=>{setSessions(prev=>prev.map(s=>s.id===sid?{...s,notes:notesVal}:s));setEditNotes(null);};

  const loadTemplate=tpl=>{
    setF(prev=>({...prev,type:tpl.type,dur:tpl.dur,title:tpl.title,exs:tpl.exs,notes:tpl.notes||""}));
    setShowTemplates(false);setAdd(true);
  };
  const doSaveTemplate=sid=>{
    if(!tplName.trim())return;
    const s=sessions.find(x=>x.id===sid);if(!s)return;
    const id=Date.now();
    setSesionTemplates(prev=>[...prev,{id,name:tplName.trim(),type:s.type,dur:s.dur,title:s.title,exs:Array.isArray(s.exs)?s.exs.join("\n"):s.exs||"",notes:s.notes||""}]);
    setSaveAsTemplate(null);setTplName("");
  };
  const delTemplate=id=>setSesionTemplates(prev=>prev.filter(t=>t.id!==id));

  return <div>
    <SH title="Entrenamientos" sub="Sesiones · Plantillas · Notas" right={<div style={{display:"flex",gap:8}}>
      <Btn onClick={()=>setShowTemplates(!showTemplates)} variant="ghost" icon={<Copy size={14}/>} sm>Plantillas {sesionTemplates.length>0&&`(${sesionTemplates.length})`}</Btn>
      <Btn onClick={()=>{setAdd(true);setShowTemplates(false);}} icon={<Plus size={14}/>}>Nueva Sesión</Btn>
    </div>}/>

    {/* Panel plantillas */}
    {showTemplates&&<div className="card" style={{padding:18,marginBottom:14,borderColor:"rgba(139,92,246,.3)"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#8b5cf6",marginBottom:12,textTransform:"uppercase"}}>Plantillas guardadas</p>
      {sesionTemplates.length===0?<p style={{fontSize:12,color:th.muted}}>Aún no tienes plantillas. Crea una sesión y guárdala como plantilla para reutilizarla.</p>:(
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
    {add&&<div className="card" style={{padding:22,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:16,textTransform:"uppercase"}}>Nueva Sesión</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div>
        <div><Lbl>Tipo</Lbl><select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))}>{Object.keys(TC).map(t=><option key={t}>{t}</option>)}</select></div>
        <div><Lbl>Duración (min)</Lbl><input type="number" value={f.dur} onChange={e=>setF(p=>({...p,dur:e.target.value}))}/></div>
      </div>
      <div style={{marginBottom:12}}><Lbl>Título</Lbl><input type="text" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Título de la sesión"/></div>
      <div style={{marginBottom:12}}><Lbl>Ejercicios (uno por línea)</Lbl><textarea rows={4} value={f.exs} onChange={e=>setF(p=>({...p,exs:e.target.value}))} placeholder={"Calentamiento 15'\nEjercicio principal 30'..."}/></div>
      <div style={{marginBottom:16}}><Lbl>Notas previas</Lbl><textarea rows={2} value={f.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))} placeholder="Objetivos, instrucciones previas…"/></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={save}>Guardar</Btn><Btn onClick={()=>setAdd(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    {/* Lista sesiones */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sessions.map(s=>{const c=TC[s.type]||"#f97316";const op=exp===s.id;return <div key={s.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:12,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setExp(op?null:s.id)}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{minWidth:52,textAlign:"center"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{s.date}</p><p style={{fontFamily:"DM Mono",fontSize:13,color:c,fontWeight:700}}>{s.dur}'</p></div>
            <div><h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:4}}>{s.title}</h4>
              <div style={{display:"flex",gap:6,alignItems:"center"}}><Badge color={c}>{s.type}</Badge>{s.notes&&<span style={{fontSize:10,color:th.muted}}>📝</span>}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button title="Guardar como plantilla" onClick={e=>{e.stopPropagation();setSaveAsTemplate(s.id);setTplName(s.title);}}
              style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#8b5cf6"}} title="Guardar como plantilla">
              <Copy size={13}/>
            </button>
            <button title="Exportar PDF" onClick={e=>{e.stopPropagation();exportSessionPDF(s);}} style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Printer size={13}/></button>
            <Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSessions(p=>p.filter(x=>x.id!==s.id));}}/>
            <ChevronRight size={15} color={th.muted} style={{transform:op?"rotate(90deg)":"none",transition:"transform .2s"}}/>
          </div>
        </div>

        {/* Diálogo guardar plantilla */}
        {saveAsTemplate===s.id&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${th.border}`,display:"flex",gap:8,alignItems:"center"}}>
          <input value={tplName} onChange={e=>setTplName(e.target.value)} placeholder="Nombre de la plantilla…" style={{flex:1}}/>
          <Btn onClick={()=>doSaveTemplate(s.id)} sm>Guardar plantilla</Btn>
          <Btn onClick={()=>setSaveAsTemplate(null)} variant="ghost" sm>Cancelar</Btn>
        </div>}

        {op&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${th.border}`}}>
          {editNotes===s.id?(
            <div style={{marginBottom:14}}>
              <Lbl>Notas post-entreno</Lbl>
              <textarea rows={4} value={notesVal} onChange={e=>setNotesVal(e.target.value)} placeholder="Observaciones, rendimiento, ajustes…" style={{marginBottom:8}}/>
              <div style={{display:"flex",gap:8}}><Btn onClick={()=>saveNotes(s.id)} sm>Guardar</Btn><Btn onClick={()=>setEditNotes(null)} variant="ghost" sm>Cancelar</Btn></div>
            </div>
          ):(
            <div style={{marginBottom:12}}>
              {s.notes&&<div style={{background:c+"0f",borderLeft:`3px solid ${c}`,padding:"8px 12px",borderRadius:4,marginBottom:8,fontSize:12,color:th.sub,lineHeight:1.6}}>
                <strong style={{color:c,fontFamily:"Barlow Condensed",fontSize:13}}>NOTAS</strong><br/>{s.notes}
              </div>}
              <button onClick={()=>{setEditNotes(s.id);setNotesVal(s.notes||"");}} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:11,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Edit2 size={11}/>{s.notes?"Editar notas":"Añadir notas post-entreno"}
              </button>
            </div>
          )}
          {(s.exs||[]).map((ex,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <div style={{width:22,height:22,borderRadius:11,background:c+"18",border:`1px solid ${c}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"DM Mono",fontSize:9,color:c}}>{i+1}</span></div>
            <span style={{fontSize:13,color:th.sub}}>{ex}</span>
          </div>)}
        </div>}
      </div>;})}
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
    if(editPlay==="new"){setPlays(prev=>[...prev,{...p,id:Date.now()}]);}
    else{setPlays(prev=>prev.map(x=>x.id===editPlay.id?{...x,...p}:x));}
    setEditPlay(null);setShowAdd(false);
  };
  const delPlay=id=>setPlays(prev=>prev.filter(p=>p.id!==id));

  const handlePDF=async e=>{
    const file=e.target.files[0];if(!file)return;
    if(!apiKey){setPdfMsg("❌ Introduce primero tu API Key de Anthropic en Ajustes (⚙️ en el sidebar).");e.target.value="";return;}
    setPdfLoading(true);setPdfMsg("Leyendo PDF con IA…");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const data=await callClaude(apiKey,{
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
          {type:"text",text:`Analiza este documento de baloncesto. Extrae TODAS las jugadas o sistemas que encuentres y devuelve ÚNICAMENTE JSON válido (sin markdown ni texto extra):
{"jugadas":[{"nombre":"nombre jugada","categoria":"Ataque|Defensa|Especial","descripcion":"descripción detallada","etiquetas":["tag1","tag2"]}]}
Si no hay jugadas reconocibles devuelve: {"jugadas":[]}`}
        ]}]
      });
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      const nuevas=(parsed.jugadas||[]).map(j=>({id:Date.now()+Math.random(),name:j.nombre||j.name||"Sin nombre",cat:j.categoria||j.cat||"Ataque",desc:j.descripcion||j.desc||"",tags:j.etiquetas||j.tags||[],images:[]}));
      if(nuevas.length>0){setPlays(prev=>[...prev,...nuevas]);setPdfMsg(`✅ ${nuevas.length} jugada${nuevas.length>1?"s":""} importada${nuevas.length>1?"s":""} del PDF`);}
      else setPdfMsg("⚠️ No se encontraron jugadas. Prueba a crearlas manualmente.");
    }catch(err){console.error(err);setPdfMsg(`❌ Error: ${err.message||"Inténtalo de nuevo."} Verifica tu API Key.`);}
    setPdfLoading(false);e.target.value="";
    setTimeout(()=>setPdfMsg(null),6000);
  };

  return <div>
    <SH title="Playbook" sub="Jugadas y sistemas · Todas editables" right={<div style={{display:"flex",gap:8}}>
      <input ref={fr} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePDF}/>
      <Btn onClick={()=>fr.current?.click()} variant="ghost" icon={pdfLoading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<FileText size={14}/>} disabled={pdfLoading}>{pdfLoading?"Analizando…":"Importar PDF"}</Btn>
      <Btn onClick={()=>{setShowAdd(true);setEditPlay("new");}} icon={<Plus size={14}/>}>Nueva Jugada</Btn>
    </div>}/>
    {pdfMsg&&<div style={{background:pdfMsg.startsWith("✅")?"rgba(16,185,129,.07)":pdfMsg.startsWith("⚠️")?"rgba(245,158,11,.07)":"rgba(239,68,68,.07)",border:`1px solid ${pdfMsg.startsWith("✅")?"rgba(16,185,129,.3)":pdfMsg.startsWith("⚠️")?"rgba(245,158,11,.3)":"rgba(239,68,68,.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.text}}>{pdfMsg}</div>}
    {(showAdd||editPlay)&&<PlaybookEditForm play={editPlay==="new"?null:editPlay} onSave={savePlay} onCancel={()=>{setShowAdd(false);setEditPlay(null);}}/>}
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(PC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(play=>{const c=PC[play.cat]||"#f97316";return <div key={play.id} className="card" style={{padding:20,borderTop:`3px solid ${c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <h3 style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text,flex:1,marginRight:8}}>{play.name}</h3>
          <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
            <Badge color={c}>{play.cat}</Badge>
            <button onClick={()=>setEditPlay(play)} title="Editar" style={{width:26,height:26,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={11}/></button>
            <button onClick={()=>delPlay(play.id)} title="Eliminar" style={{width:26,height:26,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={11}/></button>
          </div>
        </div>
        <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:12}}>{play.desc}</p>
        {(play.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{play.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{width:60,height:60,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}</div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(play.tags||[]).map(t=><span key={t} style={{fontSize:10,color:th.muted,background:th.card2,padding:"2px 8px",borderRadius:4,border:`1px solid ${th.border}`}}>{t}</span>)}</div>
      </div>;})}
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
    if(editEx==="new"){setEjercicios(prev=>[...prev,{...ex,id:Date.now()}]);}
    else{setEjercicios(prev=>prev.map(x=>x.id===editEx.id?{...x,...ex}:x));}
    setEditEx(null);setShowAdd(false);
  };
  const delEx=id=>setEjercicios(prev=>prev.filter(e=>e.id!==id));

  return <div>
    <SH title="Ejercicios" sub="Biblioteca por categoría · Todos editables" right={<Btn onClick={()=>{setShowAdd(true);setEditEx("new");}} icon={<Plus size={14}/>}>Nuevo Ejercicio</Btn>}/>
    {(showAdd||editEx)&&<EjercicioEditForm ex={editEx==="new"?null:editEx} onSave={saveEx} onCancel={()=>{setShowAdd(false);setEditEx(null);}}/>}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(CC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(ex=>{const c=CC[ex.cat]||"#f97316";const dc=DC[ex.diff]||"#10b981";return <div key={ex.id} className="card" style={{padding:20,borderTop:`3px solid ${c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1,marginRight:8}}>
            <h3 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:6}}>{ex.name}</h3>
            <div style={{display:"flex",gap:5}}><Badge color={c} sm>{ex.cat}</Badge><Badge color={dc} sm>{ex.diff}</Badge></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
            {ex.dur&&<div style={{background:th.card2,borderRadius:7,padding:"4px 8px",border:`1px solid ${th.border}`}}><p style={{fontFamily:"DM Mono",fontSize:12,color:c,fontWeight:700}}>{ex.dur}</p></div>}
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setEditEx(ex)} style={{width:24,height:24,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Edit2 size={11}/></button>
              <button onClick={()=>delEx(ex.id)} style={{width:24,height:24,borderRadius:6,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={11}/></button>
            </div>
          </div>
        </div>
        {ex.desc&&<p style={{fontSize:12,color:th.sub,lineHeight:1.6,marginBottom:8}}>{ex.desc}</p>}
        {(ex.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {ex.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{width:60,height:60,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}
        </div>}
      </div>;})}
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

  // Render a player element — attacker (orange filled) or defender (blue, X mark)
  const rElCustom=(ctx,el,pv=false)=>{
    ctx.globalAlpha=pv?.45:1;ctx.lineCap="round";ctx.lineJoin="round";
    if(el.type==="player_atk"){
      ctx.beginPath();ctx.arc(el.x,el.y,15,0,Math.PI*2);
      ctx.fillStyle="#f97316";ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#fff";ctx.font="bold 13px 'Barlow Condensed',sans-serif";
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+.5);
    } else if(el.type==="player_def"){
      ctx.beginPath();ctx.arc(el.x,el.y,15,0,Math.PI*2);
      ctx.fillStyle=th.mode==="dark"?"#1e293b":"#f1f5f9";
      ctx.fill();ctx.strokeStyle="#3b82f6";ctx.lineWidth=2.5;ctx.stroke();
      // X mark
      const s=7;
      ctx.strokeStyle="#3b82f6";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(el.x-s+3,el.y-s+3);ctx.lineTo(el.x+s-3,el.y+s-3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(el.x+s-3,el.y-s+3);ctx.lineTo(el.x-s+3,el.y+s-3);ctx.stroke();
      // Number below X
      ctx.fillStyle="#3b82f6";ctx.font="bold 9px 'Barlow Condensed',sans-serif";
      ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+6);
    } else if(el.type==="line"||el.type==="dash"||el.type==="arrow"){
      if(el.type==="dash")ctx.setLineDash([14,9]);
      ctx.strokeStyle=el.color;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(el.x1,el.y1);ctx.lineTo(el.x2,el.y2);ctx.stroke();ctx.setLineDash([]);
      if(el.type==="arrow"){const a=Math.atan2(el.y2-el.y1,el.x2-el.x1);ctx.beginPath();ctx.moveTo(el.x2,el.y2);ctx.lineTo(el.x2-16*Math.cos(a-Math.PI/6),el.y2-16*Math.sin(a-Math.PI/6));ctx.lineTo(el.x2-16*Math.cos(a+Math.PI/6),el.y2-16*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fillStyle=el.color;ctx.fill();}
    } else {
      rEl(ctx,el,false);
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
    or.current=p;dr.current=true;
  };
  const oM=e=>{if(!dr.current||!or.current)return;const p=gp(e);rd(els,{type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color});};
  const oU=e=>{if(!dr.current||!or.current)return;const p=gp(e);if(Math.abs(p.x-or.current.x)>5||Math.abs(p.y-or.current.y)>5){const el={type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color};setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});setEls(ps=>[...ps,el]);}dr.current=false;or.current=null;};
  const undo=()=>{const h=hist[step];if(!h||!h.length)return;const prev=h[h.length-1];setHist(hh=>{const n=[...hh];n[step]=n[step].slice(0,-1);return n;});setEls(prev);};
  const clr=()=>{setHist(hh=>{const n=[...hh];n[step]=[...n[step],els];return n;});setEls([]);};

  const savePlay=()=>{if(!saveName)return;const id=Date.now();setSavedDrawings(prev=>[...prev,{id,name:saveName,steps:steps.map(s=>[...s])}]);setSaveName("");setShowSave(false);};
  const loadPlay=play=>{setSteps(play.steps.map(s=>[...s]));setHist([[],[],[],[]]);setSelPlay(null);};

  const lineTools=[{id:"arrow",label:"Flecha",icon:"→"},{id:"line",label:"Línea",icon:"—"},{id:"dash",label:"Pase",icon:"╌╌"}];

  return <div>
    <SH title="Pizarra" sub="Atacantes · Defensores · 4 pasos por jugada"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:16}}>
      <div className="card" style={{padding:16}}>
        {/* Pasos */}
        <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
          <span style={{fontSize:11,color:th.muted,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase",marginRight:4}}>Paso:</span>
          {[0,1,2,3].map(i=><button key={i} onClick={()=>setStep(i)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${step===i?"#f97316":th.border2}`,background:step===i?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:14,color:step===i?"#f97316":th.sub,position:"relative"}}>
            {i+1}{steps[i].length>0&&<span style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:4,background:"#f97316"}}/>}
          </button>)}
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

        {/* Herramientas */}
        <div className="card" style={{padding:14}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Herramientas</p>
          {lineTools.map(t=><div key={t.id} onClick={()=>setTool(t.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,cursor:"pointer",background:tool===t.id?"rgba(249,115,22,.1)":th.card2,border:`1px solid ${tool===t.id?"#f97316":th.border}`,marginBottom:5}}>
            <span style={{fontSize:15,minWidth:22,textAlign:"center",color:tool===t.id?"#f97316":th.sub}}>{t.icon}</span>
            <p style={{fontSize:12,fontFamily:"Barlow Condensed",fontWeight:700,color:tool===t.id?"#f97316":th.text}}>{t.label}</p>
          </div>)}
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
function exportToPDF(title,content){
  const w=window.open("","_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Arial,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1e293b;line-height:1.7}
    h1{color:#f97316;font-size:26px;margin-bottom:4px;border-bottom:3px solid #f97316;padding-bottom:8px}
    h2{color:#f97316;font-size:18px;margin-top:24px}
    .meta{color:#64748b;font-size:13px;margin-bottom:24px}
    pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.75}
    .footer{margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
    @media print{body{margin:20px}}
  </style></head><body>
    <h1>${title}</h1>
    <div class="meta">CB Binissalem Sénior A · ${new Date().toLocaleDateString("es")}</div>
    <pre>${content.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</pre>
    <div class="footer">Generado por CB Binissalem Dashboard · IA Asistente</div>
  </body></html>`);
  w.document.close();setTimeout(()=>w.print(),400);
}

function IAAsistente(){
  const{th}=useTheme();
  const{players,matches,sessions,sesionTemplates,setSesionTemplates,setSessions,scouting,setScouting,apiKey}=useData();
  const[tab,setTab]=useState("rival");
  const[selScout,setSelScout]=useState(null);

  // Análisis rival
  const[rivalName,setRivalName]=useState("");
  const[rivalText,setRivalText]=useState("");const[rivalResult,setRivalResult]=useState(null);const[rivalLoading,setRivalLoading]=useState(false);
  const rivalFileRef=useRef();
  // Stats de jugadores del rival para scouting
  const[rivalPlayers,setRivalPlayers]=useState([
    {id:1,num:"4", name:"Jugador 1",pos:"Base",   pts:"",reb:"",ast:"",fg:"",notas:""},
    {id:2,num:"7", name:"Jugador 2",pos:"Escolta", pts:"",reb:"",ast:"",fg:"",notas:""},
    {id:3,num:"11",name:"Jugador 3",pos:"Alero",   pts:"",reb:"",ast:"",fg:"",notas:""},
    {id:4,num:"14",name:"Jugador 4",pos:"Ala-Pív.",pts:"",reb:"",ast:"",fg:"",notas:""},
    {id:5,num:"21",name:"Jugador 5",pos:"Pívot",   pts:"",reb:"",ast:"",fg:"",notas:""},
  ]);
  const setRP=(id,field,val)=>setRivalPlayers(prev=>prev.map(p=>p.id===id?{...p,[field]:val}:p));
  const addRP=()=>setRivalPlayers(prev=>[...prev,{id:Date.now(),num:"",name:`Jugador ${prev.length+1}`,pos:"Base",pts:"",reb:"",ast:"",fg:"",notas:""}]);
  const delRP=id=>setRivalPlayers(prev=>prev.filter(p=>p.id!==id));

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
      (p.name.trim()&&!p.name.match(/^Jugador \d+$/))||p.pts||p.reb||p.ast||p.fg
    );

    try{
      const content=[];
      if(rivalFileRef.current?.files?.[0]){
        const f=rivalFileRef.current.files[0];
        const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(f);});
        content.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}});
      }
      const rpStr=hasManualPlayers
        ?rivalPlayers.filter(p=>p.name.trim()&&(!p.name.match(/^Jugador \d+$/)||p.pts||p.reb||p.ast)).map(p=>`  #${p.num} ${p.name} (${p.pos})${p.pts?` PTS/P:${p.pts}`:""}${p.reb?` REB:${p.reb}`:""}${p.ast?` AST:${p.ast}`:""}${p.fg?` TC%:${p.fg}%`:""}${p.notas?` (${p.notas})`:""}`).join("\n")
        :"";

      content.push({type:"text",text:`Eres analista táctico de baloncesto. ${rivalName?`Rival: ${rivalName}.\n`:""}${rivalText?`Información general:\n${rivalText}\n\n`:""}${rpStr?`Jugadores conocidos:\n${rpStr}\n\n`:""}

Genera el informe táctico en español con estas secciones:
1. PUNTOS FUERTES del rival
2. PUNTOS DÉBILES a explotar
3. PLAN DE PARTIDO (ataque y defensa)
4. JUGADORES A VIGILAR (con datos concretos si los hay)
5. JUGADAS CLAVE a preparar

${!hasManualPlayers?`Además, si en la información encuentras jugadores identificables, extráelos al final del informe en este bloque JSON exacto (no uses markdown):
PLAYERS_JSON:[{"num":"4","name":"Nombre Apellido","pos":"Base","pts":"12.5","reb":"3.2","ast":"5.1","fg":"45","notas":"Anotador principal"}]
Si no hay datos de jugadores suficientes, omite el bloque PLAYERS_JSON.`:""}

Sé específico y práctico.`});

      const data=await callClaude(apiKey,{model:"claude-sonnet-4-20250514",max_tokens:1600,messages:[{role:"user",content}]});
      let fullText=data.content?.find(b=>b.type==="text")?.text||"Sin respuesta.";

      // Intentar extraer jugadores del JSON embebido
      let extractedPlayers=null;
      if(!hasManualPlayers){
        const jsonMatch=fullText.match(/PLAYERS_JSON:\s*(\[[\s\S]*?\])/);
        if(jsonMatch){
          try{
            const parsed=JSON.parse(jsonMatch[1]);
            if(Array.isArray(parsed)&&parsed.length>0){
              extractedPlayers=parsed.map((p,i)=>({
                id:Date.now()+i,
                num:p.num||String(i+1),
                name:p.name||`Jugador ${i+1}`,
                pos:p.pos||"Base",
                pts:p.pts||"",
                reb:p.reb||"",
                ast:p.ast||"",
                fg:p.fg||"",
                notas:p.notas||"",
              }));
              // Eliminar el bloque JSON del texto visible
              fullText=fullText.replace(/PLAYERS_JSON:\s*\[[\s\S]*?\]/,"").trim();
            }
          }catch{}
        }
      }

      // Actualizar tabla de jugadores si se extrajeron
      if(extractedPlayers&&extractedPlayers.length>0){
        setRivalPlayers(extractedPlayers);
      }

      setRivalResult({text:fullText,rival:rivalName||"Sin nombre",saved:false,playersExtracted:!!extractedPlayers});
    }catch(e){setRivalResult({error:e.message});}
    setRivalLoading(false);
    if(rivalFileRef.current)rivalFileRef.current.value="";
  };

  const saveScoutReport=()=>{
    if(!rivalResult||rivalResult.error||rivalResult.saved)return;
    setScouting(prev=>[{id:Date.now(),rival:rivalResult.rival||"Sin nombre",date:new Date().toISOString().split("T")[0],text:rivalResult.text,players:rivalPlayers},...prev]);
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
    const exs=sesResult.text.split("\n").filter(l=>l.trim()&&l.length>10&&!l.startsWith("#")).slice(0,12);
    setSessions(prev=>[...prev,{id,date:sesResult.date,type:sesResult.type,dur:sesResult.dur,title:sesResult.title,exs,notes:sesResult.text}]);
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
        <button onClick={()=>exportToPDF(pdfTitle,result.text)} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,border:"1px solid rgba(249,115,22,.4)",background:"rgba(249,115,22,.07)",cursor:"pointer",color:"#f97316",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
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
          <div style={{marginBottom:10}}><Lbl>Nombre del rival</Lbl><input value={rivalName} onChange={e=>setRivalName(e.target.value)} placeholder="Ej: CB Inca A"/></div>
          <div style={{marginBottom:14}}><Lbl>Información general (sistema, estilo, puntos débiles…)</Lbl>
            <textarea rows={3} value={rivalText} onChange={e=>setRivalText(e.target.value)} placeholder="Sistema defensivo, jugadores clave, estadísticas, tendencias..."/>
          </div>

          {/* Tabla jugadores rival */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Lbl>Jugadores del rival (opcional — enriquece el análisis)</Lbl>
              <button onClick={addRP} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",fontSize:11,color:th.sub,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Plus size={11}/>Añadir
              </button>
            </div>
            <div style={{overflow:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:560}}>
                <thead><tr style={{background:th.tableHead}}>
                  {["#","Nombre","Pos","PTS/P","REB/P","AST/P","TC%","Notas",""].map((h,i)=><th key={i} style={{padding:"6px 8px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>)}
                </tr></thead>
                <tbody>{rivalPlayers.map(p=><tr key={p.id} style={{borderTop:`1px solid ${th.border}`}}>
                  <td style={{padding:"5px 6px"}}><input value={p.num} onChange={e=>setRP(p.id,"num",e.target.value)} style={{width:34,textAlign:"center",padding:"4px 2px",fontSize:12}}/></td>
                  <td style={{padding:"5px 6px"}}><input value={p.name} onChange={e=>setRP(p.id,"name",e.target.value)} style={{width:110,fontSize:12}}/></td>
                  <td style={{padding:"5px 6px"}}>
                    <select value={p.pos} onChange={e=>setRP(p.id,"pos",e.target.value)} style={{fontSize:11,padding:"4px 4px"}}>
                      {["Base","Escolta","Alero","Ala-Pív.","Pívot"].map(po=><option key={po}>{po}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"5px 4px"}}><input type="number" value={p.pts} onChange={e=>setRP(p.id,"pts",e.target.value)} style={{width:44,textAlign:"center",fontSize:12}}/></td>
                  <td style={{padding:"5px 4px"}}><input type="number" value={p.reb} onChange={e=>setRP(p.id,"reb",e.target.value)} style={{width:44,textAlign:"center",fontSize:12}}/></td>
                  <td style={{padding:"5px 4px"}}><input type="number" value={p.ast} onChange={e=>setRP(p.id,"ast",e.target.value)} style={{width:44,textAlign:"center",fontSize:12}}/></td>
                  <td style={{padding:"5px 4px"}}><input type="number" value={p.fg} onChange={e=>setRP(p.id,"fg",e.target.value)} style={{width:44,textAlign:"center",fontSize:12}}/></td>
                  <td style={{padding:"5px 4px"}}><input value={p.notas} onChange={e=>setRP(p.id,"notas",e.target.value)} placeholder="Observaciones…" style={{width:120,fontSize:11}}/></td>
                  <td style={{padding:"5px 4px"}}><button onClick={()=>delRP(p.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#ef4444",padding:2}}><Trash2 size={11}/></button></td>
                </tr>)}</tbody>
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
              <button onClick={()=>exportToPDF(`Scouting — ${rivalResult.rival}`,rivalResult.text)}
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
              <button onClick={()=>exportToPDF(`Scouting — ${selScout.rival}`,selScout.text)}
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
          {selScout.players&&selScout.players.some(p=>p.pts||p.reb||p.ast||p.name!==`Jugador ${selScout.players.indexOf(p)+1}`)&&
            <div style={{marginBottom:14,overflow:"auto"}}>
              <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Jugadores analizados</p>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:480,fontSize:12}}>
                <thead><tr style={{background:th.tableHead}}>
                  {["#","Nombre","Pos","PTS/P","REB/P","AST/P","TC%","Notas"].map((h,i)=><th key={i} style={{padding:"6px 8px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:10,color:th.muted,textTransform:"uppercase",letterSpacing:.5}}>{h}</th>)}
                </tr></thead>
                <tbody>{selScout.players.filter(p=>p.name).map(p=><tr key={p.id} style={{borderTop:`1px solid ${th.border}`}}>
                  <td style={{padding:"6px 8px",fontFamily:"DM Mono",color:th.muted}}>{p.num}</td>
                  <td style={{padding:"6px 8px",fontWeight:600,color:th.text}}>{p.name}</td>
                  <td style={{padding:"6px 8px"}}><Badge color={POC[p.pos]||"#64748b"} sm>{p.pos}</Badge></td>
                  {["pts","reb","ast","fg"].map(f=><td key={f} style={{padding:"6px 8px",fontFamily:"DM Mono",color:"#f97316",fontWeight:p[f]?600:300}}>{p[f]||"—"}{f==="fg"&&p[f]?"%":""}</td>)}
                  <td style={{padding:"6px 8px",color:th.sub,fontSize:11}}>{p.notas||""}</td>
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
          <button onClick={()=>exportToPDF(`Sesión: ${sesResult.title}`,sesResult.text)}
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
  const{th}=useTheme();const{matches,setMatches,players,setPlayers}=useData();
  const today=new Date().toISOString().split("T")[0];
  // Show past matches too, sorted desc, most recent first
  const allSorted=[...matches].sort((a,b)=>b.date.localeCompare(a.date));
  const[sel,setSel]=useState(null);
  const m=matches.find(x=>x.id===sel)||allSorted[0];
  const[tab,setTab]=useState("marcador"); // marcador | stats

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

  if(!m)return <div style={{textAlign:"center",padding:"60px 20px"}}>
    <Trophy size={48} color={th.muted} style={{margin:"0 auto 16px",display:"block"}}/>
    <p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text,marginBottom:8}}>No hay partidos</p>
    <p style={{color:th.muted,fontSize:13}}>Añade partidos desde la sección Partidos o el Calendario</p>
  </div>;

  const QInput=({val,onChange,color="#f97316"})=>(
    <input type="number" min="0" value={val} onChange={e=>onChange(e.target.value)}
      style={{width:54,height:44,textAlign:"center",fontFamily:"DM Mono",fontSize:18,fontWeight:700,color,padding:"4px",borderRadius:8,border:`2px solid ${val?color:th.border2}`,background:val?color+"0d":th.inputBg}}/>
  );

  const SF=({label,pid,field,small})=>(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <span style={{fontFamily:"Barlow Condensed",fontSize:9,color:th.muted,textTransform:"uppercase",letterSpacing:.3}}>{label}</span>
      <input type="number" min="0" value={getStat(pid,field)} onChange={e=>setStat(pid,field,e.target.value)}
        disabled={statsCommitted}
        style={{width:small?36:42,height:32,textAlign:"center",fontFamily:"DM Mono",fontSize:13,fontWeight:600,padding:"2px",borderRadius:6,border:`1px solid ${th.border2}`,background:statsCommitted?th.card2:th.inputBg,color:th.text,opacity:statsCommitted?.6:1}}/>
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
        {[["marcador","🏀 Marcador por cuartos"],["stats","📊 Estadísticas individuales"],["notas","📝 Notas"]].map(([k,lbl])=>(
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
      {statsCommitted&&<div style={{background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.3)",borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:"#10b981"}}>
        ✅ Estadísticas ya confirmadas y sumadas a los totales de temporada. No se pueden editar para evitar duplicados.
      </div>}
      {convPlayers.length===0
        ?<div className="card" style={{padding:32,textAlign:"center"}}><p style={{color:th.muted,fontSize:13}}>No hay convocatoria definida para este partido.<br/>Ve a la sección Partidos para añadir la convocatoria.</p></div>
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
          {!statsCommitted&&<div style={{padding:"16px 20px",borderTop:`1px solid ${th.border}`,display:"flex",gap:10,alignItems:"center"}}>
            <Btn onClick={commitStats} icon={<Check size={14}/>}>Confirmar y acumular en temporada</Btn>
            <p style={{fontSize:11,color:th.muted}}>⚠️ Esta acción suma las stats a los totales de cada jugador. Solo se puede hacer una vez por partido.</p>
          </div>}
        </div>
      }
    </div>}

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
    const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe Semanal CB Binissalem</title><style>body{font-family:Arial,sans-serif;max-width:720px;margin:30px auto;padding:0 20px;color:#1e293b;font-size:14px}h1{color:#f97316;font-size:28px;margin:0 0 4px}h2{color:#f97316;font-size:16px;border-bottom:2px solid #f97316;padding-bottom:4px;margin:20px 0 10px}.meta{color:#64748b;font-size:12px;margin-bottom:24px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center}.kpi-val{font-size:26px;font-weight:700;color:#f97316;line-height:1;margin-bottom:4px}.kpi-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase}table{width:100%;border-collapse:collapse;margin-bottom:12px}th{background:#f8fafc;padding:8px 10px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;border-bottom:2px solid #e2e8f0}td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:13px}.win{color:#10b981;font-weight:700}.los{color:#ef4444;font-weight:700}.footer{margin-top:36px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:11px;color:#94a3b8;text-align:center}@media print{body{margin:10px}}</style></head><body>
    <h1>CB Binissalem Sénior A</h1><div class="meta">Informe semanal · ${fmt(monday)} – ${fmt(sunday)} · ${today.toLocaleDateString("es")}</div>
    <h2>Temporada</h2><div class="grid"><div class="kpi"><div class="kpi-val">${wins}–${played.length-wins}</div><div class="kpi-lbl">Record</div></div><div class="kpi"><div class="kpi-val">${played.length}</div><div class="kpi-lbl">Partidos</div></div><div class="kpi"><div class="kpi-val">${avgPts}</div><div class="kpi-lbl">PTS/P</div></div><div class="kpi"><div class="kpi-val">${sessions.length}</div><div class="kpi-lbl">Sesiones</div></div></div>
    <h2>Esta semana</h2>${weekSessions.length?`<table><tr><th>Fecha</th><th>Sesión</th><th>Tipo</th><th>Dur.</th></tr>${weekSessions.map(s=>`<tr><td>${s.date}</td><td>${s.title}</td><td>${s.type}</td><td>${s.dur}'</td></tr>`).join("")}</table>`:"<p style='color:#94a3b8'>Sin sesiones</p>"}
    ${weekMatches.length?`<table><tr><th>Rival</th><th>Lugar</th><th>Resultado</th></tr>${weekMatches.map(m=>`<tr><td>${m.rival}</td><td>${m.location}</td><td>${m.pts_us!=null?`<span class="${m.pts_us>m.pts_them?"win":"los"}">${m.pts_us}–${m.pts_them}</span>`:"—"}</td></tr>`).join("")}</table>`:""}
    <h2>Próximos partidos</h2>${nextMatches.length?`<table><tr><th>Fecha</th><th>Rival</th><th>Lugar</th></tr>${nextMatches.map(m=>`<tr><td>${m.date}</td><td>${m.rival}</td><td>${m.location}</td></tr>`).join("")}</table>`:"<p style='color:#94a3b8'>Sin partidos próximos</p>"}
    <h2>Top anotadores</h2><table><tr><th>#</th><th>Jugador</th><th>Pos.</th><th>PJ</th><th>PTS/P</th><th>T2%</th><th>T3%</th><th>TL%</th></tr>${top5.map((pl,i)=>`<tr><td>${i+1}</td><td><strong>${pl.name}</strong></td><td>${pl.pos}</td><td>${pl.pj}</td><td>${pl.pts_p}</td><td>${pl.t2_pct}%</td><td>${pl.t3_pct}%</td><td>${pl.tl_pct}%</td></tr>`).join("")}</table>
    <div class="footer">CB Binissalem Dashboard</div></body></html>`;
    const w=window.open("","_blank");w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);
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
  {id:"pizarra",  label:"Pizarra",       icon:PenTool},
  {id:"ia",       label:"IA Asistente",  icon:Brain},
  {id:"recursos", label:"Recursos",      icon:Link},
];
const VIEWS={dashboard:Dashboard,plantilla:Plantilla,partidos:Partidos,calendario:Calendario,plan:Planificacion,stats:Estadisticas,evolucion:EvolucionStats,train:Entrenamientos,carga:CargaTrabajo,informe:InformeSemanal,attend:Asistencia,lineup:Quinteto,partido:ModoPartido,playbook:Playbook,exercises:Ejercicios,pizarra:Pizarra,ia:IAAsistente,recursos:Recursos};

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
  const[apiKey,    setApiKeyRaw]   = useState(()=>localStorage.getItem("cb_apikey")||"");

  const stRef=useRef({players:DP,matches:DM,sessions:DS,attDates:DA,quintets:DEFAULT_QUINTETS,recursos:DEFAULT_RECURSOS,plays:DEFAULT_PLAYS,ejercicios:DEFAULT_EJS,customEx:[],savedDrawings:[],planMesos:null,planMicro:null,sesionTemplates:[],scouting:[],dark:true});
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
      <DataCtx.Provider value={{players,setPlayers,matches,setMatches,sessions,setSessions,attDates,setAttDates,quintets,setQuintets,recursos,setRecursos,plays,setPlays,ejercicios,setEjercicios,customEx,setCustomEx,savedDrawings,setSavedDrawings,planMesos,setPlanMesos,planMicro,setPlanMicro,sesionTemplates,setSesionTemplates,scouting,setScouting,apiKey,setApiKey}}>
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
