var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var network = require("../../libs/network.js")
Page({

  data: {
    tip: '',
    oid:'',
  },



  /**  
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      oid: options.oid,
    })
  },


  formBindsubmit: function (e) {
    var name = e.detail.value.name;
    var shen = e.detail.value.shen;
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (name == '') {
      this.selectComponent("#Toast").showToast("请填写姓名");
      return false;
    }
    if (shen == '') {
      this.selectComponent("#Toast").showToast("身份号不能为空");
      return false;
    }
    if (!pattern.test(shen)) {
      this.selectComponent("#Toast").showToast("身份号格式有误");
      return false;
    }
    let getdata={};
    getdata.name=name;
    getdata.shen = shen;
    getdata.oid = this.data.oid;
    network.POST('/order!updateshen.action', getdata,
      (res) => {
        wx.navigateTo({
          url: '../final/final?oid=' + res.data
        })
      }, (res) => {
        console.log(res);
      })
    },

})