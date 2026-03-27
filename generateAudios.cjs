const fs = require('fs');
const path = require('path');

function createWavHeader(dataLength, sampleRate, numChannels, bitsPerSample) {
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    return buffer;
}

function generateNoise(type, durationSeconds, sampleRate = 44100) {
    const numSamples = durationSeconds * sampleRate;
    const buffer = Buffer.alloc(numSamples * 2);

    let lastOut = 0;
    for (let i = 0; i < numSamples; i++) {
        const white = Math.random() * 2 - 1;
        let sample = 0;

        if (type === 'whitenoise') {
            sample = white * 0.3;
        } else if (type === 'rain') { 
            // Pink noise approximation
            lastOut = (lastOut * 0.8) + (white * 0.2);
            sample = lastOut * 1.5;
            // Add crackle
            if (Math.random() < 0.05) sample += white * 0.5;
        } else if (type === 'ocean') { 
            // Brown noise approximation + wave volume envelope
            lastOut = (lastOut * 0.98) + (white * 0.02);
            sample = lastOut * 3;
            // Wave LFO: 1 cycle every 6 seconds
            const lfo = Math.pow(Math.abs(Math.sin((i / sampleRate) * 0.16 * Math.PI)), 2); 
            sample *= (0.1 + lfo * 0.9);
        } else if (type === 'forest') { 
            // Gentle wind
            lastOut = (lastOut * 0.95) + (white * 0.05);
            sample = lastOut * 1.5;
            const lfo = Math.abs(Math.sin((i / sampleRate) * 0.1 * Math.PI)); 
            sample *= (0.3 + lfo * 0.7);
            
            // Random bird chirps (sine wave burst)
            if ((i % (sampleRate * 2)) < 2000 && Math.random() > 0.0) {
                 const freq = 3000 + Math.sin(i / 100) * 500;
                 sample += Math.sin((i / sampleRate) * freq * Math.PI * 2) * 0.5 * Math.exp(-(i % (sampleRate * 2)) / 500);
            }
        }
        
        sample = Math.max(-1, Math.min(1, sample));
        buffer.writeInt16LE(sample * 32767 | 0, i * 2);
    }

    const header = createWavHeader(buffer.length, sampleRate, 1, 16);
    return Buffer.concat([header, buffer]);
}

const dir = path.join(__dirname, 'public', 'audio');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'whitenoise.wav'), generateNoise('whitenoise', 15));
fs.writeFileSync(path.join(dir, 'rain.wav'), generateNoise('rain', 15));
fs.writeFileSync(path.join(dir, 'ocean.wav'), generateNoise('ocean', 15));
fs.writeFileSync(path.join(dir, 'forest.wav'), generateNoise('forest', 20));

console.log('Audios successfully generated as .wav !');
