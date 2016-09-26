//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this;
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      });
    }
  },
  getGitHubIssues:function(cb) {
    var that = this;
    if(this.globalData.issuesContent) {
      typeof cb == "function" && cb(this.globalData.issuesContent)
    } else {
      wx.request({
      url: 'https://raw.githubusercontent.com/rccoder/blog/gh-pages/api/list.json',
      success: function(res) {
        that.globalData.issues = res.data.content
        typeof cb == "function" && cb(that.globalData.issues)
      }
    })
    }
  },
  globalData:{
    userInfo:null
  }
})
