const fs = require('fs')
const path = require('path')
const { serialize } = require('@jscad/stl-serializer')
const { main } = require('./guard.js')

// Generate the geometry from the guard model
const geometry = main()

// Serialize to STL format (binary)
const stlData = serialize({ binary: true }, geometry)

// Write to file
const outputPath = path.join(__dirname, 'guard.stl')
fs.writeFileSync(outputPath, Buffer.from(stlData))

console.log(`✓ STL file generated: ${outputPath}`)
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`)
