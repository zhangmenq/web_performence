import BaseTrack from './baseTrack';
import { EventUtils, DomStyleUtils, FuncUtils, uuid } from '../utils/utils';
import { IShowAreaTimeParams, IShowTrackReportParams } from '../utils/interface'
import spider, { LogType } from '../api/spider';
import SingleTimer, { loopCallback, ILoopInfo } from '../utils/singleTimer';

class ShowCollector {
  private showName: string;
  private elementSelector: string;
  // private parentElementSelector?: string; // TODO: 暂时先不考虑元素嵌套滚动场景
  private percent: number = 20;
  private props: any = null;
  private actionId: string = '';

  private lastShowStatus: boolean = false;
  private lastTimestamp: number = 0;
  private duration: number = 0;

  constructor(params: IShowAreaTimeParams) {
    this.showName = params.showName;
    this.elementSelector = params.elementSelector;
    // this.parentElementSelector = params.parentElementSelector; // TODO: 暂时先不考虑元素嵌套滚动场景
    this.percent = params.percent || 20;
    this.props = params.props;
  }

  calc() {
    let currentShowStatus = false;
    const currentTimestamp = (new Date()).getTime();

    const element = document.querySelector(this.elementSelector);
    if (element) {
      currentShowStatus = this.calculateArea(element, this.percent);
    } else {
      // 如果没有获取到元素，认为是没有曝光的状态
      currentShowStatus = false;
      return;
    }

    if (this.lastShowStatus) {
      if (currentShowStatus) {
        // 如果之前是曝光状态，现在也是曝光状态，则累计时间
        this.duration += currentTimestamp - this.lastTimestamp;
        this.lastTimestamp = currentTimestamp;
        // console.log('模块累计曝光', this.showName);
      } else {
        // 如果之前是曝光状态，现在不是了，则需要将当前阶段累计时间上报，并且重置状态，准备下一次进入曝光的时间计算
        this.duration += currentTimestamp - this.lastTimestamp;
        this.lastTimestamp = 0;
        this.lastShowStatus = false;
        // console.log('模块结束曝光', this.showName);
      }
      // 上报数据
      this.report();
    } else {
      if (currentShowStatus) {
        // 如果之前不是曝光状态，现在是曝光状态了，则需要开始累计时间
        this.lastTimestamp = currentTimestamp;
        this.lastShowStatus = true;
        this.duration = 0;
        // 重新生成actionId
        this.actionId = uuid();
        // console.log('模块开始曝光', this.showName);
      } else {
        // 如果之前不是曝光状态，现在也不是，则无需处理
      }
    }
  }

  // 计算曝光面积，是否处于曝光状态
  private calculateArea(el: Element, percent: number): boolean {
    let { clientWidth, clientHeight } = DomStyleUtils.getDomStyle();
    let { width, height, top, bottom, left, right } = el.getBoundingClientRect();

    // 进入可视区域宽高
    let showAreaHeight = Math.min(clientHeight - top, bottom, height, clientHeight);;
    let showAreaWidth = Math.min(clientWidth - left, right, width, clientWidth);

    let showArea = showAreaHeight * showAreaWidth; // 进入可视区域面积
    let elementArea = width * height; // 指定元素面积

    return showArea >= elementArea * percent / 100;
  }

  private report(showAreaTimeLog: boolean = true) {
    // 上报
    let customParams: IShowTrackReportParams = {
      ['action_id']: this.actionId,
      ['show_name']: this.showName,
      duration: this.duration,
      ['show_log']: showAreaTimeLog,
    };
    if (this.props) { customParams['args'] = this.props }

    spider.log('show', customParams, LogType.presentation);
  }
}

class ShowTrack extends BaseTrack {
  private timer: SingleTimer = new SingleTimer(1000);
  private loopId?: string;
  private currentParams: IShowAreaTimeParams[] = [];

  constructor() {
    super();
  }

  init(): void {
    EventUtils.addHandler(window, 'pushState', this.routeChangedHandler.bind(this));
    EventUtils.addHandler(window, 'replaceState', this.routeChangedHandler.bind(this));
    EventUtils.addHandler(window, 'popstate', this.routeChangedHandler.bind(this));
    EventUtils.addHandler(window, 'hashchange', () => {
      if (!window.history.pushState) {
        this.routeChangedHandler();
      }
    });
    EventUtils.addHandler(document, 'visibilitychange', this.visibilityStateHandler.bind(this));
  }

  private visibilityStateHandler() {
    // 用户离开了当前页面
    if (document.visibilityState === 'hidden') {
      // 停止上一个计时器
      this.stop();
    }
    // 用户打开或回到页面
    if (document.visibilityState === 'visible') {
      // 再开始下一个计时器
      this.start();
    }
  }

  private routeChangedHandler() {
    // 停止上一个计时器
    this.stop();
    this.currentParams = [];
  }

  reportAreaTime(params: IShowAreaTimeParams[]) {
    setTimeout(() => {
      this.currentParams = params;
      this.start();
    }, 0);
  }

  private start() {
    if (this.currentParams.length > 0) {
      const collectors = this.currentParams.map(item => new ShowCollector(item));
      // 插入定时器处理
      this.loopId = this.timer.setInterval(function () {
        // console.log('正在监听页面上的曝光模块');
        collectors.forEach(collector => {
          collector.calc();
        });
      }, 3000);
      // console.log('开始监听页面上的曝光模块', this.loopId);
    }
  }

  private stop() {
    if (this.loopId) {
      // console.log('结束监听页面上的曝光模块', this.loopId);
      this.timer.clearInterval(this.loopId);
      this.loopId = undefined;
    }
  }
}

export default new ShowTrack();
