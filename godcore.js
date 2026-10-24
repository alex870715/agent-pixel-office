// God-view engine: builds a top-down office timeline from agent statuses. Shared by the web app (and ported to the canvas).
function godPlan(S, LEAD) {
  const ORDER = [LEAD, "SEARCH", "RISK", "WHALE", "SHILL", "SNIPER", "EXIT", "RUG", "QUANT", "MACRO"];
  const XS = [36, 96, 156, 216, 276], GAPS = [66, 126, 186, 246, 306], LA = 56, LB = 142;
  const seat = {}, desk = {};
  ORDER.forEach((id, i) => {
    const top = i < 5, x = XS[i % 5], dy = top ? 6 : 88;
    desk[id] = { x: x - 24, y: dy };
    seat[id] = { x: x - 7.5, y: dy + 11.25, door: { x: x, y: top ? LA : LB }, lane: top ? "A" : "B", cx: x };
  });
  const spot = (x, y) => ({ x: x - 7.5, y: y - 16, door: { x, y: LB }, lane: "B", cx: x });
  const SOFA = [spot(30, 186), spot(50, 186), spot(70, 186), spot(90, 186)];
  const TABLE = [spot(140, 182), spot(190, 182)];
  const COFFEE = { x: 335 - 7.5, y: LA - 14, door: { x: 335, y: LA }, lane: "A", cx: 335 };
  const near = (id, dx) => { const s = seat[id]; return { x: s.door.x - 7.5 + dx, y: s.door.y - (s.lane === "A" ? 10 : 18), door: { x: s.door.x + dx, y: s.door.y }, lane: s.lane, cx: s.door.x + dx }; };
  // route through corridors (lane A y=56, lane B y=142, vertical gaps between desks)
  function route(P, Q) {
    const pts = [[P.x, P.y], [P.door.x - 7.5, P.door.y - 16]];
    let cx = P.door.x;
    if (P.lane !== Q.lane) {
      const g = GAPS.reduce((a, b) => Math.abs(b - (cx + Q.door.x) / 2) < Math.abs(a - (cx + Q.door.x) / 2) ? b : a);
      pts.push([g - 7.5, P.door.y - 16], [g - 7.5, Q.door.y - 16]);
    }
    pts.push([Q.door.x - 7.5, Q.door.y - 16], [Q.x, Q.y]);
    return pts;
  }
  const isOn = id => S[id] && S[id].status !== "idle";
  const PIPE = [["SEARCH", "RISK", "新 lead，請審合約"], ["RISK", "WHALE", "合約過審，查大戶"], ["RISK", "SHILL", "合約過審，測情緒"],
    ["WHALE", LEAD, "聰明錢確認"], ["SHILL", LEAD, "社群情緒升溫"], [LEAD, "SNIPER", "核准，準備下單"]];
  const edges = PIPE.filter(([a, b]) => isOn(a) && isOn(b)).map(([a, b, t]) => ({ a, b, t, kind: "walk" }));
  ["RUG", "MACRO"].forEach(id => { if (S[id] && S[id].status === "alert") edges.push({ a: id, b: "EXIT", t: id === "RUG" ? "鏈上警報！" : "清算風險，收緊止損！", kind: "alert" }); });
  const SLOT = 5, T = Math.max(16, edges.length * SLOT);
  const tracks = {}; // id -> [[t,x,y]]
  const notes = [], bubbles = [], alerts = [];
  const push = (id, t, x, y) => (tracks[id] = tracks[id] || []).push([t, x, y]);
  const walk = (id, pts, t0, t1) => { // place points proportionally to distance
    let L = 0; const d = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); d.push(L); }
    pts.forEach((p, i) => push(id, t0 + (L ? d[i] / L : 0) * (t1 - t0), p[0], p[1]));
  };
  ORDER.forEach(id => push(id, 0, seat[id].x, seat[id].y));
  edges.forEach((e, k) => {
    const t0 = k * SLOT;
    if (e.kind === "walk") {
      const dst = near(e.b, seat[e.a].cx < seat[e.b].cx ? -12 : 12), go = route(seat[e.a], dst), back = route(dst, seat[e.a]);
      push(e.a, t0 + 0.2, seat[e.a].x, seat[e.a].y); walk(e.a, go, t0 + 0.2, t0 + 1.8); walk(e.a, back, t0 + 3.6, t0 + 4.8);
      notes.push({ who: e.a, on: [t0 + 0.2, t0 + 3.4] });
      bubbles.push({ x: seat[e.b].door.x, y: seat[e.b].y - 4, text: e.a + "→" + e.b + "：" + e.t, on: [t0 + 1.8, t0 + 3.6] });
    } else {
      const pts = route(seat[e.a], seat[e.b]);
      alerts.push({ id: "al" + k, pts, t0: t0 + 0.3, t1: t0 + 2.3 });
      walk("al" + k, pts, t0 + 0.3, t0 + 2.3); tracks["al" + k].unshift([0, pts[0][0], pts[0][1]]); push("al" + k, T, pts[pts.length - 1][0], pts[pts.length - 1][1]);
      bubbles.push({ x: seat[e.b].door.x, y: seat[e.b].y - 4, text: e.a + "→EXIT：" + e.t, on: [t0 + 2.3, t0 + 4.6], alert: true });
    }
  });
  // idle agents wander: seat -> sofa/table -> coffee -> seat
  let si = 0;
  ORDER.filter(id => S[id] && S[id].status === "idle").forEach((id, i) => {
    const lounge = si < SOFA.length ? SOFA[si] : TABLE[(si - SOFA.length) % 2]; si++;
    const o = (i * 2.3) % (T * 0.3), a = o + 0.5, b = a + T * 0.12, c = b + T * 0.3, d = c + T * 0.1, e = d + T * 0.12, f = e + T * 0.08;
    push(id, a, seat[id].x, seat[id].y); walk(id, route(seat[id], lounge), a, b); push(id, c, lounge.x, lounge.y);
    walk(id, route(lounge, COFFEE), c, d); push(id, e, COFFEE.x, COFFEE.y); walk(id, route(COFFEE, seat[id]), e, Math.min(f, T));
  });
  const R = (x, y, w, h, c) => ({ x, y, w, h, c });
  const room = [R(0, 0, 360, 220, "#c99a6b"), ...Array.from({ length: 11 }, (_, i) => R(0, i * 20 + 10, 360, 1, "#b5865a")), R(0, 0, 360, 4, "#4a4458"),
    R(4, 150, 236, 66, "#5d5670"), R(8, 154, 228, 58, "#6b5f80"),
    R(14, 160, 92, 9, "#b0475a"), R(14, 169, 92, 14, "#e8414d"), R(10, 160, 6, 24, "#b0475a"), R(104, 160, 6, 24, "#b0475a"),
    R(36, 170, 1, 12, "#b0475a"), R(56, 170, 1, 12, "#b0475a"), R(76, 170, 1, 12, "#b0475a"), R(40, 194, 40, 14, "#8a5a3b"), R(42, 196, 36, 10, "#a9744c"),
    R(140, 166, 50, 24, "#6b4b3a"), R(142, 168, 46, 20, "#a9744c"), R(158, 175, 14, 6, "#efe2c8"), R(128, 172, 8, 10, "#3d3d4f"), R(194, 172, 8, 10, "#3d3d4f"), R(160, 156, 10, 8, "#3d3d4f"), R(160, 192, 10, 8, "#3d3d4f"),
    R(318, 8, 32, 32, "#2a2f3e"), R(322, 12, 24, 18, "#3d3d4f"), R(325, 15, 18, 6, "#1b1b1b"), R(326, 16, 3, 2, "#e8414d"), R(331, 23, 6, 7, "#ffffff"), R(332, 24, 4, 2, "#6b4b3a"), R(340, 22, 3, 3, "#2ecc71"),
    R(268, 150, 88, 66, "#e74c3c"), R(270, 152, 84, 62, "#2a2f3e"), R(306, 172, 12, 16, "#2ecc71"), R(308, 168, 8, 5, "#1f9d55"), R(302, 175, 4, 1, "#1b1b1b"), R(318, 175, 4, 1, "#1b1b1b"), R(302, 181, 4, 1, "#1b1b1b"), R(318, 181, 4, 1, "#1b1b1b"), R(309, 166, 1, 3, "#1b1b1b"), R(314, 166, 1, 3, "#1b1b1b"), R(311, 176, 2, 10, "#1f9d55"),
    R(248, 154, 10, 10, "#7a4a24"), R(246, 146, 14, 9, "#4caf50"), R(6, 132, 10, 10, "#7a4a24"), R(4, 124, 14, 9, "#4caf50")];
  const labels = [[60, 213, "沙發區"], [165, 205, "會議桌"], [334, 47, "咖啡機"], [312, 208, "Bug 角"]];
  let css = "";
  const pc = t => (Math.min(T, Math.max(0, t)) / T * 100).toFixed(2) + "%";
  Object.entries(tracks).forEach(([id, fr]) => {
    fr.sort((p, q) => p[0] - q[0]); const last = fr[fr.length - 1];
    if (last[0] < T) fr.push([T, fr[0][1], fr[0][2]]);
    css += `@keyframes gw_${id}{${fr.map(([t, x, y]) => `${pc(t)}{transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px)}`).join("")}}.gw_${id}{animation:gw_${id} ${T}s linear infinite;transform:translate(${fr[0][1]}px,${fr[0][2]}px)}`;
  });
  const vis = (name, on) => { css += `@keyframes ${name}{0%{opacity:0}${pc(on[0])}{opacity:0}${pc(on[0] + 0.05)}{opacity:1}${pc(on[1])}{opacity:1}${pc(on[1] + 0.05)}{opacity:0}100%{opacity:0}}.${name}{opacity:0;animation:${name} ${T}s linear infinite}`; };
  notes.forEach((n, i) => vis("gn" + i, n.on)); bubbles.forEach((b, i) => vis("gb" + i, b.on));
  alerts.forEach((a, i) => vis("ga" + i, [a.t0, a.t1 + 0.2]));
  css += ".gal{animation:gal .6s steps(1) infinite}@keyframes gal{50%{opacity:.25}}";
  return { room, labels, ORDER, desk, seat, T, css, notes, bubbles, alerts, edges, COFFEE, SOFA, TABLE };
}
if (typeof module !== "undefined") module.exports = { godPlan };
