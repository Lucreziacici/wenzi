//index.js
//获取应用实例
var app = getApp();
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var network = require("../../libs/network.js")
Page({
  data: {
    url1: app.globalData.url,
    src1: null,
    moban: null,//首页模板
    motto: 'Hello ',
    img: null,
    userInfo: {},
    openid: '',
    banners: [],
    products: [],
    tuijians: [],//精品推荐的内容
    navbar: [],
    currentTab: 0,
    admin:{},
    isApprove:false
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //响应点击导航栏
  navbarTap: function (e) {
    var id = e.currentTarget.id;
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      products: [],
    })
    network.GET('/foodchain!huoqu1.action?appid=' + appid + '&onemenu.id=' + id,
      (res) => {
        this.setData({
          products: res.data.objs2
        });
      }, (res) => {
        console.log(res);
      })
  },
  onLoad: function () {
    console.log(app.globalData)
    network.GET('/foodchain!tohomepageneigou.action?appid=' + appid,
       (res)=> {
         console.log(res.data)
        this.setData({
          banners: res.data.objs,
          products: res.data.objs2,
          tuijians: res.data.objs3,
          navbar: res.data.objs4,
          admin: res.data.object
        });
      }, (res) => {
        console.log(res);
      })
  },
  gourl: function (e){
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  // 前往搜索页，带个参数
  gosearch:function(e){
    wx.navigateTo({
      url: "/pages/search/search",
    })
  },

  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    network.IsuserInfo();
    //调用应用实例的方法获取全局数据
    app.getUserInfo( (userInfo, openid)=> {
      //更新数据
      if (!openid) {
        this.selectComponent("#Toast").showToast("获取信息失败，请刷新后重试")
        return false;
      }
      this.setData({
        userInfo: userInfo,
        openid: openid
      })
      network.GET('/team!findteam1.action?openid=' + openid,
        (res) => {
          if (res.data.shstatus == '审核通过') {
            this.setData({
              isApprove: true
            });

          }
          if (res.data.shstatus == null) {
            wx.redirectTo({
              url: '../login/login?openid=' + openid,
            })
          }
        }, (res) => {
          console.log(res);
        });
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: 'ZIGGIEPrivateSale',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})
