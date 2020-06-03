import BaseTrack from './baseTrack';
import { EventUtils } from '../utils/utils';
import spider from '../api/spider';
import { IClickTrack, IEventTarget } from '@/utils/interface';

function getElementWithActionName(el: HTMLElement): { actionName: string; actionArgs?: any } | null {
  if (el.dataset.actionName) {
    if (el.dataset.actionArgs) {
      return {
        actionName: el.dataset.actionName,
        actionArgs: el.dataset.actionArgs
      };
    } else {
      return {
        actionName: el.dataset.actionName
      };
    }
  } else {
    // let r: HTMLElement | null;
    let parent = el.parentElement;
    while (parent && !parent.dataset.actionName) {
      parent = parent.parentElement;
    }

    if (parent && parent.dataset.actionName) {
      el.dataset.actionName = parent.dataset.actionName;
      if (parent.dataset.actionArgs) {
        el.dataset.actionArgs = parent.dataset.actionArgs;
      }
      if (el.dataset.actionArgs) {
        return {
          actionName: el.dataset.actionName,
          actionArgs: el.dataset.actionArgs
        };
      } else {
        return {
          actionName: el.dataset.actionName
        };
      }
    } else {
      return null;
    }
  }
}

class ClickTrack extends BaseTrack {
  init(): void {
    EventUtils.addHandler(document, 'click', (event: MouseEvent) => {
      if (event.target instanceof HTMLElement) {
        const actionParams = getElementWithActionName(event.target);
        if (actionParams && actionParams.actionName) {
          const target: IEventTarget = event.target;
          const dataSet = actionParams;
          const tagName = target.tagName;
          const customParams: IClickTrack = {
            ['action_name']: dataSet.actionName ? dataSet.actionName : '',
            posx: event.clientX,
            posy: event.clientY,
            args: {
              _tagName: tagName
            }
          }
          if (dataSet.actionArgs) { customParams.args = Object.assign(customParams.args, JSON.parse(dataSet.actionArgs)) };
          if (target.innerText) { customParams.args.innerText = target.innerText }
          if (tagName === 'IMG') { customParams.args.src = target.src; }
          if (tagName === 'A') { customParams.args.href = target.href; }

          // 数据上报
          spider.log('click', customParams, 1);
        }
      }
    })
  }
}

export default new ClickTrack();
