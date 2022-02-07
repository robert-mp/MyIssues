const axios = require('axios');
const url = 'http://localhost:8080/myissues';

function login(email, password, cb) {
    axios.post(url + '/sessions',
        { email: email, password: password })
        .then(res => {
            cb(null, res.data.token, res.data.user)
        })
        .catch(err => {
            cb(err);
        });
}

function addUser(user, cb) {
    //Comprobamos 2 veces esto sirve para descargar el servicio RESTful
    if (!user.name) cb(new Error('Property name missing'));
    else if (!user.surname) cb(new Error('Property surname missing'));
    else if (!user.email) cb(new Error('Property email missing'));
    else if (!user.password) cb(new Error('Property password missing'));
    else {
        axios.post(url + '/users', user)
            .then(res => {
                cb(null, res.data)
            })
            .catch(err => {
                cb(err);
            });
    }
}
function listUsers(token, query, cb) {
    axios.get(url + '/users',
        {
            //Esto se usa en axios para pasar query. Es necesario poner params. Hacemos stringify de la query para que no rompa la URL
            params: { token: token, query: JSON.stringify(query) }
        })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

function updateUser(token, userID, data, cb) {
    //Comprobamos que los datos estan
    if (!token) cb(new Error("Missing Token"));
    else if (!userID) cb(new Error("Missing UserID"));
    else if (!data) cb(new Error("Missing data"));
    else {

        axios.put(url + '/users/'+ token,
        {
            params: { token: token, userID: userID, data: JSON.stringify(data) }
        })
        .then(res=>{
            cb(null,res.data)
        })
        .catch(err=>{
            cb(err)
        });
    }
}


function addWorkspace(token, workspace, cb) {
    axios.post(url + '/workspaces',
        workspace,
        {
            params: { token: token }
        })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

function listWorkspaces(token, query, cb) {
    axios.get(url + '/workspaces',
        {
            params: { token: token, query: JSON.stringify(query) }
        })
        .then(res => {
            cb(null, res.data)
        })
        .catch(err => {
            cb(err);
        });
}

/* 

    TODO Implementar el resto de la API

*/

module.exports = {
    login,
    addUser,
    listUsers,
    updateUser,
    addWorkspace,
    listWorkspaces
}