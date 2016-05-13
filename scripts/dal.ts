var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var Q = require("q");

export class DataAccess {
    static shareItUrl: string = 'mongodb://127.0.0.1:27017/Scheduler';
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

    public insertStudent(student: any): any {
        return this.insertDocument(student, 'Students');
    }

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
                    deferred.reject(new Error("No Students Exist"));
                }
            });
        }

        return deferred.promise;
    }

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