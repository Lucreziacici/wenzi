// pages/classify/classify.js
var app = getApp()
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    classifyList: [],
    currentTab: "0",
    classifyitem: [],
    classify: true

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    network.IsuserInfo();


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      classify: true
    })
    network.GET("Category/BigCategoryList", (res) => {
      if (res.data.res_status_code == '0') {
        this.setData({
          classifyList: res.data.res_content
        })
        if (this.data.chooseTabId) {
          if (this.data.currentTabName == '品牌导航') {
            this.setData({
              classify: false
            })
          } else {
            this.setData({
              classify: true
            })
          }
        } else {
          network.GET("Category/CategoryList?id=" + res.data.res_content[0].id, (res) => {
            if (res.data.res_status_code == '0') {
              this.setData({
                classifyitem: res.data.res_content
              })
            } else {
              this.selectComponent("#Toast").showToast(res.data.res_message)
            }
          }, (res) => {
            console.log(res)
          })
        }

      }
    }, (res) => {
      console.log(res)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
     console.log("隐藏")
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("下拉刷新")
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 切换
  navbarTap: function (e) {
    console.log(e)
    wx.showLoading({
      title: '加载中…',
    })
    this.setData({
      currentTab: e.currentTarget.id,
      currentTabName: e.currentTarget.dataset.name,
      chooseTabId: e.currentTarget.dataset.id
    });
    if (e.currentTarget.dataset.name == '品牌导航') {
      network.GET("Brand/BrandList", (res) => {
        if (res.data.res_status_code == '0') {
          this.setData({
            classifyitem: res.data.res_content,
            classify: false
          })
          wx.hideLoading()
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
      }, (res) => {
        console.log(res)
      })
    } else {
      network.GET("Category/CategoryList?id=" + e.currentTarget.dataset.id, (res) => {
        if (res.data.res_status_code == '0') {
          this.setData({
            classifyitem: res.data.res_content,
            classify: true
          })
          wx.hideLoading()
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }

      }, (res) => {
        console.log(res)
      })
    }

  }
})