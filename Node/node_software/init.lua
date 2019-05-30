wifi.setmode(wifi.SOFTAP)

cfg = {}
cfg.ssid="WowMCU3"
cfg.pwd="wowpassword3"
cfg.auth=wifi.WPA2_PSK
wifi.ap.config(cfg)

dofile("server.lua")