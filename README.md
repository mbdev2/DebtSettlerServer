# DebtSettlerServer
## _The Last Spending App You Will Ever Need!_

This repo contains the REST API portion of our project. We also created an universal mobile app and a React-based web app.

Flutter Mobile APP: TBD

React Web APP: https://github.com/mbdev2/DebtSettlerWeb

DebtSettler is a cloud-enabled and mobile-ready household spending tracker designed for use in dorms and shared apartments.
Developed by Mark Breznik and Blaž Pridgar for a course in our gradute study program at the Faculty of Electrical Engineering, University of Ljubljana

## Features

API DOCUMENTATION: https://documenter.getpostman.com/view/17576566/2s8YRdsb5q

- Track household purchases with a flick of your finger
- Figure out who owes who what
- Share a cloud-synced shopping list with your housemates
- Intuitively pay back what you own
- Manage/ be part of multiple households
- Play around with various choices!


## Tech

DebtSettler uses several projects to work properly:

- jsonwebtoken - keep track of whose's who with privacy
- mongoose - gotta keep the data somewhere ;)
- passport - great web token manager
- node.js - evented I/O for the backend
- Express - fast node.js network app framework
- and many more...

And of course, DebtSettler itself is open source!


## Installation

We recommend using your local server and running it via Docker. To make it accesible to the outisde world, we recommend a free DDNS (e.g. DuckDNS) and a reverse proxy (e.g. Caddy).

Docker:

docker-compose up --build #first time build

docker-compose up -d --build #rebuild without destroying container data

## Development

DebtSettler is still actively being developed, so expect some feature updates in the future!

## License

MIT
**Free Software, Hell Yeah!**
