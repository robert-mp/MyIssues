var model = require('./model_mongo');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

const zmq = require('zeromq');
const sock = zmq.socket('pull');

var port = 8080;
if (process.argv.length > 2) port = Number.parseInt(process.argv[2]);

var portAsync = port + 1000;
sock.bind("tcp://127.0.0.1:" + portAsync, (err) => {
 if (err) console.log(err.stack);
 else console.log('Listening async on ' + portAsync);
});

sock.on('message', (msg) => {
    console.log('Received message: ' + msg.toString());
    msg = JSON.parse(msg.toString());
    console.log(msg);
    switch (msg.type) {
        case 'addUser':
            console.log('add user ' + JSON.stringify(msg.data));
            model.addUser(msg.data, (err, user) => {
                if (err) console.log('add user ERROR: ' + err.stack);
                else console.log('add user SUCCESS');
            });
            break;
        case 'updateUser':
            console.log('update user ' + JSON.stringify(msg.data));
            model.updateUser(msg.token, msg.data, (err, user) => {
                if (err) console.log('uppdate user ERROR: ' + err.stack);
                else console.log('update user SUCCESS');
            });
            break;
        case 'removeUser':
            console.log('remove user ' + JSON.stringify(msg.data));
            model.removeUser(msg.token, msg.data, (err, user) => {
                if (err) console.log('remove user ERROR: ' + err.stack);
                else console.log('remove user SUCCESS');
            });
            break;
        case 'addWorkspace':
            console.log('add workspace ' + JSON.stringify(msg.data));
            model.addWorkspace(msg.token,msg.data, (err, user) => {
                if (err) console.log('add workspace ERROR: ' + err.stack);
                else console.log('add workspace SUCCESS');
            });
            break;
        case 'updateWorkspace':
            console.log('update workspace ' + JSON.stringify(msg.data));
            model.updateWorkspace(msg.token, msg.data, msg.id, (err, user) => {
                if (err) console.log('uppdate workspace ERROR: ' + err.stack);
                else console.log('update workspace SUCCESS');
            });
        case 'removeWorkspace':
            console.log('remove workspace ' + JSON.stringify(msg.data));
            model.removeWorkspace(msg.token, msg.data, (err, user) => {
                if (err) console.log('remove workspace ERROR: ' + err.stack);
                else console.log('remove workspace SUCCESS');
            });
            break;
        case 'addIssue':
            console.log('add Issue ' + JSON.stringify(msg.data));
            model.addIssue(msg.token, msg.id,msg.data, (err, user) => {
                if (err) console.log('add Issue ERROR: ' + err.stack);
                else console.log('add Issue SUCCESS');
            });
            break;
        case 'updateIssue':
            console.log('update issue ' + JSON.stringify(msg.data));
            model.updateWorkspace(msg.token,msg.id, msg.data, (err, user) => {
                if (err) console.log('uppdate issue ERROR: ' + err.stack);
                else console.log('update Issue SUCCESS');
            });
        case 'removeIssue':
            console.log('remove Issue ' + JSON.stringify(msg.data));
            model.removeWorkspace(msg.token, msg.data, (err, user) => {
                if (err) console.log('remove Issue ERROR: ' + err.stack);
                else console.log('remove Issue SUCCESS');
            });
            break;
        case 'addAction':
            console.log('add action ' + JSON.stringify(msg.data));
            model.addIssue(msg.token, msg.id ,msg.data, (err, user) => {
                if (err) console.log('add action ERROR: ' + err.stack);
                else console.log('add Action SUCCESS');
            });
            break;
        default:
            console.log("DEFAULT");
    }
});


app.use(function (req, res, next) {
    console.log(`authorize ${req.method} ${req.originalUrl}`);
    /* Authorization */
    if ((req.path == '/myissues/sessions' && req.method == 'POST') ||
        (req.path == '/myissues/users' && req.method == 'POST')) {
        next();
    } else if (!req.query.token){ 
        //console.dir(req,{depth: null})
        console.log(req.body)
        console.log(req.query)
        console.log("hola")
        res.status(401).send('Token not found');
    }
    //TODO comprobar que el token existe en la DB
    //else if()
    else next();
});

/** Login **/
app.post('/myissues/sessions', function (req, res) {
    console.log('login ' + JSON.stringify(req.body));
    if (!req.body.email || !req.body.password)
        res.status(400).send('Parameters missing');
    else {
        model.login(req.body.email, req.body.password, (err, token, user) => {
            if (err) {
                console.log(err.stack);
                res.status(400).send(err);
            } else {
                res.send({ token: token, user: user });
            }
        });
    }
});

// addUser
app.post('/myissues/users', function (req, res) {
    console.log('add user ' + JSON.stringify(req.body));
    model.addUser(req.body, (err, user) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send(user);
    });
});

//listUsers
app.get('/myissues/users', function (req, res) {
    console.log('list users ' + JSON.stringify(req.query));
    let query = {};
    if (req.query.query) query = JSON.parse(req.query.query);
    model.listUsers(req.query.token, query, (err, users) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(users);
        }
    });
});

//listUsers + usuario especifico
app.get('/myissues/users/:id', function (req, res) {
    console.log('list user ' + JSON.stringify(req.params.id));
    let query = JSON.parse(req.query.query);
    //console.log("server"+query)
    model.listUsers(req.query.token, query, (err, users) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(users);
        }
    });
});

//updateUsers
app.put('/myissues/users/:id', function (req, res) {
    console.log('Updating User ' + req.params.id);
    if (req.query.data){ data = JSON.parse(req.query.data);}
    //data=JSON.stringify(data);
    model.updateUser(req.query.token, req.params.id ,data, (err, response) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            console.log(`Succesfully done \n ${response}`)
            res.send(`Succesfully done \n ${response}`);
        }
    });
});

