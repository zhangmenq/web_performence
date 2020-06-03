function hack() {
  let _wr = function(type: 'pushState' | 'replaceState') {
    let orig = window.history[type];
    return function(this: History, data: any, title: string, url?: string | null) {
      let rv = orig.call(this, data, title, url);
      let e = new Event(type);
      window.dispatchEvent(e);
      return rv;
    }
  }
  history.pushState = _wr('pushState')
  history.replaceState = _wr('replaceState')
}

export default hack;
