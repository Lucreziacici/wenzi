// components/Toast/Toast.js
var app = getApp()
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    order: {
      type: Object,
      value: {}
    },
    source:{
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    resource: app.globalData.url,//资源路径
    resourceurl: resourceurl
  },
  ready:function(){
    // console.log(this.data)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 删除订单
    deleteOrder:function(e){
      var detail={
        id: e.currentTarget.dataset.id
      }
      this.triggerEvent('deleteOrder', detail)
    },
    // 确认订单收货
    confirmOrder:function(e){
      var detail = {
        id: e.currentTarget.dataset.id
      }
      this.triggerEvent('confirmOrder', detail)
    },
    //前往退款页面
    refund:function(e){
      var detail={
        order_detail_no: e.target.dataset.id,
        order_no: e.target.dataset.order_no
      }
      this.triggerEvent('refund', detail)
      // wx.navigateTo({
      //   url: '../refund/refund?order_detail_no=' + e.target.dataset.id + '&order_no=' + e.target.dataset.order_no
      // })
    },
    // 退款
    refundOrder: function (e) {
      var detail = {
        id: e.currentTarget.dataset.id
      }
      this.triggerEvent('refundOrder', detail)
    },
    //支付
    payOrder:function(e){
      network.PostFormId(e.detail.formId)
      wx.navigateTo({
        url: '../final/final?order_no=' + e.target.dataset.id
      })
    },
    //取消退款
    cancelrefund:function(e){
      console.log(e)
      var detail = {
        id: e.currentTarget.dataset.id
      }
      this.triggerEvent('cancelrefund', detail)
    },
    //取消订单
    cancelOrder:function(e){
      console.log(e)
      var detail = {
        id: e.currentTarget.dataset.id
      }
      this.triggerEvent('cancelOrder', detail)
    },
    //查看物流
    checkLogistics:function(e){
      console.log(e)
      //TODO 物流地址
      wx.navigateTo({
        url: '../logistics/logistics?order_no=' + e.target.dataset.id
      })
    }
  }
})
