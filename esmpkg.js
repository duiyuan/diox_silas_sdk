const fs = require('fs')
const path = require('path')
fs.writeFileSync(
  path.resolve('lib', 'esm', 'package.json'),
  JSON.stringify({
    type: 'module',
  }),
)
