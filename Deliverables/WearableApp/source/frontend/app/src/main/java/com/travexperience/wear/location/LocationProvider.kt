package com.travexperience.wear.location

import android.annotation.SuppressLint
import android.content.Context
import android.os.Looper
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * Único punto de acceso a FusedLocationProviderClient. Tanto [com.travexperience.wear.ui.viewmodel.NearbyViewModel]
 * (mientras la pantalla está en foreground) como [com.travexperience.wear.service.ExploreLocationService]
 * (modo "explorar activo" en background) usan esto, para no duplicar el manejo de permisos/callbacks.
 *
 * IMPORTANTE: quien llame a [locationUpdates] es responsable de haber verificado el permiso
 * ACCESS_FINE_LOCATION antes (ver [com.travexperience.wear.ui.screens.NearbyScreen]).
 */
class LocationProvider(context: Context) {

    private val fusedClient = LocationServices.getFusedLocationProviderClient(context)

    /** Intenta obtener la ubicación con máxima prioridad de forma inmediata */
    @SuppressLint("MissingPermission")
    suspend fun getCurrentLocation(): LatLng? {
        return try {
            val request = CurrentLocationRequest.Builder()
                .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                .setMaxUpdateAgeMillis(15_000)
                .build()
            val loc = fusedClient.getCurrentLocation(request, null).await()
            loc?.let { LatLng(it.latitude, it.longitude) }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * @param intervalMillis cada cuánto se pide una actualización. 30-60s en foreground (pantalla
     *        "Cerca de mí"), 60-120s en el Foreground Service de background para cuidar batería.
     * @param priority prioridad de la solicitud (Balanced por defecto, High Accuracy para el mapa).
     */
    @SuppressLint("MissingPermission") // el caller debe garantizar el permiso antes de suscribirse
    fun locationUpdates(
        intervalMillis: Long,
        priority: Int = Priority.PRIORITY_BALANCED_POWER_ACCURACY
    ): Flow<LatLng> = callbackFlow {
        val request = LocationRequest.Builder(priority, intervalMillis)
            .setMinUpdateIntervalMillis(intervalMillis / 2)
            .build()

        val callback = object : com.google.android.gms.location.LocationCallback() {
            override fun onLocationResult(result: com.google.android.gms.location.LocationResult) {
                result.lastLocation?.let { loc ->
                    trySend(LatLng(loc.latitude, loc.longitude))
                }
            }
        }

        // Se usa Looper.getMainLooper() para evitar el error "invalid null looper" cuando se llama desde corrutinas
        fusedClient.requestLocationUpdates(request, callback, Looper.getMainLooper())

        awaitClose {
            fusedClient.removeLocationUpdates(callback)
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun getLastKnownLocation(): LatLng? {
        val location = fusedClient.lastLocation.await() ?: return null
        return LatLng(location.latitude, location.longitude)
    }
}

data class LatLng(val lat: Double, val lng: Double)
