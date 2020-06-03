import spider, { LogType } from './api/spider';
import requestWatcher, { InterceptorType } from './utils/requestWatcher';
import { IInitOptions, PartialUpdateCommParams } from './utils/interface';
import hackHistory from './utils/hackHistory';
import initTrack, { reportPageTime, reportAreaTime } from './track';
import UrlParser from 'url-parse';

export {
  requestWatcher,
  InterceptorType,
  LogType
};

export default {
  async init(options: IInitOptions) {
    spider.init(options);
    // 开启拦截ajax请求机制
    requestWatcher.init();
    // 添加ajax拦截器，设置x-trace-id
    requestWatcher.addInterceptor(InterceptorType.beforeSendRequest, function (this: Window, trace: IRequestTrace) {
      if (!trace.headers) {
        trace.headers = {};
      }
      const traceId = `1v1web_${Date.now()}`;
      const urlEntity = new UrlParser(trace.url);
      if (urlEntity.hostname.endsWith('.xes1v1.com') || urlEntity.hostname === 'localhost' || urlEntity.hostname.endsWith('.test-dahai.com') || (urlEntity.hostname.endsWith('.xueersi.com') && urlEntity.pathname.startsWith('/1v1gateway/'))) {
        trace.headers['x-trace-id'] = traceId;
      }

      return trace;
    });
    // 开启history api拦截器，在pushState和replaceState的时候广播事件出来，事件发生在window上
    hackHistory();
    // 初始化所有的跟踪器
    initTrack();
  },
  login(userId: string): void {
    spider.login(userId);
  },
  logout(): void {
    spider.logout();
  },
  updateCommonParams(params: PartialUpdateCommParams = {}): void {
    spider.updateCommonParams(params);
  },
  reportPageTime,
  reportAreaTime,
  async log(eventType: string, customParams: object, logType: LogType = LogType.system ) {
    await spider.log(eventType, customParams, logType);
  }
};
