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

import java.security.SecureRandom
import java.security.cert.X509Certificate
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager

/**
 * No usa un framework de DI (Hilt/Koin) a propósito: para un reloj con pocas pantallas,
 * un ServiceLocator simple es más fácil de auditar. Si el proyecto crece, migrar a Hilt
 * es directo porque todo ya está separado en providers.
 *
 * Hay DOS Retrofit distintos:
 *  - el "autenticado" (ver [provideRetrofit]/[provideApiService]), con [AuthInterceptor] +
 *    [TokenAuthenticator], para todos los endpoints de solo lectura del wearable.
 *  - el "plano" (ver [providePairingRetrofit]/[providePairingApiService]), sin ninguno de los
 *    dos, para canjear el código de 6 dígitos y para refrescar el token. Si el refresh
 *    corriera sobre el cliente autenticado, un 401 del propio refresh dispararía el
 *    Authenticator de nuevo -> loop.
 */
object NetworkModule {

    // Timeouts generosos: el reloj se conecta seguido por Bluetooth/WiFi
    // intermitente, así que damos margen suficiente para que el emulador responda.
    private const val CONNECT_TIMEOUT_SECONDS = 30L 
    private const val READ_TIMEOUT_SECONDS = 30L
    private const val WRITE_TIMEOUT_SECONDS = 30L

    fun provideAuthInterceptor(tokenStore: TokenStore): AuthInterceptor =
        AuthInterceptor(tokenStore)

    fun provideTokenAuthenticator(
        tokenStore: TokenStore,
        pairingApiService: PairingApiService,
        authInterceptor: AuthInterceptor
    ): TokenAuthenticator = TokenAuthenticator(tokenStore, pairingApiService, authInterceptor)

    private fun provideLoggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

    private fun getUnsafeOkHttpClientBuilder(): OkHttpClient.Builder {
        try {
            // Crear un trust manager que no valide cadenas de certificados
            val trustAllCerts = arrayOf<TrustManager>(object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
            })

            // Instalar el trust manager que todo lo acepta
            val sslContext = SSLContext.getInstance("SSL")
            sslContext.init(null, trustAllCerts, SecureRandom())
            
            val sslSocketFactory = sslContext.socketFactory

            val builder = OkHttpClient.Builder()
            builder.sslSocketFactory(sslSocketFactory, trustAllCerts[0] as X509TrustManager)
            builder.hostnameVerifier { _, _ -> true }

            return builder
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    private fun baseClientBuilder(): OkHttpClient.Builder {
        val builder = if (BuildConfig.DEBUG) {
            getUnsafeOkHttpClientBuilder()
        } else {
            OkHttpClient.Builder()
        }
        
        return builder
            .connectTimeout(CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .addInterceptor(provideLoggingInterceptor())
    }

    /** Cliente autenticado: agrega Bearer token y refresca solo ante un 401. */
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        tokenAuthenticator: TokenAuthenticator
    ): OkHttpClient =
        baseClientBuilder()
            .addInterceptor(authInterceptor)
            .authenticator(tokenAuthenticator)
            .build()

    /** Cliente plano: sin Bearer token ni refresh automático (para pairing/redeem y refresh). */
    fun providePairingOkHttpClient(): OkHttpClient =
        baseClientBuilder().build()

    private fun provideMoshi(): Moshi =
        Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()

    private fun retrofitBuilder(okHttpClient: OkHttpClient): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(provideMoshi()))
            .build()

    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit = retrofitBuilder(okHttpClient)

    fun providePairingRetrofit(okHttpClient: OkHttpClient): Retrofit = retrofitBuilder(okHttpClient)

    fun provideApiService(retrofit: Retrofit): ApiService =
        retrofit.create(ApiService::class.java)

    fun providePairingApiService(retrofit: Retrofit): PairingApiService =
        retrofit.create(PairingApiService::class.java)
}
