// const sensor = require('node-dht-sensor');
const sensor = require('./FakeSensor.js');
// const Device = require('./Device.js');
const Device = require('./FakeDevice.js');

const DHT_SENSOR_PIN = 17;
const DHT_SENSOR_TYPE = 22;
const MIST_RELAY_PIN = 2;
const HEAT_RELAY_PIN = 3;
const COOL_RELAY_PIN = 4;
const FAN_RELAY_PIN = 5;

module.exports = class Controller {
  constructor(t, h, db) {
    this.target_temperature = t;
    this.target_humidity = h;

    this.current_temperature = 0;
    this.current_humidity = 0;

    this.database = db;

    this.mist = new Device('mist', MIST_RELAY_PIN, 'out');
    this.fan = new Device('fan', FAN_RELAY_PIN, 'out');
    this.heat = new Device('heat', HEAT_RELAY_PIN, 'out');
    this.cool = new Device('cool', COOL_RELAY_PIN, 'out');
    return this;
  }

  init() {
    this.heat.init();
    this.fan.init();
    this.heat.init();
    this.cool.init();
    this.mist.init();
    console.log(`Settings:\n` +
        `\tTemperature: ${this.target_temperature}\n` +
        `\tHumidity: ${this.target_humidity}\n`);
    return this;
  }

  processTemperature() {
    if (this.current_temperature < this.target_temperature) {
      this.heat.setOn();
      this.cool.setOff();
    } else if (this.current_temperature > this.target_temperature) {
      this.heat.setOff();
      this.cool.setOn();
    } else {
      this.heat.setOff();
      this.cool.setOff();
    }
    return this;
  }

  processHumidity() {
    if (this.current_humidity < this.target_humidity) {
      this.mist.setOn();
      this.fan.setOff();
    } else if (this.current_humidity > this.target_temmperature) {
      this.mist.setOff();
      this.fan.setOn();
    } else {
      this.mist.setOff();
      this.fan.setOff();
    }
    return this;
  }

  run() {
    sensor.read(DHT_SENSOR_TYPE, DHT_SENSOR_PIN, (err, t, h) => {
      if (err) {
        console.error('Error reading sensor not processing this round');
        return;
      }
      const d = new Date();
      const ho = d.getHours();
      const m = d.getMinutes();
      const ts = Date.now();
      this.database.parallelize(() => {
          this.database.run(`INSERT INTO temperature(ts, v) VALUES(${ts}, ${t})`)
                       .run(`INSERT INTO humidity(ts, v) VALUES(${ts}, ${h})`);
      });
      console.log(`${ho}:${m} Temperature: ${t} Humidity: ${h}`);
      this.current_temperature = t;
      this.current_humidity = h;
      this.processTemperature();
      this.processHumidity();
    });
    return this;
  }
}
