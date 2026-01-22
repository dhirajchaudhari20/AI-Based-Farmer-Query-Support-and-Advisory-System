class PCMProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const channelData = input[0];
            // Post the raw float32 data to the main thread
            // We could downsample here, but it's simpler to just send it and
            // handle encoding in the main thread or slightly optimize sending.
            // Actually, for 16kHz target, we might rely on AudioContext sampleRate,
            // but usually the context is running at 44.1 or 48kHz.
            // Sending Float32Array is fine.
            this.port.postMessage(channelData);
        }
        return true;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
