import * as Util from './util';

function search(email, phrase) {
  return Util.match(email, phrase.regex).map((range) => ({
    message: phrase.message,
    rangeToHighlight: range,
  }));
}

export function findRanges(element, patternsToFind) {
  return patternsToFind.flatMap((pattern) => search(element, pattern));
}
