server = net.createServer(net.TCP, 30)

mac_addrs = {}

function send_file(sck, filename, data)
    sck:send("HTTP/1.0 200 OK\r\nContent-Type: text/html\r\n\r\n")
    f = file.open(filename, "r")
    if f then
        local line
        repeat
            line = f:read()
            if line then
                for k, v in pairs(data) do
                    v = v:gsub("%%3A", ":")
                    line = string.gsub(line, "{{"..k.."}}",v)
                end
                sck:send(line)
            end
        until line == nil
        f:close()
        f = nil
    end
end

function mac_addr_table(addrs)
    str=""
    for i, m in ipairs(addrs) do
        str = str.."<tr><td>"..m.."</td></tr>"
    end
    return str
end

function table_find(tab, el)
    for i,v in pairs(tab) do
        if v == el then
            return i
        end
    end
end

wctimer = tmr.create()
wctimer:register(1000, tmr.ALARM_SINGLE, function()
    server:close()
    server = nil
    dofile("sniff.lua")
end)

function on_conn(conn)
    start = false
    conn:on("receive", function(sck, payload)
        if payload:sub(1, 4) == "POST" then
            payload = payload:match("\r\n\r\n.*$")
            for k, v in payload:gmatch("([^=&\r\n]+)=([^=&\r\n]+)") do
                if k == "add_mac" then
                    table.insert(mac_addrs, v)
                elseif k == "del_mac" then
                    table.remove(mac_addrs, table_find(mac_addrs, v))
                elseif k == "start" then
                    start = true
                else print(k.."="..v) end
            end
        end
        if start then
            send_file(sck, "started.html", {})
        else
            send_file(sck, "home.html", {mac=mac_addr_table(mac_addrs)})
        end
    end)
    conn:on("sent", function(sck)
        sck:close()
        if start then
            wctimer:start()
        end
    end)
end



server:listen(80, on_conn)