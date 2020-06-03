function hack(beforeSendRequest?: (this: Window, config: IRequestTrace) => IRequestTrace, afterRecieveResponse?: (this: Window, config: IRequestTrace) => IRequestTrace) {
  const oldFetch = window.fetch;
  if (oldFetch) {
    window.fetch = function (input: RequestInfo, init?: RequestInit): Promise<Response> {
      let trace: IRequestTrace = {
        useFetch: true,
        method: 'get',
        url: ''
      };
      if (typeof input === 'string') {
        trace.url = input;
        if (init) {
          if (init.method) {
            trace.method = init.method;
          }
          trace.body = init.body;
        }
      } else {
        trace.url = input.url;
        trace.method = input.method;
        trace.body = input.body;
      }
      try {
        // hack处理
        if (beforeSendRequest) {
          trace = beforeSendRequest.call(window, trace);
          // 设置header
          if (trace.headers) {
            if (typeof input !== 'string') {
              for (let name in trace.headers) {
                input.headers.append(name, trace.headers[name].toString());
              }
            }
            if (!init) {
              init = {};
            }
            if (!init.headers) {
              init.headers = {};
            }
            let t: {
              [k: string]: string;
            } = {};
            for (let name in trace.headers) {
              t[name] = trace.headers[name].toString();
            }
            init.headers = {...init.headers, ...t};
          }
        }
      } catch (e) {
        console.log(e);
      }
      return oldFetch.call(window, input, init).then((response) => {
        try {
          trace.response = response.body;
          trace.status = response.status;
          trace.statusText = response.statusText;
          if (afterRecieveResponse) {
            afterRecieveResponse.call(window, trace);
          }
        } catch (e) {
          console.log(e);
        }
        return response;
      }).catch((error) => {
        try {
          trace.response = '';
          trace.status = 0;
          trace.statusText = '';
          if (afterRecieveResponse) {
            afterRecieveResponse.call(window, trace);
          }
        } catch (e) {
          console.log(e);
        }
        throw error;
      });
    };
  }

  const oldOpen = XMLHttpRequest.prototype.open;
  const oldSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, method: string, url: string, async?: boolean, username?: string | null, password?: string | null) {
    if (async === undefined) {
      async = true;
    }
    try {
      // hack处理
      this.trace = {
        useFetch: false,
        method,
        url
      };
    } finally {
      oldOpen.call(this, method, url, async, username, password);
    }
  };
  XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | BodyInit | null) {
    function handleResponse(this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) {
      if (afterRecieveResponse) {
        afterRecieveResponse.call(window, {
          ...this.trace,
          response: this.response,
          status: this.status,
          statusText: this.statusText
        });
      }
    }

    try {
      // hack处理
      this.trace.body = body;
      if (beforeSendRequest) {
        this.trace = beforeSendRequest.call(window, this.trace);
        // 设置header
        if (this.trace.headers) {
          for (let name in this.trace.headers) {
            this.setRequestHeader(name, this.trace.headers[name].toString());
          }
        }
      }
      // 绑定事件处理
      this.addEventListener('load', handleResponse);
      this.addEventListener('error', handleResponse);
    } finally {
      try {
        oldSend.call(this, body);
      } catch (e) {
        console.log('error', e);
        this.trace.error = e;
      }
    }
  };
  // TODO: hack xmlHttpRequest.addEventListener 关于XMLHttpRequest response的hack暂时没有做到拦截器流机制，目前只是接收通知
  // const oldAddEventListener = XMLHttpRequest.prototype.addEventListener;
  // XMLHttpRequest.prototype.addEventListener = function <K extends keyof XMLHttpRequestEventMap>(this: XMLHttpRequest, type: K, listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void {

  // };
}

export default hack;
