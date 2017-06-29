import tracer from 'tracer'
import { csv2tree, createCategory } from './utils'

// Path relative to where yarn is called
const csvFile = './data/product-categories.csv'
const logger = tracer.console({ level: 'info' })

logger.info('Start loading categories')
csv2tree(csvFile)
  .then(catTree => {
    const cat0Ids = Object.keys(catTree)

    // For each category0 create category
    cat0Ids.forEach(cat0Id => {
      createCategory({
        type: catTree[cat0Id].type,
        name_en: catTree[cat0Id].name_en,
        name_th: catTree[cat0Id].name_th,
        slug: catTree[cat0Id].slug,
      })
        .then(json => {
          if (json.status.code === 200) {
            const parentId = json.data.id
            console.log(`${cat0Id},${parentId}`)

            // For each category1 create category
            const cat1Ids = Object.keys(catTree[cat0Id].children)
            cat1Ids.forEach(cat1Id => {
              const cat1 = catTree[cat0Id].children
              createCategory({
                type: cat1[cat1Id].type,
                name_en: cat1[cat1Id].name_en,
                name_th: cat1[cat1Id].name_th,
                slug: cat1[cat1Id].slug,
                parent_id: cat0Id,
              })
                .then(json => {
                  if (json.status.code === 200) {
                    const parentId = json.data.id
                    console.log(`${cat1Id},${parentId}`)

                    // For each category2 create category
                    const cat2Ids = Object.keys(cat1[cat1Id].children)
                    cat2Ids.forEach(cat2Id => {
                      const cat2 = cat1[cat1Id].children
                      createCategory({
                        type: cat2[cat2Id].type,
                        name_en: cat2[cat2Id].name_en,
                        name_th: cat2[cat2Id].name_th,
                        slug: cat2[cat2Id].slug,
                        parent_id: cat1Id,
                      })
                        .then(json => {
                          if (json.status.code === 200) {
                            const parentId = json.data.id
                            console.log(`${cat2Id},${parentId}`)
                          } else {
                            logger.error(json)
                          }
                        })
                        .catch(error => logger.error(error))
                    })
                  } else {
                    logger.error(json)
                  }
                })
                .catch(error => logger.error(error))
            })
          } else {
            logger.error(json)
          }
        })
        .catch(error => logger.error(error))
    })
  })
  .catch(error => {
    logger.error(error)
  })
