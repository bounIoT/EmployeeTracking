### Lua Code Explanations

Lua is an interpreted language. It is loaded on RAM as it is while running. This includes comments. The memory of a NodeMCU module is very small. So, using comments on lua code here, causes a loss in performance and may raise out of memory errors. So in this directory, there will be no comments in the code.

We flashed the NodeMCU's using firmware built with the cloud service (https://nodemcu-build.com/). This service allows you to choose which modules to include in the build and generate a binary file. This binary file is sent via e-mail after the build is done. We flashed it using a program named "esptool" (https://github.com/espressif/esptool). After that, we used nodemcu-tool (https://github.com/andidittrich/NodeMCU-Tool) upload our code to the board.

Lua firmware of NodeMCU has a filesystem. The firmware runs the file init.lua on startup. We used this file to initialize the AP mode on NodeMCU. This AP is then used to serve the configuration interface via an HTTP server. Using this configuration interface, we can add and remove MAC addresses of devices we want to track.

After starting via the configuration interface, the file "sniff.lua" is started. This file takes esp8266 into monitor mode, then sends received packets through the UART interface.