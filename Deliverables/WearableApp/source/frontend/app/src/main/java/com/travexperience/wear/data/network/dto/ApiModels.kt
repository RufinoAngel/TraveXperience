package com.travexperience.wear.data.network.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Envelope estándar de TODAS las respuestas del backend:
 * { success: boolean, message: string, data: object|null }
 */
@JsonClass(generateAdapter = true)
data class ApiEnvelope<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

// ---------- GET /wearable/itinerary/active ----------

@JsonClass(generateAdapter = true)
data class ItineraryActiveData(
    val itinerary: ItineraryDto?,
    val weather: WeatherDataDto? = null
)

@JsonClass(generateAdapter = true)
data class WeatherDataDto(
    val temperature: Double,
    val condition: String,
    val icon: String? = null // ej: "01d", "cloudy", etc.
)

@JsonClass(generateAdapter = true)
data class ItineraryDto(
    val id: Int,
    val title: String,
    val destination: String,
    val today: List<ItineraryDayDto>
)

@JsonClass(generateAdapter = true)
data class ItineraryDayDto(
    val date: String,
    val title: String? = null,
    val weekday: String? = null,
    val dayNumber: String? = null,
    val items: List<ItineraryActivityDto>
)

@JsonClass(generateAdapter = true)
data class ItineraryActivityDto(
    val id: String,
    @Json(name = "title") val name: String,
    val time: String? = null,
    val location: String? = null,
    val type: String? = null,
    val description: String? = null
)

// ---------- GET /wearable/nearby ----------

@JsonClass(generateAdapter = true)
data class NearbyData(
    val userLocation: LatLngDto,
    val places: List<NearbyPlaceDto>
)

@JsonClass(generateAdapter = true)
data class LatLngDto(
    val lat: Double,
    val lng: Double
)

@JsonClass(generateAdapter = true)
data class NearbyPlaceDto(
    val id: String,
    val name: String,
    val category: String,
    val lat: Double,
    val lng: Double,
    val distanceMeters: Double,
    val ratingAvg: Double?
)

// ---------- POST /wearable/location  y  GET /wearable/alerts (mismo shape) ----------

@JsonClass(generateAdapter = true)
data class LocationAlertData(
    val hasAlert: Boolean,
    val alerts: List<NearbyPlaceDto>
)

@JsonClass(generateAdapter = true)
data class LocationPingRequest(
    val lat: Double,
    val lng: Double
)

// ---------- POST /wearable/pair/redeem  y  POST /wearable/auth/refresh (mismo shape de respuesta) ----------

/**
 * Body de POST /wearable/pair/redeem.
 * [code] es el código de 6 dígitos que el usuario ve en el teléfono.
 * [deviceName] es opcional, solo informativo (ej. "Galaxy Watch de Juan").
 */
@JsonClass(generateAdapter = true)
data class PairRedeemRequest(
    val code: String,
    @Json(name = "device_name") val deviceName: String? = null
)

/** Body de POST /wearable/auth/refresh, llamado con el refreshToken guardado en el reloj. */
@JsonClass(generateAdapter = true)
data class RefreshTokenRequest(
    @Json(name = "refresh_token") val refreshToken: String
)

/**
 * Credenciales propias del reloj, devueltas tanto al vincular como al refrescar sesión.
 * El reloj nunca reutiliza el token del teléfono: a partir del canje del código, tiene
 * su propio par accessToken/refreshToken independiente.
 */
@JsonClass(generateAdapter = true)
data class WearSessionData(
    @Json(name = "accessToken") val accessToken: String,
    @Json(name = "refreshToken") val refreshToken: String,
    @Json(name = "expiresIn") val expiresInSeconds: Long? = null
)
