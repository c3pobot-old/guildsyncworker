'use strict'
const log = require('logger')
const fetch = require('node-fetch');

const parseResponse = async(res)=>{
  try{
    if(res){
      if (res?.status?.toString().startsWith('5')) {
        throw('Bad status code '+res.status)
      }
      let body
      if (res?.status === 204) {
        body = null
      } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
        body = await res?.json()
      } else {
        body = await res?.text()
      }
      return {
        status: res?.status,
        body: body
      }
    }
  }catch(e){
    log.error(e);
  }
}
module.exports = async(uri, body, method = 'POST')=>{
  try{
    let opts = { method: method, timeout: 30000, compress: true, headers: {}}
    if(body){
      opts.body = JSON.stringify(body)
      opts.headers['Content-Type'] = 'application/json'
    }
    let res = await fetch(uri, opts)
    return await parseResponse(res)
  }catch(e){
    if(e.name){
      return {error: e.name, message: e.message, type: e.type}
    }else{
      if(e?.status){
        console.log(e.status)
        return await parseResponse(e)
      }
      console.error(e)
    }
  }
}
