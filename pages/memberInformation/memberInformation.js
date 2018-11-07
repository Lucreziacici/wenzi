// 删减150行 by xixi
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var network = require("../../libs/network.js")
Page({
  data: {
    tip: '',//提示框文字
    openid: '',//用户openid
    province: '',//省 应该没用到
    city: '',//市 应该没用到
    qu: '',//区 应该没用到
    phone: '',//手机号
    team: {},//用户身份
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      this.CustomerInfo();
    })


  },
  //获取用户信息
  CustomerInfo:function(){

    network.GET('Customer/CustomerInfo',
      (res) => {
        if (res.data.res_status_code == '0') {
          this.setData({
            team: res.data.res_content,
          });
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  //提交表单
  formBindsubmit: function (e) {
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (e.detail.value.real_name == '') {
      this.selectComponent("#Toast").showToast("请填写姓名");
      return false;
    }
    if (e.detail.value.phone == '') {
      this.selectComponent("#Toast").showToast("请输入手机号码");
      return false;
    }
    if (!myreg.test(e.detail.value.phone)) {
      this.selectComponent("#Toast").showToast("手机号码有误");
      return false;
    }
    if (e.detail.value.department == '') {
      this.selectComponent("#Toast").showToast("请填写所在部门")
      return false;
    }
    if (e.detail.value.manager == '') {
      this.selectComponent("#Toast").showToast("请填写主管姓名")
      return false;
    }
    if (e.detail.value.company == '') {
      this.selectComponent("#Toast").showToast("请填写公司名称");
      return false;
    }
    if (e.detail.value.id_card == '') {
      this.selectComponent("#Toast").showToast("身份号不能为空")
      return false;
    }
    if (!pattern.test(e.detail.value.id_card)) {
      this.selectComponent("#Toast").showToast("身份号格式有误")
      return false;
    }
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    var formData = e.detail.value;
    console.log(formData)
    formData.phone = e.detail.value.phone
    network.POST('Customer/ReviseCustomer', formData,
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          app.globalData.userInfo = res.data.res_content;
          wx.setStorage({
            key: 'userinfo',
            data: res.data.res_content,
          })
          wx.hideLoading();
          wx.navigateBack({})
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
      }, (res) => {
        console.log(res);
      })
  },
})