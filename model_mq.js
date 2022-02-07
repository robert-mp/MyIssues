const zmq = require('zeromq');
function addUser(user, cb) {
    if (!user.name) cb(new Error("Name missing"))
    else if (!user.surname) cb(new Error("Surname missing"))
    else if (!user.email) cb(new Error("email missing"))
    else if (!user.password) cb(new Error("Password missing"))
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "addUser",
            data: user
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}
function removeUser(token, userID, cb) {
    if (!userID) cb(new Error("userID missing"))
    else if (!token) cb(new Error("Token missing"))
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            data: userID
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function updateUser(token, userID,data, cb) {
    if (!userID) cb(new Error("userID missing"))
    else if (!token) cb(new Error("Token missing"))
    else if (!data)cb(new Error("Data Missing"))
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "updateUser",
            token: token,
            id: userID,
            data: data
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function addWorkspace(token, workspace, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!workspace) cb(new Error("Missing Workspace Data :("));
    else if (!workspace.title) cb(new Error("Missing Title :("));
    else {    
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "addWorkspace",
            token: token,
            data: workspace
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function removeWorkspace(token, workspaceID, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!workspaceID) cb(new Error("Missing workspaceID"));
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            data: workspaceID
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function updateWorkspace(token, workspaceID, data, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!id) cb(new Error("Missing workspaceID"));
    else if (!data) cb(new Error("Missing data"));
    else {
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            token: token,
            type: "updateWorkspace",
            data: data,
            id: workspaceID
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function addIssue(token, workspaceID,issue, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!workspaceId) cb(new Error("Missing Workspace Data :("));
    else if (!issue) cb(new Error("Missing Issue :("));
    else if (!issue.title) cb(new Error("Missing Title"));
    else if (!issue.ini) cb(new Error("Missing Iniciation date"));
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            id: workspaceID,
            data: issue
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function updateIssue(token, issueid, data, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!issueId) cb(new Error("Missing IssueId"));
    else if (!data) cb(new Error("Missing data"));
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            id: issueid,
            data: data
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function removeIssue(token, issueid, cb) {
    if (!token) cb(new Error("Missing Token"));
    else if (!issueId) cb(new Error("Missing IssueId"));
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            data: issueid
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}

function addAction(token, issueID, action, cb) {
    if (!token) cb(new Error("Missing Token"));
    if (!issueID) cb(new Error("Missing issueID Data :("));
    else if (!action) cb(new Error("Missing Issue :("));
    else if (!action.type) cb(new Error("Missing Type"));
    else {
        
        let sock = zmq.socket('push');
        sock.connect("tcp://127.0.0.1:9080")
        let msg = {
            type: "removeUser",
            token: token,
            data: action,
            id: issueID
        }
        sock.send(JSON.stringify(msg))
        sock.close();
        cb();
    }

}


module.exports = {
    addUser,
    updateUser,
    removeUser,
    addWorkspace,
    updateWorkspace,
    removeWorkspace,
    addIssue,
    updateIssue,
    removeIssue,
    addAction
}