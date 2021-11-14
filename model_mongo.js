/*let users = {
    "u1": {
        id: "u1",
        name: "User 1",
        surname: "Surname 1",
        email: "u1",
        password: "xxx",
        workspaces: ["w1"]
    },
    "u2": {
        id: "u2",
        name: "User 2",
        surname: "Surname 2",
        email: "u2@upv.es",
        password: "xxx",
        workspaces: ["w1"]
    }
};
let workspaces = {
    "w1": {
        id: "w1",
        title: "Workspace 1",
        desc: "Workspace 1",
        users: ["u1", "u2"]
    }
};
let issues = {
    "i1": {
        id: "i1",
        workspace: "w1",
        title: "Issue 1",
        ini: 1633284222739,
        due: 1633284222739,
        actions: [
            {
                type: "propose",
                created: 1633284222739,
                owner: "u1",
                content: ""
            },
            {
                type: "assign",
                created: 1633284222739,
                owner: "u1",
                content: "u2"
            },
            {
                type: "accept",
                created: 1633284222739,
                owner: "u2",
                content: ""
            },
            {
                type: "complete",
                created: 1633284222739,
                owner: "u2",
                content: ""
            },
        ]
    }
};*/

const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const url = 'mongodb://localhost:27017';
//-----------Users------------------

function addUser(user, cb) {
    //Comprobamos que nos pasen todos los datos del usuario
    if (!user) cb(new Error("Missing User Data :("));
    else if (!user.name) cb(new Error("Missing User Name :("));
    else if (!user.surname) cb(new Error("Missing User Surname :("));
    else if (!user.email) cb(new Error("Missing User Email :("));
    else if (!user.password) cb(new Error("Missing User password :("));
    else {
        //Comprobamos si el usuario esta ya en la base de datos
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                //Comprobamos si el usuario ya existe
                users.findOne({ email: user.email },
                    (err, _user) => {
                        if (err) _cb(err);
                        else if (_user) _cb(new Error('User already exists'));
                        else {
                            //Añadimos al usuario
                            user.workspaces = [];
                            users.insertOne(user, (err, result) => {
                                if (err) _cb(err);
                                else {
                                    _cb(null, {
                                        id: result.insertedId.toHexString(),
                                        name: user.name, surname: user.name, email: user.email
                                    });
                                }
                            });
                        }
                    });
            }
        });
    }
}

function listUsers(token, query, cb) {
    //Comprobamos que haya token y que la query no este vacia
    if (!token) cb(new Error("Missing Token"));
    else if (!query) cb(new Error("Missing query"));
    else {
        query= JSON.parse(query);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                //Comprobamos que el usuario esta loguado con un token valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Creamos la lista con los resultados
                        users.find(query).toArray((err, _results) => {
                            if (err) _cb(err);
                            else {
                                let results = _results.map((user) => {
                                    return {
                                        id: user._id.toHexString(), name: user.name,
                                        surname: user.surname, email: user.email, workspaces: user.workspaces
                                    };
                                });
                                _cb(null, results);
                            }
                        });
                    }
                });
            }
        });

    }
}

function login(email, password, cb) {
    //Comprobamos que nos pasan los datos necesarios
    if (!email) cb(new Error("Missing email :("));
    else if (!password) cb(new Error("Missing Password"));
    {
        //Conectamos a Mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                //Create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Acedemos a la base de datos y collection
                let db = client.db('myissues');
                let users = db.collection('users');
                //Comprobamos que las credenciales son correctas
                //console.log(`users.findOne({email: ${email} , password: ${password}`)
                users.findOne({ email: email, password: password },
                    (err, _user) => {
                        if (err) _cb(err);
                        if (!_user) cb(new Error("Wrong Credentials"));
                        else {
                            //console.log(_user);
                            _cb(null, _user._id, _user);
                        }
                    });
            }
        });
    }
}

function removeUser(token, userID, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!userID) cb(new Error("Missing UserID"));
    else {
        //Nos conectamos a Mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Eliminamos al usuario *** Actuamos como si userID no fuera un ObjectID y lo transformamos 
                        users.deleteOne({ _id: new mongodb.ObjectID(userID) }, (err, _result) => {
                            if (err) _cb(err);
                            if(_result.deletedCount==0) _cb(new Error("User Not Found"));
                            else {
                                //console.log(_result);
                                _cb(null, _result)
                            }
                        });
                    }
                });
            }
        });
    }
}

