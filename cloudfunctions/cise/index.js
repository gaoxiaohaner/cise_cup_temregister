// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router'); //云函数路由
cloud.init({
  env:'test-second'
})
const MAX_LIMIT = 100
const db = cloud.database();
const _ = db.command
const $ = db.command.aggregate
var xlsx=require('node-xlsx')
const  fuzeren=['孙啸峰、蒋佳祺','王荣亮、高仓健','高涵、马博闻','王赫萌、袁秋晨']

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  });
  //获取用户手机号码的云函数
  app.router('getmobile', async (ctx) => {
    var moblie = event.weRunData.data.phoneNumber; 
    ctx.body =moblie;
  });
  app.router('test', async (ctx) => {
    try{
      /*
      这个可以判断个集合中的数据
      ctx.body=await db.collection('student_back').aggregate()
      .project({
        stock: $.filter({
         input: '$tianbaodate',
         as: 'item',
         cond: $.gte(['$$item.haha', 11])
        })
      })
      .end()
      */
      ctx.body=await db.collection('student_back').aggregate()
      .project({
          included: $.in([event.time_day, '$tianbaodate']),
          class_name:1,
          college:1,
          dormitory_number:1,
          fudaoyuan:1,
          fuzeren:1,
          mobile:1,
          number:1,
          stuID:1,
          student_name:1,
       })
       .match({
        included:true
       })
       .sort({
         college:1,
         fudaoyuan:1,
         number:1,
       })
      .end()
      

      /*
      ctx.body=await db.collection('student_back')
      .where({
        _id:"7498b5fe5f570235012b869a1828dfd3"
      }).update({
        data: {
          tianbaodate: _.push([event.time_day])
        }
      })
      */
    }catch(e){

    }
  })

  app.router('register', async (ctx) => {
    try {
      /*
        如何现在数据库中判断他有没有这个数据，不然还是先remove 然后再 add????
      */
      result1=await db.collection('TemregisterInfo')
      .add({
        data: { 
          _openid:wxContext.OPENID,
          fuzeren:event.data1.fuzeren,
          class_name:event.data1.class_name,
          dormitory_number:event.data1.dormitory_number,
          stuID:event.data1.stuID,
          student_name:event.data1.student_name,
          mobile:event.data1.mobile,
          morning_temp:parseFloat(event.data1.morning_temp),
          noon_temp:parseFloat(event.data1.noon_temp),
          night_temp:parseFloat(event.data1.night_temp),
          dengji_time:event.data1.time,
          time_day:event.data1.time_day,
          fudaoyuan:event.data1.fudaoyuan,//辅导员是谁
          number:parseInt(event.data1.number),//每个学生对应的序号
          userinfo:event.data2,//用户的信息
          college:event.data1.college?event.data1.college:"信息学院",//暂时用信息学院

        }
      })
      result2= await db.collection('student')
      .where({
        stuID:event.data1.stuID,
      }).update({
        data: {
          _openid:wxContext.OPENID,//当他们不是空的时候修改
        }
      })
      result3 = await db.collection('student_back')
      .where({
        stuID:event.data1.stuID,
      }).update({
        data: {
          _openid:wxContext.OPENID,//当他们不是空的时候修改
          tianbaodate: _.push([event.data1.time_day,])
        }
      })

      ctx.body={
        result1,
        result2,
        result3
      }
    } 
    catch(e){
    }
  });
  //获取扫描的小程序码
  app.router('getwxacode', async (ctx) => {
    try {
      const result = await cloud.openapi.wxacode.get({
        path: event.path,
        width:430
      })
      ctx.body=await cloud.uploadFile({
        cloudPath:'学生公寓登记注册码/'+event.name+'.png',
        fileContent:result.buffer
      })

    } 
    catch(e){
    }
  });
  //获取用户的个人信息
  app.router('getuser', async (ctx) => {
    try {
      ctx.body=await db.collection('user').where({
          _openid:wxContext.OPENID,
      }).get()

    } 
    catch(e){
    }
  });
  //获取已经登记的今日的学生列表-负责人
  app.router('get_today_info_list_fuzeren', async (ctx) => {
    try {
        const countResult = await db.collection('TemregisterInfo').where({
          fuzeren:event.fuzeren,
          time_day:event.timeday,
        }).count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            fuzeren:event.fuzeren,
            time_day:event.timeday,
          }).orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        ctx.body=result

    } 
    catch(e){
    }
  });
  //获取学生的列表今日的这是导员的
  app.router('get_today_info_list_admin', async (ctx) => {
    try {
        const countResult = await db.collection('TemregisterInfo').where({
          fudaoyuan:event.fuzeren,
          time_day:event.timeday,
        }).count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            fudaoyuan:event.fuzeren,
            time_day:event.timeday,
          }).orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        ctx.body=result

    } 
    catch(e){
    }
  });
    //获取学生的列表今日的这是学院领导的
  app.router('get_today_info_list_college', async (ctx) => {
    try {
        const countResult = await db.collection('TemregisterInfo').where({
          college:event.college,
          time_day:event.timeday,
        }).count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            college:event.college,
            time_day:event.timeday,
          })
          .orderBy('fudaoyuan','asc')//先按照辅导员排序，然后在是辅导员管理的学生
          .orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        ctx.body=result

    } 
    catch(e){
    }
  });
  //修改学生登记的体温信息
  app.router('correct_teminfo', async (ctx) => {
    try {
      ctx.body=await db.collection('TemregisterInfo').where({
          _id:event._id,
      }).update({
        data:{
          morning_temp:parseFloat(event.data1.morning_temp),
          noon_temp:parseFloat(event.data1.noon_temp),
          night_temp:parseFloat(event.data1.night_temp),
        }
      })

    } 
    catch(e){
    }
  });
  //查询学生登记体温的信息，防止意外情况重复登记
  app.router('find_tempinfo', async (ctx) => {
    try {
      ctx.body=await db.collection('TemregisterInfo').where({
        _openid:wxContext.OPENID,
        time_day:event.time_day,
      }).get()
    } 
    catch(e){
    }
  });
  
