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
const DP = [
  {id:1, name:"Joan Mir Crespí",      num:4,  pos:"Base",      active:true,  pts:12.4,reb:3.2,ast:5.1,stl:1.4,blk:0.2,fg:45.2},
  {id:2, name:"Toni Alcover Pons",    num:7,  pos:"Escolta",   active:true,  pts:10.2,reb:2.8,ast:3.4,stl:1.1,blk:0.4,fg:42.6},
  {id:3, name:"Marc Rosselló Vich",   num:11, pos:"Alero",     active:true,  pts:8.7, reb:5.9,ast:2.1,stl:0.9,blk:0.7,fg:48.3},
  {id:4, name:"Pau Vicens Fiol",      num:14, pos:"Ala-Pívot", active:true,  pts:7.5, reb:7.4,ast:1.5,stl:0.7,blk:1.2,fg:52.1},
  {id:5, name:"Biel Moyà Llull",      num:21, pos:"Pívot",     active:true,  pts:6.3, reb:9.8,ast:0.9,stl:0.4,blk:1.9,fg:58.4},
  {id:6, name:"Andreu Pons Amengual", num:8,  pos:"Base",      active:true,  pts:9.1, reb:2.6,ast:4.8,stl:1.2,blk:0.2,fg:41.8},
  {id:7, name:"Miquel Bestard Sans",  num:15, pos:"Escolta",   active:true,  pts:8.6, reb:3.1,ast:2.9,stl:1.3,blk:0.3,fg:43.9},
  {id:8, name:"Rafel Perelló Reus",   num:3,  pos:"Alero",     active:true,  pts:6.8, reb:4.7,ast:1.7,stl:0.8,blk:0.6,fg:47.5},
  {id:9, name:"Arnau Sastre Munar",   num:23, pos:"Ala-Pívot", active:true,  pts:5.4, reb:6.2,ast:1.2,stl:0.6,blk:1.1,fg:50.8},
  {id:10,name:"Tomeu Ramis Fiol",     num:33, pos:"Pívot",     active:true,  pts:4.2, reb:7.1,ast:0.6,stl:0.3,blk:1.7,fg:56.9},
  {id:11,name:"Xavi Colom Ferrer",    num:9,  pos:"Escolta",   active:false, pts:5.8, reb:2.0,ast:2.5,stl:0.7,blk:0.3,fg:40.1},
  {id:12,name:"Jaume Morro Pujol",    num:17, pos:"Alero",     active:true,  pts:7.9, reb:4.3,ast:1.9,stl:0.8,blk:0.5,fg:49.6},
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
  const wins=matches.filter(m=>m.pts_us>m.pts_them).length;
  const losses=matches.filter(m=>m.pts_us<=m.pts_them).length;
  const avgPts=active.length?(active.reduce((a,p)=>a+p.pts,0)/active.length).toFixed(1):"—";
  const avgReb=active.length?(active.reduce((a,p)=>a+p.reb,0)/active.length).toFixed(1):"—";

  // Attendance summary
  const datesWithData=Object.keys(attDates).filter(d=>ALL_TRAINING_DATES.includes(d));
  const avgAtt=datesWithData.length>0&&active.length>0
    ? Math.round(datesWithData.reduce((a,d)=>a+(attDates[d]||[]).filter(id=>active.some(p=>p.id===id)).length,0)/(datesWithData.length*active.length)*100)
    : 0;

  const kpis=[
    {label:"Record",    value:`${wins}–${losses}`,sub:"victorias–derrotas",color:"#f97316",icon:Trophy},
    {label:"Pts/Jgo",   value:avgPts,             sub:"media equipo",      color:"#3b82f6",icon:Activity},
    {label:"Reb/Jgo",   value:avgReb,             sub:"media equipo",      color:"#8b5cf6",icon:Target},
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
  const top5=[...active].sort((a,b)=>b.pts-a.pts).slice(0,5);
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};

  // Player attendance rates for summary
  const topAttendees=[...active].map(p=>({
    ...p,
    rate:datesWithData.length?Math.round(datesWithData.filter(d=>(attDates[d]||[]).includes(p.id)).length/datesWithData.length*100):0
  })).sort((a,b)=>b.rate-a.rate).slice(0,5);

  return <div>
    <SH title="Panel Principal" sub="CB Binissalem Senior A · Temporada 2024/25"/>
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
          <p style={{fontFamily:"DM Mono",fontSize:22,color:"#f97316",fontWeight:700,lineHeight:1}}>{p.pts}</p>
          <p style={{fontSize:10,color:th.muted,marginTop:3}}>pts/jgo</p>
        </div>)}
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   2. PLANTILLA — con edición de estadísticas
══════════════════════════════════════════════════════════ */
function Plantilla(){
  const{th}=useTheme();const{players,setPlayers}=useData();
  const[ed,setEd]=useState(null);const[ef,setEf]=useState({});
  const[sa,setSa]=useState(false);
  const[af,setAf]=useState({name:"",num:"",pos:"Base",active:true,pts:0,reb:0,ast:0,stl:0,blk:0,fg:0});
  const pos=["Base","Escolta","Alero","Ala-Pívot","Pívot"];
  const numF=["pts","reb","ast","stl","blk","fg"];
  const numL=["PTS","REB","AST","ROB","TAP","TC%"];
  const se=p=>{setEd(p.id);setEf({name:p.name,num:p.num,pos:p.pos,active:p.active,pts:p.pts,reb:p.reb,ast:p.ast,stl:p.stl,blk:p.blk,fg:p.fg});};
  const sv=()=>{setPlayers(prev=>prev.map(p=>p.id===ed?{...p,...ef,num:+ef.num,...Object.fromEntries(numF.map(k=>[k,+ef[k]]))}:p));setEd(null);};
  const dl=id=>setPlayers(prev=>prev.filter(p=>p.id!==id));
  const tg=id=>setPlayers(prev=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));
  const add=()=>{if(!af.name||!af.num)return;const id=Math.max(0,...players.map(p=>p.id))+1;setPlayers(prev=>[...prev,{id,...af,num:+af.num,...Object.fromEntries(numF.map(k=>[k,+af[k]]))}]);setAf({name:"",num:"",pos:"Base",active:true,pts:0,reb:0,ast:0,stl:0,blk:0,fg:0});setSa(false);};

  return <div>
    <SH title="Plantilla" sub="Gestión de jugadores y estadísticas" right={<Btn onClick={()=>{setSa(!sa);setEd(null);}} icon={<Plus size={14}/>}>Añadir Jugador</Btn>}/>

    {/* Formulario nuevo jugador */}
    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Jugador</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 90px 150px",gap:12,marginBottom:12}}>
        <div><Lbl>Nombre completo</Lbl><input value={af.name} onChange={e=>setAf(f=>({...f,name:e.target.value}))} placeholder="Nombre"/></div>
        <div><Lbl>Dorsal</Lbl><input type="number" value={af.num} onChange={e=>setAf(f=>({...f,num:e.target.value}))}/></div>
        <div><Lbl>Posición</Lbl><select value={af.pos} onChange={e=>setAf(f=>({...f,pos:e.target.value}))}>{pos.map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Estadísticas por partido</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
        {numF.map((k,i)=><div key={k}><Lbl>{numL[i]}</Lbl><input type="number" step="0.1" value={af[k]} onChange={e=>setAf(f=>({...f,[k]:e.target.value}))}/></div>)}
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    {/* Panel de edición de estadísticas — se muestra debajo de la tabla cuando se edita */}
    {ed&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640",borderWidth:2}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:16,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>
        Editando: {ef.name} · #{ef.num}
      </p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 90px 150px",gap:12,marginBottom:14}}>
        <div><Lbl>Nombre completo</Lbl><input value={ef.name} onChange={e=>setEf(f=>({...f,name:e.target.value}))}/></div>
        <div><Lbl>Dorsal</Lbl><input type="number" value={ef.num} onChange={e=>setEf(f=>({...f,num:e.target.value}))}/></div>
        <div><Lbl>Posición</Lbl><select value={ef.pos} onChange={e=>setEf(f=>({...f,pos:e.target.value}))}>{pos.map(p=><option key={p}>{p}</option>)}</select></div>
      </div>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Estadísticas por partido</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:10,marginBottom:14}}>
        {numF.map((k,i)=><div key={k}>
          <Lbl>{numL[i]}</Lbl>
          <input type="number" step="0.1" value={ef[k]} onChange={e=>setEf(f=>({...f,[k]:e.target.value}))}/>
        </div>)}
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Btn onClick={sv}>Guardar cambios</Btn>
        <Btn onClick={()=>setEd(null)} variant="ghost">Cancelar</Btn>
        <div onClick={()=>tg(ed)} style={{marginLeft:"auto",display:"inline-flex",alignItems:"center",gap:5,cursor:"pointer",padding:"5px 14px",borderRadius:6,background:ef.active?"rgba(239,68,68,.1)":"rgba(16,185,129,.1)",border:`1px solid ${ef.active?"rgba(239,68,68,.3)":"rgba(16,185,129,.3)"}`}}>
          <span style={{fontFamily:"DM Mono",fontSize:11,color:ef.active?"#ef4444":"#10b981",fontWeight:600}}>{ef.active?"Dar de baja":"Activar"}</span>
        </div>
      </div>
    </div>}

    {/* Tabla de jugadores */}
    <div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:750}}>
        <thead><tr style={{background:th.tableHead}}>
          {["#","Nombre","Pos","PTS","REB","AST","ROB","TAP","TC%","Estado",""].map((h,i)=><th key={i} style={{padding:"10px 12px",textAlign:i>2&&i<9?"right":"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {players.map(p=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`,background:ed===p.id?"rgba(249,115,22,.05)":"transparent"}}>
            <td style={{padding:"10px 12px"}}><div style={{width:30,height:30,borderRadius:15,background:p.active?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:"#fff"}}>{p.num}</div></td>
            <td style={{padding:"10px 12px",fontSize:13,color:p.active?th.text:th.muted,whiteSpace:"nowrap"}}>{p.name}</td>
            <td style={{padding:"10px 12px"}}><Badge color={POC[p.pos]||"#64748b"} sm>{p.pos}</Badge></td>
            {numF.map(k=><td key={k} style={{padding:"10px 10px",textAlign:"right",fontFamily:"DM Mono",fontSize:12,color:th.text}}>{p[k]}</td>)}
            <td style={{padding:"10px 12px"}}><span style={{fontFamily:"DM Mono",fontSize:11,color:p.active?"#10b981":"#ef4444",fontWeight:600}}>{p.active?"Activo":"Baja"}</span></td>
            <td style={{padding:"10px 12px"}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button onClick={()=>ed===p.id?setEd(null):se(p)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,border:`1px solid ${ed===p.id?"#f97316":th.border2}`,background:ed===p.id?"rgba(249,115,22,.1)":th.card2,cursor:"pointer",color:ed===p.id?"#f97316":th.sub,fontSize:11,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                  <Edit2 size={11}/>{ed===p.id?"Cerrar":"Editar"}
                </button>
                <Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>dl(p.id)}/>
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   3. PARTIDOS
══════════════════════════════════════════════════════════ */
function Partidos(){
  const{th}=useTheme();const{matches,setMatches}=useData();
  const[sa,setSa]=useState(false);const[f,setF]=useState({date:"",rival:"",location:"Casa",pts_us:"",pts_them:""});
  const w=matches.filter(m=>m.pts_us>m.pts_them).length;const l=matches.filter(m=>m.pts_us<=m.pts_them).length;
  const af=matches.length?(matches.reduce((a,m)=>a+m.pts_us,0)/matches.length).toFixed(1):"—";
  const aa=matches.length?(matches.reduce((a,m)=>a+m.pts_them,0)/matches.length).toFixed(1):"—";
  const add=()=>{if(!f.date||!f.rival||f.pts_us===""||f.pts_them==="")return;const id=matches.length?Math.max(...matches.map(m=>m.id))+1:1;setMatches(prev=>[...prev,{id,...f,pts_us:+f.pts_us,pts_them:+f.pts_them}]);setF({date:"",rival:"",location:"Casa",pts_us:"",pts_them:""});setSa(false);};
  const ks=[{label:"Record",value:`${w}–${l}`,color:"#f97316"},{label:"Pts a favor",value:af,color:"#10b981"},{label:"Pts en contra",value:aa,color:"#ef4444"},{label:"Partidos",value:matches.length,color:"#3b82f6"}];
  return <div>
    <SH title="Partidos" sub="Resultados y estadísticas" right={<Btn onClick={()=>setSa(!sa)} icon={<Plus size={14}/>}>Añadir Partido</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{ks.map(k=><div key={k.label} className="card" style={{padding:"18px 20px"}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</p><p style={{fontFamily:"DM Mono",fontSize:32,color:k.color,fontWeight:700,lineHeight:1}}>{k.value}</p></div>)}</div>
    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Partido</p>
      <div style={{display:"grid",gridTemplateColumns:"150px 1fr 130px 80px 80px",gap:12,marginBottom:12}}>
        <div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))}/></div>
        <div><Lbl>Rival</Lbl><input value={f.rival} onChange={e=>setF(x=>({...x,rival:e.target.value}))} placeholder="Nombre del rival"/></div>
        <div><Lbl>Lugar</Lbl><select value={f.location} onChange={e=>setF(x=>({...x,location:e.target.value}))}><option>Casa</option><option>Fuera</option></select></div>
        <div><Lbl>Nos.</Lbl><input type="number" value={f.pts_us} onChange={e=>setF(x=>({...x,pts_us:e.target.value}))} placeholder="00"/></div>
        <div><Lbl>Riv.</Lbl><input type="number" value={f.pts_them} onChange={e=>setF(x=>({...x,pts_them:e.target.value}))} placeholder="00"/></div>
      </div>
      <div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div>
    </div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {matches.length===0&&<div className="card" style={{padding:48,textAlign:"center"}}><Trophy size={36} color={th.muted} style={{margin:"0 auto 14px",display:"block"}}/><p style={{color:th.muted,fontSize:14}}>No hay partidos registrados</p></div>}
      {[...matches].reverse().map(m=>{const win=m.pts_us>m.pts_them;const c=win?"#10b981":"#ef4444";const d=m.pts_us-m.pts_them;return <div key={m.id} className="card" style={{padding:"16px 20px",borderLeft:`4px solid ${c}`,display:"flex",alignItems:"center",gap:20}}>
        <div style={{minWidth:58,textAlign:"center"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted,marginBottom:4}}>{m.date}</p><Badge color={c} sm>{win?"VICTORIA":"DERROTA"}</Badge></div>
        <div style={{flex:1}}><p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,lineHeight:1,marginBottom:3}}>{m.rival}</p><p style={{fontSize:11,color:th.muted}}>{m.location} · {d>0?"+":""}{d} pts diferencia</p></div>
        <p style={{fontFamily:"DM Mono",fontSize:28,fontWeight:700,color:c,lineHeight:1}}>{m.pts_us}<span style={{color:th.muted,fontSize:16}}>–</span>{m.pts_them}</p>
        <Trash2 size={14} color="#ef4444" style={{cursor:"pointer",flexShrink:0}} onClick={()=>setMatches(prev=>prev.filter(x=>x.id!==m.id))}/>
      </div>;})}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   4. PLANIFICACIÓN
══════════════════════════════════════════════════════════ */
function Planificacion(){
  const{th}=useTheme();const[tab,setTab]=useState("meso");
  return <div>
    <SH title="Planificación" sub="Estructura temporal y carga semanal"/>
    <TB tabs={[["meso","Mesociclos"],["micro","Microciclo Semanal"]]} active={tab} onChange={setTab}/>
    {tab==="meso"?<>
      <div className="card" style={{padding:22,marginBottom:14}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Timeline de Temporada</p>
        <div style={{display:"flex",height:46,gap:2,borderRadius:8,overflow:"hidden"}}>{MESOS.map(m=><div key={m.id} style={{flex:m.weeks,background:m.color+"22",border:`1px solid ${m.color}40`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Barlow Condensed",fontSize:10,color:m.color,fontWeight:700,textTransform:"uppercase"}}>{m.name.split(" ")[0]}</span></div>)}</div>
      </div>
      {MESOS.map(m=><div key={m.id} className="card" style={{padding:20,marginBottom:10,borderLeft:`4px solid ${m.color}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><h3 style={{fontFamily:"Barlow Condensed",fontSize:21,fontWeight:700,color:th.text}}>{m.name}</h3><Badge color={m.color}>{m.type}</Badge></div><p style={{fontSize:13,color:th.sub}}>{m.goal}</p></div><div style={{textAlign:"right"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{m.s} — {m.e}</p><p style={{fontFamily:"DM Mono",fontSize:26,color:m.color,fontWeight:700,lineHeight:1.1}}>{m.weeks}<span style={{fontSize:12,color:th.muted}}> sem</span></p></div></div>
        <div style={{display:"flex",gap:4,marginTop:14,flexWrap:"wrap"}}>{Array.from({length:m.weeks},(_,i)=><div key={i} style={{width:28,height:28,borderRadius:5,background:m.color+"18",border:`1px solid ${m.color}38`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"DM Mono",fontSize:9,color:m.color}}>{i+1}</span></div>)}</div>
      </div>)}
    </>:<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:14}}>
        {MICRO_DAYS.map((day,i)=>{const m=MICRO[i];return <div key={day} className="card" style={{padding:16,borderTop:`3px solid ${m.color}`}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{day}</p>
          <p style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:700,color:m.color,marginBottom:4}}>{m.type}</p>
          <p style={{fontSize:11,color:th.sub,marginBottom:10,lineHeight:1.4}}>{m.focus}</p>
          <Badge color={m.color} sm>{m.intens}</Badge>
        </div>;})}
      </div>
      <div className="card" style={{padding:20}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Carga Semanal</p>
        <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60}}>{ML.map((h,i)=><div key={i} style={{flex:1,background:MICRO[i].color,height:`${h}%`,borderRadius:"4px 4px 0 0",opacity:.72,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.72}/>)}</div>
        <div style={{display:"flex",marginTop:6}}>{MICRO_DAYS.map(d=><div key={d} style={{flex:1,textAlign:"center",fontSize:9,color:th.muted,fontFamily:"DM Mono"}}>{d}</div>)}</div>
      </div>
    </>}
  </div>;
}

/* ══════════════════════════════════════════════════════════
   5. ESTADÍSTICAS
══════════════════════════════════════════════════════════ */
function Estadisticas(){
  const{th}=useTheme();const{players}=useData();const[sb,setSb]=useState("pts");
  const cols=[{key:"pts",lbl:"PTS"},{key:"reb",lbl:"REB"},{key:"ast",lbl:"AST"},{key:"stl",lbl:"ROB"},{key:"blk",lbl:"TAP"},{key:"fg",lbl:"TC%"}];
  const sorted=[...players.filter(p=>p.active)].sort((a,b)=>b[sb]-a[sb]);
  const cd=sorted.slice(0,8).map(p=>({name:p.name.split(" ")[0].slice(0,8),val:p[sb]}));
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};
  return <div>
    <SH title="Estadísticas" sub="Medias individuales por partido"/>
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1}}>Ranking visual</p>
        <div style={{display:"flex",gap:6}}>{cols.map(c=><button key={c.key} onClick={()=>setSb(c.key)} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Barlow Condensed",background:sb===c.key?"#f97316":th.card2,color:sb===c.key?"#fff":th.sub,transition:"all .15s"}}>{c.lbl}</button>)}</div>
      </div>
      <ResponsiveContainer width="100%" height={155}><BarChart data={cd} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/><XAxis dataKey="name" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Bar dataKey="val" fill="#f97316" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
    </div>
    <div className="card" style={{overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:th.tableHead}}>
          <th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>#</th>
          <th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Jugador</th>
          <th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Pos</th>
          {cols.map(c=><th key={c.key} onClick={()=>setSb(c.key)} style={{padding:"11px 14px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,cursor:"pointer",color:sb===c.key?"#f97316":th.muted}}>{c.lbl}</th>)}
        </tr></thead>
        <tbody>{sorted.map((p,i)=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`,background:i===0?"rgba(249,115,22,.04)":"transparent"}}>
          <td style={{padding:"10px 16px",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{i+1}</td>
          <td style={{padding:"10px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:14,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:i===0?"#fff":th.sub,flexShrink:0}}>{p.num}</div><span style={{fontSize:13,color:th.text}}>{p.name}</span></div></td>
          <td style={{padding:"10px 16px",fontSize:12,color:th.sub}}>{p.pos}</td>
          {cols.map(c=><td key={c.key} style={{padding:"10px 14px",textAlign:"right",fontFamily:"DM Mono",fontSize:13,color:sb===c.key?"#f97316":th.text,fontWeight:sb===c.key?700:400}}>{p[c.key]}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   6. ENTRENAMIENTOS — con notas y exportar PDF
══════════════════════════════════════════════════════════ */
function Entrenamientos(){
  const{th}=useTheme();const{sessions,setSessions}=useData();
  const[exp,setExp]=useState(null);const[add,setAdd]=useState(false);
  const[editNotes,setEditNotes]=useState(null);const[notesVal,setNotesVal]=useState("");
  const[f,setF]=useState({date:"",type:"Técnico",dur:90,title:"",exs:"",notes:""});
  const save=()=>{if(!f.title||!f.date)return;const id=sessions.length?Math.max(...sessions.map(s=>s.id))+1:1;setSessions(p=>[...p,{id,...f,dur:+f.dur,exs:f.exs.split("\n").filter(Boolean)}]);setAdd(false);setF({date:"",type:"Técnico",dur:90,title:"",exs:"",notes:""});};
  const saveNotes=sid=>{setSessions(prev=>prev.map(s=>s.id===sid?{...s,notes:notesVal}:s));setEditNotes(null);};

  return <div>
    <SH title="Entrenamientos" sub="Mar · Mié · Jue · Vie — desde el 7 de abril" right={<Btn onClick={()=>setAdd(true)} icon={<Plus size={14}/>}>Nueva Sesión</Btn>}/>
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
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sessions.map(s=>{const c=TC[s.type]||"#f97316";const op=exp===s.id;return <div key={s.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:12,padding:"16px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setExp(op?null:s.id)}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{minWidth:52,textAlign:"center"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{s.date}</p><p style={{fontFamily:"DM Mono",fontSize:13,color:c,fontWeight:700}}>{s.dur}'</p></div>
            <div><h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:4}}>{s.title}</h4><div style={{display:"flex",gap:6,alignItems:"center"}}><Badge color={c}>{s.type}</Badge>{s.notes&&<span style={{fontSize:10,color:th.muted}}>📝 con notas</span>}</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button title="Exportar PDF" onClick={e=>{e.stopPropagation();exportSessionPDF(s);}} style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Printer size={13}/></button>
            <Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSessions(p=>p.filter(x=>x.id!==s.id));}}/>
            <ChevronRight size={15} color={th.muted} style={{transform:op?"rotate(90deg)":"none",transition:"transform .2s"}}/>
          </div>
        </div>
        {op&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${th.border}`}}>
          {/* Notas */}
          {editNotes===s.id?(
            <div style={{marginBottom:14}}>
              <Lbl>Notas del entrenador</Lbl>
              <textarea rows={4} value={notesVal} onChange={e=>setNotesVal(e.target.value)} placeholder="Observaciones, incidencias, ajustes tácticos, rendimiento del equipo…" style={{marginBottom:8}}/>
              <div style={{display:"flex",gap:8}}><Btn onClick={()=>saveNotes(s.id)} sm>Guardar notas</Btn><Btn onClick={()=>setEditNotes(null)} variant="ghost" sm>Cancelar</Btn></div>
            </div>
          ):(
            <div style={{marginBottom:12}}>
              {s.notes?<div style={{background:c+"0f",borderLeft:`3px solid ${c}`,padding:"8px 12px",borderRadius:4,marginBottom:8,fontSize:12,color:th.sub,lineHeight:1.6}}>
                <strong style={{color:c,fontFamily:"Barlow Condensed",fontSize:13}}>NOTAS</strong><br/>{s.notes}
              </div>:null}
              <button onClick={()=>{setEditNotes(s.id);setNotesVal(s.notes||"");}} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:11,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
                <Edit2 size={11}/>{s.notes?"Editar notas":"Añadir notas post-entreno"}
              </button>
            </div>
          )}
          {/* Ejercicios */}
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
  const{th}=useTheme();const{players,quintets,setQuintets}=useData();
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
    setAiLoading(true);setAiResult(null);
    const activePl=players.filter(p=>p.active);
    const statsStr=activePl.map(p=>`${p.name} (${p.pos}): PTS ${p.pts} REB ${p.reb} AST ${p.ast} ROB ${p.stl} TAP ${p.blk} TC% ${p.fg}`).join("\n");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:`Eres un analista de baloncesto. Tengo estos jugadores con sus estadísticas:\n\n${statsStr}\n\nSugiere 2 quintetos:\n1. QUINTETO OFENSIVO: Los 5 mejores para atacar (máxima anotación, asistencias y porcentaje)\n2. QUINTETO DEFENSIVO: Los 5 mejores para defender (máximos robos, tapones y rebotes)\n\nResponde en JSON: {"ofensivo":["nombre1","nombre2","nombre3","nombre4","nombre5"],"defensivo":["nombre1","nombre2","nombre3","nombre4","nombre5"],"razon_ofensivo":"explicación corta","razon_defensivo":"explicación corta"}`}]})});
      const data=await res.json();
      const txt=data.content.find(b=>b.type==="text")?.text||"{}";
      const clean=txt.replace(/```json|```/g,"").trim();
      setAiResult(JSON.parse(clean));
    }catch(e){setAiResult({error:"Error al generar. Inténtalo de nuevo."});}
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
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Plantilla</p>
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:280,overflowY:"auto"}}>
            {players.filter(p=>p.active).map(p=>{const a2=Object.values(lineup).some(l=>l?.id===p.id);return <div key={p.id} onClick={()=>!a2&&selected&&assign(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,background:a2?"rgba(16,185,129,.07)":th.card2,border:`1px solid ${a2?"rgba(16,185,129,.3)":th.border}`,cursor:selected&&!a2?"pointer":"default",opacity:a2?.65:1,transition:"all .15s"}}>
              <div style={{width:24,height:24,borderRadius:12,background:th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,color:th.sub,fontWeight:700,flexShrink:0}}>{p.num}</div>
              <div style={{flex:1}}><p style={{fontSize:12,color:th.text}}>{p.name}</p><p style={{fontSize:10,color:th.muted}}>{p.pos}</p></div>
              {a2&&<Check size={12} color="#10b981"/>}
            </div>;})}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   9. PLAYBOOK — con añadir jugadas + imágenes
══════════════════════════════════════════════════════════ */
function PlaybookForm({onSave,onCancel}){
  const{th}=useTheme();
  const[f,setF]=useState({name:"",cat:"Ataque",desc:"",tags:"",images:[]});
  const cats=["Ataque","Defensa","Especial"];
  const save=()=>{if(!f.name)return;const tags=f.tags.split(",").map(t=>t.trim()).filter(Boolean);onSave({...f,tags,id:Date.now()});};
  return <div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
    <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nueva Jugada</p>
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
  const{th}=useTheme();const{customPlays,setCustomPlays}=useData();
  const[filter,setFilter]=useState("Todos");const[showAdd,setShowAdd]=useState(false);const[viewImg,setViewImg]=useState(null);
  const[pdfLoading,setPdfLoading]=useState(false);const[pdfMsg,setPdfMsg]=useState(null);
  const cats=["Todos","Ataque","Defensa","Especial"];
  const allPlays=[...DEFAULT_PLAYS,...customPlays];
  const filtered=filter==="Todos"?allPlays:allPlays.filter(p=>p.cat===filter);
  const fr=useRef();

  const handlePDF=async e=>{
    const file=e.target.files[0];if(!file)return;
    setPdfLoading(true);setPdfMsg("Leyendo PDF con IA…");
    try{
      const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=ev=>res(ev.target.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        model:"claude-sonnet-4-20250514",max_tokens:2000,
        messages:[{role:"user",content:[
          {type:"document",source:{type:"base64",media_type:"application/pdf",data:base64}},
          {type:"text",text:`Este PDF es un documento de baloncesto con jugadas o sistemas. Extrae TODAS las jugadas/sistemas que encuentres y devuelve SOLO JSON válido sin explicaciones ni markdown:
{"jugadas":[{"nombre":"nombre jugada","categoria":"Ataque|Defensa|Especial","descripcion":"descripción clara de la jugada","etiquetas":["tag1","tag2"]}]}
Si no encuentras jugadas claras, devuelve {"jugadas":[]}`}
        ]}]
      })});
      const data=await resp.json();
      const txt=data.content?.find(b=>b.type==="text")?.text||"{}";
      const clean=txt.replace(/```json|```/g,"").trim();
      const parsed=JSON.parse(clean);
      const nuevas=(parsed.jugadas||[]).map(j=>({id:Date.now()+Math.random(),name:j.nombre||j.name||"Sin nombre",cat:j.categoria||j.cat||"Ataque",desc:j.descripcion||j.desc||"",tags:j.etiquetas||j.tags||[],images:[]}));
      if(nuevas.length>0){
        setCustomPlays(prev=>[...prev,...nuevas]);
        setPdfMsg(`✅ ${nuevas.length} jugada${nuevas.length>1?"s":""} importada${nuevas.length>1?"s":""} del PDF`);
      }else{setPdfMsg("⚠️ No se encontraron jugadas en el PDF. Prueba a crearlas manualmente.");}
    }catch(err){console.error(err);setPdfMsg("❌ Error al procesar el PDF. Inténtalo de nuevo.");}
    setPdfLoading(false);
    e.target.value="";
    setTimeout(()=>setPdfMsg(null),5000);
  };

  return <div>
    <SH title="Playbook" sub="Jugadas y sistemas de juego del equipo" right={<div style={{display:"flex",gap:8}}>
      <input ref={fr} type="file" accept=".pdf" style={{display:"none"}} onChange={handlePDF}/>
      <Btn onClick={()=>fr.current?.click()} variant="ghost" icon={pdfLoading?<Loader size={14} style={{animation:"spin 1s linear infinite"}}/>:<FileText size={14}/>} disabled={pdfLoading}>
        {pdfLoading?"Analizando…":"Importar PDF"}
      </Btn>
      <Btn onClick={()=>setShowAdd(true)} icon={<Plus size={14}/>}>Nueva Jugada</Btn>
    </div>}/>
    {pdfMsg&&<div style={{background:pdfMsg.startsWith("✅")?"rgba(16,185,129,.07)":pdfMsg.startsWith("⚠️")?"rgba(245,158,11,.07)":"rgba(239,68,68,.07)",border:`1px solid ${pdfMsg.startsWith("✅")?"rgba(16,185,129,.3)":pdfMsg.startsWith("⚠️")?"rgba(245,158,11,.3)":"rgba(239,68,68,.3)"}`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:th.text}}>{pdfMsg}</div>}
    {showAdd&&<PlaybookForm onSave={p=>{setCustomPlays(prev=>[...prev,p]);setShowAdd(false);}} onCancel={()=>setShowAdd(false)}/>}
    <div style={{display:"flex",gap:8,marginBottom:20}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(PC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(play=>{const c=PC[play.cat]||"#f97316";const isCustom=play.id>100;return <div key={play.id} className="card" style={{padding:20,borderTop:`3px solid ${c}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <h3 style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text}}>{play.name}</h3>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Badge color={c}>{play.cat}</Badge>
            {isCustom&&<Trash2 size={12} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>setCustomPlays(prev=>prev.filter(p=>p.id!==play.id))}/>}
          </div>
        </div>
        <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:12}}>{play.desc}</p>
        {(play.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {play.images.map((img,i)=><img key={i} src={img} alt="" onClick={()=>setViewImg(img)} style={{width:60,height:60,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}
        </div>}
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(play.tags||[]).map(t=><span key={t} style={{fontSize:10,color:th.muted,background:th.card2,padding:"2px 8px",borderRadius:4,border:`1px solid ${th.border}`}}>{t}</span>)}</div>
      </div>;})}
    </div>
  </div>;
}

/* ══════════════════════════════════════════════════════════
   10. EJERCICIOS — con añadir ejercicios + imágenes
══════════════════════════════════════════════════════════ */
function EjercicioForm({onSave,onCancel}){
  const{th}=useTheme();
  const[f,setF]=useState({name:"",cat:"Técnico",dur:"",diff:"Básico",desc:"",images:[]});
  const cats=["Técnico","Táctico","Físico","Recuperación","Mental"];
  const diffs=["Básico","Medio","Alto"];
  const save=()=>{if(!f.name)return;onSave({...f,id:Date.now()});};
  return <div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}>
    <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Ejercicio</p>
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

function Ejercicios(){
  const{th}=useTheme();const{customEx,setCustomEx}=useData();
  const[filter,setFilter]=useState("Todos");const[sel,setSel]=useState(null);const[showAdd,setShowAdd]=useState(false);const[viewImg,setViewImg]=useState(null);
  const cats=["Todos","Técnico","Táctico","Físico","Recuperación","Mental"];
  const allEx=[...DEFAULT_EJS,...customEx];
  const filtered=filter==="Todos"?allEx:allEx.filter(e=>e.cat===filter);

  return <div>
    <SH title="Ejercicios" sub="Biblioteca por categoría · Clic para ver descripción" right={<Btn onClick={()=>setShowAdd(true)} icon={<Plus size={14}/>}>Nuevo Ejercicio</Btn>}/>
    {showAdd&&<EjercicioForm onSave={e=>{setCustomEx(prev=>[...prev,e]);setShowAdd(false);}} onCancel={()=>setShowAdd(false)}/>}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {cats.map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:filter===c?(CC[c]||"#f97316"):th.card2,color:filter===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}
    </div>
    {viewImg&&<div onClick={()=>setViewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><img src={viewImg} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:8,objectFit:"contain"}}/></div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(ex=>{const c=CC[ex.cat]||"#f97316";const dc=DC[ex.diff]||"#10b981";const is=sel===ex.id;const isCustom=ex.id>100;return <div key={ex.id} className="card cl" onClick={()=>setSel(is?null:ex.id)} style={{padding:20,borderTop:`3px solid ${c}`,outline:is?`2px solid ${c}`:"none",outlineOffset:2}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1,marginRight:10}}>
            <h3 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:6}}>{ex.name}</h3>
            <div style={{display:"flex",gap:5}}><Badge color={c} sm>{ex.cat}</Badge><Badge color={dc} sm>{ex.diff}</Badge></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            {ex.dur&&<div style={{background:th.card2,borderRadius:7,padding:"4px 8px",border:`1px solid ${th.border}`}}><p style={{fontFamily:"DM Mono",fontSize:12,color:c,fontWeight:700}}>{ex.dur}</p></div>}
            {isCustom&&<Trash2 size={12} color="#ef4444" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setCustomEx(prev=>prev.filter(x=>x.id!==ex.id));}}/>}
          </div>
        </div>
        {is&&<>
          <p style={{fontSize:12,color:th.sub,lineHeight:1.6,marginBottom:10,paddingTop:10,borderTop:`1px solid ${th.border}`}}>{ex.desc}</p>
          {(ex.images||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {ex.images.map((img,i)=><img key={i} src={img} alt="" onClick={e=>{e.stopPropagation();setViewImg(img);}} style={{width:70,height:70,objectFit:"cover",borderRadius:6,cursor:"pointer",border:`1px solid ${th.border}`}}/>)}
          </div>}
        </>}
      </div>;})}
    </div>
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
  const[tool,setTool]=useState("arrow");const[color,setColor]=useState("#f97316");const[pNum,setPNum]=useState(1);
  const[step,setStep]=useState(0); // 0-3 = 4 pasos
  const[steps,setSteps]=useState([[],[],[],[]]); // elements per step
  const[hist,setHist]=useState([[],[],[],[]]);
  const dr=useRef(false),or=useRef(null);
  const[showSave,setShowSave]=useState(false);const[saveName,setSaveName]=useState("");
  const[selPlay,setSelPlay]=useState(null);

  const els=steps[step];
  const setEls=fn=>setSteps(prev=>{const n=[...prev];n[step]=typeof fn==="function"?fn(prev[step]):fn;return n;});

  const gp=e=>{const r=cr.current.getBoundingClientRect();return{x:(e.clientX-r.left)*(CW/r.width),y:(e.clientY-r.top)*(CH/r.height)};};
  const rd=useCallback((es,pv=null)=>{const ctx=cr.current?.getContext("2d");if(!ctx)return;ctx.clearRect(0,0,CW,CH);dCourt(ctx);es.forEach(el=>rEl(ctx,el,false));if(pv)rEl(ctx,pv,true);},[]);
  useEffect(()=>rd(els),[els,rd,step]);

  const oD=e=>{const p=gp(e);if(tool==="player"){const el={type:"player",x:p.x,y:p.y,color,num:pNum};setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});setEls(ps=>[...ps,el]);setPNum(n=>n<15?n+1:1);return;}or.current=p;dr.current=true;};
  const oM=e=>{if(!dr.current||!or.current)return;const p=gp(e);rd(els,{type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color});};
  const oU=e=>{if(!dr.current||!or.current)return;const p=gp(e);if(Math.abs(p.x-or.current.x)>5||Math.abs(p.y-or.current.y)>5){const el={type:tool,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color};setHist(h=>{const n=[...h];n[step]=[...n[step],els];return n;});setEls(ps=>[...ps,el]);}dr.current=false;or.current=null;};
  const undo=()=>{const h=hist[step];if(!h||!h.length)return;const prev=h[h.length-1];setHist(hh=>{const n=[...hh];n[step]=n[step].slice(0,-1);return n;});setEls(prev);};
  const clr=()=>{setHist(hh=>{const n=[...hh];n[step]=[...n[step],els];return n;});setEls([]);};

  const savePlay=()=>{if(!saveName)return;const id=Date.now();setSavedDrawings(prev=>[...prev,{id,name:saveName,steps:steps.map(s=>[...s])}]);setSaveName("");setShowSave(false);};
  const loadPlay=play=>{setSteps(play.steps.map(s=>[...s]));setHist([[],[],[],[]]);setSelPlay(null);};

  const tools=[{id:"line",icon:"—",label:"Línea",sub:"Continua"},{id:"arrow",icon:"→",label:"Flecha",sub:"Movimiento"},{id:"dash",icon:"╌╌",label:"Pase",sub:"Discontinua"},{id:"player",icon:"①",label:"Jugador",sub:"Numerado"}];

  return <div>
    <SH title="Pizarra" sub="4 pasos por jugada · Guarda jugadas para reutilizarlas"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
      <div className="card" style={{padding:16}}>
        {/* Step tabs */}
        <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"center"}}>
          <span style={{fontSize:11,color:th.muted,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase",marginRight:4}}>Paso:</span>
          {[0,1,2,3].map(i=><button key={i} onClick={()=>setStep(i)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${step===i?"#f97316":th.border2}`,background:step===i?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,fontSize:14,color:step===i?"#f97316":th.sub,transition:"all .15s",position:"relative"}}>
            {i+1}
            {steps[i].length>0&&<span style={{position:"absolute",top:-3,right:-3,width:8,height:8,borderRadius:4,background:"#f97316"}}/>}
          </button>)}
          <div style={{flex:1}}/>
          <button onClick={()=>{setSaveName("");setShowSave(!showSave);}} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:7,border:"1px solid rgba(16,185,129,.4)",background:"rgba(16,185,129,.07)",cursor:"pointer",color:"#10b981",fontSize:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}><Save size={12}/>Guardar jugada</button>
        </div>
        {showSave&&<div style={{display:"flex",gap:8,marginBottom:12}}>
          <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="Nombre de la jugada…" style={{flex:1}}/>
          <Btn onClick={savePlay} sm>Guardar</Btn>
          <Btn onClick={()=>setShowSave(false)} variant="ghost" sm>✗</Btn>
        </div>}
        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:5}}>{tools.map(t=><button key={t.id} onClick={()=>setTool(t.id)} title={t.label} style={{height:34,padding:"0 10px",borderRadius:8,border:`1px solid ${tool===t.id?"#f97316":th.border2}`,background:tool===t.id?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontSize:14,color:tool===t.id?"#f97316":th.sub,transition:"all .15s",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t.icon}</button>)}</div>
          <div style={{width:1,height:26,background:th.border2}}/>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>{DC2.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:20,height:20,borderRadius:10,background:c,cursor:"pointer",border:`2px solid ${color===c?"#fff":"transparent"}`,outline:color===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}</div>
          {tool==="player"&&<><div style={{width:1,height:26,background:th.border2}}/><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:10,color:th.muted,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase"}}>Nº</span><button onClick={()=>setPNum(n=>Math.max(1,n-1))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button><span style={{fontFamily:"DM Mono",fontSize:14,color:"#f97316",minWidth:20,textAlign:"center",fontWeight:700}}>{pNum}</span><button onClick={()=>setPNum(n=>Math.min(15,n+1))} style={{width:24,height:24,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div></>}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <button onClick={undo} disabled={!(hist[step]||[]).length} style={{width:32,height:32,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub,opacity:(hist[step]||[]).length?1:.35}}><RotateCcw size={13}/></button>
            <button onClick={clr} style={{width:32,height:32,borderRadius:7,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={13}/></button>
          </div>
        </div>
        <div style={{borderRadius:8,overflow:"hidden",lineHeight:0,border:`1px solid ${th.border}`}}>
          <canvas ref={cr} width={CW} height={CH} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair",touchAction:"none"}} onMouseDown={oD} onMouseMove={oM} onMouseUp={oU} onMouseLeave={()=>{if(dr.current){dr.current=false;or.current=null;rd(els);}}}/>
        </div>
        <p style={{fontSize:11,color:th.muted,marginTop:8}}>Paso {step+1}/4 · {els.length} elementos · Navega entre pasos para mostrar secuencias de movimiento</p>
      </div>

      {/* Sidebar */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div className="card" style={{padding:16}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Herramientas</p>
          {tools.map(t=><div key={t.id} onClick={()=>setTool(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,cursor:"pointer",background:tool===t.id?"rgba(249,115,22,.1)":th.card2,border:`1px solid ${tool===t.id?"#f97316":th.border}`,marginBottom:6,transition:"all .15s"}}>
            <span style={{fontSize:16,color:tool===t.id?"#f97316":th.sub,minWidth:22,textAlign:"center"}}>{t.icon}</span>
            <div><p style={{fontSize:13,fontFamily:"Barlow Condensed",fontWeight:700,color:tool===t.id?"#f97316":th.text}}>{t.label}</p><p style={{fontSize:10,color:th.muted}}>{t.sub}</p></div>
          </div>)}
        </div>

        {/* Saved plays */}
        <div className="card" style={{padding:16,flex:1}}>
          <p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Jugadas Guardadas</p>
          {savedDrawings.length===0?<p style={{fontSize:11,color:th.muted}}>No hay jugadas guardadas aún</p>:
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:250,overflowY:"auto"}}>
            {savedDrawings.map(play=><div key={play.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:th.card2,border:`1px solid ${th.border}`}}>
              <div style={{flex:1}}>
                <p style={{fontSize:12,color:th.text,fontFamily:"Barlow Condensed",fontWeight:700}}>{play.name}</p>
                <p style={{fontSize:10,color:th.muted}}>{play.steps.filter(s=>s.length>0).length} pasos</p>
              </div>
              <button onClick={()=>loadPlay(play)} title="Cargar" style={{width:26,height:26,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Copy size={11}/></button>
              <button onClick={()=>setSavedDrawings(prev=>prev.filter(p=>p.id!==play.id))} style={{width:26,height:26,borderRadius:6,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={11}/></button>
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
   NAV + APP ROOT
══════════════════════════════════════════════════════════ */
const NAV=[
  {id:"dashboard",label:"Panel",         icon:LayoutDashboard},
  {id:"plantilla",label:"Plantilla",     icon:Users},
  {id:"partidos", label:"Partidos",      icon:Trophy},
  {id:"plan",     label:"Planificación", icon:Calendar},
  {id:"stats",    label:"Estadísticas",  icon:BarChart2},
  {id:"train",    label:"Entrenamientos",icon:Dumbbell},
  {id:"attend",   label:"Asistencia",    icon:Check},
  {id:"lineup",   label:"Quinteto",      icon:Shield},
  {id:"playbook", label:"Playbook",      icon:BookOpen},
  {id:"exercises",label:"Ejercicios",    icon:Target},
  {id:"pizarra",  label:"Pizarra",       icon:PenTool},
  {id:"recursos", label:"Recursos",      icon:Link},
];
const VIEWS={dashboard:Dashboard,plantilla:Plantilla,partidos:Partidos,plan:Planificacion,stats:Estadisticas,train:Entrenamientos,attend:Asistencia,lineup:Quinteto,playbook:Playbook,exercises:Ejercicios,pizarra:Pizarra,recursos:Recursos};

export default function App(){
  const[dark,setDarkRaw]=useState(true);const[view,setView]=useState("dashboard");
  const[loading,setLoading]=useState(true);const[sync,setSync]=useState("loading");

  const[players,   setPlayersRaw]  = useState(DP);
  const[matches,   setMatchesRaw]  = useState(DM);
  const[sessions,  setSessionsRaw] = useState(DS);
  const[attDates,  setAttDatesRaw] = useState(DA);
  const[quintets,  setQuintetsRaw] = useState(DEFAULT_QUINTETS);
  const[recursos,  setRecursosRaw] = useState(DEFAULT_RECURSOS);
  const[customEx,  setCustomExRaw] = useState([]);
  const[customPlays,setCustomPlaysRaw]=useState([]);
  const[savedDrawings,setSavedDrawingsRaw]=useState([]);

  const stRef=useRef({players:DP,matches:DM,sessions:DS,attDates:DA,quintets:DEFAULT_QUINTETS,recursos:DEFAULT_RECURSOS,customEx:[],customPlays:[],savedDrawings:[],dark:true});
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
  const setCustomPlays=useCallback(fn=>setCustomPlaysRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({customPlays:n});return n;}),[persist]);
  const setSavedDrawings=useCallback(fn=>setSavedDrawingsRaw(prev=>{const n=typeof fn==="function"?fn(prev):fn;persist({savedDrawings:n});return n;}),[persist]);

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
          if(d.customEx)  {setCustomExRaw(d.customEx);  stRef.current.customEx=d.customEx;}
          if(d.customPlays){setCustomPlaysRaw(d.customPlays);stRef.current.customPlays=d.customPlays;}
          if(d.savedDrawings){setSavedDrawingsRaw(d.savedDrawings);stRef.current.savedDrawings=d.savedDrawings;}
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
        if(d.customEx)   setCustomExRaw(d.customEx);
        if(d.customPlays)setCustomPlaysRaw(d.customPlays);
        if(d.savedDrawings)setSavedDrawingsRaw(d.savedDrawings);
        if(d.dark!==undefined)setDarkRaw(d.dark);
        setSync("saved");
      }).subscribe();
    return()=>sb.removeChannel(sub);
  },[]);

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
      <DataCtx.Provider value={{players,setPlayers,matches,setMatches,sessions,setSessions,attDates,setAttDates,quintets,setQuintets,recursos,setRecursos,customEx,setCustomEx,customPlays,setCustomPlays,savedDrawings,setSavedDrawings}}>
        <GS th={th}/>
        <div style={{display:"flex",height:"100vh",overflow:"hidden",background:th.bg}}>
          <aside style={{width:222,flexShrink:0,background:th.nav,display:"flex",flexDirection:"column",height:"100vh",overflowY:"auto",borderRight:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{padding:"20px 20px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:15,fontWeight:900,color:"#fff",letterSpacing:-.5,flexShrink:0}}>CB</div>
                <div><p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:800,color:"#f1f5f9",letterSpacing:.5,lineHeight:1.1}}>Binissalem</p><p style={{fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"DM Mono"}}>Sénior A · 2024/25</p></div>
              </div>
              <div style={{marginTop:12}}><SyncBadge status={sync}/></div>
            </div>
            <div style={{height:1,background:"rgba(255,255,255,.07)",margin:"0 14px 6px"}}/>
            <nav style={{flex:1,padding:"4px 0"}}>
              {NAV.map(item=>{const Icon=item.icon;const ac=view===item.id;return(
                <div key={item.id} onClick={()=>setView(item.id)} className={`nav-item${ac?" active":""}`}>
                  <Icon size={15} color={ac?"#f97316":"rgba(255,255,255,.32)"}/>
                  <span style={{fontFamily:"Barlow Condensed",fontSize:14,fontWeight:ac?700:500,color:ac?"#f97316":"rgba(255,255,255,.42)",letterSpacing:.4}}>{item.label}</span>
                </div>
              );})}
            </nav>
            <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.07)"}}>
              <div onClick={()=>setDark(d=>!d)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"9px 12px",borderRadius:8,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.09)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.05)"}>
                {dark?<Sun size={14} color="#f59e0b"/>:<Moon size={14} color="#8b5cf6"/>}
                <span style={{fontFamily:"Barlow Condensed",fontSize:13,color:"rgba(255,255,255,.45)",fontWeight:600}}>{dark?"Modo Claro":"Modo Oscuro"}</span>
                <div style={{marginLeft:"auto",width:28,height:16,borderRadius:8,background:dark?"rgba(255,255,255,.12)":"#f97316",position:"relative",transition:"background .2s"}}><div style={{position:"absolute",top:2,left:dark?2:12,width:12,height:12,borderRadius:6,background:"#fff",transition:"left .2s"}}/></div>
              </div>
            </div>
          </aside>
          <main style={{flex:1,overflowY:"auto",padding:"28px 32px",background:th.bg}}><AV/></main>
        </div>
      </DataCtx.Provider>
    </ThemeCtx.Provider>
  );
}
