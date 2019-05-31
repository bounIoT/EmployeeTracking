# EmployeeTracking

![A1](https://user-images.githubusercontent.com/5247569/58688317-cb3ddd00-838c-11e9-84e0-0b0aeb726e6c.jpg)

This project aims to track locations of certain devices using Wi-Fi rssi measurements. We chose NodeMCU's to monitor Wi-Fi signals, but later we realized the signal strength measurements were very unstable. It is infeasible to use NodeMCU's for this project.

## Usage

This project has many sub-applications. We will try to go through the steps to use this software as much as possible.

There two main steps:
1. Training
2. Production

### Training

Training step essentially uses 4 applications:
* android_data_labelling_client
* android_server
* data_labelling_mqtt_client
* node_software

`node_software` must be installed on NodeMCU's. We used 3 NodeMCU's in our example, but any number of NodeMCU's can be used. Every NodeMCU must be connected to a computer with `android_server` software installed on them. These computers and a mobile phone with `android_data_labelling_client` application installed must be on the same network.

In one of the machines, (or in an external machine on the same network) `data_labelling_mqtt_client` and `mosquitto` must be running.

`android_server` applications must be customized to have different id numbers on each PC. The port which NodeMCU is connected to and the ip address of the MQTT broker must also be defined in the program's constants.

After setting up everything, you may start using the Android application. In the first text field, the IP address and port of every machine on the network that runs `android_server` application must be written in the following format:

```
[host1]:[port1],[host2]:[port2],
```

On the second field, the MAC address of the target device (usually the mobile phone itself), must be typed in. Newer Android versions do not allow us to read MAC address of the phone directly, so we have to give it manually.

After this, we use the connect button to connect to the servers on the network. We may then set location of the tracked device, and then start capturing packets from the target device.

`data_labelling_mqtt_client` application writes the collected data into a file named `db.sqlite`. This file can be used to for the machine learning algorithms. Any tool can be used for the machine learning part. We have placed our machine learning code into the `machine_learning` directory.

### Production

Production uses 5 of the applications:
* android_server
* cloud_server
* frontend
* rpi_edge_server
* node_software

In the `android_server` application the script named `only_serial_port.js` is used. This script transfers the received packet information to the MQTT server.

`rpi_edge_server` sends 3 matched packets into the cloud for measurements.

`cloud_server` receives packets and stores predictions in memory, also sends the the predictions via `socket.io`.

`frontend` connects to the `cloud_server`, and receives predictions via `socket.io`.

### All applications

* **Node/android_data_labelling_client**: Small native Android application used for data labelling.
* **Node/android_server**: Node.js application that is used to connect Android client to computer. Used open source libraries:
  - mqtt
  - serialport
  - uuid
* **Node/data_labelling_mqtt_client**: Node.js application to store received data on MQTT to an sqlite3 database.
  - mqtt
  - sqlite
* **Node/node_software**: The code that runs on NodeMCU's.
* **Node/rpi_edge_server**: The code that runs on Raspberry Pi, on production. This is a Node.js application that listens to MQTT and sends received information to cloud.
  - mqtt
  - axios
  - socket.io
* **UI/frontend**: This is the UI of the application, it is written using the React.js framework.
* **Cloud/cloud_server**: This is the piece of software that runs on cloud. This software receives measurements from the nodes and sends predictions.
  - react.js
  - socket.io
* **ML**: This directory shows what we have done for machine learning purposes.
  - scikit-learn
  - numpy
  - pandas

## Schema

![schema](https://user-images.githubusercontent.com/5247569/58688872-510e5800-838e-11e9-9132-9c30dcc5d73b.jpg)

## Components

Component | Name | Action
---|---|---
Embedded HW (monitoring) x3 | NodeMCU | Integration
Embedded HW (communication) x3 | NodeMCU | Integration
Gateway + Edge Computing Unit | Raspberry Pi | Integration
Embedded HW (communication) | Realtek USB Wi-Fi Adapter | Integration
Development UI (Android App for Data Collection) | Local, (Native Android) | Development; we receive data labels from the application.
Embedded SW (Server Software for Android Application) | Local, (node.js) | Development; collects and sends data to MQTT broker
Connectivity | mosquitto | Integration & Development; Used both in production and in development(data collection) of the solution
Storage | sqlite3 | Integration & Development; Used both in production and in development of the application
Embedded SW | Local, (Lua script for NodeMCU) | Configuration; Provides interface to configure NodeMCU's on start-up
Cloud Service | DigitalOcean | Integration
Software (ML Tools) | Various Python Libraries (scikit-learn, pandas, numpy) | Integration & Development; Trained a machine learning model on development, used that model in production
Cloud SW | Local (node.js server application) | Integration
Web Client | Local (react.js application) | Integration





