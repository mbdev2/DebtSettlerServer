const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res, pkOdgovor) => {
  res.status(200).json({ status: "uspešno" });
};

const vnesiNovArtikelSeznam = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const izbrisiArtikelSeznama = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const pridobiVseGospodinjstvo = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const pridobiVseUser = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const posodobiVnos = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};


module.exports = {
  vnesiNovArtikelSeznam,
  izbrisiArtikelSeznama,
  pridobiVseUser,
  pridobiVseGospodinjstvo,
  posodobiVnos
};
