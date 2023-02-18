import {BatteryLevel} from '../battery.service';

export {};

declare global {
  interface Window {
    battery: {
      onUpdate: (callback: (batteryLevel: BatteryLevel) => void) => void;
    };
  }
}
