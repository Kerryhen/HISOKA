<template>
  <div>
    <button @click="connect" :disabled="sensorStore.isConnected">Connect</button>
    <button @click="disconnect" :disabled="!sensorStore.isConnected">Disconnect</button>
  </div>
</template>

<script setup lang="ts">
const sensorStore = useSensorStore();

const connect = () => sensorStore.connectSerial();
const disconnect = () => sensorStore.disconnect();
</script>
