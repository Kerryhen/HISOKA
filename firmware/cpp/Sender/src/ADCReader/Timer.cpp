#include "ADCReader/Timer.h"

hw_timer_t *TImer0_timer = NULL;
volatile SemaphoreHandle_t TImer0_Semaphore;
portMUX_TYPE TImer0_Mux = portMUX_INITIALIZER_UNLOCKED;
volatile uint32_t TImer0_isrCounter = 0;
volatile uint32_t TImer0_lastIsrAt = 0;
volatile uint8_t TImer0_lastIsrValue =0;


void Timer0_init( const timer_conf_t& config) {

    TImer0_Semaphore = xSemaphoreCreateBinary();
    TImer0_timer = timerBegin(config.timer_freq);
    timerAttachInterrupt(TImer0_timer, &onTimer0);
    timerAlarm(TImer0_timer, config.intervalMicros, true, 0);
};

void Timer0_loop(loop_timers_callback callback) {
    if (xSemaphoreTake(TImer0_Semaphore, 0) == pdTRUE) {
        uint32_t isrCount = 0, isrTime = 0;
        portENTER_CRITICAL(&TImer0_Mux);
        isrCount = TImer0_isrCounter;
        isrTime = TImer0_lastIsrAt;
        portEXIT_CRITICAL(&TImer0_Mux);
        Serial.printf("Timer at %lu ms, value: %u\n",
                            isrTime,
                            isrCount);
        callback();
    }
};

void ARDUINO_ISR_ATTR onTimer0() {

    portENTER_CRITICAL_ISR(&TImer0_Mux);
    TImer0_isrCounter=TImer0_isrCounter+1;
    TImer0_lastIsrAt = millis();
    TImer0_lastIsrValue = analogReadMilliVolts(2);
    portEXIT_CRITICAL_ISR(&TImer0_Mux);
    xSemaphoreGiveFromISR(TImer0_Semaphore, NULL);

};

timer_conf_t TImer0_config = {
    .timerNum = 0,
    .analogPin = 2,
    .intervalMicros = 1000000, // 1 segundo
    .timer_freq = 10000000,
};
