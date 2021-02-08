# Wilma Plus Notifier (v2)
Next Generation of Wilma Plus Notifier

## Differences 

- Moving with language trends, node.js and typescript
- Different way of doing essentially the same thing, while saving device's battery and background CPU usage

## How to build
`npm run build`, builds typescript to js

`npm run production`, builds production version to folder dist

`npm run start`, builds, and then starts the server

## Startup (debug)
- Copy file `dbconfig.example.json` to `dbconfig.json` and fill in your database credentials.
- If you want to start debugging server (`npm run start`), copy file `config.debug.example.env` to `.env`, and fill in your settings.
- Run command `npm run start`

## Startup (Production)
- Copy file `dbconfig.example.json` to `dbconfig.json` and fill in your database credentials.
- If necessary, set your enviroment variables (supported variables list is [here](https://github.com/wilmaplus/notifier2/blob/master/docs/ENV.md))
- run `node server.js`

## REST API

(Check the [Wiki](https://github.com/developerfromjokela/notifier2/wiki) for a detailed guide)
Endpoints:

*POST* `/api/v1/push` - Check for new items to push

*POST* `/api/v1/delete` - Remove previously saved data from server

## Tests
- Copy file `tests/testconfig.example.json` to `tests/testconfig.json`, and fill in Wilma server details.
- Run `npm run test`
