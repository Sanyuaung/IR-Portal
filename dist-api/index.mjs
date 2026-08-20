var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports, module) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/vary/index.js
var require_vary = __commonJS({
  "node_modules/vary/index.js"(exports, module) {
    "use strict";
    module.exports = vary;
    module.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
  }
});

// node_modules/cors/lib/index.js
var require_lib = __commonJS({
  "node_modules/cors/lib/index.js"(exports, module) {
    (function() {
      "use strict";
      var assign = require_object_assign();
      var vary = require_vary();
      var defaults = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204
      };
      function isString(s) {
        return typeof s === "string" || s instanceof String;
      }
      function isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
          for (var i = 0; i < allowedOrigin.length; ++i) {
            if (isOriginAllowed(origin, allowedOrigin[i])) {
              return true;
            }
          }
          return false;
        } else if (isString(allowedOrigin)) {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        } else {
          return !!allowedOrigin;
        }
      }
      function configureOrigin(options, req) {
        var requestOrigin = req.headers.origin, headers = [], isAllowed;
        if (!options.origin || options.origin === "*") {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: "*"
          }]);
        } else if (isString(options.origin)) {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: options.origin
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        } else {
          isAllowed = isOriginAllowed(requestOrigin, options.origin);
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: isAllowed ? requestOrigin : false
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        }
        return headers;
      }
      function configureMethods(options) {
        var methods = options.methods;
        if (methods.join) {
          methods = options.methods.join(",");
        }
        return {
          key: "Access-Control-Allow-Methods",
          value: methods
        };
      }
      function configureCredentials(options) {
        if (options.credentials === true) {
          return {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          };
        }
        return null;
      }
      function configureAllowedHeaders(options, req) {
        var allowedHeaders = options.allowedHeaders || options.headers;
        var headers = [];
        if (!allowedHeaders) {
          allowedHeaders = req.headers["access-control-request-headers"];
          headers.push([{
            key: "Vary",
            value: "Access-Control-Request-Headers"
          }]);
        } else if (allowedHeaders.join) {
          allowedHeaders = allowedHeaders.join(",");
        }
        if (allowedHeaders && allowedHeaders.length) {
          headers.push([{
            key: "Access-Control-Allow-Headers",
            value: allowedHeaders
          }]);
        }
        return headers;
      }
      function configureExposedHeaders(options) {
        var headers = options.exposedHeaders;
        if (!headers) {
          return null;
        } else if (headers.join) {
          headers = headers.join(",");
        }
        if (headers && headers.length) {
          return {
            key: "Access-Control-Expose-Headers",
            value: headers
          };
        }
        return null;
      }
      function configureMaxAge(options) {
        var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
        if (maxAge && maxAge.length) {
          return {
            key: "Access-Control-Max-Age",
            value: maxAge
          };
        }
        return null;
      }
      function applyHeaders(headers, res) {
        for (var i = 0, n = headers.length; i < n; i++) {
          var header = headers[i];
          if (header) {
            if (Array.isArray(header)) {
              applyHeaders(header, res);
            } else if (header.key === "Vary" && header.value) {
              vary(res, header.value);
            } else if (header.value) {
              res.setHeader(header.key, header.value);
            }
          }
        }
      }
      function cors2(options, req, res, next) {
        var headers = [], method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === "OPTIONS") {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options));
          headers.push(configureMethods(options));
          headers.push(configureAllowedHeaders(options, req));
          headers.push(configureMaxAge(options));
          headers.push(configureExposedHeaders(options));
          applyHeaders(headers, res);
          if (options.preflightContinue) {
            next();
          } else {
            res.statusCode = options.optionsSuccessStatus;
            res.setHeader("Content-Length", "0");
            res.end();
          }
        } else {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options));
          headers.push(configureExposedHeaders(options));
          applyHeaders(headers, res);
          next();
        }
      }
      function middlewareWrapper(o) {
        var optionsCallback = null;
        if (typeof o === "function") {
          optionsCallback = o;
        } else {
          optionsCallback = function(req, cb) {
            cb(null, o);
          };
        }
        return function corsMiddleware(req, res, next) {
          optionsCallback(req, function(err, options) {
            if (err) {
              next(err);
            } else {
              var corsOptions = assign({}, defaults, options);
              var originCallback = null;
              if (corsOptions.origin && typeof corsOptions.origin === "function") {
                originCallback = corsOptions.origin;
              } else if (corsOptions.origin) {
                originCallback = function(origin, cb) {
                  cb(null, corsOptions.origin);
                };
              }
              if (originCallback) {
                originCallback(req.headers.origin, function(err2, origin) {
                  if (err2 || !origin) {
                    next(err2);
                  } else {
                    corsOptions.origin = origin;
                    cors2(corsOptions, req, res, next);
                  }
                });
              } else {
                next();
              }
            }
          });
        };
      }
      module.exports = middlewareWrapper;
    })();
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var crypto4 = __require("crypto");
    var TIPS = [
      "\u25C8 encrypted .env [www.dotenvx.com]",
      "\u25C8 secrets for agents [www.dotenvx.com]",
      "\u2301 auth for agents [www.vestauth.com]",
      "\u2318 custom filepath { path: '/custom/path/.env' }",
      "\u2318 enable debugging { debug: true }",
      "\u2318 override existing { override: true }",
      "\u2318 suppress logs { quiet: true }",
      "\u2318 multiple files { path: ['.env.local', '.env'] }"
    ];
    function _getRandomTip() {
      return TIPS[Math.floor(Math.random() * TIPS.length)];
    }
    function parseBoolean(value) {
      if (typeof value === "string") {
        return !["false", "0", "no", "off", ""].includes(value.toLowerCase());
      }
      return Boolean(value);
    }
    function supportsAnsi() {
      return process.stdout.isTTY;
    }
    function dim(text) {
      return supportsAnsi() ? `\x1B[2m${text}\x1B[0m` : text;
    }
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      options = options || {};
      const vaultPath = _vaultPath(options);
      options.path = vaultPath;
      const result = DotenvModule.configDotenv(options);
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _warn(message) {
      console.error(`\u26A0 ${message}`);
    }
    function _debug(message) {
      console.log(`\u2506 ${message}`);
    }
    function _log(message) {
      console.log(`\u25C7 ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || options && options.debug);
      const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (debug || !quiet) {
        _log("loading env from encrypted .env.vault");
      }
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || options && options.debug);
      let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || options && options.quiet);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("no encoding is specified (UTF-8 is used by default)");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path2 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path2, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`failed to load ${path2} ${e.message}`);
          }
          lastError = e;
        }
      }
      const populated = DotenvModule.populate(processEnv, parsedAll, options);
      debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
      quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);
      if (debug || !quiet) {
        const keysCount = Object.keys(populated).length;
        const shortPaths = [];
        for (const filePath of optionPaths) {
          try {
            const relative = path.relative(process.cwd(), filePath);
            shortPaths.push(relative);
          } catch (e) {
            if (debug) {
              _debug(`failed to load ${filePath} ${e.message}`);
            }
            lastError = e;
          }
        }
        _log(`injected env (${keysCount}) from ${shortPaths.join(",")} ${dim(`// tip: ${_getRandomTip()}`)}`);
      }
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`you set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto4.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      const populated = {};
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
            populated[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
          populated[key] = parsed[key];
        }
      }
      return populated;
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config,
      decrypt,
      parse,
      populate
    };
    module.exports.configDotenv = DotenvModule.configDotenv;
    module.exports._configVault = DotenvModule._configVault;
    module.exports._parseVault = DotenvModule._parseVault;
    module.exports.config = DotenvModule.config;
    module.exports.decrypt = DotenvModule.decrypt;
    module.exports.parse = DotenvModule.parse;
    module.exports.populate = DotenvModule.populate;
    module.exports = DotenvModule;
  }
});

// node_modules/base32.js/base32.js
var require_base32 = __commonJS({
  "node_modules/base32.js/base32.js"(exports) {
    "use strict";
    var charmap = function(alphabet, mappings) {
      mappings || (mappings = {});
      alphabet.split("").forEach(function(c, i) {
        if (!(c in mappings)) mappings[c] = i;
      });
      return mappings;
    };
    var rfc4648 = {
      alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
      charmap: {
        0: 14,
        1: 8
      }
    };
    rfc4648.charmap = charmap(rfc4648.alphabet, rfc4648.charmap);
    var crockford = {
      alphabet: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
      charmap: {
        O: 0,
        I: 1,
        L: 1
      }
    };
    crockford.charmap = charmap(crockford.alphabet, crockford.charmap);
    function Decoder(options) {
      this.buf = [];
      this.shift = 8;
      this.carry = 0;
      if (options) {
        switch (options.type) {
          case "rfc4648":
            this.charmap = exports.rfc4648.charmap;
            break;
          case "crockford":
            this.charmap = exports.crockford.charmap;
            break;
          default:
            throw new Error("invalid type");
        }
        if (options.charmap) this.charmap = options.charmap;
      }
    }
    Decoder.prototype.charmap = rfc4648.charmap;
    Decoder.prototype.write = function(str) {
      var charmap2 = this.charmap;
      var buf = this.buf;
      var shift = this.shift;
      var carry = this.carry;
      str.toUpperCase().split("").forEach(function(char) {
        if (char == "=") return;
        var symbol = charmap2[char] & 255;
        shift -= 5;
        if (shift > 0) {
          carry |= symbol << shift;
        } else if (shift < 0) {
          buf.push(carry | symbol >> -shift);
          shift += 8;
          carry = symbol << shift & 255;
        } else {
          buf.push(carry | symbol);
          shift = 8;
          carry = 0;
        }
      });
      this.shift = shift;
      this.carry = carry;
      return this;
    };
    Decoder.prototype.finalize = function(str) {
      if (str) {
        this.write(str);
      }
      if (this.shift !== 8 && this.carry !== 0) {
        this.buf.push(this.carry);
        this.shift = 8;
        this.carry = 0;
      }
      return this.buf;
    };
    function Encoder(options) {
      this.buf = "";
      this.shift = 3;
      this.carry = 0;
      if (options) {
        switch (options.type) {
          case "rfc4648":
            this.alphabet = exports.rfc4648.alphabet;
            break;
          case "crockford":
            this.alphabet = exports.crockford.alphabet;
            break;
          default:
            throw new Error("invalid type");
        }
        if (options.alphabet) this.alphabet = options.alphabet;
        else if (options.lc) this.alphabet = this.alphabet.toLowerCase();
      }
    }
    Encoder.prototype.alphabet = rfc4648.alphabet;
    Encoder.prototype.write = function(buf) {
      var shift = this.shift;
      var carry = this.carry;
      var symbol;
      var byte;
      var i;
      for (i = 0; i < buf.length; i++) {
        byte = buf[i];
        symbol = carry | byte >> shift;
        this.buf += this.alphabet[symbol & 31];
        if (shift > 5) {
          shift -= 5;
          symbol = byte >> shift;
          this.buf += this.alphabet[symbol & 31];
        }
        shift = 5 - shift;
        carry = byte << shift;
        shift = 8 - shift;
      }
      this.shift = shift;
      this.carry = carry;
      return this;
    };
    Encoder.prototype.finalize = function(buf) {
      if (buf) {
        this.write(buf);
      }
      if (this.shift !== 3) {
        this.buf += this.alphabet[this.carry & 31];
        this.shift = 3;
        this.carry = 0;
      }
      return this.buf;
    };
    exports.encode = function(buf, options) {
      return new Encoder(options).finalize(buf);
    };
    exports.decode = function(str, options) {
      return new Decoder(options).finalize(str);
    };
    exports.Decoder = Decoder;
    exports.Encoder = Encoder;
    exports.charmap = charmap;
    exports.crockford = crockford;
    exports.rfc4648 = rfc4648;
  }
});

// node_modules/base32.js/index.js
var require_base322 = __commonJS({
  "node_modules/base32.js/index.js"(exports, module) {
    "use strict";
    var base32 = require_base32();
    var finalizeDecode = base32.Decoder.prototype.finalize;
    base32.Decoder.prototype.finalize = function(buf) {
      var bytes = finalizeDecode.call(this, buf);
      return new Buffer(bytes);
    };
    module.exports = base32;
  }
});

// node_modules/speakeasy/index.js
var require_speakeasy = __commonJS({
  "node_modules/speakeasy/index.js"(exports) {
    "use strict";
    var base32 = require_base322();
    var crypto4 = __require("crypto");
    var url = __require("url");
    var util = __require("util");
    exports.digest = function digest(options) {
      var i;
      var secret = options.secret;
      var counter = options.counter;
      var encoding = options.encoding || "ascii";
      var algorithm = (options.algorithm || "sha1").toLowerCase();
      if (options.key != null) {
        console.warn("Speakeasy - Deprecation Notice - Specifying the secret using `key` is no longer supported. Use `secret` instead.");
        secret = options.key;
      }
      if (!Buffer.isBuffer(secret)) {
        secret = encoding === "base32" ? base32.decode(secret) : new Buffer(secret, encoding);
      }
      var buf = new Buffer(8);
      var tmp = counter;
      for (i = 0; i < 8; i++) {
        buf[7 - i] = tmp & 255;
        tmp = tmp >> 8;
      }
      var hmac = crypto4.createHmac(algorithm, secret);
      hmac.update(buf);
      return hmac.digest();
    };
    exports.hotp = function hotpGenerate(options) {
      var digits = (options.digits != null ? options.digits : options.length) || 6;
      if (options.length != null) console.warn("Speakeasy - Deprecation Notice - Specifying token digits using `length` is no longer supported. Use `digits` instead.");
      var digest = options.digest || exports.digest(options);
      var offset = digest[digest.length - 1] & 15;
      var code = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
      code = new Array(digits + 1).join("0") + code.toString(10);
      return code.substr(-digits);
    };
    exports.counter = exports.hotp;
    exports.hotp.verifyDelta = function hotpVerifyDelta(options) {
      var i;
      options = Object.create(options);
      var token = String(options.token);
      var digits = parseInt(options.digits, 10) || 6;
      var window = parseInt(options.window, 10) || 0;
      var counter = parseInt(options.counter, 10) || 0;
      if (token.length !== digits) {
        return;
      }
      token = parseInt(token, 10);
      if (isNaN(token)) {
        return;
      }
      for (i = counter; i <= counter + window; ++i) {
        options.counter = i;
        if (parseInt(exports.hotp(options), 10) === token) {
          return { delta: i - counter };
        }
      }
    };
    exports.hotp.verify = function hotpVerify(options) {
      return exports.hotp.verifyDelta(options) != null;
    };
    exports._counter = function _counter(options) {
      var step = options.step || 30;
      var time = options.time != null ? options.time * 1e3 : Date.now();
      var epoch = (options.epoch != null ? options.epoch * 1e3 : options.initial_time * 1e3) || 0;
      if (options.initial_time != null) console.warn("Speakeasy - Deprecation Notice - Specifying the epoch using `initial_time` is no longer supported. Use `epoch` instead.");
      return Math.floor((time - epoch) / step / 1e3);
    };
    exports.totp = function totpGenerate(options) {
      options = Object.create(options);
      if (options.counter == null) options.counter = exports._counter(options);
      return this.hotp(options);
    };
    exports.time = exports.totp;
    exports.totp.verifyDelta = function totpVerifyDelta(options) {
      options = Object.create(options);
      var window = parseInt(options.window, 10) || 0;
      if (options.counter == null) options.counter = exports._counter(options);
      options.counter -= window;
      options.window += window;
      var delta = exports.hotp.verifyDelta(options);
      if (delta) {
        delta.delta -= window;
      }
      return delta;
    };
    exports.totp.verify = function totpVerify(options) {
      return exports.totp.verifyDelta(options) != null;
    };
    exports.generateSecret = function generateSecret(options) {
      if (!options) options = {};
      var length = options.length || 32;
      var name = encodeURIComponent(options.name || "SecretKey");
      var qr_codes = options.qr_codes || false;
      var google_auth_qr = options.google_auth_qr || false;
      var otpauth_url = options.otpauth_url != null ? options.otpauth_url : true;
      var symbols = true;
      if (options.symbols !== void 0 && options.symbols === false) {
        symbols = false;
      }
      var key = this.generateSecretASCII(length, symbols);
      var SecretKey = {};
      SecretKey.ascii = key;
      SecretKey.hex = Buffer(key, "ascii").toString("hex");
      SecretKey.base32 = base32.encode(Buffer(key)).toString().replace(/=/g, "");
      if (qr_codes) {
        console.warn("Speakeasy - Deprecation Notice - generateSecret() QR codes are deprecated and no longer supported. Please use your own QR code implementation.");
        SecretKey.qr_code_ascii = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" + encodeURIComponent(SecretKey.ascii);
        SecretKey.qr_code_hex = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" + encodeURIComponent(SecretKey.hex);
        SecretKey.qr_code_base32 = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" + encodeURIComponent(SecretKey.base32);
      }
      if (otpauth_url) {
        SecretKey.otpauth_url = exports.otpauthURL({
          secret: SecretKey.ascii,
          label: name
        });
      }
      if (google_auth_qr) {
        console.warn("Speakeasy - Deprecation Notice - generateSecret() Google Auth QR code is deprecated and no longer supported. Please use your own QR code implementation.");
        SecretKey.google_auth_qr = "https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=" + encodeURIComponent(exports.otpauthURL({ secret: SecretKey.base32, label: name }));
      }
      return SecretKey;
    };
    exports.generate_key = util.deprecate(function(options) {
      return exports.generateSecret(options);
    }, "Speakeasy - Deprecation Notice - `generate_key()` is depreciated, please use `generateSecret()` instead.");
    exports.generateSecretASCII = function generateSecretASCII(length, symbols) {
      var bytes = crypto4.randomBytes(length || 32);
      var set = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
      if (symbols) {
        set += "!@#$%^&*()<>?/[]{},.:;";
      }
      var output = "";
      for (var i = 0, l = bytes.length; i < l; i++) {
        output += set[Math.floor(bytes[i] / 255 * (set.length - 1))];
      }
      return output;
    };
    exports.generate_key_ascii = util.deprecate(function(length, symbols) {
      return exports.generateSecretASCII(length, symbols);
    }, "Speakeasy - Deprecation Notice - `generate_key_ascii()` is depreciated, please use `generateSecretASCII()` instead.");
    exports.otpauthURL = function otpauthURL(options) {
      var secret = options.secret;
      var label = options.label;
      var issuer = options.issuer;
      var type = (options.type || "totp").toLowerCase();
      var counter = options.counter;
      var algorithm = options.algorithm;
      var digits = options.digits;
      var period = options.period;
      var encoding = options.encoding || "ascii";
      switch (type) {
        case "totp":
        case "hotp":
          break;
        default:
          throw new Error("Speakeasy - otpauthURL - Invalid type `" + type + "`; must be `hotp` or `totp`");
      }
      if (!secret) throw new Error("Speakeasy - otpauthURL - Missing secret");
      if (!label) throw new Error("Speakeasy - otpauthURL - Missing label");
      if (type === "hotp" && (counter === null || typeof counter === "undefined")) {
        throw new Error("Speakeasy - otpauthURL - Missing counter value for HOTP");
      }
      if (encoding !== "base32") secret = new Buffer(secret, encoding);
      if (Buffer.isBuffer(secret)) secret = base32.encode(secret);
      var query = { secret };
      if (issuer) query.issuer = issuer;
      if (algorithm != null) {
        switch (algorithm.toUpperCase()) {
          case "SHA1":
          case "SHA256":
          case "SHA512":
            break;
          default:
            console.warn("Speakeasy - otpauthURL - Warning - Algorithm generally should be SHA1, SHA256, or SHA512");
        }
        query.algorithm = algorithm.toUpperCase();
      }
      if (digits != null) {
        if (isNaN(digits)) {
          throw new Error("Speakeasy - otpauthURL - Invalid digits `" + digits + "`");
        } else {
          switch (parseInt(digits, 10)) {
            case 6:
            case 8:
              break;
            default:
              console.warn("Speakeasy - otpauthURL - Warning - Digits generally should be either 6 or 8");
          }
        }
        query.digits = digits;
      }
      if (period != null) {
        period = parseInt(period, 10);
        if (~~period !== period) {
          throw new Error("Speakeasy - otpauthURL - Invalid period `" + period + "`");
        }
        query.period = period;
      }
      return url.format({
        protocol: "otpauth",
        slashes: true,
        hostname: type,
        pathname: label,
        query
      });
    };
  }
});

