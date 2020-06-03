import spider from '../api/spider';

export default abstract class BaseTrack {
  abstract init(): void; // 指标采集跟踪器都需要实现此接口，以便对外是统一的接口约定

  protected updateDynamicCommonParams(props: object = {}): void {
    spider.commonParams = Object.assign(spider.commonParams, props);
  }
}
