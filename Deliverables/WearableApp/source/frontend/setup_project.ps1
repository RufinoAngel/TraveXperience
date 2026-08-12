# ============================================================
# TraveXperience Wear - Setup automatico de codigo fuente
# ============================================================
# Como correrlo:
#   1) Abri la terminal DENTRO de Android Studio (abajo, pestaña "Terminal")
#      o una terminal de PowerShell normal.
#   2) Parate en la RAIZ del proyecto, es decir en la carpeta que contiene
#      la carpeta "app" (ej: C:\Users\Dell\AndroidStudioProjects\TraveXperience)
#      Podes verificarlo con: dir   (deberia listar la carpeta "app")
#   3) Ejecuta:  powershell -ExecutionPolicy Bypass -File .\setup_project.ps1
#      (si ya estas en una consola PowerShell, alcanza con: .\setup_project.ps1)
#   4) Volve a Android Studio y hace click derecho en el proyecto > "Reload"
#      o simplemente Sync Gradle (el icono del elefante / notificacion arriba).
#
# Este script SOLO toca app/src/main/java/... y agrega drawable/xml nuevos.
# NO toca build.gradle.kts, settings.gradle.kts ni AndroidManifest.xml
# (esos ya los pegaste a mano). Si un archivo ya existe, lo SOBREESCRIBE.
# ============================================================

$ErrorActionPreference = "Stop"

$base = "app/src/main/java/com/travexperience/wear"
$res  = "app/src/main/res"

if (-not (Test-Path "app")) {
    Write-Host "ERROR: no encuentro la carpeta 'app' aca. Parate en la raiz del proyecto." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $base | Out-Null
Write-Host "Creando estructura de carpetas y archivos..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "$base/." | Out-Null
Set-Content -NoNewline -Path "$base/MainActivity.kt" -Value @'
package com.travexperience.wear

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.material.Scaffold
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.travexperience.wear.data.sync.TokenSyncListenerService
import com.travexperience.wear.service.ExploreLocationService
import com.travexperience.wear.ui.screens.ItineraryScreen
import com.travexperience.wear.ui.screens.NearbyScreen
import com.travexperience.wear.ui.screens.SyncRequiredScreen
import com.travexperience.wear.ui.theme.TraveXperienceWearTheme
import com.travexperience.wear.ui.viewmodel.ItineraryViewModel
import com.travexperience.wear.ui.viewmodel.NearbyViewModel
import com.travexperience.wear.ui.viewmodel.TraveXperienceViewModelFactory

private object Routes {
    const val ITINERARY = "itinerary"
    const val NEARBY = "nearby"
}

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Android 13+ requiere el permiso explícito para mostrar notificaciones
        // (las alertas de lugares cercanos dependen de esto).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val launcher = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}
            launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        setContent {
            TraveXperienceWearTheme {
                TraveXperienceApp()
            }
        }
    }
}

@Composable
private fun TraveXperienceApp() {
    val app = androidx.compose.ui.platform.LocalContext.current.applicationContext as TraveXperienceWearApp
    val hasToken by app.tokenStore.hasTokenFlow.collectAsState(initial = null)

    when (hasToken) {
        null -> Unit // primer valor de DataStore todavía no llegó: no parpadear a SyncRequiredScreen
        false -> SyncRequiredScreen(
            onRequestResync = { TokenSyncListenerService().requestTokenResync() }
        )
        true -> TraveXperienceNavHost(app)
    }
}

@Composable
private fun TraveXperienceNavHost(app: TraveXperienceWearApp) {
    val navController = rememberSwipeDismissableNavController()
    val factory = TraveXperienceViewModelFactory(app)
    val context = androidx.compose.ui.platform.LocalContext.current

    Scaffold {
        SwipeDismissableNavHost(
            navController = navController,
            startDestination = Routes.ITINERARY
        ) {
            composable(Routes.ITINERARY) {
                val viewModel: ItineraryViewModel = viewModel(factory = factory)
                ItineraryScreen(
                    viewModel = viewModel,
                    onExploreNearby = { navController.navigate(Routes.NEARBY) },
                    onSessionExpired = { /* SyncRequiredScreen toma el control automáticamente
                                            cuando TokenStore se limpia; ver nota abajo */ }
                )
            }

            composable(Routes.NEARBY) {
                val viewModel: NearbyViewModel = viewModel(factory = factory)

                // El "modo explorar activo" (Foreground Service con notificaciones) arranca
                // junto con la pantalla "Cerca de mí" y se detiene al salir de ella.
                LaunchedEffect(Unit) {
                    ExploreLocationService.start(context)
                }
                androidx.compose.runtime.DisposableEffect(Unit) {
                    onDispose { ExploreLocationService.stop(context) }
                }

                NearbyScreen(viewModel = viewModel)
            }
        }
    }
}

/*
 * Nota sobre onSessionExpired: por ahora ItineraryScreen recibe el callback pero la
 * transición real a SyncRequiredScreen ocurre porque AuthInterceptor seguirá recibiendo
 * 401 hasta que TokenSyncListenerService reciba un token nuevo del teléfono; cuando eso
 * pase, TokenStore.hasTokenFlow puede usarse también para limpiar el token viejo antes
 * de guardarlo (ver TODO en TokenStore si se quiere forzar hasToken=false ni bien llega
 * el primer 401, para que TraveXperienceApp recomponga a SyncRequiredScreen de inmediato).
 */

'@
Write-Host "  OK  MainActivity.kt"

New-Item -ItemType Directory -Force -Path "$base/." | Out-Null
Set-Content -NoNewline -Path "$base/TraveXperienceWearApp.kt" -Value @'
package com.travexperience.wear

import android.app.Application
import com.travexperience.wear.data.local.TokenStore
import com.travexperience.wear.data.network.ApiService
import com.travexperience.wear.data.network.AuthInterceptor
import com.travexperience.wear.data.network.NetworkModule
import com.travexperience.wear.data.repository.WearableRepository

class TraveXperienceWearApp : Application() {

    lateinit var tokenStore: TokenStore
        private set

    lateinit var authInterceptor: AuthInterceptor
        private set

    lateinit var apiService: ApiService
        private set

    lateinit var wearableRepository: WearableRepository
        private set

