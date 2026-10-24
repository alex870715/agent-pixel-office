# Agent Office · 代理人辦公室

A zero-dependency static web page that visualizes a team of AI agents as an office: each agent sits at a station with a round avatar and a speech bubble, idle agents move to the lounge sofa, alerting agents glow red, and a wall board shows team metrics. **All bundled data is demo data.**

一個零依賴的靜態網頁，把一組 AI agent 畫成一間辦公室：每個成員在自己的工位上，有圓形頭像和對話框；閒置的人會去休息區沙發，警示中的人會亮紅燈，牆上看板顯示團隊數據。**專案內附的資料全部是示範資料。**

## 餵資料 / Feeding status
- `office_status.json`: one entry per agent / 每位成員一筆 — `role`, `station`, `status` (`idle` | `working` | `alert`), `bubble`, `avatar` (image URL; empty → colored initials badge / 留空則顯示縮寫徽章), `updated`.
- `board.json`: `title`, `metrics[] {label,value,tone}`, `positions[]`, `updated`.
- CLI: `python3 set_status.py RISK alert "Suspicious contract" [https://example.com/risk.png]`
- The page re-fetches both files every 15 s. 頁面每 15 秒重新讀取。

> ⚠️ Don't commit real balances, keys or private data to a public repo. 不要把真實餘額、金鑰或私人資料推到公開 repo。

## 本機執行 / Run locally
`python3 -m http.server 8080` → http://localhost:8080

## 部署到 Vercel / Deploy to Vercel
1. Push to GitHub. 推到 GitHub。
2. Vercel → Add New Project → import this repo → Framework: **Other**, no build command, output directory `.` → Deploy.
3. Or CLI: `npm i -g vercel && vercel --prod`.
`vercel.json` disables caching for the JSON files so status updates show up immediately. `vercel.json` 讓 JSON 不被快取。

## License
MIT
