
const addon = require('bindings')('glue');

const pkcs7_header = Buffer.from('-----BEGIN PKCS7-----');
const pkcs7_footer = Buffer.from('-----END PKCS7-----');
const nl = Buffer.from('\n');

/**
 * Verify a document given a public key, document and a PKCS#7 encoded
 * signature.  All parameters should either be strings, Buffers or something
 * which can be converted into a Buffer safely with a call to Buffer.from(),
 * with an encoding parameter of 'utf-8'.
 *
 * For more detailed explanation of this functions return values and error
 * handling, please refer to README.md in the Api and Errors sections
 */
module.exports = function verify(pubkey, document, pkcs7) {
  if (typeof pubkey === 'undefined') {
    throw new Error('pubkey must be provided');
  }

  if (typeof document === 'undefined') {
    throw new Error('document must be provided');
  }

  if (typeof pkcs7 === 'undefined') {
    throw new Error('pkcs7 signature must be provided');
  }

  if (!Buffer.isBuffer(pubkey)) {
    pubkey = Buffer.from(pubkey, 'utf-8');
  }

  if (!Buffer.isBuffer(document)) {
    document = Buffer.from(document, 'utf-8');
  }

  if (!Buffer.isBuffer(pkcs7)) {
    pkcs7 = Buffer.from(pkcs7, 'utf-8');
  }

  let hasHeader = false;
  if (pkcs7.length > pkcs7_header.length - 1) {
    if (Buffer.compare(pkcs7_header, pkcs7.slice(0, pkcs7_header.length)) === 0) {
      hasHeader = true;
    }
  }

  // If the pkcs7 signature has a header, assume that it's totally valid and
  // ready to pass into the verification routines, if not, trim any leading and
  // trailing newlines so that the headers are valid
  if (!hasHeader) {
    let i;
    for (i = 0; i < pkcs7.length && pkcs7[i] === nl[0]; i++) {;}
    pkcs7 = pkcs7.slice(i);

    for (i = pkcs7.length - 1; i >= 0 && pkcs7[i] === nl[0]; i--) {;}
    pkcs7 = pkcs7.slice(0, i+1);

    pkcs7 = Buffer.concat([
      pkcs7_header,
      nl,
      pkcs7,
      nl,
      pkcs7_footer,
      nl,
    ]);
  }

  let outcome = addon.verify(pubkey, document, pkcs7);
  return outcome;
};