//No funciona no entiendo bien como se pasa data si se recive como diccionario y como tiene que recibirlo mongo
function updateUser(token, userID, data, cb) {
    //Comprobamos que los datos estan
    if (!token) cb(new Error("Missing Token"));
    else if (!userID) cb(new Error("Missing UserID"));
    else if (!data) cb(new Error("Missing data"));
    else {
        //Haciendo stringify y parse conseguimos que data no tenga valores a null y cuando lo pasemos a la funcion no 
        //nos ponga a null valores que el usuario no quiere cambiar
        data=JSON.stringify(data);
        data=JSON.parse(data);
        //Conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Update al usuario *** Actuamos como si userID no fuera un ObjectID y lo transformamos
                        //console.log(`users.updateOne({_id: new mongodb.ObjectID(userID)}, ${data} , (err, _result)`);
                        users.updateOne({ _id: new mongodb.ObjectID(userID) }, {$set :data}, (err, _result) => {
                            if (err) _cb(err);
                            else if (_result.matchedCount==0) _cb(new Error("UserID not found"));
                            else if (_result.modifiedCount==0)_cb(new Error("Couldn't modify that user with the given data"));
                            else {
                                _cb(null, _result);
                            }
                        });
                    }
                });
            }
        });
    }
}



//------------Workspaces------------

function addWorkspace(token, workspace, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!workspace) cb(new Error("Missing Workspace Data :("));
    else if (!workspace.title) cb(new Error("Missing Title :("));
    else {
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection workspaces
                let db = client.db('myissues');
                let workspaces = db.collection('workspaces');
                let users = db.collection('users');

                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Comprobamos si existe una workspace con el mismo nombre
                        workspaces.findOne({ title: workspace.title },
                            (err, _workspace) => {
                                if (err) _cb(err);
                                else if (_workspace) _cb(new Error('Workspace already exists'));
                                else {
                                    //Añadimos la workspace en la collection workspaces
                                    workspace.users = [token];
                                    workspaces.insertOne(workspace, (err, result) => {
                                        if (err) _cb(err);
                                        else if (result) {
                                            //Añadimos la workspace en el campor workspaces del usuario que la crea
                                            users.updateOne({ "_id": new mongodb.ObjectId(token) }, { $push: { workspaces: result.insertedId } }, (err, result2) => {
                                                if (err) _cb(err);
                                                else {
                                                    _cb(null, {
                                                        id: result.insertedId.toHexString(),
                                                        title: result.title, desc: result.desc, users: result.users
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                    }
                });
            }
        });
    }
}

function updateWorkspace(token, data, id, cb) {
    //Comprobamos que los datos estan
    if (!token) cb(new Error("Missing Token"));
    else if (!id) cb(new Error("Missing UserID"));
    else if (!data) cb(new Error("Missing data"));
    else {
        //Haciendo stringify y parse conseguimos que data no tenga valores a null y cuando lo pasemos a la funcion no 
        //nos ponga a null valores que el usuario no quiere cambiar
        data=JSON.stringify(data);
        data=JSON.parse(data);
        //Conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                let workspaces= db.collection('workspaces');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Update al workspace *** Actuamos como si userID no fuera un ObjectID y lo transformamos                        
                        workspaces.updateOne({ _id: new mongodb.ObjectID(id) }, {$set :data}, (err, _result) => {
                            if (err) _cb(err);
                            else if (_result.matchedCount==0) _cb(new Error("UserID not found"));
                            else if (_result.modifiedCount==0)_cb(new Error("Couldn't modify that user with the given data"));
                            else {
                                _cb(null, _result);
                            }
                        });
                    }
                });
            }
        });
    }
}

