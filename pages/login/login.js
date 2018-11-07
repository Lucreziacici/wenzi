// 删减40行 做成公共类 by xixi
// 删减20行 toast 抽象by xixi 18/4/3
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({
  data: {
    tip: '',//提示框内容
    radio1: true,//单选框
    openid: '',//openid
    resourceurl: resourceurl
  },
  /**
   * 生命周期函数--监听页面加
   */
  onLoad: function (options) {
    // network.IsuserInfo();
    this.setData({
      openid: options.openid,
    })
  },
  radioChange: function (e) {
    this.setData({
      radio1: !this.data.radio1
    })
  },
  formBindsubmit: function (e) {
    var real_name = e.detail.value.name;
    var department = e.detail.value.bumen;
    var manager = e.detail.value.name1;
    var phone = e.detail.value.phone;
    var company=e.detail.value.company;
    var idcard=e.detail.value.idcard;
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (real_name == '') {
      this.selectComponent("#Toast").showToast("请填写姓名");
      return false;
    }
    if (idcard == '') {
      this.selectComponent("#Toast").showToast("身份号不能为空");
      return false;
    }
    if (!pattern.test(idcard)) {
      this.selectComponent("#Toast").showToast("身份号格式有误");
      return false;
    }
    if (phone == '') {
      this.selectComponent("#Toast").showToast("请输入手机号码");
      return false;
    }
    if (!myreg.test(phone)) {
      this.selectComponent("#Toast").showToast("手机号码有误");
      return false;
    }
    if (department == '') {
      this.selectComponent("#Toast").showToast("请填写所在部门");
      return false;
    }
    if (manager == '') {
      this.selectComponent("#Toast").showToast("请填写主管姓名");
      return false;
    }
    if (company==''){
      this.selectComponent("#Toast").showToast("请填写公司名称");
      return false;
    }
    if (!(this.data.radio1)) {
      this.selectComponent("#Toast").showToast("请阅读协议");
      return false;
    }
    wx.showLoading({
      title: '加载中....',
      mask: true
    });

    var zhuce={};
    zhuce.department = department;
    zhuce.real_name = real_name;
    zhuce.manager = manager;
    zhuce.phone = phone;
    zhuce.company = company;
    zhuce.id_card=idcard
    network.POST('Customer/RegisterCustomer',zhuce,
       (res)=> {
         console.log(res)
         wx.hideLoading();
         if (res.data.res_status_code=='0'){
           app.globalData.userInfo = res.data.res_content
          //  wx.switchTab({
          //    url: '../main/main'
          //  })
           wx.navigateBack();
         }else{
           this.selectComponent("#Toast").showToast(res.data.res_message);
         }

      }, (res) => {
        console.log(res);
      })
  },
})