import BaseTrack from './baseTrack';
import pvTrack from './pvTrack';
import clickTrack from './clickTrack';
import showTrack from './showTrack';
import perApiTrack from './perApiTrack';
import perLoadTrack from './perLoadTrack';
import { IShowAreaTimeParams } from '@/utils/interface';

const trackList: BaseTrack[]  = [
  pvTrack,
  clickTrack,
  showTrack,
  perApiTrack,
  perLoadTrack
];

export function reportPageTime() {
  pvTrack.reportPageTimeHandler();
}

export function reportAreaTime(params: IShowAreaTimeParams[]) {
  showTrack.reportAreaTime(params);
}

// 初始化所有的采集指标跟踪器
export default function () {
  trackList.forEach(t => {
    t.init();
  });
};
