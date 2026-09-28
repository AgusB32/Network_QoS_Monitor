package expo.modules.telephonyinfo

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.telephony.*
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TelephonyInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TelephonyInfo")

    AsyncFunction("isSupported") {
      true
    }

    AsyncFunction("getCellularInfo") {
      val context = appContext.reactContext ?: return@AsyncFunction mapOf(
        "carrierName" to null,
        "networkType" to "UNKNOWN",
        "rssiDbm" to null
      )

      val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager
        ?: return@AsyncFunction mapOf(
          "carrierName" to null,
          "networkType" to "UNKNOWN",
          "rssiDbm" to null
        )

      // Obtener nombre del operador móvil
      val carrierName = telephonyManager.networkOperatorName.takeIf { it.isNotBlank() }
        ?: telephonyManager.simOperatorName.takeIf { it.isNotBlank() }

      val isRoaming = telephonyManager.isNetworkRoaming

      // Identificar tipo de red celular (2G, 3G, 4G, 5G)
      val networkType = determineNetworkType(telephonyManager, context)

      // Obtener telemetría de señal (RSSI, RSRP, Cell ID)
      val signalData = extractSignalMetrics(telephonyManager, context)

      return@AsyncFunction mapOf(
        "carrierName" to carrierName,
        "networkType" to networkType,
        "rssiDbm" to signalData["rssiDbm"],
        "rsrpDbm" to signalData["rsrpDbm"],
        "rsrqDb" to signalData["rsrqDb"],
        "cellId" to signalData["cellId"],
        "tac" to signalData["tac"],
        "mcc" to signalData["mcc"],
        "mnc" to signalData["mnc"],
        "isRoaming" to isRoaming
      )
    }
  }

  private fun determineNetworkType(telephonyManager: TelephonyManager, context: Context): String {
    val hasPhoneStatePermission = ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.READ_PHONE_STATE
    ) == PackageManager.PERMISSION_GRANTED

    val rawType = if (hasPhoneStatePermission && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      try {
        telephonyManager.dataNetworkType
      } catch (e: SecurityException) {
        telephonyManager.networkType
      }
    } else {
      telephonyManager.networkType
    }

    return when (rawType) {
      TelephonyManager.NETWORK_TYPE_NR -> "5G_NR"
      TelephonyManager.NETWORK_TYPE_LTE -> "4G_LTE"
      TelephonyManager.NETWORK_TYPE_HSPAP,
      TelephonyManager.NETWORK_TYPE_HSPA,
      TelephonyManager.NETWORK_TYPE_HSDPA,
      TelephonyManager.NETWORK_TYPE_HSUPA,
      TelephonyManager.NETWORK_TYPE_UMTS -> "3G"
      TelephonyManager.NETWORK_TYPE_GPRS,
      TelephonyManager.NETWORK_TYPE_EDGE,
      TelephonyManager.NETWORK_TYPE_CDMA -> "2G"
      else -> "UNKNOWN"
    }
  }

  private fun extractSignalMetrics(
    telephonyManager: TelephonyManager,
    context: Context
  ): Map<String, Any?> {
    val result = mutableMapOf<String, Any?>(
      "rssiDbm" to null,
      "rsrpDbm" to null,
      "rsrqDb" to null,
      "cellId" to null,
      "tac" to null,
      "mcc" to null,
      "mnc" to null
    )

    val hasFineLocation = ContextCompat.checkSelfPermission(
      context,
      Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    if (!hasFineLocation) {
      return result
    }

    try {
      val cellInfos = telephonyManager.allCellInfo ?: return result
      for (cellInfo in cellInfos) {
        if (!cellInfo.isRegistered) continue

        when (cellInfo) {
          is CellInfoLte -> {
            val signal = cellInfo.cellSignalStrength
            val identity = cellInfo.cellIdentity
            result["rssiDbm"] = signal.dbm
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
              result["rsrpDbm"] = signal.rsrp
              result["rsrqDb"] = signal.rsrq
            }
            result["cellId"] = identity.ci.takeIf { it != Int.MAX_VALUE }
            result["tac"] = identity.tac.takeIf { it != Int.MAX_VALUE }
            result["mcc"] = identity.mccString
            result["mnc"] = identity.mncString
            return result
          }
          is CellInfoNr -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
              val signal = cellInfo.cellSignalStrength as? CellSignalStrengthNr
              val identity = cellInfo.cellIdentity as? CellIdentityNr
              result["rssiDbm"] = signal?.dbm
              result["rsrpDbm"] = signal?.ssRsrp
              result["rsrqDb"] = signal?.ssRsrq
              result["cellId"] = identity?.nci?.takeIf { it != Long.MAX_VALUE }
              result["tac"] = identity?.tac?.takeIf { it != Int.MAX_VALUE }
              result["mcc"] = identity?.mccString
              result["mnc"] = identity?.mncString
              return result
            }
          }
          is CellInfoWcdma -> {
            val signal = cellInfo.cellSignalStrength
            val identity = cellInfo.cellIdentity
            result["rssiDbm"] = signal.dbm
            result["cellId"] = identity.cid.takeIf { it != Int.MAX_VALUE }
            result["mcc"] = identity.mccString
            result["mnc"] = identity.mncString
            return result
          }
          is CellInfoGsm -> {
            val signal = cellInfo.cellSignalStrength
            val identity = cellInfo.cellIdentity
            result["rssiDbm"] = signal.dbm
            result["cellId"] = identity.cid.takeIf { it != Int.MAX_VALUE }
            result["mcc"] = identity.mccString
            result["mnc"] = identity.mncString
            return result
          }
        }
      }
    } catch (e: Exception) {
      // Ignorar excepciones de seguridad o hardware sin cobertura
    }

    return result
  }
}
