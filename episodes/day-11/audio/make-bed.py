# Day 11 music bed: Without Me (instrumental) from its first groove beat, ducked under the VO,
# with gain automation that follows the edit (stop on "The idea?", muffled reality check, full outro).
#   ~/.cache/typography-reels/venv/bin/python -I make-bed.py   (run inside episodes/day-10/audio)
import subprocess

M0 = 4.99      # music offset: first beat of the groove (112 BPM)
DUR = 51.6     # VO 49.2 s + 2.4 s outro
G = 0.21       # bed gain under the voice
pts = [(0, 0.5), (0.12, 0.5), (0.45, G), (3.5, G), (3.66, 0.4), (4.3, G),
       (44.2, G), (44.26, 0.0), (45.9, 0.0), (45.93, 0.55), (46.6, G),   # "not just selling paper" in silence, drop on the beat into "EXPERIENCE"
       (47.6, G), (49.2, 0.55), (50.9, 0.55), (51.6, 0.0)]
expr = "0"
for (t0, v0), (t1, v1) in reversed(list(zip(pts, pts[1:]))):
    expr = f"if(between(t,{t0},{t1}),{v0}+({v1}-{v0})*(t-{t0})/{max(t1 - t0, 1e-3)},{expr})"
LP0, LP1 = 32.36, 34.18   # "It'll cost us more": muffled, back to full on the beat at "want"
fc = (
    f"[0:a]atrim={M0}:{M0 + DUR},asetpts=N/SR/TB,aformat=sample_rates=44100:channel_layouts=stereo,asplit=3[m1][m2][m3];"
    f"[m1]atrim=0:{LP0},asetpts=N/SR/TB,afade=t=out:st={LP0 - 0.03}:d=0.03[a];"
    f"[m2]atrim={LP0}:{LP1},asetpts=N/SR/TB,lowpass=f=520,lowpass=f=520,volume=1.1,afade=t=in:d=0.03,afade=t=out:st={LP1 - LP0 - 0.03}:d=0.03[b];"
    f"[m3]atrim={LP1},asetpts=N/SR/TB,afade=t=in:d=0.03[c];"
    f"[a][b][c]concat=n=3:v=0:a=1,volume=eval=frame:volume='{expr}'[mus];"
    f"[1:a]aformat=sample_rates=44100:channel_layouts=stereo,apad=whole_dur={DUR}[vo];"
    f"[mus][vo]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=300[out]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "music-raw.m4a", "-i", "day-11-vo.m4a", "-filter_complex", fc,
                "-map", "[out]", "-t", str(DUR), "-c:a", "aac", "-b:a", "192k", "music-bed.m4a"], check=True)
print("wrote music-bed.m4a")
