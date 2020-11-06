const tags = [
    "SX B1 Sáng",
    "SX B1 Chiều",
    "SX B2",
    "Direct B1",
    "SX B2",
    "SX B1 Chiều",
    "SX B1 Sáng",
    "SX 5h",
    "Direct CS",
    "Restock B3",
    "Buying B3",
    "Restock B1",
    "Buying Sáng",
    "Restock B2",
    "Restock B2 Sáng",
    "SX CS",
    "Buying B1",
    "Raw B1",
    "Level 1",
]

const products = db.products.find({ deleted: false, notBuying: false, tags: { $in: tags } }).toArray()
const outlets = db.outlets.find({ code: /[SB]\d+/ }).toArray()
const sxoutlets = db.outlets.find({ code: /[B]\d+/ }).toArray()
const sales = db.saleentries.aggregate().match({
    status: 'closed',
    created: { $gte: moment().subtract(3, 'day').toDate() }, outlet: { $in: outlets.map(it => it._id) }
}).unwind('$order.items').group({
    _id: '$order.items.product',
    quantity: { $sum: '$order.items.quantity' }
}).match({
    _id: { $in: products.map(it => it._id) }
}).toArray()
const saleMap = _.reduce(sales, (result, sale) => {
    result[sale._id] = sale.quantity
    return result
}, {})
const stockMap = db.stockmaps.findOne({}).stockMap

const intransits = db.stockentries.aggregate().match({
    currentStatus: 'delivered',
    created: { $gte: moment().subtract(3, 'day').toDate() },
    destination: { $in: outlets.map(it => it._id) }
}).unwind('$items').group({
    _id: '$items.product',
    quantity: { $sum: '$items.quantity' }
}).match({
    _id: { $in: products.map(it => it._id) }
}).toArray()
const intransitMap = _.reduce(intransits, (result, intransit) => {
    result[intransit._id] = intransit.quantity
    return result
}, {})

const produtions = db.pltasks.aggregate().match({
    status: 'created',
    created: { $gte: moment().subtract(3, 'day').toDate() },
    outlet: { $in: sxoutlets.map(it => it._id) }
}).group({
    _id: '$product',
    quantity: { $sum: '$orderQuantity' }
}).toArray()

const produtionMap = _.reduce(produtions, (result, prodution) => {
    result[prodution._id] = prodution.quantity
    return result
}, {})

const buyings = db.buyingentries.aggregate().match({
    "status": { "$in": ["created", "ordered", "received"] },
    created: { $gte: moment().subtract(3, 'day').toDate() },
    destination: { $in: outlets.map(it => it._id) }
}).unwind('$items').group({
    _id: '$items.product',
    quantity: { $sum: '$items.arrivingQuantity' }
}).match({
    _id: { $in: products.map(it => it._id) }
}).toArray()

const buyingMap = _.reduce(buyings, (result, buying) => {
    result[buying._id] = buying.quantity
    return result
}, {})

products.forEach(it => {
    const productStock = stockMap[''+it._id]
   const totalStock = _.reduce(outlets, (result, outlet) => {
       return result + _.get(productStock, outlet.code, 0)
   }, 0)
   const sale = saleMap[it._id] || 0
   const intransit = intransitMap[it._id]|| 0
   const production = produtionMap[it._id]|| 0
   const buying = buyingMap[it._id]|| 0
   const data = [it.sku, it.description, sale / 3, totalStock, intransit, production, buying]
   print(data.join('\t'))
})