'use strict'

module.exports = tokenize;
module.exports.simple = simple;

function tokenize(string, types, cb) {
  var results = [],
      match,
      token,
      regex,
      badTokens = [],
      err = null,
      runningIndex = 0,
      typesLength = types.length,
      biggestMatch,
      currTypes,
      nextIndex,
      len = types.length,
      runningString = string;

  //find and set the next match for each type
  for(var i = 0; i < typesLength; i++){
    types[i].nextMatch = types[i].regex.exec(string);
  }

  while(runningString) {
    //get all tokens at the current index
    currTypes = types.filter(function(element){
      if(element.nextMatch && element.nextMatch.index === 0)
        return true;
    });

    //if there are tokens at the current index, push the biggest one to results and set the
    //running index equal to the current running index plus the length of the biggest match.
    //then, shift all indices to the left by the length of the biggest match.
    if(currTypes.length){
      biggestMatch = getBiggestMatch(currTypes);
      results.push({
        type: biggestMatch.type,
        value: biggestMatch.nextMatch[0],
        index: runningIndex
      });
      runningIndex += biggestMatch.nextMatch[0].length;
      shiftIndices(types, biggestMatch.nextMatch[0].length);
    }

    //otherwise, the string between the current running index and the next match is a bad token
    //and will be pushed to the bad tokens array.  we then set the running index equal to the next
    //smallest index.
    else {
      nextIndex = getSmallestIndex(types) || (string.length - runningIndex);

      if(!err){
        err = [];
      }
      err.push({
        value: runningString.slice(0, nextIndex),
        index: runningIndex
      });
      runningIndex += nextIndex;
      shiftIndices(types, nextIndex);
    }
    runningString = string.substr(runningIndex);

    //find new matches starting at the current index
    for(var j = 0; j < len; j++) {
      if(types[j].nextMatch && types[j].nextMatch.index < 0){
        types[j].nextMatch = types[j].regex.exec(runningString);
      }
    }
  }

  return cb(err, results);
}

function shiftIndices(types, shift) {
  var len = types.length;
  for(var i = 0; i < len; i++){
    if(types[i].nextMatch){
      types[i].nextMatch.index = types[i].nextMatch.index - shift;
    }
  }
}

function getBiggestMatch(types) {
  var biggest = 0,
      biggestType = null,
      len = types.length,
      currLength;

  for(var i = 0; i < len; i++){
    if((currLength = types[i].nextMatch[0].length) > biggest){
      biggestType = types[i];
      biggest = currLength;
    }
  }

  return biggestType;
}

function getSmallestIndex(types) {
  var smallest = Infinity,
      len = types.length;

  for(var i = 0; i < len; i++) {
    if(types[i].nextMatch && types[i].nextMatch.index < smallest)
      smallest = types[i].nextMatch.index;
  }

  return isFinite(smallest) ? smallest : null;
}

function simple(string, specs, cb) {
  specs = specs.concat().map(normalizeSpecs);

  var results = [],
      match,
      err = null,
      runningIndex = 0,
      len = specs.length,
      runningString = string,
      i,
      type;

  while(runningString) {
    match = null;
    for(i=0;i<len;i++){
      type = specs[i];
      match = type.regex.exec(runningString);
      if(match)break;
    }

    if(!match){
      err = new Error('Found error at index ' + (runningIndex));
      break;
    }

    match = match[0];

    runningString = string.substring(runningIndex + match.length);

    results.push({
      type: type.type,
      value: match,
      index: runningIndex
    });

    runningIndex += match.length;
  }

  if(typeof cb === 'function')cb(err, results);
  else
    if(err)throw err;
    else return results;
}

function normalizeSpecs(spec){
  var source = spec.regex.source;

  if(source.indexOf('^') !== 0)source = '^' + source;

  return {
    regex: new RegExp(source),
    type: spec.type
  };
}
