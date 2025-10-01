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
  const start=new Date(first); start.setDate(first.getDate()-((first.getDay()+6)%7)); // 月曜始まり
  const end=new Date(last); end.setDate(last.getDate()+(7-((last.getDay()+6)%7)-1));
  const days=[]; for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) days.push(new Date(d));
  return days;
}

/* ========= SVG ========= */
const Svg = {
  leaf:(p)=>(<svg viewBox="0 0 64 64" {...p}><path d="M56 8C38 10 22 18 14 30S8 56 8 56s14 2 26-6S54 26 56 8Z" fill="#10b981"/><path d="M32 16c0 20-4 28-20 40" stroke="#065f46" strokeWidth="3" fill="none"/></svg>),
  capsuleTop:(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 1 30-30h40a30 30 0 0 1 30 30" fill="#fde68a" stroke="#f59e0b" strokeWidth="4"/></svg>),
  capsuleBottom:(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 0 30 30h40a30 30 0 0 0 30-30" fill="#fca5a5" stroke="#ef4444" strokeWidth="4"/></svg>),
};

/* ========= App ========= */
function App(){
  // 状態
  const [habits,setHabits]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_v10")||"[]")}catch{return[]}});
  const [currentMonth,setCurrentMonth]=useState(new Date());
  const [reduceMotion,setReduceMotion]=useState(false);
  const [banner,setBanner]=useState(null);

  useEffect(()=>localStorage.setItem("stampcard_v10",JSON.stringify(habits)),[habits]);

  // デモ用：カードが無いとき1枚だけ自動作成（空だとUI確認できないため）
  useEffect(()=>{
    if(habits.length===0){
      setHabits([{id:uid(),name:"あ",rule:"あ",created_at:todayKey(),stamps:{},restDays:{},rewards:[]}]);
    }
  },[]); // 初回のみ

  const days = useMemo(()=>generateMonth(currentMonth),[currentMonth]);

  // 本来の「今日押す」
  const stampToday = (hid)=>{
    const k=todayKey();
    setHabits(prev=>prev.map(h=>{
      if(h.id!==hid) return h;
      const next={...h,stamps:{...(h.stamps||{})},restDays:{...(h.restDays||{})}};
      next.stamps[k]=!next.stamps[k];
      if(next.restDays[k]) delete next.restDays[k];
      return next;
    }));
  };

  // 休息トグル
  const toggleRest=(hid,k)=>{
    if(daysDiff(todayKey(),k)>-2) return;
    setHabits(prev=>prev.map(h=>{
      if(h.id!==hid) return h;
      const next={...h,restDays:{...(h.restDays||{})}};
      next.restDays[k]=!next.restDays[k];
      return next;
    }));
  };

  return (
    <div>
      {/* ヘッダー */}
      <header className="sticky">
        <div className="container" style="padding:10px 16px">
          <div className="row gap12">
            <div className="title">スタンプカード</div>
            <div className="row gap8" style="margin-left:auto">
              <label className="row gap8 muted" style="font-size:12px">
                <input type="checkbox" checked={reduceMotion}
                       onChange={(e)=>setReduceMotion(e.target.checked)} />アニメ少なめ
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style="padding:16px 16px 32px">
        {/* ガチャ（見た目だけ。ロジックは省略） */}
        <section className="section card pad" style="text-align:center">
          <div style="font-weight:600;margin-bottom:8px">今日のガチャ</div>
          <button className={"spin btn"} style="width:176px;height:176px;border-radius:999px;position:relative;box-shadow:0 12px 24px rgba(0,0,0,.12)">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;color:#0f172a;text-shadow:0 1px 2px rgba(255,255,255,.7)">回す！</div>
            <div style="position:absolute;left:0;right:0;top:12px;display:flex;justify-content:center"><Svg.capsuleTop style={{width:128,height:64}}/></div>
            <div style="position:absolute;left:0;right:0;bottom:12px;display:flex;justify-content:center"><Svg.capsuleBottom style={{width:128,height:64}}/></div>
          </button>
          <div className="muted" style="font-size:12px;margin-top:8px">ポイント：スタンプ + ボーナス（結果は自動加算）</div>
        </section>

        {/* 月移動 */}
        <section className="section hstack">
          <div className="row gap8">
            <button className="btn" onclick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1))}>← 前月</button>
            <div style="font-weight:600">{currentMonth.getFullYear()}年 {currentMonth.getMonth()+1}月</div>
            <button className="btn" onclick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1))}>翌月 →</button>
            <button className="btn" onclick={()=>setCurrentMonth(new Date())}>今月</button>
          </div>
        </section>

        {/* カード（1枚分） */}
        {habits.map(h=>{
          const {stamps={},restDays={}}=h;
          return (
            <section className="section card pad">
              {/* ヘッダ */}
              <div className="hstack">
                <div>
                  <div style="font-weight:700;font-size:16px">{h.name}</div>
                  <div className="muted" style="font-size:14px">{h.rule}</div>
                </div>
                <div className="row gap8">
                  <button className="btn" onclick={()=>stampToday(h.id)}>できた！</button>
                </div>
              </div>

              {/* 曜日 */}
              <div className="weekday" style="margin-top:8px">月 火 水 木 金 土 日</div>

              {/* カレンダー（7列固定） */}
              <div className="grid7">
                {days.map((d,idx)=>{
                  const k=keyOf(d);
                  const isOtherMonth=d.getMonth()!==currentMonth.getMonth();
                  const isToday=k===todayKey();
                  const rest=!!restDays[k];
                  const marked=!!stamps[k];

                  // 色
                  let bg="rgba(16,185,129,.12)", border="rgba(16,185,129,.35)", color="var(--fg)";
                  if(marked){ bg="rgba(16,185,129,.92)"; border="#065f46"; color="#fff"; }

                  return (
                    <div className="square" key={k} title={fmtJP(k)}>
                      <button className={"inner"+(isOtherMonth?" dim":"")+(isToday?" today":"")}
                              style={{background:bg,borderColor:border,color:color}}
                              oncontextmenu={(e)=>{e.preventDefault(); if(daysDiff(todayKey(),k)<=-2) toggleRest(h.id,k);}}>
                        <span className="day">{d.getDate()}</span>
                        {marked
                          ? <Svg.leaf style={{width:40,height:40,filter:"drop-shadow(0 0 0 rgba(0,0,0,0))"}}/>
                          : (!rest && <Svg.leaf style={{width:28,height:28,opacity:.2}}/>)}
                        {rest && <span style="position:absolute;right:4px;bottom:4px;font-size:11px;background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:0 4px">休</span>}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="muted" style="font-size:12px;margin-top:8px">
                ※ 休息日は二日後以降（当日・明日は不可）。PC:右クリック / スマホ:長押し
              </div>
            </section>
          );
        })}
      </main>

      {banner && <div className="banner">{banner}</div>}
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
