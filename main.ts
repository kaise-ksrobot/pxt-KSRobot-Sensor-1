//% color=#ff4b4b icon="\uf0ee" block="KSRobot_Sensor"
namespace KSRobot_Sensor {

    let _temperature: number = -999.0
    let _humidity: number = -999.0
    let _readSuccessful: boolean = false

    export enum DHT_type {
        //% blockId="DHT11" block="DHT11"
        DHT11,
        //% blockId="DHT22" block="DHT22"
        DHT22,
    }

    export enum DHT_State {
        //% blockId="Celsius" block="Celsius"
        Celsius,
        //% blockId="Fahrenheit" block="Fahrenheit"
        Fahrenheit,
        //% blockId="Humidity" block="Humidity"
        Humidity,
    }


    //% blockId="KSRobot_dht11" block="DHT set %dht_type pin %dataPin|get %dhttype"
    export function dht_readdata(dht_type: DHTtype, dataPin: DigitalPin, dhttype: DHT_State): number {
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        let checksum: number = 0
        let checksumTmp: number = 0

        basic.pause(500)
        pins.digitalWritePin(dataPin, 0)
        basic.pause(18)
        pins.setPull(dataPin, PinPullMode.PullUp);
        pins.digitalReadPin(dataPin)
        control.waitMicros(40)

        while (pins.digitalReadPin(dataPin) == 1);
        while (pins.digitalReadPin(dataPin) == 0);
        while (pins.digitalReadPin(dataPin) == 1);
        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            control.waitMicros(28)
            //if sensor still pull up data pin after 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
        }



        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        if (checksum == checksumTmp) _readSuccessful = true

        //read data if checksum ok
        if (_readSuccessful) {
            if (dht_type == DHT_type.DHT11) {
                //DHT11
                _humidity = resultArray[0] + resultArray[1] / 100
                _temperature = resultArray[2] + resultArray[3] / 100
            } else {
                //DHT22
                let temp_sign: number = 1
                if (resultArray[2] >= 128) {
                    resultArray[2] -= 128
                    temp_sign = -1
                }
                _humidity = (resultArray[0] * 256 + resultArray[1]) / 10
                _temperature = (resultArray[2] * 256 + resultArray[3]) / 10 * temp_sign
            }
           
                
        }


        switch (dhttype) {
            case DHT_State.Celsius:

                return _temperature;
                break;

            case DHT_State.Fahrenheit:

                return _temperature = _temperature * 9 / 5 + 32;
                break;

            case DHT_State.Humidity:

                return _humidity;
                break;

            default:
                return 0;
        }

    }



}
