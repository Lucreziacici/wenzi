var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var network = require("../../libs/network.js")
  //上一个页面
Page({
  data: {
    region: ['请选择地址', '', ''],//picker用
    province: '',//省
    city: '',//市
    district: '',//区 
    appid: appid,//appid
    openid:null,//openid
    tip:'',//贴士
    telNumber:'',//手机号
    userName:'',//用户名
    detailInfo:'',//详细地址
  },
  onLoad: function (options) {

    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
      });

      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
    })
  },
  //picker选择方法
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2],
    })
  },
  //提交地址
  formBindsubmit: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (e.detail.value.receiver_name == '') {
      this.selectComponent("#Toast").showToast("请填写姓名")
      return false;
    }
    if (e.detail.value.receiver_phone == '') {
      this.selectComponent("#Toast").showToast("请输入手机号码")
      return false;
    }
    if (!myreg.test(e.detail.value.receiver_phone)) {
      this.selectComponent("#Toast").showToast("手机号码有误")
      return false;
    }
    if (e.detail.value.province == '' || e.detail.value.city == '' || e.detail.value.district == '') {
      this.selectComponent("#Toast").showToast("请选择省市区")
      return false;
    }
    if (e.detail.value.address == '') {
      this.selectComponent("#Toast").showToast("请填写详细地址")
      return false;
    }
    var formData = e.detail.value;
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    var formData = e.detail.value;  
    network.POST('CustomerAddress/AddNewAddress', formData,
      (res) => {
        console.log(res)
        prevPage.getAddressList();
        if (res.data.res_status_code=='0'){
          wx.hideLoading();
          wx.navigateBack({})
        }

      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
})
