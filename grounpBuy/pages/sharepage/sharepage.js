// pages/accredit/accredit.js
var app = getApp()
var resourceurl = app.globalData.resourceurl
var network = require("../../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceurl: resourceurl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '快来帮我拼这个商品',
      path: '/grounpBuy/pages/sharepage/sharepage?openid=ot_0l0WXRZjlb61pohGe1QpwWCpw',
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  }


})