let app = getApp();
import  util from '../../utils/util.js';
Page({

    data: {
        title_height: '', // 标题高度
        title_line_height: '', // 标题行号
        is_share: false,         // 显示分享海报
        is_shuoming:false,
        is_nav:false,
        ifregister:0,//代表着没有注册呢
        animation:true,
        notices:'CUP校园体温登记小助手，有问题请联系客服人员',
    },
    switchNotice: function() {
        this.setData({
          hideNotice: true
        })
      },
    onLoad: function(options) {
       // this.show_share_poster();
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    title_height: res.statusBarHeight + 48,
                    title_line_height: (res.statusBarHeight * 0.85) + res.statusBarHeight + 48
                })
            }
        });
        that.getnotice()
    },

    getnotice(){
        wx.cloud.callFunction({
            name: 'cise',
            data: { 
              $url: 'get_notice', //云函数路由参数
            },
            success: res => {
              console.log(res)
              if(res.result.data){
                  if(res.result.data[0].content){
                    this.setData({
                        notices:res.result.data[0].content
                      })
                      wx.setStorageSync('notices', res.result.data[0].content)
                  }

              }
            },
            fail(e) {
              console.log(e)
            }
          });
    },


    onShareAppMessage: function() {
        return app.share_path
    },

    onPageScroll: function(ev) {　　
        var that = this;
        if (parseInt(ev.scrollTop) >= 60){
            that.setData({
                is_nav:true
            })
        }else{
            that.setData({
                is_nav: false
            })
        }
    },
    register:function(){
        wx.navigateTo({
            url:"/pages/Temregister/register/register",
        })

    },


    /**
     * 进入不同的页面
     */
    to_page: function(e) {
        var that = this;
        var type = parseInt(e.currentTarget.dataset.type);
        var url = '';
        switch (type) {
            case 1:
                if (that.data.company_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'enterprise_manage?id=' + that.data.company_id
                }
                break;
            case 2:
                url = '/pages/Watercard/shuoming/shuoming'
            //    app.basic_dialog('开发中', '敬请期待');
                /*
                if (that.data.store_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'physical_store?id=' + that.data.store_id
                }
                */
                break;
            case 3:
                //进入管理员的页面
                url = '/pages/Admin/login/login';
                break;
            default:
                if (that.data.company_id == 0) {
                    url = 'create_enterprise?type=' + type;
                } else {
                    url = 'enterprise_manage?id=' + that.data.company_id
                }
                break;
        }
        // 跳转
        wx.navigateTo({
            url: url,
        })
    },


    /**
     * 主页面进行扫码登记
     */
    go_register: function() {
        var that = this;
        wx.scanCode({
            onlyFromCamera: false,
            //scanType: 'qrCode',
            success: function(res) {
                console.log(res)
                if (res.errMsg == "scanCode:ok") {
                    var url = decodeURIComponent(res.path);
                    var urls = url.split('?');
                    console.log(urls)
                    if (urls[0] == 'pages/Temregister/register/register') {
                        if (urls[1]) { 
                            var param = urls[1].split('=');
                            console.log(param)
                            if(param[0]=="fuzeren"){
                                wx.navigateTo({
                                    url:"/pages/Temregister/register/register?fuzeren=" + param[1],
                                })
                            }
                            else if(param[0]=="clearstorage"){
                                //代表着要清理缓存
                                    //如果 清楚缓存有东西，就证明是一张清理缓存的表
                                    wx.clearStorageSync()
                                    console.log("缓存清理完成")
                                    wx.navigateTo({
                                        url:"/pages/Temregister/register/register",
                                    })
                            }

                            /*
                            if (param[0] == 'id') {
                                   
                            } else {
                                app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                            }
                            */
                        } else {
                            if(!that.data.ifregister){
                                wx.navigateTo({
                                    url:"/pages/Temregister/register/register"
                                })
                            }
                            else{
                                wx.navigateTo({
                                    url:"/pages/Temregister/teminfo/teminfo",
                                })
                                app.basic_dialog('您已经登记成功', '无需重复扫码');
                            }
                        }
                    } else {
                        app.basic_dialog('扫码失败', '扫码进入参数获取失败', '关闭');
                    }
                } else {
                    app.basic_dialog('扫码失败', '只能识别普通二维码', '关闭');
                }
            }
        })
    },
    //是自己进行测试的函数
    test(){
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'test', //云函数路由参数
              time_day: util.formatTime_day(new Date()),
            },
            success: res => {
              console.log(res)
            },
            fail(e) {
              console.log(e)
            }
          });
    },



    share: function() {
        var that = this;
        that.setData({
            is_share: true
        })
    },
    detail(){
        app.basic_dialog(this.data.notices[0]+this.data.notices[1]+this.data.notices[2]+this.data.notices[3], this.data.notices);
    },


    onShareTimeline:function(){
        return{
            title: 'CUP校园体温登记小助手',
            query: 'pages/index/index',
            imageUrl: '/img/poster.png'
        }

    },


})