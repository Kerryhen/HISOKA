#include <Arduino.h>

using loop_timers_callback = std::function<void()>;
extern hw_timer_t *TImer0_timer;
extern volatile SemaphoreHandle_t TImer0_Semaphore;
extern portMUX_TYPE TImer0_Mux;
extern volatile uint32_t TImer0_isrCounter;
extern volatile uint32_t TImer0_lastIsrAt;
extern volatile uint8_t TImer0_lastIsrValue;


// Estrutura de configuração para Timer
struct timer_conf_t {
    uint8_t timerNum = 0;
    uint8_t analogPin = 2;
    uint64_t intervalMicros = 100;
    uint64_t timer_freq = 10000000;
};

extern timer_conf_t TImer0_config;

void Timer0_init( const timer_conf_t& config);
void Timer0_loop(loop_timers_callback callback);

void ARDUINO_ISR_ATTR onTimer0();


// void ARDUINO_ISR_ATTR onTimer1();
// void ARDUINO_ISR_ATTR onTimer2();
// void ARDUINO_ISR_ATTR onTimer3();

