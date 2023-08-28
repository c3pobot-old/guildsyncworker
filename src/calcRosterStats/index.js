'use strict'
const log = require('logger')
const statCalc = require('statcalc')

module.exports = (rosterUnit = [], allyCode)=>{
  try{
    if(!rosterUnit || rosterUnit.length === 0) throw(`${allyCode} has no units`)
    let profile = statCalc.calcRosterStats(rosterUnit)
    if(!profile.summary) throw(`${allyCode} roster stat calc error..`)
    let res = { zetaCount: profile.summary.zeta, sixModCount: profile.summary.mod.r6, omiCount: profile.summary.omi, roster: profile.roster, summary: profile.summary}
    res.omiCount.gac = profile.summary.omi.ga
    res.omiCount.conquest = profile.summary.omi.cq
    return res
  }catch(e){
    log.error(e)
    throw(e)
  }
}
