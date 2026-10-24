# Day 10 music bed: Without Me (instrumental) from its first groove beat, ducked under the VO,
# with gain automation that follows the edit (stop on "The idea?", muffled reality check, full outro).
#   ~/.cache/typography-reels/venv/bin/python -I make-bed.py   (run inside episodes/day-10/audio)
import subprocess

M0 = 4.99      # music offset: first beat of the groove (112 BPM)
DUR = 42.9     # VO 40.4 s + 2.5 s outro
G = 0.21       # bed gain under the voice
pts = [(0, 0.5), (0.14, 0.5), (0.45, G), (2.8, G), (3.0, 0.36), (3.4, G),
       (17.78, G), (17.82, 0.0), (18.66, 0.0), (18.69, 0.36), (19.3, G),   # "The idea?" in silence, drop back on the beat
       (23.7, G), (23.84, 0.3), (24.4, G), (36.5, G), (36.56, 0.3), (37.9, 0.34), (38.2, G),
       (40.3, G), (40.42, 0.55), (42.1, 0.55), (42.9, 0.0)]
expr = "0"
for (t0, v0), (t1, v1) in reversed(list(zip(pts, pts[1:]))):
    expr = f"if(between(t,{t0},{t1}),{v0}+({v1}-{v0})*(t-{t0})/{max(t1 - t0, 1e-3)},{expr})"
LP0, LP1 = 28.92, 36.52   # "Of course, this is just our first concept… cost": muffled
fc = (
    f"[0:a]atrim={M0}:{M0 + DUR},asetpts=N/SR/TB,aformat=sample_rates=44100:channel_layouts=stereo,asplit=3[m1][m2][m3];"
    f"[m1]atrim=0:{LP0},asetpts=N/SR/TB,afade=t=out:st={LP0 - 0.03}:d=0.03[a];"
    f"[m2]atrim={LP0}:{LP1},asetpts=N/SR/TB,lowpass=f=520,lowpass=f=520,volume=1.1,afade=t=in:d=0.03,afade=t=out:st={LP1 - LP0 - 0.03}:d=0.03[b];"
    f"[m3]atrim={LP1},asetpts=N/SR/TB,afade=t=in:d=0.03[c];"
    f"[a][b][c]concat=n=3:v=0:a=1,volume=eval=frame:volume='{expr}'[mus];"
    f"[1:a]aformat=sample_rates=44100:channel_layouts=stereo,apad=whole_dur={DUR}[vo];"
    f"[mus][vo]sidechaincompress=threshold=0.05:ratio=3:attack=10:release=300[out]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "music-raw.m4a", "-i", "day-10-vo.m4a", "-filter_complex", fc,
                "-map", "[out]", "-t", str(DUR), "-c:a", "aac", "-b:a", "192k", "music-bed.m4a"], check=True)
print("wrote music-bed.m4a")