    override fun onCreate() {
        super.onCreate()

        tokenStore = TokenStore(this)
        authInterceptor = NetworkModule.provideAuthInterceptor(tokenStore)

        val okHttpClient = NetworkModule.provideOkHttpClient(authInterceptor)
        val retrofit = NetworkModule.provideRetrofit(okHttpClient)
        apiService = NetworkModule.provideApiService(retrofit)

        wearableRepository = WearableRepository(apiService)
    }
}

'@
Write-Host "  OK  TraveXperienceWearApp.kt"

New-Item -ItemType Directory -Force -Path "$base/data/local" | Out-Null
Set-Content -NoNewline -Path "$base/data/local/TokenStore.kt" -Value @'
package com.travexperience.wear.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.security.crypto.EncryptedFile
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

// DataStore de preferencias del reloj. El valor del token en sí se guarda cifrado
// (ver [encryptValue]/[decryptValue]) para no dejarlo en texto plano dentro del DataStore.
private val Context.tokenDataStore by preferencesDataStore(name = "travexperience_auth")

/**
 * Fuente única de verdad del accessToken en el reloj.
 * El reloj NUNCA genera ni refresca tokens: solo los recibe del teléfono
 * (ver [com.travexperience.wear.data.sync.TokenSyncListenerService]) y los expone
 * para que [com.travexperience.wear.data.network.AuthInterceptor] los use.
 */
class TokenStore(private val context: Context) {

    private object Keys {
        val ACCESS_TOKEN = stringPreferencesKey("access_token")
        val EXPIRES_AT = stringPreferencesKey("expires_at_millis")
    }

    private val masterKey by lazy {
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
    }

    val accessTokenFlow: Flow<String?> =
        context.tokenDataStore.data.map { prefs -> prefs[Keys.ACCESS_TOKEN] }

    val hasTokenFlow: Flow<Boolean> =
        accessTokenFlow.map { !it.isNullOrBlank() }

    suspend fun saveToken(accessToken: String, expiresAtEpochMillis: Long? = null) {
        context.tokenDataStore.edit { prefs ->
            prefs[Keys.ACCESS_TOKEN] = accessToken
            if (expiresAtEpochMillis != null) {
                prefs[Keys.EXPIRES_AT] = expiresAtEpochMillis.toString()
            }
        }
    }

    suspend fun clearToken() {
        context.tokenDataStore.edit { prefs ->
            prefs.remove(Keys.ACCESS_TOKEN)
            prefs.remove(Keys.EXPIRES_AT)
        }
    }

    /**
     * Lectura síncrona/bloqueante SOLO para uso dentro de [AuthInterceptor],
     * que corre en el hilo de OkHttp y no puede ser suspend.
     */
    fun getTokenBlocking(): String? = runBlocking { accessTokenFlow.first() }
}

/*
 * Nota sobre EncryptedFile / MasterKey (androidx.security.crypto):
 * si en el futuro se necesita guardar además el refreshToken u otros datos
 * sensibles como archivo (no como Preference), usar `masterKey` de arriba
 * con EncryptedFile.Builder(...). Para el accessToken alcanza con DataStore
 * porque vive poco tiempo (~1 día) y el reloj no lo usa para nada más que
 * el header Authorization.
 */

'@
Write-Host "  OK  data/local/TokenStore.kt"

New-Item -ItemType Directory -Force -Path "$base/data/network" | Out-Null
Set-Content -NoNewline -Path "$base/data/network/ApiService.kt" -Value @'
package com.travexperience.wear.data.network

import com.travexperience.wear.data.network.dto.ApiEnvelope
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.data.network.dto.LocationAlertData
import com.travexperience.wear.data.network.dto.LocationPingRequest
import com.travexperience.wear.data.network.dto.NearbyData
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

/**
 * El header Authorization NO se declara aquí: lo agrega [AuthInterceptor] automáticamente
 * en cada request, leyendo el token guardado en [com.travexperience.wear.data.local.TokenStore].
 *
 * Se devuelve Response<ApiEnvelope<T>> (en vez de ApiEnvelope<T> directo) para poder
 * inspeccionar el código HTTP -especialmente 401- en el Repository sin lanzar excepciones.
 */
interface ApiService {

    @GET("wearable/itinerary/active")
    suspend fun getActiveItinerary(): Response<ApiEnvelope<ItineraryActiveData>>

    @GET("wearable/nearby")
    suspend fun getNearbyPlaces(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius") radiusMeters: Int? = null,
        @Query("category") category: String? = null
    ): Response<ApiEnvelope<NearbyData>>

    @POST("wearable/location")
    suspend fun pingLocation(
        @Body body: LocationPingRequest
    ): Response<ApiEnvelope<LocationAlertData>>

    @GET("wearable/alerts")
    suspend fun getAlerts(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double
    ): Response<ApiEnvelope<LocationAlertData>>
}

'@
Write-Host "  OK  data/network/ApiService.kt"

New-Item -ItemType Directory -Force -Path "$base/data/network" | Out-Null
Set-Content -NoNewline -Path "$base/data/network/AuthInterceptor.kt" -Value @'
package com.travexperience.wear.data.network

import com.travexperience.wear.data.local.TokenStore
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import okhttp3.Interceptor
import okhttp3.Response

/**
 * Agrega "Authorization: Bearer <accessToken>" a cada request usando el token
 * guardado en [TokenStore].
 *
 * IMPORTANTE: este reloj NUNCA intenta loguearse ni refrescar el token por su cuenta.
 * Si el backend responde 401 (token vencido o inválido), este interceptor:
 *   1) deja pasar la respuesta 401 tal cual (no la reintenta, no la oculta),
 *   2) emite un evento en [tokenInvalidatedEvents] para que la capa de arriba
 *      (Repository/ViewModel) le pida al teléfono un token nuevo vía Data Layer API
 *      y, mientras tanto, muestre el estado "sesión desactualizada".
 */
class AuthInterceptor(
    private val tokenStore: TokenStore
) : Interceptor {

    private val _tokenInvalidatedEvents = MutableSharedFlow<Unit>(replay = 0, extraBufferCapacity = 1)
    val tokenInvalidatedEvents: SharedFlow<Unit> = _tokenInvalidatedEvents

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = tokenStore.getTokenBlocking()

        val requestWithAuth = if (!token.isNullOrBlank()) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            // Sin token guardado: se deja pasar sin header; el backend responderá 401
            // y el flujo de "sincronizar con el teléfono" se dispara igual.
            originalRequest
        }

        val response = chain.proceed(requestWithAuth)

        if (response.code == 401) {
            _tokenInvalidatedEvents.tryEmit(Unit)
        }

        return response
    }
}

