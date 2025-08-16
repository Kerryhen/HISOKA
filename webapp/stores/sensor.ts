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
  let stopRequested = false
  let readLoopPromise: Promise<void> | null = null
  let pipeDone: Promise<void> | null = null
  let decoder: TextDecoderStream | null = null

  let connectionStartTime = Date.now()

  function setConnectionStart() {
    connectionStartTime = Date.now()
  }

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

    decoder = new TextDecoderStream()
    const inputStream = decoder.readable
    pipeDone = port.readable?.pipeTo(decoder.writable)
  
    reader = inputStream.getReader()
    isConnected.value = true
    setConnectionStart()
    stopRequested = false
    readLoopPromise = readLoop()
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

  async function disconnect() {
    stopRequested = true;
    try {
    await reader?.cancel().catch(() => {})
    await readLoopPromise?.catch(() => {})
    await reader?.releaseLock()
    await pipeDone?.catch(() => {})
    await port?.close()
    isConnected.value = false
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  }

  async function clearSensorData() {
     sensorData.value = {}
  }

  async function clearSensorDataById(id: string | undefined) {
    console.log("CLEAR ID", id)
    if (id){
      if (sensorData.value[id]) {
        delete sensorData.value[id]
      }
    }
  }

  function getLastDataSlice(sensorId: string, seconds: number): [number[], number[]] {
    const sensor = sensorData.value[sensorId]
    if (!sensor) return [[], []]
  
    const [timestamps, values] = sensor
    if (timestamps.length === 0) return [[], []]
  
    const latestTimestamp = timestamps[timestamps.length - 1]
    const cutoff = latestTimestamp - (seconds * 1000)
  
    const startIndex = timestamps.findIndex(ts => ts >= cutoff)
    if (startIndex === -1) return [[], []]
  
    return [timestamps.slice(startIndex), values.slice(startIndex)]
  }

  return {
    sensorData,
    isConnected,
    connectSerial,
    disconnect,
    clearSensorData,
    clearSensorDataById,
    getLastDataSlice
  };
});
