// CB BINISSALEM DASHBOARD — Supabase edition
// Sync en tiempo real entre todos los dispositivos

import { useState, useRef, useEffect, useCallback, useContext, createContext } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard, Calendar, BarChart2, Dumbbell, Users, BookOpen,
  PenTool, Sun, Moon, Plus, Check, X, Activity, Target, Upload,
  ChevronRight, Trash2, RotateCcw, Edit2, Trophy, Shield, Wifi,
  WifiOff, Loader, Link, Search, Tag, ExternalLink, Globe
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ═══════════════════════════════════════════════════════════════
   SUPABASE
═══════════════════════════════════════════════════════════════ */
const sb = createClient(
  "https://ckznrzmuxwbuixrbjsnw.supabase.co",
  "sb_publishable_Tz9Qvz8a-FxqN3Vp0PdbKw_Qzzp4cZ5"
);

/* ═══════════════════════════════════════════════════════════════
   CONTEXTS
═══════════════════════════════════════════════════════════════ */
const ThemeCtx = createContext();
const useTheme = () => useContext(ThemeCtx);
const DataCtx  = createContext();
const useData  = () => useContext(DataCtx);

const DARK = {
  bg:"#07070f",card:"#111120",card2:"#181828",nav:"#09091a",
  border:"#1f1f38",border2:"#252542",text:"#e2e8f0",sub:"#64748b",
  muted:"#374151",accent:"#f97316",mode:"dark",
  tableHead:"#0e0e1f",rowHover:"rgba(249,115,22,.04)",inputBg:"#181828",
};
const LIGHT = {
  bg:"#f0f2f5",card:"#ffffff",card2:"#f8fafc",nav:"#1e293b",
  border:"#e2e8f0",border2:"#cbd5e1",text:"#0f172a",sub:"#64748b",
  muted:"#94a3b8",accent:"#f97316",mode:"light",
  tableHead:"#f8fafc",rowHover:"rgba(249,115,22,.04)",inputBg:"#ffffff",
};

/* ═══════════════════════════════════════════════════════════════
   DATOS INICIALES
═══════════════════════════════════════════════════════════════ */
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
  {id:1,date:"08/04/25",type:"Técnico-Táctico",dur:90,title:"Presentación + Ataque posicional",exs:["Calentamiento 15'","Sistemas ofensivos 40'","5v5 restringido 25'","Vuelta calma 10'"]},
  {id:2,date:"10/04/25",type:"Físico",          dur:75,title:"Fuerza general + Resistencia",     exs:["Activación 10'","Circuito fuerza 30'","Carrera aeróbica 20'","Estiramientos 15'"]},
  {id:3,date:"11/04/25",type:"Técnico",         dur:60,title:"Tiro individual + Bote",           exs:["Calentamiento 10'","Spot shooting 20'","Bote y finalizaciones 20'","Tiro libre 10'"]},
  {id:4,date:"15/04/25",type:"Táctico",         dur:90,title:"Defensa individual + Press 2-2-1", exs:["Calentamiento 10'","1v1 defensivo 20'","Press 2-2-1 25'","Situaciones partido 30'","Vuelta 5'"]},
  {id:5,date:"17/04/25",type:"Físico",          dur:75,title:"Potencia + Velocidad específica",  exs:["Activación 10'","Sprints 20'","Saltos reactivos 15'","Circuito balón 20'","Estiramientos 10'"]},
  {id:6,date:"18/04/25",type:"Técnico-Táctico",dur:90,title:"Pick & Roll + Cortes sin balón",   exs:["Calentamiento 10'","Pick & Roll 2v2 25'","Cortes backdoor 20'","5v5 completo 30'","Vuelta calma 5'"]},
];
const DM = [
  {id:1,date:"12/04/25",rival:"CB Inca A",       location:"Casa",  pts_us:78,pts_them:65},
  {id:2,date:"19/04/25",rival:"Bàsquet Lloseta", location:"Fuera", pts_us:72,pts_them:70},
  {id:3,date:"26/04/25",rival:"CB Pollença A",   location:"Casa",  pts_us:81,pts_them:75},
];
const DA = {
  1:[1,2,3,4,5,6,7,8,9,10,12],2:[1,2,3,5,6,7,8,9,10,12],
  3:[1,2,3,4,5,7,8,10,12],    4:[1,2,4,5,6,7,8,9,10,12],
  5:[1,3,4,5,6,8,9,10,12],    6:[1,2,3,4,5,6,7,8,9,10,11,12],
};
const DR = [
  {id:1,title:"FastModel Sports",        url:"https://fastmodelsports.com",         desc:"Base de datos de jugadas NBA/FIBA con diagramas interactivos",              tags:["jugadas","NBA","FIBA","diagramas"]},
  {id:2,title:"Breakthrough Basketball", url:"https://breakthroughbasketball.com",  desc:"Ejercicios, drills y sistemas de juego para todos los niveles",            tags:["ejercicios","sistemas","educación"]},
  {id:3,title:"FBIB",                   url:"https://fbib.es",                      desc:"Federació de Bàsquet de les Illes Balears — competiciones y estadísticas", tags:["federación","Baleares","competición","estadísticas"]},
  {id:4,title:"FEB",                    url:"https://feb.es",                       desc:"Federación Española de Baloncesto — normativa, selecciones y noticias",    tags:["federación","España","noticias"]},
  {id:5,title:"Wikiloc Basket Plays",   url:"https://youtube.com/@basketcoach",     desc:"Canal YouTube con jugadas y sistemas explicados visualmente",               tags:["jugadas","vídeo","YouTube","sistemas"]},
  {id:6,title:"ACB",                    url:"https://acb.com",                      desc:"Liga ACB — resultados, estadísticas y clasificación en tiempo real",       tags:["ACB","estadísticas","resultados","liga"]},
];

