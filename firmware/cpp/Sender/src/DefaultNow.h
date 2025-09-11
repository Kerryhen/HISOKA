#ifndef DEFAULTNOW_H
#define DEFAULTNOW_H
#include "ESP32_NOW.h"
#include "WiFi.h"

#include <esp_mac.h>

#define ESPNOW_WIFI_CHANNEL 6

void setup_now();
void loop_now();
#endif