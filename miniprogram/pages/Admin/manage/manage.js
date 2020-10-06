import  util from '../../../utils/util.js';
var app=getApp()
const db = wx.cloud.database({})
Page({
    data: {
        student_list: [],      // 已经购买的水卡列表
        search_student_list:[],//搜索之后的结果
        inputShowed: false, // 输入框是否显示
        inputVal: '', // 搜索框输入的内容
        loadingMoreHidden: true,
        loadModal:true
    },
    onLoad: function (options) {

    },
    onShow:function(options){

        this.get_list();//获取登记的列表--仅限于当天的
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
              $url: wx.getStorageSync('admin').admin==0?'get_today_info_list_fuzeren': wx.getStorageSync('admin').admin==1?'get_today_info_list_admin':'get_today_info_list_college', //云函数路由参数
              fuzeren:wx.getStorageSync('admin').fuzeren,
              timeday: util.formatTime_day(new Date()),//销售的日子，落实到几号
              college:wx.getStorageSync('admin').college,
              admin:wx.getStorageSync('admin').admin,
            },
            success: res => {
              console.log(res)
              if(res.result){
                this.setData({
                  student_list:res.result.data,
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
       .orderBy('number', 'asc')
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
      var teminfo=e.currentTarget.dataset.info
      wx.navigateTo({
        url: '../teminfo/teminfo?teminfo='+JSON.stringify(teminfo),
      })
      /*
      if (this.endTime - this.startTime < 350) {
        console.log(e.currentTarget.dataset.info);
        var teminfo=e.currentTarget.dataset.info
        wx.navigateTo({
          url: '../teminfo/teminfo?teminfo='+JSON.stringify(teminfo),
        })
      }
      else{
        this.delet(e)
      }*/
    },
    delet(e){
      console.log(e)
      let that=this
      //删除该数据
      wx.showModal({
        title: '删除该记录',
        content: '确定要删除该记录？',
        showCancel: true,//是否显示取消按钮
        cancelText:"否",//默认是“取消”
        cancelColor:'skyblue',//取消文字的颜色
        confirmText:"是",//默认是“确定”
        confirmColor: 'skyblue',//确定文字的颜色
        success: function (res) {
           if (res.cancel) {
              //点击取消,默认隐藏弹框
           } else {
              //点击确定
              wx.cloud.callFunction({
                name: 'cise',
                data: {
                  $url:'del_register_info',
                  student_info:e.currentTarget.dataset.info
                },
                success: res => {
                  console.log(res)
                  that.setData({
                      loadModal:false
                  })
                  app.basic_dialog('删除成功', '成功删除'+e.currentTarget.dataset.info.student_name);
                  if(that.data.inputVal){
                    //如果有搜索的东西
                    that.searchmessage(that.data.inputVal)
                  }else{
                    //如果没有搜索，就直接是普通的删除
                    that.get_list()
                  }

                },
                fail(res) {
                  that.setData({
                    loadModal:false
                  })
                  app.toast_fail('删除失败')
                }
              });
           }
        },
        fail: function (res) { },//接口调用失败的回调函数
        complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
     })
    },

    handleTouchStart: function(e) {
      this.startTime = e.timeStamp;
    },

    handleTouchEnd: function(e) {
      this.endTime = e.timeStamp;
    },

    onPullDownRefresh(){
      this.get_list()
    },
})