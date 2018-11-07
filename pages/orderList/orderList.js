// pages/orderList/orderList.js
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid;
var resourceurl = app.globalData.resourceurl
import Watch from '../../libs/watch';
var network = require("../../libs/network.js")
let watch;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resource: app.globalData.url, //资源路径
    orderList: [], //订单列表
    activedTab: 0, //tab激活状态
    // tabList:['全部订单','待付款','待发货','已发货','已完成','退款'],//tab值
    tabList: [{
      title: '全部订单',
      status: ""
    }, {
      title: '待付款',
      status: "00"
    }, {
      title: '待发货',
      status: "10"
    }, {
      title: '已发货',
      status: "20"
    }, {
      title: '已完成',
      status: "30"
    }], //tab值
    modalHidden: true, //模态框是否显示
    tips: "", //模态框内容
    operate: "", //操作类型，delete:删除；refund：退款；confirm：确认收货 cancel：取消订单
    page_index: "1", //第几页
    page_size: "6", //一页多少条记录
    nomore: false,
    noresult: false,
    activedStatus: "",
    resourceurl: resourceurl
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        activedTab: options.id,
        activedStatus: options.status
      })
    }
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      if (options.id == 5) {
        this.getRefundList()
      } else {
        this.getOrderList(this.data.activedStatus)
      }
    })



  },
  // 获取订单列表
  getOrderList: function (e) {
    wx.showLoading({
      title: '加载中…',
    })
    var data = {}
    data.status = e;
    data.page_index = this.data.page_index;
    data.page_size = this.data.page_size;
    network.GETJSON("Order/OrderList", data, (res) => {
      if (res.data.res_status_code == '0') {

        this.setData({
          noresult: false,
          nomore: false
        })
        var orderList = this.data.orderList;
        for (var i = 0; i < res.data.res_content.data_list.length; i++) {
          orderList.push(res.data.res_content.data_list[i])
        }
        this.setData({
          orderList: orderList
        })
        wx.hideLoading();
        if (res.data.res_content.page_index >= res.data.res_content.total_pages) {
          this.setData({
            nomore: true,
            noresult: false,
          })
        }
        if (res.data.res_content.data_list.length == '0' && res.data.res_content.total_pages == '0') {
          this.setData({
            noresult: true,
            nomore: false
          })
        }
      } else {
        this.selectComponent("#Toast").showToast(res.data.res_message);
      }
    }, (res) => {
      console.log(res)
    }, this.data.userid)
  },
  watch: {
    activedTab: function (val, oldVal) {
      console.log("我变了", val, oldVal);
      if (val !== oldVal) {
        this.setData({
          page_index: "1",
          orderList: [],
        })
        if (val == '5') {
          this.getRefundList()
        } else {
          this.getOrderList(this.data.activedStatus);
        }
      }
    },
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          srollHeight: res.windowHeight - 51,
        });
      }
    });

  },
  // 切换tab
  switchTab: function (option) {
    watch = new Watch(this);
    watch.setData({
      activedTab: option.target.dataset.id.toString(),
      activedStatus: option.currentTarget.dataset.status
    })
  },

  // 加载更多
  loadMore: function () {
    this.data.page_index = parseInt(this.data.page_index) + 1
    this.setData({
      page_index: this.data.page_index
    });
    if (this.data.activedTab == 5) {
      if (!this.data.nomore) {
        this.getRefundList()
      }

    } else {
      if (!this.data.nomore) {
        this.getOrderList(this.data.activedStatus)
      }

    }

  },
  // 删除订单
  deleteOrder: function (e) {
    console.log(e)
    this.setData({
      modalHidden: false,
      tips: "真的要删除此订单么？",
      operate: "delete",
      activedorderno: e.detail.id
    })
  },
  //查看物流 
  checkLogistics: function (e) {
    console.log("查看物流")
  },
  // 退款
  refundOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否确认退款",
      operate: "refund",
      activedorderno: e.detail.id
    });
  },
  //确认收货
  confirmOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否确认收货",
      operate: "confirm",
      activedorderno: e.detail.id
    });
  },
  //取消订单
  cancelOrder: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否取消订单",
      operate: "cancel",
      activedorderno: e.detail.id
    });
  },
  //取消退款
  cancelrefund: function (e) {
    this.setData({
      modalHidden: false,
      tips: "是否取消退款申请",
      operate: "cancelrefund",
      activedorderno: e.detail.id
    });

  },
  //前往退款
  refund: function (e) {
    wx.navigateTo({
      url: '../refund/refund?order_detail_no=' + e.detail.order_detail_no + '&order_no=' + e.detail.order_no + '&activedStatus=' + this.data.activedStatus
    })
  },

  //点击确认
  confirm_one: function () {
    //如果操作是删除
    if (this.data.operate == 'delete') {
      network.POST("Order/DeleteOrder", {
        order_no: this.data.activedorderno
      }, (res) => {
        if (res.data.res_status_code == '0') {
          this.setData({
            modalHidden: true,
            tips: "",
            orderList: [],
            page_index: 1,
          })
          this.getOrderList(this.data.activedStatus);
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })
    } else if (this.data.operate == 'confirm') {
      network.POST("Order/ConfirmOrder", {
        order_no: this.data.activedorderno
      }, (res) => {
        if (res.data.res_status_code == '0') {
          this.setData({
            modalHidden: true,
            tips: "",
            orderList: [],
            page_index: 1,
          })
          this.getOrderList(this.data.activedStatus);
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })
    } else if (this.data.operate == 'refund') {
      network.POST("Refund/CreateRefundOrder", {
        order_no: this.data.activedorderno
      }, (res) => {
        if (res.data.res_status_code == '0') {
          console.log(res.data)
          this.setData({
            modalHidden: true,
            tips: "",
            orderList: [],
            page_index: 1,
          })
          this.getOrderList(this.data.activedStatus);
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })
    } else if (this.data.operate == 'cancel') {
      network.POST("Order/CancelOrder", {
        order_no: this.data.activedorderno
      }, (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          console.log(res.data)
          this.setData({
            modalHidden: true,
            tips: "",
            orderList: [],
            page_index: 1,
          })
          this.getOrderList(this.data.activedStatus);
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })
    } else if (this.data.operate == 'cancelrefund') {
      network.POST("Refund/CancelRefund", {
        refund_no: this.data.activedorderno
      }, (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          console.log(res.data)
          this.setData({
            modalHidden: true,
            tips: "",
            orderList: [],
            page_index: 1,
          })
          this.getOrderList(this.data.activedStatus);
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res)
      })

    }

  },
  //取消
  cancel_one: function () {
    this.setData({
      modalHidden: true,
      tips: ""
    })
  },

})