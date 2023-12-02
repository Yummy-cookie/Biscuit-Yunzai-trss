import EventListener from '../listener/listener.js'
import cfg from '../config/config.js'

/**
 * 监听上线事件
 */
export default class onlineEvent extends EventListener {
  constructor () {
    super({
      event: 'online',
      once: true
    })
  }

  async execute () {
    logger.mark('-----------')
  }
}