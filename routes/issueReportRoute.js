const express = require('express');
const router = express.Router()
const Machine = require('../models/Machine')
const Issue = require('../models/Issue')
const SMS = require('../models/SMS')
const moment = require('moment');
const { machine } = require('os');

router.get('/reports/leaderboard/:id', async (req, res) => {
    try{
        const { id } = req.params
        let completedIssues = await Issue.find({
            status: 'complete'
        })

        if(id == 0){
            let currentMonth = moment(moment.now()).month()
            completedIssues = completedIssues.filter(issue =>{
                return moment(issue.fixedAt).month() == currentMonth
            })
        }else if(id == 1){
          let currentDay = moment(moment.now()).day()
          let currentMonth = moment(moment.now()).month()
          completedIssues = completedIssues.filter(issue =>{
            return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
        })
        }else if(id == 2){
          let currentDate = moment(moment().format('YYYY-MM-DD'))
          let twoDaysAgo = moment(moment().subtract(2,'days').format('YYYY-MM-DD'))

          completedIssues = completedIssues.filter(issue =>{
            return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
          })

        }else if(id == 3){
          let currentDate = moment(moment().format('YYYY-MM-DD'))
          let oneWeekAgo = moment(moment().subtract(1,'weeks').format('YYYY-MM-DD'))

          completedIssues = completedIssues.filter(issue =>{
            return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
          })

        }else if(id == 4){
          let currentDate = moment(moment().format('YYYY-MM-DD'))
          let oneMonthAgo = moment(moment().subtract(1,'months').format('YYYY-MM-DD'))

          completedIssues = completedIssues.filter(issue =>{
            return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
          })
        }else if(id == 5){
          const lowerBoundDate = req.headers.lowerbound
          const upperBoundDate = req.headers.upperbound
          if(!lowerBoundDate  || !upperBoundDate){
            return res.status(400).json({
              message: 'Bad Request Lower Bound or Uppper Bound Date is required',
              lowerBoundDate
            }) 
          }

          let start = moment(moment(lowerBoundDate).format('YYYY-MM-DD'))
          let end = moment(moment(upperBoundDate).format('YYYY-MM-DD'))

          completedIssues = completedIssues.filter(issue =>{
            return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
          })
        }


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
      
            avgx = (sumx / list.length).toFixed(2)
            avgxParts = avgx.split('.')
            avgxParts[0] = avgxParts[0] + 'H'
            avgxParts[1] = list.length > 0 ? ((+avgxParts[1] / 100) * 60).toFixed(0) + 'M' : '0M'
      
            holder[key] = avgxParts.join(' ')
          })
      
          let holderSortableArray = []
          for(let key in holder){
            holderSortableArray.push({
              identifier: key,
              value: holder[key]
            })
          }
      
          holderSortableArray.sort((a,b) =>{
            return b.value - a.value
          })

          holderSortableArray = holderSortableArray.slice(0,5)

        
          return res.status(200).json(holderSortableArray)
    }catch(err){
        return res.status(500).json({ error: err.message })
    }
})

