const express = require("express");
const router = express.Router();

const ctrlAvtentikacija = require("../controllers/avtentikacija");
// Token za avtentikacijo uporabnikov
const jwt = require('express-jwt');
const avtentikacija = jwt({
    secret: process.env.JWT_GESLO,
    userProperty: 'payload',
    algorithms: ['HS256']
});

const ctrlOstalo = require('../controllers/ostalo');
const ctrlNakupi = require('../controllers/nakupi');
const ctrlSeznam = require('../controllers/seznami');
const ctrlUporabniki = require('../controllers/uporabniki');
const ctrlGospodinjstva = require('../controllers/gospodinjstva');

/* Avtentikacija */
router.post("/registracija", ctrlAvtentikacija.registracija);
router.post("/prijava", ctrlAvtentikacija.prijava);

/* Gospodinjstvo */
router.post('/gospodinjstvo/ustvari', ctrlGospodinjstva.ustvariGospodinjstvo);
router.get('/gospodinjstvo/izbrisi', ctrlGospodinjstva.izbrisiGospodinjstvo);
router.post('/gospodinjstvo/posodobiImeGospodinjstva', ctrlGospodinjstva.posodobiImeGospodinjstva);
router.post('/gospodinjstvo/dodajClana', ctrlGospodinjstva.dodajClana);
router.delete('/gospodinjstvo/odstraniClana/:idClana', ctrlGospodinjstva.odstraniClana);
router.get('/gospodinjstvo/zamrzniClana/:idClana', ctrlGospodinjstva.zamrzniClana);
router.get('/gospodinjstvo/odmrzniClana/:idClana', ctrlGospodinjstva.odmrzniClana);
router.get('/gospodinjstvo/claniGospodinjstva/:idGospodinjstva', ctrlGospodinjstva.claniGospodinjstva);
router.post('/gospodinjstvo/adminPredaja', ctrlGospodinjstva.adminPredaja);

/* Uporabniki */
router.get('/users', ctrlUporabniki.pridobiVseUporabnike);
router.get('/users/gospodinjstvaUporabnika', ctrlUporabniki.gospodinjstvaUporabnika);
router.post('/users/pridobiId', ctrlUporabniki.vrniUpIdJavno);
router.get('/users/nakupi', ctrlUporabniki.seznamMojihNakupov);
router.post('/users/dodajSliko', ctrlUporabniki.dodajSliko);
router.post('/users/posodobiUporabnika', ctrlUporabniki.posodobiUporabnika);
router.delete('/users/izbrisi', ctrlUporabniki.izbrisiUporabnika);

/* Nakupovalni seznam */
router.get('/seznam/:gospodinsjtvoID', ctrlSeznam.pridobiVseGospodinjstvo);
router.get('/seznam/:userID', ctrlSeznam.pridobiVseUser);
router.post('/seznam', ctrlSeznam.vnesiNovArtikelSeznam);
router.delete('/seznam/:idArtikla', ctrlSeznam.izbrisiArtikelSeznama);
router.post('/seznam/:idArtikla', ctrlSeznam.posodobiVnos);

/* Nakupi */
router.get('/nakupi/:gospodinsjtvoID', ctrlNakupi.pridobiVseNakupeGospodinjstvo);
router.get('/nakupi/:userID', ctrlNakupi.pridobiVseNakupeUser);
router.post('/dodajnakup', ctrlNakupi.vnesiNakup); //naj podpira opcijo, da izberes katere uporabnike naj upošteva
router.post('/poravnavadolga', ctrlNakupi.poravnavaDolga); //izmenjava denarja med ljudmi
router.delete('/nakupi/:idNakupa', ctrlNakupi.izbrisiNakup);

/* Podatkovna baza */
router.get('/brisidb', ctrlOstalo.brisiDB);
router.get('/polnidb', ctrlOstalo.polniDB);

module.exports = router;