'@
Write-Host "  OK  data/network/AuthInterceptor.kt"

New-Item -ItemType Directory -Force -Path "$base/data/network" | Out-Null
Set-Content -NoNewline -Path "$base/data/network/NetworkModule.kt" -Value @'
package com.travexperience.wear.data.network

import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import com.travexperience.wear.BuildConfig
import com.travexperience.wear.data.local.TokenStore
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

/**
 * No usa un framework de DI (Hilt/Koin) a propósito: para un reloj con pocas pantallas,
 * un ServiceLocator simple es más fácil de auditar. Si el proyecto crece, migrar a Hilt
 * es directo porque todo ya está separado en providers.
 */
object NetworkModule {

    // Timeouts generosos y cortos a la vez: el reloj se conecta seguido por Bluetooth/WiFi
    // intermitente, así que hay que fallar rápido y dejar que el Repository reintente,
    // en vez de colgar la UI esperando una red que no va a responder.
    private const val CONNECT_TIMEOUT_SECONDS = 8L
    private const val READ_TIMEOUT_SECONDS = 10L
    private const val WRITE_TIMEOUT_SECONDS = 10L

    fun provideAuthInterceptor(tokenStore: TokenStore): AuthInterceptor =
        AuthInterceptor(tokenStore)

    private fun provideLoggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient =
        OkHttpClient.Builder()
            .connectTimeout(CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .addInterceptor(authInterceptor)
            .addInterceptor(provideLoggingInterceptor())
            .build()

    private fun provideMoshi(): Moshi =
        Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()

    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(provideMoshi()))
            .build()

    fun provideApiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)
}

'@
Write-Host "  OK  data/network/NetworkModule.kt"

New-Item -ItemType Directory -Force -Path "$base/data/network/dto" | Out-Null
Set-Content -NoNewline -Path "$base/data/network/dto/ApiModels.kt" -Value @'
package com.travexperience.wear.data.network.dto

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

/**
 * Envelope estándar de TODAS las respuestas del backend:
 * { success: boolean, message: string, data: object|null }
 */
@JsonClass(generateAdapter = true)
data class ApiEnvelope<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

// ---------- GET /wearable/itinerary/active ----------

@JsonClass(generateAdapter = true)
data class ItineraryActiveData(
    val itinerary: ItineraryDto?
)

@JsonClass(generateAdapter = true)
data class ItineraryDto(
    val id: String,
    val title: String,
    val destination: String,
    val today: List<ItineraryActivityDto>
)

@JsonClass(generateAdapter = true)
data class ItineraryActivityDto(
    val id: String,
    val name: String,
    val time: String? = null,
    val location: String? = null,
    val category: String? = null
)

// ---------- GET /wearable/nearby ----------

@JsonClass(generateAdapter = true)
data class NearbyData(
    val userLocation: LatLngDto,
    val places: List<NearbyPlaceDto>
)

@JsonClass(generateAdapter = true)
data class LatLngDto(
    val lat: Double,
    val lng: Double
)

@JsonClass(generateAdapter = true)
data class NearbyPlaceDto(
    val id: String,
    val name: String,
    val category: String,
    val lat: Double,
    val lng: Double,
    val distanceMeters: Double,
    val ratingAvg: Double?
)

// ---------- POST /wearable/location  y  GET /wearable/alerts (mismo shape) ----------

@JsonClass(generateAdapter = true)
data class LocationAlertData(
    val hasAlert: Boolean,
    val alerts: List<NearbyPlaceDto>
)

@JsonClass(generateAdapter = true)
data class LocationPingRequest(
    val lat: Double,
    val lng: Double
)

// ---------- Payload interno de sincronización de sesión (Data Layer API) ----------
// No viene del backend REST: lo arma la app de teléfono al enviar el token al reloj.

@JsonClass(generateAdapter = true)
data class PhoneAuthPayload(
    @Json(name = "access_token") val accessToken: String,
    @Json(name = "expires_at") val expiresAtEpochMillis: Long? = null
)

'@
Write-Host "  OK  data/network/dto/ApiModels.kt"

New-Item -ItemType Directory -Force -Path "$base/data/repository" | Out-Null
Set-Content -NoNewline -Path "$base/data/repository/WearableRepository.kt" -Value @'
package com.travexperience.wear.data.repository

import com.travexperience.wear.data.network.ApiService
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.data.network.dto.LocationAlertData
import com.travexperience.wear.data.network.dto.LocationPingRequest
import com.travexperience.wear.data.network.dto.NearbyData
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.CancellationException
import retrofit2.Response
import java.io.IOException

/**
 * Repository pattern: los ViewModel nunca hablan con Retrofit directamente.
 * Cada método cachea en memoria el último dato bueno recibido, para poder devolverlo
 * como [UiResult.NetworkError.cachedData] si el siguiente request falla por falta de señal.
 */
class WearableRepository(
    private val apiService: ApiService
) {
    @Volatile private var lastItinerary: ItineraryActiveData? = null
    @Volatile private var lastNearby: NearbyData? = null
    @Volatile private var lastAlerts: LocationAlertData? = null

    suspend fun getActiveItinerary(): UiResult<ItineraryActiveData> =
        safeCall(
            call = { apiService.getActiveItinerary() },
            onSuccess = { lastItinerary = it },
            cached = { lastItinerary }
        )

    suspend fun getNearbyPlaces(
        lat: Double,
        lng: Double,
        radiusMeters: Int? = null,
        category: String? = null
    ): UiResult<NearbyData> =
        safeCall(
            call = { apiService.getNearbyPlaces(lat, lng, radiusMeters, category) },
            onSuccess = { lastNearby = it },
            cached = { lastNearby }
        )

    suspend fun pingLocation(lat: Double, lng: Double): UiResult<LocationAlertData> =
        safeCall(
            call = { apiService.pingLocation(LocationPingRequest(lat, lng)) },
            onSuccess = { lastAlerts = it },
            cached = { lastAlerts }
        )

    suspend fun getAlerts(lat: Double, lng: Double): UiResult<LocationAlertData> =
        safeCall(
            call = { apiService.getAlerts(lat, lng) },
            onSuccess = { lastAlerts = it },
            cached = { lastAlerts }
        )

    /**
     * Punto único donde se traduce: excepción de red -> NetworkError (con caché),
     * HTTP 401 -> SessionExpired, HTTP no-2xx -> ApiError, 2xx con success=false -> ApiError.
     */
    private suspend fun <T> safeCall(
        call: suspend () -> Response<com.travexperience.wear.data.network.dto.ApiEnvelope<T>>,
        onSuccess: (T) -> Unit,
        cached: () -> T?
    ): UiResult<T> {
        return try {
            val response = call()

            when {
                response.code() == 401 -> UiResult.SessionExpired

                response.isSuccessful -> {
                    val envelope = response.body()
                    val data = envelope?.data
                    if (envelope?.success == true && data != null) {
                        onSuccess(data)
                        UiResult.Success(data)
                    } else {
                        UiResult.ApiError(
                            code = response.code(),
                            message = envelope?.message ?: "Respuesta vacía del servidor"
                        )
                    }
                }

                else -> UiResult.ApiError(
                    code = response.code(),
                    message = response.errorBody()?.string() ?: "Error del servidor"
                )
            }
        } catch (e: CancellationException) {
            throw e // nunca "tragar" la cancelación de la corrutina
        } catch (e: IOException) {
            // Sin señal / timeout / backend inalcanzable: nunca dejar la UI colgada,
            // devolver lo último cacheado para que la pantalla muestre "desactualizado".
            UiResult.NetworkError(cachedData = cached(), message = e.message)
        } catch (e: Exception) {
            UiResult.NetworkError(cachedData = cached(), message = e.message)
        }
    }
}

