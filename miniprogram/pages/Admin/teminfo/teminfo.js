import  util from '../../../utils/util.js';
var app = getApp();
Page({

    data: {
       student_info:'',
    },
    onLoad: function(options) {
        var that = this;

        that.setData({
            student_info:JSON.parse(options.teminfo)
        })
        var student_info=JSON.parse(options.teminfo)
        // 设置标题    
        wx.setNavigationBarTitle({
            title:student_info.student_name+"登记信息信息"
        });
        that.setData({
            student_xuhao:student_info.number,
            fuzeren_name:student_info.fuzeren,
            class_name:student_info.class_name,
            dormitory_number:student_info.dormitory_number,
            stuID:student_info.stuID,
            student_name:student_info.student_name,
            mobile:student_info.mobile,
            fudoayuan:student_info.fudaoyuan,
            morning_temp:student_info.morning_temp,
            noon_temp:student_info.noon_temp,
            night_temp:student_info.night_temp
           })
    },

   
    /**
     * 登记说明
     */
    go_privacy:function(){
        wx.navigateTo({
            url: '../../Temregister/register/shuoming/shuoming',
        })
    },


    /**
     * 显示加载中
     */
    show_loading: function () {
        var that = this;
        that.data.loading = true;
        app.show_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },

    /**
     * 关闭加载中
     */
    close_loading: function () {
        var that = this;
        that.data.loading = false;
        app.close_nav_loading();
        that.setData({
            loading: that.data.loading
        });
    },
    submit_data: function (e) {

        var that = this;
        var form_data = e.detail.value;
        form_data.time = util.formatTime(new Date());
        console.log(form_data)
        if (form_data.morning_temp == '') {
            app.basic_dialog('未填写!', '请填写早晨体温');
            return false;
        }
        if (form_data.noon_temp == '') {
            app.basic_dialog('未填写!', '请填写中午体温');
            return false;
        }
        if (form_data.night_temp == '') {
            app.basic_dialog('未填写!', '请填写晚间体温');
            return false;
        }

        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        
        that.show_loading();
        // 提交数据 
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'correct_teminfo', //云函数路由参数
              data1:form_data,
              _id:that.data.student_info._id
            },
            success: res => {
              console.log(res)
              that.close_loading();
              that.data.loading = false;
              wx.navigateBack({
              })
            },
            fail(e) {
            that.close_loading();
            that.data.loading = false;
              console.log(e)
            }
          });
    },


})