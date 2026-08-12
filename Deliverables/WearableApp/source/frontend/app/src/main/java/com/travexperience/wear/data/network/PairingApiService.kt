package com.travexperience.wear.data.network

import com.travexperience.wear.data.network.dto.ApiEnvelope
import com.travexperience.wear.data.network.dto.PairRedeemRequest
import com.travexperience.wear.data.network.dto.RefreshTokenRequest
import com.travexperience.wear.data.network.dto.WearSessionData
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Endpoints que el reloj llama SIN el header Authorization de [AuthInterceptor]:
 * en el momento en que se llaman, o bien todavía no hay accessToken (pairing), o el que
 * hay ya venció y es justo lo que se está reemplazando (refresh).
 *
 * Por eso corren sobre un OkHttpClient separado, sin AuthInterceptor ni TokenAuthenticator
 * (ver [NetworkModule.providePairingRetrofit]) — evita loops de "401 -> refresh -> 401 -> refresh".
 */
interface PairingApiService {

    /** Canjea el código de 6 dígitos mostrado en el teléfono por credenciales propias del reloj. */
    @POST("wearable/pair/redeem")
    suspend fun redeemPairingCode(
        @Body body: PairRedeemRequest
    ): Response<ApiEnvelope<WearSessionData>>

    /** Renueva la sesión del reloj usando el refreshToken guardado localmente. */
    @POST("wearable/auth/refresh")
    suspend fun refreshSession(
        @Body body: RefreshTokenRequest
    ): Response<ApiEnvelope<WearSessionData>>
}
