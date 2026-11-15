"""Records every sentence in voice/list.json with the Kokoro neural voice (Apache-2.0).

Runs in the GitHub build (it needs to download the model). Only sentences without a clip are recorded,
and clips for sentences that no longer exist are deleted.
  python scripts/make-voices.py --count   -> prints how many clips are missing
  python scripts/make-voices.py           -> records them as voice/<voice>/<id>.ogg (Opus, mono)
"""
import json, subprocess, sys, tempfile
from pathlib import Path

VOICES = {'af_heart': 'a'}  # voice name -> Kokoro language ('a' = American English)
ROOT = Path(__file__).resolve().parent.parent / 'voice'
items = json.loads((ROOT / 'list.json').read_text())

def missing(voice):
    return [it for it in items if not (ROOT / voice / f"{it['key']}.ogg").exists()]

if '--count' in sys.argv:
    print(sum(len(missing(v)) for v in VOICES))
    sys.exit(0)

import numpy as np
import soundfile as sf
from kokoro import KPipeline

for voice, lang in VOICES.items():
    out = ROOT / voice
    out.mkdir(parents=True, exist_ok=True)
    keep = {f"{it['key']}.ogg" for it in items}
    for f in out.glob('*.ogg'):
        if f.name not in keep:
            f.unlink()
    todo = missing(voice)
    print(f'{voice}: {len(todo)} clips to record', flush=True)
    pipe = KPipeline(lang_code=lang, repo_id='hexgrad/Kokoro-82M')
    for n, it in enumerate(todo, 1):
        parts = [np.asarray(r.audio) for r in pipe(it['text'], voice=voice, speed=1.0) if r.audio is not None]
        audio = np.concatenate(parts)
        with tempfile.NamedTemporaryFile(suffix='.wav') as wav:
            sf.write(wav.name, audio, 24000)
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', wav.name, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,apad=pad_dur=0.15',
                            '-ac', '1', '-c:a', 'libopus', '-b:a', '24k', '-application', 'voip', str(out / f"{it['key']}.ogg")], check=True)
        if n % 50 == 0:
            print(f'  {n}/{len(todo)}', flush=True)
    print(f'{voice}: done', flush=True)
