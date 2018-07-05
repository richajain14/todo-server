var _ = require('lodash');
var Todo = require('./models/todo_model');
var User = require('./models/user_model');

function getTodos(res, user) {
    Todo.find({
        $or: [{ username: user }, { isPublic: true }]
    }, function (err, todos) {
        console.log(`HERE 4 ${todos}`);
        if (err) {
            return res.status(404).send(err);
        }

        res.json(todos);
    });
};

function getUser(req, res) {
    User.find({
        username: req.body.username,
        password: req.body.password
    }, function(err, user) {
        if (err) {
            return res.status(500).send(err);
        }

        if (_.isEmpty(user)) {
            return res.status(404).send('Either username or password is incorrect.');
        }

        res.json(user);
    });
}

module.exports = function (app) {
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    /*get all todos*/
    app.get('/api/todos', function (req, res) {
        // use mongoose to get all todos in the database
        console.log(`HERE 1 ${req.query.username}`);
        const username = req.query.username;
        getTodos(res, username);
    });

    /*get all users*/
    app.get('/api/users', function (req, res) {
        // use mongoose to get all users in the database
        User.find({}, function(err, users) {
            if (err) {
                return res.status(404).send(err);
            }

            res.json(users);
        });
    });

    /*create todo and send back all todos after creation*/
    app.post('/api/todos', function(req, res) {
        // create a todo, information comes from AJAX request from client side
        Todo.create({
            text: req.body.text,
            completed: req.body.completed,
            isPublic: req.body.isPublic,
            username: req.body.username
        }, function (err) {
            if (err) {
                return res.send(err);
            }

            // get and return all the todos after you create another
            getTodos(res, req.body.username);
        });
    });

    /*update a Todo and return updated todo*/
    app.put('/api/todos/:todoId', function(req, res) {
        var id = req.params.todoId;

        if (_.isEmpty(id)) {
            return res.status(500).send('Invalid todo id');
        }

        Todo.findById(id, function(error, todo) {
            if (_.isEmpty(todo)) {
                return res.status(500).send('Todo cannot be updated');
            }

            if (error) {
                return res.status(500).send(error);
            }

            todo.text = req.body.text;
            todo.completed = req.body.completed;
            todo.isPublic = req.body.isPublic;
            todo.username = req.body.username;

            todo.save(function(error, updatedTodo) {
                if (error) {
                    return res.status(500).send(error);
                }

                return res.send(updatedTodo);
            });
        });
    });

    app.delete('/api/todos/:todoId', function(req, res) {
        Todo.findByIdAndRemove(req.params.todoId, function(err, todo) {
            if (err) {
                return res.status(500).send(err);
            }

            return res.status(200).send('Todo successfully deleted');
        });
    });

    /*Create User api*/
    app.post('/api/user', function(req, res) {
        User.find({ username: req.body.username }, function(err, user) {
            if (err) {
                return res.status(404).send('User could not be created.');
            } else {
                if (_.isEmpty(user)) {
                    User.create({
                        username: req.body.username,
                        password: req.body.password
                    }, function(err, user) {
                        console.log(`HERE 2 ${err}`);
                        console.log(`HERE 3 ${user}`);

                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            return res.send('User successfully created');
                        }
                    });
                } else {
                    var response = {
                        message: 'User already exists',
                        user: user
                    };
                    res.json(response);
                }
            }
        });
    });

    app.post('/api/authenticateUser', function(req, res) {
        getUser(req, res);
    });
};
