from radio.espnow_comm import ESPNOW_BASE
from primitives.queue import Queue
import asyncio
from machine import ADC, PWM, Timer
import time, struct

PKG_SIZE = 125
from machine import freq

class Sender(ESPNOW_BASE):
    def __init__(self, range=100, colect_freq=1_000, mvs_widow=4):
        super().__init__()
        freq(160000000)
        self.receiver_mac = None
        self.range = range
        self.data = Queue(100) #2x Max_freq?
        self.pin = ADC(2)
        self.pin.atten(ADC.ATTN_11DB)
        self.pin.width(ADC.WIDTH_12BIT)
        self.clk = PWM(1, freq=500, duty_u16=32768)
        self.clk.init()
        self.index = 0
        self.data_pack = []
        self.DATA_FREQ = colect_freq
        self.MVS_WINDOW = mvs_widow
        self.raw_data = [0]*self.MVS_WINDOW
        self.mvs_data = [ ]
        self.data_pkg = self.mvs_data
        self.data_flag = asyncio.ThreadSafeFlag()
    
    def init_Timers(freqs, clbks):
        for idx, (freq, clbk) in enumerate(zip(freqs, clbks)):
            timer = Timer(idx)
            timer.init(mode=Timer.PERIODIC, freq=freq, callback=clbk)
    
    def read_data_clbk(self, timer):
        data = self.pin.read_u16()  # Faz a leitura 
        
        # Faz cache local das listas, (em teoria melhora a performance)
        mvs = self.mvs_data       
        # raw_data = self.raw_data
        # mvsw = self.MVS_WINDOW
        
        # Move uma casa no vetor de média  [1,2,3,4] => [2,3,4,5]
        # raw_data.append(data)       
        # raw_data.pop(0)

        # Adiciona a média caso possível
        if len(mvs) < PKG_SIZE:
            # mvs.append(sum(raw_data[:mvsw])/mvsw)
            mvs.append(data)
            self.mvs_data = mvs
            
            # Case tenha preenchido um pacote, sinaliza.
            if len(mvs) >= PKG_SIZE:
                self.data_pkg = struct.pack(f"!{len(mvs)}e", *mvs)
                self.data_flag.set()
                self.t0 = time.ticks_us()
        # self.raw_data = raw_data
            

    async def listen_for_receiver(self):
        """Listen for broadcast messages from the receiver containing its MAC address."""
        while not self.receiver_mac:
            async for sensor_host, msg in self.esp:
                if self.receiver_mac != sensor_host:
                    self.receiver_mac = sensor_host
                    self.esp.add_peer(sensor_host)
                    Sender.init_Timers(
                        [self.DATA_FREQ],
                        [self.read_data_clbk]
                    )
                    print(f"Receiver MAC registered {sensor_host} {msg}")
            await asyncio.sleep(0)


    async def send_data(self):
        """Send sensor data to the registered receiver."""
        while True:
            if not self.receiver_mac:
                await asyncio.sleep(5)
            else:
                # Espera a sinalização
                send_ok = False
                await self.data_flag.wait()
                while not send_ok :
                    send_ok = await self.esp.asend(self.receiver_mac, self.data_pkg)
                print(time.ticks_diff(time.ticks_us(), self.t0))
                self.mvs_data = []

    def get_async(self):
        return self.listen_for_receiver, self.send_data