import  util from '../../../utils/util.js';
var app=getApp()
const db = wx.cloud.database({})
Page({
    data: {
        student_list: [], 
        search_student_list:[],//搜索之后的结果
        inputShowed: false, // 输入框是否显示
        inputVal: '', // 搜索框输入的内容
        loadingMoreHidden: true,
        loadModal:true
    },
    onLoad: function (options) {
      this.setData({
       admin: wx.getStorageSync('admin').admin
      })
    },
    onShow:function(options){

        this.getweijiaolist();//获取登记的列表--仅限于当天的
    },

    go_back:function(){
        var that = this;
        wx.navigateBack({
            delta: 1
        })
    },
    getweijiaolist: function() {
      let that=this
      var admin= wx.getStorageSync('admin').admin
      wx.cloud.callFunction({
        name: 'cise',
        data: { 
          $url:admin==0?'get_fuze_weijiao':admin==1?'get_daoyuan_weijiao':'down_college_weijiao', //
          fudaoyuan:admin==0?wx.getStorageSync('admin').fudaoyuan:wx.getStorageSync('admin').fuzeren,
          fuzeren:wx.getStorageSync('admin').fuzeren,
          timeday2:util.formatTime_day2(new Date()),//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:util.formatTime_day(new Date()),
          college:wx.getStorageSync('admin').college,
          admin:wx.getStorageSync('admin').admin,
        },  
        success: res => {
          console.log(res)
          that.setData({
            loadModal:false
          })
          if(res.result){
            that.setData({
              student_list:res.result.list
            })
          }
          else{

            app.basic_dialog('获取错误', '请稍后重试', '关闭');
          }

        },
        fail(e) {
          that.setData({
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

      //搜索做的不行
      let that = this
      var student=that.data.student_list
   //   console.log(student)
      var searchstulist=[]
      for(let i=0;i<student.length;i++){
        if(student[i].student_name.indexOf(e)>=0||student[i].dormitory_number.indexOf(e)>=0||student[i].fuzeren.indexOf(e)>=0){
          //如何宿舍，姓名，负责人包含在内
          searchstulist.concat(student[i])
          console.log(student[i])
        }
      }
      console.log(searchstulist)
     
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
      this.getweijiaolist()
    },
    tixing(){
  //    app.basic_dialog('开发中','敬请期待')
   //   return 
      //发送提醒通知
      if(this.data.admin!=1){
        app.basic_dialog('该功能目前针对导员开放','敬请期待')
        return 
      }
      const item = {
        thing2: {//打卡名称
          value:'学生体温--检测填报通知'
        },
        time3: {//打卡日期
          value:util.formatTime_day(new Date())
        },
        thing4: {//备注
            value:'提醒您今天还没有打卡'
          },
        thing5: {//提醒内容
            value:'请及时联系负责人，完成体温检测并登记'
          }
      }

    wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url: 'tixing', //云函数路由参数
          student_list:this.data.student_list,
          data:item,//和订阅消息保持一致的推送的消息

        },
        success: res => {
          console.log(res) 
          app.basic_dialog('提醒成功', '已成功发送打卡提醒', '关闭');
        },
        fail: error => {
            console.log(error)
        
        }
      });
    },
})