//removeUser
app.delete('/myissues/users/:id', function(req,res){
    console.log(`Removing User ${req.params.id}`)
    model.removeUser(req.query.token, req.params.id, (err, response)=>{
        if (err){
            console.log(err.stack);
        } else {
            console.log(`Succesfully done \n ${response}`)
            res.send(`Succesfully done \n ${response}`)
        }
    })
})

//addWorkspace
app.post('/myissues/workspaces', function (req, res) {
    console.log('add workspace ' + JSON.stringify(req.body));
    model.addWorkspace(req.query.token, req.body, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send(workspace);
    });
});

//listWorkspaces
app.get('/myissues/workspaces', function (req, res) {
    console.log('list workspaces ' + JSON.stringify(req.query.query));
    let query = JSON.parse(req.query.query);
    //if (req.query.query) query = req.query.query;
    model.listWorkspaces(req.query.token, query, (err, workspaces) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspaces);
        }
    });
});

//list with specified ID
app.get('/myissues/workspaces/:id', function (req, res) {
    console.log('list workspace ' + JSON.stringify(req.params.id));
    let query = JSON.parse(req.query.query);
    //console.log("server"+query)
    model.listWorkspaces(req.query.token, query, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspace);
        }
    });
});

//listUsers of Workspace
//list with specified ID
app.get('/myissues/workspaces/:id/members', function (req, res) {
    console.log('list members of workspace ' + JSON.stringify(req.params.id));
    let query = JSON.parse(req.query.query);
    //console.log("server"+query)
    model.listMembers(req.query.token, req.params.id,query, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspace);
        }
    });
});

//updateWorkspace
app.put('/myissues/workspaces/:id', function (req, res) {
    console.log('Updating Workspace ' + req.params.id);
    console.dir(req.params,{depth: null});
    if (req.query.data){ data = JSON.parse(req.query.data);}
    //data=JSON.stringify(data);
    model.updateWorkspace(req.query.token,data, req.params.id , (err, response) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            console.dir(`Succesfully done \n ${response}`, {depth:null})
            res.send(`Succesfully done \n ${response}`);
        }
    });
});

//removeUser
app.delete('/myissues/workspaces/:id', function(req,res){
    console.log(`Removing Worpsace ${req.params.id}`)
    model.removeWorkspace(req.query.token, req.params.id, (err, response)=>{
        if (err){
            console.log(err.stack);
        } else {
            console.dir(`Succesfully done `+response, {depth:null})
            res.send(`Succesfully done \n ${response}`)
        }
    })
})

//joinWorkspace
app.post('/myissues/workspaces/:wID/members/:uID', function (req, res) {
    console.log(`User ${req.params.uID} joins workspace ${req.params.wID}`);
    model.joinWorkspace(req.query.token, req.params.uID, req.params.wID,(err, response) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send("Done");
    });
});

//leaveWorkspace
app.delete('/myissues/workspaces/:wID/members/:uID', function (req, res) {
    console.log(`User ${req.params.uID} leaves workspace ${req.params.wID}`);
    model.leaveWorkspace(req.query.token, req.params.uID, req.params.wID,(err, response) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send("Done");
    });
});

//addIssue
app.post('/myissues/workspaces/:id/issues', function (req, res) {
    console.log('add issue ' + JSON.stringify(req.body));
    model.addIssue(req.query.token, req.params.id,req.body, (err, issue) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send(issue);
    });
});

//listIssues of workspace
app.get('/myissues/workspaces/:id/issues', function (req, res) {
    console.log('list issues of workspace ' + JSON.stringify(req.params.id));
    let query = req.query.query;
    //console.log("server"+query)
    model.listIssues(req.query.token, query, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspace);
        }
    });
});

//listIssues with this id
app.get('/myissues/issues/:id', function (req, res) {
    console.log('list issues ' + JSON.stringify(req.params.id));
    let query = req.query.query;
    //console.log("server"+query)
    model.listIssues(req.query.token, query, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspace);
        }
    });
});

//updateIssue
app.put('/myissues/issues/:id', function (req, res) {
    console.log('Updating issues ' + req.params.id);
    console.dir(req.params,{depth: null});
    if (req.query.data){ data = JSON.parse(req.query.data);}
    //data=JSON.stringify(data);
    model.updateIssue(req.query.token,req.params.id, data , (err, response) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            console.dir(`Succesfully done \n ${response}`, {depth:null})
            res.send(`Succesfully done \n ${response}`);
        }
    });
});

//removeIssue
app.delete('/myissues/issues/:id', function(req,res){
    console.log(`Removing issue  ${req.params.id}`)
    model.removeIssue(req.query.token, req.params.id, (err, response)=>{
        if (err){
            console.log(err.stack);
        } else {
            console.dir(`Succesfully done `+response, {depth:null})
            res.send(`Succesfully done \n ${response}`)
        }
    })
})

//addAction
app.post('/myissues/issues/:id/actions', function (req, res) {
    console.log('add action ' + JSON.stringify(req.body));
    model.addIssue(req.query.token, req.params.id,req.body, (err, action) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else res.send(action);
    });
});

app.get('/myissues/issues/:id/actions', function (req, res) {
    console.log('list actions of issue ' + JSON.stringify(req.params.id));
    let query = req.query.query;
    model.listActions(req.query.token,req.params.id, query, (err, workspace) => {
        if (err) {
            console.log(err.stack);
            res.status(400).send(err);
        } else {
            res.send(workspace);
        }
    });
});
/*

    TODO Implementar toda la API RESTful

*/

app.listen(8080);
console.log('Service started :)');
