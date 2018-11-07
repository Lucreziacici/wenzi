// pages/orderDetail/orderDetail.js
var app = getApp()
var network = require("../../libs/network.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    order_no: "",//订单号
    order: {},//订单详情
    detail_list: [],//列表
    modalHidden: true,//模态框
    tips: "",//模态框内容
    operate: "",//操作类型，delete:删除；refund：退款；confirm：确认收货
    activedStatus: "",
  },
  onLoad: function (options) {

    this.setData({
      order_no: options.order_no,
      activedStatus: options.status
    })
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      this.getOrderDetail();
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  //获取数据
  getOrderDetail: function () {
    network.GET("Order/OrderDetail?order_no=" + this.data.order_no, (res) => {
      console.log(res)
      if (res.data.res_status_code == '0') {
        this.setData({
          order: res.data.res_content.order,
          detail_list: res.data.res_content.package_list,
        })
      }
    }, (res) => { console.log(res) }, this.data.userid)
  },
  // 删除订单
  deleteOrder: function (e) {
    console.log(e)
    this.setData({
      modalHidden: false,
      tips: "真的要删除此订单么？",
      operate: "delete",
    })
  },
  //查看物流 
  checkLogistics: function (e) {
    wx.navigateTo({
      url: '../logistics/logistics?order_no=' + e.target.dataset.id
    })
  },
  // 退款
  refundOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否确认退款",
      operate: "refund",
    });
  },
  //确认收货
  confirmOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否确认收货",
      operate: "confirm",
    });
  },
  //取消订单
  cancelOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否取消订单",
      operate: "cancel",
    });
  },
  payOrder: function (e) {
    wx.navigateTo({
      url: '../final/final?order_no=' + e.target.dataset.id
    })
  },
  //取消退款
  cancelrefund: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否取消退款申请",
      operate: "cancelrefund",
    });

  },
  //前往退款
  refund: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../refund/refund?order_detail_no=' + e.currentTarget.dataset.id + '&order_no=' + e.currentTarget.dataset.order_no + '&source=detail'
    })
  },
  //点击确认
  confirm_one: function () {
    //如果操作是删除
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    if (this.data.operate == 'delete') {
      network.POST("Order/DeleteOrder", { order_no: this.data.order_no }, (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          if (this.data.activedStatus) {
            prevPage.getOrderList(this.data.activedStatus);
            wx.hideLoading();
            wx.navigateBack({})
          }else{
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }
         
        }
      }, (res) => {
        console.log(res)
      })
    } else if (this.data.operate == 'confirm') {
      network.POST("Order/ConfirmOrder", { order_no: this.data.order_no }, (res) => {
        if (res.data.res_status_code == '0') {
          if (this.data.activedStatus) {
            prevPage.getOrderList(this.data.activedStatus);
            wx.hideLoading();
            wx.navigateBack({})
          }else{
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => { console.log(res) })
    } else if (this.data.operate == 'refund') {
      network.POST("Refund/CreateRefundOrder", { order_no: this.data.order_no }, (res) => {
        if (res.data.res_status_code == '0') {
          if (this.data.activedStatus) {
            prevPage.getOrderList(this.data.activedStatus);
            wx.hideLoading();
            wx.navigateBack({})
          }else{
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }
          
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => { console.log(res) })
    } else if (this.data.operate == 'cancel') {
      network.POST("Order/CancelOrder", { order_no: this.data.order_no }, (res) => {
        if (res.data.res_status_code == '0') {
          if (this.data.activedStatus){
            prevPage.getOrderList(this.data.activedStatus);
            wx.hideLoading();
            wx.navigateBack({})
          }else{
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }
         
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => { console.log(res) })
    } else if (this.data.operate == 'cancelrefund') {
      network.POST("Refund/CancelRefund", { refund_no: this.data.order_no }, (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          if (this.data.activedStatus) {
            prevPage.getOrderList(this.data.activedStatus);
            wx.hideLoading();
            wx.navigateBack({})
          }else{
            wx.redirectTo({
              url: '../orderList/orderList',
            })
          }
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => { console.log(res) })

    }

  },
  //取消
  cancel_one: function () {
    this.setData({
      modalHidden: true,
      tips: ""
    })
  },
  // 复制订单编号
  copy: function () {
    wx.setClipboardData({
      data: this.data.order_no,
    })
  },
  //更换身份证信息
  chooseidcard:function(e){
    console.log(e)
    network.PostFormId(e.detail.formId);
    wx.navigateTo({
      url: '../idcardList/idcardList?oid='+e.currentTarget.dataset.id+'&onmsg='+true
    })
  }
})