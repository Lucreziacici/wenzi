// pages/idcardList/idcardList.js
var network = require("../../libs/network.js")
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var resourceurl = app.globalData.resourceurl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resourceurl: resourceurl,
    autonym: false,
    onmsg: false,
    team: {
      real_name: "",
      id_card: ""
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      this.setData({
        userid: open_id,
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }

    })
    if (options.onmsg) {
      this.setData({
        oid: options.oid,
        onmsg: options.onmsg
      })
    }
    this.GetIDCardList();
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

  openautonym: function () {
    this.setData({
      autonym: !this.data.autonym
    })
  },
  GetIDCardList: function () {
    network.GET("CustomerIDCard/IDCardList", (res) => {
      console.log(res)
      if (res.data.res_status_code == '0') {
        var cardlist = res.data.res_content;
        for (var i = 0; i < cardlist.length; i++) {
          // cardlist[i].idcard = cardlist[i].id_card.substr(0, 6) + "*********" + cardlist[i].id_card.substr(15)
          cardlist[i].idcard = cardlist[i].id_card
         
        }
        this.setData({
          IDcardList: cardlist
        })
      } else {
        this.selectComponent("#Toast").showToast(res.data.res_message);
      }

    }, (res) => {
      console.log(res)
    }, this.data.open_id)
  },
  // 同步输入框里的值
  bindKeyInput: function (e) {
    if (e.currentTarget.dataset.type == 'realname') {
      this.setData({
        team: {
          real_name: e.detail.value,
          id_card: this.data.team.id_card
        }
      })
    } else if (e.currentTarget.dataset.type == 'idcard') {
      this.setData({
        team: {
          real_name: this.data.team.real_name,
          id_card: e.detail.value
        }
      })
    }
  },
  //提交信息
  postnews: function (e) {
    console.log('信息', e)
    network.PostFormId(e.detail.formId);
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (!this.data.team.real_name) {
      console.log("1")
      this.selectComponent("#Toast").showToast("请填写姓名");
      return false;
    }
    if (!this.data.team.id_card) {
      console.log("2")
      this.selectComponent("#Toast").showToast("请填写身份证号");
      return false;
    }
    if (!pattern.test(this.data.team.id_card)) {
      console.log("3")
      this.selectComponent("#Toast").showToast("身份证号格式有误");
      return false;
    }
    wx.showLoading({
      title: '提交中……',
    })
    console.log("提交信息")
    network.POST("CustomerIDCard/AddNewIDCard", this.data.team, (res) => {
      if (res.data.res_status_code == '0') {
        this.GetIDCardList();
        this.openautonym();
        this.setData({
          team: {
            real_name: "",
            id_card: ""
          },
        })
        wx.hideLoading();
      } else {
        this.selectComponent("#Toast").showToast(res.data.res_message);
        wx.hideLoading();
      }

      console.log(res)
    }, (res) => {
      console.log(res)
    }, this.data.open_id)
  },

  //删除
  deleteidcard: function (e) {
    console.log(e.currentTarget.dataset.id)
    console.log("删除身份证")
    network.POST('CustomerIDCard/DeleteIDCard', { id: e.currentTarget.dataset.id },
      (res) => {
        if (res.data.res_status_code == '0') {
          this.GetIDCardList();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
      }, (res) => {
        console.log(res);
      }, this.data.open_id)

  },
  radioChange: function (e) {
    console.log(e)
    network.POST('CustomerIDCard/SetDefaultIDCard', { id: e.currentTarget.dataset.id },
      (res) => {
        if (res.data.res_status_code == '0') {
          this.GetIDCardList();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
      }, (res) => {
        console.log(res);
      }, this.data.open_id)
  },
  // 选择
  chooseIdcard: function (e) {
    console.log("选择此身份证", e);
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上局页面
    var id = e.currentTarget.id;
    var data = {};
    data.order_no = this.data.oid
    data.id_card = e.currentTarget.dataset.id_card;
    data.real_name = e.currentTarget.dataset.real_name;
    network.POST('Order/UpdateOrderCustInfo', data,
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          prevPage.getOrderDetail();
          wx.navigateBack({})
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }

        // prevPage.setData({
        //   orderinformation: res.data.object,
        //   orderslist: res.data.objs,
        // })
        // wx.navigateBack({})
      }, (res) => {
        console.log(res);
      }, this.data.open_id)
  }

})