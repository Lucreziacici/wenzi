var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({
  data: {
    resources: app.globalData.url,//资源路径
    checkAllStatus: true,//全选状态
    carts: [],//购物车
    total_price: 0.0,//合计
    openid: null,//用户openid
    appid: app.globalData.appid,//小程序appid
    modalHidden: true,//弹框
    modalStatus: true,//弹框
    cartid: null,//选中商品的id
    cartindex: null,//选中商品的index
    cartvalues: [],//选中商品数组
    isApprove: false,//是否通过审核
    cart_ids:[],//选中商品ids数组
    resourceurl: resourceurl
  },
  onLoad: function (options) {
    wx.getStorage({
      key: 'useruserinfo',
      success: (res) => {
        if (res.data.action_flag == 1) {
          this.setData({
            isApprove: true
          })
        }
      },
    })
    network.IsuserInfo();
  },
  formSubmit: function (e) {
    console.log(e.detail.formId)
    network.PostFormId(e.detail.formId)
  },
  onShow: function () {
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
        team: userInfo
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      //action_flag 0:未审核，1：已审核
      if (userInfo.action_flag == 1) {
        this.setData({
          isApprove: true
        })
      }
      this.getMyCartList();
    })
  
  },
  //获取购物车列表
  getMyCartList:function(e){
    network.GET('ShoppingCart/MyCartList',
      (res) => {
        if (res.data.res_status_code == '0') {
          var cart_ids=[];
          for (var i = 0; i < res.data.res_content.cart_list.length; i++) {
            res.data.res_content.cart_list[i].checked = true;
            cart_ids.push(res.data.res_content.cart_list[i].id)
          }
          this.setData({
            carts: res.data.res_content.cart_list,
            invalid_list: res.data.res_content.invalid_list,
            cart_ids: cart_ids,
            checkAllStatus:true,
          });
          this.GetMyCartTotalPrice();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  //获取总价
  GetMyCartTotalPrice:function(e){
    network.GETJSON('ShoppingCart/GetMyCartTotalPrice', { cart_ids: this.data.cart_ids.join(",") },
      (res) => {
        console.log(res.data.res_content)
        if (res.data.res_status_code == '0') {
            this.setData({
              total_price:res.data.res_content.total_price
            })
        }else{
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  
  //选择checkbox
  checkboxChange: function (e) {
    var carts = this.data.carts, values = e.detail.value;
    var xuanzhong = true;
    this.setData({
      cart_ids: values
    })
    for (var i = 0; i < carts.length; ++i) {
      carts[i].checked = false;
      for (var j = 0; j < values.length; ++j) {
        if (carts[i].id == values[j]) {
          carts[i].checked = true;
          break
        }
      }
    }
    for (var i = 0; i < carts.length; i++) {
      if (!(this.data.carts[i].checked)) {
        xuanzhong = false;
      }
    }
    if (xuanzhong) {
      this.setData({
        checkAllStatus: true,
        carts: carts,
      });
    } else {
      this.setData({
        checkAllStatus: false,
        carts: carts,
      });
    }
    this.GetMyCartTotalPrice();
  },
  //选择全选
  checkAll: function (e) {
    var checkAllStatus = !this.data.checkAllStatus
    if (checkAllStatus) {
      for (var i = 0; i < this.data.carts.length; i++) {
        this.data.carts[i].checked = true
        this.data.cart_ids.push(this.data.carts[i].id)
      }
    } else {
      for (var i = 0; i < this.data.carts.length; i++) {
        this.data.carts[i].checked = false;
        this.data.cart_ids=[];
      }
    }
    this.setData({
      carts: this.data.carts,
      checkAllStatus: checkAllStatus,
      cart_ids: this.data.cart_ids
    });
    this.GetMyCartTotalPrice();
  },
  //添加项
  addNum: network.throttle(function (options) {
    var id = options.currentTarget.id;

    var price = 0;
    var data={};
    data.id = options.currentTarget.id;
    data.count=1;
    network.POST('ShoppingCart/CartAddNumber', data,
      (res) => {
        if (res.data.res_status_code == '0') {
          var carts = [];
          for (var i = 0; i < res.data.res_content.cart_list.length; i++) {
            for (var j = 0; j < this.data.cart_ids.length; j++) {
              if (res.data.res_content.cart_list[i].id == this.data.cart_ids[j]) {
                res.data.res_content.cart_list[i].checked = true;
                break
              }
            }
          }
          this.setData({
            carts: res.data.res_content.cart_list
          })
          this.GetMyCartTotalPrice();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      })
  }),
  //减少商品数量
  subNum: network.throttle(function (options) {
    var id = options.currentTarget.id;
    var price = 0;
    var data = {};
    data.id = options.currentTarget.id;
    data.count = 1;
    network.POST('ShoppingCart/CartReduceNumber',data,
      (res) => {
        if (res.data.res_status_code == '0') {
          var carts = [];
          for (var i = 0; i < res.data.res_content.cart_list.length; i++) {
            for (var j = 0; j < this.data.cart_ids.length; j++) {
              if (res.data.res_content.cart_list[i].id == this.data.cart_ids[j]) {
                res.data.res_content.cart_list[i].checked = true;
                break
              }
            }
          }
          this.setData({
            carts: res.data.res_content.cart_list
          })
          this.GetMyCartTotalPrice();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      })
    
  }),
  //提交订单
  formBindsubmit: function (e) {
    console.log(e)
    var opneid = e.detail.value.openid
    var appid = e.detail.value.appid
    this.setData({
      cartvalues: e.detail.value.cartvalues,
      opneid: e.detail.value.openid
    });
    if (this.data.cart_ids.length){
      this.setData({
        modalStatus: false,
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择商品',
        showCancel: false,
        success: function (res) {
        }
      })
    }
  },
  //弹出结算提示框
  confirmAccount: function (e) {
    this.setData({
      modalStatus: true,
    });
    if (this.data.cart_ids.length) {
      var data={};
      data.cart_ids = this.data.cart_ids.join(",")
      wx.showLoading({
        title: '生成订单中…',
        mask:true
      })
      network.POST('Order/CreateOrderFromCart',data,
        (res) => {
          console.log(res)
          wx.hideLoading();
          if (res.data.res_status_code=='0'){
            wx.navigateTo({
              url: '../final/final?order_no=' + res.data.res_content.order.order_no
            })
          }else{
            this.selectComponent("#Toast").showToast(res.data.res_message);
          }
        }, (res) => {
          console.log(res);
        })
    } else {
      wx.showModal({
        title: '提示',
        content: '请选择商品',
        showCancel: false,
        success: function (res) {
        }
      })
    }
  },
  //取消结算
  cancelAccount: function (e) {
    this.setData({
      modalStatus: true,
    });
  },
  //弹出确认删除框
  dialogDelete: function (e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    this.setData({
      cartid: id,
      cartindex: index
    })
    this.modalTap();
  },
  //弹出确认框  
  modalTap: function (e) {
    this.setData({
      modalHidden: false
    })
  },
  //确认删除
  confirmDelete: function (e) {
    this.setData({
      modalHidden: true,
    });
    var price = 0;
    var data={};
    data.id = e.currentTarget.dataset.id;
    network.POST('ShoppingCart/RemoveFromCart',data,
      (res) => {
        if (res.data.res_status_code=='0'){
          var carts=[];
          for (var i = 0; i < res.data.res_content.cart_list.length;i++){
            for (var j = 0; j < this.data.cart_ids.length;j++){
              if (res.data.res_content.cart_list[i].id==this.data.cart_ids[j]){
                res.data.res_content.cart_list[i].checked=true;
                break
              }
            }
          }
          this.setData({
            carts: res.data.res_content.cart_list,
            invalid_list: res.data.res_content.invalid_list,

          })
          this.GetMyCartTotalPrice();
        }else{
          this.selectComponent("#Toast").showToast(res.data.res_message);
        }
      }, (res) => {
        console.log(res);
      })
    
  },
  //取消删除
  cancelDelete: function (e) {
    this.setData({
      modalHidden: true,
    });
  },
  //验证商品数
  most: function () {
    this.selectComponent("#Toast").showToast("商品数量已经达到库存量哦~♪(^∇^*)");
  },
  //不能再少啦
  least: function () {
    this.selectComponent("#Toast").showToast("不能再少啦~QAQ");
  },
  // 打开修改数量模态框
  opennum: function (e) {
    console.log(e)
    this.setData({
      IsShow: true,
      ActiveItem: e.currentTarget.dataset.item,
      ActiveItemcount: e.currentTarget.dataset.item.count
    })
  },
  // 减少
  activesubNum: function (e) {
    console.log(this.data.ActiveItemcount)
    if (this.data.ActiveItemcount > 1) {
      this.setData({
        ActiveItemcount: parseInt(this.data.ActiveItemcount) - 1
      })
    } else {
      this.least();
    }
  },
  // 增加
  activeaddNum: function (e) {
    if (this.data.ActiveItemcount < this.data.ActiveItem.stock_count) {
      this.setData({
        ActiveItemcount: parseInt(this.data.ActiveItemcount) + 1
      })
    } else {
      this.most();
    }
  },
  bindKeyInput: function (e) {
    this.setData({
      ActiveItemcount: e.detail.value
    })
  },
  closechangebox: function (e) {
    this.setData({
      IsShow: false,
    })
  },
  changeNumSure: function (e) {
    console.log(e)
    if (this.data.ActiveItemcount <= 0) {
      this.least();
      this.closechangebox();
    } else if (this.data.ActiveItemcount >= this.data.ActiveItem.stock_count) {
      this.most();
      this.closechangebox();
    } else {
      var data = {};
      data.id = this.data.ActiveItem.id;
      data.count = this.data.ActiveItemcount;
      network.POST('ShoppingCart/CartReviseNumber', data,
        (res) => {
          if (res.data.res_status_code == '0') {
            var carts = [];
            for (var i = 0; i < res.data.res_content.cart_list.length; i++) {
              for (var j = 0; j < this.data.cart_ids.length; j++) {
                if (res.data.res_content.cart_list[i].id == this.data.cart_ids[j]) {
                  res.data.res_content.cart_list[i].checked = true;
                  break
                }
              }
            }
            this.setData({
              carts: res.data.res_content.cart_list
            })
            this.GetMyCartTotalPrice();
          } else {
            this.selectComponent("#Toast").showToast(res.data.res_message);
          }
        }, (res) => {
          console.log(res);
        })
      this.closechangebox();
    }
  }
})