package com.travexperience.wear.ui.viewmodel

import android.os.Build
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.travexperience.wear.data.repository.PairingRepository
import com.travexperience.wear.util.PairingResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

const val PAIRING_CODE_LENGTH = 6

sealed class PairingUiState {
    data object EnteringCode : PairingUiState()
    data object Submitting : PairingUiState()
    data class Error(val message: String) : PairingUiState()
    data object Paired : PairingUiState()
}

class PairingViewModel(
    private val repository: PairingRepository
) : ViewModel() {

    private val _digits = MutableStateFlow("")
    val digits: StateFlow<String> = _digits.asStateFlow()

    private val _uiState = MutableStateFlow<PairingUiState>(PairingUiState.EnteringCode)
    val uiState: StateFlow<PairingUiState> = _uiState.asStateFlow()

    fun onDigitPressed(digit: Char) {
        if (_uiState.value is PairingUiState.Submitting) return
        if (_digits.value.length >= PAIRING_CODE_LENGTH) return

        // Si venía de un error, escribir de nuevo vuelve a habilitar la edición.
        if (_uiState.value is PairingUiState.Error) _uiState.value = PairingUiState.EnteringCode

        _digits.value += digit
    }

    fun onBackspace() {
        if (_uiState.value is PairingUiState.Submitting) return
        if (_digits.value.isEmpty()) return
        if (_uiState.value is PairingUiState.Error) _uiState.value = PairingUiState.EnteringCode
        _digits.value = _digits.value.dropLast(1)
    }

    fun onConfirm() {
        val code = _digits.value
        if (code.length != PAIRING_CODE_LENGTH) return

        viewModelScope.launch {
            _uiState.value = PairingUiState.Submitting
            when (val result = repository.redeemCode(code, deviceName = Build.MODEL)) {
                is PairingResult.Success -> _uiState.value = PairingUiState.Paired

                is PairingResult.InvalidCode -> {
                    _digits.value = ""
                    _uiState.value = PairingUiState.Error(result.message)
                }

                is PairingResult.NetworkError -> {
                    _uiState.value = PairingUiState.Error(
                        result.message ?: "No hay conexión con el servidor. Intenta de nuevo."
                    )
                }
            }
        }
    }
}
