/* eslint-disable camelcase */
import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs'
import path from 'path'
import cfg from '../../lib/config/config.js'
import axios from "axios";

let FanSkyGroup= 950817968
let cwd = process.cwd().replace(/\\/g, "/")
let GithubStatic = `${cwd}/resources/Github1/GithubStatic.json`

export class MonitorTask extends plugin {
    constructor() {
        super({
            name: '监控github仓库状态',
            dsc: '监控github仓库状态',
            event: 'message',
            priority: 1,
            rule: [
                {
                    reg: /^#?检测(Yunzai)更新$/,
                    fnc: 'Monitor'
                }
            ]
        })
        this.task = {
            name: 'Yunzai-Bot(饼干)仓库更新检测',
            cron: '0 0/4 * * * ? ',
            fnc: () => {
                this.MonitorTask(true)
            }
        }
    }

    async Monitor(e) {
        await this.MonitorTask(false, e)
    }

    async MonitorTask(Auto = false, e = null) {
        let OpenStatus = JSON.parse(await redis.get(`FanSky:FunctionOFF`));
        if (OpenStatus && OpenStatus.GitHubPush !== undefined) {
            if (OpenStatus.GitHubPush !== 1) return true;
        } else {
            console.error("OpenStatus 为 null 或者缺少 'GitHubPush' 属性");
            return true;
        }

        if (Auto === false) {
            await this.SelectMonitor(e)
            return true
        }
        
        if (await redis.get(`FanSky:Github:PushStatus`)) {
            // logger.info(logger.magenta("已存在推送进程"))
            return true
        } else {
            await redis.set(`FanSky:Github:PushStatus`, JSON.stringify({PushStatus: 1}));
            await redis.expire(`FanSky:Github:PushStatus`, 60 * 4 - 5);
        }

        // 其余代码...
    }

    async SelectMonitor(e) {
        const res = await axios.get('https://api.github.com/repos/Yummy-cookie/Yunzai-Bot/commits')
        const data = res.data
        if (!data[0]) return
        let Json = data[0]
        logger.info(logger.magenta('>>>手动检测Yunzai-Bot(饼干)仓库最新代码'))
        let UTC_Date = Json.commit.committer.date
        const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai', hour12: false})
        await e.reply(`[Yunzai-Bot(饼干)最近更新]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`)
        return true
    }
}
