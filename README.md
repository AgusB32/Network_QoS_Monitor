# Network QoS Monitor

> **Analizador y visualizador de calidad de red móvil en tiempo real con mapeo de cobertura personal**  
> *Licenciatura en Sistemas de Información — Desarrollo de Aplicaciones Móviles (2026) — FCyT*  
> **Nivel:** Medio-Avanzado | **Tecnología:** React Native & TypeScript

---

## 📋 Descripción del Proyecto

Aplicación móvil multiplataforma orientada a ingeniería de telecomunicaciones para monitorear y auditar la experiencia del usuario final (**QoE / QoS**). Mide parámetros de red en tiempo real (RTT, Jitter según RFC 3550, Pérdida de paquetes, Throughput ascendente/descendente), correlaciona los datos con la celda de telefonía celular y coordenadas GPS, y los representa mediante un **Heatmap de cobertura** y un historial navegable.

---

## 🏛️ Arquitectura del Software (SOLID & Clean Architecture)

El proyecto implementa una arquitectura en capas hexagonales estrictamente desacoplada:

1. **Capa de Dominio (`src/domain/`):**
   * **Modelos:** [`network.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/models/network.ts), [`qos.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/models/qos.ts), [`session.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/models/session.ts).
   * **Contratos (Interfaces):** [`ILatencyProbe.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/ILatencyProbe.ts), [`IThroughputTester.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/IThroughputTester.ts), [`ITelephonyProvider.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/ITelephonyProvider.ts), [`INetworkStateProvider.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/INetworkStateProvider.ts), [`ILocationProvider.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/ILocationProvider.ts), [`IMeasurementRepository.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/contracts/IMeasurementRepository.ts).
   * **Servicios Puros:**
     * [`JitterCalculator.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/services/JitterCalculator.ts): Cálculo estándar de jitter inter-paquete según **RFC 3550**:
       $$D(i-1, i) = |RTT_i - RTT_{i-1}| \quad;\quad J_i = J_{i-1} + \frac{|D| - J_{i-1}}{16}$$
     * [`QoSEvaluator.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/domain/services/QoSEvaluator.ts): Ponderación de calidad 0-100 y diagnóstico automático.
2. **Capa de Infraestructura (`src/infrastructure/`):**
   * [`NetInfoAdapter.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/infrastructure/network-state/NetInfoAdapter.ts): Detección reactiva de conexión.
   * [`ExpoLocationAdapter.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/infrastructure/location/ExpoLocationAdapter.ts): Adquisición de coordenadas GPS.
   * [`PermissionsManager.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/infrastructure/permissions/PermissionsManager.ts): Manejo de permisos nativos.
   * [`MemoryMeasurementRepository.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/infrastructure/persistence/MemoryMeasurementRepository.ts): Repositorio desacoplado.
3. **Capa de Presentación (`src/presentation/`):**
   * **Estado Reactivo:** [`useNetworkStore.ts`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/state/useNetworkStore.ts) (Zustand).
   * **Navegación:** [`AppNavigator.tsx`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/navigation/AppNavigator.tsx) (Bottom Tabs: Inicio, Resultados, Mapa, Historial).
   * **Pantallas:**
     * [`DashboardScreen.tsx`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/screens/DashboardScreen.tsx): Dashboard de telemetría y disparador de medición.
     * [`ResultsScreen.tsx`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/screens/ResultsScreen.tsx): Lectura detallada de RTT, Jitter, Pérdida y Throughput.
     * [`MapScreen.tsx`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/screens/MapScreen.tsx): Visualización de cobertura y heatmap.
     * [`HistoryScreen.tsx`](file:///c:/Users/Agus/Documents/Facu/4%20App%20Movil/TP5%20Network_QoS_Monitor/src/presentation/screens/HistoryScreen.tsx): Historial cronológico con exportación a CSV y JSON.

---

## 🚀 Puesta en Marcha

### 1. Aplicación Móvil
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo Metro / Expo
npm start

# Ejecutar en Android (simulador o dispositivo con depuración USB)
npm run android

# Ejecutar en iOS (requiere macOS)
npm run ios
```

### 2. Backend de Referencia para Throughput (Docker)
```bash
cd backend

# Opción A: Con Docker Compose (Recomendado)
docker compose up -d

# Opción B: Con Node.js localmente
npm install
npm run dev
```
El servidor quedará escuchando en `http://localhost:3000` con los endpoints `/download` y `/upload`.

---

## 📊 Matriz de Cumplimiento de Requisitos

* [x] **RF-01**: Detección de tipo de red activa (Wi-Fi, 4G, 5G) y operador.
* [x] **RF-02**: Medición de RTT (min/avg/max/jitter) contra ≥3 hosts configurables.
* [x] **RF-03**: Test de Throughput (descarga/subida en Mbps) contra backend de referencia.
* [x] **RF-04**: Registro georreferenciado con timestamp y coordenadas GPS.
* [x] **RF-05**: Visualización de cobertura y mapa con heatmap de intensidad.
* [x] **RF-06**: Gráficos temporales y métricas de retardo por sesión.
* [x] **RF-07**: Especificación de muestreo en background y notificaciones de degradación.
* [x] **RF-08**: Exportación del historial a formatos CSV y JSON.
* [x] **RF-09**: Filtros por red y fecha en historial.
