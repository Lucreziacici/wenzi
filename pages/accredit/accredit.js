// pages/accredit/accredit.js
var app = getApp()
var network = require("../../libs/network.js")
var resourceurl = app.globalData.resourceurl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    resourceurl: resourceurl
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
  bindGetUserInfo: function (e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var timestamp = Date.parse(new Date());
      var expiration = timestamp + 1000 * 60 * 60 * 24 * 5;//记住时间五天后过期
      wx.setStorage({
        key: 'userinfo_time',
        data: expiration,
      })
      var data = {};
      data.nick_name = e.detail.userInfo.nickName;
      data.avatarUrl = e.detail.userInfo.avatarUrl
      data.gender = e.detail.userInfo.gender
      data.province = e.detail.userInfo.province
      data.city = e.detail.userInfo.city
      network.POST("Customer/SaveCustomerWxConfig", data, (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          app.globalData.userInfo = res.data.res_content
          wx.setStorage({
            key: 'userinfo',
            data: res.data.res_content,
            success: function (res) {
              // var page = getCurrentPages()
              // var route = "/" + page[page.length - 2].route
              // wx.reLaunch({
              //   url: route
              // })
              wx.switchTab({
                url: '../main/main',
              })
            },
            fail: function (res) {
              console.log(res);
            }
          })
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })

    } else {
      wx.showToast({
        icon: 'none',
        title: '请允许授权',
      })
    }

  },

})