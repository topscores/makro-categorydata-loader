import csv2json from 'csvtojson'
import 'isomorphic-fetch'
import { MAKRO_CATEGORIES_MS } from './config'

// Autogen slug from name_en
export const autoslug = name_en => {
  return name_en
    .toLowerCase()
    .replace(/\//, '') // remove slash
    .replace(/\&/, '') // remove &
    .replace(/\s\s+/, ' ') // replace multiple spaces with single space
    .replace(/ /g, '-') // replace space with -
    .replace(/_/g, '-') // replace _ with -
}

// create categories tree from csv file
export const csv2tree = csvFile => {
  const catTree = {}
  return new Promise((resolve, reject) => {
    csv2json({ noheader: true })
      .fromFile(csvFile)
      .on('csv', row => {
        // Categories level 0
        const cat0 = {
          type: 'product',
          oldId: row[0],
          name_en: row[1],
          name_th: row[2],
          slug: autoslug(row[1]),
          children: {},
        }
        if (catTree[cat0.oldId] === undefined) {
          catTree[cat0.oldId] = cat0
        }

        // Categories level 1
        const cat1 = {
          type: 'product',
          oldId: row[3],
          name_en: row[4],
          name_th: row[5],
          slug: autoslug(row[4]),
          children: {},
        }
        if (catTree[cat0.oldId]['children'][cat1.oldId] === undefined) {
          catTree[cat0.oldId]['children'][cat1.oldId] = cat1
        }

        // Categories level 2
        const cat2 = {
          type: 'product',
          oldId: row[6],
          name_en: row[7],
          name_th: row[8],
          slug: autoslug(row[7]),
        }
        if (
          catTree[cat0.oldId]['children'][cat1.oldId]['children'][
            cat2.oldId
          ] === undefined
        ) {
          catTree[cat0.oldId]['children'][cat1.oldId]['children'][
            cat2.oldId
          ] = cat2
        }
      })
      .on('done', error => {
        if (error) {
          reject(error)
        } else {
          resolve(catTree)
        }
      })
  })
}

// call categories ms to create new categories
export const createCategory = category => {
  return fetch(`${MAKRO_CATEGORIES_MS}/categories`, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(category),
  })
    .then(response => response.json())
    .catch(error => console.log(error))
}
