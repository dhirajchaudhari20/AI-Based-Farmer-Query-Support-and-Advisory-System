
export interface LiveConfig {
    model: string;
    generationConfig?: any;
    systemInstruction?: any;
    tools?: any;
}

export class MultimodalLiveClient {
    public url: string;
    public apiKey: string;
    public ws: WebSocket | null = null;

    constructor({ url, apiKey }: { url: string; apiKey: string }) {
        this.url = url;
        this.apiKey = apiKey;
    }

    connect(
        config: LiveConfig,
        callbacks: {
            onopen?: () => void;
            onmessage?: (data: any) => void;
            onerror?: (e: Event) => void;
            onclose?: (e: CloseEvent) => void;
        }
    ): Promise<MultimodalLiveClient> {
        return new Promise((resolve, reject) => {
            const wsURL = `${this.url}?key=${this.apiKey}`;
            this.ws = new WebSocket(wsURL);

            this.ws.addEventListener("open", () => {
                // Send initial setup message
                const setupMessage = {
                    setup: {
                        model: config.model,
                        generationConfig: config.generationConfig,
                        systemInstruction: config.systemInstruction,
                        tools: config.tools,
                    },
                };
                this.log("client.send", setupMessage);
                this.ws?.send(JSON.stringify(setupMessage));

                callbacks.onopen && callbacks.onopen();
                resolve(this);
            });

            this.ws.addEventListener("message", async (event) => {
                try {
                    let data;
                    if (event.data instanceof Blob) {
                        const text = await event.data.text();
                        try {
                            data = JSON.parse(text);
                        } catch {
                            console.log("Received raw blob (not JSON)", event.data);
                            return; // Ignore raw blobs for now if they are not JSON
                        }
                    } else {
                        data = JSON.parse(event.data as string);
                    }

                    // this.log("server.receive", data);
                    callbacks.onmessage && callbacks.onmessage(data);
                } catch (e) {
                    console.error("Error parsing message", e);
                }
            });

            this.ws.addEventListener("error", (e) => {
                console.error("WebSocket error:", e);
                callbacks.onerror && callbacks.onerror(e);
                reject(e);
            });

            this.ws.addEventListener("close", (e) => {
                this.log("client.close", e);
                callbacks.onclose && callbacks.onclose(e);
            });
        });
    }

    isConnected(): boolean {
        return !!this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    sendRealtimeInput(input: any) {
        if (!this.isConnected()) {
            return;
        }
        const message = { realtimeInput: input };
        this.ws?.send(JSON.stringify(message));
    }

    // Returns true if the WebSocket buffer is empty enough to send more video frames
    // This prevents video frame buildup which causes latency "lag"
    canSendVideo(): boolean {
        if (!this.ws) return false;
        // Threshold: 256KB. If more than that is buffered, skip the frame.
        // A typical 320x240 JPEG is ~15-20KB. So this allows ~10-15 frames buffer.
        // If buffer is larger, we are falling behind.
        return this.ws.bufferedAmount < 256000;
    }

    send(data: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(data));
    }

    disconnect() {
        this.ws?.close();
        this.ws = null;
    }

    log(type: string, data: any) {
        // console.log(`${type}:`, data);
    }
}
