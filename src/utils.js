import csv2json from 'csvtojson'
import 'isomorphic-fetch'
import { MAKRO_CATEGORIES_MS, MAKRO_PRODUCT2_MS } from './config'

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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

// create catDb obj from csv
export const csv2catDb = (
  csvFile,
  type,
  parentIdCol, // 99 if this is root cat
  idCol,
  nameEnCol,
  nameThCol
) => {
  const catDb = {}
  return new Promise((resolve, reject) => {
    csv2json({ noheader: true })
      .fromFile(csvFile)
      .on('csv', row => {
        const cat = {
          type,
          oldId: row[idCol],
          parentOldId: parentIdCol === 99 ? -1 : row[parentIdCol],
          name_en: row[nameEnCol],
          name_th: row[nameThCol],
          slug: autoslug(row[nameEnCol]),
        }
        catDb[row[idCol]] = cat
      })
      .on('done', error => {
        if (error) {
          reject(error)
        } else {
          resolve(catDb)
        }
      })
  })
}

export const createCategoriesFromCSV = (
  csvFile,
  type,
  parentIdCol, // 99 if this is root cat
  idCol,
  nameEnCol,
  nameThCol,
  parentCatDb = null
) => {
  return new Promise((resolve, reject) => {
    csv2catDb(csvFile, type, parentIdCol, idCol, nameEnCol, nameThCol)
      .then(catDb => {
        let successCount = 0
        let mapping = ''
        let errors = ''
        let errorCount = 0
        const catids = Object.keys(catDb)
        return catids
          .reduce((promise, catid) => {
            const tmpcat = catDb[catid]
            const cat = {
              ...tmpcat,
              parent_id:
                parentCatDb === null
                  ? null
                  : parentCatDb[tmpcat.parentOldId].id,
            }
            return promise.then(() => {
              return createCategory(cat)
                .then(json => {
                  catDb[catid]['id'] = json.data.id
                  console.log(`${catid},${json.data.id}`)
                  mapping += `${catid},${json.data.id}\r\n`
                  successCount++
                })
                .catch(error => {
                  errors += `${error}\r\n`
                  errorCount++
                })
            })
          }, sleep(500))
          .then(() => {
            const result = {}
            result.mapping = mapping
            result.successCount = successCount
            result.errors = errors
            result.errorCount = errorCount
            result.catDb = catDb
            resolve(result)
          })
      })
      .catch(error => {
        console.log(error)
      })
  })
}

// create brand array from csv file
export const csv2brands = csvFile => {
  const brands = []
  return new Promise((resolve, reject) => {
    csv2json({ noheader: true })
      .fromFile(csvFile)
      .on('csv', row => {
        const brand = {
          type: 'brand',
          oldId: row[0],
          name_th: row[1],
          name_en: row[2],
          slug: autoslug(row[2]),
        }
        brands.push(brand)
      })
      .on('done', error => {
        if (error) {
          reject(error)
        } else {
          resolve(brands)
        }
      })
  })
}

// create categories tree from csv file
export const csv2catTree = csvFile => {
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
    .then(response => {
      if (!response.ok) {
        if (response.statusText === 'Data is duplicate') {
          const newCategory = { ...category }
          newCategory.running =
            newCategory.running === undefined ? 0 : newCategory.running + 1
          newCategory.slug = `${autoslug(
            newCategory.name_en
          )}${newCategory.running}`
          console.log(newCategory)
          return createCategory(newCategory)
        }
        throw new Error(`${JSON.stringify(category)}${response.statusText}`)
      }
      return response.json()
    })
    .catch(error => Promise.reject(error))
}

export const encodeKey = (inputkey, length = 8) => {
  let alphabet =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let encodedKey = ''
  let key = `${md5(inputkey)}${length}`
  key = key.substr(0, length)
  alphabet = `${alphabet}${alphabet}`

  for (let i = 0; i < key.length; i++) {
    alphabet += alphabet
    const int_alpha = key.charCodeAt(i)
    alphabet = alphabet.substr(int_alpha)
    encodedkey = `${encodedkey}${alphabet.substr(0, 1)}`
  }

  return $encodedkey
}

export const getCDNKey = () => {
  return fetch(`${CDN_API_URL}/apis/getkey?service_id=${CDN_SERVICE_ID}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Cannot get CDN key')
      }
      return response.json()
    })
    .then(json => json.data.key)
    .catch(error => Promise.reject(error))
}
export const uploadFile = file => {}

export const csv2bindInfo = csvFile => {
  const bindInfos = []
  return new Promise((resolve, reject) => {
    csv2json({ noheader: true })
      .fromFile(csvFile)
      .on('csv', row => {
        const bindInfo = {
          item_id: row[0],
          content_id: row[1],
          old_category_id: row[2],
          category_id: row[3],
          categories_type: row[4],
          content_type: 'product',
        }
        bindInfos.push(bindInfo)
      })
      .on('done', error => {
        if (error) {
          reject(error)
        } else {
          resolve(bindInfos)
        }
      })
  })
}

export const addContentToCategory = bindInfo => {
  if (bindInfo.category_id === '-1') {
    return Promise.resolve()
  }
  return fetch(`${MAKRO_CATEGORIES_MS}/categories/content`, {
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(bindInfo),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`${JSON.stringify(bindInfo)}${response.statusText}`)
      }
      return response.json()
    })
    .catch(error => Promise.reject(error))
}

export const updateHaveCategoriesStatus = bindInfo => {
  if (bindInfo.category_id === '-1' || bindInfo.categories_type === 'brand') {
    return Promise.resolve()
  }
  return fetch(`${MAKRO_PRODUCT2_MS}/products/${bindInfo.content_id}`, {
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({ have_categories: 'Y' }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`${JSON.stringify(bindInfo)}${response.statusText}`)
      }
      return response.json()
    })
    .catch(error => Promise.reject(error))
}
