import fs from 'fs'
import { csv2catDb, sleep, createCategoriesFromCSV } from './utils'

let mapping = ''
let errors = ''
createCategoriesFromCSV(
  'data/bizcat/bizcat0.csv',
  'business',
  99,
  0,
  1,
  2,
  null
)
  .then(result => {
    console.log(result)
    console.log(`[Bizcat0] successfully import: ${result.successCount}`)
    console.log(`[Bizcat0] failed to import: ${result.errorCount}`)
    mapping += result.mapping
    errors += result.errors
    return result
  })
  .then(result => {
    return createCategoriesFromCSV(
      'data/bizcat/bizcat1.csv',
      'business',
      0,
      1,
      2,
      3,
      result.catDb
    )
  })
  .then(result1 => {
    console.log(result1)
    console.log(`[Bizcat1] successfully import: ${result1.successCount}`)
    console.log(`[Bizcat1] failed to import: ${result1.errorCount}`)
    mapping += result1.mapping
    errors += result1.errors
    return result1
  })
  .then(result1 => {
    return createCategoriesFromCSV(
      'data/prodcat/bizcat2.csv',
      'business',
      1,
      2,
      3,
      4,
      result1.catDb
    )
  })
  .then(result2 => {
    console.log(result2)
    console.log(`[Bizcat2] successfully import: ${result2.successCount}`)
    console.log(`[Bizcat2] failed to import: ${result2.errorCount}`)
    mapping += result2.mapping
    errors += result2.errors
    return result2
  })
  .then(() => {
    fs.writeFileSync('logs/bizcat-mapping.txt', mapping)
    fs.writeFileSync('logs/bizcat-errors.txt', errors)
  })
  .catch(error => {
    console.log(error)
  })
