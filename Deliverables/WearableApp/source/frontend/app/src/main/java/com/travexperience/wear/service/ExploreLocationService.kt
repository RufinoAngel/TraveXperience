package com.travexperience.wear.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.travexperience.wear.MainActivity
import com.travexperience.wear.R
import com.travexperience.wear.TraveXperienceWearApp
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.location.LocationProvider
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

/**
 * "Modo explorar activo": mientras está corriendo, pinguea POST /wearable/location cada
 * 1-2 minutos y dispara una notificación nativa (vibración + tarjeta) si el backend
 * devuelve hasAlert=true. Es lo que reemplaza "sacar el celular para enterarte" del Canvas.
 *
 * Se inicia/detiene desde la UI (botón "Explorar activo" — entrega siguiente de pantallas)
 * con startService/stopService, típicamente atado a cuando el usuario abre "Cerca de mí".
 */
class ExploreLocationService : Service() {

    companion object {
        const val ACTION_START = "com.travexperience.wear.action.START_EXPLORE"
        const val ACTION_STOP = "com.travexperience.wear.action.STOP_EXPLORE"

        private const val NOTIFICATION_CHANNEL_ID = "travexperience_nearby_alerts"
        private const val FOREGROUND_NOTIFICATION_ID = 1001
        private const val ALERT_NOTIFICATION_ID_BASE = 2000

        private const val NORMAL_POLL_INTERVAL_MILLIS = 90_000L // 1.5 min, dentro del rango 1-2 min pedido
        private const val BATTERY_SAVER_POLL_INTERVAL_MILLIS = 240_000L // 4 min si hay ahorro de batería
        private const val ALERT_DEBOUNCE_MILLIS = 15 * 60 * 1000L // no repetir la misma alerta antes de 15 min

        fun start(context: Context) {
            val intent = Intent(context, ExploreLocationService::class.java).setAction(ACTION_START)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            context.startService(Intent(context, ExploreLocationService::class.java).setAction(ACTION_STOP))
        }
    }

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(serviceJob)
    private var pollingJob: Job? = null

    // id de lugar -> timestamp de la última vez que se notificó, para el debounce de 15 min.
    private val lastAlertTimestamps = mutableMapOf<String, Long>()

    private lateinit var locationProvider: LocationProvider
    private lateinit var powerManager: PowerManager

    override fun onCreate() {
        super.onCreate()
        locationProvider = LocationProvider(this)
        powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopExploring()
                return START_NOT_STICKY
            }
            else -> startExploring()
        }
        return START_STICKY
    }

    private fun startExploring() {
        startForeground(FOREGROUND_NOTIFICATION_ID, buildForegroundNotification())

        if (pollingJob?.isActive == true) return

        val app = application as TraveXperienceWearApp

        pollingJob = serviceScope.launch {
            // El intervalo se recalcula en cada ciclo (no una sola vez) porque el modo
            // ahorro de batería puede activarse/desactivarse mientras el service corre.
            val intervalMillis = if (powerManager.isPowerSaveMode) {
                BATTERY_SAVER_POLL_INTERVAL_MILLIS
            } else {
                NORMAL_POLL_INTERVAL_MILLIS
            }

            locationProvider.locationUpdates(intervalMillis).collectLatest { loc ->
                when (val result = app.wearableRepository.pingLocation(loc.lat, loc.lng)) {
                    is UiResult.Success -> {
                        if (result.data.hasAlert) {
                            result.data.alerts.forEach { place -> maybeNotify(place) }
                        }
                    }
                    // Errores de red o de sesión durante el polling en background no deben
                    // crashear el service ni mostrar nada intrusivo: simplemente se reintenta
                    // en el siguiente ciclo de ubicación.
                    else -> Unit
                }
            }
        }
    }

    private fun stopExploring() {
        pollingJob?.cancel()
        pollingJob = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun maybeNotify(place: NearbyPlaceDto) {
        val now = System.currentTimeMillis()
        val lastNotified = lastAlertTimestamps[place.id]
        if (lastNotified != null && now - lastNotified < ALERT_DEBOUNCE_MILLIS) {
            return // mismo lugar, dentro de la ventana de debounce: no repetir
        }
        lastAlertTimestamps[place.id] = now
        showAlertNotification(place)
    }

    private fun showAlertNotification(place: NearbyPlaceDto) {
        val contentIntent = PendingIntent.getActivity(
            this,
            place.id.hashCode(),
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val distanceLabel = "${place.distanceMeters.toInt()}m"
        val notification = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification) // agregar este drawable al proyecto
            .setContentTitle(place.name)
            .setContentText("A $distanceLabel · ${place.category}")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
            .setVibrate(longArrayOf(0, 250, 100, 250))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .build()

        val notificationId = ALERT_NOTIFICATION_ID_BASE + (place.id.hashCode() and 0xFFFF)
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
            .notify(notificationId, notification)
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Explorando cerca de ti")
            .setContentText("Te avisamos si hay algo interesante muy cerca")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Alertas de lugares cercanos",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Avisos cuando estás muy cerca de un lugar bien calificado"
                enableVibration(true)
            }
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
