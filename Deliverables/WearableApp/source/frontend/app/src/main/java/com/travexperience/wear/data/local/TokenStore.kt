package com.travexperience.wear.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map

/**
 * Credenciales propias del reloj (independientes de las del teléfono), obtenidas al canjear
 * el código de 6 dígitos en `POST /wearable/pair/redeem` y renovadas con
 * `POST /wearable/auth/refresh` cuando el accessToken vence.
 */
data class WearSession(
    val accessToken: String,
    val refreshToken: String,
    val expiresAtEpochMillis: Long?
)

/**
 * Fuente única de verdad de la sesión del reloj.
 *
 * Se guarda en [EncryptedSharedPreferences] (cifrado con una clave del Android Keystore vía
 * [MasterKey]), nunca en texto plano: ni el accessToken ni, sobre todo, el refreshToken
 * -que vive mucho más tiempo y es lo que le permite al reloj no volver a pedir vinculación
 * cada vez que expira el accessToken- deben quedar legibles en disco.
 *
 * Mantiene además un [MutableStateFlow] en memoria como espejo de lo persistido, para que la UI
 * (Compose) pueda reaccionar con `collectAsState()` sin tener que leer el disco en cada recomposición.
 */
class TokenStore(private val context: Context) {

    private object Keys {
        const val ACCESS_TOKEN = "access_token"
        const val REFRESH_TOKEN = "refresh_token"
        const val EXPIRES_AT = "expires_at_millis"
    }

    /** Margen de seguridad: se considera "por vencer" un poco antes del expiresAt real del backend. */
    private val expiryBufferMillis = 30_000L

    private val prefs: SharedPreferences by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            context,
            "travexperience_wear_session",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private val _sessionFlow = MutableStateFlow(readFromDisk())
    val sessionFlow: StateFlow<WearSession?> = _sessionFlow

    /** Derivado de [sessionFlow]; usado por la UI para decidir Pairing vs. NavHost principal. */
    val hasSessionFlow: Flow<Boolean> = _sessionFlow.map { it != null }

    private fun readFromDisk(): WearSession? {
        val accessToken = prefs.getString(Keys.ACCESS_TOKEN, null)
        val refreshToken = prefs.getString(Keys.REFRESH_TOKEN, null)
        if (accessToken.isNullOrBlank() || refreshToken.isNullOrBlank()) return null

        val expiresAt = prefs.getLong(Keys.EXPIRES_AT, -1L).takeIf { it > 0 }
        return WearSession(accessToken, refreshToken, expiresAt)
    }

    /** Llamado al vincular (redeem) y al refrescar: siempre reemplaza la sesión completa. */
    fun saveSession(accessToken: String, refreshToken: String, expiresInSeconds: Long?) {
        val expiresAt = expiresInSeconds?.let { System.currentTimeMillis() + it * 1000 }

        prefs.edit()
            .putString(Keys.ACCESS_TOKEN, accessToken)
            .putString(Keys.REFRESH_TOKEN, refreshToken)
            .apply {
                if (expiresAt != null) putLong(Keys.EXPIRES_AT, expiresAt) else remove(Keys.EXPIRES_AT)
            }
            .apply()

        _sessionFlow.value = WearSession(accessToken, refreshToken, expiresAt)
    }

    /** Se llama al desvincular (desde el teléfono o desde el propio reloj). */
    fun clearSession() {
        prefs.edit().clear().apply()
        _sessionFlow.value = null
    }

    fun getSessionBlocking(): WearSession? = _sessionFlow.value

    /**
     * true si no hay accessToken vigente (vencido o a punto de vencer) pero SÍ hay refreshToken,
     * es decir: hay que refrescar antes de la próxima llamada en vez de esperar a que el backend
     * responda 401.
     */
    fun isAccessTokenStale(): Boolean {
        val session = _sessionFlow.value ?: return false
        val expiresAt = session.expiresAtEpochMillis ?: return false
        return System.currentTimeMillis() >= (expiresAt - expiryBufferMillis)
    }
}
