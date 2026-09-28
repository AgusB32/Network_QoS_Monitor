import ExpoModulesCore
import CoreTelephony

public class TelephonyInfoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TelephonyInfo")

    AsyncFunction("isSupported") { () -> Bool in
      return true
    }

    AsyncFunction("getCellularInfo") { () -> [String: Any?] in
      let networkInfo = CTTelephonyNetworkInfo()
      var carrierName: String? = nil
      var networkType: String = "UNKNOWN"
      var mcc: String? = nil
      var mnc: String? = nil

      // Obtener proveedor celular activo
      if let providers = networkInfo.serviceSubscriberCellularProviders {
        for (_, carrier) in providers {
          if let name = carrier.carrierName, !name.isEmpty {
            carrierName = name
            mcc = carrier.mobileCountryCode
            mnc = carrier.mobileNetworkCode
            break
          }
        }
      }

      // Obtener tecnología de acceso de radio (RAT)
      if let currentTechs = networkInfo.serviceCurrentRadioAccessTechnology {
        for (_, tech) in currentTechs {
          switch tech {
          case CTRadioAccessTechnologyNR, CTRadioAccessTechnologyNRNSA:
            networkType = "5G_NR"
          case CTRadioAccessTechnologyLTE:
            networkType = "4G_LTE"
          case CTRadioAccessTechnologyWCDMA,
               CTRadioAccessTechnologyHSDPA,
               CTRadioAccessTechnologyHSUPA:
            networkType = "3G"
          case CTRadioAccessTechnologyEdge,
               CTRadioAccessTechnologyGPRS:
            networkType = "2G"
          default:
            networkType = "UNKNOWN"
          }
          if networkType != "UNKNOWN" {
            break
          }
        }
      }

      // En iOS público no es posible acceder a RSSI en dBm por restricciones de sandbox
      return [
        "carrierName": carrierName,
        "networkType": networkType,
        "rssiDbm": nil,
        "rsrpDbm": nil,
        "rsrqDb": nil,
        "cellId": nil,
        "tac": nil,
        "mcc": mcc,
        "mnc": mnc,
        "isRoaming": false
      ]
    }
  }
}
