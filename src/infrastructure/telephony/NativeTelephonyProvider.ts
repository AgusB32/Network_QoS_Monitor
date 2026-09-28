import { ITelephonyProvider } from '../../domain/contracts/ITelephonyProvider';
import { TelephonyCellInfo } from '../../domain/models/network';
import { NativeTelephony } from '../../../modules/telephony-info';
import { PermissionsManager } from '../permissions/PermissionsManager';

export class NativeTelephonyProvider implements ITelephonyProvider {
  public isSupported(): boolean {
    return true;
  }

  public async requestPermissions(): Promise<boolean> {
    return await PermissionsManager.requestPhoneState();
  }

  public async getCellInfo(): Promise<TelephonyCellInfo> {
    return await NativeTelephony.getCellularInfo();
  }
}
