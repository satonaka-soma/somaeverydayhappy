// React UMD
const { useState, useEffect, useMemo } = React;

/* ========= utils ========= */
const todayKey = () => new Date().toLocaleDateString("en-CA");
const keyOf     = (d) => new Date(d).toLocaleDateString("en-CA");
const fmtJP     = (d) => new Date(d).toLocaleDateString("ja-JP",{ year:"numeric", month:"short", day:"numeric" });
const uid       = () => Math.random().toString(36).slice(2,10);
const daysDiff  = (a,b)=>Math.floor((new Date(a)-new Date(b))/(1000*60*60*24));

function generateMonth(date){
  const y=date.getFullYear(), m=date.getMonth();
  const first=new Date(y,m,1), last=new Date(y,m+1,0);
  const start=new Date(first); start.setDate(first.getDate()-((first.getDay()+6)%7)); // 月曜始まり
  const end=new Date(last); end.setDate(last.getDate() + (7-((last.getDay()+6)%7)-1));
  const days=[]; for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)) days.push(new Date(d));
  return days;
}

/* ========= very small SVG ========= */
const Leaf = (p)=>(<svg viewBox="0 0 64 64" {...p}><path d="M56 8C38 10 22 18 14 30S8 56 8 56s14 2 26-6S54 26 56 8Z" fill="#10b981"/><path d="M32 16c0 20-4 28-20 40" stroke="#065f46" strokeWidth="3" fill="none"/></svg>);
const CapTop=(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 1 30-30h40a30 30 0 0 1 30 30" fill="#fde68a" stroke="#f59e0b" strokeWidth="4"/></svg>);
const CapBot=(p)=>(<svg viewBox="0 0 120 80" {...p}><path d="M10 40a30 30 0 0 0 30 30h40a30 30 0 0 0 30-30" fill="#fca5a5" stroke="#ef4444" strokeWidth="4"/></svg>);

/* ========= App ========= */
function App(){
  // 状態
  const [habits,setHabits]=useState(()=>{try{return JSON.parse(localStorage.getItem("stampcard_v10")||"[]")}catch{return[]}});
  const [currentMonth,setCurrentMonth]=useState(new Date());
  const [reduceMotion,setReduceMotion]=useState(false);

  useEffect(()=>localStorage.setItem("stampcard_v10",JSON.stringify(habits)),[habits]);
  // 空だと確認できないので1枚だけ自動作成（既存データがあれば何もしない）
  useEffect(()=>{ if(habits.length===0){ setHabits([{id:uid(),name:"あ",rule:"あ",stamps:{},restDays:{},rewards:[]}]); } },[]);

  const days = useMemo(()=>generateMonth(currentMonth),[currentMonth]);

  // 押す
  const stampToday=(hid)=>{
    const k=todayKey();
    setHabits(prev=>prev.map(h=>{
      if(h.id!==hid) return h;
      const next={...h,stamps:{...(h.stamps||{})},restDays:{...(h.restDays||{})}};
      next.stamps[k]=!next.stamps[k];
      if(next.restDays[k]) delete next.restDays[k];
      return next;
    }));
  };

  const toggleRest=(hid,k)=>{
    if(daysDiff(todayKey(),k)>-2) return;
    setHabits(prev=>prev.map(h=>{
      if(h.id!==hid) return h;
      const next={...h,restDays:{...(h.restDays||{})}};
      next.restDays[k]=!next.restDays[k];
      return next;
    }));
  };

  // 共通スタイル（JSX オブジェクト。外部CSSに依存しない）
  const styles = {
    hstack:{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8},
    grid7 :{display:'grid',gridTemplateColumns:'repeat(7,minmax(0,1fr))',gap:4},
    squareWrap:{position:'relative',width:'100%',paddingTop:'100%'},
    squareBtn :{
      position:'absolute',top:0,left:0,right:0,bottom:0,
      borderRadius:12,border:'1px solid rgba(16,185,129,.35)',
      background:'rgba(16,185,129,.12)',color:'#0f172a',
      display:'flex',alignItems:'center',justifyContent:'center'
    },
    todayRing:{boxShadow:'inset 0 0 0 2px #f59e0b'},
    dim:{opacity:.6}
  };

  return (
    <div>
      {/* ヘッダー */}
      <header>
        <div className="container" style={{padding:'10px 16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="title">スタンプカード</div>
            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,color:'#475569',fontSize:12}}>
              <input type="checkbox" checked={reduceMotion} onChange={(e)=>setReduceMotion(e.target.checked)} />
              アニメ少なめ
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{padding:'16px 16px 32px'}}>
        {/* ガチャ（見た目） */}
        <section className="card" style={{padding:16, textAlign:'center', marginBottom:16}}>
          <div style={{fontWeight:600, marginBottom:8}}>今日のガチャ</div>
          <button className={reduceMotion? 'btn' : 'btn spin'}
                  style={{width:176,height:176,borderRadius:999,position:'relative',boxShadow:'0 12px 24px rgba(0,0,0,.12)'}}>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20,color:'#0f172a',textShadow:'0 1px 2px rgba(255,255,255,.7)'}}>回す！</div>
            <div style={{position:'absolute',left:0,right:0,top:12,display:'flex',justifyContent:'center'}}><CapTop style={{width:128,height:64}}/></div>
            <div style={{position:'absolute',left:0,right:0,bottom:12,display:'flex',justifyContent:'center'}}><CapBot style={{width:128,height:64}}/></div>
          </button>
          <div className="muted" style={{fontSize:12, marginTop:8}}>ポイント：スタンプ + ボーナス（結果は自動加算）</div>
        </section>

        {/* 月移動 */}
        <section style={styles.hstack}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1))}>← 前月</button>
            <div style={{fontWeight:600}}>{currentMonth.getFullYear()}年 {currentMonth.getMonth()+1}月</div>
            <button className="btn" onClick={()=>setCurrentMonth(new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1))}>翌月 →</button>
            <button className="btn" onClick={()=>setCurrentMonth(new Date())}>今月</button>
          </div>
        </section>

        {/* カード（既存データ分） */}
        {habits.map(h=>{
          const {stamps={},restDays={}}=h;
          return (
            <section key={h.id} className="card" style={{padding:16, marginTop:16}}>
              <div style={styles.hstack}>
                <div>
                  <div style={{fontWeight:700,fontSize:16,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:500}}>{h.name}</div>
                  <div className="muted" style={{fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:500}}>{h.rule}</div>
                </div>
                <button className="btn" onClick={()=>stampToday(h.id)}>できた！</button>
              </div>

              {/* 曜日 */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4, fontSize:12, fontWeight:600, color:'#0f172a', marginTop:8, marginBottom:4}}>
                {['月','火','水','木','金','土','日'].map(w=><div key={w} style={{textAlign:'center'}}>{w}</div>)}
              </div>

              {/* カレンダー：7列固定＋セルは常に正方形 */}
              <div style={styles.grid7}>
                {days.map((d,idx)=>{
                  const k=keyOf(d);
                  const isOtherMonth=d.getMonth()!==currentMonth.getMonth();
                  const isToday=k===todayKey();
                  const marked=!!stamps[k];
                  const rest=!!restDays[k];

                  const bg = marked ? 'rgba(16,185,129,.92)' : (rest ? 'rgba(16,185,129,.10)' : 'rgba(16,185,129,.12)');
                  const border = marked ? '#065f46' : 'rgba(16,185,129,.35)';
                  const color = marked ? '#fff' : '#0f172a';

                  return (
                    <div key={k} style={styles.squareWrap}>
                      <button
                        title={fmtJP(k)}
                        onClick={()=>{ if(k===todayKey()) stampToday(h.id); }}
                        onContextMenu={(e)=>{ e.preventDefault(); if(daysDiff(todayKey(),k)<=-2) toggleRest(h.id,k); }}
                        style={{...styles.squareBtn, background:bg, borderColor:border, color,
                                ...(isToday?styles.todayRing:{}), ...(isOtherMonth?styles.dim:{})}}
                      >
                        <span style={{position:'absolute',top:4,left:6,fontSize:12,opacity:marked?0.9:0.8}}>{d.getDate()}</span>
                        {marked ? <Leaf style={{width:40,height:40}}/> : (!rest && <Leaf style={{width:28,height:28,opacity:.2}}/>)}
                        {rest && <span style={{position:'absolute',right:4,bottom:4,fontSize:11,background:'#fff',border:'1px solid #e5e7eb',borderRadius:6,padding:'0 4px'}}>休</span>}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="muted" style={{fontSize:12, marginTop:8}}>※ 休息日は二日後以降（当日・明日は不可）。PC:右クリック / スマホ:長押し</div>
            </section>
          );
        })}
      </main>
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
