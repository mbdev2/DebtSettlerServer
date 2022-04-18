const mongoose = require('mongoose');
/*
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
*/

const upVGosShema = new mongoose.Schema({
    uporabnikID: { type: String, required: true }, //nism sure a rabm kle objekt uporabnikShema ali dam sam string 
    stanjeDenarja: { type: Number, required: true },
    porabljenDenar: { type: Number, required: true },
    zamrznjenStatus: { type: Boolean, default: false }
});

const nakupShema = new mongoose.Schema({
    kategorijaNakupa: { type: String },
    imeTrgovine: { type: String, required: true },
    opisNakupa: { type: String, required: true },
    datumNakupa: { type: Date, "default": Date.now },
    znesekNakupa: { type: Number, required: true },
    upVGosID: upVGosShema,
    tabelaUpVGos: [upVGosShema]
});

const nakupovalniSeznamArtikelShema = new mongoose.Schema({
    naslov: { type: String, required: true },
    opis: { type: String, required: true },
    kolicina: { type: Number, required: true },
});

const gospodinjstvoShema = new mongoose.Schema({
    imeGospodinjstva: { type: String, required: true },
    nakljucnaVrednost: { type: String, required: true },
    zgoscenaVrednost: { type: String, required: true },
    uporabnikGospodinjstvo: [upVGosShema],
    nakupiGospodinjstvo: [nakupShema],
    nakupovalniSeznamGospodinjstvo: [nakupovalniSeznamArtikelShema]
});
/*
gospodinjstvoShema.methods.nastaviGeslo = function (geslo) {
    this.nakljucnaVrednost = crypto.randomBytes(16).toString('hex');
    this.zgoscenaVrednost = crypto
        .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
        .toString('hex');
};

gospodinjstvoShema.methods.preveriGeslo = function (geslo) {
    let zgoscenaVrednost = crypto
        .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
        .toString('hex');
    return this.zgoscenaVrednost == zgoscenaVrednost;
};

gospodinjstvoShema.methods.generirajJwt = function () {
    return jwt.sign({
        _id: this._id,
        ime: this.imeGospodinjstva,
        exp: 317125598071
    }, process.env.JWT_GESLO);
};
*/

mongoose.model('gospodinjstvo', gospodinjstvoShema, 'gospodinjstvo');