//这一组今天的体温登记情况负责人的
  app.router('down_today_excel', async (ctx) => {
    try {
     const countResult = await db.collection('TemregisterInfo').where({
      fuzeren:event.fuzeren_name,
      time_day:event.timeday,
     })
     .orderBy('number', 'asc')//按照升序排
     .count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('TemregisterInfo').where({
          fuzeren:event.fuzeren_name,
          time_day:event.timeday,
        }).orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
     let result= (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
          }
      })
      let timeday=event.timeday2
        let djinfo= result.data

        //1,定义excel表格名
        let dataCVS ='excel/'+event.fuzeren_name+'/'+event.timeday+''+Date.now()+'日.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人','登记时间',]; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);
          arr.push(djinfo[key].time_day);
         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name: timeday+"日"+event.fuzeren_name+"组体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
  //导员的
  app.router('down_daoyuan_today_excel', async (ctx) => {
    try {
      //let timeday="time_day["+0+"]"
      const countResult = await db.collection('TemregisterInfo').where({
        fudaoyuan:event.fudaoyuan,
        time_day:event.timeday,
       })
       .count()
       const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            fudaoyuan:event.fudaoyuan,
            time_day:event.timeday,
          }).orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        let timeday=event.timeday2
        let djinfo= result.data

        //1,定义excel表格名
        let dataCVS ='excel/'+event.fudaoyuan+'/'+event.timeday+''+Date.now()+'日.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人','登记时间',]; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);
          arr.push(djinfo[key].time_day);
         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name: timeday+"日"+event.fudaoyuan+"学生体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
  //下载学院的今日的登记情况
  app.router('down_college_today_excel', async (ctx) => {
    try {

      //let timeday="time_day["+0+"]"
      const countResult = await db.collection('TemregisterInfo').where({
        college:event.college,
        time_day:event.timeday,
      }).count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection('TemregisterInfo').where({
          college:event.college,
          time_day:event.timeday,
        })
        .orderBy('fudaoyuan','asc')//先按照辅导员排序，然后在是辅导员管理的学生
        .orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
      }
     let result= (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
          }
      })


        let timeday=event.timeday2
        let djinfo= result.data

        //1,定义excel表格名
        let dataCVS ='excel/'+event.college+'/'+event.timeday+''+Date.now()+'.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人','登记时间','辅导员']; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);
          arr.push(djinfo[key].time_day);
          arr.push(djinfo[key].fudaoyuan);
         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name: timeday+"日"+event.college+"学生体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
  //管理端登陆账号和密码验证
  app.router('admin_login', async (ctx) => {
    try {
      let result=await db.collection('manager').where({
        adminID:event.data.adminID,
        passward:event.data.passward
      }).get()
      let flag=0;
      if(result.data.length!=0){
        flag=1;
      }
      ctx.body={
        flag,
        result
      }
    } 
    catch(e){
    }
  });
  //获取当前登记信息的情况
  app.router('get_now_djinfo', async (ctx) => {
    try {
      //先得到每日登记信息
      let  result1,result2,result3,result4,result5
      if(event.admin==0){
         result1 = await db.collection('TemregisterInfo').where({
          time_day:event.time_day,
          fuzeren:event.fuzeren
         })
         .count()
          result2 = await db.collection('TemregisterInfo').where({
          time_day:event.time_day,
          fuzeren:event.fuzeren,
          morning_temp:_.gt(37.3),
         })
         .count()
          result3 = await db.collection('TemregisterInfo').where({
          time_day:event.time_day,
          fuzeren:event.fuzeren,
          noon_temp:_.gt(37.3),
         })
         .count()
          result4 = await db.collection('TemregisterInfo').where({
          time_day:event.time_day,
          fuzeren:event.fuzeren,
          night_temp:_.gt(37.3),
         })
         .count()
         result5 = await db.collection('student').where({
          fuzeren:event.fuzeren
         })
         .count()
      }
      else if(event.admin==1){
        //导员 
        result1 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         fudaoyuan:event.adminname
        })
        .count()
         result2 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         fudaoyuan:event.adminname,
         morning_temp:_.gt(37.3),
        })
        .count()
         result3 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         fudaoyuan:event.adminname,
         noon_temp:_.gt(37.3),
        })
        .count()
         result4 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         fudaoyuan:event.adminname,
         night_temp:_.gt(37.3),
        })
        .count()
        result5 = await db.collection('student').where({
          fudaoyuan:event.adminname,
         })
         .count()
     }
     else if(event.admin==2){
       //于书记的第一级别的 
        result1 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         college:event.college,//学院的名称
        })
        .count()
         result2 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         college:event.college,//学院的名称
         morning_temp:_.gt(37.3),
        })
        .count()
         result3 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         college:event.college,//学院的名称
         noon_temp:_.gt(37.3),
        })
        .count()
         result4 = await db.collection('TemregisterInfo').where({
         time_day:event.time_day,
         college:event.college,//学院的名称
         night_temp:_.gt(37.3),
        })
        .count()
        result5 = await db.collection('student').where({
          college:event.college,//学院的名称
         })
         .count()
     }
     else if(event.admin==3){
      //最高管理
       result1 = await db.collection('TemregisterInfo').where({
        time_day:event.time_day,
       })
       .count()
        result2 = await db.collection('TemregisterInfo').where({
        time_day:event.time_day,
        morning_temp:_.gt(37.3),
       })
       .count()
        result3 = await db.collection('TemregisterInfo').where({
        time_day:event.time_day,
        noon_temp:_.gt(37.3),
       })
       .count()
        result4 = await db.collection('TemregisterInfo').where({
        time_day:event.time_day,
        night_temp:_.gt(37.3),
       })
       .count()
       result5 = await db.collection('student').where({
        })
        .count()
    }
        ctx.body={
          result1,result2,result3,result4,//早中晚体温异常的人
          result5,//这是该负责人总共负责的人数（学院，导员，班级）
        }
    } 
    catch(e){
    }
  });
