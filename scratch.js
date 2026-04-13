const { fuzzyScore } = require('./server/utils/fuzzyMatch.js');
console.log("Score for delhhi vs delhi:", fuzzyScore('delhhi', 'delhi'));
