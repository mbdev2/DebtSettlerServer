const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const podatkiUporabnika = (req, res) => {
  if (!req.payload.idUporabnika) {
    return res.status(401).json("Uporabnik ne obstaja");
  }
  var idUporabnika = req.payload.idUporabnika;
  Uporabnik
    .findById(idUporabnika)
    .exec((napaka, uporabnik) => {
      if (!uporabnik) {
        return res.status(404).json({
          "sporočilo":
            "Ne najdem uporabnika s tem ID!"
        });
      } else if (napaka) {
        return res.status(500).json(napaka);
      } else {
        var podatkiUpJSON = {
          "idUporabnika": uporabnik.id,
          "imeUporabnika": uporabnik.ime,
          "emailUporabnika": uporabnik.email,
          "barvaUporabnika": uporabnik.barvaUporabnika
        };
        return res.status(200).json(podatkiUpJSON)
      }
    });
};

const posodobiUporabnika = (req, res) => {
  if (!req.payload.idUporabnika) {
    return res.status(401).json("Uporabnik ne obstaja");
  }
  var idUporabnika = req.payload.idUporabnika;
  Uporabnik
    .findById(idUporabnika)
    .exec((napaka, uporabnik) => {
      if (!uporabnik) {
        return res.status(404).json({
          "sporočilo":
            "Ne najdem uporabnika s tem ID!"
        });
      } else if (napaka) {
        return res.status(500).json(napaka);
      } else {
        uporabnik.ime = req.body.imeUp;
        uporabnik.email = req.body.emailUp;
        uporabnik.barvaUporabnika = req.body.barvaUp;
        uporabnik.save(napaka => {
          if (napaka) {
            return res.status(400).json(napaka);
          } else {
            return res.status(200).json("Uporabnik uspesno posdobljen");
          }
        });
      }
    });
};

const menjavaGesla = (req, res) => {
  if (!req.payload.idUporabnika) {
    return res.status(401).json("Uporabnik ne obstaja");
  }
  var idUporabnika = req.payload.idUporabnika;
  Uporabnik
    .findById(idUporabnika)
    .exec((napaka, uporabnik) => {
      if (!uporabnik) {
        return res.status(404).json({
          "sporočilo":
            "Ne najdem uporabnika s tem ID!"
        });
      } else if (napaka) {
        return res.status(500).json(napaka);
      } else {
        if (uporabnik.preveriGeslo(req.body.geslo)) {
          uporabnik.nastaviGeslo(req.body.novoGeslo);
          uporabnik.save(napaka => {
            if (napaka) {
              return res.status(400).json(napaka);
            } else {
              return res.status(200).json("Geslo uporabnika uspešno posdobljeno");
            }
          });
        }
        else {
          return res.status(401).json("Napačno geslo");
        }
      }
    });
};

const izbrisiUporabnika = (req, res) => {
  if (!req.payload.idUporabnika) {
    return res.status(401).json("Uporabnik ne obstaja");
  }
  var idUporabnika = req.payload.idUporabnika;
  Uporabnik // pogledamo če uporabnik sploh obstaja
    .findById(idUporabnika)
    .exec((napaka, uporabnik) => {
      if (!uporabnik) {
        return res.status(404).json({ "sporočilo": "Ne najdem uporabnika." });
      } else if (napaka) {
        return res.status(500).json(napaka);
      } else {
        Gospodinjstvo
          .findOne({ adminGospodinjstva: idUporabnika })
          .exec((napaka, gospodinjstvo) => { // pogledamo ce je v katerem gospodinjstvu admin
            if (gospodinjstvo) {
              console.log(gospodinjstvo)
              return res.status(403).json({
                "sporočilo":
                  "Uporabniškega računa ne morete izbrisati dokler ste Admin v gospodinsjtvu!"
              });
            } else if (napaka) {
              return res.status(500).json(napaka);
            } else {
              Gospodinjstvo
                .find({ 'uporabnikGospodinjstvo.uporabnikID': idUporabnika }) // poiscemo vsa gospodinsjtva v katerih je ta uporabnik
                .exec((napaka, gospodinjstvaUp) => {
                  if (napaka) {
                    return res.status(500).json(napaka);
                  }
                  else {
                    for (var i = 0; i < gospodinjstvaUp.length; i++) {
                      var gospodinjstvo = gospodinjstvaUp[i];
                      var uporabnikG = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnik => uporabnik.uporabnikID == idUporabnika);
                      uporabnikG.zamrznjenStatus = true
                      uporabnikG.deleteStatus = true
                      uporabnikG.uporabnikID = 'Uporabnik_je_izbrisan'
                      gospodinjstvo.save(napaka => {
                        if (napaka) {
                          return res.status(500).json(napaka);
                        } else {
                          console.log("Uporabnik uspešno odstranjen iz gospodinsjtva " + gospodinjstvo.imeGospodinjstva + ".");
                        }
                      });
                    }
                    uporabnik.remove()
                    return res.status(204).json({ "NotAGoodbye": "Uporabnik uspešno izbrisan :'(." });
                  }
                });
            }
          });
      }
    });
};

const dodajSliko = (req, res) => { //TBD
  res.status(200).json({ "status": "uspešno" });
};

module.exports = {
  podatkiUporabnika,
  posodobiUporabnika,
  menjavaGesla,
  dodajSliko,
  izbrisiUporabnika
};
