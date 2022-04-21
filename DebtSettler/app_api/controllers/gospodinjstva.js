const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");


const vrniUpId = (req, res, pkOdgovor) => {
    if (req.payload && req.payload.email) {
        Uporabnik
            .findOne({ email: req.payload.email })
            .exec((napaka, uporabnik) => {
                if (!uporabnik)
                    return res.status(404).json({ "sporočilo": "Ne najdem uporabnika" });
                else if (napaka)
                    return res.status(500).json(napaka);
                pkOdgovor(req, res, uporabnik._id);
            });
    } else {
        return res.status(400).json({ "sporočilo": "Ni podatka o uporabniku" });
    }
};

const ustvariGospodinjstvo = (req, res) => {
    vrniUpId(req, res, (req, res, idUporabnika) => {
        Uporabnik
            .findById(idUporabnika)
            .exec((napaka, uporabnik) => {
                if (!uporabnik) {
                    return res.status(404).json({
                        "sporočilo":
                            "Ne najdem uporabnika s podanim enoličnim identifikatorjem idUporabnika."
                    });
                } else if (napaka) {
                    return res.status(500).json(napaka);
                } else {
                    const gospodinjstvo = new Gospodinjstvo();
                    gospodinjstvo.imeGospodinjstva = req.body.imeGospodinjstva,
                        gospodinjstvo.nastaviGeslo(req.body.geslo),
                        gospodinjstvo.adminGospodinjstva = uporabnik._id;
                    gospodinjstvo.uporabnikGospodinjstvo.push({
                        uporabnikID: uporabnik._id,
                        stanjeDenarja: 0,
                        porabljenDenar: 0,
                        zamrznjenStatus: false
                    });
                    console.log(gospodinjstvo)
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            if (napaka.name == "MongoError" && napaka.code == 11000) {
                                res.status(409).json({ "sporočilo": "Gospodinjstvo s tem imenom je že registrirano" });
                            } else {
                                res.status(500).json(napaka);
                            }
                        } else {
                            res.status(201).json({ status: "Gospodinjstvo uspešno ustvarjeno." });
                        }
                    });
                }
            });
    });
};

const tokenUporabnikGospodinjstva = (req, res) => {
    vrniUpId(req, res, (req, res, idUporabnika) => {
        Gospodinjstvo
            .find({ 'uporabnikGospodinjstvo.uporabnikID': idUporabnika }) // poiscemo vse gospodinsjtva v katerih je ta uporabnik
            .exec((napaka, gospodinjstvaUp) => {
                if (napaka) {
                    res.status(500).json(napaka);
                }
                else {
                    var tokensJSON = {
                        tokens: []
                    };
                    for (var i = 0; i < gospodinjstvaUp.length; i++) {
                        var gospodinjstvo = gospodinjstvaUp[i];
                        var uporabnik;
                        var token;
                        uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik.uporabnikID == idUporabnika); // za vsko gospodinsjtvo poiscemo njegov upVgosID
                        token = generirajToken(uporabnik._id, uporabnik.uporabnikID, gospodinjstvo._id, gospodinjstvo.imeGospodinjstva)
                        tokensJSON.tokens.push({
                            "imeGospodinjstva": gospodinjstvo.imeGospodinjstva,
                            "GStoken": token //ID uporabnika v gospodinjstvu
                        });
                    }
                    res.status(200).json(tokensJSON);
                }
            });
    });
};

const generirajToken = (uporabnikID, idUporabnika, gospodinjstvoID, gospodinjstvoIme) => {
    return jwt.sign({
        _id: this._id,
        idUporabnikGospodinjstva: uporabnikID,
        idUporabnika: idUporabnika,
        idGospodinjstva: gospodinjstvoID,
        imeGospodinjstvas: gospodinjstvoIme,
        exp: 317125598071
    }, process.env.JWT_GESLO);
}

