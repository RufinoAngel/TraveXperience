package com.travexperience.wear.util

/**
 * Resultado uniforme que devuelve el Repository hacia los ViewModel.
 * Permite que cada pantalla distinga: cargando / éxito / error de red / sesión inválida,
 * y que nunca se quede "congelada" esperando una respuesta que no llegó.
 */
sealed class UiResult<out T> {
    data object Loading : UiResult<Nothing>()
    data class Success<T>(val data: T) : UiResult<T>()

    /** Sin señal, timeout, o backend caído. [cachedData] permite mostrar el último dato conocido. */
    data class NetworkError<T>(val cachedData: T? = null, val message: String? = null) : UiResult<T>()

    /** El backend respondió 401: el token guardado ya no sirve, hay que re-sincronizar con el teléfono. */
    data object SessionExpired : UiResult<Nothing>()

    /** Respuesta HTTP distinta de 2xx/401 (ej. 404, 500) con el mensaje que mandó el backend. */
    data class ApiError<T>(val code: Int, val message: String) : UiResult<T>()
}
