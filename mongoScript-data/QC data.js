const startDate = moment('2020-08-31').startOf('day').toDate()
const endDate = moment('2020-09-06').endOf('day').toDate()

let outletAbby = db.outlets.find({code:{$regex:/[ME]\d+/}}).toArray()
outletAbby = _.map(outletAbby,'_id')
let outletSavor = db.outlets.find({code:{$regex:/[S]\d+/}}).toArray()
outletSavor = _.map(outletSavor,'_id')

const photoReports = db.photoreports.aggregate().match({
    created: {
        $gte: startDate,
        $lte: endDate
    }
    ,
    $or: [{
        'images.comment': { $exists: true },
    }, {
        'notes.content': { $exists: true },
    }, {
        'comment': { $exists: true }
    }]
}).lookup({
    from: 'outlets',
    localField: 'outlet',
    foreignField: '_id',
    as: 'outlet'
})
    .unwind('$outlet').lookup({
        from: 'users',
    localField: 'user',
    foreignField: '_id',
    as: 'user'
        
    }).unwind('$user')
    .lookup({
        from: 'users',
    localField: 'checkedBy',
    foreignField: '_id',
    as: 'checkedBy'
        
    }).unwind('$checkedBy')
const diveByBusiness = {
    abby:[],
    savor:[]
}

photoReports.forEach(it => {
        const imageNote = _.reduce(it.images, (result, image) => {
            if (!image.comment) {
                return result
            }
            return `${result} | ${_.get(image, 'comment', '').replace(/(\n|\t)/gim, '')}`
        }, '')
        const note = _.reduce(it.notes, (result, note) => {
            if (!note.content) {
                return result
            }
            
            return `${result} | ${_.get(note, 'content', '').replace(/(\n|\t)/gim, '')}`
        }, '')
        
        
        const data = [moment(it.created).format('YYYY/MM/DD HH:mm'), it.outlet.code, imageNote, note, _.get(it, 'comment', '').replace(/(\n|\t)/gim, ''), it.checkedBy.code || "Chưa kiểm tra"]
        if(_.some(outletAbby,outlet=> _.isEqual(outlet,it.outlet._id))){
            data.push('abby')
            diveByBusiness['abby'].push(data)
        }else{
                        data.push('savor')
            diveByBusiness['savor'].push(data)
        }
    })
    _.forEach(diveByBusiness,it=>{
        it.forEach(out=>{
            print(out.join('\t'))
        })
    })