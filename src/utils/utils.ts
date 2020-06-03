// 事件实体类
export class EventUtils {
  static addHandler(element: any, type: string, handler: Function): void {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false)
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler)
    } else {
      element["on" + type] = handler
    }
  }
  static removeHandler(element: any, type: string, handler: Function): void {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false)
    } else if (element.detachEvent){
      element.detachEvent("on" + type, handler)
    } else {
      element["on" + type] = null
    }
  }
  static getEvent(event: any) {
    return event ? event : window.event
  }
  static getTarget(event: any) {
    return event.target || event.srcElement
  }
  static preventDefault(event: any) {
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
  }
  static stopPropagation(event: any) {
    if (event.stopPropagation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
  }
}

// dom样式实体类
export class DomStyleUtils {
  public static getDomStyle(element?: HTMLElement | null, scrollTopElement?: HTMLElement | null, scrollLeftElement?: HTMLElement | null) {
    return {
      scrollTop: scrollTopElement ? DomStyleUtils.scrollTop(scrollTopElement) : DomStyleUtils.scrollTop(),
      scrollLeft: scrollLeftElement ? DomStyleUtils.scrollLeft(scrollLeftElement) : DomStyleUtils.scrollLeft(),
      clientWidth: DomStyleUtils.clientWidth(),
      clientHeight: DomStyleUtils.clientHeight(),
      elementWidth: element ? DomStyleUtils.elementWidth(element) : 0,
      elementHeight: element ? DomStyleUtils.elementHeight(element) : 0,
      elementLeft: element ? DomStyleUtils.elementLeft(element, scrollLeftElement) : 0,
      elementTop: element ? DomStyleUtils.elementTop(element, scrollTopElement) : 0,
      elementViewLeft: element ? DomStyleUtils.elementViewLeft(element, scrollLeftElement) : 0,
      elementViewTop: element ? DomStyleUtils.elementViewTop(element, scrollTopElement) : 0,
    }
  }

  public static scrollTop(parent: HTMLElement | null = null) {
    if (parent !== null) {
      return parent.scrollTop;
    } else {
      return document.documentElement.scrollTop || document.body.scrollTop;
    }
  }

  public static scrollLeft(parent: HTMLElement | null = null) {
    if (parent !== null) {
      return parent.scrollLeft;
    } else {
      return document.documentElement.scrollLeft || document.body.scrollLeft;
    }
  }

  public static clientWidth() {
    return document.documentElement.clientWidth || document.body.clientWidth
  }

  public static clientHeight() {
    return document.documentElement.clientHeight || document.body.clientHeight
  }

  public static elementWidth(element: HTMLElement): number {
    return element.offsetWidth
  }

  public static elementHeight(element: HTMLElement): number {
    return element.offsetHeight
  }

  public static elementLeft(element: HTMLElement, parent: HTMLElement | null = null): number {
    if (parent !== null) {
      if (element === parent) {
        return 0;
      }
    }
    else {
      if (!element.offsetParent) {
        return 0
      }
    }

    return element.offsetLeft + DomStyleUtils.elementLeft(element.offsetParent as HTMLElement, parent)
  }

  public static elementTop(element: HTMLElement, parent: HTMLElement | null = null): number {
    if (parent !== null) {
      if (element === parent) {
        return 0;
      }
    } else {
      if (!element.offsetParent) {
        return 0
      }
    }

    return element.offsetTop + DomStyleUtils.elementTop(element.offsetParent as HTMLElement, parent)
  }

  public static elementViewLeft(element: HTMLElement, parent: HTMLElement | null = null): number {
    return DomStyleUtils.elementLeft(element, parent) - DomStyleUtils.scrollLeft(parent)
  }

  public static elementViewTop(element: HTMLElement, parent: HTMLElement | null = null): number {
    return DomStyleUtils.elementTop(element, parent) - DomStyleUtils.scrollTop(parent)
  }
}

// DOM属性相关
export class DomAttrUtils {
  public static dataSet(target: any, attr: string): Object {
    let attribute = target.dataset[attr]
    if (attribute) {
      let arr = attribute.split(',')
      let map = new Map()
      let properties = Object.create(null)
      arr.forEach((element: any) => {
        let k: string = element.split(':')[0]
        map.set(k, element.split(':')[1])
      });
      map.forEach((value, key) => {
        properties[key] = value.trim()
      })
      return properties
    } else {
      return {}
    }
  }
}

