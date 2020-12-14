const outlets = db.outlets.find({}).map(it => it)
const outletMap = {}
_.forEach(outlets, outlet => {
    outletMap[outlet._id] = outlet
})
db.users.find({
    $and: [{ roles: 'user' }, { roles: { $nin: ['outlet', 'inactive'] } }]
}).forEach(it => {
    const outlet = outletMap[it.outlet]
    const data = [it.displayName, it.code, outlet ? outlet.code : 'Không có', it.cellphone, it.email, it.position]
    print(data.join('\t'))
})