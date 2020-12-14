const users = db.users.find({ roles: 'trainee' }).toArray()
const shiftReports = db.shiftreports.aggregate([
    {
        $match: {
            'employees.staff': { $in: _.map(users, '_id') },
            created: {
                $gte: moment().subtract(3, 'months').startOf('day').toDate(),
            },
        }
    }, {
        $unwind: '$employees'
    }, {
        $lookup: {
            from: 'users',
            localField: 'employees.staff',
            foreignField: '_id',
            as: 'employees.staff',
        }
    }, {
        $unwind: '$employees.staff'
    }, {
        $match: {
            'employees.staff.roles': 'trainee'
        }
    }, {
        $group: {
            _id: '$employees.staff._id',
            count: { $sum: 1 },
            staff: { $first: '$employees.staff' },
        }
    },
    {
        $lookup: {
            from: 'outlets',
            localField: 'staff.outlet',
            foreignField: '_id',
            as: 'outlet',
        }
    }, {
        $unwind: '$outlet'
    }, {
        $project: {
            _id: 1,
            count: 1,
            displayName: '$staff.displayName',
            outletCode: '$outlet.code',
            code: '$staff.code',
            roles: '$staff.roles',
            created: '$staff.created',
        }
    }
]).toArray()
const saleReports = db.salereports.aggregate([
    {
        $match: {
            'employees.staff': { $in: _.map(users, '_id') },
            created: {
                $gte: moment().subtract(3, 'months').startOf('day').toDate(),
            },
        }
    }, {
        $unwind: '$employees'
    }, {
        $lookup: {
            from: 'users',
            localField: 'employees.staff',
            foreignField: '_id',
            as: 'employees.staff',
        }
    }, {
        $unwind: '$employees.staff'
    }, {
        $match: {
            'employees.staff.roles': 'trainee'
        }
    }, {
        $group: {
            _id: '$employees.staff._id',
            count: { $sum: 1 },
            staff: { $first: '$employees.staff' },
        }
    },
    {
        $lookup: {
            from: 'outlets',
            localField: 'staff.outlet',
            foreignField: '_id',
            as: 'outlet',
        }
    }, {
        $unwind: '$outlet'
    }, {
        $project: {
            _id: 1,
            count: 1,
            displayName: '$staff.displayName',
            outletCode: '$outlet.code',
            code: '$staff.code',
            roles: '$staff.roles',
            created: '$staff.created',
        }
    }
]).toArray()
const assitantsWithNumCalendarShift = db.calendarentries.aggregate([
    {
        $match: {
            staff: { $in: _.map(users, '_id') },
        }
    },{
        $lookup:{
             from: 'users',
        localField: 'staff',
        foreignField: '_id',
        as: 'staff',
        }
    },{
        $unwind:'$staff'
    },{
        $match: {
            'staff.roles': 'trainee'
        }
    },
    
    {
            $group:{
        _id: '$staff._id',
        count: { $sum: 1 },
        staff: { $first: '$staff' },
    }
    },
    {
        $lookup:{
              from: 'outlets',
        localField: 'staff.outlet',
        foreignField: '_id',
        as: 'outlet',
        }
    },{
        $unwind:'$outlet'
    },{
            $project:{
        _id: 1,
        count: 1,
        displayName: '$staff.displayName',
        outletCode: '$outlet.code',
        code: '$staff.code',
        roles: '$staff.roles',
        created: '$staff.created',
    }
    }
]).toArray()
let total = _.concat(shiftReports, saleReports,assitantsWithNumCalendarShift)

  total = _.filter(total, (staff) => {
    let numProbationShift = 8
    if (
      staff.roles.includes('CTV') &&
      ['B1', 'G1', 'G2', 'G3', 'D1', 'D2', 'D4', 'D7', 'D8', 'D9'].includes(staff.outletCode)
    ) {
      numProbationShift = 6
    }
    if (staff.roles.includes('tro-ly')) {
      numProbationShift = 16
    }
    if (_.intersection(staff.roles, ['deleted', 'inactive']).length) return false
    if (staff.count >= numProbationShift) return true

    return false
  })
total.forEach(it=>
    print(`${it.code}\t${it.displayName}\t${it.outletCode}\t${moment(it.created).format('DD/MM/YYYY')}\t${it.roles.join(', ')}\t${it.count}`)
)