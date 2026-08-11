package com.travexperience.wear.data.network

import com.travexperience.wear.data.network.dto.ApiEnvelope
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.data.network.dto.LocationAlertData
import com.travexperience.wear.data.network.dto.LocationPingRequest
import com.travexperience.wear.data.network.dto.NearbyData
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

/**
 * El header Authorization NO se declara aquí: lo agrega [AuthInterceptor] automáticamente
 * en cada request, leyendo el token guardado en [com.travexperience.wear.data.local.TokenStore].
 *
 * Se devuelve Response<ApiEnvelope<T>> (en vez de ApiEnvelope<T> directo) para poder
 * inspeccionar el código HTTP -especialmente 401- en el Repository sin lanzar excepciones.
 */
interface ApiService {

    @GET("wearable/itinerary/active")
    suspend fun getActiveItinerary(): Response<ApiEnvelope<ItineraryActiveData>>

    @GET("wearable/nearby")
    suspend fun getNearbyPlaces(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius") radiusMeters: Int? = null,
        @Query("category") category: String? = null
    ): Response<ApiEnvelope<NearbyData>>

    @POST("wearable/location")
    suspend fun pingLocation(
        @Body body: LocationPingRequest
    ): Response<ApiEnvelope<LocationAlertData>>

    @GET("wearable/alerts")
    suspend fun getAlerts(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double
    ): Response<ApiEnvelope<LocationAlertData>>

    /**
     * Avisa al backend que este reloj se desvincula (revoca su refreshToken del lado servidor).
     * Best-effort: si falla por falta de señal, el reloj borra sus credenciales locales igual
     * (ver [com.travexperience.wear.data.repository.PairingRepository.unlinkDevice]).
     */
    @POST("wearable/pair/unlink")
    suspend fun unlinkDevice(): Response<ApiEnvelope<Unit>>
}
