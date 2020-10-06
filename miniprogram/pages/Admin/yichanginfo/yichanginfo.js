import  util from '../../../utils/util.js';
Page({
    data: {
        student_list: [],     
        search_student_list:[],
        inputShowed: false, // 输入框是否显示
        inputVal: '', // 搜索框输入的内容
        loadingMoreHidden: true,
        loadModal:true
    },
    onLoad: function (options) {
      /*
      if(options.hot_in==1){
        //证明时直接进入这个页面的
        wx.setStorageSync('hot_in',1);
      }
      */

    },
    onShow:function(options){
        this.get_list();//购买登记的列表--仅限于当天的
    },

    go_back:function(){
        var that = this;
        wx.navigateBack({
            delta: 1
        })
    },
    get_list: function() {
        //这个地方必须采用懒加载才行
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url:'get_yichang_info',
              fuzeren:wx.getStorageSync('admin').fuzeren,
              adminname:wx.getStorageSync('admin').name,
              timeday: util.formatTime_day(new Date()),//销售的日子，落实到几号
              college:wx.getStorageSync('admin').college,
              admin:wx.getStorageSync('admin').admin,
              
            },
            success: res => {
              console.log(res)
              if(res.result){
                this.setData({
                  student_list:res.result.result1.data,
                  loadModal:false
                })
              }else{
                this.setData({
                  loadModal:false
                })
              }

            },
            fail(e) {
              this.setData({
                loadModal:false
              })
              console.log(e)
            }
          });
    },
    showInput() {
      this.setData({
        inputShowed: true
      })
    },
    inputTyping(e) {
      this.setData({
        inputVal: e.detail.value,
        loadModal:true,
      }, () => {
        this.searchmessage(this.data.inputVal)
      })
    },
    searchmessage(e) {
      let that = this
      const db = wx.cloud.database({})
      db.collection('TemregisterInfo')
      .where(
        db.command.and(
          [
             db.command.or(
             [
            {
              student_name: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            },
            {
              mobile: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            },
            {
              stuID: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            }
             ],

             ),
             db.command.and([
               {
                time_day: util.formatTime_day(new Date())
               }
             ])
            
        ],
         )
       )
       .orderBy('time', 'desc')
        .get({
          success: res => {
            that.setData({
              search_student_list: res.data,
              loadModal:false
            })
            console.log(res.data)
          }
        })
    },
    clearInput() {
      this.setData({
        inputVal: "",
        inputShowed: false,
        search_student_list: []
      })
      wx.hideKeyboard() //强行隐藏键盘
    },

    detail(e){
      console.log(e.currentTarget.dataset.info);
      var teminfo=e.currentTarget.dataset.info
      wx.navigateTo({
        url: '../teminfo/teminfo?teminfo='+JSON.stringify(teminfo),
      })
    },
})