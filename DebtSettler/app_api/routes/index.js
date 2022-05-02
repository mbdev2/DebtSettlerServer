//DStoken = token uporabnika globalno
//GStoken = token uporabnik v gospodinjstvu
//upVGosID = _id uporabnika v gospodinjstvu
//idUporabnika = _id uporabnika globalno
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
router.post("/registracija", ctrlAvtentikacija.registracija); //pricakuje ime, email, barvoUporabnika, geslo | ustvari uporabnika in vrne JWT token "DStoken"
router.post("/prijava", ctrlAvtentikacija.prijava); //pricakuje email, geslo | vrne JWT token "DStoken"

/* Gospodinjstvo */
router.post('/gospodinjstvo/ustvari', avtentikacija, ctrlGospodinjstva.ustvariGospodinjstvo); //pricakuje DStoken, imeGospodinjstva, geslo | ustvari gospodinjstvo 
router.get('/gospodinjstvo/tokeniUporabnikGospodinjstev', avtentikacija, ctrlGospodinjstva.tokenUporabnikGospodinjstva); //pricakuje DStoken | vrne array z imeniGospodinjstev in GStoken za vsako gospodinjstvu uporabnika 
router.get('/gospodinjstvo/claniGospodinjstva', avtentikacija, ctrlGospodinjstva.claniGospodinjstva); //pricakuje GStoken uporabnika | vrne clane gospodinjstva "imeUporabnika","uporabnikID","uporabnikVgospodinjstvuID","stanjeDenarja","porabljenDenar","zamrznjenStatus"
router.post('/gospodinjstvo/dodajClana', avtentikacija, ctrlGospodinjstva.dodajClana); //pricakuje GStoken admina in email clana ki ga zelimo dodati | doda clana gospodinjstvu (deluje tudi ce je clan bil odstranjen in je zdej ponovno dodan)
router.post('/gospodinjstvo/odstraniClana', avtentikacija, ctrlGospodinjstva.odstraniClana); //pricakuje GStoken admina in upVGosID clana ki ga zelimo odstraniti | odstrani clana gospodinjstvu
router.delete('/gospodinjstvo/izbrisi', avtentikacija, ctrlGospodinjstva.izbrisiGospodinjstvo); //pricakuje GStoken admina | zbrise gospodinjstvo
router.post('/gospodinjstvo/posodobiImeGospodinjstva', avtentikacija, ctrlGospodinjstva.posodobiImeGospodinjstva); //pricakuje GStoken admina in novo imeGospodinsjtva | posodobi ime gospodinsjtva
router.get('/gospodinjstvo/zamrzniClana', avtentikacija, ctrlGospodinjstva.zamrzniClana); //pricakuje GStoken uporabnika | zamrzne uporabnika
router.get('/gospodinjstvo/odmrzniClana', avtentikacija, ctrlGospodinjstva.odmrzniClana); //pricakuje GStoken uporabnika | odmrzne uporabnika
router.post('/gospodinjstvo/adminPredaja', avtentikacija, ctrlGospodinjstva.adminPredaja); //pricakuje GStoken admina in idUporabnika novega admina | posodobi admina gospodinjstva

/* Uporabniki */
router.get('/users/podatkiUporabnika', avtentikacija, ctrlUporabniki.podatkiUporabnika); //pricakuje DStoken uporabnika | vrne imeUporabnika, emailUporabnika, barvaUporabnika
router.post('/users/posodobiUporabnika', avtentikacija, ctrlUporabniki.posodobiUporabnika); //pricakuje DStoken uporabnika, imeUp, emailUp, barvaUp | posodobi uporabnika
router.post('/users/menjavaGesla', avtentikacija, ctrlUporabniki.menjavaGesla); //pricakuje DStoken, geslo, novoGeslo | posodobi geslo uporabnika
router.post('/users/dodajSliko', avtentikacija, ctrlUporabniki.dodajSliko); // TBD
router.delete('/users/izbrisi', avtentikacija, ctrlUporabniki.izbrisiUporabnika);

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