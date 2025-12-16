import { NextRequest } from "next/server";

// Simple WAV generator that produces a sine wave whose duration scales with input text length.
function synthesizeWav(text: string) {
  const sampleRate = 22050;
  const maxDuration = 6; // seconds
  const minDuration = 0.5; // seconds
  // duration scales by text length (approx 0.04s per char), capped
  const duration = Math.min(maxDuration, Math.max(minDuration, text.length * 0.04));
  const numSamples = Math.floor(sampleRate * duration);

  const freq = 440; // A4 tone for demo
  const amplitude = 0.6; // amplitude for int16

  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // simple envelope (fade in/out)
    const env = Math.min(1, t * 10) * Math.min(1, (duration - t) * 10);
    const s = Math.sin(2 * Math.PI * freq * t) * amplitude * env;
    samples[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }

  // Build WAV (RIFF) 16-bit PCM mono
  const blockAlign = 2; // 16-bit mono
  const byteRate = sampleRate * blockAlign;
  const dataByteLength = samples.length * 2;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataByteLength, true); // file length - 8
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, dataByteLength, true);

  // Compose header + PCM data
  const wavBuffer = new Uint8Array(44 + dataByteLength);
  wavBuffer.set(new Uint8Array(header), 0);
  // PCM samples little-endian
  const pcmView = new DataView(wavBuffer.buffer, 44);
  for (let i = 0; i < samples.length; i++) {
    pcmView.setInt16(i * 2, samples[i], true);
  }

  return wavBuffer.buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body?.text ?? "Hello from Voxify-ai!") + "";

    const wav = synthesizeWav(text);

    return new Response(Buffer.from(wav), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="tts.wav"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to synthesize" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  // simple info route
  return new Response(JSON.stringify({ ok: true, note: "POST JSON {text:string} to receive WAV" }), {
    headers: { "Content-Type": "application/json" },
  });
}
