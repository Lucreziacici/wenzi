var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {},
    logistics:[],
    packagelist:[],//包裹列表
    resourceurl: resourceurl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data={}
    data.order_no = options.order_no
    network.GETJSON('Logistics/LogisticsInfo',data,
      (res) => {
        if (res.data.res_status_code=='0'){
          this.setData({
            packagelist: res.data.res_content.package_list
          })
        }
      }, (res) => {
        console.log(res);
      })
  },

})