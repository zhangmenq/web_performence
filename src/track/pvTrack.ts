import BaseTrack from './baseTrack';
import spider, { LogType } from '../api/spider';
import { EventUtils, uuid, rangeRandom } from '../utils/utils';
import UrlParser from 'url-parse';

class PvTrack extends BaseTrack {
  private reportPT: boolean = false; // 是否上报页面停留时长
  private ptUrls: Set<string> = new Set(); // 缓存需要上报页面的url
  private pageStayStart: number = 0;
  private pageStayDuration: number = 0;
  private tempPageStayDuration: number = 0;
  private actionId: string = '';
  private currentUrl = location.href;
  private timer: NodeJS.Timer | null | number = null;
  constructor() {
    super();
  }

  init(): void {
    const urlEntity = new UrlParser(this.currentUrl);
    this.updateDynamicCommonParams({
      ['current_url']: this.currentUrl,
      ['referrer_url']: document.referrer,
      origin: urlEntity.origin,
      pathname: urlEntity.pathname,
      query: urlEntity.query,
      hash: urlEntity.hash,
    });
    this.pvTrack('start'); // pv上报
    EventUtils.addHandler(window, 'pushState', this.pushStateHandler.bind(this));
    EventUtils.addHandler(window, 'replaceState', this.replaceStateHandler.bind(this));
    EventUtils.addHandler(window, 'popstate', this.popStateHandler.bind(this));
    EventUtils.addHandler(window, 'hashchange', () => {
      if (!window.history.pushState) {
        this.hashChangeHandler()
      }
    });
    EventUtils.addHandler(window, 'beforeunload', this.beforeunloadHandler.bind(this));
    EventUtils.addHandler(document, 'visibilitychange', this.visibilityStateHandler.bind(this));
  }

  private getCurrentUrlFullPath() {
    return location.origin + location.pathname;
  }

  // pv采集事件
  private pvTrack(type: string): void {
    if (type === 'start') {
      this.actionId = uuid();
      this.pageStayStart = Date.now();
      spider.log('pv', {
        type,
        ['action_id']: this.actionId
      }, LogType.presentation);

      // 前进、后退、重复push当前页面场景，判断是否上报页面停留时长
      if (this.ptUrls.has(this.getCurrentUrlFullPath()) && !this.reportPT) {
        this.reportPT = true;
        this.heartbeatHandler();
      }
    }
    if (type === 'end') {
      this.pageStayStart = 0;
      if (this.reportPT) {
        this.reportPT = false;
        this.pageStayDuration = 0;
        this.tempPageStayDuration = 0;
        window.clearInterval(Number(this.timer));
      }
    }
  }

  // 上报页面停留时长
  public reportPageTimeHandler() {
    if (this.reportPT) { return; }
    this.ptUrls.add(this.getCurrentUrlFullPath());
    this.reportPT = true;
    this.heartbeatHandler();
  }

  // 心跳机制上报页面停留时长方法
  private heartbeatHandler(showPTLog: boolean = true) {
    let intervar = rangeRandom(3, 5, 1000);
    this.timer = window.setInterval(() => {
      this.pageStayDuration = Date.now() - this.pageStayStart + this.tempPageStayDuration;
      // 上报
      spider.log('pv', {
        type: 'end',
        ['action_id']: this.actionId,
        duration: this.pageStayDuration,
        ['show_log']: showPTLog
      }, LogType.presentation);
      // intervar = rangeRandom(3, 5, 1000);
    }, intervar);
  }

  private updateUrl() {
    const newCurrentUrl = location.href;
    const urlEntity = new UrlParser(newCurrentUrl);
    this.updateDynamicCommonParams({
      ['current_url']: newCurrentUrl,
      ['referrer_url']: this.currentUrl,
      origin: urlEntity.origin,
      pathname: urlEntity.pathname,
      query: urlEntity.query,
      hash: urlEntity.hash,
    });
    this.currentUrl = newCurrentUrl;
  }

  private pushStateHandler() {
    this.pvTrack('end'); // 页面停留时长上报
    this.updateUrl();
    this.pvTrack('start'); // pv上报
  }

  private replaceStateHandler() {
    this.pvTrack('end'); // 页面停留时长上报
    this.updateUrl();
    this.pvTrack('start'); // pv上报
  }

  private popStateHandler() {
    this.pvTrack('end'); // 页面停留时长上报
    this.updateUrl();
    this.pvTrack('start'); // pv上报
  }

  private hashChangeHandler() {
    this.pvTrack('end'); // 页面停留时长上报
    this.updateUrl();
    this.pvTrack('start'); // pv上报
  }

  private beforeunloadHandler() {
    this.pvTrack('end'); // 页面停留时长上报
  }

  private visibilityStateHandler() {
    if (this.reportPT) {
      // 用户离开了当前页面
      if (document.visibilityState === 'hidden') {
        const pageStayPause = Date.now();
        this.tempPageStayDuration += pageStayPause - this.pageStayStart;
        window.clearInterval(Number(this.timer));
      }
      // 用户打开或回到页面
      if (document.visibilityState === 'visible') {
        this.pageStayStart = Date.now();
        this.heartbeatHandler();
      }
    }
  }
}

export default new PvTrack();
