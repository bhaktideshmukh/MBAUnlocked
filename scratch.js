const text = 'hello \\* world \\- test \\[ bracket \\] \\\\ slash';
const result = text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~])/g, '$1');
console.log(result);