//将历来登记情况下载下来--负责人

  app.router('down_zu_all_excel', async (ctx) => {
    try {
      const countResult = await db.collection('TemregisterInfo').where({
        fuzeren:event.fuzeren_name,
        time_day:event.timeday,
       })
       .orderBy('time_day', 'desc')
       .orderBy('number', 'asc')
       .count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            fuzeren:event.fuzeren_name,
            time_day:event.timeday,
          }).orderBy('time_day', 'desc').orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {
            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        let djinfo= result.data
        //1,定义excel表格名
        let dataCVS ='excel/'+event.fuzeren_name+'/'+Date.now()+'.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['登记日期','序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人']; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].time_day);
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);

         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name:event.fuzeren_name+""+event.timeday2+"体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
//导员的
  app.router('down_daoyuan_zu_all_excel', async (ctx) => {
    try {
      const countResult = await db.collection('TemregisterInfo').where({
        fudaoyuan:event.fudaoyuan,
        time_day:event.timeday,
       }) 
       .orderBy('time_day', 'desc')
       .orderBy('number', 'asc')
       .count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            fudaoyuan:event.fudaoyuan,
            time_day:event.timeday,
          }).orderBy('time_day', 'desc').orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {

            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        let djinfo= result.data

        //1,定义excel表格名
        let dataCVS ='excel/'+event.fudaoyuan+'/'+Date.now()+'.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['登记日期','序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人']; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].time_day);
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);
         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name: event.fudaoyuan+""+event.timeday2+"体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
  //历来信息 下载--学院的领导
  app.router('down_college_zu_all_excel', async (ctx) => {
    try {
      const countResult = await db.collection('TemregisterInfo').where({
        college:event.college,
        time_day:event.timeday,
       }) 
       .count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise = db.collection('TemregisterInfo').where({
            college:event.college,
            time_day:event.timeday,
          }).orderBy('time_day', 'desc').orderBy('fudaoyuan','asc').orderBy('number', 'asc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
          tasks.push(promise)
        }
       let result= (await Promise.all(tasks)).reduce((acc, cur) => {

            return {
              data: acc.data.concat(cur.data),
              errMsg: acc.errMsg,
            }
        })
        let djinfo= result.data

        //1,定义excel表格名
        let dataCVS ='excel/'+ event.college+'/'+Date.now()+'.xlsx'
        //2，定义存储数据的
        let alldata = [];
        let row = ['登记日期','序号','班级', '学号','姓名','宿舍号','早晨体温(自测)','中午体温(自测)','晚间体温(负责人测)','电话','负责人','辅导员']; //表属性
        alldata.push(row);
        for (let key in djinfo) {
          let arr = [];
          arr.push(djinfo[key].time_day);
          arr.push(djinfo[key].number);
          arr.push(djinfo[key].class_name);
          arr.push(djinfo[key].stuID);
          arr.push(djinfo[key].student_name);
          arr.push(djinfo[key].dormitory_number);
          arr.push(djinfo[key].morning_temp)+"℃";
          arr.push(djinfo[key].noon_temp)+"℃";
          arr.push(djinfo[key].night_temp)+"℃";
          arr.push(djinfo[key].mobile);
          arr.push(djinfo[key].fuzeren);
          arr.push(djinfo[key].fudaoyuan);
         // arr.push(djinfo[key].dengji_time);
          alldata.push(arr)
        }
        


        //3，把数据保存到excel里
        var buffer = await xlsx.build([{
          name: event.college+""+event.timeday2+"体温登记表",
          data: alldata
        }]);



        //看如何能生成多个sheet文件呢


  
        //4，把excel文件保存到云存储里
       ctx.body={
        fileID: await cloud.uploadFile({
          cloudPath: dataCVS,
          fileContent: buffer, //excel二进制文件
        })
       }
    

    } 
    catch(e){
    }
  });
//上传学生名单
  app.router('uploadexcel', async (ctx) => {
    try{
      //1,通过fileID下载云存储里的excel文件
      const res=await cloud.downloadFile({
        fileID: event.fileID,
      })
      const buffer = res.fileContent
      const tasks = [] //用来存储所有的添加数据操作
      //2,解析excel文件里的数据
      var sheets = xlsx.parse(buffer); //获取到所有sheets

      //foreach是遍历循环有几个sheet表格
      sheets.forEach(function (sheet) {
        console.log(sheet['name']);//循环到的第几个sheet名字
        //这样可以获取当前sheet表中的第一行有内容的列数
         /*
        var length =sheet['data'][0].length
        var name=[]
        //name【i】就是每个表格的列名字
        for(var i=0;i<length;i++){
          name[i] = sheet['data'][0][i]
        }
        */
       // ctx.body =name[length-1] + "这是多少列"
       //这是循环，看有多少行
        for (var rowId in sheet['data']) {
          console.log(rowId);
          var row = sheet['data'][rowId]; //第几行数据
          //rowid是第几行，row是这一行的所有数据
         // ctx.body=row+'--'+rowId
          if (rowId > 0 && row) { //第一行是表格标题，所有我们要从第2行开始读
            //3，把解析到的数据存到excelList数据表里
            const promise = db.collection('student_upload')
              .add({
                data: {
                  number:row[0],//序号--这里应该是数字才对
                  stuID:row[3]+"",//学号
                  student_name:row[2],//姓名
                  class_name:row[1],//班级
                  dormitory_number:row[4],//宿舍号
                  fuzeren:row[5],
                  fudaoyuan:row[6],//辅导员
                  mobile:row[7],//学生的手机号
                  college:row[8],//学院的
                  _openid:'',//row[8],//用户的openid

                }
              })
            tasks.push(promise)
          }
        }
      });
      // 等待所有数据添加完成
      ctx.body=await Promise.all(tasks).then(res => {
        return res
      }).catch(function (err) {
        return err
      })
    }catch(e){

    }
  });
//添加负责人信息
  app.router('addfuzeren', async (ctx) => {
    try {
      /*
        如何现在数据库中判断他有没有这个数据，不然还是先remove 然后再 add????
      */
     let ifchongfu=0//没有重复
     await db.collection('manager').where({
       adminID:event.data1.adminID
     })
     .get()
     .then(res=>{
       if(res.data.length!=0){
         //如果不是0 就证明重重复了
         ifchongfu=1
       }
       else{
         if(event.admin==1){
          db.collection('manager').add({
            //导员的信息只能在后台加入
            //导员多一个 name,自己的姓名，然后多一个admin=1,证明是高级管理员
              data:{
                adminID:event.data1.adminID,//负责人的账号
                fuzeren:event.data1.fuzeren,//学生负责人
                passward:event.data1.passward,//负责人的密码
                fudaoyuan:event.data1.fudaoyuan,
                college:event.data1.college,//学院
                admin:0
              }
            })
         }
         else if (event.admin==2){
           //领导添加导员
           db.collection('manager').add({
            //导员的信息只能在后台加入
            //导员多一个 name,自己的姓名，然后多一个admin=1,证明是高级管理员
              data:{
                adminID:event.data1.adminID,//负责人的账号
                fuzeren:event.data1.fuzeren,//学生负责人
                passward:event.data1.passward,//负责人的密码
                admin:1,
                name:event.data1.fuzeren,
                college:event.data1.college,//学院
              }
            })

         }

       }
     })
     ctx.body=ifchongfu


    } 
    catch(e){
    }
  });
//负责人端查询未交学生名单
app.router('down_fuze_weijiao_excel', async (ctx) => {
  try {
     //测试一下取出所有的数据
     const countResult = await db.collection('student_back').where({
      college:event.college,
     }).count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise=await db.collection('student_back').aggregate()
        .project({
          included: $.in([event.timeday, '$tianbaodate']),
          class_name:1,
          college:1,
          dormitory_number:1,
          fudaoyuan:1,
          fuzeren:1,
          mobile:1,
          number:1,
          stuID:1,
          student_name:1,
       })
       .match({
        fudaoyuan:event.fudaoyuan,
        fuzeren:event.fuzeren,
        included:false
       })
       .sort({
         college:1,
         fudaoyuan:1,
         number:1,
       })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
        tasks.push(promise)
      }
      
    // 等待所有
    let result= (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        list: acc.list.concat(cur.list),
        errMsg: acc.errMsg,
      }
    })
    let djinfo= result.list


    //1,定义excel表格名
    var fuze=event.fuzeren
    if(fuze.length>10){
      fuze=event.fudaoyuan+"组下"
    }

    let dataCVS ='excel/'+fuze+'/未交人员名单/'+Math.floor(Math.random()*50 + 50)+'.xlsx'
    //2，定义存储数据的
    let alldata = [];
    let row = ['序号','班级', '学号','姓名','宿舍号','电话','负责人']; //表属性
    alldata.push(row);

    for (let key in djinfo) {
      let arr = [];
      arr.push(djinfo[key].number);
      arr.push(djinfo[key].class_name);
      arr.push(djinfo[key].stuID);
      arr.push(djinfo[key].student_name);
      arr.push(djinfo[key].dormitory_number);
      arr.push(djinfo[key].mobile);
      arr.push(djinfo[key].fuzeren);
      alldata.push(arr)
    }



    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: event.fuzeren+"组"+event.timeday2+"日未登记名单",
      data: alldata
    }]);



    //看如何能生成多个sheet文件呢



    //4，把excel文件保存到云存储里
   ctx.body={
    fileID: await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })
   }
  } 
  catch(e){
  }
});
//辅导员端查询未交学生名单
  app.router('down_daoyuan_weijiao_excel', async (ctx) => {
    try {
     //测试一下取出所有的数据
     const countResult = await db.collection('student_back').where({
      college:event.college
     }).count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise=await db.collection('student_back').aggregate()
        .project({
          included: $.in([event.timeday, '$tianbaodate']),
          class_name:1,
          college:1,
          dormitory_number:1,
          fudaoyuan:1,
          fuzeren:1,
          mobile:1,
          number:1,
          stuID:1,
          student_name:1,
       })
       .match({
        fudaoyuan:event.fudaoyuan,
        included:false
       })
       .sort({
         college:1,
         fudaoyuan:1,
         number:1,
       })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
        tasks.push(promise)
      }

      // 等待所有
      let result= (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          list: acc.list.concat(cur.list),
          errMsg: acc.errMsg,
        }
      })
      let djinfo= result.list

      //1,定义excel表格名
      let dataCVS ='excel/'+event.fudaoyuan+'/未交人员名单/'+Date.now()+'.xlsx'
      //2，定义存储数据的
      let alldata = [];
      let row = ['序号','班级', '学号','姓名','宿舍号','电话','负责人']; //表属性
      alldata.push(row);
      for (let key in djinfo) {
        let arr = [];
        arr.push(djinfo[key].number);
        arr.push(djinfo[key].class_name);
        arr.push(djinfo[key].stuID);
        arr.push(djinfo[key].student_name);
        arr.push(djinfo[key].dormitory_number);
        arr.push(djinfo[key].mobile);
        arr.push(djinfo[key].fuzeren);
        alldata.push(arr)
      }
      


      //3，把数据保存到excel里
      var buffer = await xlsx.build([{
        name: event.fudaoyuan+"学生"+event.timeday2+"日未登记名单",
        data: alldata
      }]);



      //看如何能生成多个sheet文件呢



      //4，把excel文件保存到云存储里
     ctx.body={
      fileID: await cloud.uploadFile({
        cloudPath: dataCVS,
        fileContent: buffer, //excel二进制文件
      })
     }
    } 
    catch(e){
    }
  });

  //学院领导端查询未交学生名单
  app.router('down_college_weijiao_excel', async (ctx) => {
    try {
     //测试一下取出所有的数据
     const countResult = await db.collection('student_back').where({
      college:event.college
     }).count()

      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise=await db.collection('student_back').aggregate()
        .project({
          included: $.in([event.timeday, '$tianbaodate']),
          class_name:1,
          college:1,
          dormitory_number:1,
          fudaoyuan:1,
          fuzeren:1,
          mobile:1,
          number:1,
          stuID:1,
          student_name:1,
       })
       .match({
        included:false
       })
       .sort({
         college:1,
         fudaoyuan:1,
         number:1,
       })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
        tasks.push(promise)
      }

      // 等待所有
      let result= (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          list: acc.list.concat(cur.list),
          errMsg: acc.errMsg,
        }
      })



      let djinfo= result.list

      //1,定义excel表格名
      let dataCVS ='excel/'+event.college+'/未交人员名单/'+Date.now()+'.xlsx'
      //2，定义存储数据的
      let alldata = [];
      let row = ['班级', '学号','姓名','宿舍号','电话','负责人','辅导员',]; //表属性
      alldata.push(row);
      for (let key in djinfo) {
        let arr = [];
        arr.push(djinfo[key].class_name);
        arr.push(djinfo[key].stuID);
        arr.push(djinfo[key].student_name);
        arr.push(djinfo[key].dormitory_number);
        arr.push(djinfo[key].mobile);
        arr.push(djinfo[key].fuzeren);
        arr.push(djinfo[key].fudaoyuan);
        alldata.push(arr)
      }
      


      //3，把数据保存到excel里
      var buffer = await xlsx.build([{
        name: event.college+"学生"+event.timeday2+"日未登记名单",
        data: alldata
      }]);



      //看如何能生成多个sheet文件呢



      //4，把excel文件保存到云存储里
     ctx.body={
      fileID: await cloud.uploadFile({
        cloudPath: dataCVS,
        fileContent: buffer, //excel二进制文件
      })
     }
    } 
    catch(e){
    }
  });
