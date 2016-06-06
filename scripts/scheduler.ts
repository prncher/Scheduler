/*
 * scheduler
 * 

 * Author : Prince Cheruvathur
 * License: MIT
 */
"use strict";
import express = require('express');
import da = require('./dal');
import base = require('./base');
var Q = require("q");
import jwt = require('./jwtManage');

export interface ISchedule {
    id: number;
    studentId: number;
    title: string;
    event: string;
    time: string;
    duration:number;
    description: string;
}

class Schedule implements ISchedule {
    public id: number;
    public studentId: number;
    public title: string;
    public event: string;
    public time: string;
    public duration: number;
    public description: string;

    constructor(schedule: ISchedule) {
        this.id = schedule.id || 0;
        this.studentId = schedule.studentId;
        this.title = schedule.title || "";
        this.event = schedule.event || "";
        this.time = schedule.time;
        this.duration = schedule.duration;
        this.description = schedule.description;
    }
}

export class SchedulerController extends base.baseController {
    constructor(app: express.Express, da: da.DataAccess) {
        super();
        this.dataAccess = da;
        app.get("/api/Schedules", this.getSchedules());
        app.post("/api/Schedules", this.postSchedule());
        app.put("/api/Schedules", this.editSchedule());
    }

editSchedule = (): any => {
        var self = this;
        return (req: express.Request, res: express.Response) => {
            // Authenticate
            jwt.JwtManager.Authenticate(req.headers['authorization']).then((decoded) => {
                var da = self.dataAccess;
                var em = self.sendErrorMessage;
                var schbody = new Schedule(<ISchedule>req.body);
                if (schbody != null) {

                        da.editSchedule(schbody).then((reult) => {
                            self.socket.emit('schedule', { studentId: schbody.studentId, scheduleId: schbody.id });
                            res.sendStatus(200);
                        }).catch((e) => {
                            return em(res, e);
                        });
                }
                else {
                    em(res);
                }
            }).catch(e => {
                return res.status(401).json('Failed to authenticate token.');
            });
        };
    }


    // Register Schedule
    postSchedule = (): any => {
        var self = this;
        return (req: express.Request, res: express.Response) => {
            // Authenticate
            jwt.JwtManager.Authenticate(req.headers['authorization']).then((decoded) => {
                var da = self.dataAccess;
                var em = self.sendErrorMessage;
                var schbody = new Schedule(<ISchedule>req.body);
                if (schbody != null) {
                    da.getSchedulesCount().then((count) => {
                        schbody.id = count + 1;
                        da.insertSchedule(schbody).then((reult) => {
                            self.socket.emit('schedule', { studentId: schbody.studentId, scheduleId: schbody.id });
                            res.sendStatus(201);
                        }).catch((e) => {
                            return em(res, e);
                        });
                    }).catch((e) => {
                        return em(res, e);
                    });
                }
                else {
                    em(res);
                }
            }).catch(e => {
                return res.status(401).json('Failed to authenticate token.');
            });
        };
    }

    // get all schedules for a student.
    getSchedules = (): any => {
        var da = this.dataAccess;
        var em = this.sendErrorMessage;
        return (req: express.Request, res: express.Response) => {
            // Authenticate
            jwt.JwtManager.Authenticate(req.headers['authorization']).then((decoded) => {
                // Get all the schedules for this student.
                var studentId: number = parseInt(req.query.studentId);
                da.getSchedules(studentId).then((result) => {
                    if (result) {
                        res.status(200).json(result);
                    }
                    else {
                        return em(res, { name: "Error", message: "Schedule not found" });
                    }
                }).catch(e => {
                    return em(res, e);
                });
            }).catch(e => {
                return res.status(401).json('Failed to authenticate token.');
            });
        };
    }
}
