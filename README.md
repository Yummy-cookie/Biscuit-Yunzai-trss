[![云崽bot](https://img.shields.io/badge/%E4%BA%91%E5%B4%BD-v3.1.3-black?style=flat-square&logo=dependabot)](https://gitee.com/Yummy-cookie/Yunzai-Bot/) [![Group](https://img.shields.io/badge/群号-950817968-red?style=flat-square&logo=GroupMe&logoColor=white)](https://h5.qun.qq.com/s/hFFOCBqprO) <a href='https://gitee.com/Yummy-cookie/Yunzai-Bot-trss/stargazers'><img src='https://gitee.com/Yummy-cookie/Yunzai-Bot-trss/badge/star.svg?theme=dark' alt='star'></img></a>


# Yunzai-Bot v3
Yunzai-Bot，原神qq群机器人，通过米游社接口，查询原神游戏信息，快速生成图片返回，此版本根据Yunzai+miao+trss结合组成的Yunzai，并不依赖miao-plugin

项目仅供学习交流使用，严禁用于任何商业用途和非法行为

[目前功能(和trss差不多除了支持签到还有其他的)](https://gitee.com/TimeRainStarSky/Yunzai)

[加入聊天群①](https://gitee.com/Yummy-cookie/Yunzai-Bot-trss)

## 使用方法
>环境准备： Windows or Linux，Node.js（[版本至少v16以上](http://nodejs.cn/download/)），[Redis](https://redis.io/docs/getting-started/installation/)

1.克隆项目
```
git clone --depth=1 https://gitee.com/Yummy-cookie/Yunzai-Bot-trss ./Biscuit-Yunzai(TRSS)
#gitee(国内优先)

#git clone --depth=1 https://github.com/Yummy-cookie/Biscuit-Yunzai-trss.git ./Biscuit-Yunzai(TRSS)
github
```
```
cd Biscuit-Yunzai(TRSS) #进入Biscuit-Yunzai目录
```
2.安装[pnpm](https://pnpm.io/zh/installation),装的可以跳过
```
npm install pnpm -g
```
3.安装依赖
```
pnpm install -P
```
4.运行
```
node app
```

5.启动协议端：

<details><summary>go-cqhttp</summary>

下载运行 [go-cqhttp](https://docs.go-cqhttp.org)，选择反向 WebSocket，修改 `config.yml`，以下为必改项：

```
uin: 账号
password: '密码'
post-format: array
universal: ws://localhost:2536/go-cqhttp
```

</details>

<details><summary>ComWeChat</summary>

下载运行 [ComWeChat](https://justundertaker.github.io/ComWeChatBotClient)，修改 `.env`，以下为必改项：

```
websocekt_type = "Backward"
websocket_url = ["ws://localhost:2536/ComWeChat"]
```

</details>

<details><summary>GSUIDCore</summary>

下载运行 [GenshinUID 插件](http://docs.gsuid.gbots.work/#/AdapterList)，GSUIDCore 连接地址 修改为：

```
ws://localhost:2536/GSUIDCore
```

</details>

<details><summary>ICQQ</summary>

[TRSS-Yunzai ICQQ Plugin](../../../Yunzai-ICQQ-Plugin)

</details>

<details><summary>QQBot</summary>

[TRSS-Yunzai QQBot Plugin](../../../Yunzai-QQBot-Plugin)

</details>

<details><summary>QQ频道</summary>

[TRSS-Yunzai QQGuild Plugin](../../../Yunzai-QQGuild-Plugin)

</details>

<details><summary>微信</summary>

[TRSS-Yunzai WeChat Plugin](../../../Yunzai-WeChat-Plugin)

</details>

<details><summary>米游社大别野</summary>

[TRSS-Yunzai mysVilla Plugin](../../../Yunzai-mysVilla-Plugin)

</details>

<details><summary>KOOK</summary>

[TRSS-Yunzai KOOK Plugin](../../../Yunzai-KOOK-Plugin)

</details>

<details><summary>Telegram</summary>

[TRSS-Yunzai Telegram Plugin](../../../Yunzai-Telegram-Plugin)

</details>

<details><summary>Discord</summary>

[TRSS-Yunzai Discord Plugin](../../../Yunzai-Discord-Plugin)

</details>

<details><summary>OPQBot</summary>

下载运行 [OPQBot](https://opqbot.com)，启动参数添加：

```
-wsserver ws://localhost:2536/OPQBot
```

</details>

<details><summary>路由</summary>

[TRSS-Yunzai Route Plugin](../../../Yunzai-Route-Plugin)

</details>

6.设置主人：发送 `#设置主人`，后台日志获取验证码并发送

## 致谢

|                           Nickname                            | Contribution     |
|:-------------------------------------------------------------:|------------------|
|      [Yunzai v3.0](https://gitee.com/le-niao/Yunzai-Bot)      | 乐神的Yunzai-Bot V3 |
|      [Trss-Yunzai](https://gitee.com/TimeRainStarSky/Yunzai)  | 时雨的Trss-Yunzai V3|
| [GardenHamster](https://github.com/GardenHamster/GenshinPray) | 模拟抽卡背景素材来源       |
|      [西风驿站](https://bbs.mihoyo.com/ys/collection/839181)      | 角色攻略图来源          |
|     [米游社友人A](https://bbs.mihoyo.com/ys/collection/428421)     | 角色突破素材图来源        |
| [icqq](https://github.com/icqqjs/icqq) | ICQQ             |


## 其他
- 图片素材来源于网络，仅供交流学习使用
- 严禁用于任何商业用途和非法行为
- 赞助[点我跳转](https://biscuitawa.top/qr.png)(记得备注自己)
