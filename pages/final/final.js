var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
var promise = require("../../libs/promise.util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},//用户信息
    openid: null,//openid
    resources: app.globalData.url,//资源路径
    yhjuanview: false,
    orderslist: [],//订单商品状态
    yhjuans: [],//优惠券
    showmore:false,//是否显示更多
    showpay:false,//是否显示选择支付方式
    paymethod:'wx',//默认支付方式
    autonym:false,//是否展示实名信息弹框
    team:{
      real_name:"",
      id_card:""
    },
    islayer: false,
    resourceurl: resourceurl
  },

  onLoad: function (options) {
    this.setData({
      order_no: options.order_no
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
  //获取订单详情
  getOrderDetail:function(){
    wx.showLoading({
      title: '加载中…',
    })
    network.GET('Order/OrderDetail?order_no=' + this.data.order_no,
      (res) => {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.res_status_code == '0') {
          this.setData({
            orderdetail_list: res.data.res_content.package_list,
            order: res.data.res_content.order
          })
        }
      }, (res) => {
        console.log(res);
      })
  },
  //更新备注
  updatebeizhu: function (event) {
    var tex = event.detail.value;
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    var data={};
    data.order_no=this.data.order.order_no;
    data.remark = event.detail.value;
    network.POST('Order/UpdateOrderRemark',data,
      (res) => {
        wx.hideLoading();
      }, (res) => {
        console.log(res);
      })

  },
  //提交备注
  beizhuSubmit: function (event) {
    var tex = event.detail.value;
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    var data = {};
    data.order_no = this.data.order.order_no;
    data.remark = event.detail.value;
    network.POST('Order/UpdateOrderRemark', data,
      (res) => {
        wx.hideLoading();
      }, (res) => {
        console.log(res);
      })


  },
  //支付
  zhifu: function (event) {
    console.log('是否保税区', this.data.order.verify_id_flag, (this.data.order.real_name == null || this.data.order.id_card == null) && this.data.order.verify_id_flag)
    if (this.data.order.province == null) {
      this.selectComponent("#Toast").showToast("请选择收货地址");
    } else if ((this.data.order.real_name == null || this.data.order.id_card == null) && this.data.order.verify_id_flag){
      this.selectComponent("#Toast").showToast("请选择身份证信息");
    } else {
      wx.navigateTo({
        url: '../zhifu/zhifu?order_no=' + this.data.order.order_no +"&&formId="+event.detail.formId
      })
    }
  },
  //显示更多
  showmore:function(){
    this.setData({
      showmore:!this.data.showmore
    })
  },
  //选择支付方式
  choosemethod:function(e){
    console.log(e.target.dataset.type)
    if (e.target.dataset.type=="1"){
      this.setData({
        paymethod: 'wx', 
        showpay: false
      })
    } else if (e.target.dataset.type== '2'){
      this.setData({
        paymethod: 'ali',
        showpay:false
      })
    }else{
      this.setData({
        showpay:false
      })
    }
  },
  // 选择支付方式
  choosepay:function(){
    this.setData({
      showpay: !this.data.showpay
    })
  },
  alipay:function(){
   
    if (this.data.order.province == null) {
      this.selectComponent("#Toast").showToast("请选择收货地址");
    } else if ((this.data.order.real_name == null || this.data.order.id_card == null) && this.data.order.verify_id_flag) {
      this.selectComponent("#Toast").showToast("请选择身份证信息");
    } else {
      wx.showLoading({
        title: '生成订单中…',
        mask: true,
      })
      network.POST('OrderPay/AliOrderPay', { order_no: this.data.order_no },
        (res) => {
          wx.hideLoading();
          if (res.data.res_status_code=='0'){
            this.setData({
              alipay: true
            })
            wx.showLoading({
              title: '正在生成图片',
              mask: true,
            })
            const wxGetImageInfo = promise.promisify(wx.getImageInfo)
            var order = res.data.res_content;
            Promise.all([
              wxGetImageInfo({
                src: res.data.res_content.barcode_url
              })
            ]).then(res => {
              const ctx = wx.createCanvasContext('shareCanvas')
              ctx.drawImage("../../images/alipaybg.png", 0, 0, 325, 440)
              ctx.setTextAlign('right')    // 文字居中
              ctx.setFillStyle('#000000')  // 文字颜色：黑色
              ctx.setFontSize(14)         // 文字字号：22px
              ctx.fillText("请于", 325 / 2 - 60, 100)
              ctx.setTextAlign('center')    // 文字居中
              ctx.setFillStyle('#e53e42')  // 文字颜色：黑色
              ctx.setFontSize(14)         // 文字字号：22px
              ctx.fillText(order.expired_time, 325 / 2 - 30, 100)
              ctx.setTextAlign('center')    // 文字居中
              ctx.setFillStyle('#000000')  // 文字颜色：黑色
              ctx.setFontSize(14)         // 文字字号：22px
              ctx.fillText("前支付", 325 / 2 + 30, 100)
              ctx.setTextAlign('center')    // 文字居中
              ctx.setFillStyle('#e53e42')  // 文字颜色：黑色
              ctx.setFontSize(14)         // 文字字号：22px
              ctx.fillText("￥" + order.pay_price, 325 / 2 + 80, 100)
              // 小程序码
              const qrImgSize = 160
              ctx.drawImage(res[0].path, (325 - qrImgSize) / 2, 140, qrImgSize, qrImgSize)

              ctx.stroke()
              ctx.draw()
              wx.hideLoading();
            })
          }else{
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
        })
    }
    
   
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
  },
  //保存到本地
  save: function () {
    const wxCanvasToTempFilePath = promise.promisify(wx.canvasToTempFilePath)
    const wxSaveImageToPhotosAlbum = promise.promisify(wx.saveImageToPhotosAlbum)

    wxCanvasToTempFilePath({
      canvasId: 'shareCanvas'
    }, this).then(res => {
      return wxSaveImageToPhotosAlbum({
        filePath: res.tempFilePath
      })
    }).then(res => {
      wx.showToast({
        title: '已保存到相册'
      });
      wx.navigateTo({
        url: '../orderList/orderList'
      })
    })

  },
  //关闭弹窗
  closelayer:function(){
    this.setData({
      alipay:false
    })
  },
  // 同步输入框里的值
  bindKeyInput:function(e){
    if (e.currentTarget.dataset.type=='realname'){
      this.setData({
        team:{
          real_name:e.detail.value,
          id_card:this.data.team.id_card
        }
      })
    } else if (e.currentTarget.dataset.type == 'idcard'){
      this.setData({
        team: {
          real_name: this.data.team.real_name,
          id_card: e.detail.value
        }
      })
    }
  },
  //提交实名信息
  postnews:function(){
    wx.showLoading({
      title: '提交中……',
    })
    var data = {};
    data.real_name = this.data.team.real_name;
    data.id_card = this.data.team.id_card;
    data.order_no = this.data.order_no;
    network.POST('Order/UpdateOrderCustInfo', data,
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          app.globalData.userInfo = res.data.res_content;
          wx.setStorage({
            key: 'userinfo',
            data: res.data.res_content,
          })
          this.setData({
            autonym:false
          })
          this.getOrderDetail();
          wx.hideLoading();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message);
          wx.hideLoading();
        }
      }, (res) => {
        console.log(res);
      })
  },
  //打开实名弹框
  openautonym:function(){
    this.setData({
      autonym:!this.data.autonym
    })
  }

})