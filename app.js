//app.js
var network = require("/libs/network.js")
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);

    // this.GetAccessToken();
    this.update();
    // this.getUserInfo();
  },
  //获取系统配置 暂时没有用到 以后可能模板消息会遇到
  GetAccessToken:function(){
    network.GET('WxConfig/GetAccessToken', 
    (res) => {
    console.log(res)
       
   
    }, (res) => {
      console.log(res);
    })
  },
  update:function(){
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate( (res)=> {
        console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady((res) =>{
            console.log(res)
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) =>{
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed((res) =>{
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }

  },
  getUserInfo: function (cb) {
    if (this.globalData.userInfo && this.globalData.open_id) {
      typeof cb == "function" && cb(this.globalData.userInfo, this.globalData.open_id)
    } else {
      //调用登录接口
      wx.login({
        success:  (e)=> {
          wx.request({
            //正式
            url: "https://mall.shjinjia.com.cn/api/Customer/GetOpenID?js_code=" + e.code + "",
            //测试
            // url: "https://mallt.shjinjia.com.cn/api/Customer/GetOpenID?js_code=" + e.code + "",
            //文慧
            // url: "http://10.10.200.4/MiniProgramMall.Api/api/Customer/GetOpenID?js_code=" + e.code + "",
            header: {
              'Content-Type': 'application/json',
              'shop_id': '4'
            },
            success: (res) => {
              console.log(res)
              if (res.data.res_status_code == '0') {
                this.globalData.open_id = res.data.res_content.open_id;
                this.globalData.userInfo = res.data.res_content;
                typeof cb == "function" && cb(this.globalData.userInfo, res.data.res_content.open_id)
                // if (res.data.res_content.real_name==null){
                //   setTimeout(function () {
                //     wx.navigateTo({
                //       url: '../login/login?openid=' + res.data.res_content.open_id
                //     })
                //   }, 1000)
                // }
                wx.setStorage({
                  key: 'open_id',
                  data: res.data.res_content.open_id,
                });
                wx.setStorage({
                  key: 'userinfo',
                  data: res.data.res_content,
                });

              }else{
                wx.showToast({
                  icon: "none",
                  title: res.data.res_message,
                })
              }
              
             
            },
            fail: function (res) {
              console.log(res)
            }
          });
        }
      })
    }
  },
  globalData: {
    url: 'https://fx.comeyang.com',
    userInfo: {},
    open_id: null,
    resourceurl: 'http://cdn.mallimg.shjinjia.com.cn/Uploads/SysImages/171/',
  }
})
