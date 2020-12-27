print('outlet\tcreated\tsku\tdescription\tquantity\tlinkLE\tnote\tprice\tcogs\tsalecodeID')

const link = "https://work.4-handy.com/#!/stock-entries/"
const outlets = db.outlets.find({ business: { $eq: db.businesses.findOne({ code: 'ABBY' })._id } }).toArray()
const mapOutlet = _.reduce(outlets, (result, outlet) => {
    result[outlet._id.toString()] = outlet.code
    return result
}, {})

db.stockentries.aggregate()
    .match({
        type: 'trash',
        created: {
            $gte: moment('2020-12-08').startOf('day').toDate(),
            $lte: moment('2020-12-14').endOf('day').toDate()
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
        console.log(`${outlet}\t${moment(it.created).format("L")}\t${item.sku}\t${item.description}\t${item.quantity}\t=HYPERLINK("${link}${it._id.valueOf()}";"${it.stockEntryId}")\t${item.note.replace(/(\s|\n)/g,' ')}\t${item.saleCodeId ? item.saleCodeId : ""}\t${item.price}\t${item.cogs}`)
    })