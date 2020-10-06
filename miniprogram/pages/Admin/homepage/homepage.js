import  util from '../../../utils/util.js';
const lessonSubId="zmZgsPb85Tw49hqqWhLxFoQA84nND5fjrzAU5lZdJsQ"
var app = getApp();
Page({

    data: {
        isHidden: false,
        loadModal:false,
        time_name:'',
        today_djinfo:'',
        today_djycinfo:'',
        data1:0,
        data2:0,
        data3:0,
        data4:0,
        data5:0,
        admin:0,//不是我
        ifupload:1,//是否开启上传学生名单的通道
        weijiao:0,//未交人员名单的开发中
        adminname:'',
        //日期选择的
        startYear: 1980,
        endYear: 2030,
        type:2,
        whichtype:'',//选择的哪个功能的type
        whichtime_day:'',//格式正常的样子
        whichtime_day2:'',//方便导出的第二个样子
        college:'',//学院的名称
        notices:'',//初试是空的
    },
    onLoad: function (options) {

        var that = this;
        if (options.fuzeren) {
            this.setData({
              fuzeren_name:options.fuzeren
            })
            wx.setStorageSync('fuzeren',options.fuzeren)
        }  
        if(options.admin==1){
          //证明是辅导员
          that.setData({
            admin:1,
            adminname:options.name//我是辅导员我的姓名是
          })
        }
        else if(options.admin==2){
          //证明是书记，学院 级别啊
          that.setData({
            admin:2,
            adminname:options.name//于书记的姓名
          })
        }
        else if(options.admin==3){
          //证明管理员
          that.setData({
            admin:3,
            adminname:options.name//于书记的姓名
          })
        }
        this.setData({
          timeday: util.formatTime_day(new Date())//销售的日子，落实到几号
        })
        //显示紧急的通知公告
        //借助admin 控制是否显示
        this.get_notices()

    },
    onShow: function () {
      this.setData({
        whichtime_day:util.formatTime_day(new Date()),//格式正常的样子
        whichtime_day2:util.formatTime_day2(new Date()),//方便导出的第二个样子
      })
      this.get_djinfo()
    
    },
    send_hot_warning(){
      //让导员接受发送高温消息提醒
              //先让他统一订阅消息使用再说
              wx.requestSubscribeMessage({
                tmplIds: [lessonSubId],
                success:res => {
                 console.log(res)
                 console.log(res.zmZgsPb85Tw49hqqWhLxFoQA84nND5fjrzAU5lZdJsQ)
                 if(res.zmZgsPb85Tw49hqqWhLxFoQA84nND5fjrzAU5lZdJsQ=="accept"){
                     console.log("接受订阅申请")
                     //更改导员的openid
                    this.corrent_daoyuan_openid()
                 }else if(res.zmZgsPb85Tw49hqqWhLxFoQA84nND5fjrzAU5lZdJsQ=="reject"){
                     console.log("拒绝接受订阅申请")
                     app.basic_dialog('提醒','接受订阅消息可以即时接收同学们的体温异常情况','yes,ok')
                 }
    
                },
                fail(res){
                    console.log(res)
                }
              })
    },
    corrent_daoyuan_openid(){
      //更改导员的_openid
      wx.cloud.callFunction({
        name: 'cise',
        data: { 
          $url: 'corrent_daoyuan_openid', //云函数路由参数
          name:wx.getStorageSync('admin').name,
        },
        success: res => {
          console.log(res)
         
        },
        fail(e) {
          console.log(e)
        }
      });

    },
    get_notices(){
      wx.cloud.callFunction({
          name: 'cise',
          data: { 
            $url: 'get_admin_notice', //云函数路由参数
          },
          success: res => {
            console.log(res)
            if(res.result){
              if(res.result.data[0].content_admin){
                this.setData({
                  notices:res.result.data[0].content_admin
                })
                app.basic_dialog('管理员通知公告', res.result.data[0].content_admin);
              }
            }
          },
          fail(e) {
            console.log(e)
          }
        });
  },

     /**
     * 得到当前时间段的销售情况
     */
    get_djinfo(){
      let that=this
      console.log(util.formatTime_day(new Date()))
      wx.cloud.callFunction({
        name: 'cise',
        data: { 
          $url: 'get_now_djinfo', //云函数路由参数
          time_day:util.formatTime_day(new Date()),//具体的日子
          fuzeren:this.data.fuzeren_name,//负责人是第几组的
          adminname:this.data.adminname,//万一是导员看的话
          college:wx.getStorageSync('admin').college,
          admin:wx.getStorageSync('admin').admin,
        },
        success: res => {
          console.log(res)
          that.setData({
            data1:res.result.result1.total,
            data2:res.result.result2.total,
            data3:res.result.result3.total,
            data4:res.result.result4.total,
            data5:res.result.result5.total,
          })
        },
        fail(e) {
          console.log(e)
        }
      });
    },
    //具体找到异常人员信息都有谁
    yichanginfo(){
      wx.navigateTo({
        url: '/pages/Admin/yichanginfo/yichanginfo',
      })
    },

    /**
     * 打印登记注册码
     */
    create_qrcode: function() {
      this.setData({
        loadModal:true
      })
      let that=this
      if(!that.data.admin){
        wx.cloud.callFunction({
          name: 'cise', 
          data: {
            $url: 'getwxacode', //云函数路由参数
           // path:'pages/Watercard/register/register?id='+2,
           // name:'2号楼', 
              path:'pages/Temregister/register/register?fuzeren='+that.data.fuzeren_name,
              name:that.data.fuzeren_name+'组登记码', //从0开始的，但是要让他从一开始
          },
          success: res => {
            console.log(res)     
            wx.cloud.downloadFile({
              fileID: res.result.fileID,
            }) .then(res=>{
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success (res) {
                  that.setData({
                    loadModal:false
                  })
                  console.log(res)
                    if (res.statusCode === 200) {
                      wx.showToast({
                        title: '图片下载成功',
                      })
                    }
                },
                fail(e){
                  console.log(e)
                  that.setData({
                    loadModal:false
                  })
                }
           })
              
            })
    
          },
          fail(e) {
            console.log(e)
            that.setData({
              loadModal:false
            })
          }
        });
      }
      else{
        //为辅导员的话或者管理端的话
        wx.cloud.callFunction({
          name: 'cise', 
          data: {
            $url: 'getwxacode', //云函数路由参数
           // path:'pages/Watercard/register/register?id='+2,
           // name:'2号楼', 
              path:'pages/Temregister/register/register?clearstorage='+1,//证明有东西 要清理掉缓存再说
              name:this.data.adminname+'登记码', //从0开始的，但是要让他从一开始
          },
          success: res => {
            console.log(res)     
            wx.cloud.downloadFile({
              fileID: res.result.fileID,
            }) .then(res=>{
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success (res) {
                  that.setData({
                    loadModal:false
                  })
                  console.log(res)
                    if (res.statusCode === 200) {
                      wx.showToast({
                        title: '图片下载成功',
                      })
                    }
                },
                fail(e){
                  console.log(e)
                  that.setData({
                    loadModal:false
                  })
                }
           })
              
            })
    
          },
          fail(e) {
            console.log(e)
            that.setData({
              loadModal:false
            })
          }
        });
      }

    },


    /**
     *今日的登记信息导出Excel -负责人
     */
    down_today_excel(){

      this.setData({
        loadModal:true
      })
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url: 'down_today_excel', //云函数路由参数
          fuzeren:this.data.fuzeren_name,//哪个组的id
          fuzeren_name:this.data.fuzeren_name,
          timeday2:util.formatTime_day2(new Date()),//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:util.formatTime_day(new Date())
        },  
        success: res => {
          console.log(res)
          if(res.result){
            this.getFileUrl(res.result.fileID.fileID)
          }
          else{

            this.setData({
              loadModal:false
            })
            app.basic_dialog('下载错误', '数据可能为空', '关闭');
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
    //导员的
    down_daoyuan_today_excel(){
      this.setData({
        loadModal:true
      })
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url: 'down_daoyuan_today_excel', //云函数路由参数
          fudaoyuan:this.data.adminname,
          timeday2:util.formatTime_day2(new Date()),//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:util.formatTime_day(new Date())
        },  
        success: res => {
          console.log(res)
          if(res.result){
            this.getFileUrl(res.result.fileID.fileID)
          }
          else{

            this.setData({
              loadModal:false
            })
            app.basic_dialog('下载错误', '数据可能为空', '关闭');
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
    //学院级别 的今日信息
    down_college_today_excel(){
      this.setData({
        loadModal:true
      })
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url: 'down_college_today_excel', //云函数路由参数
          timeday2:util.formatTime_day2(new Date()),//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:util.formatTime_day(new Date()),
          college:wx.getStorageSync('admin').college,
          admin:wx.getStorageSync('admin').admin,

        },  
        success: res => {
          console.log(res)
          if(res.result){
            this.getFileUrl(res.result.fileID.fileID)
          }
          else{

            this.setData({
              loadModal:false
            })
            app.basic_dialog('下载错误', '数据可能为空', '关闭');
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
    

  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl(fileID) {
    let that = this;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log("文件下载链接", res.fileList[0].tempFileURL)
        that.setData({
          fileUrl: res.fileList[0].tempFileURL,
          isHidden: false,
        })
        that.setData({
          loadModal:false
        })
        //将弹窗打开
        that.selectComponent("#authorCardId").showMask();

        that.downloadFile()
      },
      fail: err => {
        // handle error
        that.setData({
          loadModal:false
        })
      }
    })
  },
  //复制excel文件下载链接
  copyFileUrl() {
    let that = this
    wx.setClipboardData({
      data: that.data.codeUrl,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log("复制成功", res.data) // data
          }
        })
      }
    })
  },

  /**
  
  * 下载文件并预览
  
  */

  downloadFile() {
    let that = this

    let url = that.data.fileUrl;
    wx.downloadFile({
      url: url,
      header: {},
      success: function (res) {
        var filePath = res.tempFilePath;
        console.log(filePath);
        wx.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          },
          fail: function (res) {
            console.log(res);
          },
          complete: function (res) {
            console.log(res);
          }
        })
      },
      fail: function (res) {
        console.log('文件下载失败');
      },
      complete: function (res) { },
    })
  },

    /**
     * 进入登记列表中
     */
    go_list: function() {
   //  app.basic_dialog('暂未开通', '敬请期待');
        wx.navigateTo({
            url: '../manage/manage',
        })
    },
    //上传excel学生名单
    uploadexcel(){
      if(this.data.admin!=3){
        app.basic_dialog('暂无权限', '暂无权限');
        return 0
      }
      if(this.data.ifupload==0){
        app.basic_dialog('暂未开放', '敬请等候');
        return 0
        
      }

      let that=this
      wx.chooseMessageFile({
      count:1,
      type:'file',
      success(res){
        let path=res.tempFiles[0].path;
        console.log("选择excel成功",path)
        that.uploadExcel(path)
      }
    })
    },
    uploadExcel(path){
      let that=this
      wx.cloud.uploadFile({
        cloudPath:new Date().getTime()+'.xls',
        filePath:path,//文件路径
        success:res=>{
          console.log("上传成功",res.fileID)
          that.jiexi(res.fileID)
        },
        fail:err=>{
          console.log("上传失败",err)
        }
      })
    },
    jiexi(fileId){
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url: "uploadexcel", //云函数路由参数
          fileID:fileId
        },
        success(res){
          console.log("解析上传成功",res)
        },
        fail(res){
          console.log("解析失败",res)
        }
      })
    },
    analysis(){
      app.basic_dialog('开发中', '敬请期待');
      /*wx.navigateTo({
        url: '../analysis/analysis',
      })*/
    },
    //将所有的日期的该组的生成excel表格-负责人    //辅导员//学院领导
    down_date_all_excel(){
      this.setData({
        loadModal:true
      })
      let that=this
      var admin=wx.getStorageSync('admin').admin
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url:admin==0?'down_zu_all_excel':admin==1?'down_daoyuan_zu_all_excel':'down_college_zu_all_excel', //云函数路由参数
          fudaoyuan:admin==0?wx.getStorageSync('admin').fudaoyuan:wx.getStorageSync('admin').fuzeren,
          fuzeren:that.data.fuzeren_name,//哪个组的id
          fuzeren_name:that.data.fuzeren_name,
          timeday2:that.data.whichtime_day2,//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:that.data.whichtime_day,
          college:wx.getStorageSync('admin').college,
          admin:wx.getStorageSync('admin').admin,

        },  
        success: res => {
          console.log(res)
          if(res.result){
            that.getFileUrl(res.result.fileID.fileID)
          }
          else{

            that.setData({
              loadModal:false
            })
            app.basic_dialog('下载错误', '数据可能为空', '关闭');
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
    add_fuzeren(){
      if(this.data.admin==0){
        app.basic_dialog('暂无权限', '暂无权限');
        return 0
      }
      //添加负责人的信息
      wx.navigateTo({
        url: '/pages/Admin/addfuzeren/addfuzeren?adminname='+this.data.adminname,
      })
    },
    down_weijiao_excel(){
      /*
      if(this.data.weijiao==0){
        app.basic_dialog('开发中', '莫慌.');
        return 0
      }
      */

      //未交人员名单
      this.setData({
        loadModal:true
      })
      let that=this
      var admin= wx.getStorageSync('admin').admin
      wx.cloud.callFunction({
        name: 'cise',
        data: {
          $url:admin==0?'down_fuze_weijiao_excel':admin==1?'down_daoyuan_weijiao_excel':'down_college_weijiao_excel', //云函数路由参数
          fudaoyuan:admin==0?wx.getStorageSync('admin').fudaoyuan:wx.getStorageSync('admin').fuzeren,
          fuzeren:that.data.fuzeren_name,
          timeday2:that.data.whichtime_day2,//整个是为了 输出转义字符做的，用2020.9.3代题
          timeday:that.data.whichtime_day,
          college:wx.getStorageSync('admin').college,
          admin:wx.getStorageSync('admin').admin,
        },  
        success: res => {
          console.log(res)
          if(res.result){
            that.getFileUrl(res.result.fileID.fileID)
          }
          else{

            that.setData({
              loadModal:false
            })
            app.basic_dialog('下载错误', '数据可能为空', '关闭');
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
    onPullDownRefresh(){
      this.get_djinfo()
    },
    fuzereninfo(){
      wx.navigateTo({
        url: '/pages/Admin/addfuzeren/fuzerenlist/fuzerenlist',
      })
    },
    weijiaolist(){
      wx.navigateTo({
        url: '/pages/Admin/weijiaolist/weijiaolist',
      })
    },
    chooseDate(e){
      console.log(e)
      this.dateTime.show();
      this.setData({
        whichtype:e.currentTarget.dataset.type//看看选择的是哪个功能上的
      })
    },
    //日期的哪个函数
    change: function (e) {
      console.log(e)
      var date=e.detail
      this.setData({
        whichtime_day2:date.result,
        whichtime_day:date.year+"/"+date.month+"/"+date.day
      })
      switch (this.data.whichtype) {
        case '1':
          this.down_date_all_excel()
          break;
        case '2':
          /*
          if(this.data.admin==2){
            app.basic_dialog('暂停服务','针对学院，该功能正在完善中 ','确认')
            return
          }
          */
          this.down_weijiao_excel()
          break;
        default:
          break;
      }
    },
    //将日期的组件先进行绑定
    onReady: function (options) {
      this.dateTime = this.selectComponent("#tui-dateTime-ctx")
    },
//
    correct_notices(e){
      var type=e.currentTarget.dataset.type
      wx.navigateTo({
        url: '../notices/notices?type='+type,
      })

    },
})