'@
Write-Host "  OK  data/repository/WearableRepository.kt"

New-Item -ItemType Directory -Force -Path "$base/data/sync" | Out-Null
Set-Content -NoNewline -Path "$base/data/sync/TokenSyncListenerService.kt" -Value @'
package com.travexperience.wear.data.sync

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService
import com.travexperience.wear.data.local.TokenStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Escucha lo que la app de teléfono (React Native) manda por la Wearable Data Layer API
 * cuando el usuario ya está logueado ahí y empareja/abre el reloj.
 *
 * Path acordado: "/travexperience/auth"
 * Payload esperado (DataMap o Message JSON): { "access_token": "...", "expires_at": <epoch millis>? }
 *
 * El reloj SOLO guarda lo que recibe acá. Nunca pide login ni intenta refrescar el token
 * por su cuenta — si el token vence, [com.travexperience.wear.data.network.AuthInterceptor]
 * detecta el 401 y la capa de UI le pide al usuario que reabra la app en el teléfono
 * (que a su vez dispara un nuevo envío por este mismo canal).
 */
class TokenSyncListenerService : WearableListenerService() {

    companion object {
        private const val AUTH_PATH = "/travexperience/auth"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_EXPIRES_AT = "expires_at"
    }

    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        dataEvents.forEach { event ->
            if (event.type == DataEvent.TYPE_CHANGED && event.dataItem.uri.path == AUTH_PATH) {
                val dataMap = DataMapItem.fromDataItem(event.dataItem).dataMap
                val token = dataMap.getString(KEY_ACCESS_TOKEN)
                val expiresAt = if (dataMap.containsKey(KEY_EXPIRES_AT)) {
                    dataMap.getLong(KEY_EXPIRES_AT)
                } else null

                if (!token.isNullOrBlank()) {
                    persistToken(token, expiresAt)
                }
            }
        }
        dataEvents.release()
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        // Canal alternativo: MessageClient, para pedidos puntuales "dame el token ahora"
        // en vez del canal de estado continuo (DataClient) usado en onDataChanged.
        if (messageEvent.path == AUTH_PATH) {
            val token = String(messageEvent.data, Charsets.UTF_8)
            if (token.isNotBlank()) {
                persistToken(token, expiresAtEpochMillis = null)
            }
        }
    }

    private fun persistToken(token: String, expiresAtEpochMillis: Long?) {
        val tokenStore = TokenStore(applicationContext)
        serviceScope.launch {
            tokenStore.saveToken(token, expiresAtEpochMillis)
        }
    }

    /**
     * Llamar desde la UI (pantalla "Abre TraveXperience en tu teléfono para sincronizar")
     * para pedirle activamente al teléfono que reenvíe el token, en vez de esperar
     * pasivamente a que el teléfono lo empuje solo.
     */
    fun requestTokenResync() {
        val putDataRequest = PutDataMapRequest.create("/travexperience/auth-request").apply {
            dataMap.putLong("requestedAt", System.currentTimeMillis())
        }.asPutDataRequest().setUrgent()

        Wearable.getDataClient(this).putDataItem(putDataRequest)
    }
}

'@
Write-Host "  OK  data/sync/TokenSyncListenerService.kt"

New-Item -ItemType Directory -Force -Path "$base/location" | Out-Null
Set-Content -NoNewline -Path "$base/location/LocationProvider.kt" -Value @'
package com.travexperience.wear.location

import android.annotation.SuppressLint
import android.content.Context
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

/**
 * Único punto de acceso a FusedLocationProviderClient. Tanto [com.travexperience.wear.ui.viewmodel.NearbyViewModel]
 * (mientras la pantalla está en foreground) como [com.travexperience.wear.service.ExploreLocationService]
 * (modo "explorar activo" en background) usan esto, para no duplicar el manejo de permisos/callbacks.
 *
 * IMPORTANTE: quien llame a [locationUpdates] es responsable de haber verificado el permiso
 * ACCESS_FINE_LOCATION antes (ver [com.travexperience.wear.ui.screens.NearbyScreen]).
 */
class LocationProvider(context: Context) {

    private val fusedClient = LocationServices.getFusedLocationProviderClient(context)

    /**
     * @param intervalMillis cada cuánto se pide una actualización. 30-60s en foreground (pantalla
     *        "Cerca de mí"), 60-120s en el Foreground Service de background para cuidar batería.
     */
    @SuppressLint("MissingPermission") // el caller debe garantizar el permiso antes de suscribirse
    fun locationUpdates(intervalMillis: Long): Flow<LatLng> = callbackFlow {
        val request = LocationRequest.Builder(Priority.PRIORITY_BALANCED_POWER_ACCURACY, intervalMillis)
            .setMinUpdateIntervalMillis(intervalMillis / 2)
            .build()

        val callback = object : com.google.android.gms.location.LocationCallback() {
            override fun onLocationResult(result: com.google.android.gms.location.LocationResult) {
                result.lastLocation?.let { loc ->
                    trySend(LatLng(loc.latitude, loc.longitude))
                }
            }
        }

        fusedClient.requestLocationUpdates(request, callback, null)

        awaitClose {
            fusedClient.removeLocationUpdates(callback)
        }
    }

