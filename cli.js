const readline = require("readline");
const minimist = require("minimist");
const model = require("./model_rest.js");
const modelmq= require("./model_mq.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let credentials = {};

rl.setPrompt("cli > ");
rl.prompt();
rl.on("line", line => {
    let args = minimist(fields = line.split(" "));
    menu(args, () => {
        rl.prompt();
    });
});
function menu(args, cb) {
    if (!args._.length || args._[0] == "") cb();
    else {
        switch (args._[0]) {
            case "exit":
                console.log("Bye :(");
                process.exit(0);
            case "help":
                console.log("Usage: <command> -p parameters");
                cb();
                break;
            case "queryhelp":
                console.log("query should be written as: -q {\"name\": \"Jhon\", \"surname\": \"Doe\"}");
                cb();
                break;
            case "login":
                let email = args.e || args.email;
                let password = args.p || args.password;
                model.login(email, password, (err, id, user) => {
                    if (err) console.log(err.stack);
                    else {
                        console.log(`Logged correctly :)`);
                        credentials = {
                            token: id,
                            user: user
                        };
                    }
                    cb();
                })
                break;
            case "addUser":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                }
                let user = {
                    name: args.n || args.name,
                    surname: args.s || args.surname,
                    email: args.e || args.email,
                    password: args.p || args.password
                };
                modelmq.addUser(user, (err, _user) => {
                    if (err) console.log(err.stack);
                    else console.log(`Added user \nDone :)`);
                    cb();
                })
                break;
            case "updateUser":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                }
                let userID2 = args.u || args.user;
                let data = {
                    name: args.n || args.name,
                    surname: args.s || args.surname,
                    email: args.e || args.email,
                    password: args.p || args.password
                }
                modelmq.updateUser(credentials.token, userID2, data, (err, _user) => {
                    if (err) console.log(err.stack);
                    else {
                        console.log(`Updated user`)
                    }
                    cb();
                });

                break;
            case "removeUser":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                }
                let userID = args.u || args.user;
                modelmq.removeUser(credentials.token, userID, (err, _user) => {
                    if (err) console.log(err.stack);
                    else {
                        console.log(`Removed correctly :)`)
                    }
                    cb();
                });

                break;
            case "listUsers":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let query = args.q || args.query;
                    //console.log(query);
                    if (query == undefined) query = "{}";
                    //let query = {};
                    model.listUsers(credentials.token, query, (err, users) => {
                        if (err) console.log(err.stack);
                        else {
                            console.log(users);
                        }
                        cb();
                    });
                }
                break;
            case "addWorkspace":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let workspace = {
                        title: args.t || args.title,
                        desc: args.d || args.desc
                    };
                    modelmq.addWorkspace(credentials.token, workspace, (err, _workspace) => {
                        if (err) console.log(err.stack);
                        else console.log(`Added ${_workspace} \n Done :)`);
                        cb();
                    })
                }
                break;
            case "updateWorkspace": 
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                }
                let workspaceID2 = args.w || args.workspace;
                let workspacedata = {
                    title: args.t || args.title,
                    desc: args.d || args.desc
                }
                modelmq.updateWorkspace(credentials.token, workspacedata, workspaceID2, (err, _user) => {
                    if (err) console.log(err.stack);
                    else {
                        console.log(`Updated workspace`)
                    }
                    cb();
                });
                break;
            case "joinWorkspace":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let uID = args.u || args.userID;
                    let wID = args.w || args.workspaceID;
                    model.joinWorkspace(credentials.token, uID, wID, (err, _workspace, _user) => {
                        if (err) console.log(err.stack);
                        else console.log(`Done :D`);
                        cb();
                    })
                }
                break;
            case "leaveWorkspace":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let luID = args.u || args.userID;
                    let lwID = args.w || args.workspaceID;
                    model.leaveWorkspace(credentials.token, luID, lwID, (err, _workspace, _user) => {
                        if (err) console.log(err.stack);
                        else console.log(`Done :D`);
                        cb();
                    })
                }
                break;
            case "removeWorkspace":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let rwID = args.w || args.workspaceID;
                    modelmq.removeWorkspace(credentials.token, rwID, (err, _result) => {
                        if (err) console.log(err.stack);
                        else console.log("Worksapce Removed");
                        cb();
                    })
                }
                break;
            case "listWorkspaces":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let query = args.q || args.query;
                    //console.log(query);
                    if (query == undefined) query = "{}";
                    //let query = {};
                    model.listWorkspaces(credentials.token, query, (err, workspaces) => {
                        if (err) console.log(err.stack);
                        else {
                            console.log(workspaces);
                        }
                        cb();
                    });
                }
                break;
            case "addIssue":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let issue = {
                        ini: args.i || args.start || args.s,
                        due: args.d || args.due,
                        title: args.t || args.t
                    }
                    let workspaceID = args.w || args.workspaceID
                    modelmq.addIssue(credentials.token, workspaceID, issue, (err, result) => {
                        if (err) console.log(err.stack);
                        else {
                            console.log(result);
                        }
                        cb();
                    });
                }
                break;
            case "updateIssue":
                    if (!credentials) {
                        console.log("User not authenticated");
                        cb();
                    }
                    let issueId = args.i || args.issue;
                    let issuedata = {
                        ini: args.i || args.start || args.s,
                        due: args.d || args.due,
                        title: args.t || args.t
                    }
                    modelmq.updateIssue(credentials.token, issueId, issuedata, (err, _user) => {
                        if (err) console.log(err.stack);
                        else {
                            console.log(`Updated issue`)
                        }
                        cb();
                    });
                    break;
            case "removeIssue":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let issueID = args.i || args.issueID;
                    modelmq.removeIssue(credentials.token, issueID, (err, _result) => {
                        if (err) console.log(err.stack);
                        else console.log("Issue Removed");
                        cb();
                    })
                }
                break;
            case "listIssues":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let query = args.q || args.query;
                    //console.log(query);
                    if (query == undefined) query = "{}";
                    //TODO hacer que la query funcione
                    //let query = {};
                    model.listIssues(credentials.token, query, (err, issues) => {
                        if (err) console.log(err.stack);
                        else {
                            //no consigo que se imprima bien las actions... incluso mapeandolas en model_mongo. La solucion que tengo ahora mismo es hacer un JSON.Stringify
                            console.dir(issues, {depth: null});
                        }
                        cb();
                    });
                }
                break;
            case "addAction":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let action = {
                        type: args.t || args.type,
                        content: "",
                    }
                    //comprobar si se pasa un usuario al que asignarle una issue 
                    if (args.u || args.user) action.content = args.u || args.user;
                    let issueID = args.i || args.issueID;
                    modelmq.addAction(credentials.token, issueID, action, (err, result) => {
                        if (err) console.log(err.stack);
                        else {
                            //no consigo que se imprima bien las actions... incluso mapeandolas en model_mongo. La solucion que tengo ahora mismo es hacer un JSON.Stringify 
                            console.log(`Accion añadida`);
                        }
                        cb();
                    });
                }
                break;
            case "listActions":
                if (!credentials) {
                    console.log("User not authenticated");
                    cb();
                } else {
                    let query = args.q || args.query;
                    //console.log(query);
                    if (query == undefined) query = {};
                    //explicado porque no pueden pasarse querys  en model_mongo
                    //query={}
                    let issueId = args.i || args.issue
                    model.listActions(credentials.token, issueId, query, (err, actions) => {
                        if (err) console.log(err.stack);
                        else {
                            console.log(actions);
                        }
                        cb();
                    });
                }
                break;
            //metodo para no tener que hacer login todo el rato para probar cosas mas rápido
            case "secret":
                model.login("admin", "admin", (err, id, user) => {
                    if (err) console.log(err.stack);
                    else {
                        console.log("Done :D");
                        credentials = {
                            token: id,
                            user: user
                        };
                    }
                    cb();
                })
                break;
            default:
                console.log("Error");
                cb();

        }

    }
}