//获取异常体温人员信息-负责人的,导员的,学院的
  app.router('get_yichang_info', async (ctx) => {
    try {
      //获取体温异常的
      let  result1
      if(event.admin==0){
          result1 = await db.collection('TemregisterInfo').where(
            db.command.and(
              [
                 db.command.or(
                 [
                {
                  morning_temp:_.gt(37.3),
                },
                {
                  noon_temp:_.gt(37.3),
                },
                {
                  night_temp:_.gt(37.3),
                }
                 ],
                 ),
                 db.command.and([
                   {
                    time_day:event.timeday,
                    fuzeren:event.fuzeren,
                   }
                 ])
                
            ],
             )
         ).get()
      }
      else if(event.admin==1){
        result1 = await db.collection('TemregisterInfo').where(
          db.command.and(
            [
               db.command.or(
               [
              {
                morning_temp:_.gt(37.3),
              },
              {
                noon_temp:_.gt(37.3),
              },
              {
                night_temp:_.gt(37.3),
              }
               ],
               ),
               db.command.and([
                 {
                  time_day:event.timeday,
                  fudaoyuan:event.adminname,
                 }
               ])
              
          ],
           )
       ).get()
     }
     else if(event.admin==2){
       //证明是学院的领导
       result1 = await db.collection('TemregisterInfo').where(
        db.command.and(
          [
             db.command.or(
             [
            {
              morning_temp:_.gt(37.3),
            },
            {
              noon_temp:_.gt(37.3),
            },
            {
              night_temp:_.gt(37.3),
            }
             ],
             ),
             db.command.and([
               {
                time_day:event.timeday,
                college:event.college,
               }
             ])
            
        ],
         )
     ).get()
     }
     else if(event.admin==3){
      //证明是最高管理
      result1 = await db.collection('TemregisterInfo').where(
       db.command.and(
         [
            db.command.or(
            [
           {
             morning_temp:_.gt(37.3),
           },
           {
             noon_temp:_.gt(37.3),
           },
           {
             night_temp:_.gt(37.3),
           }
            ],
            ),
            db.command.and([
              {
               time_day:event.time_day,
              }
            ])
           
       ],
        )
    ).get()
      }
        ctx.body={
          result1
        }
    } 
    catch(e){
    }
  });
  //获取负责人的基本信息，导员的
  app.router('get_fuzeren_info', async (ctx) => {
    try {
      if(event.admin==1){
        ctx.body = await db.collection('manager').where({
          fudaoyuan:event.adminname
        }).get()
      }
      else if(event.admin==2){
        //学院的领导,看到所有导员吧
        ctx.body = await db.collection('manager').where({
          college:event.college
        }).get()
      }
    } 
    catch(e){
    }
  });

    //获取负责人的基本信息，导员的
    app.router('del_register_info', async (ctx) => {
      try {
        ctx.body=await db.collection('TemregisterInfo').where({
          _id:event.student_info._id
        }).remove()
      } 
      catch(e){
      }
    });
    
        //获取每天的通知公告
    app.router('get_notice', async (ctx) => {
      try {
        ctx.body=await db.collection('others').where({
          kind:"notices"
        }).get()
      } 
      catch(e){
      }
    });

    //获取 管理端展示的通知公告
    app.router('get_admin_notice', async (ctx) => {
      try {
        ctx.body=await db.collection('others').where({
          kind:"notices"
        }).get()
      } 
      catch(e){
      }
    });
