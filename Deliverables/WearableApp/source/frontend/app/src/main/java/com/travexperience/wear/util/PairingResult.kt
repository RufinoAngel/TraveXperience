package com.travexperience.wear.util

/** Resultado de canjear el código de 6 dígitos contra `POST /wearable/pair/redeem`. */
sealed class PairingResult {
    data object Success : PairingResult()

    /** Código incorrecto o ya vencido: el backend respondió 400/404/410 (o success=false). */
    data class InvalidCode(val message: String) : PairingResult()

    /** Sin señal, timeout, o backend caído. */
    data class NetworkError(val message: String?) : PairingResult()
}
