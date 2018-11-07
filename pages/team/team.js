//获取应用实例
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({
  data: {
    resources: app.globalData.url,//资源路径
    appid: '',//appid
    userInfo: {},//用户微信信息
    openid: null,//用户openid
    admin: {},//管理信息
    team: {},//用户信息
    list:[
      {
        name:"地址管理",
        link:"../addressList/addressList"
      },
      {
        name: "身份证信息管理",
        link: "../idcardList/idcardList"
      },
      {
        name: "我的足迹",
        link: "../footprint/footprint"
      },
      {
        name: "我的收藏",
        link: "../collect/collect"
      },
      {
        name: "优惠劵管理",
        link: "../yhjuan/yhjuan"
      },
      
      // {
      //   name: "我的资料",
      //   link: "../memberInformation/memberInformation"
      // },
    ],
    orderlist: [
      {
        title: "待付款",
        icon: resourceurl + "obligation-icon.png",
        status: '00',
        id: 1,
        url: "/pages/orderList/orderList?status=00&id=1"

      }, {
        title: "待发货",
        icon: resourceurl + "receiving-icon.png",
        status: '10',
        id: 2,
        url: "/pages/orderList/orderList?status=10&id=2"
      },
      {
        title: "已发货",
        icon: resourceurl + "evaluated-icon.png",
        status: '20',
        id: 3,
        url: "/pages/orderList/orderList?status=20&id=3"
      },
      {
        title: "已完成",
        icon: resourceurl + "order-icon.png",
        status: '30',
        id: 4,
        url: "/pages/orderList/orderList?status=30&id=4"
      },
      {
        title: "退款",
        icon: resourceurl + "refund-icon.png",
        status: '90',
        id: 5,
        url: "/pages/refundOrder/refundOrder"
      }
    ],
    resourceurl: resourceurl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    network.IsuserInfo();
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
  onShow:function(){
    network.GET("Order/OrderCountByStatusGroup", (res) => {
      if (res.data.res_status_code == '0') {
        this.data.orderlist[0].num = res.data.res_content.order_count_new;
        this.data.orderlist[1].num = res.data.res_content.order_count_pay;
        this.data.orderlist[2].num = res.data.res_content.order_count_delivery;
        this.data.orderlist[3].num = res.data.res_content.order_count_complete;
        this.data.orderlist[4].num = res.data.res_content.order_count_refund;
        this.setData({
          orderlist:this.data.orderlist
        });
      }
    }, (res) => {
      console.log(res)
      }, this.data.userid)
  },
  calling: function () {
    wx.makePhoneCall({
      phoneNumber: this.data.admin.kfphone, //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '个人中心',
      path: 'pages/team/team',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }


})