const rolesAbby =  ['sale', 'rank-a', 'Nhân viên đóng gói', 'đóng gói', 'kho']
const businessAbby = 'SAVOR'
const rolesSavor =   ['sale', 'rank-a', 'Nhân viên đóng gói', 'đóng gói', 'kho', 'kitchen']
const businessSavor = 'ABBY'


const date = moment() // Ngày xem, ví dụ xem thông tin của ngày 31/08/2020 :  moment("2020-08-31")



const NUMBER_OF_SHIFTS_PER_WEEK_ABBY = 3
const NUMBER_OF_SHIFTS_PER_WEEK_SAVOR = 4
const NUMBER_OF_SHIFTS_PER_WEEK_KHO = 4
const NUMBER_OF_SHIFTS_PER_WEEK_DG = 5
const NUMBER_OF_SHIFTS_PER_WEEK_B1 = 6
const NUMBER_OF_SHIFTS_PER_WEEK_B2 = 5
const NUMBER_OF_SHIFTS_PER_WEEK_B3 = 4
let startDate = moment(date)
    .subtract(1, 'week')
    .startOf('isoWeek')
let endDate = moment(date)
    .subtract(1, 'week')
    .endOf('isoWeek')
const staffsFromSaleReport = db.salereports.aggregate([
    {$match:{
        date: { $gte: startDate.toDate(), $lte: endDate.toDate() } 
    }},
    {$unwind:"$staffs"},
    {$lookup:{
        from: 'users',
        localField: 'staffs',
        foreignField: '_id',
        as: 'staff',
    }},
    {$unwind:"$staff"},
    {$lookup:{
         from: 'outlets',
        localField: 'staff.outlet',
        foreignField: '_id',
        as: 'outlet',
    }},
    {$unwind:"$outlet"},
    {$group:{
         _id: '$staffs',
          count: { $sum: 1 },
          outlet: { $push: `$outlet.code` },
    }}
]).toArray()
const shiftReportOutlets = db.outlets.find({
    code: {
      $in: [
        'D1',
        'D2',
        'D3',
        'D4',
        'D7',
        'D8',
        'D9',
        'G1',
        'G2',
        'G3',
        'G7',
        'G8',
        'G9',
        'B1',
        'B2',
        'B3',
      ],
    },
  }).select({_id:1}).toArray()
const staffDGAndKho = db.shiftreports.aggregate([
    {$match:{
        date: { $gte: startDate.toDate(), $lte: endDate.toDate() },
        hadOverTime: false,
        outlet: { $in: _.map(shiftReportOutlets, "_id") },
    }},
    {$unwind:"$staffs"},
    {$lookup:{
        from: 'users',
        localField: 'staffs',
        foreignField: '_id',
        as: 'staff',
    }},
    {$unwind:"$staffs"},
    {$lookup:{
        from: 'outlets',
        localField: 'staff.outlet',
        foreignField: '_id',
        as: 'outlet',
    }},
    {$unwind:"$outlet"},
    {$group:{
        _id: '$staffs',
        count: { $sum: 1 },
        outlet: { $push: `$outlet.code` },
    }}
]).toArray()
const filterSaleStaffs = _.filter(staffsFromSaleReport, staff => {
    if (_.head(staff.outlet).match(/^[SK]\d+/)) {
      return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_SAVOR
    }
    return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_ABBY
  })
const filterShiftStaffs = _.filter(staffDGAndKho, staff => {
    if (_.head(staff.outlet) === 'G1') {
        staff.actualShift = NUMBER_OF_SHIFTS_PER_WEEK_DG
      return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_DG
    } else if (_.head(staff.outlet) === 'B1') {
          staff.actualShift = NUMBER_OF_SHIFTS_PER_WEEK_B1
      return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_B1
    } else if (_.head(staff.outlet) === 'B2') {
          staff.actualShift = NUMBER_OF_SHIFTS_PER_WEEK_B2
      return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_B2
    } else if (_.head(staff.outlet) === 'B3') {
          staff.actualShift = NUMBER_OF_SHIFTS_PER_WEEK_B3
      return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_B3
    }
      staff.actualShift = NUMBER_OF_SHIFTS_PER_WEEK_KHO
    return staff.count >= NUMBER_OF_SHIFTS_PER_WEEK_KHO
  })
