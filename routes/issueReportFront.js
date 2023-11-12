const express = require('express');
const router = express.Router();
const IssueReport = require('../models/IssueReport')
const jwt = require('jsonwebtoken')
const Manager = require('../models/Manager')

const Machine = require('../models/Machine')
const Issue = require('../models/Issue')
const moment = require('moment');
let SMS = require('../models/SMS')

router.get('/reports', async (req, res) => {
  try{
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    let reports = await IssueReport.find()
    res.status(200).render('reports/index',{
        reports: reports.reverse(),
        isAdmin: decoded.role === 'admin',
        permissions: manager.permissions 
    })
  }catch(err){
    console.log(err);
    res.status(500).send(err.message);
  }
});

router.get('/reports/sms', async (req, res) => {
  try {
    let smss = await SMS.find()
    let jwt_access_token = req.cookies.jwt_token
    let decoded = jwt.verify(jwt_access_token,process.env.JWT_SECRET_KEY)
    let manager = await Manager.findOne({ _id: decoded.id })

    return res.status(200).render('reports/sms',{
      smss: smss,
      isAdmin: decoded.role === 'admin',
      permissions: manager.permissions 
    });
  }catch(err){
    return res.status(500).send(err.message)
  }
})

router.get('/reports/dashboard', async (req, res) => {
  let machines = await Machine.find()
  let waitingMachines = await Machine.find({
    status: 'waiting'
  })
  let activeMachines = await Machine.find({
    status: 'active'
  })
  let inActiveMachines = await Machine.find({
    status: 'inactive'
  })

  let issues = await Issue.find()
  let waitingIssues = await Issue.find({
    status: 'waiting'
  })

  let completedIssues = await Issue.find({
    status: 'complete'
  })

  let inCompletedIssues = await Issue.find({
    status: 'incomplete'
  })

  let redirectedIssues = await Issue.find({ status: 'redirected' })

  let issuePublishedByDriver = await Issue.find({
    publisher: 'driver'
  })

  let issueSolvedByDriver = await Issue.find({
    fixedBy: 'driver'
  })

  let issueSolvedHours = completedIssues.map(ic => {
    let end = moment(ic.fixedAt)
    let start = moment(ic.date)

    let diff = moment.duration(end.diff(start))
    return diff.asHours()
  })

  issueSolvedHours = issueSolvedHours.filter(Boolean)
  let issueSolvedHoursSum = issueSolvedHours.reduce((sum, hour) => sum + hour,0)
  let issueSolvedHoursAverage = (issueSolvedHoursSum / issueSolvedHours.length).toFixed(2)
  let fraction = issueSolvedHoursAverage.split('.')
  fraction[0] = fraction[0] + 'H'
  fraction[1] = ((+fraction[1] / 100) * 60).toFixed(2) + 'M'
  issueSolvedHoursAverage = fraction.join(' ')


  let issuesWereInWaitingState = await Issue.find({
    wasInWaitingState: true
  })

  let issueWaitingHours = issuesWereInWaitingState.map(iws => {
    let end = moment(iws.WaitingEndTime)
    let start = moment(iws.waitingStartTime)

    let diff = moment.duration(end.diff(start))
    return diff.asHours()
  })

  issueWaitingHours = issueWaitingHours.filter(Boolean)
  let issueSolvedWaitingHoursSum = issueWaitingHours.reduce((sum, hour) => sum + hour,0)
  let issueSolvedWaitingHoursAverage = issueWaitingHours.length > 0 ? 
    (issueSolvedWaitingHoursSum / issueWaitingHours.length).toFixed(2) : 0

  let issueWereRedirected = await Issue.find({
    wasRedirected: true
  })

  let issueRedirectHours = issueWereRedirected.map(iwr =>{
    let end = moment(iwr.fixedAt)
    let start = moment(iwr.redirectStartTime)

    let diff = moment.duration(end.diff(start))
    return diff.asHours()
  })

  issueRedirectHours = issueRedirectHours.filter(Boolean)
  let issueRedirectHoursSum = issueRedirectHours.reduce((sum, hour) => sum + hour, 0)
  let issueRedirectHoursAverage = issueRedirectHours.length > 0 ?
    (issueRedirectHoursSum / issueRedirectHours.length) : 0

    let reports = (await IssueReport.find()).reverse()
    reports = reports.slice(0,5)





    let issueGroupedIntoDates = completedIssues.reduce((result, item) => {
      let key = item.fixedAt;
      if (key !== undefined && key !== null) {
        key = moment(key).format('YYYY-MM-DD')

        if (!result[key]) {
          result[key] = [];
        }
        let end = moment(item.fixedAt)
        let start = moment(item.date)
        
        let diff = moment.duration(end.diff(start))
        result[key].push(diff.asHours())
        result[key] = result[key].filter(Boolean)
      }
      return result;
    }, {});

    let parsedGroupedDates = []
    for(let key in issueGroupedIntoDates){
      const values = issueGroupedIntoDates[key];
    const sum = values.reduce((acc, value) => acc + value, 0);
    const average = sum / values.length;
    parsedGroupedDates.push({
      date: key,
      value: average.toFixed(2),
    })
    }


    let issues_2 = await Issue.find()
let issuesGroupedIntoMonths = issues_2.reduce((result, item) =>{
  let key = item.date
  if(key !== undefined && key !== null){
    key = moment(key).format('YYYY-MM')
    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(item)
    return result
  }
},{})


Object.keys(issuesGroupedIntoMonths).forEach(key => {
    let issues = issuesGroupedIntoMonths[key]

    let issueGroupedIntoSerials = issues.reduce((result, item) => {
      const key = item.zoneLocation;
      if (key !== undefined && key !== null) {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item);
      }
      return result;
    }, {});

    let groupsIntoNumbers = 0
    for(let key in issueGroupedIntoSerials){
      if(issueGroupedIntoSerials.hasOwnProperty(key) && issueGroupedIntoSerials[key].length >= 5){
        groupsIntoNumbers += Math.floor(issueGroupedIntoSerials[key].length / 5)
      }
    }

    let zoneLocationSet = []

    Object.keys(issueGroupedIntoSerials).forEach(key => {
      zoneLocationSet.push({
        zoneLocation: key,
        repeat: issueGroupedIntoSerials[key].length >= 5 ?  Math.floor(issueGroupedIntoSerials[key].length / 5) : undefined
      })
    })

    console.log(zoneLocationSet);

    issuesGroupedIntoMonths[key] = {
      totalIssues: issuesGroupedIntoMonths[key].length,
      totalRepeated: groupsIntoNumbers,
      zoneLocationSet: zoneLocationSet
    }
})


let issueGroupedIntoIdentifiers = completedIssues.reduce((result, item) => {
  const key = item.fixedByIdentifier;
  if (key !== undefined && key !== null) {
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}, {});



let holder = {}

Object.keys(issueGroupedIntoIdentifiers).forEach((key) =>{
  let list = issueGroupedIntoIdentifiers[key]
  let sumx = list.reduce((sum, item) =>{
    let end = moment(item.fixedAt)
  let start = moment(item.date)



  let diff = moment.duration(end.diff(start))
  return sum + diff.asHours()
  },0)

  avgx = sumx / list.length

  holder[key] = avgx
})

let holderSortableArray = []
for(let key in holder){
  holderSortableArray.push({
    identifier: key,
    value: Math.floor(holder[key])
  })
}


holderSortableArray.sort((a,b) =>{
  return b.value - a.value
})

holderSortableArray = holderSortableArray.slice(0,5)

let combinedCurrentIssues = [
  ...inCompletedIssues,
  ...waitingIssues,
  ...redirectedIssues,
  ...completedIssues
]

let issueGroupedIntoImportance = combinedCurrentIssues.reduce((result, item) => {
  const key = item.importanceLevel;
  if (key !== undefined && key !== null) {
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}, {});

let issueGroupedIntoImportanceValues = []


Object.keys(issueGroupedIntoImportance).map(key => {
  issueGroupedIntoImportance[key] = (((issueGroupedIntoImportance[key].length / combinedCurrentIssues.length)) * 100).toFixed(2)
})


if(issueGroupedIntoImportance.hasOwnProperty('3')){
  issueGroupedIntoImportanceValues.push(+issueGroupedIntoImportance['3'])
}else{
  issueGroupedIntoImportanceValues.push(0)
}

if(issueGroupedIntoImportance.hasOwnProperty('2')){
  issueGroupedIntoImportanceValues.push(+issueGroupedIntoImportance['2'])
}else{
  issueGroupedIntoImportanceValues.push(0)
}

if(issueGroupedIntoImportance.hasOwnProperty('1')){
  issueGroupedIntoImportanceValues.push(+issueGroupedIntoImportance['1'])
}else{
  issueGroupedIntoImportanceValues.push(0)
}


let issues_3 = await Issue.find()
let issuesGroupedIntoDays = issues_3.reduce((result, item) =>{
  let key = item.date
  if(key !== undefined && key !== null){
    key = moment(key).format('YYYY-MM-DD')
    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(item)
    return result
  }
},{})


Object.keys(issuesGroupedIntoDays).forEach(key => {
  let issues = issuesGroupedIntoDays[key]

  let issueGroupedIntoSerials = issues.reduce((result, item) => {
    const key = item.zoneLocation;
    if (key !== undefined && key !== null) {
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  }, {});

  let groupsIntoNumbers = 0
  for(let key in issueGroupedIntoSerials){
    if(issueGroupedIntoSerials.hasOwnProperty(key) && issueGroupedIntoSerials[key].length >= 5){
      groupsIntoNumbers += Math.floor(issueGroupedIntoSerials[key].length / 5)
    }
  }

  let zoneLocationSet = []

  Object.keys(issueGroupedIntoSerials).forEach(key => {
    zoneLocationSet.push({
      zoneLocation: key,
      repeat: issueGroupedIntoSerials[key].length >= 5 ?  Math.floor(issueGroupedIntoSerials[key].length / 5) : undefined
    })
  })

  console.log(zoneLocationSet);

  issuesGroupedIntoDays[key] = {
    totalIssues: issuesGroupedIntoDays[key].length,
    totalRepeated: groupsIntoNumbers,
    zoneLocationSet: zoneLocationSet
  }
})

console.log(issuesGroupedIntoDays);
  return res.render('reports/dashboard',{
    machines: JSON.stringify(machines),
    issues: [...inCompletedIssues,...waitingIssues,...redirectedIssues],
    waitingMachines: waitingMachines.length,
    activeMachines: activeMachines.length,
    inActiveMachines:inActiveMachines.length,
    issueGroupedIntoImportance: JSON.stringify(issueGroupedIntoImportanceValues),
    issueGroupedIntoImportanceTotalIssues: combinedCurrentIssues.length,
    issuesGroupedIntoMonths: JSON.stringify(issuesGroupedIntoMonths),
    issuesGroupedIntoDays: JSON.stringify(issuesGroupedIntoDays),
    holderSortableArray: JSON.stringify(holderSortableArray),

    reports,

    issueGroupedIntoDates,
    parsedGroupedDates: JSON.stringify(parsedGroupedDates)
  })
})

module.exports = router