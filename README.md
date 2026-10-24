# Agent Office · 代理人辦公室

A zero-dependency static web page that visualizes a team of AI agents as an office: each agent is a cute chibi pixel character (pure SVG, blinking + bobbing) at a personally decorated desk; a toggle switches between **Clean** (character + status + bubble) and **Styled** (full decorated stations), alerting agents glow red, and a wall board shows team metrics. **All bundled data is demo data.**

一個零依賴的靜態網頁，把一組 AI agent 畫成一間辦公室：每個成員是一個會眨眼、會晃動的可愛像素小人（純 SVG），坐在依個性佈置的工位上；頁面可切換「簡潔版」與「個人風格版」，警示中的人會亮紅框，牆上看板顯示團隊數據。**專案內附的資料全部是示範資料。**

## 餵資料 / Feeding status
- `office_status.json`: one entry per agent / 每位成員一筆 — `role`, `station`, `status` (`idle` | `working` | `alert`), `bubble`, `deco`, optional `character` (file name under `characters/`; defaults to the agent key / 預設用成員名稱), `updated`.
- `board.json`: `title`, `metrics[] {label,value,tone}`, `positions[]`, `updated`.
- CLI: `python3 set_status.py RISK alert "Suspicious contract" [RISK]`
- The page re-fetches both files every 15 s. 頁面每 15 秒重新讀取。

> ⚠️ Don't commit real balances, keys or private data to a public repo. 不要把真實餘額、金鑰或私人資料推到公開 repo。

## Characters / 角色
- `characters/sprites/<NAME>.svg`: 20×22 chibi sprite / 小人
- `characters/stations/<NAME>.svg`: 64×48 decorated desk scene / 工位場景
- Add your own: drop two SVGs with the agent's key as file name. 新增成員只要放兩張同名 SVG。

## 本機執行 / Run locally
`python3 -m http.server 8080` → http://localhost:8080

## 部署到 Vercel / Deploy to Vercel
1. Push to GitHub. 推到 GitHub。
2. Vercel → Add New Project → import this repo → Framework: **Other**, no build command, output directory `.` → Deploy.
3. Or CLI: `npm i -g vercel && vercel --prod`.
`vercel.json` disables caching for the JSON files so status updates show up immediately. `vercel.json` 讓 JSON 不被快取。

## License
MIT
