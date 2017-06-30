import { csv2catTree, createCategory } from './utils'

// Path relative to where yarn is called
const productCatCSVFile = './data/product-categories.csv'

// Recursively create category and it children categories
const createCategoriesFromTree = (catTree, parentId = null) => {
  const catIds = Object.keys(catTree)
  catIds.forEach(catId => {
    const cat = catTree[catId]
    createCategory({
      type: cat.type,
      name_en: cat.name_en,
      name_th: cat.name_th,
      slug: cat.slug,
      parent_id: parentId,
    })
      .then(json => {
        if (json.status.code === 200) {
          const newCatId = json.data.id
          console.log(`${catId},${newCatId}`)
          const childTree = cat.children
          if (childTree !== undefined) {
            createCategoriesFromTree(childTree, newCatId)
          }
        } else {
          console.log(json)
        }
      })
      .catch(error => {
        console.log(error)
      })
  })
}

console.log('Start loading categories')
csv2catTree(productCatCSVFile)
  .then(catTree => {
    createCategoriesFromTree(catTree)
  })
  .catch(error => {
    console.log(error)
  })
