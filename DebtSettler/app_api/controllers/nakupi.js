const mongoose = require('mongoose');
const Gospodinjstvo = mongoose.model("gospodinjstvo");
const Uporabnik = mongoose.model("uporabnik");

const vnesiNakup = (req, res) => {
  if (!req.body.kategorijaNakupa || !req.body.imeTrgovine || !req.body.opisNakupa || !req.body.znesekNakupa || !req.payload.idGospodinjstva || !req.payload.idUporabnika) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
  }
  if (req.body.znesekNakupa < 0) {
    return res.status(400).json({ "sporočilo": "Znesek nakupa ne sme biti negativen" });
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
  if (!req.params.idNakupa || !req.payload.idGospodinjstva || !req.payload.idUporabnika || !req.payload.upVGosID) {
    return res.status(400).json({ "sporočilo": "Zahtevani so vsi podatki" });
  }
  var idGospodinjstva = req.payload.idGospodinjstva;
  var upVGosID = req.payload.upVGosID;
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
        var nakup = gospodinjstvo.nakupiGospodinjstvo.find(nakup => nakup._id == req.params.idNakupa);
        if (!nakup) {
          return res.status(404).json({ status: "Nakup ne obstaja." });
        }
        if (nakup.upVGosID == upVGosID || gospodinjstvo.adminGospodinjstva == idUporabnika) { //izbrise ga lahko admin ali uporabnik, ki ga je ustvaril
          for (var i = 0; i < nakup.tabelaUpVGos.length; i++) {
            var uporabnikPosodobi = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == nakup.tabelaUpVGos[i]); //==upVGosID
            if (!uporabnikPosodobi) {
              return res.status(500).json({ status: "Uporabnik " + nakup.tabelaUpVGos[i] + " ne obstaja v tem gospodinsjtvu." });
            }
            uporabnikPosodobi.stanjeDenarja += Math.round(nakup.znesekNakupa / (nakup.tabelaUpVGos.length + 1) * 100) / 100 //znezekNakupa/ stevilo_vseh_prejemnikov (vkljucno s placnikom)
          }
          var uporabnikPosodobi = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == nakup.upVGosID); //==upVGosID
          if (!uporabnikPosodobi) {
            return res.status(500).json({ status: "Uporabnik " + nakup.tabelaUpVGos[i] + " ne obstaja v tem gospodinsjtvu." });
          }
          uporabnikPosodobi.stanjeDenarja -= Math.round(nakup.znesekNakupa * nakup.tabelaUpVGos.length / (nakup.tabelaUpVGos.length + 1) * 100) / 100
          uporabnikPosodobi.porabljenDenar -= Math.round(nakup.znesekNakupa * 100) / 100

          nakup.remove()

          gospodinjstvo.save(napaka => {
            if (napaka) {
              return res.status(500).json(napaka);
            } else {
              return res.status(201).json({ status: "Nakup uspešno zbrisan." });
            }
          });
        }
        else {
          return res.status(401).json({ status: "Nimate pravice spreminjati ta nakup" });
        }
      }
    });
};

const pridobiVseNakupeGospodinjstvo = (req, res) => {
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
        return res.status(200).json(gospodinjstvo.nakupiGospodinjstvo)
      }
    });
};

const pridobiVseNakupeUser = (req, res) => {
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
        return res.status(200).json(gospodinjstvo.nakupiGospodinjstvo.filter(nakup => nakup.upVGosID == upVGosID))
      }
    });
};

const poravnavaDolga = (req, res) => {
  if (!req.body.znesek || !req.body.prejemnikIdUpvGos || !req.payload.idGospodinjstva || !req.payload.idUporabnika) {
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
        var uporabnikPrejemnik = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == req.body.prejemnikIdUpvGos); //==upVGosID
        var uporabnikPosiljatelj = gospodinjstvo.uporabnikGospodinjstvo.find(uporabnikPosodobi => uporabnikPosodobi._id == upVGosID); //==upVGosID
        if (!uporabnikPrejemnik || !uporabnikPosiljatelj) {
          return res.status(500).json({ status: "Eden izmed podanih uporabnikov ne obstaja v tem gospodinsjtvu." });
        }
        uporabnikPrejemnik.stanjeDenarja -= Math.round(req.body.znesek * 100) / 100
        uporabnikPrejemnik.porabljenDenar -= Math.round(req.body.znesek * 100) / 100
        uporabnikPosiljatelj.stanjeDenarja += Math.round(req.body.znesek * 100) / 100
        uporabnikPosiljatelj.porabljenDenar += Math.round(req.body.znesek * 100) / 100
        console.log(uporabnikPrejemnik)
        console.log(uporabnikPosiljatelj)
        Uporabnik
          .find({ "_id": { $in: [uporabnikPrejemnik.uporabnikID, uporabnikPosiljatelj.uporabnikID] } })
          .exec((napaka, uporabniki) => {
            if (!uporabniki) {
              return res.status(404).json({
                "sporočilo":
                  "Ne najdem uporabnika s podanim enoličnim identifikatorjem idUporabnika."
              });
            } else if (napaka) {
              return res.status(500).json(napaka);
            } else {
              var imePosiljatelja = uporabniki.find(u => u._id == uporabnikPosiljatelj.uporabnikID)
              var imePrejemnika = uporabniki.find(u => u._id == uporabnikPrejemnik.uporabnikID)
              var opis = 'Uporabnik/ca ' + imePosiljatelja.ime + ' je uporabniku/ci ' + imePrejemnika.ime + ' dal ' + req.body.znesek + '€ za poravnavo dolga.';
              gospodinjstvo.nakupiGospodinjstvo.addToSet({
                kategorijaNakupa: 0, // kategorija za poravnave
                imeTrgovine: 'Poravnava dolga',
                opisNakupa: opis,
                znesekNakupa: req.body.znesek,
                upVGosID: upVGosID,
                tabelaUpVGos: req.body.prejemnikIdUpvGos
              });
              gospodinjstvo.save(napaka => {
                if (napaka) {
                  return res.status(500).json(napaka);
                } else {
                  return res.status(201).json({ status: "Poravnava uspešno izvedena." });
                }
              });
            }
          });
      }
    });
};

module.exports = {
  vnesiNakup,
  izbrisiNakup,
  poravnavaDolga,
  pridobiVseNakupeGospodinjstvo,
  pridobiVseNakupeUser
};
