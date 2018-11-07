// pages/activity/activity.js
const app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    category_goods_list:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      category: options.category,
      category_order: options.category_order,
      home_id: options.home_id
    });
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
    this.getactivity();
    
  },
  //获取
  getactivity:function(){
    network.GETJSON("HomePage/GetSingleRecommendList", {category_order: this.data.category_order, home_id: this.data.home_id}, (res) => {
      if (res.data.res_status_code=='0'){
        this.setData({
          category: res.data.res_content
        })
      }else{
        this.selectComponent("#Toast").showToast(res.data.res_message);
      }
    }, (res) => {
      console.log(res)
    })
  }

 
})