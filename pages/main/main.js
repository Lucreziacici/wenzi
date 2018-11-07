//index.js
//获取应用实例
const app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imgUrls: [],
    navigation_list: [],
    special: [],
    page: {},
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    circular: true,
    toView: 'red',
    scrollTop: 100,
    topNum: "",
    imgheights: [],
    resourceurl: resourceurl
  },
  formSubmit: function(e) {
    console.log(e.detail.formId)
    network.PostFormId(e.detail.formId)
  },
  onLoad: function() {
    network.IsuserInfo();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
        team: userInfo
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }

    })
    network.GET("HomePage/RequestHomePage", (res) => {
      if (res.data.res_content.page.category_show_type == 'A') {
        for (var i = 0; i < res.data.res_content.recommend.length; i++) {
          res.data.res_content.recommend[i].category_goods_list = res.data.res_content.recommend[i].category_goods_list.slice(0, 6)
        }
      } else if (res.data.res_content.page.category_show_type == 'B') {
        for (var i = 0; i < res.data.res_content.recommend.length; i++) {
          res.data.res_content.recommend[i].category_goods_list = res.data.res_content.recommend[i].category_goods_list.slice(0, 8)
        }
      } else if (res.data.res_content.page.category_show_type == 'C') {
        for (var i = 0; i < res.data.res_content.recommend.length; i++) {
          res.data.res_content.recommend[i].category_goods_list = res.data.res_content.recommend[i].category_goods_list.slice(0, 6)
        }
      }
      wx.setNavigationBarColor({
        frontColor: res.data.res_content.page.font_color,
        backgroundColor: res.data.res_content.page.navigation_bar_color
      })
      this.setData({
        imgUrls: res.data.res_content.banner,
        special: res.data.res_content.recommend,
        page: res.data.res_content.page,
        navigation_list: res.data.res_content.navigation_list
      })
    }, (res) => {
      console.log(res)
    })
  },
  imageLoad: function(e) {
    //获取图片真实宽度
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比
      ratio = imgwidth / imgheight;
    //计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里
    imgheights.push(imgheight)
    this.setData({
      imgheights: imgheights,
    })
  },
  bindchange: function(e) {
    console.log(e.detail.current)
    this.setData({
      current: e.detail.current
    })
  },

  // 前往搜索页，带个参数
  gosearch: function(e) {
    wx.navigateTo({
      url: "/pages/search/search",
    })
  },
  // getUserInfo: function (e) {
  //   app.globalData.userInfo = e.detail.userInfo
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // },
  onShareAppMessage: function(res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: this.data.product.title,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  returnTop() {
    this.setData({
      topNum: 0
    });
  },


})