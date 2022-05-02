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
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            if (napaka.name == "MongoError" && napaka.code == 11000) {
                                return res.status(409).json({ "sporočilo": "Gospodinjstvo s tem imenom je že registrirano" });
                            } else {
                                return res.status(500).json(napaka);
                            }
                        } else {
                            return res.status(201).json({ status: "Gospodinjstvo uspešno ustvarjeno." });
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
                    return res.status(500).json(napaka);
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
                    return res.status(200).json(tokensJSON);
                }
            });
    });
};

const generirajToken = (upVGosID, idUporabnika, gospodinjstvoID, gospodinjstvoIme) => {
    return jwt.sign({
        _id: this._id,
        upVGosID: upVGosID,
        idUporabnika: idUporabnika,
        idGospodinjstva: gospodinjstvoID,
        imeGospodinjstvas: gospodinjstvoIme,
        exp: 317125598071
    }, process.env.JWT_GESLO);
}

const izbrisiGospodinjstvo = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
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
                    return res.status(204).json({ status: "Gospodinjstvo uspešno izbrisano" });
                }
                else {
                    return res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const posodobiImeGospodinjstva = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
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
                            return res.status(500).json(napaka);
                        } else {
                            return res.status(201).json({ status: "Ime gospodinjstva uspešno posodobljeno" });
                        }
                    });
                }
                else {
                    return res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const dodajClana = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
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
                                    var uporabnikPosodobi = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi.uporabnikID == uporabnik._id.toString()); //uporabnik._id==upVGosID
                                    uporabnikPosodobi.zamrznjenStatus = false
                                    uporabnikPosodobi.deleteStatus = false
                                    var status = "Uporabnik uspešno dodan nazaj (obstajal ze v bazi)."
                                }
                                gospodinjstvo.save(napaka => {
                                    if (napaka) {
                                        return res.status(500).json(napaka);
                                    } else {
                                        return res.status(201).json({ status: status });
                                    }
                                });
                            }

                        });
                }
                else {
                    return res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const odstraniClana = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
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
                    var uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik._id == req.body.upVGosID);
                    uporabnik.zamrznjenStatus = true
                    uporabnik.deleteStatus = true
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            return res.status(500).json(napaka);
                        } else {
                            return res.status(201).json({ status: "Uporabnik uspešno odstranjen." });
                        }
                    });
                }
                else {
                    return res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
};

const zamrzniClana = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
    var idGospodinjstva = req.payload.idGospodinjstva;
    var upVGosID = req.payload.upVGosID;
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
                var uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik._id == upVGosID);
                if (!uporabnik.deleteStatus) {
                    uporabnik.zamrznjenStatus = true
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            return res.status(500).json(napaka);
                        } else {
                            return res.status(201).json({ status: "Uporabnik uspešno zamrznjen." });
                        }
                    });
                } else {
                    return res.status(500).json({ status: "Nedovoljena poteza. Uporabnik je trenutno v stanju odstranjen" });
                }
            }
        });
};

const odmrzniClana = (req, res) => {
    if (!req.payload.upVGosID && !req.payload.idGospodinjstva) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
    var idGospodinjstva = req.payload.idGospodinjstva;
    var upVGosID = req.payload.upVGosID;
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
                var uporabnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik._id == upVGosID);
                console.log(uporabnik.deleteStatus)
                if (!uporabnik.deleteStatus) {
                    uporabnik.zamrznjenStatus = false
                    gospodinjstvo.save(napaka => {
                        if (napaka) {
                            return res.status(500).json(napaka);
                        } else {
                            return res.status(201).json({ status: "Uporabnik uspešno odmrznjen." });
                        }
                    });
                }
                else {
                    return res.status(500).json({ status: "Nedovoljena poteza. Uporabnik je trenutno v stanju odstranjen" });
                }
            }
        });
};

const claniGospodinjstva = (req, res) => {
    if (!req.payload.idGospodinjstva) {
        return res.status(401).json("Gospodinjstvo ne obstaja");
    }
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
                    if (uporabnikGospodinjstva.uporabnikID !== 'Uporabnik_je_izbrisan')
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
                                var uporabnikGospodinjstva = gospodinjstvo.uporabnikGospodinjstvo[i]
                                var uporabnik = uporabniki.find(u => u._id == uporabnikGospodinjstva.uporabnikID)
                                if (!uporabnik) {
                                    var uporabnik = {}
                                    uporabnik.ime = "Izbrisani uporabnik"
                                }
                                uporabnikiGospodinsjtvaJSON.uporabniki.push({
                                    "imeUporabnika": uporabnik.ime,
                                    "idUporabnika": uporabnikGospodinjstva.uporabnikID, //ID uporabnika globalno
                                    "upVGosID": uporabnikGospodinjstva._id, //ID uporabnika v gospodinjstvu upVGosID
                                    "stanjeDenarja": uporabnikGospodinjstva.stanjeDenarja,
                                    "porabljenDenar": uporabnikGospodinjstva.porabljenDenar,
                                    "zamrznjenStatus": uporabnikGospodinjstva.zamrznjenStatus,
                                    "deleteStatus": uporabnikGospodinjstva.deleteStatus
                                });
                            }
                            return res.status(200).json(uporabnikiGospodinsjtvaJSON);
                        }

                    });
            }
        });
};

const adminPredaja = (req, res) => {
    if (!(req.payload.upVGosID && req.payload.idGospodinjstva)) {
        return res.status(401).json("Uporabnik ne obstaja");
    }
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
                    if (gospodinjstvo.uporabnikGospodinjstvo.some(uporabnika => uporabnika.uporabnikID == req.body.idUporabnika)) { //preverimo ali je uporabnik v gospodinsjtvu
                        gospodinjstvo.adminGospodinjstva = req.body.idUporabnika
                        gospodinjstvo.save(napaka => {
                            if (napaka) {
                                return res.status(500).json(napaka);
                            } else {
                                return res.status(201).json({ status: "Admin uspešno zamenjan." });
                            }
                        });
                    }
                    else {
                        return res.status(404).json({ status: "Uporabnik s podanim idUporabnika ne obstaja v tem gospodinsjtvu" });
                    }
                }
                else {
                    return res.status(401).json({ status: "Nimate admin nadzora nad tem gospodinjstvom." });
                }
            }
        });
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
