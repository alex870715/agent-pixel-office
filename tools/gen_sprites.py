import json, os, sys
W,H=20,22
BASE=[
"....................",
"......OOOOOOOO......",
".....OHHHHHHHHO.....",
"....OHHHHHHHHHHO....",
"...OHHHHHHHHHHHHO...",
"...OHHSSSSSSSSHHO...",
"...OHSSSSSSSSSSHO...",
"...OSSEESSSSEESSO...",
"...OSSEESSSSEESSO...",
"...OSBBSSSMSSBBSO...",
"....OSSSSSSSSSSO....",
".....OOSSSSSSOO.....",
"....OCCCCCCCCCCO....",
"...OCCCCCCCCCCCCO...",
"...OSCCCCCCCCCCSO...",
"...OSOCCCCCCCCOSO...",
"....OOPPPPPPPPOO....",
".....OPPPOOPPPO.....",
".....OFFFO.OFFFO....",
"......OOO...OOO.....",
"....................",
"....................",
]
PAL0={'O':'#2b2135','S':'#ffd9b8','B':'#ff9fae','E':'#2b2135','M':'#b0475a','F':'#3b3346','W':'#ffffff'}
def put(g,x,y,c):
    if 0<=x<W and 0<=y<H: g[y][x]=c
def box(g,x0,y0,x1,y1,c):
    for y in range(y0,y1+1):
        for x in range(x0,x1+1): put(g,x,y,c)
CH={}
def mk(name,pal,fn=None):
    g=[list(r) for r in BASE]
    if fn: fn(g)
    p=dict(PAL0);p.update(pal);CH[name]=(g,p)
# Tobi: boss, slick black hair, black suit, red tie, gold crown
def tobi(g):
    box(g,7,0,12,0,'O');put(g,7,-0,'O')
    for x in (7,9,11,12): pass
    # crown
    for x,y in [(7,0),(9,0),(11,0),(12,0)]: put(g,x,y,'Y')
    box(g,7,1,12,1,'Y')
    for x in range(5,15): put(g,x,1,'O') if x in(5,14) else None
    put(g,9,12,'R');put(g,10,12,'R');put(g,9,13,'R');put(g,10,13,'R');put(g,9,14,'R');put(g,10,14,'R')
    put(g,8,12,'W');put(g,11,12,'W')
mk('Tobi',{'H':'#1d1b26','C':'#2f2f44','P':'#24243a','Y':'#ffcc33','R':'#e8414d'},tobi)
# SEARCH: brown messy hair, big round glasses, green hoodie
def search(g):
    for x,y in [(6,1),(9,0),(12,1),(10,1)]: put(g,x,y,'H')
    put(g,9,0,'O');put(g,8,1,'H')
    for (x,y) in [(5,6),(6,6),(7,6),(8,6),(5,9),(6,9),(7,9),(8,9),(11,6),(12,6),(13,6),(14,6),(11,9),(12,9),(13,9),(14,9),(9,7),(10,7)]: put(g,x,y,'G')
    put(g,5,7,'G');put(g,5,8,'G');put(g,8,7,'G');put(g,8,8,'G');put(g,11,7,'G');put(g,11,8,'G');put(g,14,7,'G');put(g,14,8,'G')
    put(g,6,9,'G');put(g,13,9,'G')
    put(g,8,13,'D');put(g,11,13,'D')
mk('SEARCH',{'H':'#8a5a3b','C':'#4cb57a','D':'#e9f5ec','G':'#3a3a52','P':'#5a6b8c'},search)
# RISK: helmet, blue vest with shield badge
def risk(g):
    box(g,4,2,15,4,'K');box(g,6,1,13,1,'K');box(g,3,5,16,5,'K');put(g,3,5,'O');put(g,16,5,'O')
    box(g,9,2,10,3,'Y')
    box(g,9,13,10,14,'Y')
mk('RISK',{'H':'#3d3d4f','K':'#5b8def','C':'#3a62c9','P':'#2c3d6e','Y':'#ffd23f'},risk)
# WHALE: blue beanie with pompom, navy sailor
def whale(g):
    box(g,4,2,15,5,'K');box(g,6,1,13,1,'K');box(g,4,5,15,5,'L')
    box(g,9,0,10,0,'L')
    box(g,5,12,14,12,'W');put(g,9,13,'R');put(g,10,13,'R')
mk('WHALE',{'H':'#6b4b3a','K':'#3a86d6','L':'#e8f4ff','C':'#24407a','P':'#1c2c4f','R':'#e8414d'},whale)
# SHILL: pink twin buns, heart top
def shill(g):
    for cx in (3,15):
        box(g,cx,1,cx+1,3,'H')
    put(g,3,1,'O');put(g,16,1,'O')
    box(g,9,13,10,13,'R');put(g,8,13,'R');put(g,11,13,'R');box(g,9,14,10,14,'R')