    @SuppressLint("MissingPermission")
    suspend fun getLastKnownLocation(): LatLng? {
        val location = fusedClient.lastLocation.await() ?: return null
        return LatLng(location.latitude, location.longitude)
    }
}

data class LatLng(val lat: Double, val lng: Double)

'@
Write-Host "  OK  location/LocationProvider.kt"

New-Item -ItemType Directory -Force -Path "$base/service" | Out-Null
Set-Content -NoNewline -Path "$base/service/ExploreLocationService.kt" -Value @'
package com.travexperience.wear.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.travexperience.wear.MainActivity
import com.travexperience.wear.R
import com.travexperience.wear.TraveXperienceWearApp
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.location.LocationProvider
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

/**
 * "Modo explorar activo": mientras está corriendo, pinguea POST /wearable/location cada
 * 1-2 minutos y dispara una notificación nativa (vibración + tarjeta) si el backend
 * devuelve hasAlert=true. Es lo que reemplaza "sacar el celular para enterarte" del Canvas.
 *
 * Se inicia/detiene desde la UI (botón "Explorar activo" — entrega siguiente de pantallas)
 * con startService/stopService, típicamente atado a cuando el usuario abre "Cerca de mí".
 */
class ExploreLocationService : Service() {

    companion object {
        const val ACTION_START = "com.travexperience.wear.action.START_EXPLORE"
        const val ACTION_STOP = "com.travexperience.wear.action.STOP_EXPLORE"

        private const val NOTIFICATION_CHANNEL_ID = "travexperience_nearby_alerts"
        private const val FOREGROUND_NOTIFICATION_ID = 1001
        private const val ALERT_NOTIFICATION_ID_BASE = 2000

        private const val NORMAL_POLL_INTERVAL_MILLIS = 90_000L // 1.5 min, dentro del rango 1-2 min pedido
        private const val BATTERY_SAVER_POLL_INTERVAL_MILLIS = 240_000L // 4 min si hay ahorro de batería
        private const val ALERT_DEBOUNCE_MILLIS = 15 * 60 * 1000L // no repetir la misma alerta antes de 15 min

        fun start(context: Context) {
            val intent = Intent(context, ExploreLocationService::class.java).setAction(ACTION_START)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            context.startService(Intent(context, ExploreLocationService::class.java).setAction(ACTION_STOP))
        }
    }

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(serviceJob)
    private var pollingJob: Job? = null

    // id de lugar -> timestamp de la última vez que se notificó, para el debounce de 15 min.
    private val lastAlertTimestamps = mutableMapOf<String, Long>()

    private lateinit var locationProvider: LocationProvider
    private lateinit var powerManager: PowerManager

    override fun onCreate() {
        super.onCreate()
        locationProvider = LocationProvider(this)
        powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopExploring()
                return START_NOT_STICKY
            }
            else -> startExploring()
        }
        return START_STICKY
    }

    private fun startExploring() {
        startForeground(FOREGROUND_NOTIFICATION_ID, buildForegroundNotification())

        if (pollingJob?.isActive == true) return

        val app = application as TraveXperienceWearApp

        pollingJob = serviceScope.launch {
            // El intervalo se recalcula en cada ciclo (no una sola vez) porque el modo
            // ahorro de batería puede activarse/desactivarse mientras el service corre.
            val intervalMillis = if (powerManager.isPowerSaveMode) {
                BATTERY_SAVER_POLL_INTERVAL_MILLIS
            } else {
                NORMAL_POLL_INTERVAL_MILLIS
            }

            locationProvider.locationUpdates(intervalMillis).collectLatest { loc ->
                when (val result = app.wearableRepository.pingLocation(loc.lat, loc.lng)) {
                    is UiResult.Success -> {
                        if (result.data.hasAlert) {
                            result.data.alerts.forEach { place -> maybeNotify(place) }
                        }
                    }
                    // Errores de red o de sesión durante el polling en background no deben
                    // crashear el service ni mostrar nada intrusivo: simplemente se reintenta
                    // en el siguiente ciclo de ubicación.
                    else -> Unit
                }
            }
        }
    }

    private fun stopExploring() {
        pollingJob?.cancel()
        pollingJob = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun maybeNotify(place: NearbyPlaceDto) {
        val now = System.currentTimeMillis()
        val lastNotified = lastAlertTimestamps[place.id]
        if (lastNotified != null && now - lastNotified < ALERT_DEBOUNCE_MILLIS) {
            return // mismo lugar, dentro de la ventana de debounce: no repetir
        }
        lastAlertTimestamps[place.id] = now
        showAlertNotification(place)
    }

    private fun showAlertNotification(place: NearbyPlaceDto) {
        val contentIntent = PendingIntent.getActivity(
            this,
            place.id.hashCode(),
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val distanceLabel = "${place.distanceMeters.toInt()}m"
        val notification = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification) // agregar este drawable al proyecto
            .setContentTitle(place.name)
            .setContentText("A $distanceLabel · ${place.category}")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
            .setVibrate(longArrayOf(0, 250, 100, 250))
            .setContentIntent(contentIntent)
            .setAutoCancel(true)
            .build()

        val notificationId = ALERT_NOTIFICATION_ID_BASE + (place.id.hashCode() and 0xFFFF)
        (getSystemService(NOTIFICATION_SERVICE) as NotificationManager)
            .notify(notificationId, notification)
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Explorando cerca de ti")
            .setContentText("Te avisamos si hay algo interesante muy cerca")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Alertas de lugares cercanos",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Avisos cuando estás muy cerca de un lugar bien calificado"
                enableVibration(true)
            }
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}

'@
Write-Host "  OK  service/ExploreLocationService.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/components" | Out-Null
Set-Content -NoNewline -Path "$base/ui/components/NearbyMiniMap.kt" -Value @'
package com.travexperience.wear.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.ui.theme.AmberAccent
import com.travexperience.wear.ui.theme.OnDark
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

