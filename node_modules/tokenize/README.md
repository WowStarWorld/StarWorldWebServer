# tokenize [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]
> JavaScript tokenizer

## Example:
```javascript
var tokenize = require('tokenize');
tokenize('dad cat', [{type: "variable", regex: /[a-z]+/},{type:"whitespace", regex: /\s/}], function(err,results){
})
```


[downloads-image]: http://img.shields.io/npm/dm/tokenize.svg 
[npm-url]: https://npmjs.org/package/tokenize
[npm-image]: http://img.shields.io/npm/v/tokenize.svg

[travis-url]: https://travis-ci.org/bifodus/tokenize 
[travis-image]: http://img.shields.io/travis/bifodus/tokenize.svg

[coveralls-url]: https://coveralls.io/r/bifodus/tokenize 
[coveralls-image]: http://img.shields.io/coveralls/bifodus/tokenize/master.svg
