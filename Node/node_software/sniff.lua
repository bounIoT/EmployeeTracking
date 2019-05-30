function convert_hex(s)
    return s:gsub("\\x(%x%x)",function (x) return string.char(tonumber(x,16)) end)
end

local broadcast_mac = convert_hex([[\xff\xff\xff\xff\xff\xff]])

for i, k in ipairs(mac_addrs) do
    mac_addrs[i] = convert_hex("\\x"..k:gsub("%%3A", "\\x"))
end

function mac_in_list(m)
    for i, v in ipairs(mac_addrs) do
        if m == v then
            return true
        end
    end
    return false
end

function stop_sniff()
    wifi.monitor.stop()
    if wifi_channel_timer ~= nil then
        wifi_channel_timer:stop()
    end
end

stop_sniff()

wifi.monitor.start(1, 0x00, 0x00, function(pkt)
    if pkt.srcmac == broadcast_mac then

    elseif mac_in_list(pkt.srcmac) then
        ts = pkt.timestamp
        timestamp = 0
        if ts ~= nil then
            for i=1,8 do
                timestamp = timestamp + ts:byte(i) * (256 ^ (i))
            end
        end
        uart.write(0, pkt.srcmac_hex.."\t"..pkt.rssi.."\t"..timestamp.."\n")
    end
end)

wifi.monitor.channel(2)
current_ch = 1

wifi_channel_timer = tmr.create()
wifi_channel_timer:register(150, tmr.ALARM_AUTO, function (t)
    if current_ch > 14 then
        current_ch = 1
    else
        current_ch = current_ch + 1
    end
    wifi.monitor.channel(current_ch)
end)
--wifi_channel_timer:start()