// 函数操作相关实体类
export class FuncUtils {
  // 函数节流
  public static throttle(fn: Function, interval: number = 500) {
    let run: boolean = true;
    return function(...args: any[]) {
      if (!run) return;
      run = false;
      setTimeout(() => {
        fn.apply(this, ...args);
        run = true;
      }, interval)
    }
  }
  // 函数防抖
  public static debounce(fn: Function, delay: number = 500) {
    let timer: any;
    return function(...args: any[]) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(this, args)
      }, delay);
    }
  }
  // 惰性单例
  public static singleton(fn: Function) {
    var result: any = null;
    return function(...args: any[]) {
      return result || (result = fn.apply(this, args))
    }
  }
}

export function getStyle(element: any, attr: any): any {
  // 特性侦测
  if (window.getComputedStyle) {
    // 优先使用W3C规范
    return window.getComputedStyle(element)[attr]
  } else {
    // 针对IE9以下兼容
    return element.currentStyle[attr];
  }
}

// 获取url参数
export function getUrlParams(search: string): {[key: string]: any} {
  let queryObj: {[key: string]: any} = new Object()
  if (search.indexOf('?') !== -1) {
    let query = search.substr(1)
    let queryArr = query.split('&')
    for (let i = 0; i < queryArr.length; i++) {
      queryObj[queryArr[i].split('=')[0]] = unescape(queryArr[i].split('=')[1])
    }
  }
  return queryObj;
}

// 时间格式化
enum TimeType {
  Local,
  UTC
}

export function utcTime(): Date {
  let date = new Date();

  let utcFullYear = date.getUTCFullYear();
  let utcMonth = date.getUTCMonth();
  let utcDate = date.getUTCDate();
  let utcHours = date.getUTCHours();
  let utcMinutes = date.getUTCMinutes();
  let utcSeconds = date.getUTCSeconds();
  let utcMillseconds = date.getUTCMilliseconds();

  date.setFullYear(utcFullYear);
  date.setMonth(utcMonth);
  date.setDate(utcDate);
  date.setHours(utcHours);
  date.setMinutes(utcMinutes);
  date.setSeconds(utcSeconds);
  date.setMilliseconds(utcMillseconds);

  return date;
}

export function timeFormat(date: Date = new Date(), type: TimeType = TimeType.Local, format: string = 'YYYY/MM/DD hh:mm:ss') {
  let addZero = (num: number) => {
    return num < 10 ? '0' + num : num;
  };

  if (type === TimeType.UTC) {
    date = utcTime();
  }
  let fullYear = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hh = addZero(date.getHours());
  let mm = addZero(date.getMinutes());
  let ss = addZero(date.getSeconds());

  return `${fullYear}/${month}/${day} ${hh}:${mm}:${ss}`
}

// 生成uuid
export function uuid() {
  let s: any[] = [];
  let hexDigits = '0123456789abcdef';
  for(let i = 0; i < 36; i++) {
    s[i] = s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  let uuid = s.join("");
  return uuid;
}

export function setCookie(name: string, value: string, seconds: number = 0) {
  let expires = '';
  if (seconds !== 0) {
    const exp = new Date();
    exp.setTime(exp.getTime() + seconds * 1000);
    expires = `expires=${exp.toUTCString()}`;
  }
  document.cookie = `${name}=${escape(value)};${expires};path=/`; // 转码并赋值
}

// 获取cookie
export function getCookie(name: string) {
  const key = name + '=';
  const cookies = document.cookie.split(';'); // 把cookie分割成组
  for(let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if(cookie.includes(key)) {
      return unescape(cookie.substring(key.length)) // 解码并截取我们要的值
    }
  }
  return false;
}

//  删除cookie
export function delCookie(name: string) {
  const exp = new Date();
  exp.setTime(exp.getTime() - 1);
  if(getCookie(name)) {
    document.cookie= `${name}=${getCookie(name)};expires=${exp.toUTCString()}`;
  }
}

// 生成指定范围的随机数
export function rangeRandom(min: number, max: number, bit:number = 1): number {
  return Math.floor((min+ Math.random()*(max - min))*bit);
}

// json格式接口
export interface IObjProps {
  [key: string]: any;
}

export function isXesApp(): boolean {
  const ua = navigator.userAgent;
  return ua.includes('jzh');
}
