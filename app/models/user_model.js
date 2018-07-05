var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    username: {
      type: String,
      required: [true, 'Username cannot be blank']
    },
    password: {
      type: String,
      required: [true, 'Password can not be blank'],
      min: 5
    }
});
