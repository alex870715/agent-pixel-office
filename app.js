// Agent Pixel Office — zero-dependency. Characters: characters/sprites/<NAME>.svg, stations: characters/stations/<NAME>.svg
let filter="all",mode=new URLSearchParams(location.search).get("m")||localStorage.getItem("apo-mode")||"styled",S={},B={};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const art=(kind,n,a)=>a.character?`characters/${kind}/${esc(a.character)}.svg`:`characters/${kind}/${esc(n)}.svg`;
const LBL={idle:"閒置 idle",working:"工作中 working",alert:"警示 alert"};
function render(){
 const E=Object.entries(S),cnt=s=>E.filter(([,a])=>a.status===s).length;
 document.getElementById("modes").innerHTML=[["clean","簡潔版 Clean"],["styled","個人風格版 Styled"],["god","上帝視角 God view"]].map(([v,l])=>`<button class="${mode===v?"on":""}" data-m="${v}">${l}</button>`).join("");
 document.getElementById("filters").innerHTML=[["all","全部 All",E.length],["working","工作中",cnt("working")],["idle","閒置",cnt("idle")],["alert","警示",cnt("alert")]]
  .map(([v,l,c])=>`<button class="${filter===v?"on":""}" data-v="${v}">${l} ${c}</button>`).join("");
 const o=document.getElementById("office");o.className=mode;
 if(mode==="god"){o.innerHTML=godSVG();}else o.innerHTML=E.filter(([,a])=>filter==="all"||a.status===filter).map(([n,a])=>`<div class="st ${esc(a.status)}">
  ${mode==="styled"?`<img class="scene" src="${art("stations",n,a)}" alt="${esc(n)} desk">`:`<img class="sprite" src="${art("sprites",n,a)}" alt="${esc(n)}">`}
  <div class="info"><div class="hd"><span class="dot"></span><b>${esc(n)}</b><span class="mut">${esc(a.role)} · ${LBL[a.status]||esc(a.status)}</span></div>
  <div class="bub">${esc(a.bubble)}</div>${mode==="styled"?`<div class="mut">${esc(a.station)}${a.deco?" · "+esc(a.deco):""}</div>`:""}<div class="mut sm">${esc(a.updated)}</div></div></div>`).join("");
 document.getElementById("boardTitle").textContent=B.title||"Wall Board";
 const m=(B.metrics||[]).map(x=>`<div class="kv"><span>${esc(x.label)}</span><b class="${esc(x.tone||"")}">${esc(x.value)}</b></div>`).join("");
 const p=B.positions||[];
 document.getElementById("board").innerHTML=`<div class="card">${m}<div class="mut">updated ${esc(B.updated)}</div></div>`+(p.length?`<div class="card"><table><tr><th>ID</th><th>Side</th><th>Entry</th><th>Mark</th><th>SL</th><th>TP</th><th>ROE</th></tr>${p.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.side)}</td><td>${esc(r.entry)}</td><td>${esc(r.mark)}</td><td>${esc(r.sl)}</td><td>${esc(r.tp)}</td><td>${esc(r.roe)}</td></tr>`).join("")}</table></div>`:"");
}
document.addEventListener("click",e=>{const d=e.target.dataset||{};if(d.v){filter=d.v;render()}if(d.m){mode=d.m;localStorage.setItem("apo-mode",mode);render()}});
async function load(){try{const[s,b]=await Promise.all(["office_status.json","board.json"].map(f=>fetch(f+"?t="+Date.now()).then(r=>r.json())));const k=JSON.stringify([s,b]);if(k===load.k)return;load.k=k;S=s;B=b;render()}catch(e){console.error(e)}}
load();setInterval(load,15000);
// ---- God view (上帝視角): top-down office driven by office_status.json statuses ----
function godSVG(){
 const lead=Object.keys(S).find(k=>!["SEARCH","RISK","WHALE","SHILL","SNIPER","EXIT","RUG","QUANT","MACRO"].includes(k))||"Lead";
 const P=godPlan(S,lead);let h=`<svg class="god" viewBox="0 0 360 220" shape-rendering="crispEdges"><style>${P.css}${(()=>{const t=+new URLSearchParams(location.search).get("t");return t?`svg.god g,svg.god polyline{animation-delay:-${t}s!important}`:""})()}</style>`;
 h+=P.room.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${r.c}"/>`).join("");
 h+=P.labels.map(([x,y,t])=>`<text x="${x}" y="${y}" class="gl">${t}</text>`).join("");
 P.ORDER.forEach(id=>{if(!S[id])return;const d=P.desk[id];h+=`<image href="characters/desks/${esc(S[id].character||id)}.svg" x="${d.x}" y="${d.y}" width="48" height="36"/><text x="${d.x+24}" y="${d.y+43}" class="gl">${esc(id)}</text>`});
 P.alerts.forEach((a,i)=>{h+=`<polyline class="ga${i}" points="${a.pts.map(p=>(p[0]+7.5)+","+(p[1]+8)).join(" ")}" fill="none" stroke="#ff3b3b" stroke-width="1" stroke-dasharray="3 2"/>`});
 P.ORDER.forEach(id=>{if(!S[id])return;const st=S[id].status;h+=`<g class="gw_${id}"><ellipse cx="7.5" cy="16.5" rx="6" ry="1.6" fill="#0003"/><image href="characters/sprites/${esc(S[id].character||id)}.svg" width="15" height="16.5"/>`+
  P.notes.map((n,i)=>n.who===id?`<g class="gn${i}"><rect x="11" y="8" width="6" height="7" fill="#fff59d" stroke="#e8913f" stroke-width=".5"/><rect x="12" y="10" width="4" height=".6" fill="#7a4a24"/><rect x="12" y="12" width="3" height=".6" fill="#7a4a24"/></g>`:"").join("")+
  (st==="alert"?`<g class="gal"><rect x="5.5" y="-8" width="4" height="7" rx="1" fill="#ff3b3b"/><text x="7.5" y="-2.5" class="gx">!</text></g>`:"")+(st==="idle"?`<text x="14" y="0" class="gz">z</text>`:"")+`</g>`});
 P.alerts.forEach((a,i)=>{h+=`<g class="gw_${a.id}"><g class="ga${i}"><circle cx="7.5" cy="8" r="5" fill="#ff3b3b"/><text x="7.5" y="10.5" class="gx">!</text></g></g>`});
 P.bubbles.forEach((b,i)=>{const w=[...b.text].reduce((s,c)=>s+(c.charCodeAt(0)>255?5.6:3.2),0)+8,x=Math.max(2,Math.min(358-w,b.x-w/2));
  h+=`<g class="gb${i}"><rect x="${x}" y="${b.y-12}" width="${w}" height="10" rx="3" fill="#fff" stroke="${b.alert?"#ff3b3b":"#2b2135"}" stroke-width=".6"/><path d="M${b.x-2} ${b.y-2.3}l2 3 2-3z" fill="#fff"/><text x="${x+w/2}" y="${b.y-5}" class="gt">${esc(b.text)}</text></g>`});
 return h+"</svg>";
}
