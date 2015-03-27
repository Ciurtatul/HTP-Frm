
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
      
      if(!Meteor.settings.SMTPSenderAddress)
        throw new Meteor.Error(500, 'Please provide SMTPSenderAddress in Meteor.settings');
      
      if(!Meteor.settings.SMTPReceiverAll)
        throw new Meteor.Error(500, 'Please provide SMTPReceiverAll in Meteor.settings');

      
      var postOwner = Meteor.users.findOne(post.userId);
      //alert("Post owner: " + postOwner.emails.shift().address);
      
      Meteor.call('sendEmail',
            Meteor.settings.SMTPSenderAddress,
            _.flatten(postOwner.emails.map(function(obj){return obj.address;}), Meteor.settings.SMTPReceiverAll),
            "HTP Forum post '" + post.title + "' - new comment",
            comment.author + " commented on your HTP Forum post: '" + post.title + "'");  
      
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