//修改公告
    app.router('correct_notices', async (ctx) => {
      try {
        if(event.type==1){
          //主页的
          ctx.body=await db.collection('others').where({
            kind:"notices"
          }).update({
            data:{
              content:event.data1.content
            }
          })
        }
       else  if(event.type==2){
          //管理端的
          ctx.body=await db.collection('others').where({
            kind:"notices"
          }).update({
            data:{
              content_admin:event.data1.content
            }
          })
        }

      } 
      catch(e){
      }
    });
    
    
    
    //负责人端查询未交学生的列表
  app.router('get_fuze_weijiao', async (ctx) => {
  try {
   //测试一下取出所有的数据
   const countResult = await db.collection('student_back').where({
    college:event.college,
   }).count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise=await db.collection('student_back').aggregate()
      .project({
        included: $.in([event.timeday, '$tianbaodate']),
        class_name:1,
        college:1,
        dormitory_number:1,
        fudaoyuan:1,
        fuzeren:1,
        mobile:1,
        number:1,
        stuID:1,
        student_name:1,
        _openid:1,
     })
     .match({
      fudaoyuan:event.fudaoyuan,
      fuzeren:event.fuzeren,
      included:false
     })
     .sort({
       college:1,
       fudaoyuan:1,
       number:1,
     })
      .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
      tasks.push(promise)
    }


    // 等待所有
    ctx.body= (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        list: acc.list.concat(cur.list),
        errMsg: acc.errMsg,
      }
    })
  } 
  catch(e){
  }
    });
