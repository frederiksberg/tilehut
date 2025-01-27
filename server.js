"use strict";

var express = require('express');
var app = exports.app = express();

const fs = require('fs');

var config = require('./config');
var TileService = require('./TileService');


var routeHandlers = {
  getTile: function(req, res, next) {
    var tileService = new TileService(req);
    tileService.getTile(function(err, tile, headers) {
      if (err) return res.status(404).send(err.message);
      res.set(headers);
      res.send(tile);
    });
  },
  getGrid: function(req, res, next) {
    var tileService = new TileService(req);
    tileService.getGrid(function(err, tile, headers) {
      if (err) return res.status(404).send(err.message);
      res.set(headers);
      res.send(tile);
    });
  },
  getInfo: function(req, res, next) {
    var tileService = new TileService(req);
    tileService.getInfo(function(err, info) {
      if (err) return res.status(404).send(err.message);
      res.json(info);
    });
  },
  ping: function(req, res, next){
    res.send('tilehut says pong!');
  },
  ls: function(req, res, next) {
    fs.readdir(config.TILES_DIR, function (err, files) {
      if (err) {
        res.status(404).send(err.message);
      }

      var info = {};

      files.forEach(function (file) {

        const basename = file.split('.').slice(0, -1).join('.');
        
        info[basename] = {"meta": "https://th.frb-data.dk/" + basename + "/meta.json", "interactive": "https://th.frb-data.dk/" + basename + "/map"};
      });
      res.json(info);
    });
  },
  // openshift expects to get a valid response from '/' (health status)
  healthStatus: function(req, res, next){
    res.send(':)');
  },
  root: function(req, res, next) {
    res.redirect('/landing/');
  }
};

// TODO Cache-Control: setting

app.disable('x-powered-by');
app.use('*', function(req, res, next) {
  // set CORS response header
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Cache-Control', 'max-age=3600, public');
  next();
});

app.use('/:ts/map', express.static(config.MAP_DIR));

app.route('/:ts/:z/:x/:y.*grid.json$').get(routeHandlers.getGrid);
app.route('/:ts/:z/:x/:y.*').get(routeHandlers.getTile);
app.route('/:ts/meta.json').get(routeHandlers.getInfo);
app.route('/ping').get(routeHandlers.ping);
app.route('/capabilities').get(routeHandlers.ls);
app.route('/').get(routeHandlers.root);

app.listen(config.PORT, config.IPADDRESS, function() {
  console.info('Tilehut on http://%s:%s', config.IPADDRESS, config.PORT);
});
