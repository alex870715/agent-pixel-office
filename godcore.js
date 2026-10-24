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
  const COFFEE = { x: 266, y: 166, door: { x: 300, y: LB }, lane: "B", cx: 300, via: [[292.5, 166]] };
  const FRIDGE = { x: 333, y: 186, door: { x: 300, y: LB }, lane: "B", cx: 300, via: [[292.5, 186]] };
  const near = (id, dx) => { const s = seat[id]; return { x: s.door.x - 7.5 + dx, y: s.door.y - (s.lane === "A" ? 10 : 18), door: { x: s.door.x + dx, y: s.door.y }, lane: s.lane, cx: s.door.x + dx }; };
  // route through corridors (lane A y=56, lane B y=142, vertical gaps between desks)
  function route(P, Q) {
    const pts = [[P.x, P.y], ...(P.via ? P.via.slice().reverse() : []), [P.door.x - 7.5, P.door.y - 16]];
    let cx = P.door.x;
    if (P.lane !== Q.lane) {
      const g = GAPS.reduce((a, b) => Math.abs(b - (cx + Q.door.x) / 2) < Math.abs(a - (cx + Q.door.x) / 2) ? b : a);
      pts.push([g - 7.5, P.door.y - 16], [g - 7.5, Q.door.y - 16]);
    }
    pts.push([Q.door.x - 7.5, Q.door.y - 16], ...(Q.via || []), [Q.x, Q.y]);
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
    const o = (i * 2.3) % (T * 0.3), a = o + 0.5, b = a + T * 0.12, c = b + T * 0.2, d = c + T * 0.09, d2 = d + T * 0.07, d3 = d2 + T * 0.04, e = d3 + T * 0.07, f = e + T * 0.08;
    push(id, a, seat[id].x, seat[id].y); walk(id, route(seat[id], lounge), a, b); push(id, c, lounge.x, lounge.y);
    walk(id, route(lounge, FRIDGE), c, d); push(id, d2, FRIDGE.x, FRIDGE.y); bubbles.push({ x: FRIDGE.x + 7.5, y: FRIDGE.y, text: id + "：補充能量！", on: [d, d2] });
    walk(id, [[FRIDGE.x, FRIDGE.y], [292.5, 186], [292.5, 166], [COFFEE.x, COFFEE.y]], d2, d3); push(id, e, COFFEE.x, COFFEE.y); walk(id, route(COFFEE, seat[id]), e, Math.min(f, T));
  });
  const R = (x, y, w, h, c) => ({ x, y, w, h, c });
  const room = [R(0, 0, 360, 220, "#c99a6b"), ...Array.from({ length: 11 }, (_, i) => R(0, i * 20 + 10, 360, 1, "#b5865a")), R(0, 0, 360, 4, "#4a4458"),
    R(4, 150, 236, 66, "#5d5670"), R(8, 154, 228, 58, "#6b5f80"), R(12, 156, 104, 48, "#c98b5a"), R(15, 159, 98, 42, "#e8c9a0"), R(19, 163, 90, 34, "#d9a877"), R(23, 167, 82, 26, "#efd7b3"),
    R(14, 160, 92, 9, "#b0475a"), R(14, 169, 92, 14, "#e8414d"), R(10, 160, 6, 24, "#b0475a"), R(104, 160, 6, 24, "#b0475a"),
    R(36, 170, 1, 12, "#b0475a"), R(56, 170, 1, 12, "#b0475a"), R(76, 170, 1, 12, "#b0475a"), R(40, 194, 40, 14, "#8a5a3b"), R(42, 196, 36, 10, "#a9744c"),
    R(140, 166, 50, 24, "#6b4b3a"), R(142, 168, 46, 20, "#a9744c"), R(158, 175, 14, 6, "#efe2c8"), R(128, 172, 8, 10, "#3d3d4f"), R(194, 172, 8, 10, "#3d3d4f"), R(160, 156, 10, 8, "#3d3d4f"), R(160, 192, 10, 8, "#3d3d4f"),
    R(302, 4, 52, 15, "#5d4a3a"), R(304, 5, 48, 12, "#ffd59e"), R(304, 5, 48, 5, "#9fd3ff"), R(305, 11, 6, 6, "#4a5a78"), R(307, 13, 1, 1, "#fff59d"), R(311, 8, 6, 9, "#4a5a78"), R(313, 10, 1, 1, "#fff59d"), R(318, 12, 6, 5, "#4a5a78"), R(320, 14, 1, 1, "#fff59d"), R(323, 7, 6, 10, "#4a5a78"), R(325, 9, 1, 1, "#fff59d"), R(331, 10, 6, 7, "#4a5a78"), R(333, 12, 1, 1, "#fff59d"), R(337, 8, 6, 9, "#4a5a78"), R(339, 10, 1, 1, "#fff59d"), R(344, 11, 6, 6, "#4a5a78"), R(346, 13, 1, 1, "#fff59d"), R(327, 5, 2, 12, "#5d4a3a"), R(302, 22, 52, 30, "#9aa3ad"), R(304, 24, 48, 25, "#ffffff"), R(308, 27, 40, 3, "#3498db"), R(312, 31, 32, 3, "#3498db"), R(316, 35, 24, 3, "#1abc9c"), R(320, 39, 16, 3, "#f1c40f"), R(324, 43, 8, 3, "#e8414d"), R(304, 49, 48, 2, "#7a8590"), R(310, 49, 4, 1, "#e8414d"), R(316, 49, 4, 1, "#3498db"), R(58, 20, 12, 7, "#fff59d"), R(62, 12, 1, 12, "#3d3d4f"), R(59, 24, 7, 2, "#3d3d4f"), R(59, 8, 8, 5, "#f1c40f"), R(178, 102, 12, 7, "#fff59d"), R(182, 94, 1, 12, "#3d3d4f"), R(179, 106, 7, 2, "#3d3d4f"), R(179, 90, 8, 5, "#f1c40f"),
    R(246, 146, 112, 72, "#efe8da"), R(254, 146, 8, 8, "#e2d7c3"), R(270, 146, 8, 8, "#e2d7c3"), R(286, 146, 8, 8, "#e2d7c3"), R(302, 146, 8, 8, "#e2d7c3"), R(318, 146, 8, 8, "#e2d7c3"), R(334, 146, 8, 8, "#e2d7c3"), R(350, 146, 8, 8, "#e2d7c3"), R(246, 154, 8, 8, "#e2d7c3"), R(262, 154, 8, 8, "#e2d7c3"), R(278, 154, 8, 8, "#e2d7c3"), R(294, 154, 8, 8, "#e2d7c3"), R(310, 154, 8, 8, "#e2d7c3"), R(326, 154, 8, 8, "#e2d7c3"), R(342, 154, 8, 8, "#e2d7c3"), R(254, 162, 8, 8, "#e2d7c3"), R(270, 162, 8, 8, "#e2d7c3"), R(286, 162, 8, 8, "#e2d7c3"), R(302, 162, 8, 8, "#e2d7c3"), R(318, 162, 8, 8, "#e2d7c3"), R(334, 162, 8, 8, "#e2d7c3"), R(350, 162, 8, 8, "#e2d7c3"), R(246, 170, 8, 8, "#e2d7c3"), R(262, 170, 8, 8, "#e2d7c3"), R(278, 170, 8, 8, "#e2d7c3"), R(294, 170, 8, 8, "#e2d7c3"), R(310, 170, 8, 8, "#e2d7c3"), R(326, 170, 8, 8, "#e2d7c3"), R(342, 170, 8, 8, "#e2d7c3"), R(254, 178, 8, 8, "#e2d7c3"), R(270, 178, 8, 8, "#e2d7c3"), R(286, 178, 8, 8, "#e2d7c3"), R(302, 178, 8, 8, "#e2d7c3"), R(318, 178, 8, 8, "#e2d7c3"), R(334, 178, 8, 8, "#e2d7c3"), R(350, 178, 8, 8, "#e2d7c3"), R(246, 186, 8, 8, "#e2d7c3"), R(262, 186, 8, 8, "#e2d7c3"), R(278, 186, 8, 8, "#e2d7c3"), R(294, 186, 8, 8, "#e2d7c3"), R(310, 186, 8, 8, "#e2d7c3"), R(326, 186, 8, 8, "#e2d7c3"), R(342, 186, 8, 8, "#e2d7c3"), R(254, 194, 8, 8, "#e2d7c3"), R(270, 194, 8, 8, "#e2d7c3"), R(286, 194, 8, 8, "#e2d7c3"), R(302, 194, 8, 8, "#e2d7c3"), R(318, 194, 8, 8, "#e2d7c3"), R(334, 194, 8, 8, "#e2d7c3"), R(350, 194, 8, 8, "#e2d7c3"), R(246, 202, 8, 8, "#e2d7c3"), R(262, 202, 8, 8, "#e2d7c3"), R(278, 202, 8, 8, "#e2d7c3"), R(294, 202, 8, 8, "#e2d7c3"), R(310, 202, 8, 8, "#e2d7c3"), R(326, 202, 8, 8, "#e2d7c3"), R(342, 202, 8, 8, "#e2d7c3"), R(254, 210, 8, 8, "#e2d7c3"), R(270, 210, 8, 8, "#e2d7c3"), R(286, 210, 8, 8, "#e2d7c3"), R(302, 210, 8, 8, "#e2d7c3"), R(318, 210, 8, 8, "#e2d7c3"), R(334, 210, 8, 8, "#e2d7c3"), R(350, 210, 8, 8, "#e2d7c3"), R(244, 146, 2, 72, "#8a7a6a"), R(250, 148, 38, 16, "#7a5236"), R(250, 148, 38, 4, "#d8cfc0"), R(256, 155, 1, 7, "#5a3b26"), R(268, 155, 1, 7, "#5a3b26"), R(280, 155, 1, 7, "#5a3b26"), R(270, 138, 14, 14, "#2a2f3e"), R(272, 140, 10, 4, "#1b1b1b"), R(273, 141, 2, 2, "#e8414d"), R(279, 141, 2, 2, "#2ecc71"), R(275, 147, 4, 4, "#ffffff"), R(276, 148, 2, 1, "#6b4b3a"), R(276, 133, 1, 3, "#ffffff"), R(278, 131, 1, 3, "#ffffff"), R(254, 143, 6, 6, "#e8913f"), R(261, 145, 5, 4, "#f1c40f"), R(328, 146, 26, 38, "#c9d3dd"), R(328, 146, 26, 3, "#aab6c2"), R(330, 150, 21, 32, "#bfe8f5"), R(330, 157, 21, 1, "#ffffff"), R(332, 151, 3, 5, "#2ecc71"), R(332, 151, 3, 1, "#dfe6ee"), R(337, 151, 3, 5, "#e8414d"), R(337, 151, 3, 1, "#dfe6ee"), R(342, 151, 3, 5, "#3498db"), R(342, 151, 3, 1, "#dfe6ee"), R(347, 151, 3, 5, "#f1c40f"), R(347, 151, 3, 1, "#dfe6ee"), R(330, 165, 21, 1, "#ffffff"), R(332, 159, 3, 5, "#e8414d"), R(332, 159, 3, 1, "#dfe6ee"), R(337, 159, 3, 5, "#3498db"), R(337, 159, 3, 1, "#dfe6ee"), R(342, 159, 3, 5, "#f1c40f"), R(342, 159, 3, 1, "#dfe6ee"), R(347, 159, 3, 5, "#2ecc71"), R(347, 159, 3, 1, "#dfe6ee"), R(330, 173, 21, 1, "#ffffff"), R(332, 167, 3, 5, "#3498db"), R(332, 167, 3, 1, "#dfe6ee"), R(337, 167, 3, 5, "#f1c40f"), R(337, 167, 3, 1, "#dfe6ee"), R(342, 167, 3, 5, "#2ecc71"), R(342, 167, 3, 1, "#dfe6ee"), R(347, 167, 3, 5, "#e8414d"), R(347, 167, 3, 1, "#dfe6ee"), R(330, 181, 21, 1, "#ffffff"), R(332, 175, 3, 5, "#f1c40f"), R(332, 175, 3, 1, "#dfe6ee"), R(337, 175, 3, 5, "#2ecc71"), R(337, 175, 3, 1, "#dfe6ee"), R(342, 175, 3, 5, "#e8414d"), R(342, 175, 3, 1, "#dfe6ee"), R(347, 175, 3, 5, "#3498db"), R(347, 175, 3, 1, "#dfe6ee"), R(352, 156, 1, 14, "#6c7a89"), R(248, 166, 10, 22, "#8a5a3b"), R(248, 173, 10, 1, "#5a3b26"), R(249, 168, 3, 4, "#e8414d"), R(253, 168, 3, 4, "#f1c40f"), R(248, 180, 10, 1, "#5a3b26"), R(249, 175, 3, 4, "#f1c40f"), R(253, 175, 3, 4, "#9b59b6"), R(248, 187, 10, 1, "#5a3b26"), R(249, 182, 3, 4, "#9b59b6"), R(253, 182, 3, 4, "#e8913f"), R(262, 190, 28, 8, "#a9744c"), R(262, 190, 28, 2, "#d8cfc0"), R(265, 200, 5, 3, "#e8414d"), R(267, 203, 1, 4, "#3d3d4f"), R(275, 200, 5, 3, "#e8414d"), R(277, 203, 1, 4, "#3d3d4f"), R(285, 200, 5, 3, "#e8414d"), R(287, 203, 1, 4, "#3d3d4f"), R(312, 207, 8, 8, "#7a4a24"), R(309, 199, 14, 9, "#4caf50"), R(313, 196, 6, 4, "#66bb6a"),
    R(6, 132, 10, 10, "#7a4a24"), R(4, 124, 14, 9, "#4caf50")];
  const labels = [[60, 213, "沙發區"], [165, 205, "會議桌"], [300, 215, "茶水間"], [328, 58, "漏斗白板"]];
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
