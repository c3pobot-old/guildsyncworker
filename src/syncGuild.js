'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const swgohClient = require('./client')
const calcRosterStats = require('./calcRosterStats')
const formatPlayer = require('./formatPlayer')
const formatGuild = require('./formatGuild')
const getPlayer = async(playerId)=>{
  try{
    let obj = await swgohClient('player', {playerId: playerId})
    if(!obj || !obj?.rosterUnit) return
    let stats = calcRosterStats(obj.rosterUnit, obj.allyCode)
    if(!stats || !stats.omiCount) return
    obj = { ...obj, ...stats }
    formatPlayer(obj)
    if(!obj.gp) return
    mongo.set('playerCache', { _id: obj.playerId }, obj)
    return obj
  }catch(e){
    throw(e)
  }
}
const getPlayers = async(members = [])=>{
  try{
    let res = [], players = [], i = members.length
    const getMember = async(playerId)=>{
      try{
        let player = await getPlayer(playerId)
        if(player) players.push(player)
      }catch(e){
        log.error(e)
      }
    }
    while(i--) res.push(getMember(members[i].playerId))
    await Promise.all(res)
    return players
  }catch(e){
    throw(e)
  }
}
module.exports = async(obj = {})=>{
  try{
    if(!obj.sync || !obj._id) return
    log.info('Performing sync for '+obj._id+'...')
    let guild = await swgohClient('guild', { guildId: obj._id, includeRecentGuildActivityInfo: true })

    log.info('pulled guild '+guild?.guild?.profile?.name+' from client...')
    if(!guild?.guild || !guild?.guild?.member || guild?.guild?.member.length === 0) return
    guild = guild.guild
    guild.member = guild.member.filter(x=>x.memberLevel > 1)
    if(guild.member.length === 0) return
    let members = await getPlayers(guild.member)
    log.info('pulled '+members?.length+' from client')
    if(guild.member.length !== members?.length) return
    formatGuild(guild, members)
    await mongo.rep('guildCache', {_id: guild.id}, guild)
    guild = null
    members = null
    log.info('Completed sync for '+obj._id+'...')
  }catch(e){
    throw(e)
  }
}
