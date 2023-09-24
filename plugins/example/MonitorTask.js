/* eslint-disable camelcase */
import plugin from '../../lib/plugins/plugin.js';
import fs from 'fs';
import path from 'path';
import cfg from '../../lib/config/config.js';
import axios from "axios";

let biscuitGroup = 374248018;
let cwd = process.cwd().replace(/\\/g, "/");
let GithubStatic = `${cwd}/resources/Github1/GithubStatic.json`;

export class MonitorTask extends plugin {
  constructor() {
    super({
      name: '监控github仓库状态',
      dsc: '监控github仓库状态',
      event: 'message',
      priority: 1,
      rule: [
        {
          reg: /^#?检测Yunzai更新$/,
          fnc: 'Monitor'
        }
      ]
    });
    this.task = {
      name: 'biscuit仓库更新检测',
      cron: '0 0/4 * * * ? ',
      fnc: () => {
        this.MonitorTask(true);
      }
    };
  }

  async Monitor(e) {
    await this.MonitorTask(false, e);
  }

  async MonitorTask(Auto = false, e = null) {
    if (Auto === false) {
      await this.SelectMonitor(e);
      return true;
    }
    let OpenStatus = JSON.parse(await redis.get(`biscuit:FunctionOFF`));
    if (!OpenStatus || OpenStatus.GitHubPush !== 1) return true;
    if (await redis.get(`biscuit:Github:PushStatus`)) {
      // logger.info(logger.magenta("已存在推送进程"))
      return true;
    } else {
      await redis.set(`biscuit:Github:PushStatus`, JSON.stringify({ PushStatus: 1 }));
      await redis.expire(`biscuit:Github:PushStatus`, 60 * 4 - 5);
    }
    const dirPath = path.dirname(GithubStatic);
    fs.mkdirSync(dirPath, { recursive: true });
    if (!fs.existsSync(GithubStatic)) fs.writeFileSync(GithubStatic, '{}');
    let GithubStaticJson = JSON.parse(fs.readFileSync(GithubStatic));
    try {
      const res = await axios.get('https://api.github.com/repos/Yummy-cookie/Yunzai-Bot/commits');
      const data = res.data;
      if (!data[0]) return;
      let Json = data[0];
      if (GithubStaticJson.sha !== Json.sha) {
        GithubStaticJson = Json;
        fs.writeFileSync(GithubStatic, JSON.stringify(GithubStaticJson));
        logger.info(logger.magenta('>>>已更新GithubStatic.json'));
        let UTC_Date = Json.commit.committer.date;
        const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
        let MsgList = [`[Yunzai-Bot(饼干)更新自动推送]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`];
        let acgList = [];
        let bot = { nickname: "Yunzai-Bot(饼干)更新", user_id: Bot.uin };
        acgList.push(
          {
            message: MsgList,
            ...bot,
          },
        );
        let ForMsg = await Bot.makeForwardMsg(acgList);
        try {
          ForMsg.data = ForMsg.data
            .replace(/\n/g, '')
            .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
            .replace(/___+/, '<title color="#777777" size="26">Yunzai-Bot(饼干)插件更新</title>');
        } catch (err) { }
        let MainGroup = Array.from(Bot.getGroupList().keys()).includes(biscuitGroup);
        if (MainGroup) {
          await Bot.pickGroup(Number(biscuitGroup)).sendMsg(ForMsg);
        }
        let list = cfg.masterQQ;
        if (Json.commit.message.includes("[不推送]") || !Json.commit.message) {
          logger.info(logger.magenta('[Yunzai-Bot(饼干)]>>>检测到[不推送]标签，已跳过本次推送'));
          return true;
        }
        let MasterNum = list.length;
        for (let i = 0; i < MasterNum; i++) {
          if ((list[i].toString()).length <= 11) {
            logger.info(logger.magenta(`master:${list[i]}`));
            try {
              await Bot.pickFriend(Number(list[i])).sendMsg(ForMsg);
              break;
            } catch (err) {
              logger.info(`QQ号${list[i]}推送失败，已往下走~`);
            }
          }
        }
      }
    } catch (error) {
      return true;
    }
    return true;
  }

  async SelectMonitor(e) {
    const res = await axios.get('https://api.github.com/repos/Yummy-cookie/Yunzai-Bot/commits');
    const data = res.data;
    if (!data[0]) return;
    let Json = data[0];
    logger.info(logger.magenta('>>>手动检测Yunzai-Bot(饼干)仓库最新代码'));
    let UTC_Date = Json.commit.committer.date;
    const cnTime = new Date(UTC_Date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
    await e.reply(`[Yunzai-Bot(饼干)最近更新]\nContributors：${Json.commit.committer.name}\nDate:${cnTime}\nMessage:${Json.commit.message}\nUrl:${Json.html_url}`);
    return true;
  }
}
