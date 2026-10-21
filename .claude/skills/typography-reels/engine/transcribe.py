"""Parakeet-TDT (sherpa-onnx) -> word-level transcript JSON. Called by transcribe.sh."""
import json
import sys

import sherpa_onnx
import soundfile as sf

model, wav, out = sys.argv[1], sys.argv[2], sys.argv[3]
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{model}/encoder.int8.onnx",
    decoder=f"{model}/decoder.int8.onnx",
    joiner=f"{model}/joiner.int8.onnx",
    tokens=f"{model}/tokens.txt",
    model_type="nemo_transducer",
    num_threads=4,
)
audio, sr = sf.read(wav, dtype="float32")
stream = rec.create_stream()
stream.accept_waveform(sr, audio)
rec.decode_stream(stream)
res = stream.result

# Sub-word tokens: a leading "▁" (or space) starts a new word.
words = []
for tok, t in zip(res.tokens, res.timestamps):
    if tok.startswith(("▁", " ")) or not words:
        words.append({"text": tok.lstrip("▁ "), "start": round(t, 2)})
    else:
        words[-1]["text"] += tok
for i, w in enumerate(words):
    w["end"] = words[i + 1]["start"] if i + 1 < len(words) else round(len(audio) / sr, 2)
json.dump(words, open(out, "w"), indent=0)
print(res.text)
