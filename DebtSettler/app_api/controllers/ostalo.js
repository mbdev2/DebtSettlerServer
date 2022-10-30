const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res, pkOdgovor) => {
  res.status(200).json({ "status": "uspešno" });
};

const brisiDB = (req, res) => {
  res.status(200).json({ "status": "uspešno" });
};

const polniDB = (req, res) => {
  res.status(200).json({ "status": "uspešno" });
};

module.exports = {
  brisiDB,
  polniDB
};
