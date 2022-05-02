const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vrniUpId = (req, res) => {
  res.status(200).json({ status: "uspešno" });
};

const vnesiNakup = (req, res) => {
  if (!req.body.kategorijaNakupa || !req.body.imeTrgovine || !req.body.opisNakupa || !req.body.znesekNakupa || !req.payload.idGospodinjstva || !req.payload.idUporabnika) {
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
        var tabelaDeležnihUp = req.body.tabelaUpVGos.split(',')
        // deljenja nakupa z stanji denarja, primer: Nakup 15$, 3 deležniki. 
        // Tisti k plača: stanjeDenarja + 10$ in porabljenDenar +15$, 
        // Druge dva: stanjeDenarja - 5$, porabljenDenar ostane enak.
        for (var i = 0; i < tabelaDeležnihUp.length; i++) {
          var uporabnikPosodobi = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == tabelaDeležnihUp[i]); //==upVGosID
          if (!uporabnikPosodobi) {
            return res.status(500).json({ status: "Uporabnik " + tabelaDeležnihUp[i] + " ne obstaja v tem gospodinsjtvu." });
          }
          uporabnikPosodobi.stanjeDenarja -= Math.round(req.body.znesekNakupa / (tabelaDeležnihUp.length + 1) * 100) / 100 //znezekNakupa/ stevilo_vseh_prejemnikov (vkljucno s placnikom)
        }
        var uporabnikPosodobi = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == upVGosID); //==upVGosID
        if (!uporabnikPosodobi) {
          return res.status(500).json({ status: "Uporabnik " + tabelaDeležnihUp[i] + " ne obstaja v tem gospodinsjtvu." });
        }
        uporabnikPosodobi.stanjeDenarja += Math.round(req.body.znesekNakupa * tabelaDeležnihUp.length / (tabelaDeležnihUp.length + 1) * 100) / 100
        uporabnikPosodobi.porabljenDenar += Math.round(req.body.znesekNakupa * 100) / 100

        gospodinjstvo.nakupiGospodinjstvo.addToSet({
          kategorijaNakupa: req.body.kategorijaNakupa,
          imeTrgovine: req.body.imeTrgovine,
          opisNakupa: req.body.opisNakupa,
          znesekNakupa: req.body.znesekNakupa,
          upVGosID: upVGosID,
          tabelaUpVGos: tabelaDeležnihUp
        });
        gospodinjstvo.save(napaka => {
          if (napaka) {
            return res.status(500).json(napaka);
          } else {
            return res.status(201).json({ status: "Nakup uspešno vnesen." });
          }
        });
      }
    });
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
