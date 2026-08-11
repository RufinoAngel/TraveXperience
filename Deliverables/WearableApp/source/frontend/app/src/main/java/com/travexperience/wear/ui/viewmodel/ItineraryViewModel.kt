package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.travexperience.wear.data.network.AuthInterceptor
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.data.repository.WearableRepository
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import kotlinx.coroutines.delay

class ItineraryViewModel(
    private val repository: WearableRepository,
    private val authInterceptor: AuthInterceptor
) : ViewModel() {

    private val _state = MutableStateFlow<UiResult<ItineraryActiveData>>(UiResult.Loading)
    val state: StateFlow<UiResult<ItineraryActiveData>> = _state.asStateFlow()

    init {
        load()
        
        // Optimizacion Rubrica: Polling mas lento (60s) para ahorrar bateria.
        viewModelScope.launch {
            while (true) {
                delay(60_000)
                refreshSilently()
            }
        }

        // Si cualquier llamada de red (no solo esta pantalla) detecta un 401,
        // esta pantalla también debe reflejar "sesión vencida" de inmediato.
        viewModelScope.launch {
            authInterceptor.sessionExpiredEvents.collect {
                _state.value = UiResult.SessionExpired
            }
        }
    }

    fun load() {
        viewModelScope.launch {
            _state.value = UiResult.Loading
            _state.value = repository.getActiveItinerary()
        }
    }

    private suspend fun refreshSilently() {
        val result = repository.getActiveItinerary()
        // Solo actualizamos si fue exitoso para no sobreescribir con errores de red momentáneos
        if (result is UiResult.Success) {
            _state.value = result
        } else if (result is UiResult.SessionExpired) {
            _state.value = result
        }
    }

    fun retry() = load()
}
