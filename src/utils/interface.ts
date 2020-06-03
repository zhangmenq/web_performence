import { IObjProps } from '../utils/utils';

// 初始化参数
export interface IInitOptions {
  appId: string;
  production?: boolean;
  showLog?: boolean;
}

// 设置公共参数
export interface IUpdateCommonParams {
  channelId: string;
  subChannelId: string;
  [key: string]: any;
}
export type PartialUpdateCommParams = Partial<IUpdateCommonParams>;

// 自定义参数
export interface ICustomParams {
  ['action_id']?: string;
  ['show_log']?: boolean;
  [key: string]: any;
}

// 自动采集点击事件上报
export interface IClickTrack {
  action_name: string;
  posx: number;
  posy: number;
  args: {
    _tagName: string;
    src?: string;
    href?: string;
    [key: string]: any;
  };
}

// 点击事件采集tartget
export interface IEventTarget {
  dataset: any;
  tagName: string;
  innerText?: string;
  src?: string;
  href?: string;
}

// 页面加载性能上报
export interface ILoadPerformanceTrack {
  connect_time: number;
  dns_time: number;
  loading_time: number;
  white_screen_time: number;
  request_time: number;
  dom_ready_time: number;
  fmp_time?: number;
}

export interface IShowAreaTimeParams {
  showName: string;
  elementSelector: string;
  // parentElementSelector?: string;
  percent?: number;
  props?: IObjProps;
}

export interface IShowTrackReportParams {
  ['action_id']: string,
  ['show_name']: string,
  duration: number,
  ['show_log']: boolean,
  args?: IObjProps;
}
