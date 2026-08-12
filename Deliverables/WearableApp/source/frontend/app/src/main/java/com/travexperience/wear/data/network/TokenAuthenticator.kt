package com.travexperience.wear.data.network

import com.travexperience.wear.data.local.TokenStore
import com.travexperience.wear.data.network.dto.RefreshTokenRequest
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

/**
 * Equivalente en el reloj al interceptor de axios que refresca el token automáticamente
 * en la app móvil: cuando cualquier request autenticado responde 401, este [Authenticator]
 * intenta renovar la sesión con el refreshToken guardado y reintenta la request original
 * UNA sola vez con el accessToken nuevo.
 *
 * Corre sobre [pairingApiService], que usa un OkHttpClient separado (sin este mismo
 * Authenticator ni [AuthInterceptor]) para no entrar en loop si el propio refresh devuelve 401.
 *
 * `synchronized` evita que, si varias llamadas fallan con 401 al mismo tiempo (ej. itinerario
 * y ubicación en simultáneo), se disparen varios refresh en paralelo: la primera que entra
 * refresca; las demás ven que el token ya cambió y reintentan directo con el nuevo.
 */
class TokenAuthenticator(
    private val tokenStore: TokenStore,
    private val pairingApiService: PairingApiService,
    private val authInterceptor: AuthInterceptor
) : Authenticator {

    override fun authenticate(route: Route?, response: Response): Request? {
        // Nunca reintentar más de una vez la misma request (evita loops infinitos si el
        // backend sigue devolviendo 401 incluso con un token recién refrescado).
        if (responseCount(response) >= 2) {
            return null
        }

        val failedToken = extractBearerToken(response.request)

        synchronized(this) {
            val currentSession = tokenStore.getSessionBlocking()
                ?: return null.also { authInterceptor.notifySessionExpired() }

            // Otro hilo ya refrescó mientras esperábamos el lock: reintentar con ese token nuevo.
            if (currentSession.accessToken != failedToken) {
                return response.request.newBuilder()
                    .header("Authorization", "Bearer ${currentSession.accessToken}")
                    .build()
            }

            val refreshResponse = runCatching {
                runBlocking {
                    pairingApiService.refreshSession(
                        RefreshTokenRequest(currentSession.refreshToken)
                    )
                }
            }.getOrNull()

            return if (refreshResponse?.isSuccessful == true && refreshResponse.body()?.data != null) {
                val sessionData = refreshResponse.body()!!.data!!
                tokenStore.saveSession(
                    accessToken = sessionData.accessToken,
                    refreshToken = sessionData.refreshToken,
                    expiresInSeconds = sessionData.expiresInSeconds
                )
                response.request.newBuilder()
                    .header("Authorization", "Bearer ${sessionData.accessToken}")
                    .build()
            } else if (refreshResponse != null && refreshResponse.code() in 400..499) {
                // El refreshToken es inválido o el servidor rechazó el refresh con un error 4xx.
                // Aquí SÍ limpiamos la sesión porque ya no es recuperable.
                tokenStore.clearSession()
                authInterceptor.notifySessionExpired()
                null
            } else {
                // Error de red (timeout, DNS, etc) o error 5xx del servidor:
                // NO limpiamos la sesión. Simplemente dejamos que la llamada original falle con el 401
                // para que el Repository lo maneje como un error de red y el usuario pueda reintentar.
                null
            }
        }
    }

    private fun extractBearerToken(request: Request): String? =
        request.header("Authorization")?.removePrefix("Bearer ")?.trim()

    private fun responseCount(response: Response): Int {
        var count = 1
        var prior = response.priorResponse
        while (prior != null) {
            count++
            prior = prior.priorResponse
        }
        return count
    }
}
