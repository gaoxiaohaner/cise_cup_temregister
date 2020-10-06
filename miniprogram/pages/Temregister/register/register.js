import  util from '../../../utils/util.js';
const lessonSubId='r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo'
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        disabled: false,//此时此刻能否登记体温
        error_phone:false,
        time:60,
        is_select:false,
        morning_temp:'',
        noon_temp:'',
        night_temp:'',
        time_name:'',
        fuzeren_name: '',
        class_name:'',
        money:'',           //水卡购买时的金额
        dormitory_number: '',        // 宿舍号
        student_name: '',      // 真实姓名
        mobile: '',          // 手机号码
        loading: false,         // 加载
        loadModal:false,
        notices:'',
    },
    onLoad: function(options) {
        // 设置标题    
        wx.setNavigationBarTitle({
            title:"体温登记"
        });
        //改天删掉，这是为了增加信息学院的
       // wx.clearStorageSync()
       // console.log("缓存清理完成")
        if(options.clearstorage){
            //如果 清楚缓存有东西，就证明是一张清理缓存的表
            wx.clearStorageSync()
            console.log("缓存清理完成")
        }

        //这个地方进来的话，可以先判断下场景，是扫码进来的还是咋进来的，然后在进行验证是否已经注册过了
        var that = this;
        that.setData({
            notices:wx.getStorageSync('notices')
        })

        if(wx.getStorageSync('teminfo')){
            that.setData({
                timeday:util.formatTime_day(new Date())
            })
            var  tempinfo=wx.getStorageSync('teminfo');
            that.setData({
             student_xuhao:tempinfo.number,
             fuzeren_name:tempinfo.fuzeren,
             class_name:tempinfo.class_name,
             dormitory_number:tempinfo.dormitory_number,
             stuID:tempinfo.stuID,
             student_name:tempinfo.student_name,
             mobile:tempinfo.mobile,
             fudoayuan:tempinfo.fudaoyuan,
             college:tempinfo.college,
             });
             if(that.data.timeday==tempinfo.time_day){
                 //就证明是今天填写的，如果隔天的话就不用了
                 that.setData({
                    morning_temp:tempinfo.morning_temp+"℃",
                    noon_temp:tempinfo.noon_temp+"℃",
                    night_temp:tempinfo.night_temp+"℃",
                 })
             }
            wx.setNavigationBarTitle({
                title: that.data.fuzeren_name+"组体温填写",
            })
            if(that.judge_storage_time()==1){
                //判断缓存的时间是否和当前时间一致
                console.log(0)
                app.basic_dialog('您已经登记成功', '无需重复登记');
                that.setData({
                 disabled:true
                })
            }
        }
        else{
            that.setData({
                timeday:util.formatTime_day(new Date())
            })
            wx.cloud.callFunction({
                name: 'cise',
                data: {
                  $url: 'find_tempinfo', //云函数路由参数
                  time_day: util.formatTime_day(new Date()),
                },
                success: res => {
                  console.log(res)
                  if(res.result.data.length!=0){
                    console.log(1)
                    app.basic_dialog('您已经登记成功', '无需重复扫码');
                    that.setData({
                        disabled:true
                       })
                    wx.setStorageSync('teminfo',res.result.data[0]);
                    var tempinfo=res.result.data[0]
                        that.setData({
                         student_xuhao:tempinfo.number,
                         fuzeren_name:tempinfo.fuzeren,
                         class_name:tempinfo.class_name,
                         dormitory_number:tempinfo.dormitory_number,
                         stuID:tempinfo.stuID,
                         student_name:tempinfo.student_name,
                         mobile:tempinfo.mobile,
                         fudoayuan:tempinfo.fudaoyuan,
                         college:tempinfo.college,
                         /*
                         morning_temp:tempinfo.morning_temp,
                         noon_temp:tempinfo.noon_temp,
                         night_temp:tempinfo.night_temp
                         */
                        })
                         wx.setNavigationBarTitle({
                            title: that.data.fuzeren_name+"组体温填写",
                         })
                  }
                },
                fail(e) {
                  console.log(e)
                }
              });
        }

        //这个id就是在哪个公寓
        if (options.fuzeren) {
            that.data.fuzeren_name = options.fuzeren
            that.setData({
                fuzeren_name:that.data.fuzeren_name
            });
            wx.setNavigationBarTitle({
                title: that.data.fuzeren_name+"组体温填写",
              })
        }

        //其实可以判断字段是否存在，来限制他的登录
      //  Command.exists


       if(wx.getStorageSync('scene')==1047){
           console.log("说明是扫码直接进入得这个页面")
           //这样进行验证它是否是
           if(wx.getStorageSync('teminfo')){
               //代表注册了
               if(that.judge_storage_time()==1){
                   //判断缓存的时间是否和当前时间一致
                   console.log(2)
                   app.basic_dialog('您已经登记成功', '无需重复登记');
                   that.setData({
                    disabled:true
                   })
               }
           }
           else{
               //代表着我还手机这种情况，但是现在可以不用考虑，当时。直接让他们从主页面进，不然并发量不够
              
               wx.cloud.callFunction({
                name: 'cise',
                data: {
                  $url: 'find_tempinfo', //云函数路由参数
                  time_day: util.formatTime_day(new Date()),
                },
                success: res => {
                  console.log(res)
                  if(res.result.data.length!=0){
                    console.log(3)
                    app.basic_dialog('您已经登记成功', '无需重复扫码');
                    that.setData({
                        disabled:true
                    })
                    wx.setStorageSync('teminfo',res.result.data[0]);
                    var tempinfo=res.result.data[0] 
                        that.setData({
                         student_xuhao:tempinfo.number,
                         fuzeren_name:tempinfo.fuzeren,
                         class_name:tempinfo.class_name,
                         dormitory_number:tempinfo.dormitory_number,
                         stuID:tempinfo.stuID,
                         student_name:tempinfo.student_name,
                         mobile:tempinfo.mobile,
                         fudoayuan:tempinfo.fudaoyuan,
                         college:tempinfo.college,
                        })
                         wx.setNavigationBarTitle({
                            title: that.data.fuzeren_name+"组体温填写",
                         })
                  }
                },
                fail(e) {
                  console.log(e)
                }
              });
           }
       }


    },

    judge_storage_time(){
        let tempinfo=wx.getStorageSync('teminfo')
        let time__day=util.formatTime_day(new Date())
        if(tempinfo.time_day==time__day){
            //如果日期都一样就证明填过了。
            this.setData({
                timeday:time__day
            })
            return 1

        }
        return 0
    },
    onShareAppMessage: function() {
        return app.share_path
    },

    /**
     * 获取手机号码
     */
    get_mobile(e) {
        // 判断授权，没有授权
        var that = this;
        if (that.data.loading) {
            return false;
        }
        // 显示加载
        that.show_loading();
        console.log(e)

        // 判断当前用户手机的版本
        if (wx.canIUse('button.open-type.getPhoneNumber')) {
            if (e.detail.errMsg == "getPhoneNumber:ok") {
                wx.login({
                    success: function (res) {
                       // var encrypt_data = encodeURIComponent(e.detail.encryptedData);

                       wx.cloud.callFunction({
                           name:'cise',
                           data:{
                            $url: 'getmobile', //云函数路由参数
                            weRunData: wx.cloud.CloudID(e.detail.cloudID),
                           } 
                       }).then(res=>{
                           console.log(res)
                                that.data.mobile = res.result;
                                that.setData({
                                    mobile: that.data.mobile
                                })
                                that.close_loading();
                        }).catch(err=>{
                            console.log(err)
                            that.close_loading();
                            app.toast_none('获取失败！');
                            that.setData({
                                error_phone:true
                            })

                        })
                    },
                });
            } else {
                that.close_loading();
            }
        } else {
            // 显示加载
            that.close_loading();
            app.toast_none('版本过低,请升级微信版本')
        }
    },

    /**
     * 设置负责人的名称
     */
    set_fuzeren_name: function (e) {
        var that = this;
        that.data.fuzeren_name = that.data.fuzeren[e.detail.value];
        that.setData({
            fuzeren_name: that.data.fuzeren_name
        })
        wx.setNavigationBarTitle({
          title: that.data.fuzeren_name+"组体温填写",
        })
    },
    mobileinput(e){
        console.log(e)
        this.setData({
            mobile:e.detail.value
        })
    },
        /**
     * 设置班级的名称
     */
    set_class_name: function (e) {
        var that = this;
        that.data.class_name = that.data.class[e.detail.value];
        that.setData({
            class_name: that.data.class_name
        })
    },
    inputTyping(e) {
      this.setData({
        inputVal: e.detail.value,
      }, () => {
        this.searchstudent(this.data.inputVal)
      })
    },
    searchstudent(e) {
      const db = wx.cloud.database({})
      db.collection('student')
      .where({
        stuID: db.RegExp({
            regexp: '.*' + this.data.inputVal,
            options: 'i',
          })
        })
        .get({
          success: res => {
              console.log(res.data)
              if(res.data.length==1){
                  var studentinfo=res.data[0]
                  console.log(studentinfo)
                  this.setData({
                        student_xuhao:studentinfo.number,
                        fuzeren_name:studentinfo.fuzeren,
                        class_name:studentinfo.class_name,
                        dormitory_number:studentinfo.dormitory_number,
                        student_name:studentinfo.student_name,
                        fudoayuan:studentinfo.fudaoyuan,
                        college:studentinfo.college,
                   })
                    wx.setNavigationBarTitle({
                       title: that.data.fuzeren_name+"组体温填写",
                    })
              }
          }
        })
    },



    /**
     * 提交成功
     */
    submit_data: function (e) {
                // 开始加载
        //先让他统一订阅消息使用再说
        if (this.data.loading == true) {
            return false;
        }
        this.show_loading();

        let that =  this
        wx.showModal({
            title: '提示',
            content: '当前填报日期为'+this.data.timeday,
            success: function (res) {
                if (res.confirm) {
                   //调用订阅消息
                   wx.requestSubscribeMessage({
                    tmplIds: [lessonSubId],
                    success:res => {
                     console.log(res)
                     console.log(res.r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo)
                     if(res.r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo=="accept"){
                         console.log("接受订阅申请")
                        that.upload_register_info(e)
                     }else if(res.r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo=="reject"){
                         console.log("拒绝接受订阅申请")
                           that.upload_register_info(e)
                      //   app.basic_dialog('提醒','未防止同学们晨午晚检漏报，方便导员、负责人发送消息提醒，请选择接受订阅消息','yes,ok')
                     }
        
                    },
                    fail(res){
                        console.log(res)
                        that.close_loading();
                    }
                  })
                } else if (res.cancel) {
                    that.close_loading();
                    console.log('用户点击取消');
                }
            },
            fail(e){
                that.close_loading();
            }
        });


    },
    //这才是真正的上传信息
    upload_register_info(e){

        var that = this;
        var form_data = e.detail.value;
        form_data.number=that.data.student_xuhao,//学生的序号
        form_data.mobile= that.data.mobile;
        form_data.fudaoyuan= that.data.fudoayuan,//辅导员的名字
        form_data.time = util.formatTime(new Date());
        form_data.time_day = util.formatTime_day(new Date());//销售的日子，落实到几号
        console.log(form_data)
        // 判断
        if (form_data.stuID == '') {
            that.close_loading();
            app.basic_dialog('未填写', '请填写学号');
            return false;
        }
        else if (form_data.stuID.length == '') {
            that.close_loading();
            app.basic_dialog('填写错误', '学号长度不正确');
            return false;
        }
        else if (form_data.student_name == '') {
            that.close_loading();
            app.basic_dialog('未填写', '请填写姓名');
            return false;
        }
        else if (form_data.class_name == '') {
            that.close_loading();
            app.basic_dialog('未填写', '请填写班级');
            return false;
        }

        else if (form_data.dormitory_name == '') {
            that.close_loading();
            app.basic_dialog('未填写', '请填写宿舍号');
            return false;
        }
        else if (form_data.fuzeren_name == '') { 
            that.close_loading();
            app.basic_dialog('未填写', '请填写负责人名称');
            return false;
        }
        else if (form_data.mobile == '') {
            that.close_loading();
            app.basic_dialog('未填写', '请填写手机号码');
            return false;
        }
        else if (form_data.mobile.length != 11) {
            that.close_loading();
            app.basic_dialog('填写错误', '手机号码长度不正确');
            return false;
        }
        else if (form_data.morning_temp == '') {
            that.close_loading();
            app.basic_dialog('未填写!', '请填写早晨体温');
            return false;
        }
        else if (form_data.noon_temp == '') {
            that.close_loading();
            app.basic_dialog('未填写!', '请填写中午体温');
            return false;
        }
        else  if (form_data.night_temp == '') {
            that.close_loading();
            app.basic_dialog('未填写!', '请填写晚间体温');
            return false;
        }

        this.setData({
            loadModal:true
        })

        wx.getUserInfo({
             success: function (res) {
            //是否允许发送订阅消息
            /*
            wx.requestSubscribeMessage({
                tmplIds: ['r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo'],
                success:res => {
                 console.log(res.r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo)
                    if(res.r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo=='reject'){
                        that.setData({
                            loadModal:false
                        })
                        that.close_loading();
                        return false
                    }
                    else{


                }
                }
              })
              */
                        //如果接受的话，就会继续上报
                        wx.cloud.callFunction({
                            name: 'cise',
                            data: {
                              $url: 'register', //云函数路由参数
                              data1:form_data,
                              data2:res.userInfo
                            },
                            success: re => {
                              console.log(re)
                              wx.setStorageSync('teminfo',form_data);
                              wx.setStorageSync('userinfo',res.userInfo);
                              that.setData({
                                loadModal:false
                                 }) 
                                 if(form_data.morning_temp>=37.3||form_data.noon_temp>=37.3||form_data.night_temp>=37.3){
                                     console.log('体温异常向负责人发送短信')
                                     that.send_hot_warning(form_data);//如何体温比较的高，向导员什么的发送消息提醒。
                                 }

                              

                                 that.close_loading();
                                 app.basic_dialog('体温登记成功', '如有异常请及时上报');
                             
                              setTimeout(function () {
                                wx.reLaunch({
                                    url: '/pages/index/index',
                                  })
                                  if(that.data.notices!='')
                                    app.basic_dialog(that.data.notices[0]+that.data.notices[1]+that.data.notices[2]+that.data.notices[3],that.data.notices,'奥里给'); 
                               }, 1000) //延迟时间 这里是1秒
            
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
        })
    },
    send_hot_warning(form_data){
        //高烧提醒
        console.log(form_data)
        const item = {
            thing1: {//打卡名称
              value:form_data.class_name+form_data.student_name+'体温--高烧上报'
            },
            date2: {//打卡日期
              value:util.formatTime_day(new Date())
            },
            thing3: {//备注
                value:'点击进入小程序查看详情'
              },
          }
    
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'hot_warning', //云函数路由参数
              data:item,//和订阅消息保持一致的推送的消息
              fudaoyuan:wx.getStorageSync('teminfo').fudaoyuan,
            },
            success: res => {
              console.log(res) 
    
            },
            fail: error => {
                console.log(error)
            
            }
          });
    },
    go_shuoming:function(){
        wx.navigateTo({
            url: 'shuoming/shuoming',
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
    onPullDownRefresh(){
        this.show_loading()
        let that=this
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'find_tempinfo', //云函数路由参数
              time_day: util.formatTime_day(new Date()),
            },
            success: res => {
              console.log(res)
              that.close_loading()
              if(res.result.data.length!=0){
                app.basic_dialog('您已经登记成功', '无需重复扫码');
                that.setData({
                    disabled:true
                   })
                wx.setStorageSync('teminfo',res.result.data[0]);
                var tempinfo=res.result.data[0]
                    that.setData({
                     student_xuhao:tempinfo.number,
                     fuzeren_name:tempinfo.fuzeren,
                     class_name:tempinfo.class_name,
                     dormitory_number:tempinfo.dormitory_number,
                     stuID:tempinfo.stuID,
                     student_name:tempinfo.student_name,
                     mobile:tempinfo.mobile,
                     fudoayuan:tempinfo.fudaoyuan,
                     college:tempinfo.college,
                     /*
                     morning_temp:tempinfo.morning_temp,
                     noon_temp:tempinfo.noon_temp,
                     night_temp:tempinfo.night_temp
                     */
                    })
                     wx.setNavigationBarTitle({
                        title: that.data.fuzeren_name+"组体温填写",
                     })
            
              }
            },
            fail(e) {
              console.log(e)
              that.close_loading()
            }
          });
      }
      
})