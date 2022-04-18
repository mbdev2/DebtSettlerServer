//Gospodinjstvo
db.gospodinjstvo.insertOne({
    imeGospodinjstva: 'Blazev grad',
    nakljucnaVrednost: '218607afc62bef487a781c1dd0afae0f',
    zgoscenaVrednost: '76f988d737fd9d65450d93433def9a8b6aae6d1e4501936cd505349d9a702cd83325b8aef7672b9462ac7f95ee3031a4173eb5fec6a1912f95223f3718024a7e',
    uporabnikGospodinjstvo: [],
    nakupiGospodinjstvo: [],
    nakupovalniSeznamGospodinjstvo: []
})


//Uporabnik
db.uporabnik.insertOne({
    "_id": "5fc2b78f4be256386c6b96ed",
    "ime": "Mark",
    "email": "mark.breznik@gmail.com",
    "stanjeDenarja": "11656",
    "barvaUporabnika": "155ded",
    "nakljucnaVrednost": "8030ecec601d80053350ac0e5b59e0ad",
    "zgoscenaVrednost": "743d6c4acad134cd3abb068bc1cbb2a6d58f56276fd6e8014e5d0ee8dbadd7255c09ecb5e218553d7ac0a3bfa54eec6f0b76540f49b58abb567cb9838ff23d6a"
})


db.gospodinjstvo.updateOne({
    imeGospodinjstva: "Blazev grad"
}, {
    $push: {
        uporabnikGospodinjstvo: {
            _id: ObjectId(),
            uporabnikID: "5fc2b78f4be256386c6b96ed",
            stanjeDenarja: 2,
            porabljenDenar: 6,
            zamrznjenStatus: false
        }
    }
})