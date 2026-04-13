const { fuzzyScore } = require('./server/utils/fuzzyMatch.js');
console.log('Lucknow:', fuzzyScore('unnao', 'lucknow'));
console.log('Kanpur:', fuzzyScore('unnao', 'kanpur'));
console.log('Barabanki:', fuzzyScore('unnao', 'barabanki'));
console.log('Unnao:', fuzzyScore('unnao', 'unnao'));
