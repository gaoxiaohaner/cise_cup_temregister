import  util from '../../../utils/util.js';
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        disabled: false,//此时此刻能否登记体温
        loading: false,         // 加载
        loadModal:false,
        type:1,//默认普通的公告
    },
    onLoad: function(options) {
       this.setData({
         type:options.type,
       })
    },

   
    submit_data: function (e) {
                // 开始加载
        if (this.data.loading == true) {
            return false;
        }
        this.show_loading();
        var that = this;
        var form_data = e.detail.value;
       
        console.log(form_data)

        this.setData({
            loadModal:true
        })
  //如果接受的话，就会继续上报
  wx.cloud.callFunction({
    name: 'cise',
    data: {
      $url: 'correct_notices', //云函数路由参数
      type:this.data.type,
      data1:form_data,
    },
    success: re => {
      console.log(re)
      that.setData({
        loadModal:false
         }) 
       
         that.close_loading();
         app.basic_dialog('公告修改成功', '成功修改');
         wx.navigateBack()
    },
    fail(e) {
      console.log(e)
      that.setData({
        loadModal:false
    })
    that.close_loading();
    }
  });
    },
    
    show_loading: function () {
        var that = this;
        that.data.loading = true;
        app.show_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },

    close_loading: function () {
        var that = this;
        that.data.loading = false;
        app.close_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },

})