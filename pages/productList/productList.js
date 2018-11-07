// pages/productList/productList.js
var app = getApp()
var resourceurl = app.globalData.resourceurl
var network = require("../../libs/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 1,
    filter: false,//是否打开筛选框
    brand: [],//品牌
    productList: [],//商品列表
    key_word: "",//搜索关键词
    brand_code: "",//品牌code
    page_index: "1",//当前页
    page_size: "8",//每页记录数
    order_column: "monthly_sales_volume",//排序字段 show_price
    order_sord: "desc",//正序asc，倒序desc
    category_id: "",//子分类id
    big_category_id:"",//大分类id
    price_active_img: resourceurl + "arrow_gray.png",
    nomore: false,//是否加载到底
    noresult: false,
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
    if (options.keyword) {
      this.setData({
        key_word: options.keyword
      })
    }
    if (options.category_id) {
      this.setData({
        category_id: options.category_id
      })
    }
    if (options.big_category_id){
      this.setData({
        big_category_id: options.big_category_id
      })
    }
    network.GET("Brand/BrandList", (res) => {
      if (res.data.res_status_code == '0') {
        for (var i = 0; i < res.data.res_content.length; i++) {
          res.data.res_content[i].checked = false;
        }
        this.setData({
          brand: res.data.res_content
        })
      }
    }, (res) => {
      console.log(res)
    }, this.data.userid)
    this.getShopGoodsList();
  },
  // 获取商品列表
  getShopGoodsList: function () {
    var getdata = {};
    getdata.key_word = this.data.key_word;
    getdata.brand_code = this.data.brand_code;
    getdata.category_id = this.data.category_id;
    getdata.big_category_id = this.data.big_category_id;
    getdata.page_index = this.data.page_index;
    getdata.page_size = this.data.page_size;
    getdata.order_column = this.data.order_column;
    getdata.order_sord = this.data.order_sord;
    network.GETJSON("ShopGoods/ShopGoodsList", getdata, (res) => {
      if (res.data.res_status_code == '0') {
        var productlist = this.data.productList;
        for (var i = 0; i < res.data.res_content.data_list.length; i++) {
          productlist.push(res.data.res_content.data_list[i])
        }
        this.setData({
          productList: productlist
        })
        if (res.data.res_content.page_index >= res.data.res_content.total_pages) {
          this.setData({
            nomore: true,
            noresult: false,
          })
        }
        if (res.data.res_content.data_list.length == '0' && res.data.res_content.total_pages == '0') {
          this.setData({
            noresult: true,
            nomore: false
          })
        }
      }
    }, (res) => {
      console.log(res)
    }, this.data.userid)

  },
  //排序
  orderby: function (e) {
    if (e.currentTarget.id == '2') {
      if (this.data.order_column == 'show_price' && this.data.order_sord == 'asc') {
        this.setData({
          order_column: 'show_price',
          order_sord: 'desc',
          price_active_img: resourceurl + 'arrow_active_down.png'
        });
      } else {
        this.setData({
          order_column: 'show_price',
          order_sord: 'asc',
          price_active_img: resourceurl + 'arrow_active_up.png'
        });
      }
      this.setData({
        currentTab: e.currentTarget.id,
        page_index: "1",
        nomore: false,
        productList: [],
        noresult: false,
      });
    }
    else {
      this.setData({
        currentTab: e.currentTarget.id,
        order_column: e.currentTarget.dataset.column,
        order_sord: e.currentTarget.dataset.rank,
        page_index: "1",
        nomore: false,
        productList: [],
        noresult: false,
        price_active_img: resourceurl + 'arrow_gray.png'
      });
    }
    this.getShopGoodsList();
  },
  // 打开筛选框
  openchoosefilter: function () {
    this.setData({
      filter: true,
    })
  },
  // 关闭筛选框
  closechoosefilter: function () {
    this.setData({
      filter: false
    })
  },
  // 前往搜索
  gosearch: function () {
    wx.navigateTo({
      url: '../search/search'
    })
  },
  // 选择排序
  navbarTap: function (e) {
    this.setData({
      currentTab: e.currentTarget.id,
      order_column: e.currentTarget.dataset.column,
      order_sord: e.currentTarget.dataset.rank,
      page_index: "1",
      nomore: false,
      productList: [],
      noresult: false,
    });
    this.getShopGoodsList();
  },
  //筛选排序
  tagChoose: function (e) {
    let brand = this.data.brand;
    brand[e.target.id].checked = !brand[e.target.id].checked;
    this.setData({
      brand: brand
    })

  },
  //重置：
  reset: function (e) {
    let brand = this.data.brand;
    for (var i = 0; i < brand.length; i++) {
      brand[i].checked = false;
    }
    this.setData({
      brand: brand
    })
  },
  //确定
  confirm: function (e) {
    //先关掉筛选框
    let brand = this.data.brand;
    let brandcode = []
    for (var i = 0; i < brand.length; i++) {
      if (brand[i].checked == true) {
        brandcode.push(brand[i].brand_code)
      }
    }
    this.setData({
      filter: false,
      brand_code: brandcode.join(","),
      page_index: "1",
      nomore: false,
      nomore: false,
      productList: []
    });
    this.getShopGoodsList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page_index = parseInt(this.data.page_index) + 1
    this.setData({
      page_index: page_index
    })
    this.getShopGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})