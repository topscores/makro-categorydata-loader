import fs from 'fs'
import { csv2bindInfo, addContentToCategory, sleep } from './utils'

// Path relative to where yarn is called
const prodToProdcat = './data/prod-prodcat.csv'
const prodToBizcat = './data/prod-bizcat.csv'
const prodToBrand = './data/prod-brand.csv'

console.log('Start adding content to category')
let mapping = ''
let successCount = 0
let errors = ''
let errorCount = 0
csv2bindInfo(prodToProdcat)
  .then(bindInfos => {
    return bindInfos.reduce((promise, bindInfo) => {
      return promise.then(() => {
        return addContentToCategory(bindInfo)
          .then(json => {
            console.log(json)
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
  .then(() => csv2bindInfo(prodToBizcat))
  .then(bindInfos => {
    return bindInfos.reduce((promise, bindInfo) => {
      return promise.then(() => {
        return addContentToCategory(bindInfo)
          .then(json => {
            console.log(json)
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
  .then(() => csv2bindInfo(prodToBrand))
  .then(bindInfos => {
    return bindInfos.reduce((promise, bindInfo) => {
      return promise.then(() => {
        return addContentToCategory(bindInfo)
          .then(json => {
            console.log(json)
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
    fs.writeFileSync('logs/content-cat-errors.txt', errors)
    console.log(`Successfully added: ${successCount}`)
    console.log(`Failed to add: ${errorCount}`)
  })
