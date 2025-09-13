import { defineStore } from "pinia";

type SensorReading = {
  timestamp: number;
  value: number;
};

class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private index: number = 0;
  private isFull: boolean = false;

  constructor(private readonly size: number) {
    if (size <= 0) throw new Error("Buffer size must be greater than 0");
    this.buffer = new Array<T | undefined>(size);
  }

  add(item: T): void {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.size;
    if (this.index === 0) {
      this.isFull = true;
    }
  }

  getBuffer(): T[] {
    if (!this.isFull) {
      // Retorna apenas os itens inseridos até agora
      return this.buffer.slice(0, this.index) as T[];
    }

    // Reorganiza os dados em ordem de inserção
    return [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)] as T[];
  }

  clear(): void {
    this.buffer = new Array<T | undefined>(this.size);
    this.index = 0;
    this.isFull = false;
  }

  get length(): number {
    return this.isFull ? this.size : this.index;
  }
}

export const useSensorStore = defineStore("sensor", () => {
  // readings keyed by sensor ID
  const sensorData = ref<Record<string, [CircularBuffer<number>, CircularBuffer<number>]>>({});
  const isConnected = ref(false);

  let port: SerialPort | null = null;
  let reader: ReadableStreamDefaultReader<string> | null = null;
  let stopRequested = false;
  let readLoopPromise: Promise<void> | null = null;
  let pipeDone: Promise<void> | null = null;
  let decoder: TextDecoderStream | null = null;

  let connectionStartTime = Date.now();

  function setConnectionStart() {
    connectionStartTime = Date.now();
  }

  function parseSensorLine(line: string) {
    const [id, timestampStr, valueStr] = line.trim().split(":");
    if (id.startsWith(">")) {
      const timestamp = parseInt(timestampStr, 10);
      const value = parseInt(valueStr, 10);
      if (!id || isNaN(timestamp) || isNaN(value)) return null;
      return { id, timestamp, value };
    }
  }

  async function connectSerial(baudRate = 9600) {
    if (!("serial" in navigator)) {
      throw new Error("Web Serial API not supported.");
    }

    port = await navigator.serial.requestPort();
    await port.open({ baudRate });

    decoder = new TextDecoderStream();
    const inputStream = decoder.readable;
    pipeDone = port.readable?.pipeTo(decoder.writable);

    reader = inputStream.getReader();
    isConnected.value = true;
    setConnectionStart();
    stopRequested = false;
    readLoopPromise = readLoop();
  }

  async function readLoop() {
    if (!reader) return;

    try {
      while (!stopRequested) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const parsed = parseSensorLine(value);
          if (parsed) {
            const { id, timestamp, value: val } = parsed;
            if (!sensorData.value[id]) {
              sensorData.value[id] = [new CircularBuffer(500), new CircularBuffer(500)];
              console.log(id);
            }
            sensorData.value[id][0].add(timestamp);
            sensorData.value[id][1].add(val);
          }
        }
      }
    } catch (err) {
      console.error("Serial read error:", err);
    } finally {
      reader?.releaseLock();
      isConnected.value = false;
    }
  }

  async function disconnect() {
    stopRequested = true;
    try {
      await reader?.cancel().catch(() => {});
      await readLoopPromise?.catch(() => {});
      await reader?.releaseLock();
      await pipeDone?.catch(() => {});
      await port?.close();
      isConnected.value = false;
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }

  async function clearSensorData() {
    sensorData.value = {};
  }

  async function clearSensorDataById(id: string | undefined) {
    console.log("CLEAR ID", id);
    if (id) {
      if (sensorData.value[id]) {
        delete sensorData.value[id];
      }
    }
  }

  function getLastDataSlice(
    sensorId: string,
    seconds: number,
  ): [number[], number[]] {
    const sensor = sensorData.value[sensorId];
    if (!sensor) return [[], []];

    const [timestamps, values] = sensor;
    // if (timestamps.length === 0) return [[], []];

    // const latestTimestamp = timestamps[timestamps.length - 1];
    // const cutoff = latestTimestamp - seconds * 1000;

    // const startIndex = timestamps.findIndex((ts) => ts >= cutoff);
    // if (startIndex === -1) return [[], []];

    return [timestamps.getBuffer(), values.getBuffer()];
  }

  return {
    sensorData,
    isConnected,
    connectSerial,
    disconnect,
    clearSensorData,
    clearSensorDataById,
    getLastDataSlice,
  };
});
