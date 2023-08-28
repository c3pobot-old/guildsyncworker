'use strict'
const log = require('logger')
const mongo = require('mongoclient')
const syncGuild = require('./syncGuild')
const swgohClient = require('./client')
const fetch = require('./fetch')
const path = require('path')
const updateGameData = require('./updateGameData')

const sleep = (ms = 5000)=>{
  return new Promise(resolve=>{
    setTimeout(resolve, ms)
  })
}
const CheckMongo = ()=>{
  let status = mongo.status()
  if(status){
    CheckAPI()
    return
  }
  setTimeout(CheckMongo, 5000)
}
const CheckAPI = async()=>{
  try{
    let res = await swgohClient('metaData')
    if(res?.latestGamedataVersion){
      log.info('API ready...')
      CheckGameData()
      return
    }
    log.info('API not ready...')
    setTimeout(CheckAPI, 5000)
  }catch(e){
    log.error(e)
    setTimeout(CheckAPI, 5000)
  }
}
const CheckGameData = async()=>{
  try{
    let status = await updateGameData()
    if(status){
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
    setTimeout(SyncGuilds, 5000)
  }catch(e){
    log.error(e)
    setTimeout(SyncGuilds, 5000)
  }
}
CheckMongo()
