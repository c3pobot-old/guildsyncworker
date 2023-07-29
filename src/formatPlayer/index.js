'use strict'
const CalcGearQuality = require('./calcGearQuality')
const CalcModQuality = require('./calcModQuality')
module.exports = (obj)=>{
  try{
    obj.updated = Date.now()
    obj.gp = +(obj.profileStat.find(x=>x.nameKey === 'STAT_GALACTIC_POWER_ACQUIRED_NAME').value)
    obj.gpChar = +(obj.profileStat.find(x=>x.nameKey === 'STAT_CHARACTER_GALACTIC_POWER_ACQUIRED_NAME').value)
    obj.gpShip = +(obj.profileStat.find(x=>x.nameKey === 'STAT_SHIP_GALACTIC_POWER_ACQUIRED_NAME').value)
    obj.quality = {
      mods: CalcModQuality(obj.rosterUnit.filter(x=>x.combatType == 1), 9999),
      top: CalcModQuality(obj.rosterUnit.filter(x=>x.combatType == 1), 80),
      gear: CalcGearQuality(obj.rosterUnit, obj.gp)
    }
    obj.allyCode = +obj.allyCode

    obj.arena = {
      char:{
        rank: '',
        squad: []
      },
      ship:{
        rank: '',
        squad: []
      }
    }
    if(obj.pvpProfile){
      const charObj = obj.pvpProfile.find(x=>x.tab === 1)
      const shipObj = obj.pvpProfile.find(x=>x.tab === 2)
      if(charObj){
        obj.arena.char.rank = charObj.rank || 0
        if(charObj.squad) obj.arena.char.squad = charObj.squad.cell || []
      }
      if(shipObj){
        obj.arena.ship.rank = shipObj.rank || 0
        if(shipObj.squad) obj.arena.ship.squad = shipObj.squad.cell || []
      }
    }
    if(obj.pvpProfile) delete obj.pvpProfile;
  }catch(e){
    throw(e);
  }
}
