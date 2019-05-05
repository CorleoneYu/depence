let str = 'node_modules/.bin/node_modules/autoprefixer'
let str2 = '../.bin/autoprefixer'

let regexp = /node_modules/;

console.log(str.match(regexp));
console.log(str2.match(regexp));
