#!/usr/bin/env python3
"""Mix the user-provided song with restrained generated effects and measure delivery audio."""
from pathlib import Path
import argparse, json, re, subprocess

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--silent',type=Path,default=ROOT/'out/silent.mp4')
parser.add_argument('--output',type=Path,default=ROOT.parent/'deliverables/nezar-poetic-motion.mp4')
parser.add_argument('--scratch',type=Path,default=ROOT/'out')
a=parser.parse_args();a.scratch.mkdir(parents=True,exist_ok=True);a.output.parent.mkdir(parents=True,exist_ok=True)
song=ROOT.parent/'الأغنية.mp3';sfx=a.scratch/'sfx.wav';mix=a.scratch/'mix.wav'
def run(args,**kw):return subprocess.run(args,check=True,**kw)
run(['node',str(ROOT/'scripts/sfx.mjs'),str(ROOT/'cues.json'),str(sfx)])
fc='[0:a]atrim=duration=120,asetpts=PTS-STARTPTS,afade=t=out:st=119.15:d=0.85[music];[1:a]volume=0.055,apad,atrim=duration=120,pan=stereo|c0=c0|c1=c0[fx];[music][fx]amix=inputs=2:duration=first:normalize=0[mix]'
run(['ffmpeg','-y','-v','error','-i',str(song),'-i',str(sfx),'-filter_complex',fc,'-map','[mix]','-c:a','pcm_f32le','-ar','48000',str(mix)])
def measure(path):
    p=run(['ffmpeg','-hide_banner','-i',str(path),'-vn','-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
    return json.loads(re.findall(r'\{[^{}]*\}',p.stderr)[-1])
before=measure(mix)
gain=-14.0-float(before['input_i'])
# Preserve the supplied recording's dynamics. A measured linear gain is sufficient
# when the resulting true peak is under -1.5 dBTP; otherwise gain is peak constrained.
if float(before['input_tp'])+gain>-1.5:gain=-1.5-float(before['input_tp'])
print(f'Measured mix: {before["input_i"]} LUFS; gain {gain:.2f} dB')
run(['ffmpeg','-y','-v','error','-i',str(a.silent),'-i',str(mix),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',f'volume={gain:.5f}dB','-c:a','aac','-b:a','160k','-ar','48000','-t','120','-movflags','+faststart','-metadata','title=القصيدة التي تصير صباحًا','-metadata','comment=كلمات نزار القدسي — تصميم وهندسة صوتية: ومض',str(a.output)])
after=measure(a.output)
report={'source':'user-provided original song','source_offset_seconds':0,'original_lyrics_timing_preserved':True,'sfx_gain':0.055,'sfx_cues':len(json.loads((ROOT/'cues.json').read_text())),'target_lufs':-14,'applied_gain_db':round(gain,3),'measured_integrated_lufs':float(after['input_i']),'measured_true_peak_dbtp':float(after['input_tp']),'measured_lra':float(after['input_lra']),'audio_codec':'AAC stereo 160k 48kHz','fade_out':[119.15,120],'before':before}
(ROOT/'docs/audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['measured_integrated_lufs','measured_true_peak_dbtp','measured_lra']},indent=2))
print('Mixed movie:',a.output)
