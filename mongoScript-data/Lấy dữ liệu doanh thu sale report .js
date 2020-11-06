const startDate = moment('2020-08-28')
const endDate = moment('2020-08-29')
const saleReports = db.salereports
  .aggregate([
    {
      $match: {
        created: {
          $gte: moment(startDate).startOf('day').toDate(),
          $lte: moment(endDate).endOf('day').toDate(),
        },
      },
    },
    {
      $lookup: {
        from: 'outlets',
        localField: 'outlet',
        foreignField: '_id',
        as: 'outlet',
      },
    },
    { $unwind: '$outlet' },
    {
      $project: {
        _id: 1,
        outlet: 1,
        totalRevenue: 1,
        shift: 1,
        employees: 1,
        date: 1,
      },
    },
    {
      $group: {
        _id: '$date',
        saleReports: {
          $push: {
            _id: '$_id',
            outlet: '$outlet.code',
            totalRevenue: '$totalRevenue',
            shift: '$shift',
            employees: '$employees',
            date: '$date',
          },
        },
      },
    },
  ])
  .toArray()
saleReports.forEach((it) => {
  it.saleReports = _.reduce(
    it.saleReports,
    (result, saleReport) => {
      result[saleReport.outlet] = !result[saleReport.outlet]
        ? [].concat([saleReport])
        : result[saleReport.outlet].concat([saleReport])
      return result
    },
    {}
  )
})
// const data = _.map(saleReports,it=>{
//     it.saleReports = (Object.values(it.saleReports))
//     it.saleReports = _.reduce(it.saleReports,(_result,saleReport)=>{
//         _.forEach(saleReport,shift=>{
//             if(!_result[shift.outlet.valueOf()]){
//                 _result[shift.outlet.valueOf()] = {}
//             }
//             _result[shift.outlet.valueOf()].totalRevenue = !_result[shift.outlet.valueOf()] ? shift.totalRevenue : _.sum([_result[shift.outlet.valueOf()].totalRevenue,shift.totalRevenue])
//             _result[shift.outlet.valueOf()].outlet =shift.outlet
//             _result[shift.outlet.valueOf()].totalEmployees = !_result[shift.outlet.valueOf()] ? shift.employees.length : _.sum([_result[shift.outlet.valueOf()].totalEmployees,shift.employees.length])
//             _result[shift.outlet.valueOf()].date =shift.date
//         })
//         return _result
//     },{})
//     return it
// })
print('STT\tCơ sở\t\tShift\t\tDoanh Thu\tNgày\tTông Nhân Viên')
let index = 1
_.forEach(saleReports, (date) => {
  _.forEach(date.saleReports, (outlet) => {
    _.forEach(outlet, (shift) => {
      print(
        `${index}\t${shift['outlet']}\t\t${shift.shift}\t\t${
          shift['totalRevenue']
        }\t\t${moment(shift.date).format('L')}\t\t${
          shift['employees'].length || 0
        }`
      )
      index++
    })
  })
})
