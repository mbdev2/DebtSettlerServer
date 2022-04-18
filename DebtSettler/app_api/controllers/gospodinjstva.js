const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const ustvariGospodinjstvo = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const izbrisiGospodinjstvo = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const posodobiImeGospodinjstva = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const dodajClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const odstraniClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const zamrzniClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const odmrzniClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const claniGospodinjstva = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const adminPredaja = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

module.exports = {
    ustvariGospodinjstvo,
    izbrisiGospodinjstvo,
    posodobiImeGospodinjstva,
    dodajClana,
    odstraniClana,
    zamrzniClana,
    odmrzniClana,
    claniGospodinjstva,
    adminPredaja
};
