export const a = 1;
// import { getStyle } from '../utils/utils'

// const START_TIME: number = window.performance && window.performance.timing.responseEnd;

// const IGNORE_TAG_SET: string[] = ["SCRIPT", "STYLE", "META", "HEAD", "LINK"];

// const TAG_WEIGHT_MAP: {[key: string]: any} = {
//   SVG: 2,
//   IMG: 2,
//   CANVAS: 4,
//   OBJECT: 4,
//   EMBED: 4,
//   VIDEO: 4
// };

// const LIMIT: number = 1000;

// const WW: number = window.innerWidth;

// const WH: number = window.innerHeight;

// const DELAY: number = 500;

// class FMPCollect {
//   public fmpTime: number = 0;
//   statusCollector: any[] = [];
//   flag: boolean = true;
//   muo: object = MutationObserver;
//   observer: any = null;
//   callbackCount: number = 1;
//   mp: { [key: string]: any[] } = {}; // 资源加载情况的responseEnd
//   constructor() {
//     this.initObserver();
//   }
//   // 进入页面，先首次截取下快照，并对dom进行打标签
//   firstSnapshot(): void {
//     let t: number = Date.now() - START_TIME;
//     let bodyTarget = document.body;

//     if (bodyTarget) {
//       this.doTag(bodyTarget, this.callbackCount++);
//     }
//     this.statusCollector.push({
//       t
//     });
//   }
//   // 初始化方法，监听dom变化
//   initObserver(): void {
//     this.firstSnapshot();

//     this.observer = new MutationObserver(() => {
//       let t: number = Date.now() - START_TIME;
//       let bodyTarget = document.body;

//       if (bodyTarget) {
//         this.doTag(bodyTarget, this.callbackCount++);
//       }
//       this.statusCollector.push({
//         t
//       });
//     });

//     this.observer.observe(document, {
//       childList: true,
//       subtree: true
//     });

//     if (document.readyState === "complete") {
//       this.calFinallScore();
//     } else {
//       window.addEventListener(
//         "load",
//         () => {
//           this.calFinallScore();
//         },
//         true
//       );
//     }
//   }
  
//   // 获取所有资源的加载情况
//   initResourceMap(): void {
//     let entries: any = performance.getEntries()
//     entries.forEach((item: { name: string | number; responseEnd: any[]; }) => {
//       this.mp[item.name] = item.responseEnd;
//     });
//     // console.log(entries)
//   }

//   doTag(target: { tagName: string; children: any}, callbackCount: number) {
//     let tagName = target.tagName;

//     if (IGNORE_TAG_SET.indexOf(tagName) === -1) {
//       let childrenLen: number = target.children ? target.children.length : 0;
//       if (childrenLen > 0) {
//         for (let childs = target.children, i = childrenLen - 1; i >= 0; i--) {
//           if (childs[i].getAttribute("f_c") === null) {
//             childs[i].setAttribute("f_c", callbackCount);
//           }
//           this.doTag(childs[i], callbackCount);
//         }
//       }
//     }
//   }

//   // 结束监听，计算最终得分，返回fmp
//   calFinallScore(): void {
//     if (MutationObserver && this.flag) {
//       if (!this.checkCanCal(START_TIME)) {
//         this.observer.disconnect();

//         this.flag = false;

//         let res: any = this.deepTraversal(document.body); // { dpss, st, els }

//         let tp: any;

//         res.dpss.forEach((item: { st: number; }) => { // dpss: st和els的集合
//           if (tp && tp.st) {
//             if (tp.st < item.st) {
//               tp = item;
//             }
//           } else {
//             tp = item;
//           }
//         });

//         this.initResourceMap(); // 获取所有资源的加载情况

//         let resultSet = this.filterTheResultSet(tp.els); // 想要的els
//         let fmpTiming = this.calResult(resultSet);
//         this.fmpTime = fmpTiming
//         // console.log("fmp : ", fmpTiming);

//       } else {
//         setTimeout(() => {
//           this.calFinallScore();
//         }, DELAY);
//       }
//     }
//   }

