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
router.post("/prijava", ctrlAvtentikacija.prijava); //pricakuje email, geslo | vrne JWT token "DStoken", ime, idUporabnika in barvo

/* Gospodinjstvo */
router.post('/gospodinjstvo/ustvari', avtentikacija, ctrlGospodinjstva.ustvariGospodinjstvo); //pricakuje DStoken, imeGospodinjstva, geslo | ustvari gospodinjstvo
router.get('/gospodinjstvo/tokeniUporabnikGospodinjstev', avtentikacija, ctrlGospodinjstva.tokenUporabnikGospodinjstva); //pricakuje DStoken | vrne array z imeniGospodinjstev in GStoken za vsako gospodinjstvu uporabnika
router.get('/gospodinjstvo/claniGospodinjstva', avtentikacija, ctrlGospodinjstva.claniGospodinjstva); //pricakuje GStoken uporabnika | vrne clane gospodinjstva "imeUporabnika","uporabnikID","uporabnikVgospodinjstvuID","stanjeDenarja","porabljenDenar","zamrznjenStatus"
router.post('/gospodinjstvo/dodajClana', avtentikacija, ctrlGospodinjstva.dodajClana); //pricakuje GStoken admina in email clana ki ga zelimo dodati | doda clana gospodinjstvu (deluje tudi ce je clan bil odstranjen in je zdej ponovno dodan)
router.post('/gospodinjstvo/odstraniClana', avtentikacija, ctrlGospodinjstva.odstraniClana); //pricakuje GStoken admina in upVGosID clana ki ga zelimo odstraniti | odstrani clana gospodinjstvu
router.delete('/gospodinjstvo/izbrisi', avtentikacija, ctrlGospodinjstva.izbrisiGospodinjstvo); //pricakuje GStoken admina | zbrise gospodinjstvo
router.post('/gospodinjstvo/posodobiImeGospodinjstva', avtentikacija, ctrlGospodinjstva.posodobiImeGospodinjstva); //pricakuje GStoken admina in novo imeGospodinsjtva | posodobi ime gospodinsjtva
router.get('/gospodinjstvo/zamrzniClana', avtentikacija, ctrlGospodinjstva.zamrzniClana); //pricakuje GStoken uporabnika in uporabnikVgospodinjstvuID clana | zamrzne uporabnika
router.get('/gospodinjstvo/odmrzniClana', avtentikacija, ctrlGospodinjstva.odmrzniClana); //pricakuje GStoken uporabnika in uporabnikVgospodinjstvuID clana | odmrzne uporabnika
router.post('/gospodinjstvo/adminPredaja', avtentikacija, ctrlGospodinjstva.adminPredaja); //pricakuje GStoken admina in idUporabnika novega admina | posodobi admina gospodinjstva

/* Uporabniki */
router.get('/users/podatkiUporabnika', avtentikacija, ctrlUporabniki.podatkiUporabnika); //pricakuje DStoken uporabnika | vrne idUporabnika, imeUporabnika, emailUporabnika, barvaUporabnika
router.post('/users/posodobiUporabnika', avtentikacija, ctrlUporabniki.posodobiUporabnika); //pricakuje DStoken uporabnika, imeUp, emailUp, barvaUp | posodobi uporabnika
router.post('/users/menjavaGesla', avtentikacija, ctrlUporabniki.menjavaGesla); //pricakuje DStoken uporabnika geslo, novoGeslo | posodobi geslo uporabnika
//router.post('/users/dodajSliko', avtentikacija, ctrlUporabniki.dodajSliko); // TBD
router.delete('/users/izbrisi', avtentikacija, ctrlUporabniki.izbrisiUporabnika); //pricakuje DStoken uporabnika | pregleda ce je kje Admin, zamenja ID gospodinsjtvih v 'Uporabnik_je_izbrisan' in izbrise globalni vnos za uporabnika

/* Nakupovalni seznam */
router.get('/seznam/gospodinjstvo', avtentikacija, ctrlSeznam.pridobiVseGospodinjstvo); //pricakuje GStoken uporabnika | vrne seznam v gospodinsjtvu
router.get('/seznam/user', avtentikacija, ctrlSeznam.pridobiVseUser); //pricakuje GStoken uporabnika | vrne seznam uporabnika v gospodinsjtvu
router.post('/seznam/novo', avtentikacija, ctrlSeznam.vnesiNovArtikelSeznam); //pricakuje GStoken uporabnika, opis, naslov, kolicino | doda na seznam
router.delete('/seznam', avtentikacija, ctrlSeznam.izbrisiArtikelSeznama); //pricakuje GStoken uporabnika in idArtikla v body | izbrise artikel iz seznama
router.post('/seznam/posodobi', avtentikacija, ctrlSeznam.posodobiVnos); //pricakuje GStoken uporabnika, opis, naslov, kolicino, idArtikla, stanje aquired (true/ false) | posodobi artikel na seznamu

/* Nakupi */
router.get('/nakupi/gospodinjstvo', avtentikacija, ctrlNakupi.pridobiVseNakupeGospodinjstvo); //pricakuje GStoken uporabnika | vrne vse nakupve v gospodinsjtvu
router.get('/nakupi/user', avtentikacija, ctrlNakupi.pridobiVseNakupeUser); //pricakuje GStoken uporabnika | vrne vse nakupe uporabnika v gospodinsjtvu
router.post('/nakupi/dodajNakup', avtentikacija, ctrlNakupi.vnesiNakup); //pricakuje GStoken uporabnika, kategorijaNakupa (number), imeTrgovine, opisNakupa, znesekNakupa, tabelaUpVGos (uporabniki, ki so bili udeleženi pri nakupu) | vnese nakup in pososodbi stanjeDenarja, porabljeDenar za vse uporabnike
router.post('/nakupi/poravnavaDolga', avtentikacija, ctrlNakupi.poravnavaDolga); //pricakuje GStoken posiljatelja, prejemnikIdUpvGos (upVGosID prejemnika), znesek | poravna dolg in vpiše kot nakup z kategorijo 0
router.delete('/nakupi/:idNakupa', avtentikacija, ctrlNakupi.izbrisiNakup); //pricakuje GStoken posiljatelja ali admina in :idNakupa v URL | izbrise nakup in povrne denarna sredstva

/* Podatkovna baza */
//router.get('/brisidb', ctrlOstalo.brisiDB); //TBD
//router.get('/polnidb', ctrlOstalo.polniDB); //TBD

module.exports = router;
