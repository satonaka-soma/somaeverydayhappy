// React UMD
const { useState, useEffect, useMemo } = React;

/* ========= utils ========= */
const todayKey = () => new Date().toLocaleDateString("en-CA");
const keyOf = (d) => new Date(d).toLocaleDateString("en-CA");
const fmtJP = (d) => new Date(d).toLocaleDateString("ja-JP",{ year:"numeric", month:"short", day:"numeric" });
const uid = () => Math.random().toString(36).slice(2,10);
const daysDiff = (a,b)=>Math.floor((new Date(a)-new Date(b))/(1000*60*60*24));

function generateMonth(date){
  const y=date.getFullYear(), m=date.getMonth();
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const start=new Date(first); start.setDate(first.getDate()-((first.getDay()+6)%7));
  const end=new Date(last); end.setDate(last.getDate()+ (7-((last.getDay()+6)%7)-1));
  const days=[]; for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) days.push(new Date(d));
  return days;
}

/* ========= streak ========= */
const STREAK_SPECIALS = [
  { n:30, icon:"party",   label:"30日連続!!", effect:"confetti" },
  { n:20, icon:"gem",     label:"20日連続!!" },
  { n:15, icon:"bouquet", label:"15日連続!!" },
  { n:10, icon:"car",     label:"10日連続!!" },
  { n:5,  icon:"gift",    label:"5日連続!!" },
  { n:3,  icon:"frog",    label:"3日連続!!" },
];
function computeStreakFromDate(stamps, restDays, dateKey){
  let s=0; const d0=new Date(dateKey);
  for(let i=0;i<500;i++){
    const d=new Date(d0); d.setDate(d0.getDate()-i); const k=keyOf(d);
    const mark=!!(stamps&&stamps[k]); const rest=!!(restDays&&restDays[k]);
    if(mark||rest) s++; else break;
  }
  return s;
}

