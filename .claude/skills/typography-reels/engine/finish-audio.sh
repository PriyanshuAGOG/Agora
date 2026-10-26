#!/usr/bin/env bash
# Normalise a rendered episode's audio to a fixed loudness (two-pass EBU R128 loudnorm), video copied untouched.
# The renderer's mixer level varies with how many clips overlap, so every episode gets this as its last step.
#
#   bash finish-audio.sh <rendered.mp4> <out.mp4> [target LUFS, default -14]
set -euo pipefail
IN="$1"; OUT="$2"; I="${3:--14}"; TP=-1.0; LRA=11
JSON="$(ffmpeg -nostdin -hide_banner -i "$IN" -vn -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')"
val() { python3 -c "import json,sys; print(json.loads(sys.argv[1])[sys.argv[2]])" "$JSON" "$1"; }
ffmpeg -nostdin -v error -y -i "$IN" -c:v copy \
  -af "loudnorm=I=$I:TP=$TP:LRA=$LRA:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 "$OUT"
ffmpeg -nostdin -i "$OUT" -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' ' | tr '\n' ' '; echo
