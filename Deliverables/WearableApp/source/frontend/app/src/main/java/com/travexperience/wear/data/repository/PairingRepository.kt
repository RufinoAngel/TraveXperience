package com.travexperience.wear.data.repository

import com.travexperience.wear.data.local.TokenStore
import com.travexperience.wear.data.network.ApiService
import com.travexperience.wear.data.network.PairingApiService
import com.travexperience.wear.data.network.dto.PairRedeemRequest
import com.travexperience.wear.util.PairingResult
import kotlinx.coroutines.CancellationException
import java.io.IOException

/**
 * Vinculación y desvinculación del reloj. A diferencia de [WearableRepository], no pasa por
 * [ApiService] para el canje/refresh (esos van por [PairingApiService], sin token todavía).
 */
class PairingRepository(
    private val pairingApiService: PairingApiService,
    private val apiService: ApiService,
    private val tokenStore: TokenStore
) {

    /**
     * Canjea el código de 6 dígitos. Si el backend lo acepta, guarda el par
     * accessToken/refreshToken propio del reloj en [TokenStore] y de ahí en más
     * el reloj queda con sesión iniciada.
     */
    suspend fun redeemCode(code: String, deviceName: String? = null): PairingResult {
        return try {
            val response = pairingApiService.redeemPairingCode(PairRedeemRequest(code, deviceName))
            val envelope = response.body()

            when {
                response.isSuccessful && envelope?.success == true && envelope.data != null -> {
                    val session = envelope.data
                    tokenStore.saveSession(
                        accessToken = session.accessToken,
                        refreshToken = session.refreshToken,
                        expiresInSeconds = session.expiresInSeconds
                    )
                    PairingResult.Success
                }

                // 400/404/410 son los códigos típicos para "código inválido o vencido";
                response.code() in 400..499 -> PairingResult.InvalidCode(
                    envelope?.message ?: "Código inválido o vencido. Pide uno nuevo en tu teléfono."
                )

                else -> {
                    // Si el servidor respondió (isSuccessful o no) pero success=false, 
                    // mostramos el mensaje que nos dio el servidor.
                    val errorMsg = envelope?.message ?: response.errorBody()?.string() ?: "Error de comunicación"
                    PairingResult.NetworkError(
                        "Error del servidor: $errorMsg"
                    )
                }
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            PairingResult.NetworkError("Fallo de red inmediato: ${e.localizedMessage ?: e.toString()}")
        }
    }

    /**
     * Desvincula el reloj: intenta avisarle al backend (revoca el refreshToken del lado
     * servidor) pero, tenga señal o no, siempre borra las credenciales locales al final,
     * dejando al reloj listo para un nuevo emparejamiento.
     */
    suspend fun unlinkDevice() {
        try {
            apiService.unlinkDevice()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            // Best-effort: si no hay señal, igual limpiamos localmente más abajo.
        } finally {
            tokenStore.clearSession()
        }
    }
}
