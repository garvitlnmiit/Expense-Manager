var Friend = require('./models/friend');
var Expense = require('./models/expense');

function getFriends(res){
  Friend.find(function(err, friends) {

      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err)
        res.send(err)

      res.json(friends); // return all friends in JSON format
    });
};

function getExpenses(res){
  Expense.find(function(err, expenses) {

      // if there is an error retrieving, send the error. nothing after res.send(err) will execute
      if (err)
        res.send(err)

      res.json(expenses); // return all expenses in JSON format
    });
};

module.exports = function(app) {

  // api ---------------------------------------------------------------------
  // get all friends
  app.get('/api/friends', function(req, res) {
    getFriends(res);
  });

  // get all expenses
  app.get('/api/expenses', function(req, res) {
    getExpenses(res);
  });


  // create friend and send back all friends after creation
  app.post('/api/friends', function(req, res) {

    // create a friend object, information comes from AJAX request from Angular
    Friend.create({
      name : req.body.name,
      done : false
    }, function(err, obj) {
      if (err)
        res.send(err);

      // get and return all the friends obj after you create another
      getFriends(res);
    });

  });

  // create expense and send back all expenses after creation
  app.post('/api/expenses', function(req, res) {

    // create a expense object, information comes from AJAX request from Angular
    Expense.create({
      paymentType : req.body.paymentType,
      friendName : req.body.friendName,
      date : req.body.date,
      dateTime : req.body.dateTime,
      currencyType : req.body.currencyType,
      amount : req.body.amount,
      done : false
    }, function(err, obj) {
      if (err)
        res.send(err);

      // get and return all the expense obj after you create another
      getExpenses(res);
    });

  });

  app.put('/api/expenses', function(req, res){
    console.log(req.body);
  });

  // delete an expense
  app.delete('/api/expenses/:expense_id', function(req, res) {
    Expense.remove({
      _id : req.params.expense_id
    }, function(err, obj) {
      if (err)
        res.send(err);

      getExpenses(res);
    });
  });

  // application -------------------------------------------------------------
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });
};