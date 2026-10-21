#!/usr/bin/env bash
# Offline word-level transcription with NVIDIA Parakeet-TDT 0.6B v2 (English) via sherpa-onnx.
# Works where huggingface.co is blocked: the model comes from GitHub releases, the runtime from PyPI.
#
#   bash transcribe.sh <audio-or-video> <out-transcript.json>
#
# First run sets up ~/.cache/typography-reels/{venv,parakeet} (~650 MB). Output is a JSON array of
# {text, start, end} words that `node words.mjs` reads.
set -euo pipefail
IN="$1"; OUT="$2"
HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="${TYPO_REELS_CACHE:-$HOME/.cache/typography-reels}"
VENV="$CACHE/venv"; MODEL="$CACHE/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8"
mkdir -p "$CACHE"
if [ ! -x "$VENV/bin/python" ]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q sherpa-onnx soundfile numpy
fi
if [ ! -f "$MODEL/tokens.txt" ]; then
  curl -sSL -o "$CACHE/parakeet.tar.bz2" \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2
  tar xjf "$CACHE/parakeet.tar.bz2" -C "$CACHE" && rm -f "$CACHE/parakeet.tar.bz2"
fi
WAV="$(mktemp --suffix .wav)"
ffmpeg -nostdin -v error -y -i "$IN" -ar 16000 -ac 1 "$WAV"
"$VENV/bin/python" -I "$HERE/transcribe.py" "$MODEL" "$WAV" "$OUT"
rm -f "$WAV"
