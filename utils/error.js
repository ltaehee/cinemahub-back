class InvaildRequestError extends Error {
  constructor(cause, message) {
    super((message = `${cause} : ${message}`));
  }
}

module.exports = { InvaildRequestError };
