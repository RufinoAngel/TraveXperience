package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.travexperience.wear.data.repository.PairingRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AccountViewModel(
    private val pairingRepository: PairingRepository
) : ViewModel() {

    private val _unlinking = MutableStateFlow(false)
    val unlinking: StateFlow<Boolean> = _unlinking.asStateFlow()

    /**
     * [onDone] se llama siempre al terminar (haya o no señal): [PairingRepository.unlinkDevice]
     * borra las credenciales locales pase lo que pase, así que la UI siempre puede volver
     * a la pantalla de vinculación después de llamar esto.
     */
    fun unlink(onDone: () -> Unit) {
        viewModelScope.launch {
            _unlinking.value = true
            pairingRepository.unlinkDevice()
            _unlinking.value = false
            onDone()
        }
    }
}
