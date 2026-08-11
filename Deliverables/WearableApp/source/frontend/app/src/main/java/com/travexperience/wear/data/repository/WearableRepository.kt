package com.travexperience.wear.data.repository

import android.util.Log
import com.travexperience.wear.data.network.ApiService
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.data.network.dto.LocationAlertData
import com.travexperience.wear.data.network.dto.LocationPingRequest
import com.travexperience.wear.data.network.dto.NearbyData
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.CancellationException
import retrofit2.Response
import java.io.IOException

import com.travexperience.wear.data.network.dto.WeatherDataDto

/**
 * Repository pattern: los ViewModel nunca hablan con Retrofit directamente.
 */
class WearableRepository(
    private val apiService: ApiService
) {
    @Volatile private var lastItinerary: ItineraryActiveData? = null
    @Volatile private var lastNearby: NearbyData? = null
    @Volatile private var lastAlerts: LocationAlertData? = null

    suspend fun getActiveItinerary(): UiResult<ItineraryActiveData> {
        val result = safeCall(
            call = { apiService.getActiveItinerary() },
            onSuccess = { lastItinerary = it },
            cached = { lastItinerary }
        )

        // Mock de clima si el backend aun no lo tiene implementado
        return if (result is UiResult.Success && result.data.weather == null) {
            val mockWeather = WeatherDataDto(
                temperature = 22.0,
                condition = "Soleado",
                icon = "sunny"
            )
            UiResult.Success(result.data.copy(weather = mockWeather))
        } else {
            result
        }
    }

    suspend fun getNearbyPlaces(
        lat: Double,
        lng: Double,
        radiusMeters: Int? = null,
        category: String? = null
    ): UiResult<NearbyData> =
        safeCall(
            call = { apiService.getNearbyPlaces(lat, lng, radiusMeters, category) },
            onSuccess = { lastNearby = it },
            cached = { lastNearby }
        )

    suspend fun pingLocation(lat: Double, lng: Double): UiResult<LocationAlertData> =
        safeCall(
            call = { apiService.pingLocation(LocationPingRequest(lat, lng)) },
            onSuccess = { lastAlerts = it },
            cached = { lastAlerts }
        )

    suspend fun getAlerts(lat: Double, lng: Double): UiResult<LocationAlertData> =
        safeCall(
            call = { apiService.getAlerts(lat, lng) },
            onSuccess = { lastAlerts = it },
            cached = { lastAlerts }
        )

    private suspend fun <T> safeCall(
        call: suspend () -> Response<com.travexperience.wear.data.network.dto.ApiEnvelope<T>>,
        onSuccess: (T) -> Unit,
        cached: () -> T?
    ): UiResult<T> {
        return try {
            val response = call()

            when {
                response.code() == 401 -> {
                    Log.w("WearableRepository", "Session Expired (401)")
                    UiResult.SessionExpired
                }

                response.isSuccessful -> {
                    val envelope = response.body()
                    val data = envelope?.data
                    if (envelope?.success == true && data != null) {
                        Log.d("WearableRepository", "Success: ${data.javaClass.simpleName}")
                        onSuccess(data)
                        UiResult.Success(data)
                    } else {
                        val msg = envelope?.message ?: "Respuesta negativa del servidor"
                        Log.e("WearableRepository", "API Error: $msg")
                        UiResult.ApiError(
                            code = response.code(),
                            message = msg
                        )
                    }
                }

                else -> {
                    val errorMsg = "Error ${response.code()}: ${response.errorBody()?.string() ?: "sin mensaje"}"
                    Log.e("WearableRepository", errorMsg)
                    UiResult.ApiError(
                        code = response.code(),
                        message = errorMsg
                    )
                }
            }
        } catch (e: CancellationException) {
            throw e 
        } catch (e: Exception) {
            Log.e("WearableRepository", "Network exception: ${e.message}", e)
            UiResult.NetworkError(
                cachedData = cached(),
                message = "Error de red: ${e.localizedMessage ?: e.toString()}"
            )
        }
    }
}
