const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vnesiNovArtikelSeznam = (req, res) => {
  if (!req.body.naslov || !req.body.opis || !req.body.kolicina || !req.payload.idGospodinjstva || !req.payload.idUporabnika) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
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
        gospodinjstvo.nakupovalniSeznamGospodinjstvo.addToSet({
          naslov: req.body.naslov,
          opis: req.body.opis,
          kolicina: req.body.kolicina,
          upVGosID: upVGosID
        });
        gospodinjstvo.save(napaka => {
          if (napaka) {
            return res.status(500).json(napaka);
          } else {
            return res.status(201).json({ status: "Artikel uspešno vnesen na seznam." });
          }
        });
      }
    });
}

const izbrisiArtikelSeznama = (req, res) => {
  if (!req.params.idArtikla || !req.payload.idGospodinjstva || !req.payload.idUporabnika || !req.payload.upVGosID) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
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
        var artikel = gospodinjstvo.nakupovalniSeznamGospodinjstvo.find(artikel => artikel._id == req.params.idArtikla);
        if (!artikel) {
          return res.status(404).json({ status: "Artikel ne obstaja." });
        }
        artikel.remove()
        gospodinjstvo.save(napaka => {
          if (napaka) {
            return res.status(500).json(napaka);
          } else {
            return res.status(201).json({ status: "Artikel uspešno zbrisan." });
          }
        });
      }
    });
};

const pridobiVseGospodinjstvo = (req, res) => {
  if (!req.payload.idGospodinjstva) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
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
        return res.status(200).json(gospodinjstvo.nakupovalniSeznamGospodinjstvo)
      }
    });
};

const pridobiVseUser = (req, res) => {
  if (!req.payload.idGospodinjstva) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
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
        return res.status(200).json(gospodinjstvo.nakupovalniSeznamGospodinjstvo.filter(artikel => artikel.upVGosID == upVGosID))
      }
    });
};

const posodobiVnos = (req, res) => {
  if (!req.body.naslov || !req.body.opis || !req.body.aquired || !req.body.kolicina || !req.body.idArtikla || !req.payload.idGospodinjstva || !req.payload.idUporabnika) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
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
        var artikel = gospodinjstvo.nakupovalniSeznamGospodinjstvo.find(artikel => artikel._id == req.body.idArtikla);
        if (!artikel) {
          return res.status(404).json({ status: "Artikel ne obstaja." });
        }
        artikel.naslov = req.body.naslov
        artikel.opis = req.body.opis
        artikel.kolicina = req.body.kolicina
        artikel.aquired = req.body.aquired

        gospodinjstvo.save(napaka => {
          if (napaka) {
            return res.status(500).json(napaka);
          } else {
            return res.status(201).json({ status: "Artikel uspešno zbrisan." });
          }
        });
      }
    });
};


module.exports = {
  vnesiNovArtikelSeznam,
  izbrisiArtikelSeznama,
  pridobiVseUser,
  pridobiVseGospodinjstvo,
  posodobiVnos
};