let staffIds = _.map(_.flattenDeep(_.concat(filterSaleStaffs, filterShiftStaffs)), '_id')
const mapCounts = _.reduce(
    _.flattenDeep(_.concat(staffsFromSaleReport, staffDGAndKho)),
    (result, user) => {
      result[user._id.valueOf()] = _.add(result[user._id.valueOf()], user.count) || user.count
      return result
    },
    {}
  )
const usersRetireInLastWeek = db.users.aggregate([
    {$unwind:"$retireRequests"},
    {$match:{
        'retireRequests.action': 'agree',
        'retireRequests.retireDate': {
        $gte: moment(date)
            // .weekday(1)
          .subtract(1, 'week')
          .toDate(),
        $lt: endDate.toDate(),
    }}},
    {$group:{
        _id: '$_id',
    }}
]).toArray()
let users =  db.users.aggregate([
    {$match:{
        roles: {
      $nin: ['inactive', 'deleted', 'tro-ly'],
    },
        created: { $lt: startDate.toDate() },
        _id: { $nin: _.map(usersRetireInLastWeek,'_id') },
    }},
    {$lookup:{
        from: 'outlets',
        localField: 'outlet',
        foreignField: '_id',
        as: 'outlet',
    }},
    {$unwind:'$outlet'},
    {$project:{displayName:1, roles:1, outlet:1, code:1,  slack_id:1, business:1}}
]).toArray()
let getUsersWithRole = function(roles, users) {
  let legitUsers = _.filter(
    users,
    user =>
      user.roles &&
      user.roles.length &&
      !_.includes(user.roles, 'no-ticket') &&
      !_.includes(user.roles, 'outlet')
  )
  return _.filter(
    legitUsers,
    user => _.includes(user.roles, roles) || _.intersection(roles, user.roles).length > 1
  )
}
let usersSaleRankA_Abby = getUsersWithRole(rolesAbby, users)
let usersSaleRankA_Savor=  getUsersWithRole(rolesSavor, users)
const bussinessABBY = db.businesses.findOne({code:businessAbby})._id
const bussinessSAVOR = db.businesses.findOne({code:businessSavor})._id
    usersSaleRankA_Abby = _.reject(usersSaleRankA_Abby, user => {
      return (
        _.invoke(user, 'business.equals', bussinessABBY) ||
        _.get(user.outlet, 'code', 'W').match(/^[BSK]\d+/) ||
        _.intersection(user.roles, ['tro-ly', 'outlet', 'flexi-time']).length ||
        _.includes(['OFFICE', 'HC'], _.get(user.outlet, 'code', ''))
      )
    })
    usersSaleRankA_Savor = _.reject(usersSaleRankA_Savor, user => {
      return (
        _.invoke(user, 'business.equals', bussinessSAVOR) ||
        !_.get(user.outlet, 'code', 'W').match(/^[BSK]\d+/) ||
        _.intersection(user.roles, ['tro-ly', 'outlet', 'flexi-time']).length ||
        _.includes(['OFFICE','HC'], _.get(user.outlet, 'code', ''))
      )
    })
const usersSale = [...usersSaleRankA_Abby,...usersSaleRankA_Savor]
let usersWithInsufficientNumberShifts = _.reject(usersSale, user =>
    _.some(staffIds, id => _.isEqual(id, user._id))
  )
print("code\tshiftCount\t\actualShift\tdisplayName\t\t\t\t\toutlet")
usersWithInsufficientNumberShifts.sort((a,b)=>{
    return ('' + a.outlet.code).localeCompare(b.outlet.code);
})
usersWithInsufficientNumberShifts.forEach((it)=>{
    print(it.code,"\t",_.get(mapCounts,it._id.valueOf(),0),"\t\t\t",it.displayName,"\t\t\t\t",it.outlet.code)
})