#!/usr/bin/env python3
"""Usage: set_status.py <agent> <idle|working|alert> "<bubble>" [avatar_url]
Updates ./office_status.json next to this script."""
import json, sys, datetime, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "office_status.json")
if len(sys.argv) not in (4, 5) or sys.argv[2] not in ("idle", "working", "alert"):
    sys.exit(__doc__)
d = json.load(open(P, encoding="utf-8")) if os.path.exists(P) else {}
a = d.setdefault(sys.argv[1], {})
a.update(status=sys.argv[2], bubble=sys.argv[3],
         updated=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"))
if len(sys.argv) == 5: a["avatar"] = sys.argv[4]
json.dump(d, open(P, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(sys.argv[1], a)
