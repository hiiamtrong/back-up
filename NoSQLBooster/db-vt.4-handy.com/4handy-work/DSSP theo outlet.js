const START_DAY = '2020-06-01'
const END_DAY = '2020-07-30'
const outlets = db.outlets.find({ business: { $eq: db.businesses.findOne({ code: 'ABBY' })._id } }).toArray()
outlets.forEach(outlet => {
    db.saleentries.aggregate()
    .match({
        created: { $gte: moment(START_DAY).startOf('day').toDate(), $lte: moment(END_DAY).endOf('day').toDate() },
        status: { $ne: 'void' },
        outlet: outlet._id
    })
    .unwind('$order.items')
    .group({
        _id: '$order.items.sku',
        count: { $sum: 1 }
    })
    .sort({ count: -1 })
    .limit(100)
    .forEach(item => {
        console.log(`${outlet.code}\t${item._id}\t${item.count}`)
    })
})