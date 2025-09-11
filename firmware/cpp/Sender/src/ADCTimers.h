#include <Arduino.h>
// typedef void (*loop_timers_callback)();
using loop_timers_callback = std::function<void()>;
void setup_timers();
void loop_timers(loop_timers_callback callback);
void ARDUINO_ISR_ATTR onTimer();