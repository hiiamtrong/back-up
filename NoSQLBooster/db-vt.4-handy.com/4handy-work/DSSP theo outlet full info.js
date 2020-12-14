print('\outletCode\tsku\tdescription\ttypeGroup\ttag\tTT cat\tprice\tcogs\tnotBuying\torder(lượt bán)')
const START_DAY = '2020-10-01'
const END_DAY = '2020-11-25'
//const outlets = db.outlets.find({ business: { $eq: db.businesses.findOne({ code: 'ABBY' })._id } }).toArray()
const outletCodes = ['M5']
const outlets = db.outlets.find({ code: { $in: outletCodes } }).toArray()
const wareHouseGroup = _.reduce(db.warehousegroups.find().toArray(), (result, group) => {
    result[group._id] = group
    return result
}, {})
const department = _.reduce(db.productdepartments.find().toArray(), (result, group) => {
    result[group._id] = group
    return result
}, {})
outlets.forEach(outlet => {
    db.saleentries.aggregate()
        .match({
            created: { $gte: moment(START_DAY).startOf('day').toDate(), $lte: moment(END_DAY).endOf('day').toDate() },
            status: { $ne: 'void' },
            outlet: outlet._id
        })
        .unwind('$order.items')
        .lookup({
            from: 'products',
            localField: 'order.items.product',
            foreignField: '_id',
            as: 'order.items.product',
        })
        .unwind('$order.items.product')
        .lookup({
            from: 'mooncakecategories',
            localField: 'order.items.product.mooncakeCategory',
            foreignField: '_id',
            as: 'order.items.product.mooncakeCategory',
        })
        .unwind('$order.items.product.mooncakeCategory')
        .group({
            _id: '$order.items.sku',
            description: { $first: '$order.items.description' },
            department: { $first: '$order.items.product.category.department' },
            wareHouseGroup: { $first: '$order.items.product.warehouseGroup' },
            notBuying: { $first: '$order.items.product.notBuying' },
            price: { $first: '$order.items.product.price' },
            cogs: { $first: '$order.items.cogs' },
            count: { $sum: 1 },
            tag:{ $first: '$order.items.product.tag' },
            TTcat:{ $first: '$order.items.product.mooncakeCategory' },
        })
        .sort({ count: -1 })
        .limit(1000)
        .forEach(item => {
            let typeGroup = '2. Non-food'
            if (_.get(item, 'department')) {
                if (department[item.department].name === 'Nguyên liệu làm bánh') { 
                    typeGroup = '1. Food' 
                    
                }
            }
​
            if (_.get(item, 'wareHouseGroup')) {
                if (
                    wareHouseGroup[item.wareHouseGroup].name === 'Tủ đông' ||
                    wareHouseGroup[item.wareHouseGroup].name === 'Tủ mát'
                ) { 
                    typeGroup = '3. Hàng lạnh' 
                }
            }
            console.log(`${outlet.code}\t${item._id}\t${item.description}\t${typeGroup}\t${item.tag }\t${item.TTcat.name}\t${item.price}\t${item.cogs}\t${item.notBuying}\t${item.count}`)
        })
})