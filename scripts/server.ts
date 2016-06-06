/*
 * server
 * 

 * Author : Prince Cheruvathur
 * License: MIT
 */
"use strict";

var http = require('http');
import express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var expressJWT = require('express-jwt');

import st = require('./student');
import sc = require('./scheduler');
import da = require('./dal');
import jwt = require('./jwtManage');

var app = express();
app.use(express.static("../Scheduler-Client"));
app.use(expressJWT({ secret: jwt.JwtManager.publicKey }).unless({
    path: ['/', '/api/Students']
}));

var server = http.Server(app);
var io = require('socket.io')(server);
var port = process.env.port || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    fs.readFile('index.html',
        (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
});

var dataAccess = new da.DataAccess()
var studentController = new st.StudentController(app, dataAccess);
var schedulerController = new sc.SchedulerController(app, dataAccess);

io.on('connection', (socket) => {
    console.log('a user connected');
    dataAccess.openDbConnection();

    schedulerController.setSocket(socket);


    socket.on('disconnect', function () {
        dataAccess.closeDbConnection();
        console.log('user disconnected');
    });
});

server.listen(port, _ => {
    console.log('listening on *: ' + port);
});
