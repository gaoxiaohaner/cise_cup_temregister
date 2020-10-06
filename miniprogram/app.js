//app.js
import { hexMD5 } from 'utils/md5.js';
App({
    share_path: {
        title: 'CUP校园体温登记小助手',
        path: 'pages/index/index',
        imageUrl: '/img/poster.png'
    },

    // 首次加载
    onLaunch: function(options) {
        var that = this;

        wx.setStorageSync('scene', options.scene)
        //如果是1047得，就是扫描小程序码
        console.log("场景值："+options.scene)

        let accountInfo = wx.getAccountInfoSync();
        that.app_id = accountInfo.miniProgram.appId;
        wx.cloud.init({
            env:'test-second',
            traceUser:true
        })


         // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          if (res.hasUpdate) {
            updateManager.onUpdateReady(function () {
              wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                  if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate()
                  }
                }
              })
            })
            updateManager.onUpdateFailed(function () {
              // 新的版本下载失败
              wx.showModal({
                title: '已经有新版本了哟~',
                content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
              })
            })
          }
        })
      } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
        wx.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
    /**
     * 基础弹窗
     */
    basic_dialog: function (title, content, confirmText, fn) {
        wx.showModal({
            title: String(title),
            content: content,
            showCancel: false,
            confirmText: confirmText ? confirmText:'确认',
            success: fn
        })
    },

    /**
     * 成功吐司
     */
    toast_ok: function(title, fn) {
        wx.showToast({
            icon: 'success',
            title: title,
            success: function() {
                if (fn) {
                    fn();
                }
            }
        })
    },

    /**
     * 错误-弹窗吐司
     */
    toast_fail: function (title) {
        wx.showToast({
            image: '/img/close.png',
            title: title
        })
    },


    /**
     * 吐司弹窗
     */
    toast_none: function (title, fn, timer) {
        timer = timer ? timer : 1000;
        wx.showToast({
            title: title,
            icon: 'none',
            success: function () {
                setTimeout(function () {
                    if (fn) {
                        (fn)();
                    }
                    // 隐藏toast
                    wx.hideToast();
                }, timer);
            }
        })
    },

    /**
     * 显示加载中状态
     */
    show_loading: function(str) {
        wx.showToast({
            icon: 'loading',
            title: str,
        })
    },

    /**
     * 隐藏加载
     */
    hide_loading: function() {
        wx.hideToast();
    },

    /**
     * 显示导航加载状态
     */
    show_nav_loading: function() {
        wx.showNavigationBarLoading();
    },

    
    close_nav_loading: function() {
        wx.hideNavigationBarLoading();
    },


    /**
     * 获取当前日期
     */
    current_date: function() {
        var n_d = new Date();
        var y = n_d.getFullYear();
        var m = n_d.getMonth()+1;
        var d = n_d.getDate();
        m = m > 9 ? m : '0'+m;
        d = d > 9 ? d : '0' + d;
        return {
            date: y+'-'+m+'-'+d,
            y:y,
            m:m,
            d:d
        }
    }

})