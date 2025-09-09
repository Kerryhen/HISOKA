import { defineStore } from "pinia";

type SensorReading = {
  timestamp: number;
  value: number;
};

export const useSensorStore = defineStore("sensor", () => {
  // readings keyed by sensor ID
  const sensorData = ref<Record<string, [number[], number[]]>>({});
  const isConnected = ref(false);

  let port: SerialPort | null = null;
  let reader: ReadableStreamDefaultReader<string> | null = null;
  let stopRequested = false;
  let readLoopPromise: Promise<void> | null = null;
  let pipeDone: Promise<void> | null = null;
  let decoder: TextDecoderStream | null = null;
  let full_line = ref("");
  let connectionStartTime = Date.now();

  function setConnectionStart() {
    connectionStartTime = Date.now();
  }

  function process(line){
      line = line.replace(/\s/g, '');
      if (line.indexOf(")") == -1){
          return line.split(",");
      }else{
          let aux = line.split(")");
          return [aux[0].split(","), -1,aux[1]].flat();
      }
  }

  function process2(line){
    return line.split("(");
  }


 
  function parseSensorLine(line: string, buffer_line) {
      let new_line = process(line);
      if (new_line.lastIndexOf(-1) == -1){
          buffer_line.value+=new_line;
      }else{
        buffer_line.value+=new_line.slice(0, new_line.lastIndexOf(-1));
        console.log(buffer_line.value);
        buffer_line.value = new_line.slice(new_line.lastIndexOf(-1));
      }
  }

  async function connectSerial(baudRate = 115200) {
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
    if (!reader){
      console.log("deu merda");
      return; 
    }

    try {
      while (!stopRequested) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          const parsed = parseSensorLine(value, full_line);
          // if (parsed) {
          //   const { id, timestamp, value: val } = parsed;
          //   if (!sensorData.value[id]) {
          //     sensorData.value[id] = [[], []];
          //     console.log(id);
          //   }
          //   sensorData.value[id][0].push(timestamp);
          //   sensorData.value[id][1].push(val);
          // }
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
    if (timestamps.length === 0) return [[], []];

    const latestTimestamp = timestamps[timestamps.length - 1];
    const cutoff = latestTimestamp - seconds * 1000;

    const startIndex = timestamps.findIndex((ts) => ts >= cutoff);
    if (startIndex === -1) return [[], []];

    return [timestamps.slice(startIndex), values.slice(startIndex)];
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
