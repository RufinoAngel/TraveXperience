package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.travexperience.wear.data.network.dto.NearbyData
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.data.repository.WearableRepository
import com.travexperience.wear.location.LocationProvider
import com.travexperience.wear.util.UiResult
import com.google.android.gms.location.Priority
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

class NearbyViewModel(
    private val repository: WearableRepository,
    private val locationProvider: LocationProvider
) : ViewModel() {

    companion object {
        private const val LOCATION_INTERVAL_MILLIS = 45_000L // Optimización rúbrica: mas balanceado
        private const val INITIAL_TIMEOUT_MS = 12_000L
    }

    private val _nearbyState = MutableStateFlow<UiResult<NearbyData>>(UiResult.Loading)
    val nearbyState: StateFlow<UiResult<NearbyData>> = _nearbyState.asStateFlow()

    private val _selectedPlace = MutableStateFlow<NearbyPlaceDto?>(null)
    val selectedPlace: StateFlow<NearbyPlaceDto?> = _selectedPlace.asStateFlow()

    private var trackingJob: Job? = null

    fun startTracking() {
        if (trackingJob?.isActive == true) return
        trackingJob = viewModelScope.launch {
            _nearbyState.value = UiResult.Loading

            // 1. Intentar obtener la ubicación ACTUAL de forma agresiva
            val currentLoc = withTimeoutOrNull(4000) { locationProvider.getCurrentLocation() }
            if (currentLoc != null) {
                refreshNearby(currentLoc.lat, currentLoc.lng)
            } else {
                // 2. Si falla la agresiva, intentar la última conocida (mas rapida pero menos fiable)
                locationProvider.getLastKnownLocation()?.let { last ->
                    refreshNearby(last.lat, last.lng)
                }
            }

            // 3. Suscribirse a actualizaciones continuas
            launch {
                locationProvider.locationUpdates(
                    intervalMillis = LOCATION_INTERVAL_MILLIS,
                    priority = Priority.PRIORITY_HIGH_ACCURACY
                ).collect { loc ->
                    refreshNearby(loc.lat, loc.lng)
                }
            }

            // Si después de 15 segundos seguimos sin nada, dar error
            delay(15_000L)
            if (_nearbyState.value is UiResult.Loading) {
                _nearbyState.value = UiResult.NetworkError(
                    message = "No se detecta señal de GPS. Si estás en un emulador, envía una coordenada (Extended Controls -> Location). Si estás en un reloj real, sal al exterior."
                )
            }
        }
    }

    private suspend fun refreshNearby(lat: Double, lng: Double) {
        val result = repository.getNearbyPlaces(lat = lat, lng = lng)
        _nearbyState.value = result
    }

    /** Llamar desde onStop/DisposableEffect.onDispose. Corta el tracking para no gastar batería en background. */
    fun stopTracking() {
        trackingJob?.cancel()
        trackingJob = null
    }

    fun selectPlace(place: NearbyPlaceDto?) {
        _selectedPlace.value = place
    }

    override fun onCleared() {
        super.onCleared()
        stopTracking()
    }
}