mk('SHILL',{'H':'#ff7eb6','C':'#ffd1e6','P':'#9a7bd8','R':'#ff3d7f'},shill)
# SNIPER: olive cap, red headband, camo
def sniper(g):
    box(g,4,3,15,3,'R');put(g,16,4,'R');put(g,17,5,'R')
    box(g,5,1,14,2,'K');box(g,4,4,8,4,'K')
    put(g,6,13,'D');put(g,12,14,'D');put(g,10,12,'D');put(g,8,15,'D')
mk('SNIPER',{'H':'#2e2a24','K':'#6e7f3d','R':'#d8323c','C':'#7d8f45','D':'#4f5c2a','P':'#4a5530'},sniper)
# EXIT: orange hair, green vest with exit-arrow
def exitf(g):
    for x,y in [(5,1),(14,1),(16,4)]: put(g,x,y,'H')
    box(g,8,13,11,13,'W');put(g,11,12,'W');put(g,11,14,'W')
mk('EXIT',{'H':'#ff8a3d','C':'#2fa36b','P':'#3d4a5c'},exitf)
# RUG: shiba dog hood
def rug(g):
    box(g,3,0,5,2,'H');box(g,14,0,16,2,'H');put(g,4,1,'B');put(g,15,1,'B')
    put(g,2,1,'O');put(g,17,1,'O');put(g,3,-0,'O');put(g,16,0,'O')
    box(g,4,5,5,9,'H');box(g,14,5,15,9,'H')
    box(g,8,12,11,12,'L')
mk('RUG',{'H':'#e8913f','C':'#e8913f','L':'#fff3e0','P':'#7a4a24'},rug)
# QUANT: purple hair, square glasses, lab coat
def quant(g):
    box(g,4,2,6,4,'H');put(g,15,4,'H');put(g,11,1,'O');put(g,12,1,'H')
    box(g,5,7,8,7,'G');box(g,11,7,14,7,'G');put(g,9,7,'G');put(g,10,7,'G')
    box(g,9,12,10,15,'D')
mk('QUANT',{'H':'#8b5cf6','C':'#f2f2f7','D':'#7cc7ff','G':'#2b2135','P':'#3b3346'},quant)
# MACRO: silver bun, red scarf, headset
def macro(g):
    box(g,8,0,11,1,'H');put(g,8,0,'O');put(g,11,0,'O')
    box(g,3,6,3,9,'K');box(g,16,6,16,9,'K');put(g,4,10,'K');put(g,5,10,'K');put(g,6,10,'K')
    box(g,5,12,14,12,'R');box(g,12,13,13,15,'R')
mk('MACRO',{'H':'#c9cfdb','C':'#3b4256','P':'#2a2f3e','K':'#2b2135','R':'#e8414d'},macro)

def runs(g,pal,skip=()):
    out=[]
    for y in range(H):
        x=0
        while x<W:
            c=g[y][x]
            if c=='.' or c in skip: x+=1;continue
            x1=x
            while x1+1<W and g[y][x1+1]==c: x1+=1
            out.append((x,y,x1-x+1,pal.get(c,'#ff00ff')))
            x=x1+1
    return out
CSS="<style>.b{animation:b 1.6s steps(1) infinite}@keyframes b{50%{transform:translateY(-1px)}}.e{animation:e 4s steps(1) infinite}@keyframes e{0%,94%{opacity:1}95%,100%{opacity:0}}.c{opacity:0;animation:c 4s steps(1) infinite}@keyframes c{0%,94%{opacity:0}95%,100%{opacity:1}}</style>"
def sprite_svg(name,scale=None,standalone=True,x0=0,y0=0,delay=0):
    g,p=CH[name]
    body=runs(g,p,skip=('E',))
    eyes=[(x,y) for y in range(H) for x in range(W) if g[y][x]=='E']
    s=[]
    s.append(f'<g class="b" style="animation-delay:{delay}s">')
    s+= [f'<rect x="{x+x0}" y="{y+y0}" width="{w}" height="1" fill="{c}"/>' for x,y,w,c in body]
    s.append(f'<g class="e" style="animation-delay:{delay}s">'+''.join(f'<rect x="{x+x0}" y="{y+y0}" width="1" height="1" fill="#2b2135"/>' for x,y in eyes))
    # highlight
    s.append(''.join(f'<rect x="{x+x0}" y="{y+y0}" width="1" height="1" fill="#fff"/>' for x,y in eyes if g[y-1][x]!='E' and g[y][x-1]!='E')+'</g>')
    ys=[y for x,y in eyes]; 
    if ys:
        yb=max(ys)
        s.append(f'<g class="c" style="animation-delay:{delay}s">'+''.join(f'<rect x="{x+x0}" y="{yb+y0}" width="1" height="1" fill="#2b2135"/>' for x,y in eyes if y==yb)+'</g>')
    s.append('</g>')
    inner=''.join(s)
    if standalone:
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" shape-rendering="crispEdges">{CSS}{inner}</svg>'
    return inner
if __name__=='__main__':
    od=sys.argv[1]
    os.makedirs(od,exist_ok=True)
    for n in CH: open(f'{od}/{n}.svg','w').write(sprite_svg(n))
    print('ok')
