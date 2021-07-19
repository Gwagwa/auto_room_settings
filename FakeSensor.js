function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  read: function(type, pin, cb) {
    return cb(null, getRandomInt(20, 30), getRandomInt(30, 70));
  }
};