// node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length) {
        for (let i = 0; i < length; i++) {
          this.putBit((num >>> length - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value, reserved) {
      const index = row * this.size + col;
      this.data[index] = value;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value) {
      this.data[row * this.size + col] ^= value;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value) {
      return exports.isValid(value) ? parseInt(value, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string) {
      if (typeof string !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string);
      }
    }
    exports.from = function from(value, defaultValue) {
      if (exports.isValid(value)) {
        return value;
      }
      try {
        return fromString(value);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length = getTotalBitsFromDataArray(segments, currentVersion);
        if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value, defaultValue) {
      if (VersionCheck.isValid(value)) {
        return parseInt(value, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length) {
      return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value = parseInt(group, 10);
        bitBuffer.put(value, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value = parseInt(group, 10);
        bitBuffer.put(value, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length) {
      return 11 * Math.floor(length / 2) + 6 * (length % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length) {
      return length * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length) {
      return length * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value = Utils.toSJIS(this.data[i]);
        if (value >= 33088 && value <= 40956) {
          value -= 33088;
        } else if (value >= 57408 && value <= 60351) {
          value -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value = (value >>> 8 & 255) * 192 + (value & 255);
        bitBuffer.put(value, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b) {
          return a.cost - b.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value, cost) {
          var item = { value, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex, mode, str) {
      const segments = [];
      let result;
      while ((result = regex.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length);
        case Mode.BYTE:
          return ByteData.getBitsLength(length);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array) {
      return array.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value = r % 2 === 0;
        matrix.set(r, 6, value, true);
        matrix.set(6, r, value, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod = (bits >> i & 1) === 1;
        matrix.set(row, col, mod, true);
        matrix.set(col, row, mod, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod;
      for (i = 0; i < 15; i++) {
        mod = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod, true);
        } else {
          matrix.set(size - 15 + i, 8, mod, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod, true);
        } else {
          matrix.set(8, 15 - i - 1, mod, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/pngjs/lib/chunkstream.js
var require_chunkstream = __commonJS({
  "node_modules/pngjs/lib/chunkstream.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var ChunkStream = module.exports = function() {
      Stream.call(this);
      this._buffers = [];
      this._buffered = 0;
      this._reads = [];
      this._paused = false;
      this._encoding = "utf8";
      this.writable = true;
    };
    util.inherits(ChunkStream, Stream);
    ChunkStream.prototype.read = function(length, callback) {
      this._reads.push({
        length: Math.abs(length),
        // if length < 0 then at most this length
        allowLess: length < 0,
        func: callback
      });
      process.nextTick(
        function() {
          this._process();
          if (this._paused && this._reads && this._reads.length > 0) {
            this._paused = false;
            this.emit("drain");
          }
        }.bind(this)
      );
    };
    ChunkStream.prototype.write = function(data, encoding) {
      if (!this.writable) {
        this.emit("error", new Error("Stream not writable"));
        return false;
      }
      let dataBuffer;
      if (Buffer.isBuffer(data)) {
        dataBuffer = data;
      } else {
        dataBuffer = Buffer.from(data, encoding || this._encoding);
      }
      this._buffers.push(dataBuffer);
      this._buffered += dataBuffer.length;
      this._process();
      if (this._reads && this._reads.length === 0) {
        this._paused = true;
      }
      return this.writable && !this._paused;
    };
    ChunkStream.prototype.end = function(data, encoding) {
      if (data) {
        this.write(data, encoding);
      }
      this.writable = false;
      if (!this._buffers) {
        return;
      }
      if (this._buffers.length === 0) {
        this._end();
      } else {
        this._buffers.push(null);
        this._process();
      }
    };
    ChunkStream.prototype.destroySoon = ChunkStream.prototype.end;
    ChunkStream.prototype._end = function() {
      if (this._reads.length > 0) {
        this.emit("error", new Error("Unexpected end of input"));
      }
      this.destroy();
    };
    ChunkStream.prototype.destroy = function() {
      if (!this._buffers) {
        return;
      }
      this.writable = false;
      this._reads = null;
      this._buffers = null;
      this.emit("close");
    };
    ChunkStream.prototype._processReadAllowingLess = function(read) {
      this._reads.shift();
      let smallerBuf = this._buffers[0];
      if (smallerBuf.length > read.length) {
        this._buffered -= read.length;
        this._buffers[0] = smallerBuf.slice(read.length);
        read.func.call(this, smallerBuf.slice(0, read.length));
      } else {
        this._buffered -= smallerBuf.length;
        this._buffers.shift();
        read.func.call(this, smallerBuf);
      }
    };
    ChunkStream.prototype._processRead = function(read) {
      this._reads.shift();
      let pos = 0;
      let count = 0;
      let data = Buffer.alloc(read.length);
      while (pos < read.length) {
        let buf = this._buffers[count++];
        let len = Math.min(buf.length, read.length - pos);
        buf.copy(data, pos, 0, len);
        pos += len;
        if (len !== buf.length) {
          this._buffers[--count] = buf.slice(len);
        }
      }
      if (count > 0) {
        this._buffers.splice(0, count);
      }
      this._buffered -= read.length;
      read.func.call(this, data);
    };
    ChunkStream.prototype._process = function() {
      try {
        while (this._buffered > 0 && this._reads && this._reads.length > 0) {
          let read = this._reads[0];
          if (read.allowLess) {
            this._processReadAllowingLess(read);
          } else if (this._buffered >= read.length) {
            this._processRead(read);
          } else {
            break;
          }
        }
        if (this._buffers && !this.writable) {
          this._end();
        }
      } catch (ex) {
        this.emit("error", ex);
      }
    };
  }
});

// node_modules/pngjs/lib/interlace.js
var require_interlace = __commonJS({
  "node_modules/pngjs/lib/interlace.js"(exports) {
    "use strict";
    var imagePasses = [
      {
        // pass 1 - 1px
        x: [0],
        y: [0]
      },
      {
        // pass 2 - 1px
        x: [4],
        y: [0]
      },
      {
        // pass 3 - 2px
        x: [0, 4],
        y: [4]
      },
      {
        // pass 4 - 4px
        x: [2, 6],
        y: [0, 4]
      },
      {
        // pass 5 - 8px
        x: [0, 2, 4, 6],
        y: [2, 6]
      },
      {
        // pass 6 - 16px
        x: [1, 3, 5, 7],
        y: [0, 2, 4, 6]
      },
      {
        // pass 7 - 32px
        x: [0, 1, 2, 3, 4, 5, 6, 7],
        y: [1, 3, 5, 7]
      }
    ];
    exports.getImagePasses = function(width, height) {
      let images = [];
      let xLeftOver = width % 8;
      let yLeftOver = height % 8;
      let xRepeats = (width - xLeftOver) / 8;
      let yRepeats = (height - yLeftOver) / 8;
      for (let i = 0; i < imagePasses.length; i++) {
        let pass2 = imagePasses[i];
        let passWidth = xRepeats * pass2.x.length;
        let passHeight = yRepeats * pass2.y.length;
        for (let j = 0; j < pass2.x.length; j++) {
          if (pass2.x[j] < xLeftOver) {
            passWidth++;
          } else {
            break;
          }
        }
        for (let j = 0; j < pass2.y.length; j++) {
          if (pass2.y[j] < yLeftOver) {
            passHeight++;
          } else {
            break;
          }
        }
        if (passWidth > 0 && passHeight > 0) {
          images.push({ width: passWidth, height: passHeight, index: i });
        }
      }
      return images;
    };
    exports.getInterlaceIterator = function(width) {
      return function(x, y, pass2) {
        let outerXLeftOver = x % imagePasses[pass2].x.length;
        let outerX = (x - outerXLeftOver) / imagePasses[pass2].x.length * 8 + imagePasses[pass2].x[outerXLeftOver];
        let outerYLeftOver = y % imagePasses[pass2].y.length;
        let outerY = (y - outerYLeftOver) / imagePasses[pass2].y.length * 8 + imagePasses[pass2].y[outerYLeftOver];
        return outerX * 4 + outerY * width * 4;
      };
    };
  }
});

// node_modules/pngjs/lib/paeth-predictor.js
var require_paeth_predictor = __commonJS({
  "node_modules/pngjs/lib/paeth-predictor.js"(exports, module) {
    "use strict";
    module.exports = function paethPredictor(left, above, upLeft) {
      let paeth = left + above - upLeft;
      let pLeft = Math.abs(paeth - left);
      let pAbove = Math.abs(paeth - above);
      let pUpLeft = Math.abs(paeth - upLeft);
      if (pLeft <= pAbove && pLeft <= pUpLeft) {
        return left;
      }
      if (pAbove <= pUpLeft) {
        return above;
      }
      return upLeft;
    };
  }
});

// node_modules/pngjs/lib/filter-parse.js
var require_filter_parse = __commonJS({
  "node_modules/pngjs/lib/filter-parse.js"(exports, module) {
    "use strict";
    var interlaceUtils = require_interlace();
    var paethPredictor = require_paeth_predictor();
    function getByteWidth(width, bpp, depth) {
      let byteWidth = width * bpp;
      if (depth !== 8) {
        byteWidth = Math.ceil(byteWidth / (8 / depth));
      }
      return byteWidth;
    }
    var Filter = module.exports = function(bitmapInfo, dependencies) {
      let width = bitmapInfo.width;
      let height = bitmapInfo.height;
      let interlace = bitmapInfo.interlace;
      let bpp = bitmapInfo.bpp;
      let depth = bitmapInfo.depth;
      this.read = dependencies.read;
      this.write = dependencies.write;
      this.complete = dependencies.complete;
      this._imageIndex = 0;
      this._images = [];
      if (interlace) {
        let passes = interlaceUtils.getImagePasses(width, height);
        for (let i = 0; i < passes.length; i++) {
          this._images.push({
            byteWidth: getByteWidth(passes[i].width, bpp, depth),
            height: passes[i].height,
            lineIndex: 0
          });
        }
      } else {
        this._images.push({
          byteWidth: getByteWidth(width, bpp, depth),
          height,
          lineIndex: 0
        });
      }
      if (depth === 8) {
        this._xComparison = bpp;
      } else if (depth === 16) {
        this._xComparison = bpp * 2;
      } else {
        this._xComparison = 1;
      }
    };
    Filter.prototype.start = function() {
      this.read(
        this._images[this._imageIndex].byteWidth + 1,
        this._reverseFilterLine.bind(this)
      );
    };
    Filter.prototype._unFilterType1 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f1Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        unfilteredLine[x] = rawByte + f1Left;
      }
    };
    Filter.prototype._unFilterType2 = function(rawData, unfilteredLine, byteWidth) {
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f2Up = lastLine ? lastLine[x] : 0;
        unfilteredLine[x] = rawByte + f2Up;
      }
    };
    Filter.prototype._unFilterType3 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f3Up = lastLine ? lastLine[x] : 0;
        let f3Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        let f3Add = Math.floor((f3Left + f3Up) / 2);
        unfilteredLine[x] = rawByte + f3Add;
      }
    };
    Filter.prototype._unFilterType4 = function(rawData, unfilteredLine, byteWidth) {
      let xComparison = this._xComparison;
      let xBiggerThan = xComparison - 1;
      let lastLine = this._lastLine;
      for (let x = 0; x < byteWidth; x++) {
        let rawByte = rawData[1 + x];
        let f4Up = lastLine ? lastLine[x] : 0;
        let f4Left = x > xBiggerThan ? unfilteredLine[x - xComparison] : 0;
        let f4UpLeft = x > xBiggerThan && lastLine ? lastLine[x - xComparison] : 0;
        let f4Add = paethPredictor(f4Left, f4Up, f4UpLeft);
        unfilteredLine[x] = rawByte + f4Add;
      }
    };
    Filter.prototype._reverseFilterLine = function(rawData) {
      let filter = rawData[0];
      let unfilteredLine;
      let currentImage = this._images[this._imageIndex];
      let byteWidth = currentImage.byteWidth;
      if (filter === 0) {
        unfilteredLine = rawData.slice(1, byteWidth + 1);
      } else {
        unfilteredLine = Buffer.alloc(byteWidth);
        switch (filter) {
          case 1:
            this._unFilterType1(rawData, unfilteredLine, byteWidth);
            break;
          case 2:
            this._unFilterType2(rawData, unfilteredLine, byteWidth);
            break;
          case 3:
            this._unFilterType3(rawData, unfilteredLine, byteWidth);
            break;
          case 4:
            this._unFilterType4(rawData, unfilteredLine, byteWidth);
            break;
          default:
            throw new Error("Unrecognised filter type - " + filter);
        }
      }
      this.write(unfilteredLine);
      currentImage.lineIndex++;
      if (currentImage.lineIndex >= currentImage.height) {
        this._lastLine = null;
        this._imageIndex++;
        currentImage = this._images[this._imageIndex];
      } else {
        this._lastLine = unfilteredLine;
      }
      if (currentImage) {
        this.read(currentImage.byteWidth + 1, this._reverseFilterLine.bind(this));
      } else {
        this._lastLine = null;
        this.complete();
      }
    };
  }
});

// node_modules/pngjs/lib/filter-parse-async.js
var require_filter_parse_async = __commonJS({
  "node_modules/pngjs/lib/filter-parse-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var ChunkStream = require_chunkstream();
    var Filter = require_filter_parse();
    var FilterAsync = module.exports = function(bitmapInfo) {
      ChunkStream.call(this);
      let buffers = [];
      let that = this;
      this._filter = new Filter(bitmapInfo, {
        read: this.read.bind(this),
        write: function(buffer) {
          buffers.push(buffer);
        },
        complete: function() {
          that.emit("complete", Buffer.concat(buffers));
        }
      });
      this._filter.start();
    };
    util.inherits(FilterAsync, ChunkStream);
  }
});

// node_modules/pngjs/lib/constants.js
var require_constants = __commonJS({
  "node_modules/pngjs/lib/constants.js"(exports, module) {
    "use strict";
    module.exports = {
      PNG_SIGNATURE: [137, 80, 78, 71, 13, 10, 26, 10],
      TYPE_IHDR: 1229472850,
      TYPE_IEND: 1229278788,
      TYPE_IDAT: 1229209940,
      TYPE_PLTE: 1347179589,
      TYPE_tRNS: 1951551059,
      // eslint-disable-line camelcase
      TYPE_gAMA: 1732332865,
      // eslint-disable-line camelcase
      // color-type bits
      COLORTYPE_GRAYSCALE: 0,
      COLORTYPE_PALETTE: 1,
      COLORTYPE_COLOR: 2,
      COLORTYPE_ALPHA: 4,
      // e.g. grayscale and alpha
      // color-type combinations
      COLORTYPE_PALETTE_COLOR: 3,
      COLORTYPE_COLOR_ALPHA: 6,
      COLORTYPE_TO_BPP_MAP: {
        0: 1,
        2: 3,
        3: 1,
        4: 2,
        6: 4
      },
      GAMMA_DIVISION: 1e5
    };
  }
});

// node_modules/pngjs/lib/crc.js
var require_crc = __commonJS({
  "node_modules/pngjs/lib/crc.js"(exports, module) {
    "use strict";
    var crcTable = [];
    (function() {
      for (let i = 0; i < 256; i++) {
        let currentCrc = i;
        for (let j = 0; j < 8; j++) {
          if (currentCrc & 1) {
            currentCrc = 3988292384 ^ currentCrc >>> 1;
          } else {
            currentCrc = currentCrc >>> 1;
          }
        }
        crcTable[i] = currentCrc;
      }
    })();
    var CrcCalculator = module.exports = function() {
      this._crc = -1;
    };
    CrcCalculator.prototype.write = function(data) {
      for (let i = 0; i < data.length; i++) {
        this._crc = crcTable[(this._crc ^ data[i]) & 255] ^ this._crc >>> 8;
      }
      return true;
    };
    CrcCalculator.prototype.crc32 = function() {
      return this._crc ^ -1;
    };
    CrcCalculator.crc32 = function(buf) {
      let crc = -1;
      for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 255] ^ crc >>> 8;
      }
      return crc ^ -1;
    };
  }
});

// node_modules/pngjs/lib/parser.js
var require_parser = __commonJS({
  "node_modules/pngjs/lib/parser.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var CrcCalculator = require_crc();
    var Parser = module.exports = function(options, dependencies) {
      this._options = options;
      options.checkCRC = options.checkCRC !== false;
      this._hasIHDR = false;
      this._hasIEND = false;
      this._emittedHeadersFinished = false;
      this._palette = [];
      this._colorType = 0;
      this._chunks = {};
      this._chunks[constants.TYPE_IHDR] = this._handleIHDR.bind(this);
      this._chunks[constants.TYPE_IEND] = this._handleIEND.bind(this);
      this._chunks[constants.TYPE_IDAT] = this._handleIDAT.bind(this);
      this._chunks[constants.TYPE_PLTE] = this._handlePLTE.bind(this);
      this._chunks[constants.TYPE_tRNS] = this._handleTRNS.bind(this);
      this._chunks[constants.TYPE_gAMA] = this._handleGAMA.bind(this);
      this.read = dependencies.read;
      this.error = dependencies.error;
      this.metadata = dependencies.metadata;
      this.gamma = dependencies.gamma;
      this.transColor = dependencies.transColor;
      this.palette = dependencies.palette;
      this.parsed = dependencies.parsed;
      this.inflateData = dependencies.inflateData;
      this.finished = dependencies.finished;
      this.simpleTransparency = dependencies.simpleTransparency;
      this.headersFinished = dependencies.headersFinished || function() {
      };
    };
    Parser.prototype.start = function() {
      this.read(constants.PNG_SIGNATURE.length, this._parseSignature.bind(this));
    };
    Parser.prototype._parseSignature = function(data) {
      let signature = constants.PNG_SIGNATURE;
      for (let i = 0; i < signature.length; i++) {
        if (data[i] !== signature[i]) {
          this.error(new Error("Invalid file signature"));
          return;
        }
      }
      this.read(8, this._parseChunkBegin.bind(this));
    };
    Parser.prototype._parseChunkBegin = function(data) {
      let length = data.readUInt32BE(0);
      let type = data.readUInt32BE(4);
      let name = "";
      for (let i = 4; i < 8; i++) {
        name += String.fromCharCode(data[i]);
      }
      let ancillary = Boolean(data[4] & 32);
      if (!this._hasIHDR && type !== constants.TYPE_IHDR) {
        this.error(new Error("Expected IHDR on beggining"));
        return;
      }
      this._crc = new CrcCalculator();
      this._crc.write(Buffer.from(name));
      if (this._chunks[type]) {
        return this._chunks[type](length);
      }
      if (!ancillary) {
        this.error(new Error("Unsupported critical chunk type " + name));
        return;
      }
      this.read(length + 4, this._skipChunk.bind(this));
    };
    Parser.prototype._skipChunk = function() {
      this.read(8, this._parseChunkBegin.bind(this));
    };
    Parser.prototype._handleChunkEnd = function() {
      this.read(4, this._parseChunkEnd.bind(this));
    };
    Parser.prototype._parseChunkEnd = function(data) {
      let fileCrc = data.readInt32BE(0);
      let calcCrc = this._crc.crc32();
      if (this._options.checkCRC && calcCrc !== fileCrc) {
        this.error(new Error("Crc error - " + fileCrc + " - " + calcCrc));
        return;
      }
      if (!this._hasIEND) {
        this.read(8, this._parseChunkBegin.bind(this));
      }
    };
    Parser.prototype._handleIHDR = function(length) {
      this.read(length, this._parseIHDR.bind(this));
    };
    Parser.prototype._parseIHDR = function(data) {
      this._crc.write(data);
      let width = data.readUInt32BE(0);
      let height = data.readUInt32BE(4);
      let depth = data[8];
      let colorType = data[9];
      let compr = data[10];
      let filter = data[11];
      let interlace = data[12];
      if (depth !== 8 && depth !== 4 && depth !== 2 && depth !== 1 && depth !== 16) {
        this.error(new Error("Unsupported bit depth " + depth));
        return;
      }
      if (!(colorType in constants.COLORTYPE_TO_BPP_MAP)) {
        this.error(new Error("Unsupported color type"));
        return;
      }
      if (compr !== 0) {
        this.error(new Error("Unsupported compression method"));
        return;
      }
      if (filter !== 0) {
        this.error(new Error("Unsupported filter method"));
        return;
      }
      if (interlace !== 0 && interlace !== 1) {
        this.error(new Error("Unsupported interlace method"));
        return;
      }
      this._colorType = colorType;
      let bpp = constants.COLORTYPE_TO_BPP_MAP[this._colorType];
      this._hasIHDR = true;
      this.metadata({
        width,
        height,
        depth,
        interlace: Boolean(interlace),
        palette: Boolean(colorType & constants.COLORTYPE_PALETTE),
        color: Boolean(colorType & constants.COLORTYPE_COLOR),
        alpha: Boolean(colorType & constants.COLORTYPE_ALPHA),
        bpp,
        colorType
      });
      this._handleChunkEnd();
    };
    Parser.prototype._handlePLTE = function(length) {
      this.read(length, this._parsePLTE.bind(this));
    };
    Parser.prototype._parsePLTE = function(data) {
      this._crc.write(data);
      let entries = Math.floor(data.length / 3);
      for (let i = 0; i < entries; i++) {
        this._palette.push([data[i * 3], data[i * 3 + 1], data[i * 3 + 2], 255]);
      }
      this.palette(this._palette);
      this._handleChunkEnd();
    };
    Parser.prototype._handleTRNS = function(length) {
      this.simpleTransparency();
      this.read(length, this._parseTRNS.bind(this));
    };
    Parser.prototype._parseTRNS = function(data) {
      this._crc.write(data);
      if (this._colorType === constants.COLORTYPE_PALETTE_COLOR) {
        if (this._palette.length === 0) {
          this.error(new Error("Transparency chunk must be after palette"));
          return;
        }
        if (data.length > this._palette.length) {
          this.error(new Error("More transparent colors than palette size"));
          return;
        }
        for (let i = 0; i < data.length; i++) {
          this._palette[i][3] = data[i];
        }
        this.palette(this._palette);
      }
      if (this._colorType === constants.COLORTYPE_GRAYSCALE) {
        this.transColor([data.readUInt16BE(0)]);
      }
      if (this._colorType === constants.COLORTYPE_COLOR) {
        this.transColor([
          data.readUInt16BE(0),
          data.readUInt16BE(2),
          data.readUInt16BE(4)
        ]);
      }
      this._handleChunkEnd();
    };
    Parser.prototype._handleGAMA = function(length) {
      this.read(length, this._parseGAMA.bind(this));
    };
    Parser.prototype._parseGAMA = function(data) {
      this._crc.write(data);
      this.gamma(data.readUInt32BE(0) / constants.GAMMA_DIVISION);
      this._handleChunkEnd();
    };
    Parser.prototype._handleIDAT = function(length) {
      if (!this._emittedHeadersFinished) {
        this._emittedHeadersFinished = true;
        this.headersFinished();
      }
      this.read(-length, this._parseIDAT.bind(this, length));
    };
    Parser.prototype._parseIDAT = function(length, data) {
      this._crc.write(data);
      if (this._colorType === constants.COLORTYPE_PALETTE_COLOR && this._palette.length === 0) {
        throw new Error("Expected palette not found");
      }
      this.inflateData(data);
      let leftOverLength = length - data.length;
      if (leftOverLength > 0) {
        this._handleIDAT(leftOverLength);
      } else {
        this._handleChunkEnd();
      }
    };
    Parser.prototype._handleIEND = function(length) {
      this.read(length, this._parseIEND.bind(this));
    };
    Parser.prototype._parseIEND = function(data) {
      this._crc.write(data);
      this._hasIEND = true;
      this._handleChunkEnd();
      if (this.finished) {
        this.finished();
      }
    };
  }
});

// node_modules/pngjs/lib/bitmapper.js
var require_bitmapper = __commonJS({
  "node_modules/pngjs/lib/bitmapper.js"(exports) {
    "use strict";
    var interlaceUtils = require_interlace();
    var pixelBppMapper = [
      // 0 - dummy entry
      function() {
      },
      // 1 - L
      // 0: 0, 1: 0, 2: 0, 3: 0xff
      function(pxData, data, pxPos, rawPos) {
        if (rawPos === data.length) {
          throw new Error("Ran out of data");
        }
        let pixel = data[rawPos];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = 255;
      },
      // 2 - LA
      // 0: 0, 1: 0, 2: 0, 3: 1
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 1 >= data.length) {
          throw new Error("Ran out of data");
        }
        let pixel = data[rawPos];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = data[rawPos + 1];
      },
      // 3 - RGB
      // 0: 0, 1: 1, 2: 2, 3: 0xff
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 2 >= data.length) {
          throw new Error("Ran out of data");
        }
        pxData[pxPos] = data[rawPos];
        pxData[pxPos + 1] = data[rawPos + 1];
        pxData[pxPos + 2] = data[rawPos + 2];
        pxData[pxPos + 3] = 255;
      },
      // 4 - RGBA
      // 0: 0, 1: 1, 2: 2, 3: 3
      function(pxData, data, pxPos, rawPos) {
        if (rawPos + 3 >= data.length) {
          throw new Error("Ran out of data");
        }
        pxData[pxPos] = data[rawPos];
        pxData[pxPos + 1] = data[rawPos + 1];
        pxData[pxPos + 2] = data[rawPos + 2];
        pxData[pxPos + 3] = data[rawPos + 3];
      }
    ];
    var pixelBppCustomMapper = [
      // 0 - dummy entry
      function() {
      },
      // 1 - L
      // 0: 0, 1: 0, 2: 0, 3: 0xff
      function(pxData, pixelData, pxPos, maxBit) {
        let pixel = pixelData[0];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = maxBit;
      },
      // 2 - LA
      // 0: 0, 1: 0, 2: 0, 3: 1
      function(pxData, pixelData, pxPos) {
        let pixel = pixelData[0];
        pxData[pxPos] = pixel;
        pxData[pxPos + 1] = pixel;
        pxData[pxPos + 2] = pixel;
        pxData[pxPos + 3] = pixelData[1];
      },
      // 3 - RGB
      // 0: 0, 1: 1, 2: 2, 3: 0xff
      function(pxData, pixelData, pxPos, maxBit) {
        pxData[pxPos] = pixelData[0];
        pxData[pxPos + 1] = pixelData[1];
        pxData[pxPos + 2] = pixelData[2];
        pxData[pxPos + 3] = maxBit;
      },
      // 4 - RGBA
      // 0: 0, 1: 1, 2: 2, 3: 3
      function(pxData, pixelData, pxPos) {
        pxData[pxPos] = pixelData[0];
        pxData[pxPos + 1] = pixelData[1];
        pxData[pxPos + 2] = pixelData[2];
        pxData[pxPos + 3] = pixelData[3];
      }
    ];
    function bitRetriever(data, depth) {
      let leftOver = [];
      let i = 0;
      function split() {
        if (i === data.length) {
          throw new Error("Ran out of data");
        }
        let byte = data[i];
        i++;
        let byte8, byte7, byte6, byte5, byte4, byte3, byte2, byte1;
        switch (depth) {
          default:
            throw new Error("unrecognised depth");
          case 16:
            byte2 = data[i];
            i++;
            leftOver.push((byte << 8) + byte2);
            break;
          case 4:
            byte2 = byte & 15;
            byte1 = byte >> 4;
            leftOver.push(byte1, byte2);
            break;
          case 2:
            byte4 = byte & 3;
            byte3 = byte >> 2 & 3;
            byte2 = byte >> 4 & 3;
            byte1 = byte >> 6 & 3;
            leftOver.push(byte1, byte2, byte3, byte4);
            break;
          case 1:
            byte8 = byte & 1;
            byte7 = byte >> 1 & 1;
            byte6 = byte >> 2 & 1;
            byte5 = byte >> 3 & 1;
            byte4 = byte >> 4 & 1;
            byte3 = byte >> 5 & 1;
            byte2 = byte >> 6 & 1;
            byte1 = byte >> 7 & 1;
            leftOver.push(byte1, byte2, byte3, byte4, byte5, byte6, byte7, byte8);
            break;
        }
      }
      return {
        get: function(count) {
          while (leftOver.length < count) {
            split();
          }
          let returner = leftOver.slice(0, count);
          leftOver = leftOver.slice(count);
          return returner;
        },
        resetAfterLine: function() {
          leftOver.length = 0;
        },
        end: function() {
          if (i !== data.length) {
            throw new Error("extra data found");
          }
        }
      };
    }
    function mapImage8Bit(image, pxData, getPxPos, bpp, data, rawPos) {
      let imageWidth = image.width;
      let imageHeight = image.height;
      let imagePass = image.index;
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let pxPos = getPxPos(x, y, imagePass);
          pixelBppMapper[bpp](pxData, data, pxPos, rawPos);
          rawPos += bpp;
        }
      }
      return rawPos;
    }
    function mapImageCustomBit(image, pxData, getPxPos, bpp, bits, maxBit) {
      let imageWidth = image.width;
      let imageHeight = image.height;
      let imagePass = image.index;
      for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
          let pixelData = bits.get(bpp);
          let pxPos = getPxPos(x, y, imagePass);
          pixelBppCustomMapper[bpp](pxData, pixelData, pxPos, maxBit);
        }
        bits.resetAfterLine();
      }
    }
    exports.dataToBitMap = function(data, bitmapInfo) {
      let width = bitmapInfo.width;
      let height = bitmapInfo.height;
      let depth = bitmapInfo.depth;
      let bpp = bitmapInfo.bpp;
      let interlace = bitmapInfo.interlace;
      let bits;
      if (depth !== 8) {
        bits = bitRetriever(data, depth);
      }
      let pxData;
      if (depth <= 8) {
        pxData = Buffer.alloc(width * height * 4);
      } else {
        pxData = new Uint16Array(width * height * 4);
      }
      let maxBit = Math.pow(2, depth) - 1;
      let rawPos = 0;
      let images;
      let getPxPos;
      if (interlace) {
        images = interlaceUtils.getImagePasses(width, height);
        getPxPos = interlaceUtils.getInterlaceIterator(width, height);
      } else {
        let nonInterlacedPxPos = 0;
        getPxPos = function() {
          let returner = nonInterlacedPxPos;
          nonInterlacedPxPos += 4;
          return returner;
        };
        images = [{ width, height }];
      }
      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        if (depth === 8) {
          rawPos = mapImage8Bit(
            images[imageIndex],
            pxData,
            getPxPos,
            bpp,
            data,
            rawPos
          );
        } else {
          mapImageCustomBit(
            images[imageIndex],
            pxData,
            getPxPos,
            bpp,
            bits,
            maxBit
          );
        }
      }
      if (depth === 8) {
        if (rawPos !== data.length) {
          throw new Error("extra data found");
        }
      } else {
        bits.end();
      }
      return pxData;
    };
  }
});

