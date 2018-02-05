
function logHelper(logs, logString) {
  logs.forEach(l => {
    if (l.event === logString) {
      console.log(l.args.logString, ' ', l.args.value.toNumber() / (10 ** 18));
    } else {
      Object.keys(l.args).forEach(key => {
        let value = typeof l.args[key] === 'string' ? l.args[key] : l.args[key].toNumber();
        console.log(key, ' ', value);
      });
    }
  });
}

/* global assert */

function isException(error) {
  let strError = error.toString();
  return strError.includes('Invalid JSON RPC') || strError.includes('VM Exception') || strError.includes('invalid opcode') || strError.includes('invalid JUMP');
}

function ensureException(error) {
  assert(isException(error), error.toString());
}

module.exports = {
  zeroAddress: '0x0000000000000000000000000000000000000000',
  isException,
  ensureException,
  logHelper
};
