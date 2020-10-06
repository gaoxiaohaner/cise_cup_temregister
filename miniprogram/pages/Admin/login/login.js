var app=getApp()
Page({
  data:{
    buttonname:"登录",
    disabled: false,
    popupShow: false,
    adminID:'',
    passward:'',
  },
  onShow(){
    if(wx.getStorageSync('admin')){
      this.setData({
        adminID:wx.getStorageSync('admin').adminID,
        passward:wx.getStorageSync('admin').passward,
      })
    }
  },
  inputMobile: function (e) {
    this.setData({
      adminID: e.detail.value
    })
  },
  inputPwd: function (e) {
    this.setData({
      passward: e.detail.value
    })
  },
  clearInput(e) {
    let type = e.currentTarget.dataset.type
    if (type == 1) {
      this.setData({
        adminID: ''
      })
    } else {
      this.setData({
        passward: ''
      })
    }
  },

  submit_data: function (e) {
    this.getVerificationCode()
    console.log(e)
    var form_data=e.detail.value
    if (this.data.adminID == '') {
        app.basic_dialog('未填写', '请填写账号');
        return false;
    }
    if (this.data.passward == '') {
        app.basic_dialog('未填写', '请填写密码');
        return false;
    }
    //验证身份
    wx.cloud.callFunction({
      name: 'cise',
      data: {
        $url: 'admin_login', //云函数路由参数
        data:form_data,
      },
      success: res => {
        console.log(res)
        wx.setStorageSync('admin', res.result.result.data[0]) 
        //等于1 就证明是正确的账号密码
        if(res.result.flag==1){
          let admin=res.result.result.data[0].admin==0?0:res.result.result.data[0].admin==1?1:res.result.result.data[0].admin==2?2:3//如果证明是高级管理员的话就有admin
          let name=res.result.result.data[0].name?res.result.result.data[0].name:''//这是辅导员的姓名
          wx.navigateTo({
            url: '/pages/Admin/homepage/homepage?fuzeren='+res.result.result.data[0].fuzeren+'&admin='+admin+'&name='+name,
          })
        }
        else{
          app.basic_dialog('验证错误', '请输入正确的帐号和密码');
          wx.removeStorageSync('admin')
         
        }
      },
      fail(e) {
        console.log(e)
      }
    });
  },
 //点击按钮后得延时
 getVerificationCode: function () {
  var that = this
  var num = 2;
  that.setData({
    buttonname:num+ "s",
    disabled: true
  })
  var timer = setInterval(function () {
    num--;
    if (num <= 0) {
      clearInterval(timer);
      that.setData({
        buttonname: '重新输入',
        disabled: false
      })
    } else {
      that.setData({
        buttonname:num + "s",
        disabled: true
      })
    }
  }, 1000)
}
})