
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var network = require("../../libs/network.js")
//上一个页面
Page({
  data: {
    region: ['请选择地址', '', ''],//picker提示字
    address: {},//存地址
    modalHidden: true,//模态框显示与隐藏
    province: '',//省
    city: '',//市
    district: '',//区
    appid: appid,//appid
    openid: ''//openid
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
      //获取地址
      network.GET('CustomerAddress/GetAddressByID?id=' + options.id,
        (res) => {
          console.log(res)
          if (res.data.res_status_code == '0') {
            this.setData({
              address: res.data.res_content,
              province: res.data.res_content.province,
              city: res.data.res_content.city,
              district: res.data.res_content.district,
              region: [res.data.res_content.province, res.data.res_content.city, res.data.res_content.district]
            })
          } else {
            this.selectComponent("#Toast").showToast(res.data.res_message);
          }
        }, (res) => {
          console.log(res);
        }, this.data.userid)
    })
  },
  //picker切换
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      province: e.detail.value[0],
      city: e.detail.value[1],
      district: e.detail.value[2],
    })
  },
  formBindsubmit: function (e) {
    var receiver_name = e.detail.value.receiver_name;
    var receiver_phone = e.detail.value.receiver_phone;
    var province = e.detail.value.province;
    var city = e.detail.value.city;
    var district = e.detail.value.district;
    var address = e.detail.value.address;
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (receiver_name == '') {
      this.selectComponent("#Toast").showToast("请填写姓名")
      return false;
    }
    if (receiver_phone == '') {
      this.selectComponent("#Toast").showToast("请输入手机号码")
      return false;
    }
    if (!myreg.test(receiver_phone)) {
      this.selectComponent("#Toast").showToast("手机号码有误")
      return false;
    }
    if (this.data.province == '' || this.data.city == '' || this.data.district == '') {
      this.selectComponent("#Toast").showToast("请选择省市区")
      return false;
    }
    if (address == '') {
      this.selectComponent("#Toast").showToast("请填写详细地址")
      return false;
    }
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    var formData = e.detail.value;
    formData.is_default = this.data.address.is_default;

    network.POST('CustomerAddress/ReviseAddress', formData,
      (res) => {
        if (res.data.res_status_code == '0') {
          prevPage.getAddressList();
          wx.hideLoading();
          wx.navigateBack({})
        }else{
          this.selectComponent("#Toast").showToast(res_message);
        }
      }, (res) => {
        console.log(res);
      }, this.data.userid);
  },
})