/* ═══════════════════════════════════════════════════════════════
   STATIC DATA
═══════════════════════════════════════════════════════════════ */
const MESOS=[
  {id:1,name:"Preparación General",    s:"Sem 1", e:"Sem 4", type:"Pretemporada",weeks:4, color:"#3b82f6",goal:"Base física y adaptación motriz"},
  {id:2,name:"Preparación Específica", s:"Sem 5", e:"Sem 8", type:"Pretemporada",weeks:4, color:"#8b5cf6",goal:"Trabajo técnico-táctico intensivo"},
  {id:3,name:"Competición I",          s:"Sem 9", e:"Sem 20",type:"Temporada",   weeks:12,color:"#f97316",goal:"Rendimiento competitivo sostenido"},
  {id:4,name:"Recuperación Activa",    s:"Sem 21",e:"Sem 22",type:"Transición",  weeks:2, color:"#10b981",goal:"Descarga y regeneración"},
  {id:5,name:"Playoffs",               s:"Sem 23",e:"Sem 34",type:"Playoffs",    weeks:12,color:"#ef4444",goal:"Pico de forma – Fase final"},
];
const MICRO_DAYS=["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const MICRO=[
  {type:"Libre",           intens:"—",          focus:"Descanso activo",           color:"#4b5563"},
  {type:"Técnico-Táctico", intens:"Media-Alta", focus:"Ataque + sistemas",         color:"#f97316"},
  {type:"Libre",           intens:"—",          focus:"Recuperación",              color:"#4b5563"},
  {type:"Físico",          intens:"Alta",       focus:"Fuerza / Potencia",         color:"#3b82f6"},
  {type:"Técnico",         intens:"Media",      focus:"Tiro y bote",               color:"#f59e0b"},
  {type:"Partido",         intens:"Máxima",     focus:"Competición",               color:"#ef4444"},
  {type:"Recuperación",    intens:"Mínima",     focus:"Regenerativo post-partido", color:"#10b981"},
];
const ML=[10,85,10,75,65,100,15];
const PLAYS=[
  {id:1,name:"Horns Flex",     cat:"Ataque",  desc:"Dos pívots en codo, base arriba. Múltiples opciones de corte, bloqueo y penetración.",tags:["Pick & Roll","Bloqueos"]},
  {id:2,name:"Box BLOB",       cat:"Especial",desc:"Saque de banda desde zona. Formación en caja con múltiples opciones de corte y tiro.",tags:["Lateral","Zona baja"]},
  {id:3,name:"Match-Up Zone",  cat:"Defensa", desc:"Zona híbrida adaptativa. Alta comunicación entre jugadores.",tags:["Zona","Comunicación"]},
  {id:4,name:"Princeton Base", cat:"Ataque",  desc:"Sistema de bajo poste con backdoors continuos y bloqueos cruzados en esquina.",tags:["Sistema","Backdoor"]},
  {id:5,name:"ATO #14",        cat:"Especial",desc:"After timeout. Bloqueo doble para tirador de 3 en esquina.",tags:["ATO","Tiro 3"]},
  {id:6,name:"Press 1-2-1-1",  cat:"Defensa", desc:"Press full court con trampa lateral.",tags:["Press","Trampa"]},
];
const EJS=[
  {id:1, name:"Tiro en forma",         cat:"Técnico",     dur:"15'",diff:"Básico",desc:"Mecánica de tiro con corrección de follow-through."},
  {id:2, name:"1v1 desde cono",        cat:"Técnico",     dur:"20'",diff:"Medio", desc:"Bote desde cono lateral, finalización variada."},
  {id:3, name:"Pick & Roll 2v2",       cat:"Táctico",     dur:"25'",diff:"Medio", desc:"Bloqueador y base ejecutan P&R. Progresión a 3v3."},
  {id:4, name:"Defensa 1v1 perímetro", cat:"Táctico",     dur:"20'",diff:"Medio", desc:"Posición defensiva, footwork, no ceder línea de base."},
  {id:5, name:"Circuito de fuerza",    cat:"Físico",      dur:"30'",diff:"Alto",  desc:"6 estaciones: sentadillas, prensa, peso muerto, dominadas, abdominales, saltos."},
  {id:6, name:"Series 4×30m",          cat:"Físico",      dur:"20'",diff:"Alto",  desc:"Sprint a máxima intensidad con recuperación de 2' entre series."},
  {id:7, name:"Movilidad y Stretching",cat:"Recuperación",dur:"30'",diff:"Básico",desc:"Movilidad articular, estiramientos dinámicos y estáticos."},
  {id:8, name:"TL bajo presión",       cat:"Mental",      dur:"15'",diff:"Medio", desc:"Tiro libre tras ejercicio físico intenso. Series 2+2."},
  {id:9, name:"3v2 – 2v1 continuo",   cat:"Táctico",     dur:"20'",diff:"Medio", desc:"Transición ofensiva y defensiva en continuidad."},
  {id:10,name:"Spot Shooting",         cat:"Técnico",     dur:"20'",diff:"Básico",desc:"5 posiciones fijas, 5 tiros por posición, 3 series."},
  {id:11,name:"4v4 restringido",       cat:"Táctico",     dur:"25'",diff:"Alto",  desc:"Juego con restricciones: máx. 2 botes, pase interior obligatorio."},
  {id:12,name:"Foam Roller + PNF",     cat:"Recuperación",dur:"20'",diff:"Básico",desc:"2 minutos por grupo muscular. Estiramientos PNF."},
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

/* ═══════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════ */
function GS({th}){return <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%}
  body{font-family:'Inter',sans-serif;background:${th.bg};color:${th.text}}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:${th.card}}
  ::-webkit-scrollbar-thumb{background:${th.border2};border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:#f97316}
  input,select,textarea{background:${th.inputBg}!important;border:1px solid ${th.border2}!important;color:${th.text}!important;border-radius:8px;padding:8px 12px;outline:none;font-family:'Inter',sans-serif;font-size:13px;width:100%;transition:border-color .15s}
  input:focus,select:focus,textarea:focus{border-color:#f97316!important;box-shadow:0 0 0 3px rgba(249,115,22,.15)}
  option{background:${th.card};color:${th.text}}
  .card{background:${th.card};border:1px solid ${th.border};border-radius:14px}
  .card2{background:${th.card2};border:1px solid ${th.border};border-radius:10px}
  .hrow:hover{background:${th.rowHover}!important}
  .nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;cursor:pointer;border-right:3px solid transparent;transition:all .15s}
  .nav-item:hover{background:rgba(249,115,22,.07);border-right-color:rgba(249,115,22,.3)}
  .nav-item.active{background:rgba(249,115,22,.13);border-right-color:#f97316}
  .card-lift{transition:transform .2s,box-shadow .2s;cursor:pointer}
  .card-lift:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.2)}
  @keyframes spin{to{transform:rotate(360deg)}}
