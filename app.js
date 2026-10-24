// Agent Pixel Office — zero-dependency. Characters: characters/sprites/<NAME>.svg, stations: characters/stations/<NAME>.svg
let filter="all",mode=new URLSearchParams(location.search).get("m")||localStorage.getItem("apo-mode")||"styled",S={},B={};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const art=(kind,n,a)=>a.character?`characters/${kind}/${esc(a.character)}.svg`:`characters/${kind}/${esc(n)}.svg`;
const LBL={idle:"閒置 idle",working:"工作中 working",alert:"警示 alert"};
function render(){
 const E=Object.entries(S),cnt=s=>E.filter(([,a])=>a.status===s).length;
 document.getElementById("modes").innerHTML=[["clean","簡潔版 Clean"],["styled","個人風格版 Styled"]].map(([v,l])=>`<button class="${mode===v?"on":""}" data-m="${v}">${l}</button>`).join("");
 document.getElementById("filters").innerHTML=[["all","全部 All",E.length],["working","工作中",cnt("working")],["idle","閒置",cnt("idle")],["alert","警示",cnt("alert")]]
  .map(([v,l,c])=>`<button class="${filter===v?"on":""}" data-v="${v}">${l} ${c}</button>`).join("");
 const o=document.getElementById("office");o.className=mode;
 o.innerHTML=E.filter(([,a])=>filter==="all"||a.status===filter).map(([n,a])=>`<div class="st ${esc(a.status)}">
  ${mode==="styled"?`<img class="scene" src="${art("stations",n,a)}" alt="${esc(n)} desk">`:`<img class="sprite" src="${art("sprites",n,a)}" alt="${esc(n)}">`}
  <div class="info"><div class="hd"><span class="dot"></span><b>${esc(n)}</b><span class="mut">${esc(a.role)} · ${LBL[a.status]||esc(a.status)}</span></div>
  <div class="bub">${esc(a.bubble)}</div>${mode==="styled"?`<div class="mut">${esc(a.station)}${a.deco?" · "+esc(a.deco):""}</div>`:""}<div class="mut sm">${esc(a.updated)}</div></div></div>`).join("");
 document.getElementById("boardTitle").textContent=B.title||"Wall Board";
 const m=(B.metrics||[]).map(x=>`<div class="kv"><span>${esc(x.label)}</span><b class="${esc(x.tone||"")}">${esc(x.value)}</b></div>`).join("");
 const p=B.positions||[];
 document.getElementById("board").innerHTML=`<div class="card">${m}<div class="mut">updated ${esc(B.updated)}</div></div>`+(p.length?`<div class="card"><table><tr><th>ID</th><th>Side</th><th>Entry</th><th>Mark</th><th>SL</th><th>TP</th><th>ROE</th></tr>${p.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.side)}</td><td>${esc(r.entry)}</td><td>${esc(r.mark)}</td><td>${esc(r.sl)}</td><td>${esc(r.tp)}</td><td>${esc(r.roe)}</td></tr>`).join("")}</table></div>`:"");
}
document.addEventListener("click",e=>{const d=e.target.dataset||{};if(d.v){filter=d.v;render()}if(d.m){mode=d.m;localStorage.setItem("apo-mode",mode);render()}});
async function load(){try{const[s,b]=await Promise.all(["office_status.json","board.json"].map(f=>fetch(f+"?t="+Date.now()).then(r=>r.json())));S=s;B=b;render()}catch(e){console.error(e)}}
load();setInterval(load,15000);
