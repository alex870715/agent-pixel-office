const COLORS=["#6c8cff","#3ccf8e","#ff9f43","#c56cff","#ff5d8f","#2ec5d3","#f5c542","#8bd450","#ff7a59","#5b7cfa"];
let filter="all",S={},B={};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initials=n=>n.replace(/[^A-Za-z0-9\u4e00-\u9fff]/g,"").slice(0,2).toUpperCase();
const color=n=>COLORS[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%COLORS.length];
function avatar(n,a){return a.avatar?`<img class="av" src="${esc(a.avatar)}" alt="${esc(n)}">`
 :`<div class="av" style="background:${color(n)}">${esc(initials(n))}</div>`}
function render(){
 const E=Object.entries(S),cnt=s=>E.filter(([,a])=>a.status===s).length;
 document.getElementById("filters").innerHTML=[["all","全部 All",E.length],["working","工作中",cnt("working")],["idle","閒置",cnt("idle")],["alert","警示",cnt("alert")]]
  .map(([v,l,c])=>`<button class="${filter===v?"on":""}" data-v="${v}">${l} ${c}</button>`).join("");
 const dim=a=>filter!=="all"&&a.status!==filter?" dim":"";
 document.getElementById("office").innerHTML=E.map(([n,a],i)=>`<div class="st ${esc(a.status)}${dim(a)}" style="animation-delay:${i*.2}s">
  <span class="dot"></span>${a.status!=="idle"?`<div class="bub">${esc(a.bubble)}</div>${avatar(n,a)}`:`<div class="empty">在沙發<br>on sofa</div>`}
  <div class="desk"></div><div class="nm">${esc(n)}</div><div class="mut">${esc(a.role)}</div><div class="mut">${esc(a.station)} · ${esc(a.updated)}</div></div>`).join("");
 const idle=E.filter(([,a])=>a.status==="idle");
 document.getElementById("lounge").innerHTML=idle.length?idle.map(([n,a])=>`<div class="chip${dim(a)}"><div class="bub">${esc(a.bubble)}</div>${avatar(n,a)}<div class="nm">${esc(n)}</div></div>`).join(""):`<span class="mut">沒人在休息 · nobody idle</span>`;
 document.getElementById("boardTitle").textContent=B.title||"Wall Board";
 const m=(B.metrics||[]).map(x=>`<div class="kv"><span>${esc(x.label)}</span><b class="${esc(x.tone||"")}">${esc(x.value)}</b></div>`).join("");
 const p=B.positions||[];
 document.getElementById("board").innerHTML=`<div class="card">${m}<div class="mut">updated ${esc(B.updated)}</div></div>`+(p.length?`<div class="card"><table><tr><th>ID</th><th>Side</th><th>Entry</th><th>Mark</th><th>SL</th><th>TP</th><th>ROE</th></tr>${p.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.side)}</td><td>${esc(r.entry)}</td><td>${esc(r.mark)}</td><td>${esc(r.sl)}</td><td>${esc(r.tp)}</td><td>${esc(r.roe)}</td></tr>`).join("")}</table></div>`:"");
}
document.addEventListener("click",e=>{const v=e.target.dataset?.v;if(v){filter=v;render()}});
async function load(){try{const[s,b]=await Promise.all(["office_status.json","board.json"].map(f=>fetch(f+"?t="+Date.now()).then(r=>r.json())));S=s;B=b;render()}catch(e){console.error(e)}}
load();setInterval(load,15000);
