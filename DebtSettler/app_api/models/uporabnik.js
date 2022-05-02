const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const uporabnikShema = new mongoose.Schema({
  ime: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  barvaUporabnika: { type: String, required: true },
  nakljucnaVrednost: { type: String, required: true },
  zgoscenaVrednost: { type: String, required: true }
});

uporabnikShema.methods.nastaviGeslo = function (geslo) {
  this.nakljucnaVrednost = crypto.randomBytes(16).toString('hex');
  this.zgoscenaVrednost = crypto
    .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
    .toString('hex');
};

uporabnikShema.methods.preveriGeslo = function (geslo) {
  let zgoscenaVrednost = crypto
    .pbkdf2Sync(geslo, this.nakljucnaVrednost, 1000, 64, 'sha512')
    .toString('hex');
  return this.zgoscenaVrednost == zgoscenaVrednost;
};

uporabnikShema.methods.generirajJwt = function () {
  return jwt.sign({
    idUporabnika: this._id,
    email: this.email,
    ime: this.ime,
    exp: 317125598071
  }, process.env.JWT_GESLO);
};

mongoose.model('uporabnik', uporabnikShema, 'uporabnik');
