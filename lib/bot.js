import "./config/init.js"
import cfg from "./config/config.js"
import PluginsLoader from "./plugins/loader.js"
import ListenerLoader from "./listener/loader.js"
import { EventEmitter } from "events"
import express from "express"
import http from "http"
import { WebSocketServer } from "ws"
import _ from "lodash"

export default class Yunzai extends EventEmitter {
  constructor() {
    super()
    this.uin = []
    this.adapter = []
    this.express = express()
    this.server = http.createServer(this.express)
    this.server.on("upgrade", (req, socket, head) => {
      this.wss.handleUpgrade(req, socket, head, conn => {
        conn.id = `${req.connection.remoteAddress}-${req.headers["sec-websocket-key"]}`
        this.makeLog("mark", `${logger.blue(`[${conn.id} <=> ${req.url}]`)} 建立连接：${JSON.stringify(req.headers)}`)
        conn.on("error", logger.error)
        conn.on("close", () => this.makeLog("mark", `${logger.blue(`[${conn.id} <≠> ${req.url}]`)} 断开连接`))
        conn.on("message", msg => this.makeLog("debug", `${logger.blue(`[${conn.id} => ${req.url}]`)} 消息：${String(msg).trim()}`))
        conn.sendMsg = msg => {
          if (typeof msg == "object")
            msg = JSON.stringify(msg)
          this.makeLog("debug", `${logger.blue(`[${conn.id} <= ${req.url}]`)} 消息：${msg}`)
          return conn.send(msg)
        }
        for (const i of this.wsf[req.url.split("/")[1]] || [])
          i(conn, req, socket, head)
      })
    })
    this.wss = new WebSocketServer({ noServer: true })
    this.wsf = {}
  }

  makeLog(level, msg) {
    logger[level](_.truncate(msg, { length: cfg.bot.logLength }))
  }

  em(name = "", data = {}) {
    if (data.self_id)
      Object.defineProperty(data, "bot", { value: Bot[data.self_id] })
    while (true) {
      this.emit(name, data)
      const i = name.lastIndexOf(".")
      if (i == -1) break
      name = name.slice(0, i)
    }
  }

  async run() {
    if(cfg.debug.stdin){await import("./plugins/stdin.js")}else{logger.mark(`[lib] 标准输入已被禁用，如需使用请在${process.cwd()}/config/config/debug.yaml配置(重启生效)`)}
    await PluginsLoader.load()
    await ListenerLoader.load()
    this.serverLoad()
    this.emit("online", this)
  }

  serverLoad() {
      if(cfg.debug.adapter){
    this.express.use(req => {
      logger.mark(`${logger.blue(`[${req.ip} => ${req.url}]`)} HTTP ${req.method} 请求：${JSON.stringify(req.headers)}`)
      req.res.redirect("https://github.com/TimeRainStarSky/Yunzai")
    })

    this.server.listen(cfg.bot.port, () => {
      const host = this.server.address().address
      const port = this.server.address().port
      logger.mark(`启动HTTP服务器：http://[${host}]:${port}`)
      logger.mark('ws连接地址(本地)：')
      for (const i of Object.keys(this.wsf))
        console.log(`${logger.green(`[${i}]`)} ws://localhost:${port}/${i}`)
      logger.mark('-----------') 
    })}
  }

  getFriendArray() {
    const array = []
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].fl || [])
        array.push({ ...i, bot_id })
    return array
  }

  getFriendList() {
    const array = []
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].fl || [])
        array.push(id)
    return array
  }

  getFriendMap() {
    const map = new Map
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].fl || [])
        map.set(id, { ...i, bot_id })
    return map
  }
  get fl() { return this.getFriendMap() }

  getGroupArray() {
    const array = []
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].gl || [])
        array.push({ ...i, bot_id })
    return array
  }

  getGroupList() {
    const array = []
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].gl || [])
        array.push(id)
    return array
  }

  getGroupMap() {
    const map = new Map
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].gl || [])
        map.set(id, { ...i, bot_id })
    return map
  }
  get gl() { return this.getGroupMap() }
  get gml() {
    const map = new Map
    for (const bot_id of this.uin)
      for (const [id, i] of this[bot_id].gml || [])
        map.set(id, i)
    return map
  }

  pickFriend(user_id) {
    user_id = Number(user_id) || String(user_id)
    const user = this.fl.get(user_id)
    if (user) return this[user.bot_id].pickFriend(user_id)
    logger.error(`获取用户对象失败：找不到用户 ${logger.red(user_id)}`)
  }
  get pickUser() { return this.pickFriend }

  pickGroup(group_id) {
    group_id = Number(group_id) || String(group_id)
    const group = this.gl.get(group_id)
    if (group) return this[group.bot_id].pickGroup(group_id)
    logger.error(`获取群对象失败：找不到群 ${logger.red(group_id)}`)
  }

  pickMember(group_id, user_id) {
    const group = this.pickGroup(group_id)
    if (group) return group.pickMember(user_id)
  }

  sendFriendMsg(bot_id, user_id, msg) {
    try {
      if (!bot_id)
        return this.pickFriend(user_id).sendMsg(msg)

      if (this[bot_id])
        return this[bot_id].pickFriend(user_id).sendMsg(msg)

      return new Promise(resolve =>
        this.once(`connect.${bot_id}`, data =>
          resolve(data.bot.pickFriend(user_id).sendMsg(msg))))
    } catch (err) {
      logger.error(`${logger.blue(`[${bot_id}]`)} 发送好友消息失败：[$${user_id}] ${err}`)
    }
    return false
  }

  sendGroupMsg(bot_id, group_id, msg) {
    try {
      if (!bot_id)
        return this.pickGroup(group_id).sendMsg(msg)

      if (this[bot_id])
        return this[bot_id].pickGroup(group_id).sendMsg(msg)

      return new Promise(resolve =>
        this.once(`connect.${bot_id}`, data =>
          resolve(data.bot.pickGroup(group_id).sendMsg(msg))))
    } catch (err) {
      logger.error(`${logger.blue(`[${bot_id}]`)} 发送群消息失败：[$${group_id}] ${err}`)
    }
    return false
  }

  async getFriendMsg(fnc = () => true) {
    if (typeof fnc != "function") {
      const { self_id, user_id } = fnc
      fnc = data => data.self_id == self_id && data.user_id == user_id
    }

    while (true) {
      const msg = await new Promise(resolve => {
        this.once("message", data => {
          if (data.message && fnc(data)) {
            let msg = ""
            for (const i of data.message)
              if (i.type = "text")
                msg += i.text.trim()
            resolve(msg)
          } else {
            resolve(false)
          }
        })
      })
      if (msg) return msg
    }
  }

  getMasterMsg() {
    return this.getFriendMsg(data =>
      cfg.master[data.self_id]?.includes(String(data.user_id)))
  }

  sendMasterMsg(msg) {
    for (const bot_id in cfg.master)
      for (const user_id of cfg.master[bot_id])
        this.sendFriendMsg(bot_id, user_id, msg)
  }

  makeForwardMsg(msg) { return { type: "node", data: msg } }

  async sendForwardMsg(send, msg) {
    const messages = []
    for (const { message } of msg)
      messages.push(await send(message))
    return messages
  }
}