function joinWorkspace(token, userID, workspaceID, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!workspaceID) cb(new Error("Missing workspaceID"));
    else if (!userID) cb(new Error("No userID"));
    else {
        rwID = new mongodb.ObjectId(workspaceID);
        ruID = new mongodb.ObjectId(userID);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos, a la collection users y workspace
                let db = client.db('myissues');
                let users = db.collection('users');
                let workspaces = db.collection('workspaces');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //updateamos user y workspaces 
                        //usamos $addToSet en vez de $push por si el usuario esta en ya en el worksapce que no se añada otra vez
                        users.updateOne({ _id: ruID }, { $addToSet: { workspaces: new mongodb.ObjectId(workspaceID) } }, (err, _userID) => {
                            if (err) _cb(err);
                            else if (_userID.modifiedCount==0) _cb(new Error('Wrong userID'));
                            else {
                                console.log(_userID);
                                workspaces.updateOne({ _id: rwID }, { $addToSet: { users: ruID } }, (err, _workspaceID) => {
                                    if (err) _cb(err);
                                    else if (_workspaceID.modifiedCount==0) _cb(new Error('Wrong worksapceID'));
                                    else {
                                        _cb(null, _userID,_workspaceID);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

function leaveWorkspace(token, userID, workspaceID, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!workspaceID) cb(new Error("Missing workspaceID"));
    else if (!userID) cb(new Error("No userID"));
    else {
        rwID = new mongodb.ObjectId(workspaceID);
        ruID = new mongodb.ObjectId(userID);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos, a la collection users y workspace
                let db = client.db('myissues');
                let users = db.collection('users');
                let workspaces = db.collection('workspaces');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //updateamos user y workspaces con un pull
                        users.updateOne({ _id: ruID }, { $pull: { workspaces: rwID } }, (err, _userID) => {
                            if (err) _cb(err);
                            else if (_userID.matchedCount == 0) _cb(new Error('Wrong userID'));
                            else {
                                //console.log(_userID);
                                workspaces.updateOne({ _id: rwID }, { $pull: { users: ruID } }, (err, _workspaceID) => {
                                    if (err) _cb(err);
                                    else if (_workspaceID.matchedCount == 0) _cb(new Error('Wrong worksapceID'));
                                    else {
                                        _cb(null, _workspaceID, _userID);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

function removeWorkspace(token, workspaceID, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!workspaceID) cb(new Error("Missing workspaceID"));
    else {

        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                let workspaces = db.collection('workspaces');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Eliminamos el workspace de los usuarios
                        users.updateMany({ workspaces: new mongodb.ObjectId(workspaceID) }, { $pull: { workspaces: new mongodb.ObjectId(workspaceID) } }, (err, ruser) => {
                            if (err) _cb(err);
                            if (!ruser) _cb(err);
                            //if (ruser.matchedCount == 0) _cb(new Error("workspaceID not found"));
                            else {
                                //eliminamos el workspace de la collection workspace
                                workspaces.deleteOne({ _id: new mongodb.ObjectID(workspaceID) }, (err, _result) => {
                                    if (err) _cb(err);
                                    else {
                                        //console.log(_result);
                                        _cb(null, _result)
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
}

function listWorkspaces(token, query, cb) {
    //Comprobamos que haya token y que la query 
    if (!token) cb(new Error("Missing Token"));
    else if (!query) cb(new Error("Missing query"));
    else {
        query=JSON.parse(query);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y collection users y workspacs
                let db = client.db('myissues');
                let users = db.collection('users');
                let workspaces = db.collection('workspaces');
                //Comprobamos que el usuario esta loguado con un token valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Creamos la lista con los resultados
                        workspaces.find(query).toArray((err, _results) => {
                            if (err) _cb(err);
                            else {
                                let results = _results.map((workspace) => {
                                    return {
                                        id: workspace._id.toHexString(), title: workspace.title,
                                        desc: workspace.desc, users: workspace.users
                                    };
                                });
                                _cb(null, results);
                            }
                        });
                    }
                });
            }
        });

    }
}

function addIssue(token, workspaceId, issue, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!workspaceId) cb(new Error("Missing Workspace Data :("));
    else if (!issue) cb(new Error("Missing Issue :("));
    else if (!issue.title) cb(new Error("Missing Title"));
    else if (!issue.ini) cb(new Error("Missing Iniciation date"));
    else {

        issue.ini = new Date(issue.ini);
        if (issue.due) issue.due = new Date(issue.due);
        issue.workspace = new mongodb.ObjectId(workspaceId);
        issue.state = "propuesta";
        issue.actions = [{
            type: "proponer",
            created: new Date(),
            owner: new mongodb.ObjectId(token),
            content: ""
        }];
        //comprobacion de que las fechas esten bien escritas
        if (issue.ini == "Invalid Date" || issue.due == "Invalid Date") cb(new Error("Invalid date date format should be YYYY-MM-DD"));
        else if (issue.due < new Date()) cb(new Error("Error: Due date is before today"));
        else if (issue.due < issue.ini) cb(new Error("Error: Due date before initial date"));
        else {
            //Nos conectamos a mongo
            MongoClient.connect(url, function (err, client) {
                if (err) cb(err);
                else {
                    // create new callback for closing connection
                    _cb = function (err, res) {
                        client.close();
                        cb(err, res);
                    }
                    //Accedemos a la base de datos y a la collection workspaces y issues
                    let db = client.db('myissues');
                    let workspaces = db.collection('workspaces');
                    let users = db.collection('users');
                    let issues = db.collection('issues');
                    //Comprobamos el token
                    users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                        if (err) _cb(err);
                        else if (!_user) _cb(new Error('Wrong token'));
                        else {
                            //Comprobamos si existe una issue con el mismo nombre
                            issues.insertOne(issue, (err, result) => {
                                if (err) _cb(err);
                                else if (result) {
                                    _cb(null, result);
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}

function updateIssue(token, issueId, data, cb) {
    //Comprobamos que los datos estan
    if (!token) cb(new Error("Missing Token"));
    else if (!issueId) cb(new Error("Missing IssueId"));
    else if (!data) cb(new Error("Missing data"));
    else {
        //Haciendo stringify y parse conseguimos que data no tenga valores a null y cuando lo pasemos a la funcion no 
        //nos ponga a null valores que el usuario no quiere cambiar
        data=JSON.stringify(data);
        data=JSON.parse(data);
        //Conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y a la collection users
                let db = client.db('myissues');
                let users = db.collection('users');
                let issues= db.collection('issues');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        issues.updateOne({ _id: new mongodb.ObjectID(issueId) }, {$set :data}, (err, _result) => {
                            if (err) _cb(err);
                            else if (_result.matchedCount==0) _cb(new Error("issueID not found"));
                            else if (_result.modifiedCount==0)_cb(new Error("Couldn't modify that user with the given data"));
                            else {
                                _cb(null, _result);
                            }
                        });
                    }
                });
            }
        });
    }

}

function removeIssue(token, issueId, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!issueId) cb(new Error("Missing IssueId"));
    else {
        //Nos conectamos a Mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos, a la collection users y issues
                let db = client.db('myissues');
                let users = db.collection('users');
                let issues = db.collection('issues');
                //Comprobamos si el usuario si el token es valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Eliminamos a la Issue 
                        issues.deleteOne({ _id: new mongodb.ObjectID(issueId) }, (err, _result) => {
                            if (err) _cb(err);
                            if (_result.deletedCount == 0) _cb(new Error("issueID not found"));
                            else {
                                _cb(null, _result);
                            }
                        });
                    }
                });
            }
        });
    }
}

function listIssues(token, query, cb) {
    //Comprobamos que haya token y que la query 
    if (!token) cb(new Error("Missing Token"));
    else if (!query) cb(new Error("Missing query"));
    else {
        query= JSON.parse(query);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y collection users y workspacs
                let db = client.db('myissues');
                let users = db.collection('users');
                let isuess = db.collection('issues');
                //Comprobamos que el usuario esta loguado con un token valido
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Creamos la lista con los resultados
                        isuess.find(query).toArray((err, _results) => {
                            if (err) _cb(err);
                            else {
                                
                                let results = _results.map((issue) => {
                                    var _actions= issue.actions.map((action)=>{
                                        //if(action.content!="") action.content= action.content.toHexString();
                                        return {
                                            type: action.type, created: action.created, owner: action.owner.toHexString(),
                                            content: action.content
                                        }
                                    });
                                    //para que se imprima en parte cli la actions he tenido que hacer un JSON.stringify poniendo solo _actions despues de haber mapeado 
                                    //no da los resultados esperados y en cli se sigue mostrando como object aunque si hacemos console.log desde aqui se imprima bien
                                    //console.log(_actions);
                                    return { 
                                        id: issue._id.toHexString(), title: issue.title, state : issue.state,
                                        ini: issue.ini, due: issue.due , actions: JSON.stringify(_actions)
                                    };
                                });
                                _cb(null, results);
                            }
                        });
                    }
                });
            }
        });

    }
}

function addAction(token, issueID, action, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!issueID) cb(new Error("Missing issueID Data :("));
    else if (!action) cb(new Error("Missing Issue :("));
    else if (!action.type) cb(new Error("Missing Type"));
    else {
        //action.content = "";
        //if (assignedUser) action.content = new mongodb.ObjectId(assignedUser);
        action.created = new Date();
        action.owner = new mongodb.ObjectId(token);
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                let db = client.db('myissues');
                let users = db.collection('users');
                let issues = db.collection('issues');
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {

                        issues.findOne({ _id: new mongodb.ObjectId(issueID) }, (err, _issue) => {
                            if (err) _cb(err);
                            else if (!_issue) _cb(new Error("Wrong IssueID"));
                            else {

                                actual_state = _issue.state;
                                switch (action.type) {
                                    case "comentar":
                                    case "actualizar":
                                        if (actual_state == "rechazada" || actual_state == "completada") cb(new Error("Cannot perform that action in this state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $set: { "actions": action } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    case "proponer":
                                        if (actual_state != "completada") cb(new Error("Cannot go to that state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $set: { "actions": action }, $set: { state: "propuesta" } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    case "asignar":
                                        if (actual_state != "propuesta") cb(new Error("Cannot go to that state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $push: { "actions": action }, $set: { state: "asignada" } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    case "aceptar":
                                        if (actual_state != "asignada") cb(new Error("Cannot go to that state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $push: { "actions": action }, $set: { state: "aceptada" } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    case "rechazar":
                                        if (actual_state != "aceptada") cb(new Error("Cannot go to that state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $push: { "actions": action }, $set: { state: "rechazada" } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    case "completar":
                                        if (actual_state != "aceptada") cb(new Error("Cannot go to that state"));
                                        else {
                                            issues.updateOne({ _id: new mongodb.ObjectId(issueID) }, { $push: { "actions": action }, $set: { state: "completada" } }, (err, result) => {
                                                if (err) _cb(err)
                                                else if (result.modifiedCount == 0) _cb(new Error("Wrong IssueID"));
                                                else {
                                                    _cb(null, result);
                                                }
                                            });
                                        }
                                        break;
                                    default:
                                        cb(new Error("Wrong action type"));
                                        break;
                                }

                            }
                        });

                    }
                });
            }
        });
    }
}
function listActions(token, issueId, query, cb) {
    //Comprobamos que haya token y que la query 
    if (!token) cb(new Error("Missing Token"));
    else if (!query) cb(new Error("Missing query"));
    else {
        //let query2=query
        //query= JSON.parse(query);
        query._id= new mongodb.ObjectId(issueId);
        //intente que las querys funcionaran pero no iba bien, el principal problema es que guardamos las actionns en 
        //mongo db como arrys de objectos no como objetos como tal... 
        //lo cual facilita para hacer el .map para imprimir pero no nos deja hacer querys a actions de esta manera
        //query2= JSON.parse(query2);
        //let query3={};
        //query3.actions=query2
        //console.log(query3);
        //Nos conectamos a mongo
        MongoClient.connect(url, function (err, client) {
            if (err) cb(err);
            else {
                // create new callback for closing connection
                _cb = function (err, res) {
                    client.close();
                    cb(err, res);
                }
                //Accedemos a la base de datos y collection users y workspacs
                let db = client.db('myissues');
                let users = db.collection('users');
                let isuess = db.collection('issues');
                //Comprobamos que el usuario esta loguado con un token valido
                //console.log(query);
                users.findOne({ _id: new mongodb.ObjectID(token) }, (err, _user) => {
                    if (err) _cb(err);
                    else if (!_user) _cb(new Error('Wrong token'));
                    else {
                        //Creamos la lista con los resultados
                        isuess.find(query).toArray((err, _results) => {
                            if (err) _cb(err);
                            else {
                                console.log(_results);
                                let results = _results.map((issue) => {
                                    var _actions= issue.actions.map((action)=>{
                                        //if(action.content!="") action.content= action.content.toHexString();
                                        return {
                                            type: action.type, created: action.created, owner: action.owner.toHexString(),
                                            content: action.content
                                        }
                                        
                                    });
                                    //para que se imprima en parte cli la actions he tenido que hacer un JSON.stringify poniendo solo _actions despues de haber mapeado 
                                    //no da los resultados esperados y en cli se sigue mostrando como object aunque si hacemos console.log desde aqui se imprima bien
                                    //console.log(_actions);
                                    _cb(null, _actions);
                                    return { 
                                        id: issue._id.toHexString(), title: issue.title, state : issue.state,
                                        ini: issue.ini, due: issue.due , actions: _actions
                                    };
                                });
                                _cb(null,"");
                            }
                        });
                    }
                });
            }
        });

    }

}

module.exports = {
    addUser,
    login,
    listUsers,
    updateUser,
    removeUser,
    addWorkspace,
    updateWorkspace,
    joinWorkspace,
    leaveWorkspace,
    removeWorkspace,
    listWorkspaces,
    addIssue,
    removeIssue,
    updateIssue,
    listIssues,
    addAction,
    listActions
}