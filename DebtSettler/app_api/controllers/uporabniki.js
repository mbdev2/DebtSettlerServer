const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res, pkOdgovor) => {
  res.status(200).json({ status: "uspešno" });
};

const izbrisiUporabnika = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const seznamMojihNakupov = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const posodobiUporabnika = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const uporabnikDodajBarvo = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const vrniUpIdJavno = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const dodajSliko = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

module.exports = {
  vrniUpId,
  izbrisiUporabnika,
  posodobiUporabnika,
  seznamMojihNakupov,
  uporabnikDodajBarvo,
  vrniUpIdJavno,
  dodajSliko
};
