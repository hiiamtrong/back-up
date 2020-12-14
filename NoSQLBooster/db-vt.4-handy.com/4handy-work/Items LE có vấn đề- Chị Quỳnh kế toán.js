const startDate = moment('2020-11-23')
const endDate = moment('2020-11-24')
const outlet = db.outlets.findOne({ code: "M5" })
const LE = db.stockentries.aggregate([{
    $match: {
        destination: outlet._id,
        'wrongItems.0': {
            $exists: true

        },
        delivered:{
            $gte:moment(startDate).startOf('day').toDate(),
            $lte:moment(endDate).endOf('day').toDate()
        }
    }
}]).toArray()
print('Mã LE\tNgày chuyển\ttrạng thái\tSKU\tTên sản phẩm\tSố kiểm\tSố trên phiếu\tThừa\tthiếu\tVấn đề khác')
LE.forEach(le => {
    le.wrongItems.forEach(item => {
        const result = []
        result.push(le.stockEntryId, moment(le.delivered).format('L'), le.currentStatus, item.sku, item.description, item.countQuantity, item.expectedQuantity, item.extra, item.shortage, item.note)
        print(result.join('\t'))
    })
})