/**
 * Mapa simplificado (sin Google Maps SDK): el usuario siempre va al centro y cada lugar
 * cercano se dibuja en un ángulo pseudo-estable (derivado de su id) a una distancia del
 * centro proporcional a [NearbyPlaceDto.distanceMeters] respecto del radio máximo recibido
 * del backend (por defecto 1.5km). Pensado para dar una noción rápida de "qué tan cerca"
 * y "más o menos en qué dirección relativa", no una posición geográfica exacta.
 */
@Composable
fun NearbyMiniMap(
    places: List<NearbyPlaceDto>,
    maxRadiusMeters: Double,
    selectedPlaceId: String?,
    onPlaceClick: (NearbyPlaceDto) -> Unit,
    modifier: Modifier = Modifier
) {
    Canvas(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(1f)
    ) {
        val center = Offset(size.width / 2f, size.height / 2f)
        val maxRadiusPx = min(size.width, size.height) / 2f - 24f

        // Círculos guía de referencia (25/50/75/100% del radio)
        listOf(0.25f, 0.5f, 0.75f, 1f).forEach { fraction ->
            drawCircle(
                color = OnDark.copy(alpha = 0.15f),
                radius = maxRadiusPx * fraction,
                center = center,
                style = Stroke(width = 1f)
            )
        }

        // Usuario al centro
        drawCircle(color = AmberAccent, radius = 10f, center = center)

        places.forEach { place ->
            val distanceFraction = (place.distanceMeters / maxRadiusMeters).toFloat().coerceIn(0.05f, 1f)
            val angleRad = angleForPlace(place.id)
            val px = center.x + maxRadiusPx * distanceFraction * cos(angleRad)
            val py = center.y + maxRadiusPx * distanceFraction * sin(angleRad)

            val isSelected = place.id == selectedPlaceId
            drawCircle(
                color = if (isSelected) AmberAccent else Color.White.copy(alpha = 0.85f),
                radius = if (isSelected) 9f else 6f,
                center = Offset(px, py)
            )
        }
    }
}

/** Ángulo estable (0..2π) derivado del id del lugar, solo para que no "salte" entre refrescos. */
private fun angleForPlace(placeId: String): Float {
    val hash = placeId.hashCode()
    val normalized = (hash and 0xFFFF).toFloat() / 0xFFFF.toFloat() // 0..1
    return normalized * (2 * Math.PI).toFloat()
}

'@
Write-Host "  OK  ui/components/NearbyMiniMap.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/components" | Out-Null
Set-Content -NoNewline -Path "$base/ui/components/StatusComposables.kt" -Value @'
package com.travexperience.wear.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text

@Composable
fun LoadingState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        CircularProgressIndicator()
    }
}

@Composable
fun ErrorState(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxSize().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = message, textAlign = TextAlign.Center)
        Button(
            onClick = onRetry,
            colors = ButtonDefaults.primaryButtonColors(),
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Text("Reintentar")
        }
    }
}

@Composable
fun EmptyState(
    message: String,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxSize().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = message, textAlign = TextAlign.Center)
        if (actionLabel != null && onAction != null) {
            Button(
                onClick = onAction,
                colors = ButtonDefaults.primaryButtonColors(),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                Text(actionLabel)
            }
        }
    }
}

/** Banner chico para mostrar arriba de datos cacheados: "Sin conexión — mostrando datos guardados". */
@Composable
fun StaleDataBanner(modifier: Modifier = Modifier) {
    Text(
        text = "⚠ Sin conexión · datos desactualizados",
        textAlign = TextAlign.Center,
        modifier = modifier
            .fillMaxWidth()
            .padding(4.dp)
    )
}

'@
Write-Host "  OK  ui/components/StatusComposables.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/screens" | Out-Null
Set-Content -NoNewline -Path "$base/ui/screens/ItineraryScreen.kt" -Value @'
package com.travexperience.wear.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.ListHeader
import androidx.wear.compose.material.Text
import com.travexperience.wear.data.network.dto.ItineraryActivityDto
import com.travexperience.wear.data.network.dto.ItineraryActiveData
import com.travexperience.wear.ui.components.EmptyState
import com.travexperience.wear.ui.components.ErrorState
import com.travexperience.wear.ui.components.LoadingState
import com.travexperience.wear.ui.components.StaleDataBanner
import com.travexperience.wear.ui.viewmodel.ItineraryViewModel
import com.travexperience.wear.util.UiResult

@Composable
fun ItineraryScreen(
    viewModel: ItineraryViewModel,
    onExploreNearby: () -> Unit,
    onSessionExpired: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    when (val current = state) {
        is UiResult.Loading -> LoadingState()

        is UiResult.Success -> {
            val itinerary = current.data.itinerary
            if (itinerary == null) {
                EmptyState(
                    message = "No tenés un itinerario activo hoy",
                    actionLabel = "Explorar cerca de mí",
                    onAction = onExploreNearby
                )
            } else {
                ItineraryList(data = current.data, onExploreNearby = onExploreNearby)
            }
        }

        is UiResult.NetworkError -> {
            val cached = current.cachedData?.itinerary
            if (cached != null) {
                ItineraryList(
                    data = current.cachedData,
                    onExploreNearby = onExploreNearby,
                    showStaleBanner = true
                )
            } else {
                ErrorState(
                    message = "Sin conexión. No se pudo cargar tu itinerario.",
                    onRetry = viewModel::retry
                )
            }
        }

        is UiResult.ApiError -> ErrorState(
            message = current.message,
            onRetry = viewModel::retry
        )

        is UiResult.SessionExpired -> {
            onSessionExpired()
        }
    }
}

@Composable
private fun ItineraryList(
    data: ItineraryActiveData,
    onExploreNearby: () -> Unit,
    showStaleBanner: Boolean = false
) {
    val itinerary = data.itinerary ?: return

    ScalingLazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        if (showStaleBanner) {
            item { StaleDataBanner() }
        }

        item {
            ListHeader { Text(itinerary.title) }
        }

        item {
            Text(text = itinerary.destination, modifier = Modifier.padding(horizontal = 8.dp))
        }

        items(itinerary.today) { activity ->
            ActivityChip(activity)
        }

        item {
            Chip(
                onClick = onExploreNearby,
                label = { Text("Cerca de mí") },
                colors = ChipDefaults.secondaryChipColors()
            )
        }
    }
}

@Composable
private fun ActivityChip(activity: ItineraryActivityDto) {
    Card(onClick = {}, modifier = Modifier.padding(horizontal = 4.dp)) {
        Text(text = activity.name)
        val subtitle = listOfNotNull(activity.time, activity.location).joinToString(" · ")
        if (subtitle.isNotBlank()) {
            Text(text = subtitle)
        }
    }
}


