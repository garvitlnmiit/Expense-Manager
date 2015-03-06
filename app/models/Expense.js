var mongoose = require('mongoose');

module.exports = mongoose.model('Expense', {
  paymentType : {type : String, default: 'Cash'},
  friendName : {type : String},
  date : {type : String},
  dateTime : {type : Date},
  currencyType : {type : String, default: 'Rupees'},
  amount : {type : Number, default: 0}
});