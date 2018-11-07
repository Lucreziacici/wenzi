// pages/brand/brand.js
var app = getApp()
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brandinfo:{},
    resourceurl: resourceurl
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
      //action_flag 0:未审核，1：已审核
      if (userInfo.action_flag == 1) {
        this.setData({
          isApprove: true
        })
      }
    })
    console.log(options)
    this.setData({
      brand_code: options.brand_code
    })
    this.BrandDetail();
   
  
  },
  BrandDetail:function(){
    network.GET("Brand/BrandDetail?brand_code=" + this.data.brand_code, (res) => {
      console.log(res)
      if (res.data.res_status_code == '0') {
        this.setData({
          brandinfo: res.data.res_content
        })
      } else {
        this.selectComponent("#Toast").showToast(res.data.res_message)
      }
    }, (res) => {
      console.log(res)
    })

  },
  AddMyBrandCollection: function () {
    network.POST('Brand/AddMyBrandCollection', { brand_code: this.data.brandinfo.brand_code },
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          this.selectComponent("#Toast").showToast("收藏成功~");
          this.BrandDetail();
        }

      }, (res) => {
        console.log(res);
      })
  },
  RemoveMyBrandCollection: function () {
    network.POST('Brand/RemoveMyBrandCollection', { brand_code: this.data.brandinfo.brand_code },
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          this.selectComponent("#Toast").showToast("取消收藏~");
          this.BrandDetail();
        }

      }, (res) => {
        console.log(res);
      })
  },
})