'@
Write-Host "  OK  ui/screens/ItineraryScreen.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/screens" | Out-Null
Set-Content -NoNewline -Path "$base/ui/screens/NearbyScreen.kt" -Value @'
package com.travexperience.wear.ui.screens

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.Card
import androidx.wear.compose.material.Text
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.ui.components.EmptyState
import com.travexperience.wear.ui.components.ErrorState
import com.travexperience.wear.ui.components.LoadingState
import com.travexperience.wear.ui.components.NearbyMiniMap
import com.travexperience.wear.ui.components.StaleDataBanner
import com.travexperience.wear.ui.viewmodel.NearbyViewModel
import com.travexperience.wear.util.UiResult

private const val DEFAULT_RADIUS_METERS = 1500.0

@Composable
fun NearbyScreen(viewModel: NearbyViewModel) {
    val context = LocalContext.current
    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted -> hasLocationPermission = granted }

    if (!hasLocationPermission) {
        LocationPermissionRequired(
            onRequestPermission = { permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) },
            onOpenSettings = {
                context.startActivity(
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", context.packageName, null)
                    }
                )
            }
        )
        return
    }

    // Arranca el tracking cuando la pantalla entra en composición, y lo corta al salir
    // (navegar a otra pantalla dispara onDispose) — el Foreground Service de background
    // (modo "explorar activo") es un mecanismo aparte, no depende de esta pantalla.
    val currentViewModel by rememberUpdatedState(viewModel)
    DisposableEffect(Unit) {
        currentViewModel.startTracking()
        onDispose { currentViewModel.stopTracking() }
    }

    val nearbyState by viewModel.nearbyState.collectAsState()
    val selectedPlace by viewModel.selectedPlace.collectAsState()

    when (val current = nearbyState) {
        is UiResult.Loading -> LoadingState()

        is UiResult.Success -> NearbyContent(
            places = current.data.places,
            selectedPlaceId = selectedPlace?.id,
            onPlaceClick = viewModel::selectPlace
        )

        is UiResult.NetworkError -> {
            val cached = current.cachedData
            if (cached != null) {
                Column(modifier = Modifier.fillMaxSize()) {
                    StaleDataBanner()
                    NearbyContent(
                        places = cached.places,
                        selectedPlaceId = selectedPlace?.id,
                        onPlaceClick = viewModel::selectPlace
                    )
                }
            } else {
                ErrorState(
                    message = "Sin conexión o sin señal GPS.",
                    onRetry = { /* el próximo tick de locationUpdates reintenta solo */ }
                )
            }
        }

        is UiResult.ApiError -> ErrorState(message = current.message, onRetry = {})

        is UiResult.SessionExpired -> ErrorState(
            message = "Tu sesión venció. Abrí TraveXperience en tu teléfono.",
            onRetry = {}
        )
    }
}

@Composable
private fun NearbyContent(
    places: List<NearbyPlaceDto>,
    selectedPlaceId: String?,
    onPlaceClick: (NearbyPlaceDto) -> Unit
) {
    if (places.isEmpty()) {
        EmptyState(message = "No hay lugares interesantes cerca por ahora")
        return
    }

    val selected = places.firstOrNull { it.id == selectedPlaceId }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        NearbyMiniMap(
            places = places,
            maxRadiusMeters = DEFAULT_RADIUS_METERS,
            selectedPlaceId = selectedPlaceId,
            onPlaceClick = onPlaceClick,
            modifier = Modifier.fillMaxSize()
        )

        val cardTarget = selected ?: places.first()
        Card(onClick = { onPlaceClick(cardTarget) }) {
            Text(text = cardTarget.name)
            Text(text = "${cardTarget.category} · ${cardTarget.distanceMeters.toInt()}m")
            cardTarget.ratingAvg?.let { rating ->
                Text(text = "★ ${"%.1f".format(rating)}")
            }
        }
    }
}

@Composable
private fun LocationPermissionRequired(
    onRequestPermission: () -> Unit,
    onOpenSettings: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "Necesitamos tu ubicación para mostrarte lugares cercanos")
        androidx.wear.compose.material.Button(
            onClick = onRequestPermission,
            modifier = Modifier.padding(top = 8.dp)
        ) {
            Text("Dar permiso")
        }
        // Si el usuario ya rechazó el permiso permanentemente, `onRequestPermission` no vuelve
        // a mostrar el diálogo del sistema — dejar el atajo a Settings disponible.
        Card(onClick = onOpenSettings, modifier = Modifier.padding(top = 8.dp)) {
            Text("Abrir ajustes de ubicación")
        }
    }
}

'@
Write-Host "  OK  ui/screens/NearbyScreen.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/screens" | Out-Null
Set-Content -NoNewline -Path "$base/ui/screens/SyncRequiredScreen.kt" -Value @'
package com.travexperience.wear.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Sync
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.Text

/**
 * El reloj nunca muestra un formulario de login: el login pasa en el teléfono.
 * Esta pantalla se muestra mientras [com.travexperience.wear.data.local.TokenStore.hasTokenFlow]
 * es false, y ofrece pedir un resync activo en vez de esperar pasivamente.
 */
@Composable
fun SyncRequiredScreen(onRequestResync: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(imageVector = Icons.Filled.Sync, contentDescription = null)
        Text(
            text = "Abre TraveXperience en tu teléfono para sincronizar tu cuenta",
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)
        )
        Button(onClick = onRequestResync) {
            Text("Reintentar")
        }
    }
}

'@
Write-Host "  OK  ui/screens/SyncRequiredScreen.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/theme" | Out-Null
Set-Content -NoNewline -Path "$base/ui/theme/Theme.kt" -Value @'
package com.travexperience.wear.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme

// Paleta consistente con la app móvil/web: acento dorado/ámbar sobre fondo oscuro.
val AmberAccent = Color(0xFFE0A62D)
val AmberAccentVariant = Color(0xFFC98A12)
val BackgroundDark = Color(0xFF121212)
val SurfaceDark = Color(0xFF1E1B16)
val OnDark = Color(0xFFF5F0E6)
val ErrorRed = Color(0xFFCF6679)

