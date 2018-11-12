// 删减大概三十行  by xixi
var WxParse = require('../../wxParse/wxParse.js')
var app = getApp()
var url = app.globalData.url
var appid = app.globalData.appid
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({
  data: {
    // openid: '',//openid
    swiperImages: [], //商品轮播图
    product: {}, //商品信息
    productId: "",
    specificationList: [], //规格
    resources: app.globalData.url, //资源路径
    widgets: true, //控制下单窗体是否显示
    quantity: 1, //选择商品数量
    specificationId: null, //商品规格id
    repertory: '', //商品库存
    repertoryMax: 100, //商品库存最大值
    team: {}, //用户信息
    srollHeight: "1000px", //滚动高度
    isAddCart: "0", //是否为加入购物车
    isApprove: false,
    Buystate: false, //是否能购买
    userid: "", //用户id
    discount_type: "0",//团购类型
    discount_price: 0,//团购价格
    discount_type_name:'',
    original: 0,//原始价格
    Isseckill_flag: false, //是否为秒杀活动
    Iscount: false, //是否在倒计时
    counttime: {}, //倒计时
    time: 0,
    resourceurl: resourceurl
  },
  onLoad: function (options) {
    app.getUserInfo((userInfo, open_id) => {
      //更新数据
      console.log(userInfo)
      this.setData({
        userid: open_id,
        team: userInfo
      });
      if (!this.data.userid) {
        this.selectComponent("#Toast").showToast("信息读取失败，请刷新后重试");
      }
      //action_flag 0:未审核，1：已审核
      // if (userInfo.action_flag == 1) {
      this.setData({
        isApprove: true
      })
      // }
    })
    wx.getStorage({
      key: 'userinfo',
      success: (res) => {
        this.setData({
          team: res.data
        })
        this.setData({
          isApprove: true
        })
      },
    })
    this.setData({
      productId: options.id
    })

  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
    this.ShopGoodsDetail();
  },
  /**
   * 生命周期函数--监听页面显示
   * 顺便获取页面高度
   */
  onShow: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          srollHeight: res.windowHeight - 40,
        });
      }
    })
  },
  formSubmit: function (e) {
    network.PostFormId(e.detail.formId);
  },
  ShopGoodsDetail: function () {
    //获取商品信息
    network.GET("ShopGoods/ShopGoodsDetail?goods_id=" + this.data.productId, (res) => {
      console.log(res)
      if (res.data.res_status_code == '0') {
        var animTranspond = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease-out'
        })
        animTranspond.translate(0, 0).rotateZ(0).opacity(1).step();
        this.setData({
          animTranspond: animTranspond.export(),
          product: res.data.res_content
        })
        if (res.data.res_content.seckill_flag == "Y") {
          this.setData({
            Isseckill_flag: true
          })
          this.counttime();
        }
        for (var i = 0; i < res.data.res_content.spec_list.length; ++i) {
          if (res.data.res_content.spec_list[i].stock_count > 0) {
            this.setData({
              repertoryMax: res.data.res_content.spec_list[i].stock_count,
              specificationId: res.data.res_content.spec_list[i].spec_no,
              currentTab: res.data.res_content.spec_list[i].spec_no,
              repertory: res.data.res_content.spec_list[i].stock_count,
              active: res.data.res_content.spec_list[i],
              Buystate: true,
              discount_type: res.data.res_content.spec_list[i].discount_type,
              discount_price: res.data.res_content.spec_list[i].discount_price,
              discount_type_name: res.data.res_content.spec_list[i].discount_type_name,
              original: res.data.res_content.spec_list[i].total_price,
            });
            if (res.data.res_content.intax == '0' && res.data.res_content.inbond == '1') {
              this.setData({
                tax: res.data.res_content.spec_list[i].tax
              });
            } 
            break;
          } else {
            this.setData({
              discount_price: res.data.res_content.spec_list[i].price,
              discount_type_name: res.data.res_content.spec_list[i].discount_type_name,
              original: res.data.res_content.spec_list[i].total_price,
            });
            if (res.data.res_content.intax == '0' && res.data.res_content.inbond == '1') {
              this.setData({
                tax: res.data.res_content.spec_list[i].tax
              });
            } 
          }
        }

        WxParse.wxParse('article', 'html', res.data.res_content.rich_text, this, 5);
      } else {
        this.selectComponent("#Toast").showToast(res.data.res_message)
      }
    }, (res) => {
      console.log(res)
    }, this.data.userid)
  },
  // 倒计时
  counttime() {
    if (new Date(this.data.product.seckill_time.replace("T", " ").replace("-", "/").replace("-", "/")).getTime() - new Date(this.data.product.server_time).getTime() - this.data.time > 0) {
      let time = (new Date(this.data.product.seckill_time.replace("T", " ").replace("-", "/").replace("-", "/")).getTime() - new Date(this.data.product.server_time).getTime() - this.data.time) / 1000;
      // 获取天、时、分、秒
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      var obj = {
        day: this.timeFormat(day),
        hou: this.timeFormat(hou),
        min: this.timeFormat(min),
        sec: this.timeFormat(sec)
      }
      this.setData({
        counttime: obj,
        Iscount: true,
      })
    } else { //活动已结束，全部设置为'00'
      var obj = {
        day: '00',
        hou: '00',
        min: '00',
        sec: '00'
      }
      this.setData({
        counttime: obj,
        Iscount: false,
      })
    }
    if (this.data.Iscount) {
      setTimeout(this.counttime, 1000);
      setTimeout(this.addtime, 1000);
    }
  },
  addtime() {
    this.setData({
      time: this.data.time + 1000
    })
  },
  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  // 下单显示弹窗
  onChangeShowState: function (options) {
    //根据data-type 判断是加入购物车还是立即购买 分销版不用判断
    // if (this.data.team.action_flag == '0') {
    //   this.selectComponent("#Toast").showToast("你资料还在审核中暂时无法购买")
    // } else if (this.data.team.action_flag == '2') {
    //   this.selectComponent("#Toast").showToast("很抱歉，你的资料没有审核通过，暂时无法购买，请重新上传或者联系客服")
    // } else if (this.data.team.action_flag == '1') {
    if (options.currentTarget.dataset.type) {
      this.setData({
        widgets: (!this.data.widgets),
        isAddCart: options.currentTarget.dataset.type
      })
    } else {
      this.setData({
        widgets: (!this.data.widgets),
      })
      // }

    }
  },
  // 选择规格
  rudioChoose: function (options) {
    //设置当前样式
    this.setData({
      specificationId: options.currentTarget.dataset.id,
      repertory: options.currentTarget.dataset.repertory,
      repertoryMax: options.currentTarget.dataset.repertory,
      currentTab: options.currentTarget.dataset.id, //选中id
      quantity: 1,
      discount_price: options.currentTarget.dataset.item.discount_price,
      discount_type_name: options.currentTarget.dataset.item.discount_type_name,
      original: options.currentTarget.dataset.item.total_price,
      discount_type: options.currentTarget.dataset.item.discount_type,
    });
    if (this.data.product.intax == '0') {
      this.setData({
        tax: options.currentTarget.dataset.tax
      });
    } 
  },
  //售空
  soldout: function () {
    this.selectComponent("#Toast").showToast("此规格已售罄，换一个吧~")
  },
  //增加数量
  addNum: function (options) {
    this.setData({
      quantity: this.data.quantity + 1
    });
  },
  //减少数量
  subNum: function (options) {
    this.setData({
      quantity: this.data.quantity - 1
    });
  },
  //没有更多
  nomore: function (options) {
    this.selectComponent("#Toast").showToast("不能比库存多哦~QAQ")
  },
  //加入购物车
  addcart: function () {
    if (this.data.repertory == '0') {
      this.setData({
        widgets: (!this.data.widgets),
      });
      this.selectComponent("#Toast").showToast("已售空");
    } else {
      wx.showLoading({
        title: '加载中…',
        mask: true
      })
      var cartdata = {};
      cartdata.goods_id = this.data.product.goods_id;
      cartdata.spec_no = this.data.currentTab;
      cartdata.count = this.data.quantity;
      network.POST('ShoppingCart/AddToCart', cartdata,
        (res) => {
          wx.hideLoading();
          if (res.data.res_status_code == '0') {
            wx.showToast({
              title: '成功',
              icon: 'success',
              duration: 2000
            })
            this.setData({
              widgets: (!this.data.widgets),
            })
          } else {
            this.selectComponent("#Toast").showToast(res.data.res_message);
          }
        }, (res) => {
          console.log(res);
        })
    }
  },
  //立即购买
  addorder: function () {
    if (this.data.Iscount) {
      this.selectComponent("#Toast").showToast("活动还未开始~");
    } else {
      if (this.data.repertory == '0') {
        this.setData({
          widgets: (!this.data.widgets),
        });
        this.selectComponent("#Toast").showToast("已售空");
      } else {
        var cartdata = {};
        cartdata.goods_id = this.data.product.goods_id;
        cartdata.spec_no = this.data.currentTab;
        cartdata.count = this.data.quantity;
        wx.showLoading({
          title: '生成订单中…',
          mask: true
        })
        network.POST('Order/CreateOrderFromGoods', cartdata,
          (res) => {
            console.log(res)
            wx.hideLoading();
            if (res.data.res_status_code == '0') {
              wx.navigateTo({
                url: '../final/final?order_no=' + res.data.res_content.order.order_no
              })
            } else {
              this.selectComponent("#Toast").showToast(res.data.res_message);
            }
          }, (res) => {
            console.log(res);
          })
      }
    }


  },

  //前往首页
  gohome: function () {
    wx.switchTab({
      url: '../index/index'
    });
  },
  //前往购物车
  gocart: function () {
    wx.switchTab({
      url: '../cart/cart'
    });
  },
  // 商品收藏
  collect: function () {
    if (this.data.product.is_collected == 0) {
      network.POST('ShopGoods/AddMyGoodsCollection', {
        goods_id: this.data.product.goods_id
      },
        (res) => {
          console.log(res)
          if (res.data.res_status_code == '0') {
            this.selectComponent("#Toast").showToast("收藏成功~");
            this.ShopGoodsDetail()
          }

        }, (res) => {
          console.log(res);
        })
    } else {
      network.POST('ShopGoods/RemoveMyGoodsCollection', {
        goods_id: this.data.product.goods_id
      },
        (res) => {
          console.log(res)
          if (res.data.res_status_code == '0') {
            this.selectComponent("#Toast").showToast("取消收藏~");
            this.ShopGoodsDetail()
          }

        }, (res) => {
          console.log(res);
        })
    }

  },
  AddMyBrandCollection: function () {
    network.POST('Brand/AddMyBrandCollection', {
      brand_code: this.data.product.brand_code
    },
      (res) => {
        console.log(res)
        if (res.data.res_status_code == '0') {
          this.selectComponent("#Toast").showToast("收藏成功~");
          this.ShopGoodsDetail()
        }

      }, (res) => {
        console.log(res);
      })
  },
  RemoveMyBrandCollection: function () {
    network.POST('Brand/RemoveMyBrandCollection', {
      brand_code: this.data.product.brand_code
    },
      (res) => {
        if (res.data.res_status_code == '0') {
          this.selectComponent("#Toast").showToast("取消收藏~");
          this.ShopGoodsDetail()
        }

      }, (res) => {
        console.log(res);
      })
  },
  // 转发
  onShareAppMessage: function (res) {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    var options = currentPage.options;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: this.data.product.goods_name,
      path: 'pages/product/product?id=' + options.id,
      imageUrl: this.data.product.main_image,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})