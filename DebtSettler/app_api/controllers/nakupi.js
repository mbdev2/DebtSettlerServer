const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const vnesiNakup = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const izbrisiNakup = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const pridobiVseNakupeGospodinjstvo = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const pridobiVseNakupeUser = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const poravnavaDolga = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

module.exports = {
  vnesiNakup,
  izbrisiNakup,
  poravnavaDolga,
  pridobiVseNakupeGospodinjstvo,
  pridobiVseNakupeUser
};