/* ========= SVG ========= */
const Svg = {
  leaf:(p)=>(<svg viewBox="0 0 64 64" {...p}><path d="M56 8C38 10 22 18 14 30S8 56 8 56s14 2 26-6S54 26 56 8Z" fill="#10b981"/><path d="M32 16c0 20-4 28-20 40" stroke="#065f46" strokeWidth="3" fill="none"/></svg>),
  paw:(p)=>(<svg viewBox="0 0 64 64" {...p}><circle cx="20" cy="20" r="6" fill="#0ea5e9"/><circle cx="44" cy="20" r="6" fill="#0ea5e9"/><circle cx="28" cy="12" r="5" fill="#38bdf8"/><circle cx="36" cy="12" r="5" fill="#38bdf8"/><ellipse cx="32" cy="40" rx="14" ry="10" fill="#0ea5e9"/></svg>),
  flower:(p)=>(<svg viewBox="0 0 64 64" {...p}><circle cx="32" cy="32" r="6" fill="#f59e0b"/><g fill="#f472b6"><circle cx="16" cy="24" r="10"/><circle cx="48" cy="24" r="10"/><circle cx="16" cy="44" r="10"/><circle cx="48" cy="44" r="10"/></g></svg>),
  frog:(p)=>(<svg viewBox="0 0 64 64" {...p}><circle cx="22" cy="20" r="8" fill="#34d399"/><circle cx="42" cy="20" r="8" fill="#34d399"/><ellipse cx="32" cy="40" rx="18" ry="14" fill="#10b981"/><circle cx="22" cy="20" r="3" fill="#111"/><circle cx="42" cy="20" r="3" fill="#111"/></svg>),
  gift:(p)=>(<svg viewBox="0 0 64 64" {...p}><rect x="8" y="24" width="48" height="28" rx="4" fill="#ef4444"/><rect x="30" y="16" width="4" height="40" fill="#fbbf24"/><rect x="8" y="34" width="48" height="4" fill="#fbbf24"/><path d="M24 20c0-6 8-8 8-2 0-6 8-4 8 2" stroke="#fbbf24" strokeWidth="4" fill="none"/></svg>),
  car:(p)=>(<svg viewBox="0 0 64 64" {...p}><rect x="10" y="28" width="44" height="14" rx="4" fill="#3b82f6"/><path d="M16 28l8-8h16l8 8z" fill="#60a5fa"/><circle cx="22" cy="46" r="6" fill="#111"/><circle cx="42" cy="46" r="6" fill="#111"/></svg>),
  bouquet:(p)=>(<svg viewBox="0 0 64 64" {...p}><g fill="#f87171"><circle cx="18" cy="20" r="6"/><circle cx="32" cy="16" r="6"/><circle cx="46" cy="20" r="6"/></g><path d="M32 22v28" stroke="#16a34a" strokeWidth="3"/><path d="M20 34l12 16M44 34L32 50" stroke="#16a34a" strokeWidth="3"/></svg>),
  gem:(p)=>(<svg viewBox="0 0 64 64" {...p}><polygon points="16,24 32,8 48,24 40,48 24,48" fill="#22d3ee"/><path d="M32 8L24 48M32 8l8 40" stroke="#0891b2" strokeWidth="2" fill="none"/></svg>),
  party:(p)=>(<svg viewBox="0 0 64 64" {...p}><path d="M10 52l14-30 30 14z" fill="#f59e0b"/><g fill="#f43f5e"><circle cx="36" cy="16" r="3"/><circle cx="48" cy="10" r="2"/><circle cx="20" cy="12" r="2"/></g></svg>),
  capsuleTop:(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 1 30-30h40a30 30 0 0 1 30 30" fill="#fde68a" stroke="#f59e0b" strokeWidth="4"/></svg>),
  capsuleBottom:(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 0 30 30h40a30 30 0 0 0 30-30" fill="#fca5a5" stroke="#ef4444" strokeWidth="4"/></svg>),
};
const NORMAL_ICONS=["leaf","paw","flower"];

/* ========= keyframes ========= */
const keyframesCSS=`
@keyframes sparkle{0%{filter:drop-shadow(0 0 0 rgba(255,255,255,0));transform:scale(1)}50%{filter:drop-shadow(0 0 12px rgba(255,255,255,1));transform:scale(1.12)}100%{filter:drop-shadow(0 0 0 rgba(255,255,255,0));transform:scale(1)}}
@keyframes pop{0%{transform:translateY(-12px) scale(.9);opacity:0}60%{transform:translateY(0) scale(1.06);opacity:1}100%{transform:translateY(0) scale(1);opacity:1}}
@keyframes confetti{0%{transform:translateY(-10%) rotate(0);opacity:1}100%{transform:translateY(120vh) rotate(720deg);opacity:0}}
@keyframes spinSnap{0%{transform:rotate(0)}70%{transform:rotate(320deg)}100%{transform:rotate(360deg)}}
.animate-sparkle{animation:sparkle .9s ease-in-out}
.animate-pop{animation:pop .5s cubic-bezier(.2,.9,.2,1)}
.animate-confetti{animation:confetti 1.5s ease-in forwards}
.animate-spin-slow-snap{animation:spinSnap 1.1s ease-out}
`;

/* ========= backgrounds ========= */
function IslandBackground(){
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-green-100 via-green-50 to-emerald-100"/>
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-emerald-300 to-emerald-200"
           style={{borderTopLeftRadius:"50%",borderTopRightRadius:"50%"}}/>
    </div>
  );
}
function NightBackground(){
  const stars=Array.from({length:120}).map((_,i)=>i);
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950 via-slate-900 to-black">
      {stars.map(i=><span key={i} className="absolute rounded-full bg-white" style={{width:2,height:2,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,opacity:.8}}/>)}
    </div>
  );
}
function NotebookBackground(){
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" style={{backgroundColor:"#fefefe",backgroundImage:"repeating-linear-gradient(0deg,#e5e7eb 0px,#e5e7eb 1px,transparent 1px,transparent 32px)"}}/>
  );
}
function WoodBackground(){
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" style={{background:"linear-gradient(135deg,#f8f5f0,#f3ece3 35%,#efe5d8 70%)"}}/>
  );
}
function Background({theme}){
  if(theme==="night") return <NightBackground/>;
  if(theme==="notebook") return <NotebookBackground/>;
  if(theme==="wood") return <WoodBackground/>;
  return <IslandBackground/>;
}

