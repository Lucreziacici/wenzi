// pages/service/service.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url1: 'https://fx.comeyang.com/upload/neigoubarcode.jpg',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  previewImage: function (e) {
    wx.previewImage({
      urls: this.data.url1.split(',')
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错  
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})