router.get('/reports/averages/:id', async (req, res) => {
  const { id } = req.params

  try{
    let completedIssues = await Issue.find({
      status: 'complete'
    })

    let issuesWereInWaitingState = await Issue.find({
      wasInWaitingState: true,
      $nor:[{
        waitingStartTime: null
      },{ WaitingEndTime: null }]
    })

    let issueWereRedirected = await Issue.find({
      wasRedirected: true,
      $nor:[{
        redirectStartTime: null
      }]
    })

    if(id == 0){
      let currentMonth = moment(moment.now()).month()
      completedIssues = completedIssues.filter(issue =>{
          return moment(issue.fixedAt).month() == currentMonth
      })

      issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
        return moment(issue.fixedAt).month() == currentMonth
      })

      issueWereRedirected = issueWereRedirected.filter(issue =>{
        return moment(issue.fixedAt).month() == currentMonth
        && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
      })
  }else if(id == 1){
    let currentDay = moment(moment.now()).day()
    let currentMonth = moment(moment.now()).month()
    completedIssues = completedIssues.filter(issue =>{
      return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
    })

    issueWereRedirected = issueWereRedirected.filter(issue =>{
      return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
    })

    issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
      return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
    })
  }else if(id == 2){
    let currentDate = moment(moment().format('YYYY-MM-DD'))
    let twoDaysAgo = moment(moment().subtract(2,'days').format('YYYY-MM-DD'))

    completedIssues = completedIssues.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
    })

    issueWereRedirected = issueWereRedirected.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
    })

    issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
    })
  }else if(id == 3){
    let currentDate = moment(moment().format('YYYY-MM-DD'))
    let oneWeekAgo = moment(moment().subtract(1,'weeks').format('YYYY-MM-DD'))

    completedIssues = completedIssues.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
    })

    issueWereRedirected = issueWereRedirected.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
    })

    issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
    })

  }else if(id == 4){
    let currentDate = moment(moment().format('YYYY-MM-DD'))
    let oneMonthAgo = moment(moment().subtract(1,'months').format('YYYY-MM-DD'))

    completedIssues = completedIssues.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
    })

    issueWereRedirected = issueWereRedirected.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
    })

    issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
    })
  }else if(id == 5){
    const lowerBoundDate = req.headers.lowerbound
    const upperBoundDate = req.headers.upperbound
    if(!lowerBoundDate || !upperBoundDate){
      return res.status(400).json({
        message: 'Bad Request Lower Bound or Upper Bound Date is required',
        lowerBoundDate
      }) 
    }

    let start = moment(moment(lowerBoundDate).format('YYYY-MM-DD'))
    let end = moment(moment(upperBoundDate).format('YYYY-MM-DD'))

    completedIssues = completedIssues.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
    })

    issueWereRedirected = issueWereRedirected.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      && !(issue.publisher == 'driver' && issue.wasRedirected && issue.fixedBy == 'driver')
    })

    issuesWereInWaitingState = issuesWereInWaitingState.filter(issue =>{
      return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
    })
  }


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
    fraction[1] = issueSolvedHours.length > 0 ? ((+fraction[1] / 100) * 60).toFixed(0) + 'M' : '0M'
    issueSolvedHoursAverage = issueSolvedHours.length > 0 ? fraction.join(' ') : 0

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

      let iswha = issueSolvedWaitingHoursAverage.toString().split('.')
      iswha[0] = iswha[0] + 'H'
      iswha[1]  = issueWaitingHours.length > 0 ?  ((+iswha[1] / 100) * 60).toFixed(0) + 'M' : 0 + 'M'
    
      iswha = iswha.join(' ')
      issueSolvedWaitingHoursAverage = iswha


      let issueRedirectHours = issueWereRedirected.map(iwr =>{
    let end = moment(iwr.fixedAt)
    let start = moment(iwr.redirectStartTime)

    let diff = moment.duration(end.diff(start))
    return diff.asHours()
  })

  issueRedirectHours = issueRedirectHours.filter(Boolean)
  let issueRedirectHoursSum = issueRedirectHours.reduce((sum, hour) => sum + hour, 0)
  let issueRedirectHoursAverage = issueRedirectHours.length > 0 ?
  (issueRedirectHoursSum / issueRedirectHours.length).toFixed(2) : 0
    
  let idhaParts = issueRedirectHoursAverage.toString().split('.')
  idhaParts[0] = idhaParts[0] + 'H'
  idhaParts[1]  = issueRedirectHours.length > 0 ?  ((+idhaParts[1] / 100) * 60).toFixed(0) + 'M' : 0 + 'M'

  idhaParts = idhaParts.join(' ')
  issueRedirectHoursAverage = idhaParts

    return res.status(200).json({
      issueSolvedHoursAverage,
      issueSolvedWaitingHoursAverage,
      issueRedirectHoursAverage,
    })
  }catch(err){
    console.log(err.message);
    return res.status(500).json(err.message)
  }
});

