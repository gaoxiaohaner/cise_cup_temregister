var wxCharts = require('../../../style/wxcharts.js');
var lineChart = null;
Page({

   data: {
    isMainChartDisplay: true,
    isday_info_display:false,//具体每天的详细信息
    isday_detail_display:false,//具体每天每个门的详细信息
    title_name:"各日期销售详情"
   },

    onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'cise',
      data: {
        $url: 'get_sell_info', //云函数路由参数
      },  
      success: res => {
        console.log(res)
        if(res.result){
            this.setData({
                //sellinfo代表着每个门的销售情况
               // sellinfo:res.result.list
               sellinfo:res.result.list
            })
            this.crawmain();//有结果了再进行绘画
        }
      },
      fail(e) {
        console.log(e)
      }
    });
    },
    touchHandler: function (e) {
      //  console.log(lineChart.getCurrentDataIndex(e));
      if(this.data.isMainChartDisplay){
        this.setData({
            isMainChartDisplay: false,
            isday_info_display:true,

        })
        this.get_day_info(lineChart.getCurrentDataIndex(e));//画具体每天的信息
      }
      else if(this.data.isday_info_display){
          //如果他为真就证明是第二个
          //应该显示具体的每天门的信息了
          this.setData({
            isday_info_display:false,
            isday_detail_display:true
        })
        this.get_day_info_detail(lineChart.getCurrentDataIndex(e));//画具体每天的某个们的信息
      }
      else if (this.data.isday_detail_display){
          //就证明现在已经到具体的某一天了
          //再点击就没有用了
      }
      lineChart.showToolTip(e, {
        // background: '#7cb5ec',
        format: function (item, category) {
            return category + ' ' + item.name + ':' + item.data 
        }
    });

       
    },

    createMainData: function () {
        var categories = [];
        var data1 = [];
        var data2 = [];
        var data3 = [];
        for ( var i = 0; i <this.data.sellinfo.length; i++) {
            categories.push(this.data.sellinfo[i]._id.time_day);
            data1.push(this.data.sellinfo[i].totalmoney); 
            data2.push(this.data.sellinfo[i].total_count);
            data3.push(this.data.sellinfo[i].yajin_money);
            
        }
        return {
            categories: categories,
            data1: data1,
            data2:data2,
            data3:data3
        }
    },
    //给每天的信息格式化
    createDayData: function () {
        var categories = [];
        var data1 = [];
        var data2 = [];
        var data3 = [];
        for (var i = 0; i <this.data.sellinfo_day.length; i++) {
            categories.push(this.data.sellinfo_day[i]._id.dormitory_name);
            data1.push(this.data.sellinfo_day[i].totalmoney);
            data2.push(this.data.sellinfo_day[i].total_count);
            data3.push(this.data.sellinfo_day[i].yajin_money);
            
        }
        return {
            categories: categories,
            data1: data1,
            data2:data2,
            data3:data3
        }
    },
    //画每个们的具体的信息
    createDayDetailData(){
        var categories = [];
        var data1 = [];
        var data2 = [];
        var data3 = [];
        for (var i = 0; i <this.data.sellinfo_day_detail.length; i++) {
            categories.push("卡费"+this.data.sellinfo_day_detail[i]._id.money+"元");
            data1.push(this.data.sellinfo_day_detail[i].totalmoney);
            data2.push(this.data.sellinfo_day_detail[i].total_count);
            data3.push(this.data.sellinfo_day_detail[i].yajin_money);
        }
        return {
            categories: categories,
            data1: data1,
            data2:data2,
            data3:data3
        }
    },
    crawmain: function (e) {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        var simulationData = this.createMainData();
        lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: simulationData.categories,
            animation: true,
            series: [{
                name: '销售金额',
                data: simulationData.data1,
                format: function (val, name) {
                    return val.toFixed(2) + '元';
                }
            },{
                name: '销售数量',
                data: simulationData.data2,
                format: function (val, name) {
                    return val + '个';
                }
            },{
                name: '押金额度',
                data: simulationData.data3,
                format: function (val, name) {
                    return val + '元';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '成交金额 (元)',
                format: function (val) {
                    return val.toFixed(2);
                },
                min: 0
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            dataPointShape: true,
            extra: {
                lineStyle: 'curve'
            }
        });
    },
    //获取点击的天的信息
    get_day_info(whichone){
        var which_day_info=this.data.sellinfo[whichone]._id.time_day
        this.setData({
            day:which_day_info,
            title_name:which_day_info+"日各宿舍楼具体销售详情"
        })
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'get_sell_info_day', //云函数路由参数
              whichday:which_day_info
            },  
            success: res => {
              console.log(res)
              if(res.result){
                  this.setData({
                     sellinfo_day:res.result.list
                  })
                  this.craw_day_info();//有结果了再进行绘画
              }
            },
            fail(e) {
              console.log(e)
            }
          });
    },
    //获取某天的某个们的具体信息
    get_day_info_detail(whichone){
        var which_day_detail=this.data.sellinfo_day[whichone]._id.dormitory_name
        this.setData({
            title_name:this.data.day+"日"+which_day_detail+"销售详情"
        })
        wx.cloud.callFunction({
            name: 'cise',
            data: {
              $url: 'get_sell_info_day_detail', //云函数路由参数
              which_dormitory_name:which_day_detail
            },  
            success: res => {
              console.log(res)
              if(res.result){
                  this.setData({
                     sellinfo_day_detail:res.result.list
                  })
                  this.craw_day_info_detail();//有结果了再进行绘画
              }
            },
            fail(e) {
              console.log(e)
            }
          });
    },
    //画每天的具体信息
    craw_day_info: function (e) {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        var simulationData = this.createDayData();
        lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: simulationData.categories,
            animation: true,
            // background: '#f5f5f5',
            series: [{
                name: '销售金额',
                data: simulationData.data1,
                format: function (val, name) {
                    return val.toFixed(2) + '元';
                }
            },{
                name: '销售数量',
                data: simulationData.data2,
                format: function (val, name) {
                    return val + '个';
                }
            },{
                name: '押金额度',
                data: simulationData.data3,
                format: function (val, name) {
                    return val + '元';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '成交金额 (元)',
                format: function (val) {
                    return val.toFixed(2);
                },
                min: 0
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            enableScroll: false,//这个是可以的滚动的按钮
            dataPointShape: true,
            extra: {
                lineStyle: 'curve'
            }
        });
    },
    //画每个门的具体的详细的信息
    craw_day_info_detail: function (e) {
        var windowWidth = 320;
        try {
            var res = wx.getSystemInfoSync();
            windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
        var simulationData = this.createDayDetailData();
        lineChart = new wxCharts({
            canvasId: 'lineCanvas',
            type: 'line',
            categories: simulationData.categories,
            animation: true,
            // background: '#f5f5f5',
            series: [{
                name: '销售金额',
                data: simulationData.data1,
                format: function (val, name) {
                    return val.toFixed(2) + '元';
                }
            },{
                name: '销售数量',
                data: simulationData.data2,
                format: function (val, name) {
                    return val + '个';
                }
            },{
                name: '押金额度',
                data: simulationData.data3,
                format: function (val, name) {
                    return val + '元';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '成交金额 (元)',
                format: function (val) {
                    return val.toFixed(2);
                },
                min: 0
            },
            width: windowWidth,
            height: 200,
            dataLabel: true,
            enableScroll: false,//这个是可以的滚动的按钮
            dataPointShape: true,
            extra: {
                lineStyle: 'curve'
            }
        });
    },
    backToMainChart(){
        if(this.data.isday_info_display){
            this.setData({
                isMainChartDisplay: true,
                isday_info_display:false,
                isday_detail_display:false,
                title_name:"各日期销售详情"
            });
            this.crawmain();
        }
        else if(this.data.isday_detail_display){
            this.setData({
                isMainChartDisplay: false,
                isday_info_display:true,
                isday_detail_display:false,
                title_name:this.data.day+"日各宿舍楼具体销售详情"
            });
            this.craw_day_info();
        }

    }
})