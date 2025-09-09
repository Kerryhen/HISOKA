import aioespnow
import network
import time
import asyncio

class ESPNOW_BASE:
    def __init__(self):
        
        # self.esp = espnow.ESPNow()
        self.esp = aioespnow.AIOESPNow()
        self.broadcastaddr = b'\xff'*6
        self.loop = asyncio.get_event_loop()   
    
    def init(self):
        """Initialize Wi-Fi and ESP-NOW."""
        self.wlan, self.ap = ESPNOW_BASE.wifi_reset()
        self.wlan.config(pm=self.wlan.PM_NONE, channel=6)
        self.mac = self.wlan.config('mac')
        self.esp.active(True)
        self.esp.add_peer(self.broadcastaddr)

    async def broadcast(self, message):
        await self.esp.asend(self.broadcastaddr, message)
    
    def wifi_reset():   # Reset wifi to AP_IF off, STA_IF on and disconnected
        sta = network.WLAN(network.WLAN.IF_STA); sta.active(False)
        ap = network.WLAN(network.WLAN.IF_AP); ap.active(False)
        sta.active(True)
        while not sta.active():
            time.sleep(0.1)
        sta.disconnect()   # For ESP8266
        while sta.isconnected():
            time.sleep(0.1)
        return sta, ap


class logger:
    def __init__(self, name=None, unit=None, _type=None):
        self.name = name
        self.unit = f"§{unit}" if unit else ""
        self._type = f"|{_type}" if _type else ""

    def print(self, value, name=None):
        print(f">{name or self.name}:{time.time_ns()}:{value}{self.unit}{self._type}")