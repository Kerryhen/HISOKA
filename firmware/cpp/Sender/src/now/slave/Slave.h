#ifndef SLAVE_H
#define SLAVE_H
#include "DefaultNow.h"
#include <vector>

class ESP_NOW_Peer_Class : public ESP_NOW_Peer {
public:
  // Constructor of the class
  ESP_NOW_Peer_Class(const uint8_t *mac_addr, uint8_t channel, wifi_interface_t iface, const uint8_t *lmk) : ESP_NOW_Peer(mac_addr, channel, iface, lmk) {}

  // Destructor of the class
  ~ESP_NOW_Peer_Class() {}

  // Function to register the master peer
  bool add_peer();
  // Function to print the received messages from the master
  void onReceive(const uint8_t *data, size_t len, bool broadcast);
};

void register_new_master(const esp_now_recv_info_t *info, const uint8_t *data, int len, void *arg);
#endif