/* ========= theme vars ========= */
function useThemeVars(theme){
  return useMemo(()=>{
    if(theme==="night"){
      return { style:{ "--fg":"#0f172a","--fgMuted":"#475569","--cardBg":"rgba(255,255,255,.85)","--chipBg":"rgba(255,255,255,.8)","--accent":"#059669" },
               gachaText:"#0f172a", gachaShadow:"0 1px 2px rgba(255,255,255,.7)" };
    }
    if(theme==="wood"){
      return { style:{ "--fg":"#3a2b25","--fgMuted":"#6b5a52","--cardBg":"rgba(255,255,255,.86)","--chipBg":"rgba(255,255,255,.8)","--accent":"#10b981" },
               gachaText:"#231815", gachaShadow:"0 1px 2px rgba(255,255,255,.6), 0 0 8px rgba(0,0,0,.15)" };
    }
    if(theme==="notebook"){
      return { style:{ "--fg":"#111827","--fgMuted":"#6b7280","--cardBg":"rgba(255,255,255,.86)","--chipBg":"rgba(255,255,255,.8)","--accent":"#10b981" },
               gachaText:"#111827", gachaShadow:"0 1px 2px rgba(255,255,255,.7)" };
    }
    return { // island
      style:{ "--fg":"#0f172a","--fgMuted":"#475569","--cardBg":"rgba(255,255,255,.85)","--chipBg":"rgba(255,255,255,.8)","--accent":"#059669" },
      gachaText:"#0f172a", gachaShadow:"0 1px 2px rgba(255,255,255,.7)"
    };
  },[theme]);
}

/* ========= confetti ========= */
function ConfettiOverlay(){
  const pieces=Array.from({length:80}).map((_,i)=>i);
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {pieces.map(i=>(
        <span key={i} className="absolute animate-confetti" style={{left:`${Math.random()*100}%`,top:`-5%`,animationDelay:`${Math.random()*.8}s`,fontSize:`${12+Math.random()*16}px`,transform:`rotate(${Math.random()*360}deg)`}}>
          {["🎊","✨","🎉","🌸","🍃"][i%5]}
        </span>
      ))}
    </div>
  );
}

