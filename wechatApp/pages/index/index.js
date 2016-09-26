//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {
      nickName: 'rccoder',
      avatarUrl: '//avatars2.githubusercontent.com/u/7554325?v=3&s=466'
    },
    issuesContent: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    app.getGitHubIssues(function(issuesContent) {
      console.log(issuesContent)
      that.setData({
        issuesContent: issuesContent
      })
      that.update()
    })
  }
})
