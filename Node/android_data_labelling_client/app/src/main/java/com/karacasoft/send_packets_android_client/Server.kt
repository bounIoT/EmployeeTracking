package com.karacasoft.send_packets_android_client

import android.util.Log
import java.net.Socket
import kotlin.RuntimeException

class Server {
    private val password = "garip_bi_parola??"
    var socket: Socket? = null
    var uuid: String? = null
    var connected: Boolean = false
    private var macAddr: String? = null

    fun connect(host: String, port: Int, macAddress: String) {
        macAddr = macAddress
        socket = Socket(host, port)
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("connect %s %s\n".format(password, macAddr))
        writer?.flush()
        uuid = readNext()
        if(!waitFor("ok")) {
            throw RuntimeException("Connection error. Server refused connection")
        }
        connected = true
        Log.d("Server", "Connected to server")
    }

    fun setLocation(location: String) {
        if (!connected) {
            throw RuntimeException("Connect to the server first")
        } else {
            val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
            writer?.write("set_location %s %s\n".format(uuid, location))
            writer?.flush()
            waitFor("ok")
        }
    }

    fun startMeasure() {
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("start_measure %s\n".format(uuid))
        writer?.flush()
        waitFor("ok")
    }

    fun stopMeasure() {
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("stop_measure %s\n".format(uuid))
        writer?.flush()
        waitFor("ok")
    }

    fun disconnect() {
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("disconnect %s\n".format(uuid))
        writer?.flush()
        waitFor("ok")
        socket?.close()
    }

    fun checkPacketCount(): Int {
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("check_packet_count %s\n".format(uuid))
        writer?.flush()
        val ret = readNext().toInt()
        waitFor("ok")
        return ret
    }

    fun resetPacketCount() {
        val writer = socket?.getOutputStream()?.writer(charset=Charsets.UTF_8)
        writer?.write("reset_packet_count %s\n".format(uuid))
        writer?.flush()
        waitFor("ok")
    }

    private fun readNext(): String {
        val line = socket?.getInputStream()?.bufferedReader(charset = Charsets.UTF_8)?.readLine()
        if (line == null) {
            throw RuntimeException("Connection error")
        } else {
            return line
        }
    }

    private fun waitFor(text: String): Boolean {
        if(socket?.getInputStream()?.bufferedReader(charset = Charsets.UTF_8)?.readLine() == text) {
            return true
        }
        throw RuntimeException("Server responded with something different than %s".format(text))
    }
}