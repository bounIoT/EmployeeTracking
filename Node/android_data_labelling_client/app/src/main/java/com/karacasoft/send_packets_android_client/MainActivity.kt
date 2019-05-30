package com.karacasoft.send_packets_android_client

import android.annotation.SuppressLint
import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.SharedPreferences
import android.net.wifi.WifiManager
import android.os.Build
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.widget.Toast
import androidx.annotation.RequiresApi
import kotlinx.android.synthetic.main.activity_main.*
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class MainActivity : AppCompatActivity() {

    var measuring: Boolean = false
    var sharedPrefs: SharedPreferences? = null
    var wifiManager: WifiManager? = null

    val handlerTread: HandlerThread = HandlerThread("WIFI_SCAN_THREAD")
    val handler: Handler
    init {
        handlerTread.start()
        handler = Handler(handlerTread.looper)
    }


    val servers: MutableList<Server> = MutableList(0) {
        Server()
    }

    @RequiresApi(Build.VERSION_CODES.N)
    private fun getDeviceMacAddressVersionN(): String {
        val admin = DeviceAdminReceiver()
        val devicePolicyManager = admin.getManager(this.applicationContext)
        val compName = admin.getWho(this.applicationContext)
        if (devicePolicyManager.isAdminActive(compName)) {
            val macAddress = devicePolicyManager.getWifiMacAddress(compName)
            macAddress?.let {
                return it
            }
        }
        throw RuntimeException("Cannot get mac address")
    }

    @SuppressLint("HardwareIds")
    private fun getDeviceMacAddressVersionBeforeN(): String {
        val wifiInfo = wifiManager?.connectionInfo
        wifiInfo?.macAddress?.let {
            return it
        }
        throw RuntimeException("Cannot get mac address")
    }

    private fun getDeviceMacAddress(): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            getDeviceMacAddressVersionN()
        } else {
            getDeviceMacAddressVersionBeforeN()
        }
    }

    private fun triggerScan() {
        wifiManager?.startScan()
        if(measuring) {
            handler.postDelayed(Runnable {
                triggerScan()
            }, 3000)
        }
    }

    private fun startMeasure() {
        handler.post {
            triggerScan()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        wifiManager = applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager

        sharedPrefs = getSharedPreferences("MySharedPrefs", Context.MODE_PRIVATE)

        ip_port.setText(sharedPrefs?.getString("IP_PORT", ""))
        mac_addr.setText(sharedPrefs?.getString("MAC_ADDRESS", ""))

        start_measure_button.setOnClickListener {
            for(server in servers) {
                GlobalScope.launch {
                    if(measuring) {
                        server.stopMeasure()
                        start_measure_button.text = getString(R.string.start_measure)
                        measuring = false
                    } else {
                        server.startMeasure()
                        startMeasure()
                        start_measure_button.text = getString(R.string.stop_measure)
                        measuring = true
                    }
                }
            }

        }

        set_location_button.setOnClickListener {
            for(server in servers) {
                GlobalScope.launch {
                    server.setLocation(loc_name.text.toString())
                }
            }
        }

        connect_button.setOnClickListener {
            sharedPrefs?.let {
                it.edit()
                    .putString("IP_PORT", ip_port.text.toString())
                    .putString("MAC_ADDRESS", mac_addr.text.toString())
                    .apply()
            }

            val ipPorts = ip_port.text.toString().split(",")

            for (ips in ipPorts) {
                val ipPortList = ips.split(":")
                val macAddress: String = if (mac_addr.text.isNotEmpty()) {
                    mac_addr.text.toString()
                } else {
                    getDeviceMacAddress()
                }
                GlobalScope.launch {
                    val s = Server()
                    s.connect(ipPortList[0], ipPortList[1].toInt(), macAddress)
                    servers.add(s)
                }
            }
        }

        check_packet_button.setOnClickListener {

            for(server in servers) {
                GlobalScope.launch {
                    val count = server.checkPacketCount()
                    runOnUiThread {
                        status_text.text = getString(R.string.packets_received).format(count)
                    }
                }
            }

        }

        reset_packet_button.setOnClickListener {
            for(server in servers) {
                GlobalScope.launch {
                    server.resetPacketCount()
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        for(server in servers) {
            measuring = false
            GlobalScope.launch {
                if (server.connected) {
                    server.disconnect()
                }
            }
        }

    }
}
