const ua = navigator.userAgent;

export class NavigatorCollect {

  // 获取设备类型 返回id
  public static getDevId(): number {
    const browser = {
      android: Boolean(ua.match(/android/ig)), // 是否是android浏览器
      ios: Boolean(ua.match(/iphone|ipod|iOS/ig)), // 是否是ios浏览器
      isIpad: Boolean(ua.match(/ipad/ig)), // 是否是ipad浏览器
      wechat: Boolean(ua.match(/MicroMessenger/ig)), // 是否是微信浏览器
      ali: Boolean(ua.match(/AlipayClient/ig)), // 是否是支付宝平台浏览器
      mobile: Boolean(ua.match(/mobile/ig)),
      pc: Boolean(!ua.match(/mobile/ig)),
      xesApp: Boolean(ua.match(/jzh/ig)),
    }

    if (browser.pc) return 1;
    if (browser.ios) return 7;
    if (browser.android) return 8;
    return 0;
  }

  // 获取网络类型
  public static getNetworkType() {
    let matches = ua.match(/NetType\/\w+/);
    let network = matches !== null && matches.length > 0 ? matches[0] : 'NetType/other'; // TODO: 从UA里获取网络状态不一定能获取得到
    let networkType = network.toLowerCase().replace('nettype/', '');
    if (networkType === '3gnet') {
      networkType = '3g'
    }
    return networkType
  }

  // 获取经纬度
  public static getLocation() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(location => {
          resolve({
            gpsLon: location.coords.longitude,
            gpsLat: location.coords.latitude
          })
        }, (error) => {
          reject(error)
        })
      })
    }
  }
}
