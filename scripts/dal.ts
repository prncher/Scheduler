/*
 * dal
 * 

 * Author : Prince Cheruvathur
 * License: MIT
 */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Q = require("q");

export class DataAccess {
    static shareItUrl: string = 'mongodb://admin:G6u2Z9yY8hDe@127.0.0.1:27017/Scheduler';
    dbConnection: any = null;

    public openDbConnection() {
        if (this.dbConnection == null) {
            MongoClient.connect(DataAccess.shareItUrl, (err, db) => {
                assert.equal(null, err);
                console.log("Connected correctly to MongoDB server.");
                this.dbConnection = db;
            });
        }
    }

    public closeDbConnection() {
        if (this.dbConnection) {
            this.dbConnection.close();
            this.dbConnection = null;
        }
    }

    public getStudentsCount(): any {
        return this.getDocumentCount('Students');
    }

    public getSchedulesCount(): any {
        return this.getDocumentCount('Schedules');
    }

    public insertStudent(student: any): any {
        return this.insertDocument(student, 'Students');
    }

    public insertSchedule(schedule: any): any {
        return this.insertDocument(schedule, 'Schedules');
    }
    public editSchedule(schedule: any): any {
        return this.editDocument(schedule, 'Schedules');
    };

    public getStudent(user : any): any {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Students').find();
            cursor.each((err, document) => {
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null &&
                    document['userName'] === user.userName &&
                    document['password'] === user.password) {
                    return deferred.resolve(document);
                }
                else if (document === null) {
                    return deferred.resolve(document);
                }
            });
        }

        return deferred.promise;
    }

    public getSchedules(studentId: number): any {
        var deferred = Q.defer();
        if (this.dbConnection) {
            var cursor = this.dbConnection.collection('Schedules').find();
            var resources: Array<any> = new Array<any>();
            cursor.each((err, document) => {
                assert.equal(err, null);
                if (err) {
                    deferred.reject(new Error(JSON.stringify(err)));
                }
                else if (document !== null && document['studentId'] === studentId) {
                    resources.push(document);
                }
                else if (document === null) {
                    deferred.resolve(resources);
                }
            });
        }

        return deferred.promise;
    }

    private editDocument(document : any, collectionName: string): any{
        var deferred = Q.defer();
        this.dbConnection.collection(collectionName).updateOne({"id": document.id}, { $set : document}, (err, result) => {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    };

    private insertDocument(document: any, collectionName: string): any {
        var deferred = Q.defer();
        this.dbConnection.collection(collectionName).insertOne(document, (err, result) => {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });

        return deferred.promise;
    }

    private getDocumentCount(collectionName: string): any {
        var deferred = Q.defer();
        this.dbConnection && this.dbConnection.collection(collectionName).count((err, result) => {
            assert.equal(err, null);
            if (err) {
                deferred.reject(new Error(JSON.stringify(err)));
            }
            deferred.resolve(result);
        });
        return deferred.promise;
    }
}