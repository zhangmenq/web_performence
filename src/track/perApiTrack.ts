import BaseTrack from './baseTrack';
import requestWatcher, { InterceptorType } from '../utils/requestWatcher';
import spider from '../api/spider';
import UrlParser from 'url-parse';

interface IReqMapValue {
  startTime: number;
}

class PerApiTrack extends BaseTrack {
  private reqMap: Map<string, IReqMapValue> = new Map();
  constructor() {
    super();
  }

  init(): void {
    // 添加ajax拦截器
    requestWatcher.addInterceptor(InterceptorType.beforeSendRequest, (trace: IRequestTrace) => {
      if (trace.headers && trace.headers['x-trace-id']) {
        this.reqMap.set(trace.headers['x-trace-id'] as string, {
          startTime: Date.now()
        });
      }

      return trace;
    });

    // 添加ajax拦截器
    requestWatcher.addInterceptor(InterceptorType.afterRecieveResponse, (trace: IRequestTrace) => {
      // 只要有response返回，不管结果是否200，都记录一下时间
      if (trace.headers && trace.headers['x-trace-id']) {
        let traceId = trace.headers['x-trace-id'] as string;
        let reqMapValue = this.reqMap.get(traceId);
        if(!reqMapValue) return trace;
        // 清除计时的缓存
        this.reqMap.delete(traceId);

        let startTime = reqMapValue.startTime;
        let endTime = Date.now();

        // 数据上报
        this.updateDynamicCommonParams();
        spider.log('per_api', {
          ['api_url']: trace.url,
          traceId,
          duration: endTime - startTime,
          args: this.perApiTiming(trace.url)
        })
      }

      return trace;
    })
  }

  perApiTiming(url: string) {
    const fullUrl = (new UrlParser(url)).href;
    let p: PerformanceEntry | undefined;

    let entries = window.performance.getEntriesByName(fullUrl);
    if (entries && entries.length > 0) {
      p = entries[entries.length - 1];
    } else {
      entries = window.performance.getEntriesByType('resource');
      if (entries && entries.length > 0) {
        for (let i = entries.length - 1; i >= 0; --i) {
          const o = entries[i];
          if (o.name === fullUrl || o.name.startsWith(fullUrl) || fullUrl.startsWith(o.name)) {
            p = o;
            break;
          }
        }
      }
    }

    if (p) {
      const {redirectStart, redirectEnd, domainLookupStart, domainLookupEnd, connectStart, connectEnd, requestStart, responseStart, responseEnd } = p as PerformanceResourceTiming;
      return {
        ['redirect_duration']: redirectEnd - redirectStart,
        ['dns_duration']: domainLookupEnd - domainLookupStart,
        ['connect_duration']: connectEnd - connectStart,
        ['request_duration']: responseStart - requestStart,
        ['response_duration']: responseEnd - responseStart
      };
    } else {
      return {};
    }
  }
}

export default new PerApiTrack();
