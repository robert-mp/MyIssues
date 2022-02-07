let users = {
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
};

//-----------Users------------------

function addUser(user, cb) {
    //Comprobamos que nos pasen todos los datos del usuario
    if (!user) cb(new Error("Missing User Data :("));
    else if (!user.name) cb(new Error("Missing User Name :("));
    else if (!user.surname) cb(new Error("Missing User Surname :("));
    else if (!user.email) cb(new Error("Missing User Email :("));
    else if (!user.password) cb(new Error("Missing User password :("));
    else {
        let found = false;
        //Comprobamos si el usuario esta ya en la base de datos
        for (let id in users) {
            if (users[id].email == user.email) {
                found = true;
                break;
            }
        }
        if (found) cb(new Error("Repeated user email"));
        //Añadimos al usuario
        else {
            user.id = String(Date.now());
            user.workspaces = [];
            users[user.id] = user;
            cb(null, user);
        }
    }
}

function listUsers(token, query, cb) {
    //Comprobamos que haya token y que la query no este vacia
    if (!token) cb(new Error("Missing Token"));
    else if (!query) cb(new Error("Missing query"));

    //Devolvemos todos los usuarios
    let ret = []
    for (let id in users) {
        ret.push(users[id]);
    }
    cb(null, ret)
}

function login(email, password, cb) {
    //Comprobamos que nos pasan los datos necesarios
    if (!email) cb(new Error("Missing email :("));
    else if (!password) cb(new Error("Missing Password"));
    let user;
    //Comprobamos que la contraseña y email sean correctas
    for (let id in users) {
        if (users[id].email == email && users[id].password == password) {
            user = users[id];
            break;
        }
    }
    if (user) cb(null, user.id, user);
    else cb(new Error("Wrong credentials"));
}

function updateUser(token, userID, data, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!userID) cb(new Error("Missing UserID"));
    else if (!data) cb(new Error("Missing data"));
    let found= false;
    for (let id in users ) {
        if (users[id].id == userID) {
            found=true;
            if (data.name) users[id].name = data.name;
            if (data.surname) users[id].surname = data.surname;
            if (data.email) users[id].email = data.email;
            if (data.password) users[id].password = data.password;
            break;
        }
    }
    if(!found) cb(new Error("UserID not found"));
    else{
        cb();
    }
}

function removeUser(token,userID,cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!userID) cb(new Error("Missing UserID"));
    let found= false;
    for (let id in users ) {
        if (users[id].id == userID) {
            found=true;
            delete users[id]
            break;
        }
    }
    if(!found) cb(new Error("UserID not found"));
    else{
        cb();
    }
}

//------------Workspaces------------

function addWorkspace(token,workspace,cb){
    if (!token) cb(new Error("Missing Token"));
    if (!workspace) cb(new Error("Missing Workspace Data :("));
    else if (!worksapce.title) cb(new Error("Missing Title :("));
    else {
            workspace.id = String(Date.now());
            works = [];
            users[user.id] = user;
            cb(null, user);
        
    }
}







module.exports = {
    addUser,
    login,
    listUsers,
    updateUser,
    removeUser
}


for(var i = a.length-1 ;!found || a>=0; i--){
    console.log(`${a.at(i).morid}`)
    if(a.at(i).morid=="todos"){ 
        state= a.at(i).morid;
        found=true;
    }
}
console.log(state);