router.get('/reports/general/:id', async (req, res) => {
  const { id } = req.params

  try{
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

    let issuePublishedByDriver = await Issue.find({
      publisher: 'driver'
    })

    let issueSolvedByDriver = await Issue.find({
      fixedBy: 'driver'
    })

    let machines = await Machine.find()
    
    if(id == 0){
      let currentMonth = moment().month()
      completedIssues = completedIssues.filter(issue =>{
          return moment(issue.fixedAt).month() == currentMonth
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'),'month')
      })

      console.log(inCompletedIssues.length);
      issues = issues.filter(issue =>{
        return moment(issue.date).month() == currentMonth
      })


      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(issue.date).month() == currentMonth
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(issue.fixedAt).month() == currentMonth
      })
    }else if(id == 1){
      let currentDay = moment(moment.now()).day()
      let currentMonth = moment(moment.now()).month()
      completedIssues = completedIssues.filter(issue =>{
        return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })

      issues = issues.filter(issue =>{
        return moment(issue.date).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })

      waitingIssues = waitingIssues.filter(issue =>{
        return moment(issue.date).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(issue.date).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })

      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(issue.date).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(issue.fixedAt).day() == currentDay && moment(issue.fixedAt).month() == currentMonth
      })
    }else if(id == 2){
      let currentDate = moment(moment().format('YYYY-MM-DD'))
      let twoDaysAgo = moment(moment().subtract(2,'days').format('YYYY-MM-DD'))

      completedIssues = completedIssues.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })

      issues = issues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })

      waitingIssues = waitingIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })

      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(twoDaysAgo,currentDate,'days','[]')
      })
    }else if(id == 3){
      let currentDate = moment(moment().format('YYYY-MM-DD'))
      let oneWeekAgo = moment(moment().subtract(1,'weeks').format('YYYY-MM-DD'))

      completedIssues = completedIssues.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })

      issues = issues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })

      waitingIssues = waitingIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })

      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneWeekAgo,currentDate,'days','[]')
      })
    }else if(id == 4){
      let currentDate = moment(moment().format('YYYY-MM-DD'))
      let oneMonthAgo = moment(moment().subtract(1,'months').format('YYYY-MM-DD'))

      completedIssues = completedIssues.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })

      issues = issues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })

      waitingIssues = waitingIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })

      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(oneMonthAgo,currentDate,'days','[]')
      })
    }else if(id == 5){
      const lowerBoundDate = req.headers.lowerbound
      const upperBoundDate = req.headers.upperbound
      if(!lowerBoundDate || !upperBoundDate){
        return res.status(400).json({
          message: 'Bad Request Lower Bound or Upper Bound Date is required',
          lowerBoundDate
        }) 
      }

      let start = moment(moment(lowerBoundDate).format('YYYY-MM-DD'))
      let end = moment(moment(upperBoundDate).format('YYYY-MM-DD'))

      completedIssues = completedIssues.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })

      issues = issues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })

      inCompletedIssues = inCompletedIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })

      waitingIssues = waitingIssues.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })

      issuePublishedByDriver = issuePublishedByDriver.filter(issue =>{
        return moment(moment(issue.date).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })

      issueSolvedByDriver = issueSolvedByDriver.filter(issue =>{
        return moment(moment(issue.fixedAt).format('YYYY-MM-DD')).isBetween(start,end,'days','[]')
      })
    }

    let totalActive = machines.reduce((sum,machine) => sum + machine.totalWorkingTime,0)
    let totalOffline = machines.reduce((sum,machine) => sum + machine.totalOfflineTime,0)

    if(totalActive < 1){
      totalActive = (totalActive * 60).toFixed(2).split('.')[0] + 'M'
    }else{
      let parts = totalActive.toString().split('.')
      let hoursPart = parts[0]
      let minutesPart = parts[1]

      totalActive = hoursPart + 'H' + ' ' + ((+((+minutesPart).toFixed(2)) / 100) * 60).toFixed(2).split('.')[0] + 'M'
    }

    if(totalOffline < 1){
      totalOffline = (totalOffline * 60).toFixed(2).split('.')[0] + 'M'
    }else{
      totalOffline = totalOffline.toFixed(0) + 'H'
    }
    return res.status(200).json({
      totalIssues: issues.length,
      waitingIssues: waitingIssues.length,
      completedIssues: completedIssues.length,
      inCompletedIssues: inCompletedIssues.length,
      issuePublishedByDriver: issuePublishedByDriver.length,
      issueSolvedByDriver: issueSolvedByDriver.length,
      totalActive,
      totalOffline
    })

  }catch(e){
    return res.status(500).json(e.message)
  }
});

router.get('/reports/sms/total', async (req, res) => {
  try{
    let smss = await SMS.find()
    return res.status(200).json(smss.length)
  }catch(e){
    return res.status(500).json(e.message)
  }
})

router.get('/reports/repeated', async (req, res) => {
  try{
    let now = moment(moment().format('YYYY-MM-DD'))
    let monthAgo = moment(moment().subtract(1,'months').format('YYYY-MM-DD'))

    let issues = await Issue.find()
    issues = issues.filter(issue => {
      let issueDate = moment(moment(issue.date).format('YYYY-MM-DD'))
      return issueDate.isBetween(monthAgo,now)
    })

    let issueGroupedIntoSerials = issues.reduce((result, item) => {
      const key = item.serial;
      if (key !== undefined && key !== null) {
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item);
      }
      return result;
    }, {});

    let groupsIntoNumbers = []
    for(let key in issueGroupedIntoSerials){
      if(issueGroupedIntoSerials.hasOwnProperty(key) && issueGroupedIntoSerials[key].length > 2){
        groupsIntoNumbers.push({
          serial: key,
          total: issueGroupedIntoSerials[key].length
        })
      }
    }

    return res.status(200).json(groupsIntoNumbers);
  }catch(e){
    return res.status(500).json(e.message)
  }
})
module.exports = router