var mongoose = require('mongoose');

module.exports = mongoose.model('Friend', {
  name : {type : String, default: ''}
});