import tracer from 'tracer'
import { MAKRO_CATEGORIES_MS } from './config'
import { csv2tree } from './utils'

// Path relative to where yarn is called
const csvFile = './data/product-categories.csv'
const logger = tracer.console({ level: 'info' })

logger.info('Start loading categories')
csv2tree(csvFile)
  .then(catTree => {
    logger.info(catTree)
  })
  .catch(error => {
    logger.error(error)
  })