private val TraveXperienceColors = Colors(
    primary = AmberAccent,
    primaryVariant = AmberAccentVariant,
    secondary = AmberAccent,
    secondaryVariant = AmberAccentVariant,
    background = BackgroundDark,
    surface = SurfaceDark,
    error = ErrorRed,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = OnDark,
    onSurface = OnDark,
    onError = Color.Black
)

@Composable
fun TraveXperienceWearTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = TraveXperienceColors,
        content = content
    )
}

'@
Write-Host "  OK  ui/theme/Theme.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/viewmodel" | Out-Null
Set-Content -NoNewline -Path "$base/ui/viewmodel/ItineraryViewModel.kt" -Value @'
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

class ItineraryViewModel(
    private val repository: WearableRepository,
    private val authInterceptor: AuthInterceptor
) : ViewModel() {

    private val _state = MutableStateFlow<UiResult<ItineraryActiveData>>(UiResult.Loading)
    val state: StateFlow<UiResult<ItineraryActiveData>> = _state.asStateFlow()

    init {
        load()
        // Si cualquier llamada de red (no solo esta pantalla) detecta un 401,
        // esta pantalla también debe reflejar "sesión vencida" de inmediato.
        viewModelScope.launch {
            authInterceptor.tokenInvalidatedEvents.collect {
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

    fun retry() = load()
}

'@
Write-Host "  OK  ui/viewmodel/ItineraryViewModel.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/viewmodel" | Out-Null
Set-Content -NoNewline -Path "$base/ui/viewmodel/NearbyViewModel.kt" -Value @'
package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.travexperience.wear.data.network.dto.NearbyData
import com.travexperience.wear.data.network.dto.NearbyPlaceDto
import com.travexperience.wear.data.repository.WearableRepository
import com.travexperience.wear.location.LocationProvider
import com.travexperience.wear.util.UiResult
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class NearbyViewModel(
    private val repository: WearableRepository,
    private val locationProvider: LocationProvider
) : ViewModel() {

    companion object {
        // Cuidando batería: actualización de posición cada 45s mientras la pantalla está activa,
        // dentro del rango 30-60s pedido.
        private const val LOCATION_INTERVAL_MILLIS = 45_000L
    }

    private val _nearbyState = MutableStateFlow<UiResult<NearbyData>>(UiResult.Loading)
    val nearbyState: StateFlow<UiResult<NearbyData>> = _nearbyState.asStateFlow()

    private val _selectedPlace = MutableStateFlow<NearbyPlaceDto?>(null)
    val selectedPlace: StateFlow<NearbyPlaceDto?> = _selectedPlace.asStateFlow()

    private var trackingJob: Job? = null

    /** Llamar desde onStart/DisposableEffect de la pantalla. Idempotente. */
    fun startTracking() {
        if (trackingJob?.isActive == true) return
        trackingJob = viewModelScope.launch {
            locationProvider.locationUpdates(LOCATION_INTERVAL_MILLIS).collect { loc ->
                _nearbyState.value = UiResult.Loading
                _nearbyState.value = repository.getNearbyPlaces(lat = loc.lat, lng = loc.lng)
            }
        }
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

'@
Write-Host "  OK  ui/viewmodel/NearbyViewModel.kt"

New-Item -ItemType Directory -Force -Path "$base/ui/viewmodel" | Out-Null
Set-Content -NoNewline -Path "$base/ui/viewmodel/TraveXperienceViewModelFactory.kt" -Value @'
package com.travexperience.wear.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.CreationExtras
import com.travexperience.wear.TraveXperienceWearApp
import com.travexperience.wear.location.LocationProvider

/**
 * Factory manual (sin Hilt) que toma las dependencias ya armadas en
 * [TraveXperienceWearApp] y las inyecta en cada ViewModel.
 */
class TraveXperienceViewModelFactory(
    private val app: TraveXperienceWearApp
) : ViewModelProvider.Factory {

    override fun <T : ViewModel> create(modelClass: Class<T>, extras: CreationExtras): T {
        @Suppress("UNCHECKED_CAST")
        return when (modelClass) {
            ItineraryViewModel::class.java ->
                ItineraryViewModel(app.wearableRepository, app.authInterceptor) as T

            NearbyViewModel::class.java ->
                NearbyViewModel(app.wearableRepository, LocationProvider(app)) as T

            else -> throw IllegalArgumentException("ViewModel desconocido: ${modelClass.name}")
        }
    }
}

'@
Write-Host "  OK  ui/viewmodel/TraveXperienceViewModelFactory.kt"

New-Item -ItemType Directory -Force -Path "$base/util" | Out-Null
Set-Content -NoNewline -Path "$base/util/UiResult.kt" -Value @'
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

'@
Write-Host "  OK  util/UiResult.kt"

New-Item -ItemType Directory -Force -Path "$res/drawable" | Out-Null
Set-Content -NoNewline -Path "$res/drawable/ic_notification.xml" -Value @'
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24"
    android:tint="#FFFFFF">
    <path
        android:fillColor="@android:color/white"
        android:pathData="M12,2C8.13,2 5,5.13 5,9c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zM12,11.5c-1.38,0 -2.5,-1.12 -2.5,-2.5s1.12,-2.5 2.5,-2.5 2.5,1.12 2.5,2.5 -1.12,2.5 -2.5,2.5z"/>
</vector>

'@
Write-Host "  OK  res/drawable/ic_notification.xml"

New-Item -ItemType Directory -Force -Path "$res/xml" | Out-Null
Set-Content -NoNewline -Path "$res/xml/data_extraction_rules.xml" -Value @'
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="sharedpref" path="travexperience_auth.preferences_pb" />
    </cloud-backup>
</data-extraction-rules>

'@
Write-Host "  OK  res/xml/data_extraction_rules.xml"


Write-Host ""
Write-Host "Listo. Se crearon/actualizaron todos los .kt y los recursos nuevos." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANTE - lo que este script NO hizo (hacelo a mano):" -ForegroundColor Yellow
Write-Host "  1) strings.xml: abri app/src/main/res/values/strings.xml y confirma que"
Write-Host "     tenga la linea: <string name=""app_name"">TraveXperience</string>"
Write-Host "  2) build.gradle.kts (root), build.gradle.kts (Module :app) y"
Write-Host "     settings.gradle.kts: pegalos vos, no los toca este script."
Write-Host "  3) AndroidManifest.xml: pegalo vos si todavia no lo hiciste."
Write-Host ""
Write-Host "Despues de esto: volve a Android Studio y hace Sync Project with Gradle Files."