//辅导员端查询未交学生的列表
  app.router('get_daoyuan_weijiao', async (ctx) => {
    try {
     //测试一下取出所有的数据
     const countResult = await db.collection('student_back').where({
      fudaoyuan:event.fudaoyuan
     }).count()
      const total = countResult.total
      const batchTimes = Math.ceil(total / 100)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise=await db.collection('student_back').aggregate()
        .project({
          included: $.in([event.timeday, '$tianbaodate']),
          class_name:1,
          college:1,
          dormitory_number:1,
          fudaoyuan:1,
          fuzeren:1,
          mobile:1,
          number:1,
          stuID:1,
          student_name:1,
          _openid:1,
       })
       .match({
        fudaoyuan:event.fudaoyuan,
        included:false
       })
       .sort({
         college:1,
         fudaoyuan:1,
         number:1,
       })
        .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
        tasks.push(promise)
      }

      // 等待所有
      ctx.body= (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          list: acc.list.concat(cur.list),
          errMsg: acc.errMsg,
        }
      })
    } 
    catch(e){
    }
  });
  //学院灵领导端查询未交学生的列表
  app.router('down_college_weijiao', async (ctx) => {
    try {
      const countResult = await db.collection('student_back').where({
        college:event.college
       }).count()
        const total = countResult.total
        const batchTimes = Math.ceil(total / 100)
        const tasks = []
        for (let i = 0; i < batchTimes; i++) {
          const promise=await db.collection('student_back').aggregate()
          .project({
            included: $.in([event.timeday, '$tianbaodate']),
            class_name:1,
            college:1,
            dormitory_number:1,
            fudaoyuan:1,
            fuzeren:1,
            mobile:1,
            number:1,
            stuID:1,
            student_name:1,
            _openid:1,
         })
         .match({
          included:false
         })
         .sort({
           college:1,
           fudaoyuan:1,
           number:1,
         })
          .skip(i * MAX_LIMIT).limit(MAX_LIMIT).end()
          tasks.push(promise)
        }

      // 等待所有
      ctx.body= (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          list: acc.list.concat(cur.list),
          errMsg: acc.errMsg,
        }
      })
    } 
    catch(e){
    }
  });
  //向未打卡的人发送体温检测提醒
  app.router('tixing', async (ctx) => {
    try {
      const student=event.student_list
      for(let i=0;i<student.length;i++){
        //设置一个延时函数
        setTimeout(function(){
         cloud.openapi.subscribeMessage.send({
            touser:student[i]._openid,// 'oUod55J70jpdavr1h13ISKvwGAhI',//
            page: 'pages/Temregister/register/register',
            lang: 'zh_CN',
            data: event.data,
            templateId:'r4c__A61ujHsf9zx29zhhYl0Y72EAhf_aeYTMPRMUYo',
          })

        },200)
      }


    } catch (e) {
      console.error(e)
    }
  });
  //向导员发送体温异常的信息
  app.router('hot_warning', async (ctx) => {
    try {
      
      let daoyuan=await db.collection('manager').where({
        name:event.fudaoyuan
       }).get()
      cloud.openapi.subscribeMessage.send({
        touser:daoyuan.data[0]._openid,// 'oUod55J70jpdavr1h13ISKvwGAhI',//
        page: 'pages/Admin/login/login',
        lang: 'zh_CN',
        data: event.data,
        templateId:'zmZgsPb85Tw49hqqWhLxFoQA84nND5fjrzAU5lZdJsQ',
      })


    } catch (e) {
      console.error(e)
    }
  });
    //更改导员的openid
    app.router('corrent_daoyuan_openid', async (ctx) => {
      try {
        await db.collection('manager')
        .where({
          name:event.name,
         }).update({
          data: {
            _openid:wxContext.OPENID,//当他们不是空的时候修改
          }
      })
  
  
      } catch (e) {
        console.error(e)
      }
    });

  //将ctx中的数据返回小程序端
  return app.serve();
}