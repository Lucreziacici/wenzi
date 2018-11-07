// pages/search/search.js
//获取应用实例
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var resourceurl = app.globalData.resourceurl
var list = null;
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resource: app.globalData.url,
    keyword:"",
    history:[],
    hot:[],
    resourceurl: resourceurl
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    wx.getStorage({
      key: "historylist",
      success:(res)=> {
        this.setData({
          history: res.data
        })
      } 
    });
    this.SearchWordList();
  },
  keywordInput: function (event) {
    this.setData({
        keyword: event.detail.value
    })
  },
  SearchWordList:function(e){
    network.GET("HotSearch/SearchWordList", (res) => {
      console.log(res)
      if (res.data.res_status_code == '0') {
        this.setData({
          hot: res.data.res_content
        })
      }
    }, (res) => {
      console.log(res)
    })
   
  },
  keywordSubmit:function(e){
    let historylist=this.data.history;
    historylist.unshift(this.data.keyword);
    if(historylist.length>5){
      historylist.splice(5, 1)
    }
    Array.prototype.unique = function () {
      var res = [];
      var json = {};
      for (var i = 0; i < this.length; i++) {
        if (!json[this[i]]) {
          res.push(this[i]);
          json[this[i]] = 1;
        }
      }
      return res;
    }
    wx.setStorage({
      key: "historylist",
      data: historylist.unique()
    })
    wx.redirectTo({
      url: '../productList/productList?keyword=' + this.data.keyword,
    })
  },
  searchHistory:function(e){
    wx.redirectTo({
      url: '../productList/productList?keyword=' + e.currentTarget.dataset.key,
    })
  }
})