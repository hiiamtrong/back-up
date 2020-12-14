print('saleCodeId\toutlet\tsku\tdescription\tquantity\tcreated\texpiryDate\tNote')
const startDate = moment('2020-01-01').startOf('day').toDate()
const endDate = moment('2020-01-31').endOf('day').toDate()
db.salecodes.aggregate().match({
    created: {
        $gte: startDate,
        $lte: endDate
    }
}).lookup({
    from: 'products',
    localField: 'product',
    foreignField: '_id',
    as: 'product'
})
    .unwind('$product')
    .forEach(it => {
        const outlets = db.outlets.find({_id : {$in : it.outlets}}).toArray()
        const data = [it.saleCodeId,  _.map(outlets , 'code').join(',') ,it.sku, it.description,it.quantity, moment(it.created).format('DD-MM-YYYY'), it.expiryDate ? moment(it.expiryDate).format('DD-MM-YYYY') : 'Không có', it.isLate ? 'Báo muộn' : 'Không']
        print(data.join('\t'))
    })