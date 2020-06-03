import { uuid, DomStyleUtils, getCookie, setCookie, timeFormat, utcTime, isXesApp } from '../utils/utils';
import { NavigatorCollect } from '../collects/navigatorCollect';
import md5 from 'md5';
import qs from 'querystringify';
import { appid, appkey, testAppId, testAppKey } from '../config/index';
import { PartialUpdateCommParams, IInitOptions, ICustomParams } from '../utils/interface';
import UrlParser from 'url-parse';

// 上报日志类型
export enum LogType {
  presentation, // 展现日志
  interaction, // 交互日志
  system // 系统日志
}

class SpiderAPI {
  private runInXesApp: boolean = isXesApp();
  private isGotInfoFromXesApp: boolean = false;
  private seq: number = 0;
  private isDebug: boolean = false;
  private showLog: boolean = false;
  private static spiderInstance: SpiderAPI;
  public commonParams: {[key: string]: any} = { // 默认公共参数
    ['user_id']: '',
    ['xes_user_id']: '',
    ['app_clientid']: 'xes1v1Web',
    devid: NavigatorCollect.getDevId(),
    access: NavigatorCollect.getNetworkType(),
    ua: navigator.userAgent,
    resolution: `${window.screen.width}*${window.screen.height}`,
    ['page_view_size']: `${DomStyleUtils.clientWidth()}*${DomStyleUtils.clientHeight()}`,
    ['current_url']: '',
    ['referrer_url']: '',
    origin: '',
    pathname: '',
    query: {},
    hash: '',
    ['xes_app_version_number']: 0,
    ['xes_app_version']: ''
  };

  private constructor() {
    const urlEntity = new UrlParser(location.href);
    this.commonParams['current_url'] = location.href;
    this.commonParams['referrer_url'] = document.referrer;
    this.commonParams.origin = location.origin;
    this.commonParams.pathname = location.pathname;
    this.commonParams.query = urlEntity.query;
    this.commonParams.hash = location.hash;

    if (getCookie('tal_session_id')) {
      this.commonParams['client_session_id'] = getCookie('tal_session_id');
    } else {
      const sessionId = uuid();
      this.commonParams['client_session_id'] = sessionId;
      setCookie('tal_session_id', sessionId, 7*24*60*60);
    }
    // 如果在网校app中打开，通过cookie获取网校用户id
    const netUserId = getCookie('stu_id');
    if (netUserId) {
      this.commonParams['xes_user_id'] = netUserId
    }
  }

  private setXesAppInfo(): void {
    if (this.runInXesApp && !this.isGotInfoFromXesApp && window.xesApp) {
      const info = JSON.parse(window.xesApp.deviceInfo());
      this.commonParams['xes_app_version_number'] = info.appVersionNumber;
      this.commonParams['xes_app_version'] = info.appVersion;
      this.isGotInfoFromXesApp = true;
    }
  }

  public static singletonInstance(): SpiderAPI {
    if (!SpiderAPI.spiderInstance) {
      SpiderAPI.spiderInstance = new SpiderAPI();
    }
    return SpiderAPI.spiderInstance;
  }

  public init(options: IInitOptions) {
    if (options.production === undefined) {
      options.production = true;
    }
    this.isDebug = !options.production;
    this.showLog = options.showLog ? true : false;
    this.commonParams['app_id'] = options.appId;
    this.getUserId();
  }

  private getUserId() {
    let localUserId = localStorage.getItem('guardian_user_id');
    if (localUserId) {
      this.commonParams['user_id'] = localUserId;
    }
  }

  public login(userId: string): void {
    localStorage.setItem('guardian_user_id', userId);
    this.getUserId();
  }

  public logout(): void {
    localStorage.removeItem('guardian_user_id');
    delete this.commonParams['user_id'];
  }

  public updateCommonParams(params: PartialUpdateCommParams = {}): void {
    this.commonParams = Object.assign(this.commonParams, params);
  }

  private setActionId(eventType: string, actionId?: string): void {
    // 当每次pv、click、show事件发生时，需要重新生成actionId；当上报其它事件时，需要沿用当前被设置好的公参actionId
    if (eventType === 'pv' || eventType === 'click' || eventType === 'show') {
      this.commonParams['action_id'] = actionId ? actionId : uuid();
    }
  }

  // 日志上报
  public async log(eventType: string, customParams: ICustomParams, logType: LogType = LogType.system ) {
    try {
      await new Promise((resolve, reject) => {
        const clits = Date.now();
        let [finalAppId, finalAppKey] = this.isDebug ? [testAppId, testAppKey] : [appid, appkey];
        // 设置action_id逻辑
        this.setActionId(eventType, customParams.action_id);
        // 单个事件是否打印日志开关
        let showSingleEventLog = customParams.show_log === false ? false : true;

        // 经过上一步，action_id已经被设置进公参了，customParams中的action_id删除即可
        delete customParams.action_id;
        delete customParams.show_log;

        this.seq += 1;

        // 每次上报都判断一下是否在网校app内部
        this.setXesAppInfo();

        let content = {
          seq: this.seq,
          ['event_type']: eventType,
          ['local_time']: timeFormat(new Date(), 1),
          ['utc_timestamp']: utcTime().getTime(),
          ...this.commonParams,
          ...customParams,
        }

        const sign = md5(finalAppId + '&' + clits + finalAppKey);
        let params = qs.stringify({
          content: JSON.stringify(content),
          appid: finalAppId,
          sign,
          clits
        })

        let url = 'https://dj.xesimg.com/c.gif';
        if (!this.isDebug) {
          if (logType === LogType.presentation) { url = 'https://dj.xesimg.com/a.gif' }
          if (logType === LogType.interaction) { url = 'https://dj.xesimg.com/b.gif' }
        }

        // 上报接口
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.addEventListener('load', (e) => {
          resolve();
        });
        xhr.addEventListener('error', (e) => {
          reject();
        });
        xhr.send(params);

        // 打印日志到控制台
        let logInfo = {
          content,
          appid: finalAppId,
          sign,
          clits
        }
        if (this.showLog && showSingleEventLog) {
          console.log(JSON.stringify(logInfo, null, ' '));
        }
      });
    } catch (e) {
      console.log('上报日志数据出现错误', e);
    }
  }
}

export default SpiderAPI.singletonInstance();
