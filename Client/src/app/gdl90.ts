// tslint:disable:no-bitwise

type JsonElement = JsonObject | Array<JsonElement> | string | number | boolean | null;

interface JsonObject {
  [key: string]: JsonElement;
}

class CyclicRedundancyCheck {
  private crcTable: Uint16Array = new Uint16Array(256);

  constructor() {
    for (let i = 0; i < 256; ++i) {
      let crc = (i << 8) & 0xffff;
      for (let bitCtr = 0; bitCtr < 8; ++bitCtr) {
        const poly = ((crc & 0x8000) ? 0x1021 : 0);
        crc = ((crc << 1) & 0xffff) ^ poly;
      }
      this.crcTable[i] = crc;
    }
  }

  isValid(message: Uint8Array, crc: Uint8Array): boolean {
    const computedCrc = this.compute(message);
    if (crc.length !== computedCrc.length || crc[0] !== computedCrc[0] || crc[1] !== computedCrc[1]) {
      console.error('CRC did not match', crc, computedCrc);
      return false;
    }
    return true;
  }

  private compute(buffer: Uint8Array): Uint8Array {
    const crcArray = new Uint8Array(2);
    let crc = 0;
    for (const byte of buffer) {
      const m = (crc << 8) & 0xffff;
      crc = this.crcTable[crc >> 8] ^ m ^ byte;
    }
    crcArray[0] = crc & 0x00ff;
    crcArray[1] = (crc & 0xff00) >> 8;
    return crcArray;
  }
}

export class GDL90 {
  private static readonly flagByte = 0x7e;
  private static readonly controlEscape = 0x7e;
  private static readonly xorCharacter = 0x20;
  private static readonly latLongIncrement = 180.0 / (1 << 23);
  private static readonly crc = new CyclicRedundancyCheck();

  static decode(buffer: ArrayBuffer): JsonObject {
    const bytes = new Uint8Array(buffer);

    if (bytes.length < 2) {
      throw new Error('Invalid data (Too Short): ' + this.debug(bytes));
    }

    if (bytes[0] !== this.flagByte) {
      throw new Error('Invalid data (Missing Start Flag Byte): ' + this.debug(bytes));
    }

    if (bytes[bytes.length - 1] !== this.flagByte) {
      throw new Error('Invalid data (Missing End Flag Byte): ' + this.debug(bytes));
    }

    const message = this.unescape(bytes.slice(1, -1));
    return this.decodeMessage(message);
  }

