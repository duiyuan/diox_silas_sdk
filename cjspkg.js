const fs = require('fs')
const path = require('path')
fs.writeFileSync(
  path.resolve('lib', 'commonjs', 'package.json'),
  JSON.stringify({
    type: 'commonjs',
  }),
)
