from pathlib import Path
import subprocess

p=Path('.github/scripts/build_multilingual_public.py')
text=p.read_text(encoding='utf-8')
old='''def replace_all(text,mapping):\n    # longest phrases first so smaller phrases do not damage larger matches\n    for src,dst in sorted(mapping.items(),key=lambda kv:len(kv[0]),reverse=True):\n        text=text.replace(src,dst)\n    return text\n'''
new='''def replace_all(text,mapping):\n    # One-pass replacement: translated output is never processed again.\n    keys=sorted(mapping,key=len,reverse=True)\n    pattern=re.compile("|".join(re.escape(k) for k in keys))\n    return pattern.sub(lambda m:mapping[m.group(0)],text)\n'''
if old not in text:
    raise SystemExit('replace_all block not found')
p.write_text(text.replace(old,new,1),encoding='utf-8')
subprocess.run(['python3',str(p)],check=True)
print('OK: replacement routine fixed and multilingual pages rebuilt')