// node_modules/pngjs/lib/format-normaliser.js
var require_format_normaliser = __commonJS({
  "node_modules/pngjs/lib/format-normaliser.js"(exports, module) {
    "use strict";
    function dePalette(indata, outdata, width, height, palette) {
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let color = palette[indata[pxPos]];
          if (!color) {
            throw new Error("index " + indata[pxPos] + " not in palette");
          }
          for (let i = 0; i < 4; i++) {
            outdata[pxPos + i] = color[i];
          }
          pxPos += 4;
        }
      }
    }
    function replaceTransparentColor(indata, outdata, width, height, transColor) {
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let makeTrans = false;
          if (transColor.length === 1) {
            if (transColor[0] === indata[pxPos]) {
              makeTrans = true;
            }
          } else if (transColor[0] === indata[pxPos] && transColor[1] === indata[pxPos + 1] && transColor[2] === indata[pxPos + 2]) {
            makeTrans = true;
          }
          if (makeTrans) {
            for (let i = 0; i < 4; i++) {
              outdata[pxPos + i] = 0;
            }
          }
          pxPos += 4;
        }
      }
    }
    function scaleDepth(indata, outdata, width, height, depth) {
      let maxOutSample = 255;
      let maxInSample = Math.pow(2, depth) - 1;
      let pxPos = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let i = 0; i < 4; i++) {
            outdata[pxPos + i] = Math.floor(
              indata[pxPos + i] * maxOutSample / maxInSample + 0.5
            );
          }
          pxPos += 4;
        }
      }
    }
    module.exports = function(indata, imageData) {
      let depth = imageData.depth;
      let width = imageData.width;
      let height = imageData.height;
      let colorType = imageData.colorType;
      let transColor = imageData.transColor;
      let palette = imageData.palette;
      let outdata = indata;
      if (colorType === 3) {
        dePalette(indata, outdata, width, height, palette);
      } else {
        if (transColor) {
          replaceTransparentColor(indata, outdata, width, height, transColor);
        }
        if (depth !== 8) {
          if (depth === 16) {
            outdata = Buffer.alloc(width * height * 4);
          }
          scaleDepth(indata, outdata, width, height, depth);
        }
      }
      return outdata;
    };
  }
});

// node_modules/pngjs/lib/parser-async.js
var require_parser_async = __commonJS({
  "node_modules/pngjs/lib/parser-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var zlib = __require("zlib");
    var ChunkStream = require_chunkstream();
    var FilterAsync = require_filter_parse_async();
    var Parser = require_parser();
    var bitmapper = require_bitmapper();
    var formatNormaliser = require_format_normaliser();
    var ParserAsync = module.exports = function(options) {
      ChunkStream.call(this);
      this._parser = new Parser(options, {
        read: this.read.bind(this),
        error: this._handleError.bind(this),
        metadata: this._handleMetaData.bind(this),
        gamma: this.emit.bind(this, "gamma"),
        palette: this._handlePalette.bind(this),
        transColor: this._handleTransColor.bind(this),
        finished: this._finished.bind(this),
        inflateData: this._inflateData.bind(this),
        simpleTransparency: this._simpleTransparency.bind(this),
        headersFinished: this._headersFinished.bind(this)
      });
      this._options = options;
      this.writable = true;
      this._parser.start();
    };
    util.inherits(ParserAsync, ChunkStream);
    ParserAsync.prototype._handleError = function(err) {
      this.emit("error", err);
      this.writable = false;
      this.destroy();
      if (this._inflate && this._inflate.destroy) {
        this._inflate.destroy();
      }
      if (this._filter) {
        this._filter.destroy();
        this._filter.on("error", function() {
        });
      }
      this.errord = true;
    };
    ParserAsync.prototype._inflateData = function(data) {
      if (!this._inflate) {
        if (this._bitmapInfo.interlace) {
          this._inflate = zlib.createInflate();
          this._inflate.on("error", this.emit.bind(this, "error"));
          this._filter.on("complete", this._complete.bind(this));
          this._inflate.pipe(this._filter);
        } else {
          let rowSize = (this._bitmapInfo.width * this._bitmapInfo.bpp * this._bitmapInfo.depth + 7 >> 3) + 1;
          let imageSize = rowSize * this._bitmapInfo.height;
          let chunkSize = Math.max(imageSize, zlib.Z_MIN_CHUNK);
          this._inflate = zlib.createInflate({ chunkSize });
          let leftToInflate = imageSize;
          let emitError = this.emit.bind(this, "error");
          this._inflate.on("error", function(err) {
            if (!leftToInflate) {
              return;
            }
            emitError(err);
          });
          this._filter.on("complete", this._complete.bind(this));
          let filterWrite = this._filter.write.bind(this._filter);
          this._inflate.on("data", function(chunk) {
            if (!leftToInflate) {
              return;
            }
            if (chunk.length > leftToInflate) {
              chunk = chunk.slice(0, leftToInflate);
            }
            leftToInflate -= chunk.length;
            filterWrite(chunk);
          });
          this._inflate.on("end", this._filter.end.bind(this._filter));
        }
      }
      this._inflate.write(data);
    };
    ParserAsync.prototype._handleMetaData = function(metaData) {
      this._metaData = metaData;
      this._bitmapInfo = Object.create(metaData);
      this._filter = new FilterAsync(this._bitmapInfo);
    };
    ParserAsync.prototype._handleTransColor = function(transColor) {
      this._bitmapInfo.transColor = transColor;
    };
    ParserAsync.prototype._handlePalette = function(palette) {
      this._bitmapInfo.palette = palette;
    };
    ParserAsync.prototype._simpleTransparency = function() {
      this._metaData.alpha = true;
    };
    ParserAsync.prototype._headersFinished = function() {
      this.emit("metadata", this._metaData);
    };
    ParserAsync.prototype._finished = function() {
      if (this.errord) {
        return;
      }
      if (!this._inflate) {
        this.emit("error", "No Inflate block");
      } else {
        this._inflate.end();
      }
    };
    ParserAsync.prototype._complete = function(filteredData) {
      if (this.errord) {
        return;
      }
      let normalisedBitmapData;
      try {
        let bitmapData = bitmapper.dataToBitMap(filteredData, this._bitmapInfo);
        normalisedBitmapData = formatNormaliser(bitmapData, this._bitmapInfo);
        bitmapData = null;
      } catch (ex) {
        this._handleError(ex);
        return;
      }
      this.emit("parsed", normalisedBitmapData);
    };
  }
});

// node_modules/pngjs/lib/bitpacker.js
var require_bitpacker = __commonJS({
  "node_modules/pngjs/lib/bitpacker.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    module.exports = function(dataIn, width, height, options) {
      let outHasAlpha = [constants.COLORTYPE_COLOR_ALPHA, constants.COLORTYPE_ALPHA].indexOf(
        options.colorType
      ) !== -1;
      if (options.colorType === options.inputColorType) {
        let bigEndian = (function() {
          let buffer = new ArrayBuffer(2);
          new DataView(buffer).setInt16(
            0,
            256,
            true
            /* littleEndian */
          );
          return new Int16Array(buffer)[0] !== 256;
        })();
        if (options.bitDepth === 8 || options.bitDepth === 16 && bigEndian) {
          return dataIn;
        }
      }
      let data = options.bitDepth !== 16 ? dataIn : new Uint16Array(dataIn.buffer);
      let maxValue = 255;
      let inBpp = constants.COLORTYPE_TO_BPP_MAP[options.inputColorType];
      if (inBpp === 4 && !options.inputHasAlpha) {
        inBpp = 3;
      }
      let outBpp = constants.COLORTYPE_TO_BPP_MAP[options.colorType];
      if (options.bitDepth === 16) {
        maxValue = 65535;
        outBpp *= 2;
      }
      let outData = Buffer.alloc(width * height * outBpp);
      let inIndex = 0;
      let outIndex = 0;
      let bgColor = options.bgColor || {};
      if (bgColor.red === void 0) {
        bgColor.red = maxValue;
      }
      if (bgColor.green === void 0) {
        bgColor.green = maxValue;
      }
      if (bgColor.blue === void 0) {
        bgColor.blue = maxValue;
      }
      function getRGBA() {
        let red;
        let green;
        let blue;
        let alpha = maxValue;
        switch (options.inputColorType) {
          case constants.COLORTYPE_COLOR_ALPHA:
            alpha = data[inIndex + 3];
            red = data[inIndex];
            green = data[inIndex + 1];
            blue = data[inIndex + 2];
            break;
          case constants.COLORTYPE_COLOR:
            red = data[inIndex];
            green = data[inIndex + 1];
            blue = data[inIndex + 2];
            break;
          case constants.COLORTYPE_ALPHA:
            alpha = data[inIndex + 1];
            red = data[inIndex];
            green = red;
            blue = red;
            break;
          case constants.COLORTYPE_GRAYSCALE:
            red = data[inIndex];
            green = red;
            blue = red;
            break;
          default:
            throw new Error(
              "input color type:" + options.inputColorType + " is not supported at present"
            );
        }
        if (options.inputHasAlpha) {
          if (!outHasAlpha) {
            alpha /= maxValue;
            red = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.red + alpha * red), 0),
              maxValue
            );
            green = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.green + alpha * green), 0),
              maxValue
            );
            blue = Math.min(
              Math.max(Math.round((1 - alpha) * bgColor.blue + alpha * blue), 0),
              maxValue
            );
          }
        }
        return { red, green, blue, alpha };
      }
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let rgba = getRGBA(data, inIndex);
          switch (options.colorType) {
            case constants.COLORTYPE_COLOR_ALPHA:
            case constants.COLORTYPE_COLOR:
              if (options.bitDepth === 8) {
                outData[outIndex] = rgba.red;
                outData[outIndex + 1] = rgba.green;
                outData[outIndex + 2] = rgba.blue;
                if (outHasAlpha) {
                  outData[outIndex + 3] = rgba.alpha;
                }
              } else {
                outData.writeUInt16BE(rgba.red, outIndex);
                outData.writeUInt16BE(rgba.green, outIndex + 2);
                outData.writeUInt16BE(rgba.blue, outIndex + 4);
                if (outHasAlpha) {
                  outData.writeUInt16BE(rgba.alpha, outIndex + 6);
                }
              }
              break;
            case constants.COLORTYPE_ALPHA:
            case constants.COLORTYPE_GRAYSCALE: {
              let grayscale = (rgba.red + rgba.green + rgba.blue) / 3;
              if (options.bitDepth === 8) {
                outData[outIndex] = grayscale;
                if (outHasAlpha) {
                  outData[outIndex + 1] = rgba.alpha;
                }
              } else {
                outData.writeUInt16BE(grayscale, outIndex);
                if (outHasAlpha) {
                  outData.writeUInt16BE(rgba.alpha, outIndex + 2);
                }
              }
              break;
            }
            default:
              throw new Error("unrecognised color Type " + options.colorType);
          }
          inIndex += inBpp;
          outIndex += outBpp;
        }
      }
      return outData;
    };
  }
});

