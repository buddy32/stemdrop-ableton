import fs from "node:fs/promises";
import path from "node:path";
import { outgoingDir, toProjectPath } from "./paths.js";

function writeAscii(buffer, offset, value) {
  buffer.write(value, offset, value.length, "ascii");
}

function createDemoWav() {
  const sampleRate = 44100;
  const durationSeconds = 1;
  const channels = 1;
  const bitsPerSample = 16;
  const sampleCount = sampleRate * durationSeconds;
  const dataSize = sampleCount * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  writeAscii(buffer, 0, "RIFF");
  buffer.writeUInt32LE(36 + dataSize, 4);
  writeAscii(buffer, 8, "WAVE");
  writeAscii(buffer, 12, "fmt ");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  writeAscii(buffer, 36, "data");
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const envelope = Math.max(0, 1 - t / durationSeconds);
    const sample = Math.sin(2 * Math.PI * 440 * t) * envelope;
    buffer.writeInt16LE(Math.round(sample * 32767 * 0.35), 44 + index * 2);
  }

  return buffer;
}

await fs.mkdir(outgoingDir, { recursive: true });

const fileName = `demo-${Date.now()}.wav`;
const demoPath = path.join(outgoingDir, fileName);
await fs.writeFile(demoPath, createDemoWav());

console.log("[DEMO] Demo-WAV erzeugt:");
console.log(toProjectPath(demoPath));
