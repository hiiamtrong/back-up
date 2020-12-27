print('sku\tdescription\tdiffQuantity\tdiffCogs')
const today = moment('2020-12-24')
const isSavor = (outlet) => _.get(outlet, 'code', 'W').match(/^[SB]\d+/)
const startTime = moment(today).subtract(1, 'day').startOf('day')
const endTime = moment(today).subtract(1, 'day').endOf('day')
const outlets = db.outlets.find({ code: /^[EMDBG]\d+/ }).toArray()
const savorOutlets = db.outlets.find({ code: /^S\d+/ }).toArray()
const inventoryCountItems = db.inventorycounts.aggregate()
    .match({
        'items.counts.time': {
            $gte: moment(startTime).toDate(),
            $lte: moment(endTime).toDate(),
        },
        status: { $in: ['done', 'ongoing'] },
        $or: [
            { outlet: { $in: _.map(outlets, '_id') } },
            {
                outlet: { $in: _.map(savorOutlets, '_id') },
                name: /(Kiểm hàng trà sữa|Kiểm hàng hàng ngày|checklist)/gim,
            },
        ],
    })
    .unwind('$items')
    .match({
        'items.counts.time': {
            $gte: moment(startTime).toDate(),
            $lte: moment(endTime).toDate(),
        },
        'items.status': { $nin: ['matched', 'counting'] },
    })
    .lookup({
        from: 'outlets',
        as: 'outlet',
        localField: 'outlet',
        foreignField: '_id',
    })
    .unwind('$outlet')
    .lookup({
        from: 'products',
        as: 'items.product',
        localField: 'items.product',
        foreignField: '_id',
    })
    .unwind('$items.product')
    .addFields({
        inventoryCount: '$_id',
    }).forEach(inventoryCountItem => {
        if (_.get(inventoryCountItem.items, 'counts.length', 2) === 1) {
            return
        }
        const item = inventoryCountItem.items
        const outlet = inventoryCountItem.outlet
        const diffQuantity =
            _.get(_.last(item.counts), 'countQuantity', 0) -
            _.get(_.last(item.counts), 'expectedQuantity', 0)
        if (diffQuantity === 0) {
            return
        }
        const diffCogs = Math.abs(diffQuantity) * _.get(item, 'product.cogs', 0)
        if (isSavor(outlet) && diffCogs <= 20000) {
            return
        }
        print(`${item.sku}\t${item.description}\t${diffQuantity}\t${diffCogs}`)
    })

