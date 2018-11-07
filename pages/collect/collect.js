// pages/collect/collect.js
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
    productList: [],
    activedTab:0,
    tabList: [{
      title: '商品'
    }, {
        title: '品牌'
    }], //tab值
    noresult:false,
    noresult2:false,
    resourceurl: resourceurl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
    })
    this.MyGoodsCollectionList();
  },
  MyGoodsCollectionList:function(){
    network.GET("ShopGoods/MyGoodsCollectionList",(res)=>{
      this.setData({
        productList: res.data.res_content.data_list
      })
      if(res.data.res_content.data_list.length==0){
        this.setData({
          noresult:true
        })
      } else {
        this.setData({
          noresult: false
        })
      }
      console.log(res)
    },(res)=>{
      console.log(res)
    })
  },
  MyBrandCollectionList:function(){
    network.GET("Brand/MyBrandCollectionList", (res) => {
      this.setData({
        brandList: res.data.res_content
      })
      if (res.data.res_content.length == 0) {
        this.setData({
          noresult2: true
        })
      }else{
        this.setData({
          noresult2: false
        })
      }
      console.log(res)
    }, (res) => { })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  watch: {
    activedTab: function (val, oldVal) {
      if (val !== oldVal) {
        console.log(val)
        if(val==0){
          this.MyGoodsCollectionList();
        }else{
          
          this.MyBrandCollectionList();
        }
      }
    },
  },
  // 切换tab
  switchTab: function (option) {
    watch = new Watch(this);
    watch.setData({
      activedTab: option.target.dataset.id.toString()
    })
  },
})