var mongoose = require('mongoose');

module.exports = mongoose.model('Todo', {
    text: String,
    completed: Boolean,
    isPublic: Boolean,
    username: String
});
