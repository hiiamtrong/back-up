print('outlet\tcreated\tsku\tdescription\tquantity\tlinkLE\tnote\tsalecodeID\tprice')

const link = "https://work.4-handy.com/#!/stock-entries/"
const outlets = db.outlets.find({ business: { $eq: db.businesses.findOne({ code: 'ABBY' })._id } }).toArray()
 db.businesses.findOne({ code: 'ABBY' })
const mapOutlet = _.reduce(outlets, (result, outlet) => {
    result[outlet._id.toString()] = outlet.code
    return result
}, {})

db.stockentries.aggregate()
    .match({
        type: 'trash',
        created: {
            $gte: moment('2020-11-01').startOf('day').toDate(),
            $lte: moment('2020-11-06').endOf('day').toDate()
        },
        currentStatus: { $ne: 'deleted' },
        outlet: { $in: _.map(outlets, '_id') }
    })
    .sort('created')
    .unwind('$items')
    .forEach(it => {
          let outlet
        if(it.responsibleOutlet){
            outlet = mapOutlet[it.responsibleOutlet]
        }
        if(!outlet){
          outlet  = mapOutlet[`${it.outlet}`]
        }
        const item = it.items
        console.log(`${outlet}\t${moment(it.created).format("YYYY-MM-DD")}\t${item.sku}\t${item.description}\t${item.quantity}\t=HYPERLINK("${link}${it._id.valueOf()}";"${it.stockEntryId}")\t${item.note.replace(/(\s|\n)/g,' ')}\t${item.saleCodeId ? item.saleCodeId : ""}\t${item.price}`)
    })