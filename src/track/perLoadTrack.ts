import BaseTrack from './baseTrack';
import spider from '../api/spider';
import { ILoadPerformanceTrack } from '../utils/interface';
// import fmpTime from '@/collects/FmpCollect';

class PerLoadTrack extends BaseTrack {
  init(): void {
    this.performanceLoadTrack();
  }

  // per_load 加载性能事件
  private performanceLoadTrack(): void {
    window.setTimeout(() => {
      const {navigationStart, responseStart, domContentLoadedEventEnd, loadEventEnd, domainLookupStart, domainLookupEnd, connectStart, connectEnd, requestStart } = window.performance.timing

      if (loadEventEnd > 0) {
        // 已经触发了load事件则上报
        // 性能数据
        const performanceData: ILoadPerformanceTrack = {
          ['connect_time']: connectEnd - connectStart,
          ['dns_time']: domainLookupEnd - domainLookupStart,
          ['loading_time']: loadEventEnd - navigationStart,
          ['white_screen_time']: responseStart - navigationStart,
          ['request_time']: responseStart - requestStart,
          ['dom_ready_time']: domContentLoadedEventEnd - navigationStart,
          // ['fmp_time']: fmpTime
        }

        // 数据上报
        spider.log('per_load', performanceData)
        return;
      }

      // 如果没有获取到，则继续获取
      this.performanceLoadTrack();
    }, 500)
  }
}

export default new PerLoadTrack();
