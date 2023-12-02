import plugin from "../../lib/plugins/plugin.js"
import cfg from "../../lib/config/config.js"
import { createRequire } from "module"

const require = createRequire(import.meta.url)
const { exec } = require("child_process")

export class Restart extends plugin {
  constructor (e = "") {
    super({
      name: "重启",
      dsc: "#重启",
      event: "message",
      priority: 10,
      rule: [{
        reg: "^#重启$",
        fnc: "restart",
        permission: "master"
      }, {
        reg: "^#(停机|关机)$",
        fnc: "stop",
        permission: "master"
      }]
    })

    if (e) this.e = e

    this.key = "Yz:restart"
  }

  init() {
    Bot.once("online", () => this.restartMsg())
    if (cfg.bot.restart_time) {
      this.e = {
        logFnc: "[自动重启]" ,
        reply: msg => Bot.sendMasterMsg(msg),
      }
      setTimeout(() => this.restart(), cfg.bot.restart_time*60000)
    }
  }

  async restartMsg() {
    let restart = await redis.get(this.key)
    if (restart) {
      restart = JSON.parse(restart)
      const time = (Date.now() - (restart.time || Date.now()))/1000
      const msg = `重启成功：耗时${time}秒`

      if (restart.id) {
        if (restart.isGroup)
          Bot.sendGroupMsg(restart.bot_id, restart.id, msg)
        else
          Bot.sendFriendMsg(restart.bot_id, restart.id, msg)
      } else {
        Bot.sendMasterMsg(msg)
      }
      redis.del(this.key)
    }
  }

  async restart() {
    await this.e.reply("开始执行重启，请稍等...")
    logger.mark(`${this.e.logFnc} 开始执行重启，请稍等...`)

    let data = JSON.stringify({
      isGroup: !!this.e.isGroup,
      id: this.e.isGroup ? this.e.group_id : this.e.user_id,
      bot_id: this.e.self_id,
      time: Date.now()
    })

    let npm = await this.checkPnpm()

    try {
      await redis.set(this.key, data, { EX: 120 })
      let cm = `${npm} start`
      if (process.argv[1].includes("pm2")) {
        cm = `${npm} run restart`
      }

      exec(cm, { windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          redis.del(this.key)
          this.e.reply(`操作失败！\n${error.stack}`)
          logger.error(`重启失败\n${error.stack}`)
        } else if (stdout) {
          logger.mark("重启成功，运行已由前台转为后台")
          logger.mark(`查看日志请用命令：${npm} run log`)
          logger.mark(`停止后台运行命令：${npm} stop`)
          process.exit()
        }
      })
    } catch (error) {
      redis.del(this.key)
      let e = error.stack ?? error
      this.e.reply(`操作失败！\n${e}`)
    }

    return true
  }

  async checkPnpm() {
    let npm = "npm"
    let ret = await this.execSync("pnpm -v")
    if (ret.stdout) npm = "pnpm"
    return npm
  }

  async execSync(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr })
      })
    })
  }

  async stop() {
    if (!process.argv[1].includes("pm2")) {
      logger.mark("关机成功，已停止运行")
      await this.e.reply("关机成功，已停止运行")
      process.exit()
    }

    logger.mark("关机成功，已停止运行")
    await this.e.reply("关机成功，已停止运行")

    let npm = await this.checkPnpm()
    exec(`${npm} stop`, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        this.e.reply(`操作失败！\n${error.stack}`)
        logger.error(`关机失败\n${error.stack}`)
      }
    })
  }
}