const GPIO = require("onoff").Gpio;

const ON = 1;
const OFF = 0;

module.exports = class Device {
  constructor(name, pin, type) {
    this.name = name;
    this.pin = pin;
    this.type = type;
    this.gpio = undefined;
    return this;
  }

  init() {
    console.log(`Initilizing device ${this.name} on pin ${this.pin} of type ${this.type}`);
    this.gpio = new GPIO(this.pin, this.type);
    return this;
  }

  _setState(state) {
    if (this.gpio.readSync() !== state) {
      console.log(`Device ${this.name} changing state to ${state}`);
      this.gpio.writeSync(state);
    }
    return this;
  }

  setOn() {
    return this._setState(ON);
  }

  setOff() {
    return this._setState(OFF);
  }
};
