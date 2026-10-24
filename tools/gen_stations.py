import sys,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from gen_sprites import CH, sprite_svg, CSS
SW,SH=64,48
def R(x,y,w,h,c,cls=''):
    k=f' class="{cls}"' if cls else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"{k}/>'
O='#2b2135'
WALL={'Tobi':'#efe2c8','SEARCH':'#dff0e4','RISK':'#dfe8fb','WHALE':'#d9ecfb','SHILL':'#fde3ef','SNIPER':'#e6ead6','EXIT':'#e2f3e9','RUG':'#fbe9d6','QUANT':'#ece4fb','MACRO':'#f6dede'}
def base(n):
    s=[R(0,0,SW,30,WALL[n]),R(0,30,SW,18,'#c99a6b')]
    for x in range(0,SW,8): s.append(R(x,30,1,18,'#b5865a'))
    s.append(R(0,29,SW,1,'#a77b52'))
    return s
def monitor(x,y,w,h,screen):
    return [R(x,y,w,h,O),R(x+1,y+1,w-2,h-2,screen),R(x+w//2-1,y+h,2,2,O),R(x+w//2-3,y+h+2,6,1,O)]
def kline(x,y):
    s=[];vals=[(1,2,'#2ecc71'),(3,3,'#e74c3c'),(5,1,'#2ecc71'),(7,4,'#e74c3c'),(9,2,'#e74c3c')]
    for i,(dx,hh,c) in enumerate(vals): s.append(R(x+dx,y+ (1+i%3),1,hh,c))
    return s
def desk(col='#8a5a3b',top='#a9744c'):
    return [R(6,33,52,3,top),R(6,36,52,1,col),R(8,37,3,9,col),R(53,37,3,9,col)]
def deco(n):
    s=[]
    if n=='Tobi':
        s+=monitor(6,17,15,11,'#16213e')+kline(8,18)+monitor(44,17,15,11,'#16213e')+kline(46,18)
        s+=[R(37,30,4,3,'#fff'),R(41,31,1,1,'#fff'),R(38,28,1,1,'#ccc','st'),R(39,27,1,1,'#ccc','st')]  # coffee
        s+=[R(44,4,12,6,O),R(45,5,10,4,'#ffcc33'),R(47,6,6,2,'#c8102e')]  # plaque
        s+=[R(26,40,1,1,'#00000000')]
    elif n=='SEARCH':
        s+=monitor(42,16,20,12,'#eef6ff')
        for i in range(4): s.append(R(43+i*5,17,4,1,['#4285f4','#ea4335','#fbbc05','#34a853'][i]))
        s+=[R(44,20,14,1,'#99a'),R(44,22,10,1,'#99a'),R(44,24,12,1,'#99a')]
        s+=[R(8,26,5,5,O),R(9,27,3,3,'#bfe6ff'),R(12,31,2,2,O)]  # magnifier
        for i,c in enumerate(['#fff59d','#ffccbc','#c8e6c9']): s.append(R(6+i*6,8+i,5,5,c))
    elif n=='RISK':
        s+=[R(6,3,10,12,O),R(7,4,8,9,'#5b8def'),R(8,13,6,1,'#5b8def'),R(10,14,2,1,'#5b8def'),R(10,6,2,5,'#fff'),R(9,7,4,2,'#fff')]
        s+=[R(42,6,14,18,O),R(43,7,12,16,'#fff')]
        for i in range(4): s+=[R(44,9+i*4,2,2,'#2ecc71'),R(47,9+i*4,7,1,'#99a')]
        s+=monitor(6,20,14,9,'#203a72')+[R(10,23,6,3,'#ffd23f')]
    elif n=='WHALE':
        s+=monitor(36,14,20,14,'#0b2e1f')+[R(45,15,1,12,'#2ecc71'),R(37,20,18,1,'#2ecc71'),R(49,17,2,2,'#7dff9a','bl'),R(40,23,2,2,'#7dff9a')]
        s+=[R(10,27,14,6,'#3a86d6'),R(8,25,6,4,'#3a86d6'),R(22,24,3,3,'#3a86d6'),R(24,23,2,2,'#3a86d6'),R(12,29,10,3,'#e8f4ff'),R(11,28,1,1,O)]  # whale plush
        s+=[R(6,6,12,8,'#9fd3ff'),R(6,12,12,2,'#3a86d6')]
    elif n=='SHILL':
        s+=[R(38,20,8,13,O),R(39,21,6,10,'#ffd1e6'),R(40,23,2,2,'#ff3d7f'),R(42,23,2,2,'#ff3d7f'),R(41,25,2,1,'#ff3d7f')]
        for x,y in [(8,6),(18,10),(50,6),(56,14)]:
            s+=[R(x,y,2,2,'#ff3d7f','bl'),R(x+3,y,2,2,'#ff3d7f','bl'),R(x,y+2,5,1,'#ff3d7f','bl'),R(x+1,y+3,3,1,'#ff3d7f','bl'),R(x+2,y+4,1,1,'#ff3d7f','bl')]
        s+=[R(26,6,10,10,O),R(27,7,8,8,'#fff'),R(28,8,2,2,O),R(32,8,2,2,O),R(30,10,2,2,O),R(28,12,2,2,O),R(32,12,2,2,O)]  # X tile
        s+=monitor(12,18,14,10,'#2b2135')+[R(14,20,10,1,'#ff7eb6'),R(14,23,6,1,'#ff7eb6')]
    elif n=='SNIPER':
        s+=monitor(42,12,20,16,'#0b0f0b')+[R(51,13,1,14,'#ff3b3b'),R(43,20,18,1,'#ff3b3b'),R(50,19,3,3,'#ff3b3b','bl')]
        s+=[R(6,30,18,2,O),R(10,28,10,2,'#4f5c2a'),R(18,27,3,1,O),R(5,31,3,2,'#4f5c2a')]  # scope rifle-ish scope
        s+=[R(8,8,8,8,'#7d8f45'),R(10,10,4,4,'#d8323c')]
    elif n=='EXIT':
        s+=[R(22,3,20,8,'#1f9d55'),R(24,5,2,4,'#fff'),R(24,5,4,1,'#fff'),R(24,7,3,1,'#fff'),R(24,9,4,1,'#fff'),R(31,6,6,2,'#fff'),R(35,5,1,4,'#fff')]
        s+=[R(48,10,12,20,'#8a5a3b'),R(49,11,10,18,'#a9744c'),R(56,20,2,2,'#ffcc33')]
        s+=[R(42,26,6,1,O),R(43,27,4,2,'#ffcc33'),R(44,29,2,1,'#ffcc33'),R(43,30,4,2,'#ffcc33'),R(42,32,6,1,O)]  # hourglass
        s+=monitor(8,18,14,10,'#16213e')+[R(10,21,10,1,'#2ecc71'),R(10,24,7,1,'#2ecc71')]
    elif n=='RUG':
        s+=[R(28,2,8,2,O),R(29,4,6,5,'#ff3b3b','bl'),R(27,9,10,2,O)]  # siren
        s+=[R(8,22,12,8,'#e8913f'),R(9,20,3,3,'#e8913f'),R(16,20,3,3,'#e8913f'),R(10,25,2,1,O),R(15,25,2,1,O),R(12,27,4,2,'#fff3e0'),R(13,27,2,1,O),R(8,30,12,3,'#c0392b')]  # dog
        s+=monitor(40,18,16,10,'#1b1b1b')+[R(42,20,12,1,'#ffcc33'),R(42,23,8,1,'#ff3b3b')]
        s+=[R(4,6,16,3,'#ffcc33'),R(6,6,2,3,O),R(10,6,2,3,O),R(14,6,2,3,O),R(18,6,2,3,O)]
    elif n=='QUANT':
        s+=[R(4,3,30,17,'#5a3d2b'),R(5,4,28,15,'#2f4f3a')]
        s+=[R(7,6,6,1,'#fff'),R(14,6,1,1,'#fff'),R(16,6,8,1,'#fff'),R(7,9,10,1,'#fff'),R(19,9,6,1,'#fff'),R(7,12,4,1,'#fff'),R(13,12,12,1,'#fff')]
        s+=[R(7,16,2,1,'#7cc7ff'),R(10,15,2,1,'#7cc7ff'),R(13,14,2,1,'#7cc7ff'),R(16,12,2,1,'#7cc7ff'),R(19,13,2,1,'#7cc7ff'),R(22,10,2,1,'#7cc7ff'),R(25,8,2,1,'#7cc7ff'),R(28,7,2,1,'#7cc7ff')]
        s+=monitor(42,18,14,10,'#16213e')+[R(44,25,2,2,'#8b5cf6'),R(47,23,2,4,'#8b5cf6'),R(50,21,2,6,'#8b5cf6')]
    elif n=='MACRO':
        s+=[R(6,4,14,14,O),R(7,5,12,12,'#4aa3df'),R(9,7,4,3,'#4caf50'),R(14,10,3,4,'#4caf50'),R(10,13,2,2,'#4caf50'),R(12,18,2,4,O),R(9,22,8,2,O)]
        s+=monitor(42,12,21,16,'#1b1b1b')
        cols=['#ffe0b2','#ffab91','#ff7043','#e53935','#b71c1c']
        for i in range(4):
            for j in range(5): s.append(R(43+j*4,13+i*3,4,3,cols[(i+j)%5]))
        s+=[R(28,4,4,4,'#e8414d','bl'),R(29,5,2,2,'#fff','bl')]
    return s
def chair(): return [R(26,24,12,10,'#4a4458'),R(27,25,10,8,'#5d5670')]
def station_svg(n,delay=0.0):
    s=base(n)+deco_back(n)+chair()
    s.append(sprite_svg(n,standalone=False,x0=22,y0=15,delay=delay))
    s+=desk()+deco(n)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SW} {SH}" shape-rendering="crispEdges">{CSS}<style>.bl{{animation:bl 1s steps(1) infinite}}@keyframes bl{{50%{{opacity:.3}}}}.st{{animation:st 1.4s steps(1) infinite}}@keyframes st{{50%{{transform:translateY(-1px)}}}}</style>{"".join(s)}</svg>'
def deco_back(n): return []
if __name__=='__main__':
    od=sys.argv[1];os.makedirs(od,exist_ok=True)
    for i,n in enumerate(CH): open(f'{od}/{n}.svg','w').write(station_svg(n,i*0.17))
    print('ok')
