// pages/refund/refund.js
var app = getApp()
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 1,//退款数量
    order_detail_no:"",//订单明细id
    order_no: "",//订单id
    remark: "",//退款说明
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
        team: userInfo
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      
    })
    if (options.activedStatus){
      this.setData({
        activedStatus: options.activedStatus,
      })
    }
    if (options.source){
      this.setData({
        source: options.source,
      })
    }

    this.setData({
      order_detail_no: options.order_detail_no,
      order_no: options.order_no,
    })
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
    this.getOrderSingleDetail();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  // 获取退款单
  getOrderSingleDetail:function(){
    var data={}
    data.order_no = this.data.order_no
    data.order_detail_no = this.data.order_detail_no
    network.GETJSON("Order/OrderSingleDetail", data,(res)=>{
      console.log(res)
      if (res.data.res_status_code=="0"){
        this.setData({
          detail: res.data.res_content
        })

      }else{
        this.selectComponent("#Toast").showToast(res.data.res_message);
      }

    },(res)=>{
      
    })
  },

  // 减商品
  sub:function(e){
    if(this.data.num>1){
      this.setData({
        num: this.data.num - 1
      })
    }else{
      this.selectComponent("#Toast").showToast("不能再少了QAQ");
    }
    
  },
   // 加商品
  add: function (e) {
    if (this.data.num < this.data.detail.goods_count){
      this.setData({
        num: this.data.num + 1
      })
    }else{
      this.selectComponent("#Toast").showToast("退款件数不能超过您的购买数哦~");
    }

    
  },
  // textvalue:function(e){
  //  console.log(e)
  //  this.setData({
  //    remark:e.detail.value
  //  })
  // },
  textvalue: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },
  // 提交
  commit:function(e){
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    var data={};
    data.order_no = this.data.order_no;
    data.order_detail_no = this.data.order_detail_no;
    data.remark = this.data.remark;
    data.apply_num = this.data.num;
    console.log(data)
    network.POST("Refund/CreatePartRefundOrder",data,(res)=>{
      if (res.data.res_status_code){
        if (this.data.source){
          prevPage.setData({
            order: {}
          })
          prevPage.getOrderDetail();
          wx.navigateBack({})
        }else{
          prevPage.setData({
            orderList: []
          })
          prevPage.getOrderList(this.data.activedStatus);
          wx.navigateBack({})
        }
       
      }
    },(res)=>{console.log(res)})

  }

})