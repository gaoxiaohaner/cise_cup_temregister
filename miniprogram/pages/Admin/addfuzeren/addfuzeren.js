import  util from '../../../utils/util.js';
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name:'负责人',
        loadModal:false,
    },
    onLoad: function(options) {
        // 设置标题    
        this.setData({
            fudaoyuan:options.adminname,//给学生负责人添加辅导员的姓名
            college:wx.getStorageSync('admin').college,
            admin:wx.getStorageSync('admin').admin
        })

        if(wx.getStorageSync('admin').admin==1){
            wx.setNavigationBarTitle({
                title:"添加负责人"
            });

        }
        else if(wx.getStorageSync('admin').admin==2){
            wx.setNavigationBarTitle({
                title:"添加辅导员"
            });
            this.setData({
                name:'辅导员'
            })
        }
    },



    /**
     * 提交成功
     */
    submit_data: function (e) {
        var that = this;
        var form_data = e.detail.value;
        console.log(form_data)
        // 判断
        if (form_data.adminID == '') {
            app.basic_dialog('未填写', '请填写账号');
            return false;
        }
        if (form_data.fuzeren == '') {
            app.basic_dialog('未填写', '请填写负责人姓名');
            return false;
        }
        if (form_data.passward == '') {
            app.basic_dialog('未填写', '请填写账号密码');
            return false;
        }
        if(this.data.admin==1){
            if (form_data.fudaoyuan == '') {
                app.basic_dialog('未填写', '请填写辅导员姓名');
                return false;
            }
        }

        // 开始加载
        if (that.data.loading == true) {
            return false;
        }
        this.setData({
            loadModal:true
        })
        
        that.show_loading();

        // 提交数据 
        that.close_loading();
        that.data.loading = false;
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'addfuzeren', //云函数路由参数
              data1:form_data,
              admin:wx.getStorageSync('admin').admin
            },
            success: re => {
              console.log(re)
              that.setData({
                loadModal:false
                })
              if(re.result==1){
                  //代表重复了
                  app.basic_dialog('账号已存在', '请重新输入账号');
              }
              else{
                app.basic_dialog('添加成功', '请牢记密码');
                setTimeout(function () {
                    wx.navigateTo({
                        url: '/pages/Admin/addfuzeren/fuzerenlist/fuzerenlist',
                      })
                 }, 1000) //延迟时间 这里是1秒
              }
              
            },
            fail(e) {
              console.log(e)
              that.setData({
                loadModal:false
            })
            }
          });

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

})