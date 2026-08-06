"""Compare two built sites by DOM, not by bytes.

Prettier reflows markup when the pre-format whitespace changes, so a byte diff
reports formatting churn. This compares what actually reaches the browser:
the element tree, every attribute, and the text with runs of whitespace
collapsed -- and separately flags whitespace changes in INLINE context, which
is the one place collapsing could hide a real rendering difference.
"""
import sys, os, re, glob
from html.parser import HTMLParser

INLINE = {"a","span","b","i","em","strong","br","img","small","sub","sup","code","label","button"}

class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.events=[]
        self.stack=[]
    def handle_starttag(self, tag, attrs):
        self.events.append(("open", tag, tuple(sorted(attrs))))
        self.stack.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.events.append(("open", tag, tuple(sorted(attrs))))
        self.events.append(("close", tag))
    def handle_endtag(self, tag):
        self.events.append(("close", tag))
        if self.stack and self.stack[-1]==tag: self.stack.pop()
    def handle_data(self, data):
        t=re.sub(r"\s+"," ",data).strip()
        if t: self.events.append(("text", t))
    def handle_entityref(self, name): self.events.append(("text", f"&{name};"))
    def handle_charref(self, name): self.events.append(("text", f"&#{name};"))
    def handle_comment(self, data): self.events.append(("comment", data.strip()))

def parse(p):
    t=Tree(); t.feed(open(p,encoding="utf-8").read()); return t.events

def inline_ws(path):
    """Whitespace immediately adjacent to an inline tag -- the risky class."""
    h=open(path,encoding="utf-8").read()
    return re.findall(r"(\s*)<(" + "|".join(INLINE) + r")\b", h)

base_dir, new_dir = sys.argv[1], sys.argv[2]
files=sorted(glob.glob(os.path.join(base_dir,"**","*.html"), recursive=True))
bad=[]; ws_notes=[]
for bf in files:
    rel=os.path.relpath(bf, base_dir)
    nf=os.path.join(new_dir, rel)
    if not os.path.exists(nf): bad.append((rel,"MISSING in new")); continue
    a,b=parse(bf),parse(nf)
    if a!=b:
        for i,(x,y) in enumerate(zip(a,b)):
            if x!=y:
                bad.append((rel, f"event {i}\n      base: {x}\n      new : {y}")); break
        else:
            bad.append((rel, f"length {len(a)} vs {len(b)}"))
    ba=[w for w,_ in inline_ws(bf)]; na=[w for w,_ in inline_ws(nf)]
    if len(ba)==len(na):
        chg=sum(1 for x,y in zip(ba,na) if (x=="")!=(y==""))
        if chg: ws_notes.append((rel,chg))
    else:
        ws_notes.append((rel,f"inline tag count {len(ba)} vs {len(na)}"))

print(f"compared {len(files)} files")
print(f"DOM differences: {len(bad)}")
for rel,msg in bad[:8]: print(f"  {rel}: {msg}")
print(f"files where whitespace next to an inline tag appeared/disappeared: {len(ws_notes)}")
for rel,n in ws_notes[:8]: print(f"  {rel}: {n}")
sys.exit(1 if bad else 0)
