#include "ESP32_NOW_Serial.h"
#include <Arduino.h>
#include "ADCTimers.h"
#include "ADCReader/ADCReader.h"

#ifdef MASTER
  #include "now/master/Master.h"
#else
  #include "now/slave/Slave.h"
#endif
#define CONFIG_ESP_TASK_WDT_TIMEOUT_S 10

TaskHandle_t Loop1;
TaskHandle_t Loop2;

void Loop1Code(void * pvParameters);
void Loop2Code(void * pvParameters);

void setup() {
  Serial.begin(115200);

    xTaskCreatePinnedToCore(
                    Loop1Code,   /* Task function. */
                    "Loop1",     /* name of task. */
                    10000,       /* Stack size of task */
                    NULL,        /* parameter of the task */
                    1,           /* priority of the task */
                    &Loop1,      /* Task handle to keep track of created task */
                    0            /* pin task to core 0 */
    );                  

  xTaskCreatePinnedToCore(
                    Loop2Code,   /* Task function. */
                    "Loop2",     /* name of task. */
                    10000,       /* Stack size of task */
                    NULL,        /* parameter of the task */
                    1,           /* priority of the task */
                    &Loop2,      /* Task handle to keep track of created task */
                    1            /* pin task to core 1 */
    ); 

  }
  
  void Loop1Code(void * pvParameters) {
    Serial.println("Loop1");
    setup_now();

    for(;;){
      loop_now();
    }
  }
  
  void Loop2Code(void * pvParameters) {
    Serial.println("Loop2");
    setup_timers();
    setup_adc();

    AdcDataBuffer buffer;
    
    for(;;){
      loop_timers([&buffer](){
        if (buffer.queueFull){
            Serial.println(buffer.size());
            Serial.println(buffer.deltaTimeFull); 
            buffer.reset();
          }
      });

        loop_adc([&buffer](adc_continuous_data_t* data) {
            buffer.add(*data);
            // delay(100);
        });
    }
}

void loop(){
  
}