"uses strict"
var fs = require('fs');
var jwt = require('jsonwebtoken');
var Q = require("q");

export class JwtManager {
    private static token: string;
    static publicKey: string = JSON.stringify({ 'key': fs.readFileSync('key.pub', 'UTF8'), 'now': Date.now() });

    public static GetToken = (student?: any): string => {
        if (student !== undefined) {
            JwtManager.token = jwt.sign(student, JwtManager.publicKey);
        }

        return JwtManager.token;
    };

    public static Authenticate = (token: string): any => {
        var deferred = Q.defer();
        if (token && token.split(' ')[0] === 'Bearer') {
            token = token.split(' ')[1];

            jwt.verify(token, JwtManager.publicKey, function (err, decoded) {
                if (err) {
                    deferred.reject(new Error('Failed to authenticate token.'));
                } else {
                    deferred.resolve(decoded);
                }            });        } else {
            deferred.reject(new Error('Authenticate token not present'));
        }

        return deferred.promise;
    }
}