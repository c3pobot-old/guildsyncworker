'use strict'
const log = require('logger')
const fetch = require('./fetch')
const path = require('path')
const CLIENT_URL = process.env.CLIENT_URL

const apiRequest = async(uri, body, count = 0)=>{
  try{
    if(uri){
      const res = await fetch(uri, body, 'POST')
      if((res?.body?.code === 6 && 4 >= count) || (res?.error === 'FetchError' && 4 >= count) || (res?.status === 400 && res?.body?.message && !res?.body?.code && 4 >= count)){
        count++
        return await apiRequest(uri, body, 'POST')
      }
      return res
    }
  }catch(e){
    console.error(e);
  }
}
module.exports = async(uriPath, payload = {}, identity = null)=>{
  try{
    let body = { payload: payload}
    if(identity) body.identity = identity
    let res = await apiRequest(path.join(CLIENT_URL, uriPath), body)
    if(res?.body?.message && res?.body?.code !== 5) log.error(uri+' : Code : '+res.body.code+' : Msg : '+res.body.message)
    if(res?.body) return res.body
    if(res?.error) log.error(uriPath+' : '+res.error+' '+res.type)
  }catch(e){
    throw(e);
  }
}
