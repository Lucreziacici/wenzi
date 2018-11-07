//获取应用实例
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var title = app.globalData.title
var resourceurl = app.globalData.resourceurl
var opid = ""
var network = require("../../libs/network.js")
Page({
  data: {
    resources: app.globalData.url,//资源路径
    // tip:'',//好像没有用到过，后期没问题删掉
    addresslist: [],//地址列表
    userInfo: {},//用户信息
    openid: null,//用户id
    oid: '',//订单id，数据从上个组件传来
    onmsg: false,//判断是否为下订单时选择地址，数据从上个组件传来
    modalHidden: true,//控制模态框显示/隐藏
    addressId: 0,//地址id
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
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      this.getAddressList();
      
    })
    var that = this
    if (options.oid) {
      this.setData({
        oid: options.oid,
        onmsg: options.onmsg
      });
    }
    
    wx.showLoading({
      title: '加载中....',
      mask: true
    })
    // app.getUserInfo((userInfo, openid) => {
    //   //更新数据
    //   console.log(openid)
    //   console.log(userInfo)
    //   this.setData({
    //     userInfo: userInfo,
    //     openid: openid
    //   });
    //   if (!openid) {
    //     this.selectComponent("#Toast").showToast("获取身份失败，请刷新后重试")
    //     return false;
    //   }
    //   this.getAddressList();
    // });

  },
  //获取地址列表
  getAddressList: function () {
    network.GET('CustomerAddress/AddressList',
      (res) => {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.res_status_code=='0'){
          this.setData({
            addresslist: res.data.res_content
          });
        }else{
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
       
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  //切换默认地址
  radioChange: function (e) {
    wx.showLoading({
      title: '加载中....',
      mask: true,
    })
    console.log(e)
    var id = e.currentTarget.dataset.id;
    network.POST('CustomerAddress/SetDefaultAddress',{id:id},
      (res) => {
        if (res.data.res_status_code=='0'){
          this.getAddressList();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
        wx.hideLoading();
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  //下单时选择地址 todo  暂时没看懂，看到下单这里再改，暂时只改函数名TODO
  chooseAddress: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];//上局页面
    var id = e.currentTarget.id;
    var data={};
    data.order_no = this.data.oid
    data.address_id=id
    network.POST('Order/UpdateOrderAddress',data,
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
      }, this.data.userid)
  },
  //弹出确认框  
  modalShow: function (e) {
    var id = e.currentTarget.id;
    this.setData({
      modalHidden: false,
      addressId: id
    })
  },
  //删除地址
  deleteAddress: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      modalHidden: true,
    });
    network.POST('CustomerAddress/DeleteAddress', {id:id},
      (res) => {
        if (res.data.res_status_code == '0') {
          this.getAddressList();
        } else {
          this.selectComponent("#Toast").showToast(res.data.res_message)
        }
      }, (res) => {
        console.log(res);
      }, this.data.userid)
  },
  //取消删除隐藏模态框
  modalHidden: function (e) {
    this.setData({
      modalHidden: true,
    });
  },
  //获取微信地址授权，如果拒绝授权，就跳转
  addAddress: function (e) {
    if (wx.chooseAddress) {
      wx.chooseAddress({
        success: (res) => {
          wx.showLoading({
            title: '加载中....',
            mask: true,
          })
          var addressdata = {};
          addressdata.address = res.detailInfo;
          addressdata.city = res.cityName;
          addressdata.receiver_name = res.userName;
          addressdata.receiver_phone = res.telNumber;
          addressdata.province = res.provinceName;
          addressdata.district = res.countyName;
          network.POST('CustomerAddress/AddNewAddress', addressdata,
            (res) => {
              if (res.data.res_status_code == '0') {
                this.getAddressList();
              } else {
                this.selectComponent("#Toast").showToast(res.data.res_message)
              }
              wx.hideLoading();
            }, (res) => {
              console.log(res);
            }, this.data.userid)
        },
        fail: (err) => {
          wx.navigateTo({
            url: '/pages/addAddress/addAddress'
          })
        }
      })
    } else {
      console.log('当前微信版本不支持chooseAddress');
    }
  },
})