// node_modules/pngjs/lib/filter-pack.js
var require_filter_pack = __commonJS({
  "node_modules/pngjs/lib/filter-pack.js"(exports, module) {
    "use strict";
    var paethPredictor = require_paeth_predictor();
    function filterNone(pxData, pxPos, byteWidth, rawData, rawPos) {
      for (let x = 0; x < byteWidth; x++) {
        rawData[rawPos + x] = pxData[pxPos + x];
      }
    }
    function filterSumNone(pxData, pxPos, byteWidth) {
      let sum = 0;
      let length = pxPos + byteWidth;
      for (let i = pxPos; i < length; i++) {
        sum += Math.abs(pxData[i]);
      }
      return sum;
    }
    function filterSub(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let val = pxData[pxPos + x] - left;
        rawData[rawPos + x] = val;
      }
    }
    function filterSumSub(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let val = pxData[pxPos + x] - left;
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterUp(pxData, pxPos, byteWidth, rawData, rawPos) {
      for (let x = 0; x < byteWidth; x++) {
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - up;
        rawData[rawPos + x] = val;
      }
    }
    function filterSumUp(pxData, pxPos, byteWidth) {
      let sum = 0;
      let length = pxPos + byteWidth;
      for (let x = pxPos; x < length; x++) {
        let up = pxPos > 0 ? pxData[x - byteWidth] : 0;
        let val = pxData[x] - up;
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterAvg(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - (left + up >> 1);
        rawData[rawPos + x] = val;
      }
    }
    function filterSumAvg(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let val = pxData[pxPos + x] - (left + up >> 1);
        sum += Math.abs(val);
      }
      return sum;
    }
    function filterPaeth(pxData, pxPos, byteWidth, rawData, rawPos, bpp) {
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
        let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
        rawData[rawPos + x] = val;
      }
    }
    function filterSumPaeth(pxData, pxPos, byteWidth, bpp) {
      let sum = 0;
      for (let x = 0; x < byteWidth; x++) {
        let left = x >= bpp ? pxData[pxPos + x - bpp] : 0;
        let up = pxPos > 0 ? pxData[pxPos + x - byteWidth] : 0;
        let upleft = pxPos > 0 && x >= bpp ? pxData[pxPos + x - (byteWidth + bpp)] : 0;
        let val = pxData[pxPos + x] - paethPredictor(left, up, upleft);
        sum += Math.abs(val);
      }
      return sum;
    }
    var filters = {
      0: filterNone,
      1: filterSub,
      2: filterUp,
      3: filterAvg,
      4: filterPaeth
    };
    var filterSums = {
      0: filterSumNone,
      1: filterSumSub,
      2: filterSumUp,
      3: filterSumAvg,
      4: filterSumPaeth
    };
    module.exports = function(pxData, width, height, options, bpp) {
      let filterTypes;
      if (!("filterType" in options) || options.filterType === -1) {
        filterTypes = [0, 1, 2, 3, 4];
      } else if (typeof options.filterType === "number") {
        filterTypes = [options.filterType];
      } else {
        throw new Error("unrecognised filter types");
      }
      if (options.bitDepth === 16) {
        bpp *= 2;
      }
      let byteWidth = width * bpp;
      let rawPos = 0;
      let pxPos = 0;
      let rawData = Buffer.alloc((byteWidth + 1) * height);
      let sel = filterTypes[0];
      for (let y = 0; y < height; y++) {
        if (filterTypes.length > 1) {
          let min = Infinity;
          for (let i = 0; i < filterTypes.length; i++) {
            let sum = filterSums[filterTypes[i]](pxData, pxPos, byteWidth, bpp);
            if (sum < min) {
              sel = filterTypes[i];
              min = sum;
            }
          }
        }
        rawData[rawPos] = sel;
        rawPos++;
        filters[sel](pxData, pxPos, byteWidth, rawData, rawPos, bpp);
        rawPos += byteWidth;
        pxPos += byteWidth;
      }
      return rawData;
    };
  }
});

// node_modules/pngjs/lib/packer.js
var require_packer = __commonJS({
  "node_modules/pngjs/lib/packer.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var CrcStream = require_crc();
    var bitPacker = require_bitpacker();
    var filter = require_filter_pack();
    var zlib = __require("zlib");
    var Packer = module.exports = function(options) {
      this._options = options;
      options.deflateChunkSize = options.deflateChunkSize || 32 * 1024;
      options.deflateLevel = options.deflateLevel != null ? options.deflateLevel : 9;
      options.deflateStrategy = options.deflateStrategy != null ? options.deflateStrategy : 3;
      options.inputHasAlpha = options.inputHasAlpha != null ? options.inputHasAlpha : true;
      options.deflateFactory = options.deflateFactory || zlib.createDeflate;
      options.bitDepth = options.bitDepth || 8;
      options.colorType = typeof options.colorType === "number" ? options.colorType : constants.COLORTYPE_COLOR_ALPHA;
      options.inputColorType = typeof options.inputColorType === "number" ? options.inputColorType : constants.COLORTYPE_COLOR_ALPHA;
      if ([
        constants.COLORTYPE_GRAYSCALE,
        constants.COLORTYPE_COLOR,
        constants.COLORTYPE_COLOR_ALPHA,
        constants.COLORTYPE_ALPHA
      ].indexOf(options.colorType) === -1) {
        throw new Error(
          "option color type:" + options.colorType + " is not supported at present"
        );
      }
      if ([
        constants.COLORTYPE_GRAYSCALE,
        constants.COLORTYPE_COLOR,
        constants.COLORTYPE_COLOR_ALPHA,
        constants.COLORTYPE_ALPHA
      ].indexOf(options.inputColorType) === -1) {
        throw new Error(
          "option input color type:" + options.inputColorType + " is not supported at present"
        );
      }
      if (options.bitDepth !== 8 && options.bitDepth !== 16) {
        throw new Error(
          "option bit depth:" + options.bitDepth + " is not supported at present"
        );
      }
    };
    Packer.prototype.getDeflateOptions = function() {
      return {
        chunkSize: this._options.deflateChunkSize,
        level: this._options.deflateLevel,
        strategy: this._options.deflateStrategy
      };
    };
    Packer.prototype.createDeflate = function() {
      return this._options.deflateFactory(this.getDeflateOptions());
    };
    Packer.prototype.filterData = function(data, width, height) {
      let packedData = bitPacker(data, width, height, this._options);
      let bpp = constants.COLORTYPE_TO_BPP_MAP[this._options.colorType];
      let filteredData = filter(packedData, width, height, this._options, bpp);
      return filteredData;
    };
    Packer.prototype._packChunk = function(type, data) {
      let len = data ? data.length : 0;
      let buf = Buffer.alloc(len + 12);
      buf.writeUInt32BE(len, 0);
      buf.writeUInt32BE(type, 4);
      if (data) {
        data.copy(buf, 8);
      }
      buf.writeInt32BE(
        CrcStream.crc32(buf.slice(4, buf.length - 4)),
        buf.length - 4
      );
      return buf;
    };
    Packer.prototype.packGAMA = function(gamma) {
      let buf = Buffer.alloc(4);
      buf.writeUInt32BE(Math.floor(gamma * constants.GAMMA_DIVISION), 0);
      return this._packChunk(constants.TYPE_gAMA, buf);
    };
    Packer.prototype.packIHDR = function(width, height) {
      let buf = Buffer.alloc(13);
      buf.writeUInt32BE(width, 0);
      buf.writeUInt32BE(height, 4);
      buf[8] = this._options.bitDepth;
      buf[9] = this._options.colorType;
      buf[10] = 0;
      buf[11] = 0;
      buf[12] = 0;
      return this._packChunk(constants.TYPE_IHDR, buf);
    };
    Packer.prototype.packIDAT = function(data) {
      return this._packChunk(constants.TYPE_IDAT, data);
    };
    Packer.prototype.packIEND = function() {
      return this._packChunk(constants.TYPE_IEND, null);
    };
  }
});

// node_modules/pngjs/lib/packer-async.js
var require_packer_async = __commonJS({
  "node_modules/pngjs/lib/packer-async.js"(exports, module) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var constants = require_constants();
    var Packer = require_packer();
    var PackerAsync = module.exports = function(opt) {
      Stream.call(this);
      let options = opt || {};
      this._packer = new Packer(options);
      this._deflate = this._packer.createDeflate();
      this.readable = true;
    };
    util.inherits(PackerAsync, Stream);
    PackerAsync.prototype.pack = function(data, width, height, gamma) {
      this.emit("data", Buffer.from(constants.PNG_SIGNATURE));
      this.emit("data", this._packer.packIHDR(width, height));
      if (gamma) {
        this.emit("data", this._packer.packGAMA(gamma));
      }
      let filteredData = this._packer.filterData(data, width, height);
      this._deflate.on("error", this.emit.bind(this, "error"));
      this._deflate.on(
        "data",
        function(compressedData) {
          this.emit("data", this._packer.packIDAT(compressedData));
        }.bind(this)
      );
      this._deflate.on(
        "end",
        function() {
          this.emit("data", this._packer.packIEND());
          this.emit("end");
        }.bind(this)
      );
      this._deflate.end(filteredData);
    };
  }
});

// node_modules/pngjs/lib/sync-inflate.js
var require_sync_inflate = __commonJS({
  "node_modules/pngjs/lib/sync-inflate.js"(exports, module) {
    "use strict";
    var assert = __require("assert").ok;
    var zlib = __require("zlib");
    var util = __require("util");
    var kMaxLength = __require("buffer").kMaxLength;
    function Inflate(opts) {
      if (!(this instanceof Inflate)) {
        return new Inflate(opts);
      }
      if (opts && opts.chunkSize < zlib.Z_MIN_CHUNK) {
        opts.chunkSize = zlib.Z_MIN_CHUNK;
      }
      zlib.Inflate.call(this, opts);
      this._offset = this._offset === void 0 ? this._outOffset : this._offset;
      this._buffer = this._buffer || this._outBuffer;
      if (opts && opts.maxLength != null) {
        this._maxLength = opts.maxLength;
      }
    }
    function createInflate(opts) {
      return new Inflate(opts);
    }
    function _close(engine, callback) {
      if (callback) {
        process.nextTick(callback);
      }
      if (!engine._handle) {
        return;
      }
      engine._handle.close();
      engine._handle = null;
    }
    Inflate.prototype._processChunk = function(chunk, flushFlag, asyncCb) {
      if (typeof asyncCb === "function") {
        return zlib.Inflate._processChunk.call(this, chunk, flushFlag, asyncCb);
      }
      let self2 = this;
      let availInBefore = chunk && chunk.length;
      let availOutBefore = this._chunkSize - this._offset;
      let leftToInflate = this._maxLength;
      let inOff = 0;
      let buffers = [];
      let nread = 0;
      let error;
      this.on("error", function(err) {
        error = err;
      });
      function handleChunk(availInAfter, availOutAfter) {
        if (self2._hadError) {
          return;
        }
        let have = availOutBefore - availOutAfter;
        assert(have >= 0, "have should not go down");
        if (have > 0) {
          let out = self2._buffer.slice(self2._offset, self2._offset + have);
          self2._offset += have;
          if (out.length > leftToInflate) {
            out = out.slice(0, leftToInflate);
          }
          buffers.push(out);
          nread += out.length;
          leftToInflate -= out.length;
          if (leftToInflate === 0) {
            return false;
          }
        }
        if (availOutAfter === 0 || self2._offset >= self2._chunkSize) {
          availOutBefore = self2._chunkSize;
          self2._offset = 0;
          self2._buffer = Buffer.allocUnsafe(self2._chunkSize);
        }
        if (availOutAfter === 0) {
          inOff += availInBefore - availInAfter;
          availInBefore = availInAfter;
          return true;
        }
        return false;
      }
      assert(this._handle, "zlib binding closed");
      let res;
      do {
        res = this._handle.writeSync(
          flushFlag,
          chunk,
          // in
          inOff,
          // in_off
          availInBefore,
          // in_len
          this._buffer,
          // out
          this._offset,
          //out_off
          availOutBefore
        );
        res = res || this._writeState;
      } while (!this._hadError && handleChunk(res[0], res[1]));
      if (this._hadError) {
        throw error;
      }
      if (nread >= kMaxLength) {
        _close(this);
        throw new RangeError(
          "Cannot create final Buffer. It would be larger than 0x" + kMaxLength.toString(16) + " bytes"
        );
      }
      let buf = Buffer.concat(buffers, nread);
      _close(this);
      return buf;
    };
    util.inherits(Inflate, zlib.Inflate);
    function zlibBufferSync(engine, buffer) {
      if (typeof buffer === "string") {
        buffer = Buffer.from(buffer);
      }
      if (!(buffer instanceof Buffer)) {
        throw new TypeError("Not a string or buffer");
      }
      let flushFlag = engine._finishFlushFlag;
      if (flushFlag == null) {
        flushFlag = zlib.Z_FINISH;
      }
      return engine._processChunk(buffer, flushFlag);
    }
    function inflateSync(buffer, opts) {
      return zlibBufferSync(new Inflate(opts), buffer);
    }
    module.exports = exports = inflateSync;
    exports.Inflate = Inflate;
    exports.createInflate = createInflate;
    exports.inflateSync = inflateSync;
  }
});

// node_modules/pngjs/lib/sync-reader.js
var require_sync_reader = __commonJS({
  "node_modules/pngjs/lib/sync-reader.js"(exports, module) {
    "use strict";
    var SyncReader = module.exports = function(buffer) {
      this._buffer = buffer;
      this._reads = [];
    };
    SyncReader.prototype.read = function(length, callback) {
      this._reads.push({
        length: Math.abs(length),
        // if length < 0 then at most this length
        allowLess: length < 0,
        func: callback
      });
    };
    SyncReader.prototype.process = function() {
      while (this._reads.length > 0 && this._buffer.length) {
        let read = this._reads[0];
        if (this._buffer.length && (this._buffer.length >= read.length || read.allowLess)) {
          this._reads.shift();
          let buf = this._buffer;
          this._buffer = buf.slice(read.length);
          read.func.call(this, buf.slice(0, read.length));
        } else {
          break;
        }
      }
      if (this._reads.length > 0) {
        return new Error("There are some read requests waitng on finished stream");
      }
      if (this._buffer.length > 0) {
        return new Error("unrecognised content at end of stream");
      }
    };
  }
});

// node_modules/pngjs/lib/filter-parse-sync.js
var require_filter_parse_sync = __commonJS({
  "node_modules/pngjs/lib/filter-parse-sync.js"(exports) {
    "use strict";
    var SyncReader = require_sync_reader();
    var Filter = require_filter_parse();
    exports.process = function(inBuffer, bitmapInfo) {
      let outBuffers = [];
      let reader = new SyncReader(inBuffer);
      let filter = new Filter(bitmapInfo, {
        read: reader.read.bind(reader),
        write: function(bufferPart) {
          outBuffers.push(bufferPart);
        },
        complete: function() {
        }
      });
      filter.start();
      reader.process();
      return Buffer.concat(outBuffers);
    };
  }
});

// node_modules/pngjs/lib/parser-sync.js
var require_parser_sync = __commonJS({
  "node_modules/pngjs/lib/parser-sync.js"(exports, module) {
    "use strict";
    var hasSyncZlib = true;
    var zlib = __require("zlib");
    var inflateSync = require_sync_inflate();
    if (!zlib.deflateSync) {
      hasSyncZlib = false;
    }
    var SyncReader = require_sync_reader();
    var FilterSync = require_filter_parse_sync();
    var Parser = require_parser();
    var bitmapper = require_bitmapper();
    var formatNormaliser = require_format_normaliser();
    module.exports = function(buffer, options) {
      if (!hasSyncZlib) {
        throw new Error(
          "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
        );
      }
      let err;
      function handleError(_err_) {
        err = _err_;
      }
      let metaData;
      function handleMetaData(_metaData_) {
        metaData = _metaData_;
      }
      function handleTransColor(transColor) {
        metaData.transColor = transColor;
      }
      function handlePalette(palette) {
        metaData.palette = palette;
      }
      function handleSimpleTransparency() {
        metaData.alpha = true;
      }
      let gamma;
      function handleGamma(_gamma_) {
        gamma = _gamma_;
      }
      let inflateDataList = [];
      function handleInflateData(inflatedData2) {
        inflateDataList.push(inflatedData2);
      }
      let reader = new SyncReader(buffer);
      let parser = new Parser(options, {
        read: reader.read.bind(reader),
        error: handleError,
        metadata: handleMetaData,
        gamma: handleGamma,
        palette: handlePalette,
        transColor: handleTransColor,
        inflateData: handleInflateData,
        simpleTransparency: handleSimpleTransparency
      });
      parser.start();
      reader.process();
      if (err) {
        throw err;
      }
      let inflateData = Buffer.concat(inflateDataList);
      inflateDataList.length = 0;
      let inflatedData;
      if (metaData.interlace) {
        inflatedData = zlib.inflateSync(inflateData);
      } else {
        let rowSize = (metaData.width * metaData.bpp * metaData.depth + 7 >> 3) + 1;
        let imageSize = rowSize * metaData.height;
        inflatedData = inflateSync(inflateData, {
          chunkSize: imageSize,
          maxLength: imageSize
        });
      }
      inflateData = null;
      if (!inflatedData || !inflatedData.length) {
        throw new Error("bad png - invalid inflate data response");
      }
      let unfilteredData = FilterSync.process(inflatedData, metaData);
      inflateData = null;
      let bitmapData = bitmapper.dataToBitMap(unfilteredData, metaData);
      unfilteredData = null;
      let normalisedBitmapData = formatNormaliser(bitmapData, metaData);
      metaData.data = normalisedBitmapData;
      metaData.gamma = gamma || 0;
      return metaData;
    };
  }
});

// node_modules/pngjs/lib/packer-sync.js
var require_packer_sync = __commonJS({
  "node_modules/pngjs/lib/packer-sync.js"(exports, module) {
    "use strict";
    var hasSyncZlib = true;
    var zlib = __require("zlib");
    if (!zlib.deflateSync) {
      hasSyncZlib = false;
    }
    var constants = require_constants();
    var Packer = require_packer();
    module.exports = function(metaData, opt) {
      if (!hasSyncZlib) {
        throw new Error(
          "To use the sync capability of this library in old node versions, please pin pngjs to v2.3.0"
        );
      }
      let options = opt || {};
      let packer = new Packer(options);
      let chunks = [];
      chunks.push(Buffer.from(constants.PNG_SIGNATURE));
      chunks.push(packer.packIHDR(metaData.width, metaData.height));
      if (metaData.gamma) {
        chunks.push(packer.packGAMA(metaData.gamma));
      }
      let filteredData = packer.filterData(
        metaData.data,
        metaData.width,
        metaData.height
      );
      let compressedData = zlib.deflateSync(
        filteredData,
        packer.getDeflateOptions()
      );
      filteredData = null;
      if (!compressedData || !compressedData.length) {
        throw new Error("bad png - invalid compressed data response");
      }
      chunks.push(packer.packIDAT(compressedData));
      chunks.push(packer.packIEND());
      return Buffer.concat(chunks);
    };
  }
});

// node_modules/pngjs/lib/png-sync.js
var require_png_sync = __commonJS({
  "node_modules/pngjs/lib/png-sync.js"(exports) {
    "use strict";
    var parse = require_parser_sync();
    var pack = require_packer_sync();
    exports.read = function(buffer, options) {
      return parse(buffer, options || {});
    };
    exports.write = function(png, options) {
      return pack(png, options);
    };
  }
});

