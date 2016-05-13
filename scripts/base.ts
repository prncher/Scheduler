import express = require('express');
import da = require('./dal');

export class baseController {
    dataAccess: da.DataAccess;
    socket: any;

    sendErrorMessage = (res: express.Response, e?: Error) => {
        if (e) {
            var ex = JSON.stringify(e);
            return res.status(400).json({ Message: e.message, ExceptionMessage: ex });
        }
        else {
            res.sendStatus(400);
        }
    }

    public setSocket = (socket: any) => {
        this.socket = socket;
    }
}