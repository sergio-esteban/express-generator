const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
  // .all((req, res, next) => {
  //   res.statusCode = 200;
  //   res.setHeader('Content-Type', 'text/plain')
  //   next();
  // })
  .get((req, res, next) => {
    // from my Express server i'am accessing my MongoDB
    Dishes.find({})
      .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        //the res.json will take as an input in json string and then send it back over to my client
        //put this dishes into the body of the reply message.
        res.json(dishes);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    // res.end('Will add the dish: ' + req.body.name + 'with details: ' + req.body.description);
    Dishes.create(req.body)
      .then((dish) => {
        console.log('Dish created', dish)
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json')
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete((req, res, next) => {
    Dishes.remove({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
      }, (err) => next(err))
      .catch((err) => next(err))
  })


//  === === === === === === === === === ===
//                /:dishId
//  === === === === === === === === === ===

dishRouter.route('/:dishId')
  .get((req, res, next) => {
    // res.end('Will send detailsss of the dish: ' + req.params.dishId + ' to you!');
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/' + req.params.dishId);
  })
  .put((req, res, next) => {
    // res.write('Updating dish: ' + req.params.dishId + '\n');
    // res.end(' Will update the dish ' + req.body.name + ' with details: ' + req.body.description);
    Dishes.findByIdAndUpdate(req.params.dishId, {
      $set: req.body
    }, { new: true })
      .then((dish) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(dish)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .delete((req, res, next) => {
    // res.end('Deleting dish: ' + req.params.dishId)
    Dishes.findByIdAndRemove(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
      }, (err) => next(err))
      .catch((err) => next(err))
  });


//  === === === === === === === === === ===
//            /:dishId/comments
//  === === === === === === === === === ===


dishRouter.route('/:dishId/comments')
  .get((req, res, next) => {
    // locate the dish
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        //we need to worry about handling that particular situation, if a dish doesn’t exist
        if (dish != null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments);
        }
        else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          //cause the body of the message contains all the comments taht need to be pushed, the new sets of comments into the dish
          dish.comments.push(req.body);
          //saving the updated dish here
          dish.save()
            // returning the updated dish back to the user
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        } else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes/'
      + req.params.dishId + '/comments');
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null) {
          // looking at the array of comments, the -1 means starting for the last comments
          // in that array all way to the very first comment,
          for (var i = (dish.comments.length - 1); i >= 0; i--) {
            // this is the way we will access a sub-document is by saying dish.comments.id(dish.comments[i]._id)
            // and then specify the id of the sub-document you’re trying to access
            // deleting comment by comment by using .remove() method
            dish.comments.id(dish.comments[i]._id).remove();
          }
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        } else {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

//  -------------------------------------------------------
//            /:dishId/comments/:commentId
//  -------------------------------------------------------

dishRouter.route('/:dishId/comments/:commentId')
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish == null) {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/' + req.params.dishId
      + '/comments/' + req.params.commentId);
  })
  .put((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          // i want o update the fields of the comments, if the comment already exits i don't want to allow the user chande the author of the comment
          // the only 2 field i want to allow user update is rating and comment:
          // recall that the req.body will contain the update we are trying to do in this case the dish
          // there is no explicit way that Mongoose supports for unpdating an embedded document, this is the workaround that i found that enables us to carry out this operation
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
          }
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        } else if (dish == null) {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then((dish) => {
        //ensure first that the dish and the comment exists
        if (dish != null && dish.comments.id(req.params.commentId) != null) {
          //then i will delete a specific comment
          dish.comments.id(req.params.commentId).remove();
          // i will save the changes to the dish
          dish.save()
            .then((dish) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(dish);
            }, (err) => next(err));
        } else if (dish == null) {
          err = new Error('Dish ' + req.params.dishId + ' not found');
          err.status = 404;
          return next(err);
        }
        else {
          err = new Error('Comment ' + req.params.commentId + ' not found');
          err.status = 404;
          return next(err);
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

// go to postman an make some request
// localhost:3000/dishes/5d2bf51dcb221417b0376891/comments/5d3a31723747260c2022ec51
// first we need to post a entire dish, then PUT or update by adding a new comment, GET the comment above copy and paste the specigic id
// and PUT or update again  the prevously created comment
// ypu can DELETE a specific comment, or all the comments
module.exports = dishRouter;