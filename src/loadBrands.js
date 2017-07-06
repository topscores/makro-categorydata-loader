import fs from 'fs'
import { csv2brands, createCategory, sleep } from './utils'

// Path relative to where yarn is called
const brandCSVFile = './data/brandsmall.csv'

console.log('Start loading brands')
let mapping = ''
let successCount = 0
let errors = ''
let errorCount = 0
csv2brands(brandCSVFile)
  .then(brands => {
    return brands.reduce((promise, brand) => {
      return promise.then(() => {
        return createCategory(brand)
          .then(json => {
            console.log(`${brand.oldId},${json.data.id}`)
            mapping += `${brand.oldId},${json.data.id}\r\n`
            successCount++
          })
          .catch(error => {
            console.log(error)
            errors += `${error}\r\n`
            errorCount++
          })
      })
    }, sleep(500))
  })
  .then(() => {
    fs.writeFileSync('logs/brand-mapping.txt', mapping)
    fs.writeFileSync('logs/brand-errors.txt', errors)
    console.log(`Successfully import: ${successCount}`)
    console.log(`Failed to import: ${errorCount}`)
  })