const izbrisiGospodinjstvo = (req, res) => {
    var idGospodinjstva = req.payload.idGospodinjstva;
    var idUporabnika = req.payload.idUporabnika;
    Gospodinjstvo
        .findById(idGospodinjstva)
        .exec((napaka, gospodinjstvo) => {
            if (!gospodinjstvo) {
                return res.status(404).json({
                    "sporočilo":
                        "Ne najdem gospodinjstva s tem ID!"
                });
            } else if (napaka) {
                return res.status(500).json(napaka);
            } else {
                if (gospodinjstvo.adminGospodinjstva == idUporabnika) { // preverimo ce je to klical admin
                    gospodinjstvo.remove()
                    res.status(204).json({ status: "Gospodinjstvo uspešno izbrisano" });
                }
                else {
                    res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const posodobiImeGospodinjstva = (req, res) => {
    var idGospodinjstva = req.payload.idGospodinjstva;
    var idUporabnika = req.payload.idUporabnika;
    Gospodinjstvo
        .findById(idGospodinjstva)
        .exec((napaka, gospodinjstvo) => {
            if (!gospodinjstvo) {
                return res.status(404).json({
                    "sporočilo":
                        "Ne najdem gospodinjstva s tem ID!"
                });
            } else if (napaka) {
                return res.status(500).json(napaka);
            } else {
                if (gospodinjstvo.adminGospodinjstva == idUporabnika) { // preverimo ce je to klical admin
                    gospodinjstvo.imeGospodinjstva = req.body.imeGospodinjstva;
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            res.status(500).json(napaka);
                        } else {
                            res.status(201).json({ status: "Ime gospodinjstva uspešno posodobljeno" });
                        }
                    });
                }
                else {
                    res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const dodajClana = (req, res) => {
    var idGospodinjstva = req.payload.idGospodinjstva;
    var idUporabnika = req.payload.idUporabnika;
    Gospodinjstvo
        .findById(idGospodinjstva)
        .exec((napaka, gospodinjstvo) => {
            if (!gospodinjstvo) {
                return res.status(404).json({
                    "sporočilo":
                        "Ne najdem gospodinjstva s tem ID!"
                });
            } else if (napaka) {
                return res.status(500).json(napaka);
            } else {
                if (gospodinjstvo.adminGospodinjstva == idUporabnika) { // preverimo ce je to klical admin
                    Uporabnik
                        .findOne({ 'email': req.body.email })
                        .exec((napaka, uporabnik) => {
                            if (!uporabnik) {
                                return res.status(404).json({
                                    "sporočilo":
                                        "Ne najdem uporabnika s tem email naslovom!"
                                });
                            } else if (napaka) {
                                return res.status(500).json(napaka);
                            } else {
                                if (!gospodinjstvo.uporabnikGospodinjstvo.some(uporabnika => uporabnika.uporabnikID === uporabnik._id.toString())) { //preverimo ali je uporabnik ze v gospodinsjtvu
                                    gospodinjstvo.uporabnikGospodinjstvo.addToSet({
                                        uporabnikID: uporabnik._id.toString(),
                                        stanjeDenarja: 0,
                                        porabljenDenar: 0
                                    });
                                    var status = "Uporabnik uspešno dodan."
                                }
                                else {
                                    var uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik.uporabnikID == idUporabnika);
                                    uporabnik.zamrznjenStatus = false
                                    uporabnik.deleteStatus = false
                                    var status = "Uporabnik uspešno dodan nazaj (obstajal ze v bazi)."
                                }
                                gospodinjstvo.save(napaka => {
                                    if (napaka) {
                                        res.status(500).json(napaka);
                                    } else {
                                        res.status(201).json({ status: status });
                                    }
                                });
                            }

                        });
                }
                else {
                    res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const odstraniClana = (req, res) => {
    var idGospodinjstva = req.payload.idGospodinjstva;
    var idUporabnika = req.payload.idUporabnika;
    Gospodinjstvo
        .findById(idGospodinjstva)
        .exec((napaka, gospodinjstvo) => {
            if (!gospodinjstvo) {
                return res.status(404).json({
                    "sporočilo":
                        "Ne najdem gospodinjstva s tem ID!"
                });
            } else if (napaka) {
                return res.status(500).json(napaka);
            } else {
                if (gospodinjstvo.adminGospodinjstva == idUporabnika) { // preverimo ce je to klical admin
                    var uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik.uporabnikID == idUporabnika);
                    uporabnik.zamrznjenStatus = true
                    uporabnik.deleteStatus = true
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            res.status(500).json(napaka);
                        } else {
                            res.status(201).json({ status: "Uporabnik uspešno zamrznjen." });
                        }
                    });
                }
                else {
                    res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const zamrzniClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const odmrzniClana = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

const claniGospodinjstva = (req, res) => {
    var idGospodinjstva = req.payload.idGospodinjstva;
    Gospodinjstvo
        .findById(idGospodinjstva)
        .exec((napaka, gospodinjstvo) => {
            if (!gospodinjstvo) {
                return res.status(404).json({
                    "sporočilo":
                        "Ne najdem gospodinjstva s tem ID!"
                });
            } else if (napaka) {
                return res.status(500).json(napaka);
            } else {
                var IDuporabnikovVgospodinsjtvu = [];
                for (var i = 0; i < gospodinjstvo.uporabnikGospodinjstvo.length; i++) {
                    var uporabnikGospodinjstva = gospodinjstvo.uporabnikGospodinjstvo[i];
                    IDuporabnikovVgospodinsjtvu.push(uporabnikGospodinjstva.uporabnikID);
                }
                Uporabnik
                    .find({ "_id": { $in: IDuporabnikovVgospodinsjtvu } })
                    .exec((napaka, uporabniki) => {
                        if (!uporabniki) {
                            return res.status(404).json({
                                "sporočilo":
                                    "Ne najdem uporabnika s podanim enoličnim identifikatorjem idUporabnika."
                            });
                        } else if (napaka) {
                            return res.status(500).json(napaka);
                        } else {
                            var uporabnikiGospodinsjtvaJSON = {
                                uporabniki: []
                            };
                            for (var i = 0; i < gospodinjstvo.uporabnikGospodinjstvo.length; i++) {
                                var uporabnikGospodinjstva = gospodinjstvo.uporabnikGospodinjstvo[i];
                                var uporabnik = uporabniki[i]
                                uporabnikiGospodinsjtvaJSON.uporabniki.push({
                                    "imeUporabnika": uporabnik.ime,
                                    "uporabnikID": uporabnikGospodinjstva.uporabnikID, //ID uporabnika globalno
                                    "uporabnikVgospodinjstvuID": uporabnikGospodinjstva._id, //ID uporabnika v gospodinjstvu
                                    "stanjeDenarja": uporabnikGospodinjstva.stanjeDenarja,
                                    "porabljenDenar": uporabnikGospodinjstva.porabljenDenar,
                                    "zamrznjenStatus": uporabnikGospodinjstva.zamrznjenStatus
                                });
                            }
                            res.status(200).json(uporabnikiGospodinsjtvaJSON);
                        }

                    });
            }
        });
};

const adminPredaja = (req, res) => {
    res.status(200).json({ status: "uspešno" });
};

module.exports = {
    ustvariGospodinjstvo,
    izbrisiGospodinjstvo,
    posodobiImeGospodinjstva,
    tokenUporabnikGospodinjstva,
    dodajClana,
    odstraniClana,
    zamrzniClana,
    odmrzniClana,
    claniGospodinjstva,
    adminPredaja
};
