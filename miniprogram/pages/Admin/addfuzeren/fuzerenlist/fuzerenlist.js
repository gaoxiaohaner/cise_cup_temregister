import  util from '../../../../utils/util.js';
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
              $url:'get_fuzeren_info',
              adminname:wx.getStorageSync('admin').name,
              admin:wx.getStorageSync('admin').admin,
              college:wx.getStorageSync('admin').college
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
      const db = wx.cloud.database({})
      if(wx.getStorageSync('admin').admin==1){
        db.collection('manager')
      .where(
        db.command.and(
          [
             db.command.or(
             [
            {
              fuzeren: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            },
            {
              adminID: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            }
             ],
             ),
             db.command.and([
               {
                fudaoyuan:wx.getStorageSync('admin').name,
               }
             ])
        ],
         )
       )
        .get({
          success: res => {
            that.setData({
              search_student_list: res.data,
              loadModal:false
            })
            console.log(res.data)
          }
        })
      }
      else if(wx.getStorageSync('admin').admin==2){
        db.collection('manager')
      .where(
        db.command.and(
          [
             db.command.or(
             [
            {
              fuzeren: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            },
            {
              adminID: db.RegExp({
                regexp: '.*' + this.data.inputVal,
                options: 'i',
              })
            }
             ],
             ),
             db.command.and([
               {
                college:wx.getStorageSync('admin').college,
               }
             ])
        ],
         )
       )
        .get({
          success: res => {
            that.setData({
              search_student_list: res.data,
              loadModal:false
            })
            console.log(res.data)
          }
        })
      }
    },
    clearInput() {
      this.setData({
        inputVal: "",
        inputShowed: false,
        search_student_list: []
      })
      wx.hideKeyboard() //强行隐藏键盘
    },
    onPullDownRefresh(){
      this.get_list()
    }
})