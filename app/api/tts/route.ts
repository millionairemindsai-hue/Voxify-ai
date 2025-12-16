// Mock TTS route: returns a generated WAV (sine tone) whose length scales with input text length.
export async function POST(req: Request) {
  try {
    const { text = "Hello from Voxify-ai!" } = (await req.json()) as { text?: string };

    const wav = synthesizeWav(String(text));

    return new Response(wav, {
      status: 200,
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'synthesis_failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ ok: true, note: 'POST JSON {text:string} to receive WAV' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function synthesizeWav(text: string) {
  const sampleRate = 22050;
  const maxDuration = 6;
  const minDuration = 0.5;
  const duration = Math.min(maxDuration, Math.max(minDuration, text.length * 0.04));
  const numSamples = Math.floor(sampleRate * duration);

  const freq = 440;
  const amplitude = 0.6;

  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t * 10) * Math.min(1, (duration - t) * 10);
    const s = Math.sin(2 * Math.PI * freq * t) * amplitude * env;
    samples[i] = Math.max(-1, Math.min(1, s)) * 0x7fff;
  }

  const blockAlign = 2;
  const byteRate = sampleRate * blockAlign;
  const dataByteLength = samples.length * 2;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  const wavBuffer = new Uint8Array(44 + dataByteLength);
  wavBuffer.set(new Uint8Array(header), 0);
  const pcmView = new DataView(wavBuffer.buffer, 44);
  for (let i = 0; i < samples.length; i++) pcmView.setInt16(i * 2, samples[i], true);

  return wavBuffer.buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
