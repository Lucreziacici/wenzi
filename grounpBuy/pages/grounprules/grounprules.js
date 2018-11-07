// pages/accredit/accredit.js
var app = getApp()
var network = require("../../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    Tab: [{ title: "一人团" }, { title: "老带新" }],
    activedTab: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log(res.userInfo)
            }
          })
        }
      }
    })
  },
  // 切换tab
  switchTab: function (option) {

    this.setData({
      activedTab: option.target.dataset.id.toString()
    })
  },

})