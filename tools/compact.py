import re
def compact(svg):
    # Within each group context, merge consecutive rects of same fill/class into a path
    def merge(m):
        seq=m.group(0)
        rects=re.findall(r'<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="([^"]+)"(?: class="(\w+)")?/>',seq)
        out=[];cur=None;d=''
        for x,y,w,h,f,c in rects:
            k=(f,c)
            if k!=cur:
                if cur: out.append((cur,d))
                cur=k;d=''
            d+=f'M{x} {y}h{w}v{h}h-{w}z'
        if cur: out.append((cur,d))
        return ''.join(f'<path d="{d}" fill="{f}"'+(f' class="{c}"' if c else '')+'/>' for (f,c),d in out)
    return re.sub(r'(?:<rect [^>]*/>)+',merge,svg)
