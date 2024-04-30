import { MUSIC_BASE64 } from "../assets/sound-font";

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
export async function mergeAndDownloadAudioFiles(chordsList, timeDifferences) {
    // Create an AudioContext
    const audioContext = new AudioContext();

    // Load and decode audio files into AudioBuffers
    const base64array = chordsList.map(c => MUSIC_BASE64[chordsList[0]].split(',')[1])
    // console.log('base64array', base64array)
    const buffers = base64array.map(str => base64ToArrayBuffer(str))

    // Calculate the duration of the merged audio
    const maxDuration = buffers.reduce((duration, buffer, index) => {
        const startTime = timeDifferences[index];
        const endTime = startTime + buffer.duration;
        return Math.max(duration, endTime);
    }, 0);

    // Create a new AudioBuffer with the calculated duration
    const mergedBuffer = audioContext.createBuffer(
        1,
        audioContext.sampleRate * maxDuration,
        audioContext.sampleRate
    );

    // Merge the audio files into the mergedBuffer according to the specified timings
    buffers.forEach((buffer, index) => {
        const startTime = audioContext.sampleRate * timeDifferences[index];

        // Copy data from buffer to mergedBuffer at the specified start time
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const sourceData = buffer.getChannelData(channel);
            const destData = mergedBuffer.getChannelData(channel);
            destData.set(sourceData, startTime);
        }
    });

    // Create an AudioBufferSourceNode to play the merged audio
    // const sourceNode = audioContext.createBufferSource();
    // sourceNode.buffer = mergedBuffer;
    // sourceNode.connect(audioContext.destination);
    // sourceNode.start();

    // Convert the merged buffer to a WAV file for downloading
    function audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const length = buffer.length;
        const sampleRate = buffer.sampleRate;

        // Initialize a buffer for the WAV file
        const wavBuffer = new ArrayBuffer(44 + length * numChannels * 2);
        const view = new DataView(wavBuffer);

        // Write the RIFF header
        function writeString(view, offset, str) {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        }

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length * numChannels * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true); // Bits per sample
        writeString(view, 36, 'data');
        view.setUint32(40, length * numChannels * 2, true);

        // Write audio data
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            const offset = 44 + channel * 2;
            for (let i = 0; i < length; i++) {
                const sample = Math.max(-1, Math.min(1, channelData[i])); // Clamp between -1 and 1
                view.setInt16(offset + i * numChannels * 2, sample * 0x7FFF, true);
            }
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    // Convert mergedBuffer to WAV file
    const mergedWavBlob = audioBufferToWav(mergedBuffer);

    // Create a download link for the WAV file
    const url = URL.createObjectURL(mergedWavBlob);
    return url;
}