`}</style>;}

/* ═══════════════════════════════════════════════════════════════
   SHARED UI
═══════════════════════════════════════════════════════════════ */
function Badge({children,color="#f97316",sm}){return <span style={{background:color+"1e",color,border:`1px solid ${color}40`,borderRadius:5,padding:sm?"1px 6px":"2px 9px",fontSize:sm?10:11,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:.4,whiteSpace:"nowrap",display:"inline-block"}}>{children}</span>;}
function Btn({children,onClick,variant="primary",sm,icon,disabled}){const S={primary:{bg:"#f97316",color:"#fff",border:"none"},ghost:{bg:"transparent",color:"#64748b",border:"1px solid #374151"},danger:{bg:"rgba(239,68,68,.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,.3)"}}[variant];return <button disabled={disabled} onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:sm?"5px 12px":"8px 18px",background:S.bg,color:S.color,border:S.border,borderRadius:8,cursor:disabled?"not-allowed":"pointer",fontWeight:700,fontSize:sm?12:14,letterSpacing:.4,opacity:disabled?.45:1,whiteSpace:"nowrap",fontFamily:"Barlow Condensed,sans-serif"}}>{icon}{children}</button>;}
function SH({title,sub,right}){const{th}=useTheme();return <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div><h2 style={{fontFamily:"Barlow Condensed,sans-serif",fontSize:30,fontWeight:800,color:th.text,letterSpacing:1,textTransform:"uppercase",lineHeight:1}}>{title}</h2>{sub&&<p style={{color:th.muted,fontSize:12,marginTop:4}}>{sub}</p>}</div>{right&&<div style={{flexShrink:0,marginLeft:16}}>{right}</div>}</div>;}
function TB({tabs,active,onChange}){const{th}=useTheme();return <div style={{display:"flex",gap:6,marginBottom:20}}>{tabs.map(([id,lbl])=><button key={id} onClick={()=>onChange(id)} style={{padding:"7px 20px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed,sans-serif",background:active===id?"#f97316":th.card2,color:active===id?"#fff":th.sub,transition:"all .15s"}}>{lbl}</button>)}</div>;}
function Lbl({children}){return <label style={{fontSize:11,color:"#64748b",display:"block",marginBottom:5,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase",letterSpacing:.5}}>{children}</label>;}

/* ═══════════════════════════════════════════════════════════════
   SYNC STATUS
═══════════════════════════════════════════════════════════════ */
function SyncBadge({status}){
  const cfg={
    saving:{icon:<Loader size={11} style={{animation:"spin 1s linear infinite"}}/>,label:"Guardando…",color:"#f59e0b"},
    saved: {icon:<Wifi size={11}/>,   label:"Sincronizado ✓",                       color:"#10b981"},
    offline:{icon:<WifiOff size={11}/>,label:"Sin conexión",                        color:"#ef4444"},
    loading:{icon:<Loader size={11} style={{animation:"spin 1s linear infinite"}}/>,label:"Cargando…",color:"#64748b"},
  }[status]||{};
  return <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:20,background:cfg.color+"18",border:`1px solid ${cfg.color}35`}}><span style={{color:cfg.color}}>{cfg.icon}</span><span style={{fontSize:11,color:cfg.color,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,letterSpacing:.3}}>{cfg.label}</span></div>;
}

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard(){
  const{th}=useTheme();const{players,matches,sessions}=useData();
  const active=players.filter(p=>p.active);
  const wins=matches.filter(m=>m.pts_us>m.pts_them).length;
  const losses=matches.filter(m=>m.pts_us<=m.pts_them).length;
  const avgPts=active.length?(active.reduce((a,p)=>a+p.pts,0)/active.length).toFixed(1):"—";
  const avgReb=active.length?(active.reduce((a,p)=>a+p.reb,0)/active.length).toFixed(1):"—";
  const kpis=[{label:"Record",value:`${wins}–${losses}`,sub:"victorias–derrotas",color:"#f97316",icon:Trophy},{label:"Pts/Jgo",value:avgPts,sub:"media equipo",color:"#3b82f6",icon:Activity},{label:"Reb/Jgo",value:avgReb,sub:"media equipo",color:"#8b5cf6",icon:Target},{label:"Plantilla",value:active.length,sub:"jugadores activos",color:"#10b981",icon:Users}];
  const cd=matches.map(m=>({name:m.rival.split(" ")[0],nos:m.pts_us,riv:m.pts_them}));
  const top5=[...active].sort((a,b)=>b.pts-a.pts).slice(0,5);
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};
  return <div>
    <SH title="Panel Principal" sub="CB Binissalem Senior A · Temporada 2024/25"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
      {kpis.map(k=><div key={k.label} className="card" style={{padding:"20px 22px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</p><p style={{fontFamily:"DM Mono",fontSize:34,fontWeight:700,color:k.color,lineHeight:1}}>{k.value}</p><p style={{fontSize:11,color:th.muted,marginTop:5}}>{k.sub}</p></div><k.icon size={17} color={k.color} style={{opacity:.5}}/></div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:18}}>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Resultados de Partidos</p>
        {matches.length>0?<ResponsiveContainer width="100%" height={185}><BarChart data={cd} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/><XAxis dataKey="name" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false} domain={[50,110]}/><Tooltip contentStyle={tt}/><Bar dataKey="nos" fill="#f97316" radius={[4,4,0,0]} name="CB Binissalem"/><Bar dataKey="riv" fill={th.border2} radius={[4,4,0,0]} name="Rival"/></BarChart></ResponsiveContainer>:<div style={{height:185,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:th.muted,fontSize:13}}>Sin partidos registrados aún</p></div>}
      </div>
      <div className="card" style={{padding:22}}>
        <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Próximos Entrenos</p>
        {sessions.slice(0,4).map((s,i)=><div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<3?`1px solid ${th.border}`:"none"}}><div style={{background:(TC[s.type]||"#f97316")+"18",borderRadius:6,padding:"3px 8px",minWidth:60,textAlign:"center",flexShrink:0}}><p style={{fontFamily:"DM Mono",fontSize:10,color:TC[s.type]||"#f97316",fontWeight:600}}>{s.date.slice(0,5)}</p></div><div><p style={{fontSize:12,color:th.text}}>{s.title}</p><p style={{fontSize:10,color:th.muted}}>{s.type} · {s.dur}'</p></div></div>)}
      </div>
    </div>
    <div className="card" style={{padding:22}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Top Anotadores</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
        {top5.map((p,i)=><div key={p.id} style={{background:th.card2,borderRadius:12,padding:"16px 10px",textAlign:"center",border:`1px solid ${th.border}`}}><div style={{width:40,height:40,borderRadius:20,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:i===0?"#fff":th.sub}}>{p.num}</div><p style={{fontSize:11,color:th.text,fontWeight:600,marginBottom:6}}>{p.name.split(" ")[0]}</p><p style={{fontFamily:"DM Mono",fontSize:22,color:"#f97316",fontWeight:700,lineHeight:1}}>{p.pts}</p><p style={{fontSize:10,color:th.muted,marginTop:3}}>pts/jgo</p></div>)}
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   2. PLANTILLA
═══════════════════════════════════════════════════════════════ */
function Plantilla(){
  const{th}=useTheme();const{players,setPlayers}=useData();
  const[ed,setEd]=useState(null);const[ef,setEf]=useState({});const[sa,setSa]=useState(false);const[af,setAf]=useState({name:"",num:"",pos:"Base",active:true});
  const pos=["Base","Escolta","Alero","Ala-Pívot","Pívot"];
  const se=p=>{setEd(p.id);setEf({name:p.name,num:p.num,pos:p.pos,active:p.active});};
  const sv=()=>{setPlayers(prev=>prev.map(p=>p.id===ed?{...p,...ef,num:+ef.num}:p));setEd(null);};
  const dl=id=>setPlayers(prev=>prev.filter(p=>p.id!==id));
  const tg=id=>setPlayers(prev=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));
  const add=()=>{if(!af.name||!af.num)return;const id=Math.max(0,...players.map(p=>p.id))+1;setPlayers(prev=>[...prev,{id,...af,num:+af.num,pts:0,reb:0,ast:0,stl:0,blk:0,fg:0}]);setAf({name:"",num:"",pos:"Base",active:true});setSa(false);};
  return <div>
    <SH title="Plantilla" sub="CB Binissalem Senior A · Gestión de jugadores" right={<Btn onClick={()=>setSa(!sa)} icon={<Plus size={14}/>}>Añadir Jugador</Btn>}/>
    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}><p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Jugador</p><div style={{display:"grid",gridTemplateColumns:"1fr 110px 165px",gap:12,marginBottom:12}}><div><Lbl>Nombre completo</Lbl><input value={af.name} onChange={e=>setAf(f=>({...f,name:e.target.value}))} placeholder="Nombre del jugador"/></div><div><Lbl>Dorsal</Lbl><input type="number" value={af.num} onChange={e=>setAf(f=>({...f,num:e.target.value}))} placeholder="0"/></div><div><Lbl>Posición</Lbl><select value={af.pos} onChange={e=>setAf(f=>({...f,pos:e.target.value}))}>{pos.map(p=><option key={p}>{p}</option>)}</select></div></div><div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div></div>}
    <div className="card" style={{overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:th.tableHead}}>{["Dorsal","Nombre","Posición","Estado","Acciones"].map((h,i)=><th key={h} style={{padding:"11px 16px",textAlign:i>2?"center":"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{h}</th>)}</tr></thead>
        <tbody>{players.map(p=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`}}>{ed===p.id?<><td style={{padding:"8px 16px"}}><input type="number" value={ef.num} onChange={e=>setEf(f=>({...f,num:e.target.value}))} style={{width:60}}/></td><td style={{padding:"8px 16px"}}><input value={ef.name} onChange={e=>setEf(f=>({...f,name:e.target.value}))}/></td><td style={{padding:"8px 16px"}}><select value={ef.pos} onChange={e=>setEf(f=>({...f,pos:e.target.value}))}>{pos.map(pp=><option key={pp}>{pp}</option>)}</select></td><td style={{padding:"8px 16px",textAlign:"center"}}><Badge color={ef.active?"#10b981":"#ef4444"}>{ef.active?"Activo":"Baja"}</Badge></td><td style={{padding:"8px 16px"}}><div style={{display:"flex",gap:8,justifyContent:"center"}}><Btn onClick={sv} sm>Guardar</Btn><Btn onClick={()=>setEd(null)} variant="ghost" sm>Cancelar</Btn></div></td></>:<><td style={{padding:"10px 16px"}}><div style={{width:32,height:32,borderRadius:16,background:p.active?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:"#fff"}}>{p.num}</div></td><td style={{padding:"10px 16px",fontSize:13,color:p.active?th.text:th.muted}}>{p.name}</td><td style={{padding:"10px 16px"}}><Badge color={POC[p.pos]||"#64748b"} sm>{p.pos}</Badge></td><td style={{padding:"10px 16px",textAlign:"center"}}><div onClick={()=>tg(p.id)} style={{display:"inline-flex",alignItems:"center",gap:5,cursor:"pointer",padding:"3px 10px",borderRadius:6,background:p.active?"rgba(16,185,129,.1)":"rgba(239,68,68,.1)",border:`1px solid ${p.active?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)"}`}}><span style={{fontFamily:"DM Mono",fontSize:11,color:p.active?"#10b981":"#ef4444",fontWeight:600}}>{p.active?"Activo":"Baja"}</span></div></td><td style={{padding:"10px 16px"}}><div style={{display:"flex",gap:12,justifyContent:"center"}}><Edit2 size={14} color={th.sub} style={{cursor:"pointer"}} onClick={()=>se(p)}/><Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>dl(p.id)}/></div></td></> }</tr>)}</tbody>
      </table>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   3. PARTIDOS