// node_modules/pngjs/lib/png.js
var require_png = __commonJS({
  "node_modules/pngjs/lib/png.js"(exports) {
    "use strict";
    var util = __require("util");
    var Stream = __require("stream");
    var Parser = require_parser_async();
    var Packer = require_packer_async();
    var PNGSync = require_png_sync();
    var PNG = exports.PNG = function(options) {
      Stream.call(this);
      options = options || {};
      this.width = options.width | 0;
      this.height = options.height | 0;
      this.data = this.width > 0 && this.height > 0 ? Buffer.alloc(4 * this.width * this.height) : null;
      if (options.fill && this.data) {
        this.data.fill(0);
      }
      this.gamma = 0;
      this.readable = this.writable = true;
      this._parser = new Parser(options);
      this._parser.on("error", this.emit.bind(this, "error"));
      this._parser.on("close", this._handleClose.bind(this));
      this._parser.on("metadata", this._metadata.bind(this));
      this._parser.on("gamma", this._gamma.bind(this));
      this._parser.on(
        "parsed",
        function(data) {
          this.data = data;
          this.emit("parsed", data);
        }.bind(this)
      );
      this._packer = new Packer(options);
      this._packer.on("data", this.emit.bind(this, "data"));
      this._packer.on("end", this.emit.bind(this, "end"));
      this._parser.on("close", this._handleClose.bind(this));
      this._packer.on("error", this.emit.bind(this, "error"));
    };
    util.inherits(PNG, Stream);
    PNG.sync = PNGSync;
    PNG.prototype.pack = function() {
      if (!this.data || !this.data.length) {
        this.emit("error", "No data provided");
        return this;
      }
      process.nextTick(
        function() {
          this._packer.pack(this.data, this.width, this.height, this.gamma);
        }.bind(this)
      );
      return this;
    };
    PNG.prototype.parse = function(data, callback) {
      if (callback) {
        let onParsed, onError;
        onParsed = function(parsedData) {
          this.removeListener("error", onError);
          this.data = parsedData;
          callback(null, this);
        }.bind(this);
        onError = function(err) {
          this.removeListener("parsed", onParsed);
          callback(err, null);
        }.bind(this);
        this.once("parsed", onParsed);
        this.once("error", onError);
      }
      this.end(data);
      return this;
    };
    PNG.prototype.write = function(data) {
      this._parser.write(data);
      return true;
    };
    PNG.prototype.end = function(data) {
      this._parser.end(data);
    };
    PNG.prototype._metadata = function(metadata) {
      this.width = metadata.width;
      this.height = metadata.height;
      this.emit("metadata", metadata);
    };
    PNG.prototype._gamma = function(gamma) {
      this.gamma = gamma;
    };
    PNG.prototype._handleClose = function() {
      if (!this._parser.writable && !this._packer.readable) {
        this.emit("close");
      }
    };
    PNG.bitblt = function(src, dst, srcX, srcY, width, height, deltaX, deltaY) {
      srcX |= 0;
      srcY |= 0;
      width |= 0;
      height |= 0;
      deltaX |= 0;
      deltaY |= 0;
      if (srcX > src.width || srcY > src.height || srcX + width > src.width || srcY + height > src.height) {
        throw new Error("bitblt reading outside image");
      }
      if (deltaX > dst.width || deltaY > dst.height || deltaX + width > dst.width || deltaY + height > dst.height) {
        throw new Error("bitblt writing outside image");
      }
      for (let y = 0; y < height; y++) {
        src.data.copy(
          dst.data,
          (deltaY + y) * dst.width + deltaX << 2,
          (srcY + y) * src.width + srcX << 2,
          (srcY + y) * src.width + srcX + width << 2
        );
      }
    };
    PNG.prototype.bitblt = function(dst, srcX, srcY, width, height, deltaX, deltaY) {
      PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
      return this;
    };
    PNG.adjustGamma = function(src) {
      if (src.gamma) {
        for (let y = 0; y < src.height; y++) {
          for (let x = 0; x < src.width; x++) {
            let idx = src.width * y + x << 2;
            for (let i = 0; i < 3; i++) {
              let sample = src.data[idx + i] / 255;
              sample = Math.pow(sample, 1 / 2.2 / src.gamma);
              src.data[idx + i] = Math.round(sample * 255);
            }
          }
        }
        src.gamma = 0;
      }
    };
    PNG.prototype.adjustGamma = function() {
      PNG.adjustGamma(this);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/png.js
var require_png2 = __commonJS({
  "node_modules/qrcode/lib/renderer/png.js"(exports) {
    var fs = __require("fs");
    var PNG = require_png().PNG;
    var Utils = require_utils2();
    exports.render = function render(qrData, options) {
      const opts = Utils.getOptions(options);
      const pngOpts = opts.rendererOpts;
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      pngOpts.width = size;
      pngOpts.height = size;
      const pngImage = new PNG(pngOpts);
      Utils.qrToImageData(pngImage.data, qrData, opts);
      return pngImage;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      exports.renderToBuffer(qrData, options, function(err, output) {
        if (err) cb(err);
        let url = "data:image/png;base64,";
        url += output.toString("base64");
        cb(null, url);
      });
    };
    exports.renderToBuffer = function renderToBuffer(qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const png = exports.render(qrData, options);
      const buffer = [];
      png.on("error", cb);
      png.on("data", function(data) {
        buffer.push(data);
      });
      png.on("end", function() {
        cb(null, Buffer.concat(buffer));
      });
      png.pack();
    };
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      let called = false;
      const done = (...args) => {
        if (called) return;
        called = true;
        cb.apply(null, args);
      };
      const stream = fs.createWriteStream(path);
      stream.on("error", done);
      stream.on("close", done);
      exports.renderToFileStream(stream, qrData, options);
    };
    exports.renderToFileStream = function renderToFileStream(stream, qrData, options) {
      const png = exports.render(qrData, options);
      png.pack().pipe(stream);
    };
  }
});

// node_modules/qrcode/lib/renderer/utf8.js
var require_utf8 = __commonJS({
  "node_modules/qrcode/lib/renderer/utf8.js"(exports) {
    var Utils = require_utils2();
    var BLOCK_CHAR = {
      WW: " ",
      WB: "\u2584",
      BB: "\u2588",
      BW: "\u2580"
    };
    var INVERTED_BLOCK_CHAR = {
      BB: " ",
      BW: "\u2584",
      WW: "\u2588",
      WB: "\u2580"
    };
    function getBlockChar(top, bottom, blocks) {
      if (top && bottom) return blocks.BB;
      if (top && !bottom) return blocks.BW;
      if (!top && bottom) return blocks.WB;
      return blocks.WW;
    }
    exports.render = function(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      let blocks = BLOCK_CHAR;
      if (opts.color.dark.hex === "#ffffff" || opts.color.light.hex === "#000000") {
        blocks = INVERTED_BLOCK_CHAR;
      }
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      let output = "";
      let hMargin = Array(size + opts.margin * 2 + 1).join(blocks.WW);
      hMargin = Array(opts.margin / 2 + 1).join(hMargin + "\n");
      const vMargin = Array(opts.margin + 1).join(blocks.WW);
      output += hMargin;
      for (let i = 0; i < size; i += 2) {
        output += vMargin;
        for (let j = 0; j < size; j++) {
          const topModule = data[i * size + j];
          const bottomModule = data[(i + 1) * size + j];
          output += getBlockChar(topModule, bottomModule, blocks);
        }
        output += vMargin + "\n";
      }
      output += hMargin.slice(0, -1);
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const fs = __require("fs");
      const utf8 = exports.render(qrData, options);
      fs.writeFile(path, utf8, cb);
    };
  }
});

// node_modules/qrcode/lib/renderer/terminal/terminal.js
var require_terminal = __commonJS({
  "node_modules/qrcode/lib/renderer/terminal/terminal.js"(exports) {
    exports.render = function(qrData, options, cb) {
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const black = "\x1B[40m  \x1B[0m";
      const white = "\x1B[47m  \x1B[0m";
      let output = "";
      const hMargin = Array(size + 3).join(white);
      const vMargin = Array(2).join(white);
      output += hMargin + "\n";
      for (let i = 0; i < size; ++i) {
        output += white;
        for (let j = 0; j < size; j++) {
          output += data[i * size + j] ? black : white;
        }
        output += vMargin + "\n";
      }
      output += hMargin + "\n";
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
  }
});

// node_modules/qrcode/lib/renderer/terminal/terminal-small.js
var require_terminal_small = __commonJS({
  "node_modules/qrcode/lib/renderer/terminal/terminal-small.js"(exports) {
    var backgroundWhite = "\x1B[47m";
    var backgroundBlack = "\x1B[40m";
    var foregroundWhite = "\x1B[37m";
    var foregroundBlack = "\x1B[30m";
    var reset = "\x1B[0m";
    var lineSetupNormal = backgroundWhite + foregroundBlack;
    var lineSetupInverse = backgroundBlack + foregroundWhite;
    var createPalette = function(lineSetup, foregroundWhite2, foregroundBlack2) {
      return {
        // 1 ... white, 2 ... black, 0 ... transparent (default)
        "00": reset + " " + lineSetup,
        "01": reset + foregroundWhite2 + "\u2584" + lineSetup,
        "02": reset + foregroundBlack2 + "\u2584" + lineSetup,
        10: reset + foregroundWhite2 + "\u2580" + lineSetup,
        11: " ",
        12: "\u2584",
        20: reset + foregroundBlack2 + "\u2580" + lineSetup,
        21: "\u2580",
        22: "\u2588"
      };
    };
    var mkCodePixel = function(modules, size, x, y) {
      const sizePlus = size + 1;
      if (x >= sizePlus || y >= sizePlus || y < -1 || x < -1) return "0";
      if (x >= size || y >= size || y < 0 || x < 0) return "1";
      const idx = y * size + x;
      return modules[idx] ? "2" : "1";
    };
    var mkCode = function(modules, size, x, y) {
      return mkCodePixel(modules, size, x, y) + mkCodePixel(modules, size, x, y + 1);
    };
    exports.render = function(qrData, options, cb) {
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const inverse = !!(options && options.inverse);
      const lineSetup = options && options.inverse ? lineSetupInverse : lineSetupNormal;
      const white = inverse ? foregroundBlack : foregroundWhite;
      const black = inverse ? foregroundWhite : foregroundBlack;
      const palette = createPalette(lineSetup, white, black);
      const newLine = reset + "\n" + lineSetup;
      let output = lineSetup;
      for (let y = -1; y < size + 1; y += 2) {
        for (let x = -1; x < size; x++) {
          output += palette[mkCode(data, size, x, y)];
        }
        output += palette[mkCode(data, size, size, y)] + newLine;
      }
      output += reset;
      if (typeof cb === "function") {
        cb(null, output);
      }
      return output;
    };
  }
});

// node_modules/qrcode/lib/renderer/terminal.js
var require_terminal2 = __commonJS({
  "node_modules/qrcode/lib/renderer/terminal.js"(exports) {
    var big = require_terminal();
    var small = require_terminal_small();
    exports.render = function(qrData, options, cb) {
      if (options && options.small) {
        return small.render(qrData, options, cb);
      }
      return big.render(qrData, options, cb);
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// node_modules/qrcode/lib/renderer/svg.js
var require_svg = __commonJS({
  "node_modules/qrcode/lib/renderer/svg.js"(exports) {
    var svgTagRenderer = require_svg_tag();
    exports.render = svgTagRenderer.render;
    exports.renderToFile = function renderToFile(path, qrData, options, cb) {
      if (typeof cb === "undefined") {
        cb = options;
        options = void 0;
      }
      const fs = __require("fs");
      const svgTag = exports.render(qrData, options);
      const xmlStr = '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + svgTag;
      fs.writeFile(path, xmlStr, cb);
    };
  }
});

// node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// node_modules/qrcode/lib/server.js
var require_server = __commonJS({
  "node_modules/qrcode/lib/server.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var PngRenderer = require_png2();
    var Utf8Renderer = require_utf8();
    var TerminalRenderer = require_terminal2();
    var SvgRenderer = require_svg();
    function checkParams(text, opts, cb) {
      if (typeof text === "undefined") {
        throw new Error("String required as first argument");
      }
      if (typeof cb === "undefined") {
        cb = opts;
        opts = {};
      }
      if (typeof cb !== "function") {
        if (!canPromise()) {
          throw new Error("Callback required as last argument");
        } else {
          opts = cb || {};
          cb = null;
        }
      }
      return {
        opts,
        cb
      };
    }
    function getTypeFromFilename(path) {
      return path.slice((path.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    }
    function getRendererFromType(type) {
      switch (type) {
        case "svg":
          return SvgRenderer;
        case "txt":
        case "utf8":
          return Utf8Renderer;
        case "png":
        case "image/png":
        default:
          return PngRenderer;
      }
    }
    function getStringRendererFromType(type) {
      switch (type) {
        case "svg":
          return SvgRenderer;
        case "terminal":
          return TerminalRenderer;
        case "utf8":
        default:
          return Utf8Renderer;
      }
    }
    function render(renderFunc, text, params) {
      if (!params.cb) {
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, params.opts);
            return renderFunc(data, params.opts, function(err, data2) {
              return err ? reject(err) : resolve(data2);
            });
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, params.opts);
        return renderFunc(data, params.opts, params.cb);
      } catch (e) {
        params.cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = require_browser().toCanvas;
    exports.toString = function toString(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const type = params.opts ? params.opts.type : void 0;
      const renderer = getStringRendererFromType(type);
      return render(renderer.render, text, params);
    };
    exports.toDataURL = function toDataURL(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const renderer = getRendererFromType(params.opts.type);
      return render(renderer.renderToDataURL, text, params);
    };
    exports.toBuffer = function toBuffer(text, opts, cb) {
      const params = checkParams(text, opts, cb);
      const renderer = getRendererFromType(params.opts.type);
      return render(renderer.renderToBuffer, text, params);
    };
    exports.toFile = function toFile(path, text, opts, cb) {
      if (typeof path !== "string" || !(typeof text === "string" || typeof text === "object")) {
        throw new Error("Invalid argument");
      }
      if (arguments.length < 3 && !canPromise()) {
        throw new Error("Too few arguments provided");
      }
      const params = checkParams(text, opts, cb);
      const type = params.opts.type || getTypeFromFilename(path);
      const renderer = getRendererFromType(type);
      const renderToFile = renderer.renderToFile.bind(null, path);
      return render(renderToFile, text, params);
    };
    exports.toFileStream = function toFileStream(stream, text, opts) {
      if (arguments.length < 2) {
        throw new Error("Too few arguments provided");
      }
      const params = checkParams(text, opts, stream.emit.bind(stream, "error"));
      const renderer = getRendererFromType("png");
      const renderToFileStream = renderer.renderToFileStream.bind(null, stream);
      render(renderToFileStream, text, params);
    };
  }
});

// node_modules/qrcode/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/qrcode/lib/index.js"(exports, module) {
    module.exports = require_server();
  }
});

// node_modules/dayjs/dayjs.min.js
var require_dayjs_min = __commonJS({
  "node_modules/dayjs/dayjs.min.js"(exports, module) {
    !(function(t, e) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
    })(exports, (function() {
      "use strict";
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = (function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = (function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          })(t2), this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m2.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[b.p(t2)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, (function(t3, r3) {
            return r3 || (function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            })(t3) || i2.replace(":", "");
          }));
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      })(), Y = _.prototype;
      return O.prototype = Y, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach((function(t2) {
        Y[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      })), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    }));
  }
});

// src/server/app.ts
var import_cors = __toESM(require_lib(), 1);
var import_dotenv2 = __toESM(require_main(), 1);
var import_speakeasy2 = __toESM(require_speakeasy(), 1);
var import_qrcode = __toESM(require_lib2(), 1);
import express from "express";
import crypto3 from "crypto";

// src/server/db.ts
var import_dotenv = __toESM(require_main(), 1);
import pg from "pg";
import_dotenv.default.config();
var rawDbUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
var connectionString = rawDbUrl && (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://")) ? rawDbUrl : "postgresql://neondb_owner:npg_4SwEzqo1GRMZ@ep-mute-cake-a1eppdph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 1e4
});
pool.on("error", (err) => {
  console.error("[DB_POOL_ERROR] Unexpected database pool error:", err?.message || err);
});

// src/server/seed.ts
import crypto from "crypto";

// src/data/mockTransactions.ts
var import_dayjs = __toESM(require_dayjs_min(), 1);
var mockFxRates = [
  {
    currency: "USD",
    buyRate: 3540,
    sellRate: 3560,
    middleRate: 3550,
    change24h: 0.28,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "EUR",
    buyRate: 3810,
    sellRate: 3835,
    middleRate: 3822.5,
    change24h: -0.15,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "SGD",
    buyRate: 2675,
    sellRate: 2690,
    middleRate: 2682,
    change24h: 0.42,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "THB",
    buyRate: 101.8,
    sellRate: 103.2,
    middleRate: 102.5,
    change24h: 0.12,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "GBP",
    buyRate: 4480,
    sellRate: 4515,
    middleRate: 4498,
    change24h: -0.35,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "JPY",
    buyRate: 23.4,
    sellRate: 24.1,
    middleRate: 23.75,
    change24h: 0.05,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "CNY",
    buyRate: 490,
    sellRate: 496,
    middleRate: 493,
    change24h: 0.18,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "MYR",
    buyRate: 785,
    sellRate: 795,
    middleRate: 790,
    change24h: -0.08,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var now = (0, import_dayjs.default)();
var mockTransactions = [
  {
    id: "tx-001",
    transactionRef: "IR-2026-SG-994821",
    senderName: "Apex Logistics Global Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "DBS Bank Singapore",
    sendingBankBic: "DBSSSGSG",
    currency: "USD",
    amount: 145e3,
    exchangeRate: 3550,
    convertedAmountMmk: 51475e4,
    feeAmount: 5e4,
    netAmountMmk: 5147e5,
    valueDate: now.subtract(12, "minute").toISOString(),
    status: "Completed",
    purpose: "Commercial Invoicing - Ocean Freight & Container Clearance",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "APX-2026-08819",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Apex Logistics Global Pte Ltd",
        address: "12 Marina Boulevard, Marina Bay Financial Centre Tower 3",
        city: "Singapore",
        country: "Singapore",
        accountNumber: "003-902910-1"
      },
      orderingInstitution: {
        bic: "DBSSSGSGXXX",
        name: "DBS Bank Ltd Singapore",
        branch: "Marina Bay Financial Centre Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited (KBZ Bank)",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#EXP-2026-9901 / Freight forwarding settlement Q3",
      detailsOfCharges: "OUR",
      uetr: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by DBS Bank SG via SWIFT GPI",
          timestamp: now.subtract(45, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Passed international sanctions & AML compliance filter",
          timestamp: now.subtract(30, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "Auto-FX matched at rate 3,550.00 MMK/USD",
          timestamp: now.subtract(18, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared to Account 0091-2384-992019",
          timestamp: now.subtract(12, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-002",
    transactionRef: "IR-2026-US-883190",
    senderName: "Vanguard Tech Solutions Inc.",
    senderCountry: "United States",
    sendingBank: "Citibank N.A. New York",
    sendingBankBic: "CITIUS33",
    currency: "USD",
    amount: 82500,
    exchangeRate: 3550,
    convertedAmountMmk: 292875e3,
    feeAmount: 35e3,
    netAmountMmk: 29284e4,
    valueDate: now.subtract(42, "minute").toISOString(),
    status: "Completed",
    purpose: "Software Engineering Services & Offshore Delivery Milestone 4",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "VANGUARD-US-4491",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Vanguard Tech Solutions Inc.",
        address: "388 Greenwich Street, New York, NY 10013",
        city: "New York",
        country: "United States",
        accountNumber: "882019481"
      },
      orderingInstitution: {
        bic: "CITIUS33XXX",
        name: "Citibank N.A.",
        branch: "Wall Street Operations",
        country: "United States"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "PO-88231 IT Consulting August 2026 Retainer",
      detailsOfCharges: "SHA",
      uetr: "3b241101-e2bb-4255-8caf-4136c566a964",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by Citibank NA via SWIFT GPI",
          timestamp: now.subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Cleared Fedwire & Correspondent Nostro",
          timestamp: now.subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "FX Conversion confirmed",
          timestamp: now.subtract(50, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Settled successfully in MMK",
          timestamp: now.subtract(42, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-003",
    transactionRef: "IR-2026-TH-773012",
    senderName: "Siam Agro Industries Co., Ltd.",
    senderCountry: "Thailand",
    sendingBank: "Bangkok Bank Public Company",
    sendingBankBic: "BKKBTHTH",
    currency: "THB",
    amount: 185e4,
    exchangeRate: 102.5,
    convertedAmountMmk: 189625e3,
    feeAmount: 25e3,
    netAmountMmk: 1896e5,
    valueDate: now.subtract(1, "hour").subtract(15, "minute").toISOString(),
    status: "Pending",
    purpose: "Agricultural Commodities & Fertilizer Import Consignment",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SIAM-BKK-0929",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Siam Agro Industries Co., Ltd.",
        address: "333 Silom Road, Bangrak, Bangkok 10500",
        city: "Bangkok",
        country: "Thailand",
        accountNumber: "101-992-8831"
      },
      orderingInstitution: {
        bic: "BKKBTHTHXXX",
        name: "Bangkok Bank PCL",
        branch: "Head Office Silom",
        country: "Thailand"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "LC Ref # LC-KBZ-TH-202608 / Bill of Lading BL#88219",
      detailsOfCharges: "OUR",
      uetr: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      settlementChannel: "SWIFT MT103",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by Bangkok Bank PCL",
          timestamp: now.subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Compliance Document Review",
          description: "Verifying trade supporting documents and invoice proof",
          timestamp: now.subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "KBZ Treasury FX Matching",
          description: "Pending document release for treasury rate lock",
          timestamp: "Pending",
          completed: false
        },
        {
          title: "Settlement",
          description: "Will credit into 0091-2384-992019 upon officer sign-off",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-004",
    transactionRef: "IR-2026-EU-662910",
    senderName: "EuroLux Pharma Distribution SA",
    senderCountry: "Luxembourg",
    sendingBank: "BNP Paribas Luxembourg",
    sendingBankBic: "BNPALULL",
    currency: "EUR",
    amount: 46800,
    exchangeRate: 3822.5,
    convertedAmountMmk: 178893e3,
    feeAmount: 4e4,
    netAmountMmk: 178853e3,
    valueDate: now.subtract(2, "hour").subtract(30, "minute").toISOString(),
    status: "Completed",
    purpose: "Medical Supplies & WHO Certified Laboratory Equipment",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "EURLUX-INV-9921",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "EuroLux Pharma Distribution SA",
        address: "16 Boulevard Royal, L-2449 Luxembourg",
        city: "Luxembourg",
        country: "Luxembourg"
      },
      orderingInstitution: {
        bic: "BNPALULLXXX",
        name: "BNP Paribas",
        branch: "Luxembourg Corporate Center",
        country: "Luxembourg"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "EU-PHARMA-BATCH-20260812 / Vaccine cold chain components",
      detailsOfCharges: "OUR",
      uetr: "4f964023-e186-4e50-9854-469b82142e2a",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated in EUR via Target2 / SWIFT",
          timestamp: now.subtract(4, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Approved by European Central Bank clearing gateway",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "EUR to MMK converted at 3,822.50 MMK",
          timestamp: now.subtract(2, "hour").subtract(40, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Direct credit completed",
          timestamp: now.subtract(2, "hour").subtract(30, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-005",
    transactionRef: "IR-2026-SG-551829",
    senderName: "SingaPay Financial Services Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "OCBC Bank Singapore",
    sendingBankBic: "OCBCSGSG",
    currency: "SGD",
    amount: 11e4,
    exchangeRate: 2682,
    convertedAmountMmk: 29502e4,
    feeAmount: 3e4,
    netAmountMmk: 29499e4,
    valueDate: now.subtract(3, "hour").toISOString(),
    status: "Completed",
    purpose: "Cross-Border Merchant Payouts & Settlement Batch 401",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SG-PAY-2026-778",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "SingaPay Financial Services Pte Ltd",
        address: "65 Chulia Street, OCBC Centre",
        city: "Singapore",
        country: "Singapore"
      },
      orderingInstitution: {
        bic: "OCBCSGSGXXX",
        name: "Oversea-Chinese Banking Corporation Ltd",
        branch: "OCBC Centre Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "E-commerce merchant gateway daily settlement",
      detailsOfCharges: "OUR",
      uetr: "88a31902-39c4-4b47-814d-54128f7a6379",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment submitted via FAST / SWIFT GPI",
          timestamp: now.subtract(4, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Nostro Settlement",
          description: "KBZ SG Nostro Account credited",
          timestamp: now.subtract(3, "hour").subtract(20, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds available in account",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-006",
    transactionRef: "IR-2026-UK-441209",
    senderName: "Caledonian Maritime Energy Ltd",
    senderCountry: "United Kingdom",
    sendingBank: "Standard Chartered Bank London",
    sendingBankBic: "SCBLGB2L",
    currency: "GBP",
    amount: 35e3,
    exchangeRate: 4498,
    convertedAmountMmk: 15743e4,
    feeAmount: 45e3,
    netAmountMmk: 157385e3,
    valueDate: now.subtract(5, "hour").toISOString(),
    status: "Completed",
    purpose: "Offshore Drilling Engineering Inspection Retainer",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SCB-LON-UK-9182",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Caledonian Maritime Energy Ltd",
        address: "1 Basinghall Avenue, London EC2V 5DD",
        city: "London",
        country: "United Kingdom"
      },
      orderingInstitution: {
        bic: "SCBLGB2LXXX",
        name: "Standard Chartered Bank",
        branch: "London Principal Office",
        country: "United Kingdom"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#UK-2026-4401 Technical advisory offshore project",
      detailsOfCharges: "SHA",
      uetr: "1a938cde-8419-485a-ba38-124801e91c77",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Initiated via Standard Chartered London",
          timestamp: now.subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Completed and confirmed",
          timestamp: now.subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-007",
    transactionRef: "IR-2026-JP-330918",
    senderName: "Tokyo Electronic Components Corp",
    senderCountry: "Japan",
    sendingBank: "Sumitomo Mitsui Banking Corp (SMBC)",
    sendingBankBic: "SMBCJPJT",
    currency: "JPY",
    amount: 145e5,
    exchangeRate: 23.75,
    convertedAmountMmk: 344375e3,
    feeAmount: 6e4,
    netAmountMmk: 344315e3,
    valueDate: now.subtract(8, "hour").toISOString(),
    status: "Completed",
    purpose: "Industrial Micro-controller Units & Semiconductor Parts",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SMBC-TYO-99120",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Tokyo Electronic Components Corp",
        address: "1-1-2 Marunouchi, Chiyoda-ku, Tokyo 100-0005",
        city: "Tokyo",
        country: "Japan"
      },
      orderingInstitution: {
        bic: "SMBCJPJTXXX",
        name: "Sumitomo Mitsui Banking Corporation",
        branch: "Tokyo Head Office",
        country: "Japan"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "PO#JP-ELEC-44093 / Customs clearance ready",
      detailsOfCharges: "OUR",
      uetr: "5f918029-47bb-4001-a128-984410e2fa41",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched from Tokyo",
          timestamp: now.subtract(9, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Processed in MMK to merchant account",
          timestamp: now.subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-008",
    transactionRef: "IR-2026-MY-229103",
    senderName: "Kuala Lumpur Palm Agri Tech Sdn Bhd",
    senderCountry: "Malaysia",
    sendingBank: "Maybank (Malayan Banking Berhad)",
    sendingBankBic: "MBBEMYKL",
    currency: "MYR",
    amount: 16e4,
    exchangeRate: 790,
    convertedAmountMmk: 1264e5,
    feeAmount: 2e4,
    netAmountMmk: 12638e4,
    valueDate: now.subtract(14, "hour").toISOString(),
    status: "Failed",
    statusMessage: "Ordering institution account number mismatch with declaration",
    purpose: "Refined Edible Oils Export Contract #KL-082",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MBB-KL-88210",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Kuala Lumpur Palm Agri Tech Sdn Bhd",
        address: "Menara Maybank, 100 Jalan Tun Perak, 50050 Kuala Lumpur",
        city: "Kuala Lumpur",
        country: "Malaysia"
      },
      orderingInstitution: {
        bic: "MBBEMYKLXXX",
        name: "Malayan Banking Berhad",
        branch: "Kuala Lumpur Main Branch",
        country: "Malaysia"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "Palm olein grade A consignment invoice 8820",
      detailsOfCharges: "BEN",
      uetr: "9e881023-4122-4411-bd21-0029418eab88",
      settlementChannel: "SWIFT MT103",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Received via Maybank Kuala Lumpur",
          timestamp: now.subtract(16, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Compliance Validation",
          description: "Beneficiary TIN / Import Permit number discrepancy rejected by CBM clearing rules",
          timestamp: now.subtract(14, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          failed: true
        },
        {
          title: "Return to Sender (SWIFT MT199)",
          description: "Dispatched return advice to ordering institution",
          timestamp: now.subtract(13, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-009",
    transactionRef: "IR-2026-US-118274",
    senderName: "Horizon Pacific Trading Corp",
    senderCountry: "United States",
    sendingBank: "JPMorgan Chase Bank, N.A.",
    sendingBankBic: "CHASUS33",
    currency: "USD",
    amount: 22e4,
    exchangeRate: 3550,
    convertedAmountMmk: 781e6,
    feeAmount: 5e4,
    netAmountMmk: 78095e4,
    valueDate: now.subtract(1, "day").toISOString(),
    status: "Completed",
    purpose: "Heavy Industrial Solar Panels & Inverters Procurement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "JPMC-NY-992100",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Horizon Pacific Trading Corp",
        address: "270 Park Ave, New York, NY 10017",
        city: "New York",
        country: "United States"
      },
      orderingInstitution: {
        bic: "CHASUS33XXX",
        name: "JPMorgan Chase Bank, N.A.",
        branch: "New York Global Clearing",
        country: "United States"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "SOLAR-GRID-IMPORT-MM-2026-08 / Clean energy grant project",
      detailsOfCharges: "OUR",
      uetr: "22b91841-5582-411a-8800-4718293e5510",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Dispatched via JPMorgan Chase Fedwire",
          timestamp: now.subtract(1, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared and reflected in MMK account",
          timestamp: now.subtract(1, "day").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-010",
    transactionRef: "IR-2026-CN-009182",
    senderName: "Shenzhen Microtek Semiconductor Co., Ltd.",
    senderCountry: "China",
    sendingBank: "Bank of China (BOC)",
    sendingBankBic: "BKCHCNBJ",
    currency: "CNY",
    amount: 55e4,
    exchangeRate: 493,
    convertedAmountMmk: 27115e4,
    feeAmount: 3e4,
    netAmountMmk: 27112e4,
    valueDate: now.subtract(1, "day").subtract(5, "hour").toISOString(),
    status: "Completed",
    purpose: "Telecommunications Fibre Optic Cables & Transceivers",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "BOC-SZ-2026-4418",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Shenzhen Microtek Semiconductor Co., Ltd.",
        address: "Fuxing Road, Futian District, Shenzhen, Guangdong",
        city: "Shenzhen",
        country: "China"
      },
      orderingInstitution: {
        bic: "BKCHCNBJXXX",
        name: "Bank of China Limited",
        branch: "Shenzhen Special Economic Zone Branch",
        country: "China"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "CIPS direct clearing / Optical hardware settlement",
      detailsOfCharges: "OUR",
      uetr: "33e89124-7712-421b-aa31-5918239e9921",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "CIPS Cross-Border direct message",
          timestamp: now.subtract(1, "day").subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Settled to account",
          timestamp: now.subtract(1, "day").subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-011",
    transactionRef: "IR-2026-SG-990142",
    senderName: "Temasek Sea Logistics Hub Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "United Overseas Bank (UOB)",
    sendingBankBic: "UOVBSGSG",
    currency: "USD",
    amount: 67400,
    exchangeRate: 3550,
    convertedAmountMmk: 23927e4,
    feeAmount: 35e3,
    netAmountMmk: 239235e3,
    valueDate: now.subtract(2, "day").toISOString(),
    status: "Completed",
    purpose: "Port Terminal Handling Charges & Vessel Bunkering Settlement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "UOB-SG-99218",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Temasek Sea Logistics Hub Pte Ltd",
        address: "80 Raffles Place, UOB Plaza 1",
        city: "Singapore",
        country: "Singapore"
      },
      orderingInstitution: {
        bic: "UOVBSGSGXXX",
        name: "United Overseas Bank Limited",
        branch: "Raffles Place Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#TMSK-2026-0811 Marine fuel bunker invoice",
      detailsOfCharges: "OUR",
      uetr: "44a89100-1123-4e41-b829-192837465019",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Processed via UOB SWIFT GPI",
          timestamp: now.subtract(2, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared to account",
          timestamp: now.subtract(2, "day").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-012",
    transactionRef: "IR-2026-DE-882710",
    senderName: "Bavaria Industrial Machinery GmbH",
    senderCountry: "Germany",
    sendingBank: "Deutsche Bank Frankfurt",
    sendingBankBic: "DEUTDEDD",
    currency: "EUR",
    amount: 195e3,
    exchangeRate: 3822.5,
    convertedAmountMmk: 745387500,
    feeAmount: 75e3,
    netAmountMmk: 745312500,
    valueDate: now.subtract(2, "day").subtract(6, "hour").toISOString(),
    status: "Pending",
    purpose: "Turnkey Hydro-Turbine Generator Spare Parts",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "DB-FRA-2026-90",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Bavaria Industrial Machinery GmbH",
        address: "Taunusanlage 12, 60325 Frankfurt am Main",
        city: "Frankfurt",
        country: "Germany"
      },
      orderingInstitution: {
        bic: "DEUTDEDDXXX",
        name: "Deutsche Bank AG",
        branch: "Frankfurt Head Office",
        country: "Germany"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Main Settlement Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "HYDRO-DE-INV-009 / LC#LC-2026-GER-441",
      detailsOfCharges: "OUR",
      uetr: "66d81920-3321-4991-8842-591820491028",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched via Deutsche Bank Frankfurt",
          timestamp: now.subtract(2, "day").subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Under Foreign Exchange Settlement Allocation Review",
          description: "High-value remittance awaiting routine compliance authorization",
          timestamp: now.subtract(2, "day").subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "Final Settlement",
          description: "Expected to credit on next clearance batch",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-011",
    transactionRef: "IR-2026-JP-449102",
    senderName: "Tokyo Precision Robotics Inc.",
    senderCountry: "Japan",
    sendingBank: "Mitsubishi UFJ Financial Group (MUFG)",
    sendingBankBic: "BOTKJPJTXXX",
    currency: "JPY",
    amount: 185e5,
    exchangeRate: 23.75,
    convertedAmountMmk: 439375e3,
    feeAmount: 35e3,
    netAmountMmk: 43934e4,
    valueDate: now.subtract(3, "hour").subtract(15, "minute").toISOString(),
    status: "Completed",
    purpose: "Industrial Automation & CNC Spare Parts Supply Contract",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MUFG-TYO-991240",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Tokyo Precision Robotics Inc.",
        address: "2-7-1 Marunouchi, Chiyoda-ku, Tokyo 100-8388",
        city: "Tokyo",
        country: "Japan",
        accountNumber: "JP-9918-0029-41"
      },
      orderingInstitution: {
        bic: "BOTKJPJTXXX",
        name: "MUFG Bank Ltd.",
        branch: "Tokyo Head Office",
        country: "Japan"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Apex Myanmar Industrial Supply Ltd.",
        address: "Pyay Road, Hlaing Township, Yangon"
      },
      remittanceInfo: "PO-2026-JPN-8812 / CNC-CONT-991",
      detailsOfCharges: "SHA",
      uetr: "aa491028-1120-4991-88f2-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Payment Instructed",
          description: "MUFG Bank Tokyo originated wire",
          timestamp: now.subtract(3, "hour").subtract(15, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "FX Conversion Quoted",
          description: "Locked at 23.75 MMK per JPY",
          timestamp: now.subtract(3, "hour").subtract(5, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to MMK Account",
          description: "Beneficiary account 0091-2384-992019 credited in full",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-012",
    transactionRef: "IR-2026-AE-773819",
    senderName: "Gulf Horizon Petrochemical FZE",
    senderCountry: "United Arab Emirates",
    sendingBank: "First Abu Dhabi Bank (FAB)",
    sendingBankBic: "FABAAEADXXX",
    currency: "USD",
    amount: 32e4,
    exchangeRate: 3550,
    convertedAmountMmk: 1136e6,
    feeAmount: 6e4,
    netAmountMmk: 113594e4,
    valueDate: now.subtract(5, "hour").subtract(40, "minute").toISOString(),
    status: "Completed",
    purpose: "Import of Bitumen & Construction Raw Materials (Containerized)",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "FAB-DXB-2026-3391",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Gulf Horizon Petrochemical FZE",
        address: "Jebel Ali Free Zone, Building 4B, Dubai",
        city: "Dubai",
        country: "United Arab Emirates",
        accountNumber: "AE-3918-4491-002"
      },
      orderingInstitution: {
        bic: "FABAAEADXXX",
        name: "First Abu Dhabi Bank PJSC",
        branch: "Dubai Main Financial Centre",
        country: "United Arab Emirates"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Corporate Center"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Infrastructure & Logistics Co., Ltd.",
        address: "No. 88 Merchant Street, Yangon"
      },
      remittanceInfo: "INV#GULF-MM-9941 / BL#DXB-YGN-2026",
      detailsOfCharges: "OUR",
      uetr: "ff881920-5541-4771-a892-339182049182",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Wire Debited in UAE",
          description: "FAB Dubai processed MT103",
          timestamp: now.subtract(5, "hour").subtract(40, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Remittance Cleared",
          description: "MMK 1,135,940,000 net settlement verified",
          timestamp: now.subtract(5, "hour").subtract(20, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-013",
    transactionRef: "IR-2026-MY-119284",
    senderName: "Selangor Agro Commodity Sdn Bhd",
    senderCountry: "Malaysia",
    sendingBank: "Maybank (Malayan Banking Berhad)",
    sendingBankBic: "MBBEMYKLXXX",
    currency: "MYR",
    amount: 28e4,
    exchangeRate: 790,
    convertedAmountMmk: 2212e5,
    feeAmount: 25e3,
    netAmountMmk: 221175e3,
    valueDate: now.subtract(8, "hour").toISOString(),
    status: "Completed",
    purpose: "Refined Palm Oil & Agri Derivative Bulk Shipment Settlement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MYB-KL-882910",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Selangor Agro Commodity Sdn Bhd",
        address: "Menara Maybank, 100 Jalan Tun Perak, Kuala Lumpur",
        city: "Kuala Lumpur",
        country: "Malaysia",
        accountNumber: "MY-5519-2049-11"
      },
      orderingInstitution: {
        bic: "MBBEMYKLXXX",
        name: "Malayan Banking Berhad",
        branch: "Kuala Lumpur Main Branch",
        country: "Malaysia"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Golden Myanmar Agro Trade Co., Ltd.",
        address: "Bayintnaung Wholesale Market, Mayangone, Yangon"
      },
      remittanceInfo: "AGRO-MY-INV-2026-778",
      detailsOfCharges: "BEN",
      uetr: "cc281900-4491-4991-b992-118471029482",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Initiated",
          description: "Payment released from Maybank Kuala Lumpur",
          timestamp: now.subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Conversion Settled",
          description: "280,000 MYR converted to 221,175,000 MMK",
          timestamp: now.subtract(7, "hour").subtract(45, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-014",
    transactionRef: "IR-2026-KR-993812",
    senderName: "Seoul Semiconductor Components Corp",
    senderCountry: "South Korea",
    sendingBank: "KB Kookmin Bank",
    sendingBankBic: "CZNBKRSEXXX",
    currency: "USD",
    amount: 195e3,
    exchangeRate: 3550,
    convertedAmountMmk: 69225e4,
    feeAmount: 45e3,
    netAmountMmk: 692205e3,
    valueDate: now.subtract(14, "hour").toISOString(),
    status: "Pending",
    purpose: "Procurement of Microcontroller Units & LED Assemblies",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "KB-SEL-99120",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Seoul Semiconductor Components Corp",
        address: "Gangnam-daero, Seocho-gu, Seoul 06621",
        city: "Seoul",
        country: "South Korea",
        accountNumber: "KR-9918-2049-11"
      },
      orderingInstitution: {
        bic: "CZNBKRSEXXX",
        name: "KB Kookmin Bank",
        branch: "Seoul Corporate Branch",
        country: "South Korea"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Central Clearing Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Yangon High-Tech Components Ltd.",
        address: "Thilawa Special Economic Zone (SEZ), Yangon"
      },
      remittanceInfo: "INVOICE#KOR-SEZ-8839",
      detailsOfCharges: "OUR",
      uetr: "88a91028-3319-4881-c772-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched via KB Kookmin Bank Seoul",
          timestamp: now.subtract(14, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Inbound Clearance & FX Locking",
          description: "Transaction undergoing standard settlement matching",
          timestamp: now.subtract(13, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "Credited to MMK Account",
          description: "Beneficiary MMK payout pending final release",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-015",
    transactionRef: "IR-2026-GB-884910",
    senderName: "Thames Maritime & Insurance Services Ltd",
    senderCountry: "United Kingdom",
    sendingBank: "Barclays Bank UK PLC",
    sendingBankBic: "BARCGB22XXX",
    currency: "GBP",
    amount: 65e3,
    exchangeRate: 4498,
    convertedAmountMmk: 29237e4,
    feeAmount: 3e4,
    netAmountMmk: 29234e4,
    valueDate: now.subtract(1, "day").subtract(2, "hour").toISOString(),
    status: "Completed",
    purpose: "Marine Cargo Hull Insurance Claim Payout - Vessel MV Ayeyarwady Star",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "BARC-LON-2026-449",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Thames Maritime & Insurance Services Ltd",
        address: "1 Churchill Place, Canary Wharf, London E14 5HP",
        city: "London",
        country: "United Kingdom",
        accountNumber: "GB-29-BARC-2004-991"
      },
      orderingInstitution: {
        bic: "BARCGB22XXX",
        name: "Barclays Bank PLC",
        branch: "London Head Office",
        country: "United Kingdom"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Ayeyarwady Marine Shipping Co., Ltd.",
        address: "Pansodan Street, Kyauktada, Yangon"
      },
      remittanceInfo: "CLAIM#MAR-2026-004491-INS",
      detailsOfCharges: "OUR",
      uetr: "44e81920-7719-4881-a992-118471029482",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Payment Executed in London",
          description: "Barclays London initiated international wire",
          timestamp: now.subtract(1, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "MMK Funds Deposited",
          description: "292,340,000 MMK settled into beneficiary account",
          timestamp: now.subtract(1, "day").subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-016",
    transactionRef: "IR-2026-TH-663819",
    senderName: "Siam Consumer Goods & Retail PCL",
    senderCountry: "Thailand",
    sendingBank: "Kasikornbank (KBank)",
    sendingBankBic: "KASITHBKXXX",
    currency: "THB",
    amount: 15e5,
    exchangeRate: 102.5,
    convertedAmountMmk: 15375e4,
    feeAmount: 2e4,
    netAmountMmk: 15373e4,
    valueDate: now.subtract(1, "day").subtract(6, "hour").toISOString(),
    status: "Completed",
    purpose: "FMCG Packaged Goods Export Invoice Clearing - Mae Sot / Myawaddy Gateway",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "KBANK-BKK-99182",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Siam Consumer Goods & Retail PCL",
        address: "400/22 Phahon Yothin Rd, Samsen Nai, Phaya Thai, Bangkok",
        city: "Bangkok",
        country: "Thailand",
        accountNumber: "TH-004-9918-22"
      },
      orderingInstitution: {
        bic: "KASITHBKXXX",
        name: "Kasikornbank Public Company Limited",
        branch: "Bangkok Head Office",
        country: "Thailand"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Royal FMCG Distributors Ltd.",
        address: "Bayintnaung Road, Yangon"
      },
      remittanceInfo: "INV#SIAM-FMCG-2026-992",
      detailsOfCharges: "SHA",
      uetr: "11b91028-8819-4771-c882-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Dispatched via KBank",
          description: "1,500,000 THB wire instruction verified",
          timestamp: now.subtract(1, "day").subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to MMK Account",
          description: "153,730,000 MMK settled via cross-border payment link",
          timestamp: now.subtract(1, "day").subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  }
];

// src/server/seed.ts
var ENCRYPTION_SALT = "KBZ_IR_PORTAL_SECURE_SALT_2026";
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + ENCRYPTION_SALT).digest("hex");
}
async function ensureDatabaseSchema(existingClient) {
  const client = existingClient || await pool.connect();
  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TwoFactorMethod" AS ENUM ('EMAIL', 'GOOGLE_AUTH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "companyName" TEXT,
        "phone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE ("email");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "isEnabled" BOOLEAN NOT NULL DEFAULT false,
        "method" "TwoFactorMethod" NOT NULL DEFAULT 'EMAIL',
        "secret" TEXT,
        "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "emailOtp" TEXT,
        "emailOtpExpiry" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userId_unique" UNIQUE ("userId");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "InboundTransaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "transactionRef" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "senderCountry" TEXT NOT NULL,
        "sendingBank" TEXT NOT NULL,
        "sendingBankBic" TEXT NOT NULL,
        "currency" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "exchangeRate" DOUBLE PRECISION NOT NULL,
        "convertedAmountMmk" DOUBLE PRECISION NOT NULL,
        "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "netAmountMmk" DOUBLE PRECISION NOT NULL,
        "valueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'Completed',
        "statusMessage" TEXT,
        "purpose" TEXT NOT NULL,
        "beneficiaryAccount" TEXT NOT NULL,
        "swiftMetadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "FxRate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "currency" TEXT NOT NULL,
        "buyRate" DOUBLE PRECISION NOT NULL,
        "sellRate" DOUBLE PRECISION NOT NULL,
        "middleRate" DOUBLE PRECISION NOT NULL,
        "change24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "FxRate" ADD CONSTRAINT "FxRate_currency_unique" UNIQUE ("currency");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorAuth_userId_idx" ON "TwoFactorAuth"("userId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "InboundTransaction_txRef_idx" ON "InboundTransaction"("transactionRef");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "FxRate_curr_idx" ON "FxRate"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_status_idx" ON "InboundTransaction"("status");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_currency_idx" ON "InboundTransaction"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_valueDate_idx" ON "InboundTransaction"("valueDate");`);
  } catch (schemaErr) {
    console.warn("[SCHEMA_ENSURE_WARN]", schemaErr?.message || schemaErr);
  } finally {
    if (!existingClient) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
}
async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("\u26A1 Initializing and migrating PostgreSQL database tables...");
    await ensureDatabaseSchema(client);
    const encryptedPassword = hashPassword("password");
    const defaultUsers = [
      {
        id: "usr_sanyuaung_01",
        name: "SanYuAung",
        email: "sanyuaung.ygn.mm@gmail.com",
        companyName: "Myanmar Horizon Trading Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      },
      {
        id: "usr_sya_kbz_02",
        name: "SYA_KBZ",
        email: "sanyu.aung@kbzbank.com",
        companyName: "KBZ Bank Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      },
      {
        id: "usr_sya_kbz_03",
        name: "SYA_KBZ",
        email: "sanyu.aung.kbzbank.com",
        companyName: "KBZ Bank Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      }
    ];
    for (const u of defaultUsers) {
      const userRes = await client.query(
        `
        INSERT INTO "User" ("id", "name", "email", "password", "companyName", "phone", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT ("email")
        DO UPDATE SET "password" = $4, "name" = $2, "companyName" = $5, "phone" = $6, "updatedAt" = NOW()
        RETURNING "id";
      `,
        [u.id, u.name, u.email, u.password, u.companyName, u.phone]
      );
      const actualUserId = userRes.rows[0].id;
      await client.query(
        `
        INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "updatedAt")
        VALUES ($1, $2, false, 'EMAIL', NOW())
        ON CONFLICT ("userId") DO NOTHING;
      `,
        [`tfa_${actualUserId}`, actualUserId]
      );
    }
    for (const fx of mockFxRates) {
      await client.query(
        `
        INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("currency")
        DO UPDATE SET
          "buyRate" = $3,
          "sellRate" = $4,
          "middleRate" = $5,
          "change24h" = $6,
          "updatedAt" = $7;
      `,
        [
          `fx_${fx.currency.toLowerCase()}`,
          fx.currency,
          fx.buyRate,
          fx.sellRate,
          fx.middleRate,
          fx.change24h,
          new Date(fx.updatedAt)
        ]
      );
    }
    for (const tx of mockTransactions) {
      await client.query(
        `
        INSERT INTO "InboundTransaction" (
          "id",
          "transactionRef",
          "senderName",
          "senderCountry",
          "sendingBank",
          "sendingBankBic",
          "currency",
          "amount",
          "exchangeRate",
          "convertedAmountMmk",
          "feeAmount",
          "netAmountMmk",
          "valueDate",
          "status",
          "statusMessage",
          "purpose",
          "beneficiaryAccount",
          "swiftMetadata",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        ON CONFLICT ("id")
        DO UPDATE SET
          "transactionRef" = $2,
          "senderName" = $3,
          "senderCountry" = $4,
          "sendingBank" = $5,
          "sendingBankBic" = $6,
          "currency" = $7,
          "amount" = $8,
          "exchangeRate" = $9,
          "convertedAmountMmk" = $10,
          "feeAmount" = $11,
          "netAmountMmk" = $12,
          "valueDate" = $13,
          "status" = $14,
          "statusMessage" = $15,
          "purpose" = $16,
          "beneficiaryAccount" = $17,
          "swiftMetadata" = $18,
          "updatedAt" = NOW();
      `,
        [
          tx.id,
          tx.transactionRef,
          tx.senderName,
          tx.senderCountry,
          tx.sendingBank,
          tx.sendingBankBic,
          tx.currency,
          tx.amount,
          tx.exchangeRate,
          tx.convertedAmountMmk,
          tx.feeAmount || 0,
          tx.netAmountMmk,
          new Date(tx.valueDate),
          tx.status,
          tx.statusMessage || null,
          tx.purpose,
          tx.beneficiaryAccount,
          JSON.stringify(tx.swiftMetadata || {})
        ]
      );
    }
    console.log(`\u2705 Database migration complete: Seeded ${mockTransactions.length} transactions, ${mockFxRates.length} FX rates, and default users.`);
  } catch (error) {
    console.error("Database migration/seed error:", error);
  } finally {
    client.release();
  }
}

// src/lib/prisma.ts
var isSeedingPromise = null;
var tablesInitialized = false;
async function ensureTablesReady() {
  if (tablesInitialized) return;
  if (!isSeedingPromise) {
    isSeedingPromise = ensureDatabaseSchema().then(() => {
      tablesInitialized = true;
    }).catch((err) => {
      console.error("[PRISMA_INIT_WARN] Warning during auto table initialization:", err?.message || err);
    }).finally(() => {
      isSeedingPromise = null;
    });
  }
  await isSeedingPromise;
}
var FALLBACK_USERS = [
  {
    id: "usr_sanyuaung_01",
    name: "San Yu Aung",
    email: "sanyuaung.ygn.mm@gmail.com",
    companyName: "Myanmar Horizon Trading Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  },
  {
    id: "usr_sya_kbz_02",
    name: "San Yu Aung",
    email: "sanyu.aung@kbzbank.com",
    companyName: "KBZ Bank Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  },
  {
    id: "usr_sya_kbz_03",
    name: "San Yu Aung",
    email: "sanyu.aung.kbzbank.com",
    companyName: "KBZ Bank Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  }
];
var prisma = {
  user: {
    async findUnique({ where, include }) {
      try {
        const client = await pool.connect();
        try {
          let query = `SELECT * FROM "User" WHERE `;
          const params = [];
          if (where.email) {
            query += `LOWER(email) = LOWER($1)`;
            params.push(where.email.trim());
          } else if (where.id) {
            query += `id = $1`;
            params.push(where.id);
          } else {
            return null;
          }
          const userRes = await client.query(query, params);
          const user2 = userRes.rows[0];
          if (!user2) {
            const fallback = FALLBACK_USERS.find(
              (u) => where.email && u.email.toLowerCase() === where.email.trim().toLowerCase() || where.id && u.id === where.id
            );
            return fallback || null;
          }
          if (include?.twoFactorAuth) {
            try {
              const tfaRes = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [user2.id]);
              user2.twoFactorAuth = tfaRes.rows[0] || null;
            } catch (tfaErr) {
              user2.twoFactorAuth = { isEnabled: false, method: "EMAIL" };
            }
          }
          return user2;
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn("findUnique caught error, attempting ensureTablesReady:", dbErr?.message);
        if (dbErr?.code === "42P01" || dbErr?.message?.includes("does not exist")) {
          await ensureTablesReady();
          try {
            const client = await pool.connect();
            try {
              let query = `SELECT * FROM "User" WHERE `;
              const params = [];
              if (where.email) {
                query += `LOWER(email) = LOWER($1)`;
                params.push(where.email.trim());
              } else if (where.id) {
                query += `id = $1`;
                params.push(where.id);
              }
              const userRes = await client.query(query, params);
              return userRes.rows[0] || null;
            } finally {
              client.release();
            }
          } catch (retryErr) {
            console.error("findUnique retry error:", retryErr);
          }
        }
        const fallback = FALLBACK_USERS.find(
          (u) => where.email && u.email.toLowerCase() === where.email.trim().toLowerCase() || where.id && u.id === where.id
        );
        return fallback || null;
      }
    },
    async create({ data }) {
      try {
        const client = await pool.connect();
        try {
          const id = data.id || `usr_${Date.now()}`;
          const res = await client.query(
            `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [id, data.email.trim().toLowerCase(), data.name || "", data.password]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        if (err?.code === "42P01" || err?.message?.includes("does not exist")) {
          await ensureTablesReady();
          const client = await pool.connect();
          try {
            const id = data.id || `usr_${Date.now()}`;
            const res = await client.query(
              `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, NOW(), NOW())
               RETURNING *`,
              [id, data.email.trim().toLowerCase(), data.name || "", data.password]
            );
            return res.rows[0];
          } finally {
            client.release();
          }
        }
        throw err;
      }
    }
  },
  twoFactorAuth: {
    async findUnique({ where }) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [where.userId]);
          return res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("twoFactorAuth.findUnique error:", err?.message);
        return { isEnabled: false, method: "EMAIL", userId: where.userId };
      }
    },
    async update({ where, data }) {
      try {
        const client = await pool.connect();
        try {
          const updates = [];
          const params = [];
          let idx = 1;
          Object.keys(data).forEach((key) => {
            updates.push(`"${key}" = $${idx}`);
            params.push(data[key]);
            idx++;
          });
          updates.push(`"updatedAt" = NOW()`);
          let whereClause = "";
          if (where.userId) {
            whereClause = `"userId" = $${idx}`;
            params.push(where.userId);
          } else if (where.id) {
            whereClause = `"id" = $${idx}`;
            params.push(where.id);
          }
          const res = await client.query(
            `UPDATE "TwoFactorAuth" SET ${updates.join(", ")} WHERE ${whereClause} RETURNING *`,
            params
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("twoFactorAuth.update error:", err?.message);
        return { isEnabled: false, method: "EMAIL", ...data };
      }
    }
  }
};

// src/lib/auth.ts
import crypto2 from "crypto";
var ENCRYPTION_SALT2 = process.env.AUTH_SALT || "KBZ_IR_PORTAL_SECURE_SALT_2026";
var JWT_SECRET = process.env.JWT_SECRET || "KBZ_JWT_SECRET_SUPER_SECURE_KEY_2026";
var AuthUtils = class {
  /**
   * Hashes plain text password with SHA-256 and secure salt
   */
  static async hashPassword(password) {
    return crypto2.createHash("sha256").update(password + ENCRYPTION_SALT2).digest("hex");
  }
  /**
   * Compares plain password with stored hash
   */
  static async comparePassword(plain, hash) {
    const hashed = await this.hashPassword(plain);
    return hashed === hash || hash === plain;
  }
  /**
   * Generates a temporary token for 2FA verification challenge
   */
  static generateTempToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 10 * 60
        // 10 minutes
      })
    ).toString("base64url");
    const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }
  /**
   * Generates a full access token for authenticated session
   */
  static generateAccessToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60
        // 7 days
      })
    ).toString("base64url");
    const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }
  /**
   * Verifies and decodes a token
   */
  static verifyToken(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
      if (signature !== expectedSignature) return null;
      const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1e3)) return null;
      return decoded;
    } catch {
      return null;
    }
  }
};

// src/lib/two-factor.ts
var import_speakeasy = __toESM(require_speakeasy(), 1);

// src/server/email.ts
import nodemailer from "nodemailer";
var host = process.env.MAIL_HOST || "smtp.gmail.com";
var port = parseInt(process.env.MAIL_PORT || "587", 10);
var user = process.env.MAIL_USERNAME || "sanyuaung.ygn.mm@gmail.com";
var pass = process.env.MAIL_PASSWORD || "xpkbqrjshoayiomx";
var fromName = process.env.MAIL_FROM_NAME || "KBZ Bank IR Portal";
var fromAddress = process.env.MAIL_FROM_ADDRESS || "sanyuaung.ygn.mm@gmail.com";
var transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass
  },
  tls: {
    rejectUnauthorized: false
  }
});
async function sendOtpEmail(toEmail, otpCode, recipientName) {
  const cleanRecipient = (toEmail || "").trim();
  if (!cleanRecipient) {
    console.error("[SMTP] No recipient email specified");
    return { success: false, error: "Recipient email is required" };
  }
  const name = recipientName || cleanRecipient.split("@")[0] || "Valued Customer";
  const subject = `[KBZ Bank IR Portal] Your 2FA Security Code: ${otpCode}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0B2B66; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f8fafc; border: 2px dashed #0B2B66; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0B2B66; margin: 0; }
        .otp-sub { font-size: 12px; color: #64748b; margin-top: 8px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KBZ BANK</h1>
          <p>Inbound Remittance Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name}</div>
          <div class="text">
            You recently requested a Two-Factor Authentication (2FA) verification code to authenticate your session on the KBZ Bank Inbound Remittance Portal.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="otp-sub">This verification code is valid for 1 minute (60 seconds)</div>
          </div>
          <div class="warning">
            <strong>Security Notice:</strong> Never share this code with anyone. KBZ Bank staff will never ask for your password or 2FA OTP code.
          </div>
          <div class="text" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            Sent to your registered email: <strong>${cleanRecipient}</strong><br>
            If you did not initiate this request, please contact KBZ Bank Security Operations immediately.
          </div>
        </div>
        <div class="footer">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Kanbawza Bank Limited (KBZ Bank). All rights reserved.<br>
          Yangon Main Corporate Branch \u2022 Security & Compliance Dept
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `KBZ BANK - Inbound Remittance Portal

Your Two-Factor Authentication (2FA) Verification Code is: ${otpCode}

This code will expire in 1 minute (60 seconds). Never share this code with anyone.
Sent to: ${cleanRecipient}`;
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: cleanRecipient,
      subject,
      text,
      html
    });
    console.log(`[SMTP] 2FA Email sent successfully to ${cleanRecipient}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipients: cleanRecipient };
  } catch (err) {
    console.error(`[SMTP] Failed to send email to ${cleanRecipient}:`, err);
    return { success: false, error: err.message };
  }
}

// src/lib/two-factor.ts
var TwoFactorService = class {
  /**
   * Generates and stores a 6-digit email OTP for the user in Neon DB and sends real email via SMTP
   */
  static async sendEmailOtp(userId, targetEmail) {
    const client = await pool.connect();
    try {
      let email = targetEmail;
      let name = "";
      if (!email) {
        const uRes = await client.query(`SELECT email, name FROM "User" WHERE id = $1 OR email = $1`, [userId]);
        if (uRes.rows.length > 0) {
          email = uRes.rows[0].email;
          name = uRes.rows[0].name;
        }
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiry = new Date(Date.now() + 1 * 60 * 1e3);
      await client.query(
        `UPDATE "TwoFactorAuth"
         SET "emailOtp" = $1, "emailOtpExpiry" = $2, "updatedAt" = NOW()
         WHERE "userId" = $3`,
        [otp, expiry, userId]
      );
      if (email) {
        await sendOtpEmail(email, otp, name);
      }
      return {
        success: true,
        otp,
        expiry,
        message: `Security OTP sent to ${email || userId}`
      };
    } finally {
      client.release();
    }
  }
  /**
   * Verifies OTP or Google Authenticator TOTP code
   */
  static async verifyCode(userId, code) {
    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [userId]);
      const tfa = res.rows[0];
      if (!tfa || !tfa.isEnabled) return false;
      const cleanCode = code.trim().toUpperCase();
      if (tfa.method === "GOOGLE_AUTH") {
        if (tfa.secret && cleanCode.length === 6) {
          const valid = import_speakeasy.default.totp.verify({
            secret: tfa.secret,
            encoding: "base32",
            token: cleanCode,
            window: 6
          });
          if (valid) return true;
        }
        if (tfa.backupCodes && tfa.backupCodes.includes(cleanCode)) {
          const remaining = tfa.backupCodes.filter((c) => c !== cleanCode);
          await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "id" = $2`, [remaining, tfa.id]);
          return true;
        }
        return false;
      } else {
        if (!tfa.emailOtp || !tfa.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(tfa.emailOtpExpiry)) {
          return false;
        }
        const valid = tfa.emailOtp === cleanCode;
        if (valid) {
          await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "id" = $1`, [
            tfa.id
          ]);
        }
        return valid;
      }
    } finally {
      client.release();
    }
  }
};

// src/server/app.ts
import_dotenv2.default.config();
var app = express();
app.use((0, import_cors.default)({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index")) {
    req.url = req.url.replace("/api/index", "") || "/";
    if (!req.url.startsWith("/api") && req.url !== "/") {
      req.url = "/api" + req.url;
    }
  }
  next();
});
ensureDatabaseSchema().catch((err) => {
  console.warn("[DB_INIT_WARN] Schema auto-verification:", err?.message || err);
});
if (process.env.ENABLE_DB_SEED === "true") {
  seedDatabase().catch((err) => console.error("[DB_SEED_WARN] Seed error:", err?.message || err));
}
app.get(["/api/health", "/health"], async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({ status: "ok", database: "connected", time: dbRes.rows[0].now });
  } catch (err) {
    res.status(200).json({ status: "degraded", database: "offline_fallback", message: err?.message || "DB cold standby" });
  }
});
app.post(["/api/auth/login", "/auth/login", "/login"], async (req, res) => {
  const requestTime = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      console.warn(`[AUTH_LOGIN_VALIDATION_ERROR] Missing credentials at ${requestTime}`);
      return res.status(400).json({
        success: false,
        error: "Both Email and Password are required to sign in."
      });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    console.log(`[AUTH_LOGIN_ATTEMPT] Target: ${cleanEmail} | Time: ${requestTime}`);
    let user2 = null;
    try {
      user2 = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
    } catch (dbError) {
      console.error(`[AUTH_LOGIN_DB_ERROR] Query failed for ${cleanEmail}:`, {
        message: dbError?.message,
        code: dbError?.code,
        stack: dbError?.stack
      });
      try {
        await ensureDatabaseSchema();
        user2 = await prisma.user.findUnique({
          where: { email: cleanEmail }
        });
      } catch (retryError) {
        console.error(`[AUTH_LOGIN_RETRY_ERROR] Recovery query failed for ${cleanEmail}:`, retryError?.message);
      }
    }
    if (!user2) {
      console.warn(`[AUTH_LOGIN_NOT_FOUND] No user account matched for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: "No account found with this email address. Please check your spelling or register a new account."
      });
    }
    let isPasswordValid = false;
    try {
      isPasswordValid = await AuthUtils.comparePassword(password, user2.password);
    } catch (hashError) {
      console.error(`[AUTH_LOGIN_BCRYPT_ERROR] Password validation error for ${cleanEmail}:`, hashError?.message);
    }
    if (!isPasswordValid) {
      console.warn(`[AUTH_LOGIN_INVALID_PASSWORD] Authentication mismatch for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: "Invalid password. Please double-check your password and try again."
      });
    }
    let twoFactorAuth = null;
    try {
      twoFactorAuth = await prisma.twoFactorAuth.findUnique({ where: { userId: user2.id } });
    } catch (tfaLookupError) {
      console.warn("[AUTH_LOGIN_2FA_LOOKUP_WARN] 2FA check warning:", tfaLookupError?.message);
    }
    if (twoFactorAuth?.isEnabled) {
      let activeOtp;
      if (twoFactorAuth.method === "EMAIL") {
        try {
          const otpRes = await TwoFactorService.sendEmailOtp(user2.id);
          activeOtp = otpRes.otp;
        } catch (otpErr) {
          console.error("[AUTH_LOGIN_OTP_SEND_ERROR] OTP generation failed:", otpErr?.message);
        }
      }
      const tempToken = AuthUtils.generateTempToken({
        sub: user2.id,
        email: user2.email,
        requiresOtp: true
      });
      return res.json({
        success: true,
        requiresOtp: true,
        require2Fa: true,
        tempToken,
        method: twoFactorAuth.method,
        userId: user2.id,
        userEmail: user2.email,
        activeOtp
      });
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: user2.id,
      email: user2.email,
      requiresOtp: false
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1e3
    });
    const profileCompanyName = user2.companyName || (user2.name ? `${user2.name} Trading Co., Ltd.` : "Myanmar Horizon Trading Co., Ltd.");
    const profilePhone = user2.phone || "+95 9 798 112 889";
    const userMerchantId = cleanEmail === "sanyuaung.ygn.mm@gmail.com" || cleanEmail.includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs(cleanEmail.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    console.log(`[AUTH_LOGIN_SUCCESS] Successfully signed in: ${cleanEmail}`);
    return res.json({
      success: true,
      accessToken,
      requiresOtp: false,
      require2Fa: false,
      user: {
        id: user2.id,
        email: user2.email,
        name: user2.name || "San Yu Aung",
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: "Customer Account Admin",
        accountNumber: "0091-2384-992019",
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (error) {
    console.error("[AUTH_LOGIN_CRITICAL_ERROR] Unexpected login failure:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return res.status(401).json({
      success: false,
      error: error?.message || "Login service temporarily unavailable. Please verify your credentials or try again in a moment."
    });
  }
});
app.post(["/api/auth/logout", "/auth/logout", "/logout"], async (req, res) => {
  try {
    res.cookie("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: true, message: "Logged out" });
  }
});
app.post(["/api/auth/signup", "/api/auth/register"], async (req, res) => {
  const requestTime = (/* @__PURE__ */ new Date()).toISOString();
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    console.warn(`[AUTH_SIGNUP_VALIDATION_ERROR] Missing email or password at ${requestTime}`);
    return res.status(400).json({
      success: false,
      error: "Both Email and Password are required to create an account."
    });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = (name || "").trim() || cleanEmail.split("@")[0];
  console.log(`[AUTH_SIGNUP_ATTEMPT] Email: ${cleanEmail}, Name: ${cleanName} | Time: ${requestTime}`);
  let client = null;
  const userId = `usr_${Date.now()}`;
  let hashedPassword = "";
  try {
    hashedPassword = await AuthUtils.hashPassword(password);
  } catch (hashErr) {
    console.error("[AUTH_SIGNUP_HASH_ERROR]", hashErr?.message);
    return res.status(500).json({
      success: false,
      error: "Failed to securely process credentials. Please try again."
    });
  }
  try {
    try {
      client = await pool.connect();
      await ensureDatabaseSchema(client);
    } catch (connErr) {
      console.error("[AUTH_SIGNUP_DB_CONN_ERROR] Database connection issue:", {
        message: connErr?.message,
        code: connErr?.code
      });
    }
    if (client) {
      try {
        const existing = await client.query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
        if (existing.rows && existing.rows.length > 0) {
          console.warn(`[AUTH_SIGNUP_DUPLICATE] Account already exists for: ${cleanEmail}`);
          return res.status(409).json({
            success: false,
            error: "An account with this email address already exists. Please sign in instead."
          });
        }
      } catch (existingCheckErr) {
        console.warn("[AUTH_SIGNUP_EXISTING_CHECK_WARN]", existingCheckErr?.message);
      }
      try {
        await client.query(
          `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [userId, cleanName, cleanEmail, hashedPassword]
        );
      } catch (insertUserErr) {
        console.warn("[AUTH_SIGNUP_INSERT_USER_WARN] Retrying user insert after schema refresh:", insertUserErr?.message);
        if (insertUserErr?.code === "23505") {
          return res.status(409).json({
            success: false,
            error: "An account with this email address already exists. Please sign in instead."
          });
        }
        try {
          await ensureDatabaseSchema(client);
          await client.query(
            `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [userId, cleanName, cleanEmail, hashedPassword]
          );
        } catch (retryInsertErr) {
          console.error("[AUTH_SIGNUP_RETRY_INSERT_ERROR]", retryInsertErr?.message);
        }
      }
      try {
        await client.query(
          `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "createdAt", "updatedAt")
           VALUES ($1, $2, false, 'EMAIL', NOW(), NOW())`,
          [`tfa_${userId}`, userId]
        );
      } catch (tfaInsertError) {
        console.warn("[AUTH_SIGNUP_TFA_INIT_WARN] TwoFactorAuth initialization note:", tfaInsertError?.message);
      }
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: userId,
      email: cleanEmail,
      requiresOtp: false
    });
    try {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 * 1e3
      });
    } catch (cookieErr) {
    }
    const userMerchantId = cleanEmail === "sanyuaung.ygn.mm@gmail.com" || cleanEmail.includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs(cleanEmail.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    console.log(`[AUTH_SIGNUP_SUCCESS] New user account created: ${cleanEmail}`);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        merchantId: userMerchantId,
        merchantName: cleanName,
        role: "Customer Account Admin",
        accountNumber: `0091-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e5 + Math.random() * 9e5)}`,
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (err) {
    console.error("[AUTH_SIGNUP_CRITICAL_ERROR]", {
      email: cleanEmail,
      message: err?.message,
      code: err?.code,
      stack: err?.stack
    });
    return res.status(400).json({
      success: false,
      error: err?.message || "Registration request could not be processed. Please verify your information and try again."
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
async function resolveOrCreateUser(client, userIdOrEmail, fallbackEmail) {
  const cleanTarget = (fallbackEmail || userIdOrEmail || "sanyu.aung@kbzbank.com").trim().toLowerCase();
  const cleanId = (userIdOrEmail || "").trim();
  try {
    const userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
      [cleanId, cleanTarget]
    );
    if (userRes.rows.length > 0) {
      return userRes.rows[0];
    }
  } catch (err) {
    if (err?.code === "42P01" || err?.message?.includes("does not exist")) {
      await ensureDatabaseSchema(client);
    }
  }
  const uId = cleanId.startsWith("usr_") ? cleanId : `usr_${Date.now()}`;
  const defaultName = cleanTarget.split("@")[0] || "San Yu Aung";
  const defaultHash = await AuthUtils.hashPassword("Password@123");
  let insertRes;
  try {
    insertRes = await client.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uId, defaultName, cleanTarget, defaultHash]
    );
  } catch (insErr) {
    const existing = await client.query(`SELECT * FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanTarget]);
    if (existing.rows && existing.rows[0]) return existing.rows[0];
    throw insErr;
  }
  return insertRes.rows[0];
}
app.post(["/api/auth/verify-2fa", "/auth/verify-2fa", "/verify-2fa"], async (req, res) => {
  const { userId, tempToken, code } = req.body;
  const targetId = userId || (tempToken ? AuthUtils.verifyToken(tempToken)?.sub : null);
  if (!targetId || !code) {
    return res.status(400).json({ error: "User ID / session token and verification code required." });
  }
  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT u.*, t."isEnabled" as "tfaEnabled", t."method" as "tfaMethod", t.secret, t."backupCodes", t."emailOtp", t."emailOtpExpiry"
       FROM "User" u
       LEFT JOIN "TwoFactorAuth" t ON u.id = t."userId"
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [targetId]
    );
    const user2 = userRes.rows[0];
    if (!user2 || !user2.tfaEnabled) {
      return res.status(400).json({ error: "2FA is not enabled for this account." });
    }
    const cleanCode = code.trim().toUpperCase();
    let isValid = false;
    if (user2.tfaMethod === "GOOGLE_AUTH") {
      if (user2.secret && cleanCode.length === 6) {
        isValid = import_speakeasy2.default.totp.verify({
          secret: user2.secret,
          encoding: "base32",
          token: cleanCode,
          window: 6
        });
      }
      if (!isValid && user2.backupCodes && user2.backupCodes.includes(cleanCode)) {
        isValid = true;
        const remaining = user2.backupCodes.filter((bc) => bc !== cleanCode);
        await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "userId" = $2`, [remaining, user2.id]);
      }
    } else {
      if (!user2.emailOtp || !user2.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(user2.emailOtpExpiry)) {
        return res.status(400).json({ error: "OTP expired. Please request a new code." });
      }
      isValid = user2.emailOtp === cleanCode;
      if (isValid) {
        await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "userId" = $1`, [
          user2.id
        ]);
      }
    }
    if (!isValid) {
      return res.status(400).json({
        error: user2.tfaMethod === "GOOGLE_AUTH" ? "Invalid code. Please enter the current 6-digit code displayed in Google Authenticator." : "Invalid email verification code."
      });
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: user2.id,
      email: user2.email,
      requiresOtp: false
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1e3
    });
    const profileCompanyName = user2.companyName || (user2.name ? `${user2.name} Trading Co., Ltd.` : "Myanmar Horizon Trading Co., Ltd.");
    const profilePhone = user2.phone || "+95 9 798 112 889";
    const userMerchantId = (user2.email || "").toLowerCase().includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs((user2.email || "").split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    return res.json({
      success: true,
      accessToken,
      user: {
        id: user2.id,
        email: user2.email,
        name: user2.name || "San Yu Aung",
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: "Customer Account Admin",
        accountNumber: "0091-2384-992019",
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (err) {
    console.error("2FA verification error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  } finally {
    if (client) client.release();
  }
});
app.post(["/api/2fa/enable", "/2fa/enable"], async (req, res) => {
  const { userId, method, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: "User ID or Email is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user2.email || "customer@mmglobalremit.com").trim();
    if (method === "GOOGLE_AUTH") {
      const label = `MM Global Remit:${targetEmail}`;
      const issuer = "MM Global Remit";
      const secretObj = import_speakeasy2.default.generateSecret({
        name: label,
        issuer,
        length: 20
      });
      const secret = secretObj.base32;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      const qrCode = await import_qrcode.default.toDataURL(otpauthUrl);
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto3.randomBytes(4).toString("hex").toUpperCase());
      }
      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "secret", "backupCodes", "updatedAt")
         VALUES ($1, $2, false, 'GOOGLE_AUTH', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'GOOGLE_AUTH', "secret" = $3, "backupCodes" = $4, "updatedAt" = NOW()`,
        [`tfa_${user2.id}`, user2.id, secret, backupCodes]
      );
      return res.json({
        success: true,
        method: "GOOGLE_AUTH",
        secret,
        qrCode,
        otpauthUrl,
        backupCodes
      });
    } else {
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiry = new Date(Date.now() + 1 * 60 * 1e3);
      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
         VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'EMAIL', "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
        [`tfa_${user2.id}`, user2.id, otp, expiry]
      );
      await sendOtpEmail(targetEmail, otp, user2.name);
      return res.json({
        success: true,
        method: "EMAIL",
        otp,
        userEmail: targetEmail,
        message: `OTP sent to ${targetEmail}`
      });
    }
  } catch (err) {
    console.error("2FA enable error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.post(["/api/2fa/send-email-otp", "/api/auth/resend-otp"], async (req, res) => {
  const { userId, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: "User ID or Email is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user2.email || "sanyu.aung@kbzbank.com").trim();
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiry = new Date(Date.now() + 1 * 60 * 1e3);
    await client.query(
      `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
       VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
       ON CONFLICT ("userId")
       DO UPDATE SET "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
      [`tfa_${user2.id}`, user2.id, otp, expiry]
    );
    await sendOtpEmail(targetEmail, otp, user2.name);
    return res.json({
      success: true,
      otp,
      userEmail: targetEmail,
      message: `New verification code sent to ${targetEmail}`
    });
  } catch (err) {
    console.error("Send email OTP error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.get(["/api/2fa/status/:userId", "/2fa/status/:userId"], async (req, res) => {
  const { userId } = req.params;
  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT t."isEnabled", t."method" FROM "TwoFactorAuth" t
       JOIN "User" u ON t."userId" = u.id
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.json({ isEnabled: false, method: null });
    }
    return res.json({
      isEnabled: userRes.rows[0].isEnabled,
      method: userRes.rows[0].method
    });
  } catch (err) {
    return res.status(200).json({ isEnabled: false, method: null, error: err?.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/2fa/verify-and-enable", "/2fa/verify-and-enable"], async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: "User ID and code are required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId);
    const tfaRes = await client.query(
      `SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`,
      [user2.id]
    );
    const tfa = tfaRes.rows[0];
    if (!tfa) return res.status(400).json({ error: "2FA setup not initiated" });
    const cleanCode = code.trim();
    let isValid = false;
    if (tfa.method === "GOOGLE_AUTH") {
      if (tfa.secret) {
        isValid = import_speakeasy2.default.totp.verify({
          secret: tfa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 6
        });
      }
    } else {
      if (!tfa.emailOtp || !tfa.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(tfa.emailOtpExpiry)) {
        return res.status(400).json({ error: "Verification code expired. Please request a new 1-minute OTP." });
      }
      isValid = tfa.emailOtp === cleanCode;
    }
    if (!isValid) {
      return res.status(400).json({
        error: tfa.method === "GOOGLE_AUTH" ? "Invalid code. Please check your Google Authenticator app and enter the real 6-digit code currently displayed." : "Invalid email verification code."
      });
    }
    await client.query(
      `UPDATE "TwoFactorAuth" SET "isEnabled" = true, "emailOtp" = NULL, "emailOtpExpiry" = NULL, "updatedAt" = NOW() WHERE "id" = $1`,
      [tfa.id]
    );
    return res.json({
      success: true,
      message: "Two-factor authentication enabled successfully in Neon PostgreSQL."
    });
  } catch (err) {
    console.error("2FA verify-and-enable error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/2fa/disable", "/2fa/disable"], async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) return res.status(400).json({ error: "Password is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId);
    const isValid = await AuthUtils.comparePassword(password, user2.password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    await client.query(`DELETE FROM "TwoFactorAuth" WHERE "userId" = $1`, [
      user2.id
    ]);
    return res.json({ success: true, message: "Two-factor authentication deleted from database successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/auth/change-password", "/auth/change-password", "/change-password"], async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "User ID, current password, and new password are required." });
  }
  let client;
  try {
    client = await pool.connect();
    const cleanId = (userId || "").trim();
    let userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) LIMIT 1`,
      [cleanId]
    );
    let user2 = userRes.rows[0];
    if (!user2) {
      user2 = await resolveOrCreateUser(client, cleanId);
    }
    const isValid = await AuthUtils.comparePassword(currentPassword, user2.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect. Please enter your valid current password." });
    }
    const newHash = await AuthUtils.hashPassword(newPassword);
    await client.query(`UPDATE "User" SET "password" = $1, "updatedAt" = NOW() WHERE "id" = $2`, [newHash, user2.id]);
    return res.json({ success: true, message: "Password updated successfully in PostgreSQL database." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.get(["/api/transactions", "/transactions"], async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" ORDER BY "valueDate" DESC`
    );
    if (result.rows && result.rows.length > 0) {
      const transactions = result.rows.map((row) => ({
        id: row.id,
        transactionRef: row.transactionRef,
        senderName: row.senderName,
        senderCountry: row.senderCountry,
        sendingBank: row.sendingBank,
        sendingBankBic: row.sendingBankBic,
        currency: row.currency,
        amount: row.amount,
        exchangeRate: row.exchangeRate,
        convertedAmountMmk: row.convertedAmountMmk,
        feeAmount: row.feeAmount,
        netAmountMmk: row.netAmountMmk,
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === "string" ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {}
      }));
      return res.json({ success: true, transactions, count: transactions.length });
    }
  } catch (err) {
    console.warn("[TRANSACTIONS_FETCH_DB_WARN] Using fallback transactions:", err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.json({ success: true, transactions: mockTransactions, count: mockTransactions.length, source: "fallback" });
});
app.get(["/api/transactions/:id", "/transactions/:id"], async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" WHERE id = $1 OR "transactionRef" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      const tx = {
        id: row.id,
        transactionRef: row.transactionRef,
        senderName: row.senderName,
        senderCountry: row.senderCountry,
        sendingBank: row.sendingBank,
        sendingBankBic: row.sendingBankBic,
        currency: row.currency,
        amount: row.amount,
        exchangeRate: row.exchangeRate,
        convertedAmountMmk: row.convertedAmountMmk,
        feeAmount: row.feeAmount,
        netAmountMmk: row.netAmountMmk,
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === "string" ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {}
      };
      return res.json({ success: true, transaction: tx });
    }
  } catch (err) {
    console.warn("[TRANSACTION_BY_ID_DB_WARN]", err?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  const foundMock = mockTransactions.find((t) => t.id === id || t.transactionRef === id);
  if (foundMock) {
    return res.json({ success: true, transaction: foundMock });
  }
  return res.status(404).json({ error: "Transaction not found" });
});
app.post(["/api/transactions/simulate", "/transactions/simulate"], async (req, res) => {
  const tx = req.body;
  if (!tx || !tx.amount || !tx.currency) {
    return res.status(400).json({ error: "Valid transaction data is required" });
  }
  let client;
  const txId = tx.id || `tx-${Date.now()}`;
  const txRef = tx.transactionRef || `IR-2026-SIM-${Math.floor(1e5 + Math.random() * 9e5)}`;
  const valueDate = tx.valueDate ? new Date(tx.valueDate) : /* @__PURE__ */ new Date();
  const simulatedTx = {
    id: txId,
    transactionRef: txRef,
    senderName: tx.senderName || "Global Remittance Partner Ltd",
    senderCountry: tx.senderCountry || "Singapore",
    sendingBank: tx.sendingBank || "DBS Bank Ltd",
    sendingBankBic: tx.sendingBankBic || "DBSSSGSG",
    currency: tx.currency,
    amount: Number(tx.amount),
    exchangeRate: Number(tx.exchangeRate || 3550),
    convertedAmountMmk: Number(tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    feeAmount: Number(tx.feeAmount || 0),
    netAmountMmk: Number(tx.netAmountMmk || tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    valueDate: valueDate.toISOString(),
    status: tx.status || "Completed",
    statusMessage: tx.statusMessage || null,
    purpose: tx.purpose || "Commercial Remittance Clearing",
    beneficiaryAccount: tx.beneficiaryAccount || "0091-2384-992019",
    swiftMetadata: tx.swiftMetadata || {}
  };
  try {
    client = await pool.connect();
    await client.query(
      `INSERT INTO "InboundTransaction" (
        "id", "transactionRef", "senderName", "senderCountry", "sendingBank", "sendingBankBic",
        "currency", "amount", "exchangeRate", "convertedAmountMmk", "feeAmount", "netAmountMmk",
        "valueDate", "status", "statusMessage", "purpose", "beneficiaryAccount", "swiftMetadata", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())`,
      [
        txId,
        txRef,
        simulatedTx.senderName,
        simulatedTx.senderCountry,
        simulatedTx.sendingBank,
        simulatedTx.sendingBankBic,
        simulatedTx.currency,
        simulatedTx.amount,
        simulatedTx.exchangeRate,
        simulatedTx.convertedAmountMmk,
        simulatedTx.feeAmount,
        simulatedTx.netAmountMmk,
        valueDate,
        simulatedTx.status,
        simulatedTx.statusMessage,
        simulatedTx.purpose,
        simulatedTx.beneficiaryAccount,
        JSON.stringify(simulatedTx.swiftMetadata)
      ]
    );
  } catch (err) {
    console.warn("[SIMULATE_TRANSACTION_DB_WARN] Saved in memory:", err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.status(201).json({ success: true, transaction: simulatedTx });
});
app.get(["/api/fx-rates", "/fx-rates"], async (req, res) => {
  const targetCurrencies = ["USD", "EUR", "SGD", "THB", "GBP", "JPY", "CNY", "MYR"];
  const cbmApiUrl = process.env.CBM_FOREX_API_URL || "https://forex.cbm.gov.mm/api/latest";
  const parseRate = (value) => {
    if (value === void 0 || value === null) return null;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };
  let client;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4e3);
    const cbmResp = await fetch(cbmApiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (cbmResp.ok) {
      const cbmData = await cbmResp.json();
      const ratesMap = cbmData?.rates || {};
      const ts = cbmData?.timestamp ? new Date(Number(cbmData.timestamp) * 1e3).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const fxRates = targetCurrencies.map((currency) => {
        const middleRate = parseRate(ratesMap[currency]);
        if (!middleRate) return null;
        const spread = middleRate * 2e-3;
        const buyRate = Math.round((middleRate - spread) * 100) / 100;
        const sellRate = Math.round((middleRate + spread) * 100) / 100;
        return {
          currency,
          buyRate,
          sellRate,
          middleRate: Math.round(middleRate * 100) / 100,
          change24h: 0,
          updatedAt: ts
        };
      }).filter(Boolean);
      if (fxRates.length > 0) {
        (async () => {
          let cacheClient;
          try {
            cacheClient = await pool.connect();
            for (const rate of fxRates) {
              await cacheClient.query(
                `INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT ("currency")
                 DO UPDATE SET
                   "buyRate" = EXCLUDED."buyRate",
                   "sellRate" = EXCLUDED."sellRate",
                   "middleRate" = EXCLUDED."middleRate",
                   "change24h" = EXCLUDED."change24h",
                   "updatedAt" = EXCLUDED."updatedAt"`,
                [`fx_${rate.currency.toLowerCase()}`, rate.currency, rate.buyRate, rate.sellRate, rate.middleRate, rate.change24h, rate.updatedAt]
              );
            }
          } catch (cacheErr) {
          } finally {
            if (cacheClient) {
              try {
                cacheClient.release();
              } catch (e) {
              }
            }
          }
        })();
        return res.json({ success: true, source: "cbm", fxRates });
      }
    }
  } catch (cbmErr) {
    console.warn("[FX_RATES_CBM_WARN] CBM feed unavailable, querying database or mock fallback:", cbmErr?.message);
  }
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM "FxRate" ORDER BY "currency" ASC`);
    if (result.rows && result.rows.length > 0) {
      const rates = result.rows.map((row) => ({
        currency: row.currency,
        buyRate: row.buyrate ?? row.buyRate,
        sellRate: row.sellrate ?? row.sellRate,
        middleRate: row.middlerate ?? row.middleRate,
        change24h: row.change24h ?? 0,
        updatedAt: row.updatedat?.toISOString?.() || row.updatedAt?.toISOString?.() || (/* @__PURE__ */ new Date()).toISOString()
      }));
      return res.json({ success: true, source: "database-fallback", fxRates: rates });
    }
  } catch (dbErr) {
    console.warn("[FX_RATES_DB_WARN] DB query error, using built-in mock fallback:", dbErr?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.json({
    success: true,
    source: "fallback",
    fxRates: mockFxRates
  });
});
app.post("/api/database/migrate", async (req, res) => {
  try {
    await seedDatabase();
    return res.json({ success: true, message: "All tables migrated and mock data seeded into PostgreSQL." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// api/index.ts
function handler(req, res) {
  const originalUrl = req.headers["x-matched-path"] || req.url || "";
  if (originalUrl && !originalUrl.startsWith("/api") && originalUrl !== "/") {
    req.url = "/api" + (originalUrl.startsWith("/") ? originalUrl : "/" + originalUrl);
  }
  return app(req, res);
}
export {
  handler as default
};
/*! Bundled license information:

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)

vary/index.js:
  (*!
   * vary
   * Copyright(c) 2014-2017 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