//   // 计算最终fmp
//   calResult(resultSet: any) {
//     let rt: number = 0;
//     resultSet.forEach((item: { weight: number; node: { getAttribute: { (arg0: string): string | number; (arg0: string): string | number; (arg0: string): string | number; }; tagName: string; src: string | number; poster: string | number; }; }) => {
//       let t: any = 0;
//       if (item.weight === 1) {
//         let index = +item.node.getAttribute("f_c") - 1;
//         if (this.statusCollector.length > index) {
//           t = this.statusCollector[index].t;
//         }
//       } else if (item.weight === 2) {
//         if (item.node.tagName === "IMG") {
//           t = this.mp[item.node.src];
//         } else if (item.node.tagName === "SVG") {
//           let index = +item.node.getAttribute("f_c") - 1;
//           if (this.statusCollector.length > index) {
//             t = this.statusCollector[index].t;
//           }
//         } else {
//           //background image
//           let backgroundImage = getStyle(item.node, 'background-image');
//           let match = backgroundImage.match(/url\(\"(.*?)\"\)/);
//           let s: string = '';
//           if (match !==null && match.length > 0) {
//             s = match[1];
//           }
//           if (s.indexOf("http") === -1) {
//             s = location.protocol + match[1];
//           }
//           t = this.mp[s];
//         }
//       } else if (item.weight === 4) {
//         if (item.node.tagName === "CANVAS") {
//           let index = +item.node.getAttribute("f_c") - 1;
//           if (this.statusCollector.length > index) {
//             t = this.statusCollector[index].t;
//           }
//         } else if (item.node.tagName === "VIDEO") {
//           t = this.mp[item.node.src];

//           !t && (t = this.mp[item.node.poster]);
//         }
//       }
//       // console.log(t, item.node);
//       rt < t && (rt = t);
//     });

//     return rt;
//   }

//   // 筛选出 节点分数大于平均分数的集合
//   filterTheResultSet(els: any[]) {
//     // console.log('最终els：')
//     let sum: number = 0;
//     els.forEach(item => {
//       sum += item.st;
//     });

//     let avg: number = sum / els.length;
//     // console.log(els)
//     // console.log('avg')
//     // console.log(avg)
//     return els.filter(item => {
//       // console.log(item.st)
//       return item.st >= avg;
//     });
//   }

//   // 深度优先遍历
//   deepTraversal(node: any) {
//     if (node) {
//       let dpss: any[] = []; // 当前节点的最终分数和els
//       for (let i = 0, child; (child = node.children[i]); i++) {
//         let s: any = this.deepTraversal(child);
//         if (s.st) {
//           dpss.push(s);
//         }
//       }

//       return this.calScore(node, dpss); // 返回 { dpss, st, els }
//     }
//     return {};
//   }

//   // 算法
//   calScore(node: any, dpss: any) {
//     let {
//       width,
//       height,
//       left,
//       top,
//     } = node.getBoundingClientRect();
//     let f = 1;

//     if (WH < top || WW < left) {
//       //不在可视viewport中
//       f = 0;
//     }

//     let sdp = 0; // 父节点的所有子节点的分数总和

//     dpss.forEach((item: { st: number; }) => {
//       sdp += item.st;
//     });
//     let weight: number = TAG_WEIGHT_MAP[node.tagName] || 1;
//     if (
//       weight === 1 &&
//       getStyle(node, 'background-image') !== 'none' && 
//       getStyle(node, 'background-image') !== "initial"
//     ) {
//       weight = TAG_WEIGHT_MAP["IMG"]; //将有图片背景的普通元素 权重设置为img
//     }

//     let st = width * height * weight * f; // 节点分数

//     let els = [{ node, st, weight }]; // 节点、分数和权重的集合

//     let areaPercent = this.calAreaPercent(node);
//     // console.log('sdp: ' + sdp)
//     // console.log('areaPercent: ' + areaPercent)
//     // console.log('st * areaPercent: ' + st * areaPercent)
//     if (sdp > st * areaPercent || areaPercent === 0) {
//       st = sdp;
//       els = [];

//       dpss.forEach((item: { els: ConcatArray<{ node: any; st: number; weight: number; }>; }) => {
//         els = els.concat(item.els);
//       });
//     }
//     // console.log(node)
//     // console.log('els')
//     // console.log(els)
//     return {
//       dpss,
//       st,
//       els
//     };
//   }

//   // 检查是否停止监听
//   checkCanCal(start: number) {
//     let ti: number = Date.now() - start;
//     return !(
//       ti > LIMIT ||
//       ti -
//         ((this.statusCollector &&
//           this.statusCollector.length &&
//           this.statusCollector[this.statusCollector.length - 1].t) ||
//           0) >
//         1000
//     );
//   }

//   // 计算几点在可视区域面积分数占节点面积的比例
//   calAreaPercent(node: any) {
//     let {
//       left,
//       right,
//       top,
//       bottom,
//       width,
//       height
//     } = node.getBoundingClientRect();
//     let wl = 0;
//     let wt = 0;
//     let wr = WW;
//     let wb = WH;

//     let overlapX =
//       right - left + (wr - wl) - (Math.max(right, wr) - Math.min(left, wl));
//     if (overlapX <= 0) {
//       //x 轴无交点
//       return 0;
//     }

//     let overlapY =
//       bottom - top + (wb - wt) - (Math.max(bottom, wb) - Math.min(top, wt));
//     if (overlapY <= 0) {
//       return 0;
//     }

//     return (overlapX * overlapY) / (width * height);
//   }
// }

// export default new FMPCollect().fmpTime;