import hackRequest from './hackRequest';

export enum InterceptorType {
  beforeSendRequest,
  afterRecieveResponse
}

type interceptorFunctionType = (this: Window, trace: IRequestTrace) => IRequestTrace;

const interceptors = new Map<InterceptorType, interceptorFunctionType[]>();
interceptors.set(InterceptorType.beforeSendRequest, []);
interceptors.set(InterceptorType.afterRecieveResponse, []);

function traverseInterceptor(type: InterceptorType, trace: IRequestTrace): IRequestTrace {
  try {
    const ints = interceptors.get(type);
    if (ints) {
      for (let intcep of ints) {
        trace = intcep.call(window, trace);
      }
    }
    return trace;
  } catch (e) {
    console.log(e);
    return trace;
  }
}

let isInited = false;

function init() {
  if (isInited) {
    return;
  }
  isInited = true;
  hackRequest(function (this: Window, config) {
    // this.console.log('run hack beforeSendRequest', config);
    if (config.url.includes('//dj.xesimg.com/')) {
      return config;
    }
    return traverseInterceptor(InterceptorType.beforeSendRequest, config);
  }, function (this: Window, config) {
    // this.console.log('run hack afterRecieveResponse', config);
    if (config.url.includes('//dj.xesimg.com/')) {
      return config;
    }
    return traverseInterceptor(InterceptorType.afterRecieveResponse, config);
  });
}

export default {
  init,
  addInterceptor(type: InterceptorType, fn: interceptorFunctionType) {
    let ints = interceptors.get(type);
    if (!ints) {
      ints = [];
      interceptors.set(type, ints);
    }
    ints.push(fn);
  }
};
