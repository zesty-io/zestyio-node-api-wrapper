const request = require("request").defaults({ strictSSL: false });

class ZestyioAuthWrapper {
  constructor(options = {}) {
    this.authURL = options.hasOwnProperty("authURL")
      ? options.authURL
      : "https://auth.api.zesty.io";
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      request.post(
        {
          url: `${this.authURL}/login`,
          formData: {
            email,
            password
          },
          json: true
        },
        (error, response, body) => {
          if (error) {
            return reject({
              errorCode: -1,
              errorMessage: "Unexpected error."
            });
          }

          if (response.statusCode !== 200) {
            return reject({
              errorCode: response.statusCode,
              errorMessage: body.message || ""
            });
          }

          return resolve(body.meta.token);
        }
      );
    });
  }

  async verifyToken(tokenToVerify) {
    return new Promise((resolve, reject) => {
      request.get(
        {
          url: `${this.authURL}/verify`,
          headers: {
            Authorization: `Bearer ${tokenToVerify}`
          },
          json: true
        },
        (error, response, body) => {
          if (error) {
            return reject({
              errorCode: -1,
              errorMessage: "Unexpected error."
            });
          }

          if (response.statusCode !== 200) {
            return resolve(false);
          }

          return resolve(true);
        }
      );
    });
  }
}

module.exports = ZestyioAuthWrapper;
