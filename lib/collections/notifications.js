
Notifications = new Mongo.Collection('notifications');

Notifications.allow({
  update: function(userId, doc, fieldNames) {
    return ownsDocument(userId, doc) && 
      fieldNames.length === 1 && fieldNames[0] === 'read';
  },
});



createCommentNotification = function(comment) {
  var post = Posts.findOne(comment.postId);
  //1:
  
  if (Meteor.isClient) {    
    Meteor.subscribe('singleUserEmail', post.userId, function () {

      
      var postOwner = Meteor.users.findOne(post.userId);
      //alert("Post owner: " + postOwner.emails.map(function(obj){return obj.address;}));//postOwner.emails.shift().address);
      
      Meteor.call('sendEmail',
            postOwner.emails.map(function(obj){return obj.address;}),
            "HTP Forum post '" + post.title + "' - new comment",
            "<b>" + comment.author + "</b>" + " commented on your HTP Forum post: <b>" + post.title + "</b>"
            + "<br/>" + "<a href="+(post.shortUrl ? post.shortUrl : post.url)+">"+(post.shortUrl ? post.shortUrl : post.url)+"</a>"
            + "<br/><br/><b>Comment body:</b><br/><br/>" + comment.body + "<br/><br/>", function (error, result) {
              if (error)
              //return alert(error.reason);
                return Errors.throw(error.reason);

              console.log("Comment body: " + comment.body);
            }
      );
    });
  } 
  
  //1:*/
  
  if (comment.userId !== post.userId) {
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false,
    });
  }
};



