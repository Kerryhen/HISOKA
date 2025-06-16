import { defineStore } from 'pinia';

type SensorReading = {
  timestamp: number;
  value: number;
};

export const useSensorStore = defineStore('sensor', () => {
  // readings keyed by sensor ID
  const sensorData = ref<Record<string, [number[], number[]]>>({})
  const isConnected = ref(false);

  let port: SerialPort | null = null;
  let reader: ReadableStreamDefaultReader<string> | null = null;

  function parseSensorLine(line: string) {
    const [id, timestampStr, valueStr] = line.trim().split(':');
    if (id.startsWith(">")){
        const timestamp = parseInt(timestampStr, 10);
        const value = parseInt(valueStr, 10);
        if (!id || isNaN(timestamp) || isNaN(value)) return null;
        return { id, timestamp, value };
    }
  }

  async function connectSerial(baudRate = 9600) {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported.');
    }

    port = await navigator.serial.requestPort();
    await port.open({ baudRate });

    const decoder = new TextDecoderStream();
    const inputStream = decoder.readable;
    port.readable?.pipeTo(decoder.writable);

    reader = inputStream.getReader();
    isConnected.value = true;

    readLoop();
  }

  async function readLoop() {
    if (!reader) return;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          const parsed = parseSensorLine(value);
          if (parsed) {
            const { id, timestamp, value: val } = parsed;
            if (!sensorData.value[id]) {
              sensorData.value[id] = [[],[]];
              console.log(id)
            }
            sensorData.value[id][0].push(timestamp);
            sensorData.value[id][1].push(val);
          }
        }
      }
    } catch (err) {
      console.error('Serial read error:', err);
    } finally {
      reader?.releaseLock();
      isConnected.value = false;
    }
  }

  async function sendMessage(message: string) {
    if (!port || !port.writable) return;
    const writer = port.writable.getWriter();
    await writer.write(new TextEncoder().encode(message + '\n'));
    writer.releaseLock();
  }

  async function disconnect() {
    try {
      reader?.cancel();
      await port?.close();
      isConnected.value = false;
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }

  return {
    sensorData,
    isConnected,
    connectSerial,
    sendMessage,
    disconnect,
  };
});
