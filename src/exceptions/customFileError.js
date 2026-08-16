/**
 * CustomFileError class extends the built-in Error class
 */
export class CustomFileError extends Error {
  constructor(errors) {
    super(errors);
    this.errors = errors;
  }
}