═══════════════════════════════════════════════════════════════ */
function Partidos(){
  const{th}=useTheme();const{matches,setMatches}=useData();
  const[sa,setSa]=useState(false);const[f,setF]=useState({date:"",rival:"",location:"Casa",pts_us:"",pts_them:""});
  const w=matches.filter(m=>m.pts_us>m.pts_them).length;const l=matches.filter(m=>m.pts_us<=m.pts_them).length;
  const af=matches.length?(matches.reduce((a,m)=>a+m.pts_us,0)/matches.length).toFixed(1):"—";
  const aa=matches.length?(matches.reduce((a,m)=>a+m.pts_them,0)/matches.length).toFixed(1):"—";
  const add=()=>{if(!f.date||!f.rival||f.pts_us===""||f.pts_them==="")return;const id=matches.length?Math.max(...matches.map(m=>m.id))+1:1;setMatches(prev=>[...prev,{id,...f,pts_us:+f.pts_us,pts_them:+f.pts_them}]);setF({date:"",rival:"",location:"Casa",pts_us:"",pts_them:""});setSa(false);};
  const ks=[{label:"Record",value:`${w}–${l}`,color:"#f97316"},{label:"Pts a favor",value:af,color:"#10b981"},{label:"Pts en contra",value:aa,color:"#ef4444"},{label:"Partidos",value:matches.length,color:"#3b82f6"}];
  return <div>
    <SH title="Partidos" sub="Resultados y estadísticas de temporada" right={<Btn onClick={()=>setSa(!sa)} icon={<Plus size={14}/>}>Añadir Partido</Btn>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>{ks.map(k=><div key={k.label} className="card" style={{padding:"18px 20px"}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:"#64748b",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{k.label}</p><p style={{fontFamily:"DM Mono",fontSize:32,color:k.color,fontWeight:700,lineHeight:1}}>{k.value}</p></div>)}</div>
    {sa&&<div className="card" style={{padding:20,marginBottom:14,borderColor:"#f9731640"}}><p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Partido</p><div style={{display:"grid",gridTemplateColumns:"150px 1fr 130px 80px 80px",gap:12,marginBottom:12}}><div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(x=>({...x,date:e.target.value}))}/></div><div><Lbl>Rival</Lbl><input value={f.rival} onChange={e=>setF(x=>({...x,rival:e.target.value}))} placeholder="Nombre del rival"/></div><div><Lbl>Lugar</Lbl><select value={f.location} onChange={e=>setF(x=>({...x,location:e.target.value}))}><option>Casa</option><option>Fuera</option></select></div><div><Lbl>Nos.</Lbl><input type="number" value={f.pts_us} onChange={e=>setF(x=>({...x,pts_us:e.target.value}))} placeholder="00"/></div><div><Lbl>Riv.</Lbl><input type="number" value={f.pts_them} onChange={e=>setF(x=>({...x,pts_them:e.target.value}))} placeholder="00"/></div></div><div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div></div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {matches.length===0&&<div className="card" style={{padding:48,textAlign:"center"}}><Trophy size={36} color="#374151" style={{margin:"0 auto 14px",display:"block"}}/><p style={{color:"#64748b",fontSize:14}}>No hay partidos registrados</p></div>}
      {[...matches].reverse().map(m=>{const win=m.pts_us>m.pts_them;const c=win?"#10b981":"#ef4444";const d=m.pts_us-m.pts_them;return <div key={m.id} className="card" style={{padding:"16px 20px",borderLeft:`4px solid ${c}`,display:"flex",alignItems:"center",gap:20}}><div style={{minWidth:58,textAlign:"center"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:"#64748b",marginBottom:4}}>{m.date}</p><Badge color={c} sm>{win?"VICTORIA":"DERROTA"}</Badge></div><div style={{flex:1}}><p style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,lineHeight:1,marginBottom:3}}>{m.rival}</p><p style={{fontSize:11,color:"#64748b"}}>{m.location} · {d>0?"+":""}{d} pts diferencia</p></div><p style={{fontFamily:"DM Mono",fontSize:30,fontWeight:700,color:c,lineHeight:1}}>{m.pts_us}<span style={{color:"#64748b",fontSize:18}}>–</span>{m.pts_them}</p><Trash2 size={14} color="#ef4444" style={{cursor:"pointer",flexShrink:0}} onClick={()=>setMatches(prev=>prev.filter(x=>x.id!==m.id))}/></div>;})}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   4. PLANIFICACIÓN
═══════════════════════════════════════════════════════════════ */
function Planificacion(){
  const{th}=useTheme();const[tab,setTab]=useState("meso");
  return <div>
    <SH title="Planificación" sub="Estructura temporal y carga semanal de la temporada"/>
    <TB tabs={[["meso","Mesociclos"],["micro","Microciclo Semanal"]]} active={tab} onChange={setTab}/>
    {tab==="meso"?<>
      <div className="card" style={{padding:22,marginBottom:14}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Timeline de Temporada</p><div style={{display:"flex",height:46,gap:2,borderRadius:8,overflow:"hidden"}}>{MESOS.map(m=><div key={m.id} style={{flex:m.weeks,background:m.color+"22",border:`1px solid ${m.color}40`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"Barlow Condensed",fontSize:10,color:m.color,fontWeight:700,textTransform:"uppercase"}}>{m.name.split(" ")[0]}</span></div>)}</div></div>
      {MESOS.map(m=><div key={m.id} className="card" style={{padding:20,marginBottom:10,borderLeft:`4px solid ${m.color}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><h3 style={{fontFamily:"Barlow Condensed",fontSize:21,fontWeight:700,color:th.text}}>{m.name}</h3><Badge color={m.color}>{m.type}</Badge></div><p style={{fontSize:13,color:th.sub}}>{m.goal}</p></div><div style={{textAlign:"right"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{m.s} — {m.e}</p><p style={{fontFamily:"DM Mono",fontSize:26,color:m.color,fontWeight:700,lineHeight:1.1}}>{m.weeks}<span style={{fontSize:12,color:th.muted}}> sem</span></p></div></div><div style={{display:"flex",gap:4,marginTop:14,flexWrap:"wrap"}}>{Array.from({length:m.weeks},(_,i)=><div key={i} style={{width:28,height:28,borderRadius:5,background:m.color+"18",border:`1px solid ${m.color}38`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"DM Mono",fontSize:9,color:m.color}}>{i+1}</span></div>)}</div></div>)}
    </>:<>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:14}}>{MICRO_DAYS.map((day,i)=>{const m=MICRO[i];return <div key={day} className="card" style={{padding:16,borderTop:`3px solid ${m.color}`}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>{day.slice(0,3)}</p><p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:700,color:m.color,marginBottom:4}}>{m.type}</p><p style={{fontSize:11,color:th.sub,marginBottom:10,lineHeight:1.4}}>{m.focus}</p><Badge color={m.color} sm>{m.intens}</Badge></div>;})} </div>
      <div className="card" style={{padding:20}}><p style={{fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Carga Semanal</p><div style={{display:"flex",gap:4,alignItems:"flex-end",height:60}}>{ML.map((h,i)=><div key={i} style={{flex:1,background:MICRO[i].color,height:`${h}%`,borderRadius:"4px 4px 0 0",opacity:.72,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.72}/>)}</div><div style={{display:"flex",marginTop:6}}>{MICRO_DAYS.map(d=><div key={d} style={{flex:1,textAlign:"center",fontSize:9,color:th.muted,fontFamily:"DM Mono"}}>{d.slice(0,3)}</div>)}</div></div>
    </>}
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   5. ESTADÍSTICAS
═══════════════════════════════════════════════════════════════ */
function Estadisticas(){
  const{th}=useTheme();const{players}=useData();const[sb,setSb]=useState("pts");
  const cols=[{key:"pts",lbl:"PTS"},{key:"reb",lbl:"REB"},{key:"ast",lbl:"AST"},{key:"stl",lbl:"ROB"},{key:"blk",lbl:"TAP"},{key:"fg",lbl:"TC%"}];
  const sorted=[...players.filter(p=>p.active)].sort((a,b)=>b[sb]-a[sb]);
  const cd=sorted.slice(0,8).map(p=>({name:p.name.split(" ")[0].slice(0,8),val:p[sb]}));
  const tt={background:th.card,border:`1px solid ${th.border}`,borderRadius:8,color:th.text,fontSize:12};
  return <div>
    <SH title="Estadísticas" sub="Medias individuales por partido · CB Binissalem Senior A"/>
    <div className="card" style={{padding:22,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}><p style={{fontFamily:"Barlow Condensed",fontSize:12,color:th.muted,textTransform:"uppercase",letterSpacing:1}}>Ranking visual</p><div style={{display:"flex",gap:6}}>{cols.map(c=><button key={c.key} onClick={()=>setSb(c.key)} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"Barlow Condensed",background:sb===c.key?"#f97316":th.card2,color:sb===c.key?"#fff":th.sub,transition:"all .15s"}}>{c.lbl}</button>)}</div></div>
      <ResponsiveContainer width="100%" height={155}><BarChart data={cd} barCategoryGap="35%"><CartesianGrid strokeDasharray="3 3" stroke={th.border} vertical={false}/><XAxis dataKey="name" tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:th.muted,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tt}/><Bar dataKey="val" fill="#f97316" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
    </div>
    <div className="card" style={{overflow:"hidden"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:th.tableHead}}><th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>#</th><th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Jugador</th><th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Pos</th>{cols.map(c=><th key={c.key} onClick={()=>setSb(c.key)} style={{padding:"11px 14px",textAlign:"right",fontFamily:"Barlow Condensed",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,cursor:"pointer",color:sb===c.key?"#f97316":th.muted}}>{c.lbl}</th>)}</tr></thead>
        <tbody>{sorted.map((p,i)=><tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`,background:i===0?"rgba(249,115,22,.04)":"transparent"}}><td style={{padding:"10px 16px",fontFamily:"DM Mono",fontSize:12,color:th.muted}}>{i+1}</td><td style={{padding:"10px 16px"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:14,background:i===0?"#f97316":th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:13,fontWeight:700,color:i===0?"#fff":th.sub,flexShrink:0}}>{p.num}</div><span style={{fontSize:13,color:th.text}}>{p.name}</span></div></td><td style={{padding:"10px 16px",fontSize:12,color:th.sub}}>{p.pos}</td>{cols.map(c=><td key={c.key} style={{padding:"10px 14px",textAlign:"right",fontFamily:"DM Mono",fontSize:13,color:sb===c.key?"#f97316":th.text,fontWeight:sb===c.key?700:400}}>{p[c.key]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   6. ENTRENAMIENTOS
═══════════════════════════════════════════════════════════════ */
function Entrenamientos(){
  const{th}=useTheme();const{sessions,setSessions}=useData();
  const[exp,setExp]=useState(null);const[add,setAdd]=useState(false);const[f,setF]=useState({date:"",type:"Técnico",dur:90,title:"",exs:""});
  const save=()=>{if(!f.title||!f.date)return;const id=sessions.length?Math.max(...sessions.map(s=>s.id))+1:1;setSessions(p=>[...p,{id,...f,dur:+f.dur,exs:f.exs.split("\n").filter(Boolean)}]);setAdd(false);setF({date:"",type:"Técnico",dur:90,title:"",exs:""});};
  return <div>
    <SH title="Entrenamientos" sub="Martes · Jueves · Viernes — desde el 7 de abril" right={<Btn onClick={()=>setAdd(true)} icon={<Plus size={14}/>}>Nueva Sesión</Btn>}/>
    {add&&<div className="card" style={{padding:22,marginBottom:14,borderColor:"#f9731640"}}><p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:16,textTransform:"uppercase"}}>Nueva Sesión</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}><div><Lbl>Fecha</Lbl><input type="date" value={f.date} onChange={e=>setF(p=>({...p,date:e.target.value}))}/></div><div><Lbl>Tipo</Lbl><select value={f.type} onChange={e=>setF(p=>({...p,type:e.target.value}))}>{Object.keys(TC).map(t=><option key={t}>{t}</option>)}</select></div><div><Lbl>Duración (min)</Lbl><input type="number" value={f.dur} onChange={e=>setF(p=>({...p,dur:e.target.value}))}/></div></div><div style={{marginBottom:12}}><Lbl>Título</Lbl><input type="text" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="Título de la sesión"/></div><div style={{marginBottom:16}}><Lbl>Ejercicios (uno por línea)</Lbl><textarea rows={4} value={f.exs} onChange={e=>setF(p=>({...p,exs:e.target.value}))} placeholder={"Calentamiento 15'\nEjercicio principal 30'..."}/></div><div style={{display:"flex",gap:8}}><Btn onClick={save}>Guardar</Btn><Btn onClick={()=>setAdd(false)} variant="ghost">Cancelar</Btn></div></div>}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {sessions.map(s=>{const c=TC[s.type]||"#f97316";const op=exp===s.id;return <div key={s.id} onClick={()=>setExp(op?null:s.id)} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:12,padding:"16px 20px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:16}}><div style={{minWidth:52,textAlign:"center"}}><p style={{fontFamily:"DM Mono",fontSize:10,color:th.muted}}>{s.date}</p><p style={{fontFamily:"DM Mono",fontSize:13,color:c,fontWeight:700}}>{s.dur}'</p></div><div><h4 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:4}}>{s.title}</h4><Badge color={c}>{s.type}</Badge></div></div><div style={{display:"flex",alignItems:"center",gap:12}}><Trash2 size={14} color="#ef4444" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();setSessions(p=>p.filter(x=>x.id!==s.id));}}/><ChevronRight size={15} color={th.muted} style={{transform:op?"rotate(90deg)":"none",transition:"transform .2s"}}/></div></div>{op&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${th.border}`}}>{s.exs.map((ex,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}><div style={{width:22,height:22,borderRadius:11,background:c+"18",border:`1px solid ${c}35`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"DM Mono",fontSize:9,color:c}}>{i+1}</span></div><span style={{fontSize:13,color:th.sub}}>{ex}</span></div>)}</div>}</div>;})}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   7. ASISTENCIA
═══════════════════════════════════════════════════════════════ */
function Asistencia(){
  const{th}=useTheme();const{players,sessions,att,setAtt}=useData();
  const tg=(sid,pid)=>setAtt(prev=>{const c=prev[sid]||[];return{...prev,[sid]:c.includes(pid)?c.filter(id=>id!==pid):[...c,pid]};});
  const rt=pid=>sessions.length?Math.round((Object.values(att).filter(l=>l.includes(pid)).length/sessions.length)*100):0;
  return <div>
    <SH title="Asistencia" sub="Control de presencia · Haz clic en una celda para cambiar"/>
    <div className="card" style={{overflow:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
        <thead><tr style={{background:th.tableHead}}><th style={{padding:"11px 16px",textAlign:"left",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,position:"sticky",left:0,background:th.tableHead,minWidth:175,zIndex:1}}>Jugador</th>{sessions.map(s=><th key={s.id} style={{padding:"11px 10px",textAlign:"center",minWidth:64}}><span style={{display:"block",fontFamily:"DM Mono",fontSize:10,color:TC[s.type]||"#f97316"}}>{s.date.slice(0,5)}</span><span style={{display:"block",fontSize:9,color:th.muted,marginTop:2}}>{s.type.split("-")[0].trim().slice(0,6)}</span></th>)}<th style={{padding:"11px 16px",textAlign:"center",fontFamily:"Barlow Condensed",fontSize:11,color:th.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,minWidth:90}}>Asist.</th></tr></thead>
        <tbody>{players.map(p=>{const r=rt(p.id);const rc=r>=80?"#10b981":r>=60?"#f59e0b":"#ef4444";return <tr key={p.id} className="hrow" style={{borderTop:`1px solid ${th.border}`}}><td style={{padding:"9px 16px",position:"sticky",left:0,background:th.card,zIndex:1}}><div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:26,height:26,borderRadius:13,background:th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,color:th.sub,fontWeight:700,flexShrink:0}}>{p.num}</div><span style={{fontSize:12,color:p.active?th.text:th.muted}}>{p.name}</span>{!p.active&&<Badge color="#ef4444" sm>Baja</Badge>}</div></td>{sessions.map(s=>{const pr=(att[s.id]||[]).includes(p.id);return <td key={s.id} style={{padding:"9px 10px",textAlign:"center"}}><div onClick={()=>tg(s.id,p.id)} style={{width:28,height:28,borderRadius:6,cursor:"pointer",margin:"auto",display:"flex",alignItems:"center",justifyContent:"center",background:pr?"#10b981":"transparent",border:`1px solid ${pr?"#10b981":th.border2}`,transition:"all .15s"}}>{pr?<Check size={13} color="#fff"/>:<span style={{fontSize:12,color:th.border2}}>–</span>}</div></td>})}<td style={{padding:"9px 16px",textAlign:"center"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{flex:1,height:5,background:th.border2,borderRadius:3,overflow:"hidden"}}><div style={{width:`${r}%`,height:"100%",background:rc,borderRadius:3,transition:"width .3s"}}/></div><span style={{fontFamily:"DM Mono",fontSize:11,color:rc,minWidth:30,fontWeight:600}}>{r}%</span></div></td></tr>;})}</tbody>
      </table>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   8. QUINTETO
═══════════════════════════════════════════════════════════════ */
function Quinteto(){
  const{th}=useTheme();const{players}=useData();
  const[lu,setLu]=useState({});const[sel,setSel]=useState(null);
  const os=id=>setSel(s=>s===id?null:id);
  const as=player=>{if(!sel)return;setLu(prev=>{const n={...prev};Object.keys(n).forEach(k=>{if(n[k]?.id===player.id)delete n[k];});n[sel]=player;return n;});setSel(null);};
  const si=CS.find(s=>s.id===sel);
  return <div>
    <SH title="Quinteto" sub="Planificación de quinteto titular y rotaciones"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
      <div className="card" style={{padding:22,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{marginBottom:14,padding:"8px 16px",borderRadius:8,background:sel?"rgba(249,115,22,.1)":th.card2,border:`1px solid ${sel?"#f97316":th.border}`,transition:"all .2s"}}><p style={{fontFamily:"Barlow Condensed",fontSize:13,color:sel?"#f97316":th.muted,textAlign:"center",fontWeight:700}}>{sel?`▶ Asigna jugador: ${si?.name}`:"Toca una posición en la cancha"}</p></div>
        <svg viewBox="0 0 400 365" style={{width:"100%",display:"block"}}>
          <defs><linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#c8841a"/><stop offset="100%" stopColor="#b06610"/></linearGradient></defs>
          <rect width="400" height="365" rx="6" fill="url(#wg2)"/><rect x="6" y="6" width="388" height="353" rx="4" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.2"/><rect x="136" y="196" width="128" height="155" fill="rgba(0,0,0,.12)" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><path d="M 145 196 A 55 22 0 0 0 255 196" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><rect x="178" y="346" width="44" height="6" rx="1" fill="rgba(255,255,255,.92)"/><ellipse cx="200" cy="344" rx="13" ry="6" fill="none" stroke="#ff6b00" strokeWidth="3"/><path d="M 22 238 C 22 95 378 95 378 238" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><line x1="22" y1="353" x2="22" y2="238" stroke="rgba(255,255,255,.8)" strokeWidth="2"/><line x1="378" y1="353" x2="378" y2="238" stroke="rgba(255,255,255,.8)" strokeWidth="2"/>
          {CS.map(sp=>{const pl=lu[sp.id];const is=sel===sp.id;return <g key={sp.id} onClick={()=>os(sp.id)} style={{cursor:"pointer"}}><circle cx={sp.x} cy={sp.y} r="23" fill={pl?"#f97316":is?"rgba(249,115,22,.4)":"rgba(8,8,18,.65)"} stroke={pl||is?"#f97316":"rgba(255,255,255,.5)"} strokeWidth={is?2.5:1.8}/>{pl?<><text x={sp.x} y={sp.y-3} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="'Barlow Condensed',sans-serif">{pl.num}</text><text x={sp.x} y={sp.y+12} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.85)" fontSize="8.5" fontFamily="sans-serif">{pl.name.split(" ")[0].slice(0,9)}</text></>:<text x={sp.x} y={sp.y} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,.55)" fontSize="13" fontWeight="bold" fontFamily="'Barlow Condensed',sans-serif">{sp.abbr}</text>}</g>;})}
        </svg>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div className="card" style={{padding:16}}><p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Quinteto Actual</p>{CS.map(sp=>{const pl=lu[sp.id];return <div key={sp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${th.border}`}}><div style={{display:"flex",alignItems:"center",gap:8}}><Badge color={sel===sp.id?"#f97316":"#64748b"} sm>{sp.abbr}</Badge><span style={{fontSize:12,color:pl?th.text:th.muted}}>{pl?pl.name:"—"}</span></div>{pl&&<X size={12} color="#ef4444" style={{cursor:"pointer"}} onClick={()=>setLu(p=>{const n={...p};delete n[sp.id];return n;})}/>}</div>;})} </div>
        <div className="card" style={{padding:16,flex:1}}><p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Plantilla</p><div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:290,overflowY:"auto"}}>{players.filter(p=>p.active).map(p=>{const a2=Object.values(lu).some(l=>l?.id===p.id);return <div key={p.id} onClick={()=>!a2&&sel&&as(p)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,background:a2?"rgba(16,185,129,.07)":th.card2,border:`1px solid ${a2?"rgba(16,185,129,.3)":th.border}`,cursor:sel&&!a2?"pointer":"default",opacity:a2?.65:1,transition:"all .15s"}}><div style={{width:24,height:24,borderRadius:12,background:th.border2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:12,color:th.sub,fontWeight:700,flexShrink:0}}>{p.num}</div><div style={{flex:1}}><p style={{fontSize:12,color:th.text}}>{p.name}</p><p style={{fontSize:10,color:th.muted}}>{p.pos}</p></div>{a2&&<Check size={12} color="#10b981"/>}</div>;})} </div></div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   9. PLAYBOOK
═══════════════════════════════════════════════════════════════ */
function Playbook(){
  const{th}=useTheme();const[fl,setFl]=useState("Todos");const[pn,setPn]=useState(null);const fr=useRef(null);
  const cats=["Todos","Ataque","Defensa","Especial"];const flt=fl==="Todos"?PLAYS:PLAYS.filter(p=>p.cat===fl);
  return <div>
    <SH title="Playbook" sub="Jugadas y sistemas de juego del equipo" right={<><input ref={fr} type="file" accept=".pdf" style={{display:"none"}} onChange={e=>setPn(e.target.files[0]?.name)}/><Btn onClick={()=>fr.current?.click()} variant="ghost" icon={<Upload size={14}/>}>{pn||"Subir PDF"}</Btn></>}/>
    <div style={{display:"flex",gap:8,marginBottom:20}}>{cats.map(c=><button key={c} onClick={()=>setFl(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:fl===c?(PC[c]||"#f97316"):th.card2,color:fl===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>{flt.map(play=>{const c=PC[play.cat]||"#f97316";return <div key={play.id} className="card card-lift" style={{padding:20,borderTop:`3px solid ${c}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><h3 style={{fontFamily:"Barlow Condensed",fontSize:20,fontWeight:700,color:th.text}}>{play.name}</h3><Badge color={c}>{play.cat}</Badge></div><p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:12}}>{play.desc}</p><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{play.tags.map(t=><span key={t} style={{fontSize:10,color:th.muted,background:th.card2,padding:"2px 8px",borderRadius:4,border:`1px solid ${th.border}`}}>{t}</span>)}</div></div>;})}</div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   10. EJERCICIOS
═══════════════════════════════════════════════════════════════ */
function Ejercicios(){
  const{th}=useTheme();const[fl,setFl]=useState("Todos");const[sel,setSel]=useState(null);
  const cats=["Todos","Técnico","Táctico","Físico","Recuperación","Mental"];const flt=fl==="Todos"?EJS:EJS.filter(e=>e.cat===fl);
  return <div>
    <SH title="Ejercicios" sub="Biblioteca por categoría · Haz clic para ver descripción"/>
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>{cats.map(c=><button key={c} onClick={()=>setFl(c)} style={{padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"Barlow Condensed",background:fl===c?(CC[c]||"#f97316"):th.card2,color:fl===c?"#fff":th.sub,transition:"all .15s"}}>{c}</button>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>{flt.map(ex=>{const c=CC[ex.cat]||"#f97316";const dc=DC[ex.diff]||"#10b981";const is=sel===ex.id;return <div key={ex.id} className="card card-lift" onClick={()=>setSel(is?null:ex.id)} style={{padding:20,borderTop:`3px solid ${c}`,outline:is?`2px solid ${c}`:"none",outlineOffset:2}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div style={{flex:1,marginRight:10}}><h3 style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:th.text,marginBottom:6}}>{ex.name}</h3><div style={{display:"flex",gap:5}}><Badge color={c} sm>{ex.cat}</Badge><Badge color={dc} sm>{ex.diff}</Badge></div></div><div style={{background:th.card2,borderRadius:7,padding:"5px 10px",border:`1px solid ${th.border}`,textAlign:"center",flexShrink:0}}><p style={{fontFamily:"DM Mono",fontSize:13,color:c,fontWeight:700}}>{ex.dur}</p></div></div><p style={{fontSize:12,color:is?th.sub:th.muted,lineHeight:1.6,marginTop:10,paddingTop:is?10:0,borderTop:is?`1px solid ${th.border}`:"none"}}>{ex.desc}</p></div>;})}</div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   11. PIZARRA
═══════════════════════════════════════════════════════════════ */
const CW=820,CH=500;
function dC(ctx){const g=ctx.createLinearGradient(0,0,CW,CH);g.addColorStop(0,"#c8841a");g.addColorStop(1,"#b06610");ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);const W="rgba(255,255,255,.88)",m=14;ctx.strokeStyle=W;ctx.lineWidth=2.5;ctx.strokeRect(m,m,CW-m*2,CH-m*2);ctx.lineWidth=2;const CX=CW/2,BL=CH-m,KW=190,KH=235,KX=CX-KW/2,KY=BL-KH;ctx.strokeStyle=W;ctx.strokeRect(KX,KY,KW,KH);[.28,.54,.78].forEach(r=>{const hy=KY+KH*r;ctx.beginPath();ctx.moveTo(KX,hy);ctx.lineTo(KX-13,hy);ctx.stroke();ctx.beginPath();ctx.moveTo(KX+KW,hy);ctx.lineTo(KX+KW+13,hy);ctx.stroke();});const FTR=KW/2;ctx.beginPath();ctx.arc(CX,KY,FTR,Math.PI,0,true);ctx.stroke();ctx.setLineDash([9,7]);ctx.beginPath();ctx.arc(CX,KY,FTR,Math.PI,0,false);ctx.stroke();ctx.setLineDash([]);const RY=BL-42;ctx.beginPath();ctx.arc(CX,RY,13,0,Math.PI*2);ctx.strokeStyle="#ff6300";ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=W;ctx.lineWidth=2;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(CX-38,BL-20);ctx.lineTo(CX+38,BL-20);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(CX,RY,38,Math.PI,0,false);ctx.stroke();const C3=m+80;ctx.beginPath();ctx.moveTo(C3,BL);ctx.lineTo(C3,BL-140);ctx.stroke();ctx.beginPath();ctx.moveTo(CW-C3,BL);ctx.lineTo(CW-C3,BL-140);ctx.stroke();const dx=CX-C3,dy=RY-(BL-140),R3=Math.round(Math.sqrt(dx*dx+dy*dy));const a1=Math.atan2((BL-140)-RY,C3-CX),a2=Math.atan2((BL-140)-RY,(CW-C3)-CX);ctx.beginPath();ctx.arc(CX,RY,R3,a1,a2,false);ctx.stroke();}
function rE(ctx,el,pv){ctx.globalAlpha=pv?.5:1;ctx.lineCap="round";ctx.lineJoin="round";if(el.type==="line"||el.type==="dash"||el.type==="arrow"){if(el.type==="dash")ctx.setLineDash([14,9]);ctx.strokeStyle=el.color;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(el.x1,el.y1);ctx.lineTo(el.x2,el.y2);ctx.stroke();ctx.setLineDash([]);if(el.type==="arrow"){const a=Math.atan2(el.y2-el.y1,el.x2-el.x1);ctx.beginPath();ctx.moveTo(el.x2,el.y2);ctx.lineTo(el.x2-16*Math.cos(a-Math.PI/6),el.y2-16*Math.sin(a-Math.PI/6));ctx.lineTo(el.x2-16*Math.cos(a+Math.PI/6),el.y2-16*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fillStyle=el.color;ctx.fill();}}else if(el.type==="player"){ctx.beginPath();ctx.arc(el.x,el.y,16,0,Math.PI*2);ctx.fillStyle=el.color;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.9)";ctx.lineWidth=2.2;ctx.stroke();ctx.fillStyle="#fff";ctx.font="bold 13px 'Barlow Condensed',sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(String(el.num),el.x,el.y+.5);}ctx.globalAlpha=1;}

function Pizarra(){
  const{th}=useTheme();const cr=useRef(null);const[tl,setTl]=useState("arrow");const[cl,setCl]=useState("#f97316");const[pn,setPn]=useState(1);const[els,setEls]=useState([]);const[hist,setHist]=useState([]);const dr=useRef(false),or=useRef(null);
  const gp=e=>{const r=cr.current.getBoundingClientRect();return{x:(e.clientX-r.left)*(CW/r.width),y:(e.clientY-r.top)*(CH/r.height)};};
  const rd=useCallback((es,pv=null)=>{const ctx=cr.current?.getContext("2d");if(!ctx)return;ctx.clearRect(0,0,CW,CH);dC(ctx);es.forEach(el=>rE(ctx,el,false));if(pv)rE(ctx,pv,true);},[]);
  useEffect(()=>rd(els),[els,rd]);
  const oD=e=>{const p=gp(e);if(tl==="player"){const el={type:"player",x:p.x,y:p.y,color:cl,num:pn};setHist(h=>[...h,els]);setEls(ps=>[...ps,el]);setPn(n=>n<15?n+1:1);return;}or.current=p;dr.current=true;};
  const oM=e=>{if(!dr.current||!or.current)return;const p=gp(e);rd(els,{type:tl,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color:cl});};
  const oU=e=>{if(!dr.current||!or.current)return;const p=gp(e);if(Math.abs(p.x-or.current.x)>5||Math.abs(p.y-or.current.y)>5){const el={type:tl,x1:or.current.x,y1:or.current.y,x2:p.x,y2:p.y,color:cl};setHist(h=>[...h,els]);setEls(ps=>[...ps,el]);}dr.current=false;or.current=null;};
  const undo=()=>{if(!hist.length)return;const p=hist[hist.length-1];setHist(h=>h.slice(0,-1));setEls(p);};
  const clr=()=>{if(!els.length)return;setHist(h=>[...h,els]);setEls([]);};
  const tools=[{id:"line",icon:"—",label:"Línea",sub:"Continua"},{id:"arrow",icon:"→",label:"Flecha",sub:"Movimiento"},{id:"dash",icon:"╌╌",label:"Pase",sub:"Discontinua"},{id:"player",icon:"①",label:"Jugador",sub:"Numerado"}];
  return <div>
    <SH title="Pizarra" sub="Media cancha · Herramientas de dibujo táctico"/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 210px",gap:16}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",gap:5}}>{tools.map(t=><button key={t.id} onClick={()=>setTl(t.id)} title={t.label} style={{height:36,padding:"0 12px",borderRadius:8,border:`1px solid ${tl===t.id?"#f97316":th.border2}`,background:tl===t.id?"rgba(249,115,22,.15)":th.card2,cursor:"pointer",fontSize:14,color:tl===t.id?"#f97316":th.sub,transition:"all .15s",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t.icon}</button>)}</div>
          <div style={{width:1,height:28,background:th.border2}}/>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>{DC2.map(c=><div key={c} onClick={()=>setCl(c)} style={{width:22,height:22,borderRadius:11,background:c,cursor:"pointer",border:`2px solid ${cl===c?"#fff":"transparent"}`,outline:cl===c?`2px solid ${c}`:"none",outlineOffset:1}}/>)}</div>
          {tl==="player"&&<><div style={{width:1,height:28,background:th.border2}}/><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:th.muted,fontFamily:"Barlow Condensed,sans-serif",textTransform:"uppercase"}}>Nº</span><button onClick={()=>setPn(n=>Math.max(1,n-1))} style={{width:26,height:26,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button><span style={{fontFamily:"DM Mono",fontSize:16,color:"#f97316",minWidth:24,textAlign:"center",fontWeight:700}}>{pn}</span><button onClick={()=>setPn(n=>Math.min(15,n+1))} style={{width:26,height:26,borderRadius:6,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",color:th.sub,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div></>}
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            <button onClick={undo} disabled={!hist.length} style={{width:34,height:34,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub,opacity:hist.length?1:.35}}><RotateCcw size={14}/></button>
            <button onClick={clr} style={{width:34,height:34,borderRadius:7,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={14}/></button>
          </div>
        </div>
        <div style={{borderRadius:8,overflow:"hidden",lineHeight:0,border:`1px solid ${th.border}`}}><canvas ref={cr} width={CW} height={CH} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair",touchAction:"none"}} onMouseDown={oD} onMouseMove={oM} onMouseUp={oU} onMouseLeave={()=>{if(dr.current){dr.current=false;or.current=null;rd(els);}}}/></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div className="card" style={{padding:18}}><p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Herramientas</p>{tools.map(t=><div key={t.id} onClick={()=>setTl(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,cursor:"pointer",background:tl===t.id?"rgba(249,115,22,.1)":th.card2,border:`1px solid ${tl===t.id?"#f97316":th.border}`,marginBottom:6,transition:"all .15s"}}><span style={{fontSize:18,color:tl===t.id?"#f97316":th.sub,minWidth:24,textAlign:"center"}}>{t.icon}</span><div><p style={{fontSize:13,fontFamily:"Barlow Condensed",fontWeight:700,color:tl===t.id?"#f97316":th.text}}>{t.label}</p><p style={{fontSize:10,color:th.muted}}>{t.sub}</p></div></div>)}</div>
        <div className="card" style={{padding:18}}><p style={{fontFamily:"Barlow Condensed",fontSize:12,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Canvas</p><p style={{fontFamily:"DM Mono",fontSize:30,color:"#f97316",fontWeight:700,lineHeight:1}}>{els.length}</p><p style={{fontSize:11,color:th.muted,marginTop:4,marginBottom:14}}>elementos</p><div style={{display:"flex",gap:16}}><div><p style={{fontFamily:"DM Mono",fontSize:18,color:th.sub,fontWeight:600}}>{els.filter(e=>e.type==="player").length}</p><p style={{fontSize:10,color:th.muted}}>jugadores</p></div><div><p style={{fontFamily:"DM Mono",fontSize:18,color:th.sub,fontWeight:600}}>{els.filter(e=>e.type!=="player").length}</p><p style={{fontSize:10,color:th.muted}}>trazados</p></div></div></div>
      </div>
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   12. RECURSOS — Repositorio de URLs con buscador y etiquetas
═══════════════════════════════════════════════════════════════ */
const TAG_COLORS=["#f97316","#3b82f6","#8b5cf6","#10b981","#ef4444","#f59e0b","#06b6d4","#ec4899"];
const tagColor = tag => TAG_COLORS[Math.abs([...tag].reduce((a,c)=>a+c.charCodeAt(0),0))%TAG_COLORS.length];

function Recursos(){
  const{th}=useTheme();const{recursos,setRecursos}=useData();
  const[q,setQ]=useState("");const[sa,setSa]=useState(false);
  const[f,setF]=useState({title:"",url:"",desc:"",tags:""});

  const filtered=recursos.filter(r=>{
    if(!q) return true;
    const s=q.toLowerCase();
    return r.title.toLowerCase().includes(s)||r.desc.toLowerCase().includes(s)||r.url.toLowerCase().includes(s)||(r.tags||[]).some(t=>t.toLowerCase().includes(s));
  });

  const add=()=>{
    if(!f.title||!f.url) return;
    const id=Date.now();
    const tags=f.tags.split(",").map(t=>t.trim()).filter(Boolean);
    setRecursos(prev=>[...prev,{id,...f,tags}]);
    setF({title:"",url:"",desc:"",tags:""});setSa(false);
  };

  const del=id=>setRecursos(prev=>prev.filter(r=>r.id!==id));

  const openUrl=url=>{
    const u=url.startsWith("http")?url:"https://"+url;
    window.open(u,"_blank","noopener");
  };

  // Todas las tags únicas para filtro rápido
  const allTags=[...new Set(recursos.flatMap(r=>r.tags||[]))].slice(0,12);

  return <div>
    <SH title="Recursos" sub="Repositorio de URLs · jugadas, sistemas, federaciones y referencias" right={<Btn onClick={()=>setSa(!sa)} icon={<Plus size={14}/>}>Añadir Recurso</Btn>}/>

    {/* Buscador */}
    <div style={{position:"relative",marginBottom:16}}>
      <Search size={15} color={th.muted} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nombre, descripción, URL o etiqueta…" style={{paddingLeft:38}}/>
    </div>

    {/* Tags de filtro rápido */}
    {allTags.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
      <button onClick={()=>setQ("")} style={{padding:"3px 12px",borderRadius:20,border:`1px solid ${!q?th.accent:th.border2}`,background:!q?"rgba(249,115,22,.1)":"transparent",cursor:"pointer",fontSize:11,color:!q?th.accent:th.muted,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>Todos</button>
      {allTags.map(t=><button key={t} onClick={()=>setQ(t)} style={{padding:"3px 12px",borderRadius:20,border:`1px solid ${q===t?tagColor(t):th.border2}`,background:q===t?tagColor(t)+"18":"transparent",cursor:"pointer",fontSize:11,color:q===t?tagColor(t):th.muted,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t}</button>)}
    </div>}

    {/* Formulario añadir */}
    {sa&&<div className="card" style={{padding:20,marginBottom:16,borderColor:"#f9731640"}}>
      <p style={{fontFamily:"Barlow Condensed",fontSize:18,fontWeight:700,color:"#f97316",marginBottom:14,textTransform:"uppercase"}}>Nuevo Recurso</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div><Lbl>Nombre / Título</Lbl><input value={f.title} onChange={e=>setF(x=>({...x,title:e.target.value}))} placeholder="ej: FastModel Sports"/></div>
        <div><Lbl>URL</Lbl><input value={f.url} onChange={e=>setF(x=>({...x,url:e.target.value}))} placeholder="https://..."/></div>
      </div>
      <div style={{marginBottom:12}}><Lbl>Descripción</Lbl><input value={f.desc} onChange={e=>setF(x=>({...x,desc:e.target.value}))} placeholder="Para qué sirve este recurso…"/></div>
      <div style={{marginBottom:16}}><Lbl>Etiquetas (separadas por comas)</Lbl><input value={f.tags} onChange={e=>setF(x=>({...x,tags:e.target.value}))} placeholder="jugadas, sistemas, vídeo, federación…"/></div>
      <div style={{display:"flex",gap:8}}><Btn onClick={add}>Guardar</Btn><Btn onClick={()=>setSa(false)} variant="ghost">Cancelar</Btn></div>
    </div>}

    {/* Sin resultados */}
    {filtered.length===0&&<div className="card" style={{padding:48,textAlign:"center"}}>
      <Globe size={36} color={th.muted} style={{margin:"0 auto 14px",display:"block"}}/>
      <p style={{color:th.muted,fontSize:14}}>{q?"Sin resultados para esa búsqueda":"No hay recursos añadidos aún"}</p>
      {q&&<button onClick={()=>setQ("")} style={{marginTop:10,padding:"6px 16px",borderRadius:8,border:`1px solid ${th.border2}`,background:"transparent",color:th.sub,cursor:"pointer",fontSize:12}}>Limpiar búsqueda</button>}
    </div>}

    {/* Cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {filtered.map(r=><div key={r.id} className="card" style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"Barlow Condensed",fontSize:19,fontWeight:700,color:th.text,marginBottom:4,lineHeight:1.2}}>{r.title}</h3>
            <p style={{fontSize:11,color:"#f97316",fontFamily:"DM Mono",wordBreak:"break-all",cursor:"pointer"}} onClick={()=>openUrl(r.url)}>{r.url.replace(/^https?:\/\//,"").slice(0,40)}{r.url.length>40?"…":""}</p>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>openUrl(r.url)} title="Abrir" style={{width:30,height:30,borderRadius:7,border:`1px solid ${th.border2}`,background:th.card2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><ExternalLink size={13}/></button>
            <button onClick={()=>del(r.id)} title="Eliminar" style={{width:30,height:30,borderRadius:7,border:"1px solid rgba(239,68,68,.3)",background:"rgba(239,68,68,.07)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}><Trash2 size={13}/></button>
          </div>
        </div>
        {r.desc&&<p style={{fontSize:12,color:th.sub,lineHeight:1.6}}>{r.desc}</p>}
        {(r.tags||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {r.tags.map(t=><span key={t} onClick={()=>setQ(t)} style={{fontSize:10,color:tagColor(t),background:tagColor(t)+"18",padding:"2px 8px",borderRadius:20,border:`1px solid ${tagColor(t)}35`,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{t}</span>)}
        </div>}
      </div>)}
    </div>
  </div>;
}

/* ═══════════════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════
   APP ROOT — Supabase sync
═══════════════════════════════════════════════════════════════ */
export default function App(){
  const[dark,setDarkRaw]=useState(true);
  const[view,setView]=useState("dashboard");
  const[loading,setLoading]=useState(true);
  const[sync,setSync]=useState("loading");

  const[players,  setPlayersRaw]  = useState(DP);
  const[matches,  setMatchesRaw]  = useState(DM);
  const[sessions, setSessionsRaw] = useState(DS);
  const[att,      setAttRaw]      = useState(DA);
  const[recursos, setRecursosRaw] = useState(DR);

  const stateRef = useRef({players:DP,matches:DM,sessions:DS,att:DA,recursos:DR,dark:true});
  const saveTimer = useRef(null);

  // ── Guardar en Supabase con debounce ──
  const persist = useCallback((patch) => {
    stateRef.current = {...stateRef.current,...patch};
    setSync("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const {error} = await sb.from("dashboard").upsert({id:"state",data:stateRef.current,updated_at:new Date().toISOString()});
        if (error) throw error;
        setSync("saved");
      } catch(e) {
        console.error("Supabase save error:",e);
        setSync("offline");
      }
    }, 900);
  }, []);

  // Wrappers
  const setDark     = useCallback(fn=>{const next=typeof fn==="function"?fn(stateRef.current.dark):fn;setDarkRaw(next);persist({dark:next});},[persist]);
  const setPlayers  = useCallback(fn=>setPlayersRaw(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({players:next});return next;}),[persist]);
  const setMatches  = useCallback(fn=>setMatchesRaw(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({matches:next});return next;}),[persist]);
  const setSessions = useCallback(fn=>setSessionsRaw(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({sessions:next});return next;}),[persist]);
  const setAtt      = useCallback(fn=>setAttRaw(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({att:next});return next;}),[persist]);
  const setRecursos = useCallback(fn=>setRecursosRaw(prev=>{const next=typeof fn==="function"?fn(prev):fn;persist({recursos:next});return next;}),[persist]);

  // ── Carga inicial + suscripción en tiempo real ──
  useEffect(()=>{
    const load = async () => {
      try {
        const{data,error}=await sb.from("dashboard").select("data").eq("id","state").single();
        if (!error && data?.data) {
          const d=data.data;
          if(d.players)  {setPlayersRaw(d.players);  stateRef.current.players=d.players;}
          if(d.matches)  {setMatchesRaw(d.matches);  stateRef.current.matches=d.matches;}
          if(d.sessions) {setSessionsRaw(d.sessions);stateRef.current.sessions=d.sessions;}
          if(d.att)      {setAttRaw(d.att);           stateRef.current.att=d.att;}
          if(d.recursos) {setRecursosRaw(d.recursos); stateRef.current.recursos=d.recursos;}
          if(d.dark!==undefined){setDarkRaw(d.dark);  stateRef.current.dark=d.dark;}
        } else if(error?.code==="PGRST116"){
          // Fila no existe, la creamos con defaults
          await sb.from("dashboard").upsert({id:"state",data:stateRef.current});
        }
      } catch(e){ console.error("Load error:",e); setSync("offline"); }
      setLoading(false); setSync("saved");
    };
    load();

    // Suscripción realtime para sync entre dispositivos
    const sub = sb.channel("dashboard_changes")
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"dashboard",filter:"id=eq.state"},payload=>{
        const d=payload.new?.data;
        if(!d) return;
        if(d.players)  setPlayersRaw(d.players);
        if(d.matches)  setMatchesRaw(d.matches);
        if(d.sessions) setSessionsRaw(d.sessions);
        if(d.att)      setAttRaw(d.att);
        if(d.recursos) setRecursosRaw(d.recursos);
        if(d.dark!==undefined) setDarkRaw(d.dark);
        setSync("saved");
      })
      .subscribe();
    return ()=>sb.removeChannel(sub);
  },[]);

  const th=dark?DARK:LIGHT;
  const AV=VIEWS[view]||Dashboard;

  if(loading) return <>
    <GS th={th}/>
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:th.bg,flexDirection:"column",gap:18}}>
      <div style={{width:44,height:44,borderRadius:11,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:20,fontWeight:900,color:"#fff"}}>CB</div>
      <p style={{fontFamily:"Barlow Condensed",fontSize:22,fontWeight:700,color:th.text,letterSpacing:2,textTransform:"uppercase"}}>Cargando…</p>
      <Loader size={20} color="#f97316" style={{animation:"spin 1s linear infinite"}}/>
    </div>
  </>;

  return (
    <ThemeCtx.Provider value={{th,dark,setDark}}>
      <DataCtx.Provider value={{players,setPlayers,matches,setMatches,sessions,setSessions,att,setAtt,recursos,setRecursos}}>
        <GS th={th}/>
        <div style={{display:"flex",height:"100vh",overflow:"hidden",background:th.bg}}>
          {/* SIDEBAR */}
          <aside style={{width:222,flexShrink:0,background:th.nav,display:"flex",flexDirection:"column",height:"100vh",overflowY:"auto",borderRight:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{padding:"20px 20px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Barlow Condensed",fontSize:15,fontWeight:900,color:"#fff",letterSpacing:-.5,flexShrink:0}}>CB</div>
                <div>
                  <p style={{fontFamily:"Barlow Condensed",fontSize:15,fontWeight:800,color:"#f1f5f9",letterSpacing:.5,lineHeight:1.1}}>Binissalem</p>
                  <p style={{fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"DM Mono"}}>Sénior A · 2024/25</p>
                </div>
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
                <div style={{marginLeft:"auto",width:28,height:16,borderRadius:8,background:dark?"rgba(255,255,255,.12)":"#f97316",position:"relative",transition:"background .2s"}}>
                  <div style={{position:"absolute",top:2,left:dark?2:12,width:12,height:12,borderRadius:6,background:"#fff",transition:"left .2s"}}/>
                </div>
              </div>
            </div>
          </aside>
          {/* MAIN */}
          <main style={{flex:1,overflowY:"auto",padding:"28px 32px",background:th.bg}}>
            <AV/>
          </main>
        </div>
      </DataCtx.Provider>
    </ThemeCtx.Provider>
  );
}