  public static toHexString(buffer: Uint8Array) {
    return [...buffer].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  static test() {
    // console.log('unescape1', unescape(new Uint8Array([ 0x7E, 0x02, 0x7D, 0x5E ])));
    // console.log('unescape2', unescape(new Uint8Array([ 0x7E, 0x03, 0x7D, 0x5D ])));
    // console.log('unescape3', unescape(new Uint8Array([ 0x7D, 0x5D, 0x7D, 0x5E, 0x7E ])));
    //
    // const heartbeatData = new Uint8Array([
    //     0x7E, 0x00, 0x81, 0x41, 0xDB, 0xD0, 0x08, 0x02, 0xB3, 0x8B, 0x7E
    // ]).buffer;
    // const heartbeatMessage = decode(heartbeatData);
    // decodeMessage(heartbeatMessage);
    //
    // const trafficReport1 = new Uint8Array([
    //     // 0     1     2     3     4     5     6     7     8     9    10    11    12    13
    //     0x14, 0x10, 0xaa, 0x27, 0x44, 0x1b, 0xc8, 0x6e, 0xbc, 0xb8, 0xde, 0x07, 0x79, 0x8a,
    //     // 14   15    16    17    18    19    20    21    22    23    24    25    26    27
    //     0x08, 0x0f, 0xec, 0x0d, 0x02, 0x4e, 0x37, 0x35, 0x33, 0x58, 0x4a, 0x00, 0x00, 0x00,
    //     // 0     1
    //     0x1a, 0xc2
    // ]);
    // decodeMessage(trafficReport1);
    //
    // const trafficReport2 = new Uint8Array([
    //     0x14, 0x00, 0xAB, 0x45, 0x49, 0x1F, 0xEF, 0x15, 0xA8, 0x89, 0x78, 0x0F, 0x09, 0xA9,
    //     0x07, 0xB0, 0x01, 0x20, 0x01, 0x4E, 0x38, 0x32, 0x35, 0x56, 0x20, 0x20, 0x20, 0x00,
    //     0x57, 0xd6
    // ]);
    // decodeMessage(trafficReport2);
    //
    // const ga = new Uint8Array([ 0x0b, 0x00, 0xaf, 0x00, 0x0a, 0xfe, 0xb4 ]);
    // decodeMessage(ga);
    //
    // const leAHRS = new Uint8Array([
    //     0x4c, 0x45, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    //     0x00, 0x00, 0x00, 0x00, 0x7f, 0xff, 0xff, 0xff, 0x7f, 0xff, 0x7f, 0xff,
    //     0xb7, 0x49
    // ]);
    // decodeMessage(leAHRS);
    //
    // const ownshipReport = new Uint8Array([
    //     0x0a, 0x01, 0xf0, 0x00, 0x00, 0x1b, 0xc3, 0x6f, 0xbc, 0xbd, 0x77, 0xff, 0xf0, 0x88,
    //     0x00, 0x08, 0x00, 0x00, 0x01, 0x53, 0x74, 0x72, 0x61, 0x74, 0x75, 0x78, 0x00, 0x00,
    //     0, 0
    // ]);
    // decodeMessage(ownshipReport);
  }

  private static decodeMessage(rawMessage: Uint8Array): JsonObject {

    const frameCheckSequence = rawMessage.slice(-2);
    const message = rawMessage.slice(0, -2);
    if (!this.crc.isValid(message, frameCheckSequence)) {
      return {
        error: 'Invalid CRC',
        message: this.debug(message),
        frameCheckSequence: this.debug(frameCheckSequence)
      };
    }

    const messageId = message[0];
    if (messageId === 0x53 && message[1] === 0x58) {
      return this.decodeSX(message);
    }
    if (messageId === 0x4c && message[1] === 0x45) {
      return this.decodeLE(message);
    }
    if (messageId === 0xcc) {
      return this.decodeStratux(message);
    }
    if (messageId === 0x65 && message[1] === 0) {
      return this.decodeForeFlightId(message);
    }
    if (messageId === 0x65 && message[1] === 1) {
      return this.decodeForeFlightAHRS(message);
    }

    // GDL 90 Spec
    switch (messageId) {
      case 0x00: // Heartbeat
        return this.decodeHeartbeat(message);
      case 0x07: // Uplink Data
        return this.decodeUplinkData(message);
      case 0x0A: // Ownship Report
        return this.decodeTrafficReport(message);
      case 0x0B: // Ownship Geometric Altitude
        return this.decodeGeometricAltitude(message);
      case 0x14: // Traffic Report
        return this.decodeTrafficReport(message);
      default:
        console.log('unrecognized messageId', messageId, this.debug(message), this.debug(frameCheckSequence));
        return {warning: 'unrecognized messageId', messageId};
    }
  }

  private static toString(buffer: Uint8Array) {
    return [...buffer].map(b => String.fromCharCode(b)).join('');
  }

  private static debug(buffer: Uint8Array) {
    return [...buffer].map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ');
  }

  private static toBitArray(byte): boolean[] {
    return [
      (byte & 0b10000000) !== 0,
      (byte & 0b01000000) !== 0,
      (byte & 0b00100000) !== 0,
      (byte & 0b00010000) !== 0,
      (byte & 0b00001000) !== 0,
      (byte & 0b00000100) !== 0,
      (byte & 0b00000010) !== 0,
      (byte & 0b00000001) !== 0
    ];
  }

  private static assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
      throw new Error(msg);
    }
  }

  private static unescape(message: Uint8Array) {
    // Look for all Control-Escape characters in the saved string. Discard each one found, and XOR the
    // following character with 0x20. The resulting character should equal either 0x7D or 0x7E.

    const i = message.indexOf(this.controlEscape);
    if (i < 0) {
      return message;
    }
    const validBytes = [this.controlEscape, this.flagByte];
    const head = message.slice(0, i);
    const byte = message[i + 1] ^ this.xorCharacter;
    this.assert(validBytes.includes(byte), 'Invalid byte: 0x' + byte.toString(16));
    const tail = this.unescape(message.slice(i + 2));

    const joined = new Uint8Array(head.length + 1 + tail.length);
    joined.set(head, 0);
    joined[i] = byte;
    joined.set(tail, i + 1);

    return joined;
  }

  private static decodeHeartbeat(message: Uint8Array) {
    if (message.length !== 7) {
      console.error('Invalid heartbeat message length.', this.debug(message));
    }
    console.log('message', this.debug(message));
    const byte1Value = message[1];
    console.log('byte1', byte1Value.toString(2).padStart(8, '0'));
    const byte2Value = message[2];
    console.log('byte2', byte2Value.toString(2).padStart(8, '0'));
    const [
      gpsPositionValid,
      maintenanceRequired,
      ident,
      addressType,
      gpsBatteryLow,
      receivingATCServices,
      /* reserved */,
      uatInitialized
    ] = this.toBitArray(byte1Value);

    const [
      timeStampMSB,
      csaRequested,
      csaNotAvailable,
      /* reserved */,
      /* reserved */,
      /* reserved */,
      /* reserved */,
      utcOK
    ] = this.toBitArray(byte2Value);

    const heartbeat = {
      messageId: message[0],
      byte1: {
        gpsPositionValid,
        maintenanceRequired,
        ident,
        addressType,
        gpsBatteryLow,
        receivingATCServices,
        uatInitialized
      },
      byte2: {
        timeStampMSB,
        csaRequested,
        csaNotAvailable,
        utcOK
      },
      timeStamp: 0,
      uplinkCount: 0,
      basicLongCount: 0
    };

    heartbeat.timeStamp = new DataView(message.slice(3, 5).buffer).getUint16(0, true);
    if (heartbeat.byte2.timeStampMSB) {
      heartbeat.timeStamp += (1 << 16);
    }

    heartbeat.uplinkCount = (message[5] & 0b11111000) >> 3;
    heartbeat.basicLongCount = ((message[5] & 0b00000011) << 8) + message[6];


    console.log('heartbeat', heartbeat);
    return {heartbeat};
  }

  private static decodeStratux(message: Uint8Array) {
    console.log('message', this.debug(message));

    console.log('byte1', message[1].toString(2).padStart(8, '0'));

    const stratuxHeartbeat = {
      messageId: message[0],
      isGPSValid: (message[1] & 0x02) !== 0,
      isAHRSValid: (message[1] & 0x01) !== 0,
      protocolVersion: (message[1] & 0b11111100) >> 2
    };
    console.log('stratuxHeartbeat', stratuxHeartbeat);
    return {stratuxHeartbeat};
  }

  private static decodeSX(message: Uint8Array) {
    //    0    1
    // 0x53 0x58
    //    2    3
    // 0x01 0x01
    //    4    5    6    7
    // 0x01 0x06 0x02 0x01
    //    8    9   10   11
    // 0xff 0xff 0xff 0xff
    //   12   13
    // 0x01 0xf0
    //   14   15
    // 0x00 0x02
    //   16   17   18   19   20   21   22   23   24   25
    // 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x01
    //   26   27   28
    // 0x02 0x3e 0x00
    const messageId = this.toString(message.slice(0, 2));
    const statusMessage = message[2];
    const version = message[3];
    const versionType = (() => {
      switch (message[6]) {
        case 0:
          return '.';
        case 1:
          return 'b';
        case 2:
          return 'r';
        case 3:
          return 'rc';
      }
      return undefined;
    })();
    const firmwareVersion = `v${message[4]}.${message[5]}${versionType}${message[7]}`;
    const hardwareRevisionCode = this.toHexString(message.slice(8, 12));
    const isAHRSEnabled = (message[12] & 0x0001) !== 0;
    const [
      isGPSEnabled,
      is1090Enabled,
      is978Enabled,
      cpuTemperatureValid,
      pressureValid,
      ahrsValid,
      gpsWAAS,
      gps3D
    ] = this.toBitArray(message[13]);
    const devices = message[15] & 0x3;
    const imuConnected = (message[15] & 0x4) !== 0;
    const satellites = {
      locked: message[16],
      connected: message[17]
    };
    const numberOf978TrafficTargets = new DataView(message.slice(18, 20).buffer).getUint16(0);
    const numberOf1090TrafficTargets = new DataView(message.slice(20, 22).buffer).getUint16(0);
    const numberOf978MessagesPerMinute = new DataView(message.slice(22, 24).buffer).getUint16(0);
    const numberOf1090MessagePerMinute = new DataView(message.slice(24, 26).buffer).getUint16(0);
    const cpuTemperature = (new DataView(message.slice(26, 28).buffer).getInt16(0)) / 10.0;
    const towers = [];
    const numberOfTowers = message[28];
    const end = 29 + (6 * numberOfTowers);
    for (let i = 29; i < end; i += 6) {
      const latitude = this.getLatLong(message.slice(i, i + 3));
      const longitude = this.getLatLong(message.slice(i + 3, i + 6));
      towers.push({latitude, longitude});
    }
    console.log('message', this.debug(message));
    const stratuxStatus = {
      messageId,
      statusMessage,
      version,
      firmwareVersion,
      hardwareRevisionCode,
      flags: {
        isAHRSEnabled,
        isGPSEnabled,
        is1090Enabled,
        is978Enabled,
        cpuTemperatureValid,
        pressureValid,
        ahrsValid,
        gpsWAAS,
        gps3D
      },
      hardware: {
        devices,
        imuConnected
      },
      satellites,
      numberOf978TrafficTargets,
      numberOf1090TrafficTargets,
      numberOf978MessagesPerMinute,
      numberOf1090MessagePerMinute,
      cpuTemperature,
      towers
    };
    console.log('stratuxStatus', stratuxStatus);
    return {stratuxStatus};
  }

  private static decodeForeFlightId(message: Uint8Array) {
    console.log('message', this.debug(message));
    const capabilitiesMask = new DataView(message.slice(35, 39).buffer).getUint32(0, false);
    console.log('capabilitiesMask', capabilitiesMask.toString(2).padStart(32, '0'));

    const foreFlightId = {
      messageId: message[0],
      messageSubId: message[1],
      version: message[2],
      serialNumber: this.toHexString(message.slice(3, 11)),
      name: this.toString(message.slice(11, 19)),
      longName: this.toString(message.slice(19, 35)),
      geometricAltitudeDatum: (capabilitiesMask & 1) !== 0 ? 'MSL' : 'WGS-84'
    };
    console.log('foreFlightId', foreFlightId);
    return {foreFlightId};
  }

  private static decodeForeFlightAHRS(message: Uint8Array) {
    const roll = new DataView(message.slice(2, 4).buffer).getUint16(0);
    const roll2 = new DataView(message.slice(2, 4).buffer).getInt16(0);
    const pitch = new DataView(message.slice(4, 6).buffer).getUint16(0);
    let heading = new DataView(message.slice(6, 8).buffer).getInt16(0);
    const magneticHeading = (heading & 0x8000) !== 0;
    heading &= 0x7FFF;
    const indicatedAirspeed = new DataView(message.slice(8, 10).buffer).getInt16(0);
    const trueAirspeed = new DataView(message.slice(10, 12).buffer).getInt16(0);

    const foreFlightAHRS = {
      messageId: message[0],
      messageSubId: message[1],
      roll, roll2, pitch, heading, magneticHeading, indicatedAirspeed, trueAirspeed
    };
    console.log('foreFlightAHRS', foreFlightAHRS);
    return {foreFlightAHRS};
  }

  private static getLatLong(b) {
    let val = (b[0] << 16) + (b[1] << 8) + b[2];

    if (val >= (1 << 23)) {
      val -= (1 << 24);
    }

    return val * 180.0 / (1 << 23);
  }

  private static decodeTrafficReport(message: Uint8Array) {
    console.log('message', this.debug(message));
    const messageId = message[0];

    //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27
    // st aa aa aa ll ll ll nn nn nn dd dm ia hh hv vv tt ee cc cc cc cc cc cc cc cc px

    // byte 1 bits: sssstttt
    // message[1] & 0xf0 = sssstttt & 0b11110000 = ssss0000
    // (message[1] & 0xf0) >> 4 = (ssss0000) >> 4 = 0000ssss
    const trafficAlertStatusCode = (message[1] & 0xf0) >> 4;
    const trafficAlertStatus = (() => {
      switch (trafficAlertStatusCode) {
        case 0:
          return 'No alert';
        case 1:
          return 'Traffic Alert';
      }
      return undefined;
    })();
    // byte 1 bits: sssstttt
    // message[1] & 0x0f = sssstttt & 0b00001111 = 0000tttt
    const addressTypeCode = message[1] & 0x0f;
    const addressType = (() => {
      switch (addressTypeCode) {
        case 0:
          return 'ADS-B with ICAO address';
        case 1:
          return 'ADS-B with Self-assigned address';
        case 2:
          return 'TIS-B with ICAO address';
        case 3:
          return 'TIS-B with track file ID.';
        case 4:
          return 'Surface Vehicle';
        case 5:
          return 'Ground Station Beacon';
      }
      return undefined;
    })();
    const participantAddress = [
      message[2], message[3], message[4]
    ].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    let latitude = (message[5] << 16) + (message[6] << 8) + message[7];
    if (latitude >= (1 << 23)) {
      latitude -= (1 << 24);
    }
    latitude = latitude * 180 / (1 << 23);

    let longitude = (message[8] << 16) + (message[9] << 8) + message[10];
    if (longitude >= (1 << 23)) {
      longitude -= (1 << 24);
    }
    longitude = longitude * 180 / (1 << 23);

    let altitude = (message[11] << 4) + ((message[12] & 0xf0) >> 4);
    if (altitude === 0xfff) {
      altitude = null;
    } else {
      altitude = (altitude - 40) * 25;
    }


    const misc = message[12] & 0x0f;
    const miscellaneousIndicators = {
      track: (() => {
        switch (misc & 0b0011) {
          case 0:
            return 'not valid';
          case 1:
            return 'True Track Angle';
          case 2:
            return 'Heading (Magnetic)';
          case 3:
            return 'Heading (True)';
        }
        return undefined;
      })(),
      report: misc & 0b0100 ? 'extrapolated' : 'updated',
      state: misc & 0b1000 ? 'airborne' : 'on ground'
    };

    const NIC = (message[13] & 0xf0) >> 4;
    const NACp = message[13] & 0x0f;
    const navigation = {
      integrity: (() => {
        switch (NIC) {
          case 0:
            return 'unknown';
          case 1:
            return '< 20.0 NM';
          case 2:
            return '< 8.0 NM';
          case 3:
            return '< 4.0 NM';
          case 4:
            return '< 2.0 NM';
          case 5:
            return '< 1.0 NM';
          case 6:
            return '< 0.6 NM';
          case 7:
            return '< 0.2 NM';
          case 8:
            return '< 0.1 NM';
          case 9:
            return 'HPL < 75 m & VPL < 112 m';
          case 10:
            return 'HPL < 25 m & VPL < 37.5 m';
          case 11:
            return 'HPL < 7.5 m & VPL < 11 m';
        }
        return undefined;
      })(),
      accuracy: (() => {
        switch (NACp) {
          case 0:
            return 'unknown';
          case 1:
            return '< 10.0 NM';
          case 2:
            return '< 4.0 NM';
          case 3:
            return '< 2.0 NM';
          case 4:
            return '< 1.0 NM';
          case 5:
            return '< 0.5 NM';
          case 6:
            return '< 0.3 NM';
          case 7:
            return '< 0.1 NM';
          case 8:
            return '< 0.05 NM';
          case 9:
            return 'HFOM < 30 m & VFOM < 45 m';
          case 10:
            return 'HFOM < 10 m & VFOM < 15 m';
          case 11:
            return 'HFOM < 3 m & VFOM < 4 m';
        }
        return undefined;
      })()
    };

    let horizontalVelocity = (message[14] << 4) + ((message[15] & 0xf0) >> 4);
    if (horizontalVelocity === 0xfff) {
      horizontalVelocity = null;
    }

    let verticalVelocity = ((message[15] & 0x0f) << 8) + message[16];
    if (verticalVelocity === 0x800) {
      verticalVelocity = null;
    } else if (verticalVelocity > 0x800) {
      verticalVelocity -= 0x1000;
    }
    if (verticalVelocity) {
      verticalVelocity *= 64;
    }
    const track = message[17] * 360.0 / 256;
    const emitterCategory = (() => {
      switch (message[18]) {
        case 0:
          return 'No aircraft type information';
        case 1:
          return 'Light (ICAO) < 15,500 lbs';
        case 2:
          return 'Small - 15,500 to 75,000 lbs';
        case 3:
          return 'Large - 75,000 to 300,000 lbs';
        case 4:
          return 'High Vortex Large (e.g., aircraft such as B757)';
        case 5:
          return 'Heavy (ICAO) - > 300,000 lbs';
        case 6:
          return 'Highly Maneuverable > 5G acceleration and high speed';
        case 7:
          return 'Rotorcraft';
        case 8:
          return '(Unassigned)';
        case 9:
          return 'Glider/sailplane';
        case 10:
          return 'Lighter than air';
        case 11:
          return 'Parachutist/sky diver';
        case 12:
          return 'Ultra light/hang glider/paraglider';
        case 13:
          return '(Unassigned)';
        case 14:
          return 'Unmanned aerial vehicle';
        case 15:
          return 'Space/transatmospheric vehicle';
        case 16:
          return '(Unassigned)';
        case 17:
          return 'Surface vehicle — emergency vehicle';
        case 18:
          return 'Surface vehicle — service vehicle';
        case 19:
          return 'Point Obstacle (includes tethered balloons)';
        case 20:
          return 'Cluster Obstacle';
        case 21:
          return 'Line Obstacle';
      }
      return undefined;
    })();
    const callSign = this.toString(message.slice(19, 27));
    const priorityCode = (message[27] & 0xf0) >> 4;

    const priority = (() => {
      switch (priorityCode) {
        case 0:
          return 'no emergency';
        case 1:
          return 'general emergency';
        case 2:
          return 'medical emergency';
        case 3:
          return 'minimum fuel';
        case 4:
          return 'no communication';
        case 5:
          return 'unlawful interference';
        case 6:
          return 'downed aircraft';
      }
      if (priorityCode >= 7 && priorityCode <= 15) {
        return 'reserved';
      }
      return undefined;
    })();

    const report = {
      messageId,
      trafficAlertStatus,
      addressType,
      participantAddress,
      latitude,
      longitude,
      altitude,
      miscellaneousIndicators,
      navigation,
      horizontalVelocity,
      verticalVelocity,
      track,
      emitterCategory,
      callSign,
      priority
    };

    if (messageId === 0x0A) {
      console.log('ownshipReport', report);
      return {ownshipReport: report};
    } else {
      console.log('trafficReport', report);
      return {trafficReport: report};
    }

  }

  private static decodeUplinkData(message: Uint8Array) {
    console.log('message', this.debug(message));
    const messageId = message[0];
    const timeOfReception = message[1] + (message[2] << 8) + (message[3] << 16);
    const header = this.toHexString(message.slice(4, 8));
    const payload = this.toHexString(message.slice(8));
    const uplinkData = {
      messageId, timeOfReception, header, payload
    };
    console.log('uplinkData', uplinkData);
    return {uplinkData};
  }

  private static decodeGeometricAltitude(message: Uint8Array) {
    console.log('message', this.debug(message));
    const messageId = message[0];
    const altitude = (new DataView(message.slice(1, 3).buffer).getInt16(0)) * 5;
    let verticalFigureOfMerit = (message[3] << 8) + message[4];
    const verticalWarning = (verticalFigureOfMerit & 0x8000) !== 0;
    verticalFigureOfMerit = verticalFigureOfMerit & 0x7fff;
    const geometricAltitude = {
      messageId,
      altitude,
      verticalWarning,
      verticalFigureOfMerit
    };
    console.log('geometricAltitude', geometricAltitude);
    return {geometricAltitude};
  }

  private static decodeLE(message: Uint8Array) {
    console.log('message', this.debug(message));
    const messageId = this.toString(message.slice(0, 2));
    const statusMessage = message[2];
    const version = message[3];
    const invalidUnsigned = 0xffff;
    const invalidSigned = 0x7fff;
    let roll = new DataView(message.slice(4, 6).buffer).getInt16(0);
    if (roll === invalidSigned) {
      roll = null;
    } else {
      roll /= 10.0;
    }
    let pitch = new DataView(message.slice(6, 8).buffer).getInt16(0);
    if (pitch === invalidSigned) {
      pitch = null;
    } else {
      pitch /= 10.0;
    }
    let heading = new DataView(message.slice(8, 10).buffer).getInt16(0);
    if (heading === invalidSigned) {
      heading = null;
    } else {
      heading /= 10.0;
    }
    let slipSkip = new DataView(message.slice(10, 12).buffer).getInt16(0);
    if (slipSkip === invalidSigned) {
      slipSkip = null;
    } else {
      slipSkip /= -10.0;
    }
    let yawRate = new DataView(message.slice(12, 14).buffer).getInt16(0);
    if (yawRate === invalidSigned) {
      yawRate = null;
    } else {
      yawRate /= 10.0;
    }
    let gForce = new DataView(message.slice(14, 16).buffer).getInt16(0);
    if (gForce === invalidSigned) {
      gForce = null;
    } else {
      gForce /= 10.0;
    }
    let indicatedAirspeed = new DataView(message.slice(16, 18).buffer).getInt16(0);
    if (indicatedAirspeed === invalidSigned) {
      indicatedAirspeed = null;
    }
    let pressureAltitude = new DataView(message.slice(18, 20).buffer).getUint16(0);
    if (pressureAltitude === invalidUnsigned) {
      pressureAltitude = null;
    } else {
      pressureAltitude -= 5000.5;
    }
    let verticalSpeed = new DataView(message.slice(20, 22).buffer).getInt16(0);
    if (verticalSpeed === invalidSigned) {
      verticalSpeed = null;
    }
    let reserved = new DataView(message.slice(22, 24).buffer).getInt16(0);
    if (reserved === invalidSigned) {
      reserved = null;
    }
    const ahrs = {
      messageId, statusMessage, version,
      roll, pitch, heading, slipSkip, yawRate, gForce,
      indicatedAirspeed, pressureAltitude, verticalSpeed, reserved
    };
    console.log('ahrs', ahrs);

    return {ahrs};
  }
}

