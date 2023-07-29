'use strict'
const { gameData } = require('../gameData')
const enumOmiType = {
  5: 'tb',
  6: 'tb',
  7: 'tb',
  8: 'tw',
  9: 'gac',
  11: 'conquest',
  14: 'gac',
  15: 'gac'
}
module.exports = (unit = {})=>{
  try{
    if(gameData?.data?.unitData && gameData?.data?.unitData[unit.baseId]){
      let res = {zetaCount: 0, omiCount: {total: 0, tb: 0, tw: 0, gac: 0, conquest: 0}, sixModCount: 0}
      let unitData = gameData?.data?.unitData[unit.baseId]
      if(unitData){
        unit.combatType = unitData.combatType
        for(let i in unit.skill){
          const skillData = unitData.skills?.find(x=>x.id === unit.skill[i].id)
          if(skillData?.zetaTier && (unit.skill[i].tier + 2) >= skillData.zetaTier) res.zetaCount++;
          if(skillData?.omiTier && (unit.skill[i].tier + 2) >= skillData?.omiTier){
            res.omiCount.total++;
            let omiType = enumOmiType[skillData.omicronMode]
            if(omiType && res.omiCount[omiType] >= 0) res.omiCount[omiType]++
          }
        }
      }
      for(let i in unit.equippedStatMod){
        if(gameData?.data?.modDefData[unit.equippedStatMod[i].definitionId].rarity === 6) res.sixModCount++;
      }
      return res
    }
  }catch(e){
    throw(e)
  }
}
