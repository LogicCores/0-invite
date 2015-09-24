
const COOKIES = require("cookies");


exports.app = function (options) {

    return function (req, res, next) {

        req.cookies = new COOKIES(req, res);

		// Enable or disable test mode.
		if (
			req.query &&
			req.query[options.query.name]
		) {
			if (req.query[options.query.name] === options.token) {
				req.cookies.set(options.cookie.name, options.token, {
				    maxAge: (options.cookie.maxAge && (options.cookie.maxAge * 1000)) || 0
				});
			} else {
				req.cookies.set(options.cookie.name, "");
			}
		}

		if (req.state.boundary.canBypass()) {
			return next();
		}

		if (req.cookies.get(options.cookie.name)) {
			return next();
		}

		res.writeHead(403);
		return res.end("Forbidden: You need an invite!");
    };
}
