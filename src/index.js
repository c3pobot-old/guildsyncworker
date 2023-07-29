'use strict'
const log = require('logger')
const mongo = require('mongoapiclient')
const syncGuild = require('./syncGuild')
const swgohClient = require('./client')
const fetch = require('./fetch')
const path = require('path')

const { gameData } = require('./gameData')
const STAT_URI = process.env.STAT_URI

const sleep = (ms = 5000)=>{
  return new Promise(resolve=>{
    setTimeout(resolve, ms)
  })
}
const CheckAPI = async()=>{
  try{
    let res = await swgohClient('metaData')
    if(res?.latestGamedataVersion){
      log.info('API ready...')
      CheckStatCalc()
      return
    }
    log.info('API not ready...')
    setTimeout(CheckAPI, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPI, 5000)
  }
}
const CheckStatCalc = async()=>{
  try{
    let res = await fetch(path.join(STAT_URI, 'readyz'), 'GET')
    if(res?.status){
      log.info('Stat Calc ready...')
      SyncGuilds()
      return
    }
    log.info('Stat Calc not ready...')
    setTimeout(CheckStatCalc, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckStatCalc, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    await updateGameData()
    if(gameData.version){
      SyncGuilds()
      return
    }
    log.info('error updating gameData...')
    setTimeout(CheckGameData, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckGameData, 5000)
  }
}
const updateGameData = async()=>{
  try{
    let obj = (await mongo.find('botSettings', { _id: 'gameData'}))[0]
    if(obj?.version && obj?.data && obj?.version !== gameData?.version){
      gameData.version = obj.version
      gameData.data = obj.data
      log.info('gameData updated to '+gameData.version+'...')
    }
  }catch(e){
    throw(e)
  }
}
const SyncGuilds = async()=>{
  try{
    let guilds = await mongo.find('guilds', { sync: 1 }, {_id: 1, sync: 1})
    if(guilds?.length > 0){
      let i = guilds.length
      log.debug('Found '+i+' guilds to sync...')
      while(i--){
        await syncGuild(guilds[i])
        await sleep()
      }
    }
    await updateGameData()
    setTimeout(SyncGuilds, 5000)
  }catch(e){
    log.error(e)
    setTimeout(SyncGuilds, 5000)
  }
}
CheckAPI()