/* ========= App ========= */
function App(){
  const [habits,setHabits]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_v10")||"[]")}catch{return[]}});
  const [theme,setTheme]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_theme")||'"island"')}catch{return "island"}});
  const [reduceMotion,setReduceMotion]=useState(false);
  const [view,setView]=useState("cards");
  const [currentMonth,setCurrentMonth]=useState(new Date());
  const [banner,setBanner]=useState(null);

  const [gachaHistory,setGachaHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_gacha")||"{}")}catch{return{}}});
  const [pointsSpent,setPointsSpent]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_points_spent")||"0")}catch{return 0}});
  const [redeemHistory,setRedeemHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_redeem_hist")||"[]")}catch{return[]}});

  useEffect(()=>localStorage.setItem("stampcard_v10",JSON.stringify(habits)),[habits]);
  useEffect(()=>localStorage.setItem("stampcard_theme",JSON.stringify(theme)),[theme]);
  useEffect(()=>localStorage.setItem("stampcard_gacha",JSON.stringify(gachaHistory)),[gachaHistory]);
  useEffect(()=>localStorage.setItem("stampcard_points_spent",JSON.stringify(pointsSpent)),[pointsSpent]);
  useEffect(()=>localStorage.setItem("stampcard_redeem_hist",JSON.stringify(redeemHistory)),[redeemHistory]);

  const stampPoints=useMemo(()=>habits.reduce((s,h)=>s+Object.values(h.stamps||{}).filter(Boolean).length,0),[habits]);
  const bonusPoints=useMemo(()=>Object.values(gachaHistory).reduce((s,r)=>s+(r?.bonus||0),0),[gachaHistory]);
  const totalPoints=stampPoints+bonusPoints;
  const availablePoints=Math.max(0,totalPoints-pointsSpent);

  const days=useMemo(()=>generateMonth(currentMonth),[currentMonth]);

  const addHabit=(name,rule)=>setHabits(prev=>[...prev,{id:uid(),name,rule,created_at:todayKey(),stamps:{},restDays:{},rewards:[]}]);
  const deleteHabit=(id)=>{ if(confirm("このカードを削除しますか？")) setHabits(prev=>prev.filter(h=>h.id!==id)); };

  const stampToday=(habitId)=>{
    const k=todayKey();
    setHabits(prev=>prev.map(h=>{
      if(h.id!==habitId)return h;
      const next={...h,stamps:{...(h.stamps||{})},restDays:{...(h.restDays||{})}};
      next.stamps[k]=!next.stamps[k];
      if(next.restDays[k]) delete next.restDays[k];
      return next;
    }));
    const h=habits.find(x=>x.id===habitId);
    const newStamps={...(h?.stamps||{}),[k]:!(h?.stamps?.[k])};
    const streak=computeStreakFromDate(newStamps,h?.restDays||{},k);
    const special=STREAK_SPECIALS.find(s=>s.n===streak);
    if(special){ setBanner({text:special.label,iconKey:special.icon,effect:special.effect}); setTimeout(()=>setBanner(null),2400); }
  };

  const toggleRest=(habitId,dateKey)=>{
    if(daysDiff(todayKey(),dateKey)>-2) return;
    setHabits(prev=>prev.map(h=>{
      if(h.id!==habitId) return h;
      const next={...h,restDays:{...(h.restDays||{})}};
      next.restDays[dateKey]=!next.restDays[dateKey];
      return next;
    }));
  };

  const addReward=(habitId,threshold,label)=>{
    if(!threshold||threshold<=0) return;
    setHabits(prev=>prev.map(h=>h.id===habitId?{...h,rewards:[...(h.rewards||[]),{threshold,label}].sort((a,b)=>a.threshold-b.threshold)}:h));
  };
  const removeReward=(habitId,idx)=>{
    setHabits(prev=>prev.map(h=>h.id!==habitId?h:({...h,rewards:(h.rewards||[]).filter((_,i)=>i!==idx)})));
  };

  const redeemFromCard=(habitId,rewardIndex)=>{
    const h=habits.find(x=>x.id===habitId); if(!h) return;
    const r=(h.rewards||[])[rewardIndex]; if(!r) return;
    if(availablePoints<r.threshold){ alert("ポイントが足りません"); return; }
    setPointsSpent(ps=>ps+r.threshold);
    setRedeemHistory(prev=>[{id:uid(),at:new Date().toISOString(),label:r.label,cost:r.threshold,habitId},...prev].slice(0,200));
    setBanner({text:`「${r.label}」を受け取り！`,iconKey:"party",effect:"confetti"}); setTimeout(()=>setBanner(null),2000);
  };

  const [newName,setNewName]=useState("");
  const [newRule,setNewRule]=useState("");
  const createByButton=()=>{ addHabit(newName||"マイ・スタンプ", newRule||"毎日1回、できたらスタンプ"); setNewName(""); setNewRule(""); };

  const themeVars=useThemeVars(theme);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{...themeVars.style,color:"var(--fg)"}}>
      <Background theme={theme}/>
      <style>{keyframesCSS}</style>

      <header className="sticky top-0 z-20 border-b" style={{background:"rgba(255,255,255,.75)",backdropFilter:"blur(6px)"}}>
        <div className="max-w-5xl mx-auto px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl">🍃</span>
            <h1 className="text-lg md:text-xl font-bold" style={{color:"var(--fg)"}}>スタンプカード</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-2xl border" style={{background:"var(--chipBg)", color:"var(--fg)"}}>
                <span style={{opacity:.7}}>総pt</span> <b className="text-xl md:text-2xl align-middle">{totalPoints}</b>
                <span className="mx-1" style={{opacity:.5}}>/</span>
                <span style={{opacity:.7}}>可</span> <b className="text-xl md:text-2xl align-middle" style={{color:"var(--accent)"}}>{availablePoints}</b>
              </div>
            </div>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar flex-nowrap items-center">
            {["cards","shop","reward_settings"].map(t=>(
              <button key={t} onClick={()=>setView(t)}
                className="h-9 px-3 rounded-xl border whitespace-nowrap text-sm"
                style={{background: view===t?"var(--accent)":"var(--chipBg)", color: view===t?"#fff":"var(--fg)"}}>
                {t==="cards"?"カード":t==="shop"?"ご褒美":"ごほうびせってい"}
              </button>
            ))}
            <select value={theme} onChange={(e)=>setTheme(e.target.value)} className="h-9 px-2 rounded-lg border text-sm ml-auto" style={{background:"var(--chipBg)",color:"var(--fg)"}}>
              <option value="island">アイランド</option>
              <option value="notebook">ノート</option>
              <option value="wood">木目</option>
              <option value="night">夜空</option>
            </select>
            <label className="flex items-center gap-1 text-xs whitespace-nowrap ml-1" style={{color:"var(--fgMuted)"}}>
              <input type="checkbox" checked={reduceMotion} onChange={(e)=>setReduceMotion(e.target.checked)} />
              アニメ少なめ
            </label>
          </div>
        </div>
      </header>

      {banner && (
        <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl shadow-xl border ${reduceMotion?"":"animate-pop"}`} style={{background:"rgba(255,247,237,.95)",color:"#7c2d12"}}>
          <span className="font-semibold align-middle">{banner.text}</span>
        </div>
      )}
      {banner?.effect==="confetti" && !reduceMotion && <ConfettiOverlay/>}

      {view==="cards" ? (
        <main className="relative z-10 max-w-5xl mx-auto px-4 py-6">
          <div className="rounded-2xl shadow-sm border p-4 mb-4" style={{background:"var(--cardBg)"}}>
            <div className="font-semibold mb-3 text-center" style={{color:"var(--fg)"}}>今日のガチャ</div>
            <div className="w-full flex items-center justify-center">
              {gachaHistory[todayKey()] ? (
                <div className="flex items-center gap-2 text-sm" style={{color:"var(--fg)"}}>
                  <span>結果：</span>
                  {gachaHistory[todayKey()].outcome==="miss"     && <span className="px-2 py-1 rounded-lg border" style={{background:"rgba(0,0,0,.04)"}}>残念…また明日！</span>}
                  {gachaHistory[todayKey()].outcome==="hit"      && <span className="px-2 py-1 rounded-lg border" style={{background:"rgba(251,191,36,.2)"}}>あたり！+1pt</span>}
                  {gachaHistory[todayKey()].outcome==="jackpot"  && <span className="px-2 py-1 rounded-lg border" style={{background:"rgba(236,72,153,.2)"}}>超大当たり！！+10pt</span>}
                </div>
              ) : (
                <button onClick={()=>{
                  if(gachaHistory[todayKey()]) return;
                  setBanner({text:"ガチャ回転中…",iconKey:"gift"});
                  setTimeout(()=>{
                    const r=Math.random(); let outcome="miss", bonus=0;
                    if(r<0.01){ outcome="jackpot"; bonus=10; }
                    else if(r<0.11){ outcome="hit"; bonus=1; }
                    setGachaHistory(prev=>{ const n={...prev}; n[todayKey()]={outcome,bonus,at:new Date().toISOString()}; return n; });
                    if(outcome==="jackpot") setBanner({text:"超大当たり!! +10pt",iconKey:"gem",effect:"confetti"});
                    else if(outcome==="hit") setBanner({text:"あたり！ +1pt",iconKey:"gift"});
                    else setBanner(null);
                  },1000);
                }} className={`relative w-36 h-36 md:w-44 md:h-44 rounded-full shadow-xl overflow-hidden ${reduceMotion?"":"animate-spin-slow-snap"}`}>
                  <div className="absolute inset-x-0 top-3 flex items-center justify-center"><Svg.capsuleTop className="w-32 h-16"/></div>
                  <div className="absolute inset-x-0 bottom-3 flex items-center justify-center"><Svg.capsuleBottom className="w-32 h-16"/></div>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-xl"
                       style={{color:useThemeVars(theme).gachaText, textShadow:useThemeVars(theme).gachaShadow}}>回す！</div>
                </button>
              )}
            </div>
            <div className="text-xs mt-2 text-center" style={{color:"var(--fgMuted)"}}>ポイント：スタンプ + ボーナス（結果は自動加算）</div>
          </div>

          <div className="rounded-2xl shadow-sm border p-4 mb-6" style={{background:"var(--cardBg)"}}>
            <div className="font-semibold mb-3" style={{color:"var(--fg)"}}>新しいスタンプカード</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="名前（例：英語シャドーイング）" className="px-3 py-2 rounded-xl border w-full" style={{background:"var(--chipBg)",color:"var(--fg)"}}/>
              <input placeholder="ルール（例：1日15分やったら押す）" className="px-3 py-2 rounded-xl border w-full" style={{background:"var(--chipBg)",color:"var(--fg)"}}/>
              <button className="px-4 py-2 rounded-xl" style={{background:"var(--accent)",color:"#fff"}}>作成</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <button className="h-9 px-3 rounded-xl border" style={{background:"var(--chipBg)",color:"var(--fg)"}}>← 前月</button>
              <div className="font-semibold" style={{color:"var(--fg)"}}>{currentMonth.getFullYear()}年 {currentMonth.getMonth()+1}月</div>
              <button className="h-9 px-3 rounded-xl border" style={{background:"var(--chipBg)",color:"var(--fg)"}}>翌月 →</button>
              <button className="h-9 px-3 rounded-xl border" style={{background:"var(--chipBg)",color:"var(--fg)"}}>今月</button>
            </div>
            <div className="text-sm rounded-xl px-3 py-1.5 border" style={{background:"var(--chipBg)",color:"var(--fg)"}}>
              総pt: <b className="text-lg align-middle">{totalPoints}</b> / 使用済: {pointsSpent} / 使用可能: <b className="text-lg align-middle" style={{color:"var(--accent)"}}>{availablePoints}</b>
            </div>
          </div>

          {/* ここからカレンダー（縦長対策として .aspect-square が効く） */}
          <div className="rounded-3xl border shadow-sm overflow-hidden" style={{background:"var(--cardBg)"}}>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 text-xs mb-1 font-medium" style={{color:"var(--fg)"}}>
                {["月","火","水","木","金","土","日"].map(w=><div key={w} className="text-center">{w}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {generateMonth(currentMonth).map((d,idx)=>{
                  const k=keyOf(d);
                  const marked=false, rest=false;
                  const isToday=k===todayKey();
                  const isOtherMonth=d.getMonth()!==currentMonth.getMonth();
                  const special=null;
                  const iconKey=marked?NORMAL_ICONS[idx%NORMAL_ICONS.length]:null;
                  return (
                    <div key={k} className="relative">
                      <button
                        className={`relative w-full aspect-square rounded-2xl border flex items-center justify-center select-none ${isOtherMonth?'opacity-60':''} ${isToday?'ring-2':''}`}
                        style={{
                          background: marked? "rgba(16,185,129,.92)": (rest? "rgba(16,185,129,.10)":"rgba(16,185,129,.12)"),
                          borderColor: marked? "#065f46":"rgba(16,185,129,.35)",
                          color: marked? "#fff":"var(--fg)"
                        }}
                      >
                        <span className="absolute top-1 left-1 text-[12px]" style={{opacity: marked ? .9 : .8}}>{d.getDate()}</span>
                        {iconKey ? (
                          <div className={marked?"animate-sparkle":""}>{React.createElement(Svg[iconKey],{className:"w-10 h-10"})}</div>
                        ) : (!rest && <Svg.leaf className="w-8 h-8" style={{opacity:.2}}/>)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* カレンダーここまで */}

        </main>
      ) : null}

      <footer className="relative z-10 max-w-5xl mx-auto px-4 py-8 text-xs" style={{color:"var(--fgMuted)"}}>
        ローカル保存（localStorage）。端末を変えると共有されません。
      </footer>
    </div>
  );
}

/* ========= mount ========= */
(function mount(){
  function go(){
    const root=document.getElementById('root');
    if(!root) return setTimeout(go,20);
    if(ReactDOM.createRoot){
      ReactDOM.createRoot(root).render(<App/>);
    }else{
      ReactDOM.render(<App/>, root);
    }
  }
  go();
})();
