const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
  // .all((req, res, next) => { ... }
  .get((req, res, next) => {
    Promotions.find({})
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions)
      }, (err) => next(err))
      .catch((err) => next(err))
    // res.end('Will send all the Promotions to you!');
  })
  .post((req, res, next) => {
    Promotions.create(req.body)
      .then((promotion) => {
        console.log('Promotion created', promotion)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      }, (err) => (err))
      .catch((err) => next(err))
    // res.end('Will add the Promo: ' + req.body.name + 'with details: ' + req.body.description);
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('Sorry PUT operation not supported on /promotions');
  })
  .delete((req, res, next) => {
    Promotions.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err))
    // res.end('Deleting all the Promotions!')
  })

//  === === === === === === === === === ===
//                /:promoId
//  === === === === === === === === === ===

promoRouter.route('/:promoId')
  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
      }, (err) => next(err))
      .catch((err) => next(err))
    // res.end('Will send details of the promo: ' + req.params.promoId + ' to you!');
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions/' + req.params.promoId);
  })
  .put((req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
      $set: req.body
    }, { new: true })
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(promotion)
      }, (err) => next(err))
      .catch((err) => next(err))
    // res.write('Updating promo: ' + req.params.promoId + '\n');
    // res.end(' Will update the promo ' + req.body.name + ' with details: ' + req.body.description);
  })
  .delete((req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
      }, (err) => next(err))
      .catch((err) => next(err))
    // res.end('Deleting promo: ' + req.params.promoId)
  });


module.exports = promoRouter;