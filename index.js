const Controller = require('./Controller.js');
const sqlite3 = require('sqlite3').verbose();
const express = require('express');

const PORT = 8000;
const INTERVAL = 1000;
const TEMPERATURE = 24;
const HUMIDITY = 60;

function init_database() {
  let db = new sqlite3.Database('./db.sqlite3');
  db.parallelize(() => {
      db.run('CREATE TABLE IF NOT EXISTS temperature(ts integer, v integer)')
        .run('CREATE TABLE IF NOT EXISTS humidity(ts integer, v integer)');
  });
  return db;
}

function init_controller(db) {
  const c = new Controller(TEMPERATURE, HUMIDITY, db);
  c.init();
  return c;
}

function init_app(db) {
  const app = express();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  app.get("/", (req, res, next) => {
    db.all('SELECT * FROM temperature ORDER BY ts DESC LIMIT 24', (err, temperature) => {
      if (err) throw err;
      temperature = temperature.reverse();
      db.all('SELECT * FROM humidity ORDER BY ts DESC LIMIT 24', (err, humidity) => {
        if (err) throw err;
        humidity = humidity.reverse();
        res.render('index.ejs', {
          data: {
            temperature: temperature.reverse().map(x => x.v),
            ts_temperature: temperature.reverse().map(x => x.ts),
            humidity: humidity.reverse().map(x => x.v),
            ts_humidity: humidity.reverse().map(x => x.ts),
          },
        });
      });
    });
  })

  app.get("/temperature", (req, res, next) => {
    db.all('SELECT * FROM temperature ORDER BY ts DESC LIMIT 50', (err, rows) => {
      if (err) throw err;
      res.json({"temperatures": rows.reverse()});
    });
  })

  app.get("/humidity", (req, res, next) => {
    db.all('SELECT * FROM humidity ORDER BY ts DESC LIMIT 50', (err, rows) => {
      if (err) throw err;
      res.json({"temperatures": rows.reverse()});
    });
  })

  app.use((req, res) => {
    res.status(404);
  })

  return app;
}

function run() {
  const db = init_database();
  const c = init_controller(db);
  setInterval(c.run.bind(c), INTERVAL);
  init_app(db);
}

run();
