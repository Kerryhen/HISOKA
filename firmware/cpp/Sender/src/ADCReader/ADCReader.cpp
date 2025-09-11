#include <ADCReader/ADCReader.h>
uint8_t adc_pins[] = {1, 2};  //ADC1 pins

// Calculate how many pins are declared in the array - needed as input for the setup function of ADC Continuous
uint8_t adc_pins_count = sizeof(adc_pins) / sizeof(uint8_t);

// Flag which will be set in ISR when conversion is done
volatile bool adc_coversion_done = false;

// Result structure for ADC Continuous reading
adc_continuous_data_t *result = NULL;


// ISR Function that will be triggered when ADC conversion is done
void ARDUINO_ISR_ATTR adcComplete() {
  adc_coversion_done = true;
}

void AdcDataBuffer::add(const adc_continuous_data_t& data) {
    
    if (count < BUFFER_SIZE) {
        buffer[index] = data;
        index = (index + 1) % BUFFER_SIZE;
        count++;
    } else if (!queueFull){
        queueFull = true;
        uint32_t now = micros();
        deltaTimeFull = now-lastTimeFull;
        lastTimeFull = now;
    }
};


uint8_t AdcDataBuffer::size() {
    return count;
};

std::vector<uint8_t> AdcDataBuffer::to_bytes() {
    std::vector<uint8_t> bytes;
    bytes.reserve(count * sizeof(adc_continuous_data_t));  // 🔥 Pre-allocate exactly

    size_t start = (index + BUFFER_SIZE - count) % BUFFER_SIZE;

    for (size_t i = 0; i < count; ++i) {
        size_t pos = (start + i) % BUFFER_SIZE;
        const adc_continuous_data_t& sample = buffer[pos];

        // 👇 Just copy the raw struct bytes directly
        const uint8_t* ptr = reinterpret_cast<const uint8_t*>(&sample);
        bytes.insert(bytes.end(), ptr, ptr + sizeof(adc_continuous_data_t));
    }

    return bytes;
};

void AdcDataBuffer::reset(){
    index = 0;
    count = 0;
    queueFull = false;
};

void AdcDataBuffer::from_bytes(const std::vector<uint8_t>& bytes) {
    reset();
    size_t total_entries = bytes.size() / sizeof(adc_continuous_data_t);

    for (size_t i = 0; i < total_entries && i < BUFFER_SIZE; ++i) {
        adc_continuous_data_t temp;
        std::memcpy(&temp, &bytes[i * sizeof(adc_continuous_data_t)], sizeof(temp));
        add(temp);
    }
};

void AdcDataBuffer::print() {
    std::cout << "ADC Buffer (" << count << " entries):\n";
    for (int i = 0; i < count; ++i) {
        const adc_continuous_data_t& entry = buffer[i];
        std::cout << "  [" << i << "] Channel: " << entry.channel
                    << ", Value: " << entry.avg_read_mvolts << "\n";
    }
};

void setup_adc() {

  // Optional for ESP32: Set the resolution to 9-12 bits (default is 12 bits)
  analogContinuousSetWidth(12);

  // Optional: Set different attenaution (default is ADC_11db)
  analogContinuousSetAtten(ADC_11db);
    
}

void loop_adc(adc_data_callback_t clbk) {
  // Check if conversion is done and try to read data
  if (adc_coversion_done == true) {
    // Set ISR flag back to false
    adc_coversion_done = false;
    // Read data from ADC
    if (analogContinuousRead(&result, 0)) {
        // adc_continuous_data_t resultValue = result;
        clbk(result);

    } else {
      Serial.println("Error occurred during reading data. Set Core Debug Level to error or lower for more information.");
    }
  }
}

void print_adc_result(adc_continuous_data_t* result){
    for (int i = 0; i < adc_pins_count; i++) {
        Serial.printf("\nADC PIN %d data:", result[i].pin);
        Serial.printf("\n   Avg raw value = %d", result[i].avg_read_raw);
        Serial.printf("\n   Avg millivolts value = %d", result[i].avg_read_mvolts);
    }
}