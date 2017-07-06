import fs from 'fs'
import { csv2catDb, sleep, createCategoriesFromCSV } from './utils'

let mapping = ''
let errors = ''
createCategoriesFromCSV(
  'data/prodcat/prodcat0.csv',
  'product',
  99,
  0,
  1,
  2,
  null
)
  .then(result => {
    console.log(result)
    console.log(`[Prodcat0] successfully import: ${result.successCount}`)
    console.log(`[Prodcat0] failed to import: ${result.errorCount}`)
    mapping += result.mapping
    errors += result.errors
    return result
  })
  .then(result => {
    return createCategoriesFromCSV(
      'data/prodcat/prodcat1.csv',
      'product',
      0,
      1,
      2,
      3,
      result.catDb
    )
  })
  .then(result1 => {
    console.log(result1)
    console.log(`[Prodcat1] successfully import: ${result1.successCount}`)
    console.log(`[Prodcat1] failed to import: ${result1.errorCount}`)
    mapping += result1.mapping
    errors += result1.errors
    return result1
  })
  .then(result1 => {
    return createCategoriesFromCSV(
      'data/prodcat/prodcat2.csv',
      'product',
      1,
      2,
      3,
      4,
      result1.catDb
    )
  })
  .then(result2 => {
    console.log(result2)
    console.log(`[Prodcat2] successfully import: ${result2.successCount}`)
    console.log(`[Prodcat2] failed to import: ${result2.errorCount}`)
    mapping += result2.mapping
    errors += result2.errors
    return result2
  })
  .then(() => {
    fs.writeFileSync('logs/prodcat-mapping.txt', mapping)
    fs.writeFileSync('logs/prodcat-errors.txt', errors)
  })
  .catch(error => {
    console.log(error)
  })
