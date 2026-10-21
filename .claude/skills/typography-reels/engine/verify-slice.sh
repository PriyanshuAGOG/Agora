#!/usr/bin/env bash
# Re-transcribe one slice of a voiceover with BOTH Parakeet (word times) and Whisper small.en (text),
# to recover phrases the full-file pass dropped or misheard.
#
#   bash verify-slice.sh <audio> <from-seconds> <to-seconds>
#
# Prints Whisper's text and Parakeet's words with absolute times; patch transcript.json from them.
# Run transcribe.sh once first (it sets up the shared cache).
set -euo pipefail
IN="$1"; A="$2"; B="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="${TYPO_REELS_CACHE:-$HOME/.cache/typography-reels}"
VENV="$CACHE/venv"; PK="$CACHE/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8"; WH="$CACHE/sherpa-onnx-whisper-small.en"
if [ ! -f "$WH/small.en-tokens.txt" ]; then
  curl -sSL -o "$CACHE/whisper.tar.bz2" \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.en.tar.bz2
  tar xjf "$CACHE/whisper.tar.bz2" -C "$CACHE" && rm -f "$CACHE/whisper.tar.bz2"
fi
WAV="$(mktemp --suffix .wav)"; JS="$(mktemp --suffix .json)"
ffmpeg -nostdin -v error -y -ss "$A" -to "$B" -i "$IN" -ar 16000 -ac 1 "$WAV"
"$VENV/bin/python" -I - "$WH" "$WAV" <<'EOF'
import sys, sherpa_onnx, soundfile as sf
M, wav = sys.argv[1], sys.argv[2]
r = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{M}/small.en-encoder.int8.onnx", decoder=f"{M}/small.en-decoder.int8.onnx", tokens=f"{M}/small.en-tokens.txt", language="en", task="transcribe", num_threads=4)
a, sr = sf.read(wav, dtype="float32"); s = r.create_stream(); s.accept_waveform(sr, a); r.decode_stream(s)
print("whisper :", s.result.text.strip())
EOF
echo -n "parakeet: "; "$VENV/bin/python" -I "$HERE/transcribe.py" "$PK" "$WAV" "$JS" >/dev/null
python3 -c "import json,sys; print(' '.join(f\"{w['text']}@{w['start']+float(sys.argv[2]):.2f}\" for w in json.load(open(sys.argv[1]))))" "$JS" "$A"
rm -f "$WAV" "$JS"
