'use strict'
const log = require('logger')
const path = require('path')
const fetch = require('../fetch')
let STAT_URI = process.env.STAT_URI
if(STAT_URI) STAT_URI = path.join(STAT_URI, 'api?flags=percentVals,calcGP,statIDs,gameStyle')
log.info(STAT_URI)
const updateStatCalcUnit = require('./updateStatCalcUnit')

module.exports = async(rosterUnit = [], allyCode)=>{
  try{
    if(process.env.STAT_URI && rosterUnit?.length > 0){
      let res = { zetaCount: 0, sixModCount: 0, omiCount: { total: 0, tb: 0, tw: 0, gac: 0, conquest: 0 }}
      let unitStats = await fetch(STAT_URI, rosterUnit)
      if(!unitStats?.body) throw('Error caculcating stats for '+allyCode)
      unitStats = unitStats.body
      let i = rosterUnit.length
      while(i--){
        if(!unitStats[rosterUnit[i].definitionId?.split(':')[0]]) continue
        rosterUnit[i] = {...rosterUnit[i],...unitStats[rosterUnit[i].definitionId?.split(':')[0]]}
        rosterUnit[i].sort = (+rosterUnit[i].currentTier || 0) + (+rosterUnit[i].relic?.currentTier || 0) + ((+rosterUnit[i].gp || 0) / 100000000)
        delete rosterUnit[i].stats.gp
        let stats = updateStatCalcUnit(rosterUnit[i])
        if(stats?.zetaCount) res.zetaCount += stats.zetaCount
        if(stats?.omiCount){
          res.omiCount.total += stats.omiCount.total
          res.omiCount.tb += stats.omiCount.tb
          res.omiCount.tw += stats.omiCount.tw
          res.omiCount.gac += stats.omiCount.gac
          res.omiCount.conquest += stats.omiCount.conquest
        }
        if(stats?.sixModCount) res.sixModCount += stats.sixModCount
      }
      return res
    }
  }catch(e){
    log.error(e)
    throw(e)
  }
}
