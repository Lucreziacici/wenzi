var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var secret = app.globalData.secret
var partner = app.globalData.partner
var partnerkey = app.globalData.partnerkey
var network = require("../../libs/network.js")
Page({
  data: {
    timeStamp: '',
    nonceStr: '',
    package1: '',
    paySign: '',
    userInfo: {},
    openid: null,
    oid: '',
    islayer: false,
    tips: ""
  },

  /**
   * 生命周期函数--监听页面加载 TODO 还没测到
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
    })
    wx.showLoading({
      title: '请求支付中…',
    })
    var that = this
    network.POST('OrderPay/WxOrderPay', { order_no: options.order_no,form_id:options.formId },
      (res) => {
        wx.hideLoading();
        if (res.data.res_status_code == '0') {
          let paydata = res.data.res_content;
          paydata = JSON.parse(paydata);
          wx.requestPayment({
            'timeStamp': paydata.timeStamp,
            'nonceStr': paydata.nonceStr,
            'package': paydata.package,
            'signType': paydata.signType,
            'paySign': paydata.paySign,
            'success': function (res) {
              wx.redirectTo({
                url: '../orderList/orderList'
              })
            },
            fail: function (res) {
              wx.redirectTo({
                url: '../orderDetail/orderDetail?order_no=' + options.order_no
              })
            },
            complete: function (res) {
              console.log(res)
            }
          })
        } else {
          if (res.data.res_status_code == '40030') {
            this.setData({
              tips: res.data.res_message,
              islayer: true,
              button: '前往付款'
            })
          } else {
            this.setData({
              tips: res.data.res_message,
              islayer: true,
              button: '去逛逛吧'
            })
          }
        }
      }, (res) => {
        console.log(res);
        wx.hideLoading();
        this.setData({
          tips: "请求超时,请稍后再来",
          islayer: true,
          button: '去逛逛吧'
        })
      }, this.data.userid)

    // app.getUserInfo(function (userInfo, openid) {
    //   //更新数据
    //   that.setData({
    //     userInfo: userInfo,
    //     openid: openid
    //   })
    //   if (!that.data.openid) {
    //     that.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
    //     return false;
    //   }

    //   // network.GET(url + '/order!zhifu1.action?oid=' + options.oid + '&appid=' + appid + '&openid=' + that.data.openid + '&secret=' + secret + '&partner=' + partner + '&partnerkey=' + partnerkey,
    //   //   (res) => {
    //   //     that.setData({
    //   //       timeStamp: res.data.res3,
    //   //       nonceStr: res.data.res4,
    //   //       package1: res.data.res1,
    //   //       paySign: res.data.res2,
    //   //       oid: res.data.res5
    //   //     });
    //   //     //发起支付
    //   //     wx.requestPayment({
    //   //       'timeStamp': that.data.timeStamp,
    //   //       'nonceStr': that.data.nonceStr,
    //   //       'package': that.data.package1,
    //   //       'signType': 'MD5',
    //   //       'paySign': that.data.paySign,
    //   //       'success': function (res) {
    //   //         wx.redirectTo({
    //   //           url: '../myorder/myorder'
    //   //         })
    //   //       },
    //   //       fail: function (res) {
    //   //         console.log(res);
    //   //       },
    //   //       complete: function (res) {
    //   //         console.log(res)
    //   //       }
    //   //     })
    //   //   }, (res) => {
    //   //     console.log(res);
    //   //   })
    // })
  },
  goorderlist: function () {
    if (this.data.button == '去逛逛吧') {
      wx.redirectTo({
        url: '../productList/productList'
      })
    } else {
      wx.redirectTo({
        url: '../orderList/orderList?status=00&id=1'
      })
    }

  }
})