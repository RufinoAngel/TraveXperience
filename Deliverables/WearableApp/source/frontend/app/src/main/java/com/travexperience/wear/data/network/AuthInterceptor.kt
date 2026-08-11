package com.travexperience.wear.data.network

import com.travexperience.wear.data.local.TokenStore
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Agrega "Authorization: Bearer <accessToken>" a cada request usando la sesión guardada en
 * [TokenStore].
 *
 * La renovación del token (cuando vence) corre en [TokenAuthenticator], que intercepta el 401
 * antes de que este interceptor vuelva a ver la respuesta. Si aun así llega un 401 hasta acá
 * (porque el refreshToken también venció, fue revocado, o no había sesión guardada), significa
 * que la sesión del reloj ya no es recuperable: se emite un evento para que la UI vuelva a la
 * pantalla de vinculación con el código de 6 dígitos.
 */
class AuthInterceptor(
    private val tokenStore: TokenStore
) : Interceptor {

    private val _sessionExpiredEvents = MutableSharedFlow<Unit>(replay = 0, extraBufferCapacity = 1)
    val sessionExpiredEvents: SharedFlow<Unit> = _sessionExpiredEvents

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val accessToken = tokenStore.getSessionBlocking()?.accessToken

        val requestWithAuth = if (!accessToken.isNullOrBlank()) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $accessToken")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(requestWithAuth)

        if (response.code == 401) {
            // Si llegamos acá es porque TokenAuthenticator ya intentó refrescar y no pudo
            // (o no había refreshToken guardado): avisar a la UI que la sesión quedó limpia.
            _sessionExpiredEvents.tryEmit(Unit)
        }

        return response
    }

    /** Usado por [TokenAuthenticator] para notificar sesión inválida sin esperar un 401 nuevo. */
    fun notifySessionExpired() {
        _sessionExpiredEvents.tryEmit(Unit)
    }
}
