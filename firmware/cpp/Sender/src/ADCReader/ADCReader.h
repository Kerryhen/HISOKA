#ifndef ADCREADER_H
#define ADCREADER_H
#include <Arduino.h>
#include <iostream>
#include <array>
#include <vector>
#include <cstdint>
#include <cstring>  // for memcpy

// Define how many conversion per pin will happen and reading the data will be and average of all conversions
#define CONVERSIONS_PER_PIN 1
#define SAMPLE_ADC_FREQ 2000 * CONVERSIONS_PER_PIN
#define BUFFER_SIZE 62

// typedef void (*adc_data_callback_t)(adc_continuous_data_t* result);
using adc_data_callback_t = std::function<void(adc_continuous_data_t*)>;

void adcComplete();
void setup_adc();
void loop_adc(adc_data_callback_t clbk);
void print_adc_result(adc_continuous_data_t* result);

struct AdcDataBuffer {
    // std::array<adc_continuous_data_t, BUFFER_SIZE> buffer{};
    adc_continuous_data_t buffer[BUFFER_SIZE];
    size_t index = 0;
    uint8_t count = 0;
    uint32_t lastTimeFull = micros();
    uint32_t deltaTimeFull = micros();
    bool queueFull = false;

    // Add new ADC sample to buffer (circular)
    void add(const adc_continuous_data_t& data);

    // Get most recent entry
    // uint8_t get_recent(uint8_t i);

    // Get number of valid entries
    uint8_t size();

    // Clear buffer
    void reset();

    // 🔄 Serialize buffer to bytes (oldest to newest)
    std::vector<uint8_t> to_bytes();

    // 🔁 Deserialize from byte array
    void from_bytes(const std::vector<uint8_t>& bytes);

    // 🖨️ Debug print
    void print();
};
#endif