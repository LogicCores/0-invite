
exports.forLib = function (LIB) {
    var ccjson = this;

    const COOKIES = require("cookies");

    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;
                var config = {};
                LIB._.merge(config, defaultConfig)
                LIB._.merge(config, instanceConfig)

                // TODO: Remove once we can generate access tokens from cli dynamically
                var url = "?" + config.query.name + "=" + config.token;
                console.log("Invite Token: " + url);

                self.AspectInstance = function (aspectConfig) {

                    return LIB.Promise.resolve({
                        app: function () {
                            return LIB.Promise.resolve(
                                ccjson.makeDetachedFunction(
                                    function (req, res, next) {
                                
                                        req.cookies = new COOKIES(req, res);
                                
                                		// Enable or disable test mode.
                                		var freshlyAuthorized = false;
                                		if (
                                			req.query &&
                                			req.query[config.query.name]
                                		) {
                                			if (req.query[config.query.name] === config.token) {
                                				req.cookies.set(config.cookie.name, config.token, {
                                				    maxAge: (config.cookie.maxAge && (config.cookie.maxAge * 1000)) || 0
                                				});
                                				freshlyAuthorized = true;
                                			} else {
                                				req.cookies.set(config.cookie.name, "");
                                			}
                                		}
                                
                                		if (req.state.boundary.canBypass()) {
                                			return next();
                                		}
                                
                                		if (
                                			req.cookies.get(config.cookie.name) === config.token ||
                                			freshlyAuthorized === true
                                		) {
                                			return next();
                                		}
                                
                                		res.writeHead(403);
                                		return res.end("Forbidden: You need an invite!");
                                    }
                                )
                            );
                        },
                        getInfo: function () {
                            return LIB.Promise.resolve({
                                "type": "query",
                                "name": config.query.name,
                                "value": config.token
                            });
                        }
/*
                        },
                        setLocalhostCookieApp: function () {
                            return LIB.Promise.resolve(
                                ccjson.makeDetachedFunction(
                                    function (req, res, next) {

                                        // If the request is from '127.0.0.1' (local browser) we
                                        // inject the invite token cookie for this request
                                        // so user does not need to enter it.
                                        // TODO: Add option to disable this so that requests from proxies
                                        //       running on same host and making requests to
                                        //       '127.0.0.1' are not automatically authorized.

                                        if (req._remoteAddress !== "127.0.0.1") {
                                            return next();
                                        }

                                        req.cookies = new COOKIES(req, res);
                        				req.cookies.set(config.cookie.name, config.token, {
                        				    maxAge: (config.cookie.maxAge && (config.cookie.maxAge * 1000)) || 0
                        				});

                        				res.writeHead(200);
                        				res.end();
                        				return;
                                    }
                                )
                            );
                        }
*/                        
                    });
                }
            }
            Entity.prototype.config = defaultConfig;

            return Entity;
        }
    });
}
