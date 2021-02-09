import { AccessoryPlugin, Service, Categories } from 'homebridge'
import {
  AirConditionerModeCode,
  FanLevelCode,
  FanLevelCodeVolumeMapping,
  Specs
} from './XiaoMiAirConditionerMC5.constant'
import { MIoTDevice, MiIdentify, Shared } from 'homebridge-mi-devices'

type Props = {
  identify: MiIdentify
}

export class XiaoMiAirConditionerMC5 implements AccessoryPlugin {

  // Requirement
  private readonly name: string
  private readonly token: string
  private readonly address: string
  // Services
  private readonly informationService: Service
  private readonly AirConditionerService: Service
  private readonly AirConditionerECOModeService: Service
  private readonly AirConditionerHeaterModeService: Service
  // private readonly AirConditionerDryerModeService: Service
  // private readonly AirConditionerSleepModeService: Service
  // Device
  private AirConditionerDevice: MIoTDevice

  constructor (props: Props) {
    // Requirement
    this.name = props.identify.name
    this.token = props.identify.token
    this.address = props.identify.address
    // Information
    this.informationService = new Shared.hap.Service.AccessoryInformation()
      .setCharacteristic(Shared.hap.Characteristic.Category, Categories.AIR_CONDITIONER)
      .setCharacteristic(Shared.hap.Characteristic.Manufacturer, 'XiaoMi')
      .setCharacteristic(Shared.hap.Characteristic.Model, 'MC5')
    // AirConditioner
    this.AirConditionerService = new Shared.hap.Service.HeaterCooler(props.identify.name)
    this.AirConditionerDevice = new MIoTDevice({ ...props, service: this.AirConditionerService, specs: Specs })
    this.AirConditionerSetup()
    // AirConditioner: Extra Modes
    this.AirConditionerECOModeService = new Shared.hap.Service.Switch(`${props.identify.name}.ECOMode`)
    this.AirConditionerECOModeSetup(this.AirConditionerECOModeService)
    this.AirConditionerHeaterModeService = new Shared.hap.Service.Switch(`${props.identify.name}.HeaterMode`)
    this.AirConditionerHeaterModeSetup(this.AirConditionerHeaterModeService)
    // this.AirConditionerDryerModeService = new Shared.hap.Service.Switch(`${props.identify.name}.DryerMode`)
    // this.AirConditionerDryerModeSetup(this.AirConditionerDryerModeService)
    // this.AirConditionerSleepModeService = new Shared.hap.Service.Switch(`${props.identify.name}.SleepMode`)
    // this.AirConditionerSleepModeSetup(this.AirConditionerSleepModeService)
  }

  AirConditionerSetup = () => {
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.Active, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.AirConditionerSwitchStatus.name] ? 1 : 0
      },
      set: {
        property: Specs.AirConditionerSwitchStatus.name,
        formatter: (value) => value === 1
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.CurrentHeaterCoolerState, {
      get: {
        formatter: (valueMapping) => {
          if (!valueMapping[Specs.AirConditionerSwitchStatus.name]) return 0
          return valueMapping[Specs.AirConditionerMode.name] === AirConditionerModeCode.Heat ? 2 : 3
        }
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.TargetHeaterCoolerState, {
      get: {
        formatter: (valueMapping) => {
          if (!valueMapping[Specs.AirConditionerSwitchStatus.name]) return 0
          return valueMapping[Specs.AirConditionerMode.name] === AirConditionerModeCode.Heat ? 1 : 2
        }
      },
      set: {
        property: Specs.AirConditionerMode.name,
        formatter: (value) => value === 1 ? AirConditionerModeCode.Heat : AirConditionerModeCode.Cool
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.CurrentTemperature, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.EnvironmentTemperature.name]
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.CoolingThresholdTemperature, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.AirConditionerTargetTemperature.name]
      },
      set: {
        property: Specs.AirConditionerTargetTemperature.name,
        formatter: (value) => value as number
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.HeatingThresholdTemperature, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.AirConditionerTargetTemperature.name]
      },
      set: {
        property: Specs.AirConditionerTargetTemperature.name,
        formatter: (value) => value as number
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.SwingMode, {
      get: {
        formatter: (valueMapping) => valueMapping[Specs.FanVerticalSwing.name] ? 1 : 0
      },
      set: {
        property: Specs.FanVerticalSwing.name,
        formatter: (value) => value === 1
      },
    })
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.RotationSpeed, {
      get: {
        formatter: (valueMapping) =>  FanLevelCodeVolumeMapping[valueMapping[Specs.FanLevel.name] as FanLevelCode]
      },
      set: {
        property: Specs.FanVerticalSwing.name,
        formatter: (value) => {
          if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Auto]) {
            return FanLevelCode.Auto
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level1]) {
            return FanLevelCode.Level1
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level2]) {
            return FanLevelCode.Level2
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level3]) {
            return FanLevelCode.Level3
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level4]) {
            return FanLevelCode.Level4
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level5]) {
            return FanLevelCode.Level5
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level6]) {
            return FanLevelCode.Level6
          } else if (value <= FanLevelCodeVolumeMapping[FanLevelCode.Level7]) {
            return FanLevelCode.Level7
          }
          return FanLevelCode.Auto
        }
      },
    })
  }
  AirConditionerECOModeSetup = (service: Service) => {
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.On, {
      service,
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirConditionerECOMode.name] ? 1 : 0
      },
      set: {
        property: Specs.AirConditionerECOMode.name,
        formatter: (value) => !!value
      },
    })
  }
  AirConditionerHeaterModeSetup = (service: Service) => {
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.On, {
      service,
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirConditionerHeaterMode.name] ? 1 : 0
      },
      set: {
        property: Specs.AirConditionerHeaterMode.name,
        formatter: (value) => !!value
      },
    })
  }
  AirConditionerDryerModeSetup = (service: Service) => {
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.On, {
      service,
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirConditionerDryerMode.name] ? 1 : 0
      },
      set: {
        property: Specs.AirConditionerDryerMode.name,
        formatter: (value) => !!value
      },
    })
  }
  AirConditionerSleepModeSetup = (service: Service) => {
    this.AirConditionerDevice.addCharacteristicListener(Shared.hap.Characteristic.On, {
      service,
      get: {
        formatter: (valueMapping) =>
          valueMapping[Specs.AirConditionerSleepMode.name] ? 1 : 0
      },
      set: {
        property: Specs.AirConditionerSleepMode.name,
        formatter: (value) => !!value
      },
    })
  }

  /*
   * This method is optional to implement. It is called when HomeKit ask to identify the accessory.
   * Typical this only ever happens at the pairing process.
   */
  identify (): void {
    Shared.log.info(`Identifying ${this.name} ${this.address}`)
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices (): Service[] {
    return [
      this.informationService,
      this.AirConditionerService,
      this.AirConditionerECOModeService,
      this.AirConditionerHeaterModeService,
      // this.AirConditionerDryerModeService,
      // this.AirConditionerSleepModeService,
    ]
  }

}
