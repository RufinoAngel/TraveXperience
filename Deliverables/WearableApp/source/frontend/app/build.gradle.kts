plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.travexperience.wear"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.travexperience.wear"
        minSdk = 30 // mínimo recomendado para Wear OS 3+ (Compose for Wear OS)
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        // Base URL configurable por build type (dev/staging/prod)
        buildConfigField("String", "API_BASE_URL", "\"https://api.travexperience.com/api/v1/\"")
    }

    buildTypes {
        debug {
            // IP de tu red local para pruebas con reloj físico o red externa.
            buildConfigField("String", "API_BASE_URL", "\"http://10.47.9.6:4000/api/v1/\"")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // --- Compose for Wear OS (NO Material3 de mobile) ---
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.wear.compose:compose-material:1.4.0")
    implementation("androidx.wear.compose:compose-foundation:1.4.0")
    implementation("androidx.wear.compose:compose-navigation:1.4.0")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")

    // --- Wear OS específico ---
    implementation("androidx.wear:wear:1.3.0")
    implementation("com.google.android.horologist:horologist-compose-layout:0.6.16") // scaffolding responsive round/square

    // --- ViewModel + StateFlow ---
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.3")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.3")
    implementation("androidx.lifecycle:lifecycle-service:2.8.3")

    // --- Retrofit + OkHttp ---
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.moshi:moshi:1.15.1")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
    ksp("com.squareup.moshi:moshi-kotlin-codegen:1.15.1")

    // --- Coroutines ---
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")

    // --- Persistencia segura del token ---
    implementation("androidx.security:security-crypto:1.1.0-alpha06") // cifrado adicional del valor del token en DataStore

    // --- Ubicación ---
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // --- Trabajo periódico (polling de ubicación en background) ---
    implementation("androidx.work:work-runtime-ktx:2.9.1")

    // --- Tests ---
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
}
