print('sku\tdescription\tprice\tcogs\ttypeGroup\ttag\tTT cat')

const wareHouseGroup = _.reduce(db.warehousegroups.find().toArray() , (result , group)=>{
    result[group._id] = group
    return result
} , {}) 
const department = _.reduce(db.productdepartments.find().toArray() , (result , group)=>{
    result[group._id] = group
    return result
} , {}) 

const mooncakeMap = _.reduce(db.mooncakecategories.find().toArray() , (result , group)=>{
    result[group._id] = group
    return result
} , {}) 

const notBuying = false
db.products.find({
    deleted : false,
    notBuying : notBuying,
    business : db.businesses.findOne({code : 'ABBY'})._id
})
   .sort({_id:-1})
   .forEach(product=>{
            const LEnearest = db.stockentries.findOne({
                'items.sku':product.sku
            }).sort({created:-1}).limit(1).toArray()
            print(LEnearest[0].type)
    //       let typeGroup = '2. Non-food'
    //         if (_.get(product, 'category') && _.get(product, 'category.department')) {
    //           if (department[product.category.department].name === 'Nguyên liệu làm bánh') typeGroup = '1. Food'
    //         }
    //         if (_.get(product, 'warehouseGroup')) {
    //           if (
    //             wareHouseGroup[product.warehouseGroup].name === 'Tủ đông' ||
    //             wareHouseGroup[product.warehouseGroup].name === 'Tủ mát'
    //           )
    //             typeGroup = '3. Hàng lạnh'
    //         }
    //         let mooncake = ''
    //         if (product.mooncakeCategory){
    //             mooncake = mooncakeMap[product.mooncakeCategory].name
    //         }
    //   const content= [product.sku, product.description, product.price, product.cogs, typeGroup,product.tag,mooncake]
    //   print(content.join('\t'))
   })

