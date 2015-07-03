
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
      //1: send email to post owner if commenter is somebody else
      if (comment.userId !== post.userId) {

        Meteor.subscribe('singleUserEmail', post.userId, function () {

          var postOwner = Meteor.users.findOne(post.userId);
          //alert("Post owner: " + postOwner.emails.map(function(obj){return obj.address;}));//postOwner.emails.shift().address);

          Meteor.call('sendEmail',
                postOwner.emails.map(function(obj){return obj.address;}),
                "HTP Forum post '" + post.title + "' - new comment",
                "<b>" + comment.author + "</b>" + " commented on your HTP Forum post: <b>" + post.title + "</b>"
                + "<br/>" + "<a href="+(post.shortUrl ? post.shortUrl : post.url)+">"+(post.shortUrl ? post.shortUrl : post.url)+"</a>"
                + "<br/><br/><b>Comment body:</b><br/><br/>" + comment.body + "<br/><br/>", function (error, outcome) {
                  if (error)
                      return Errors.throw(error.reason); //return alert(error.reason);
                  console.log("Email sent to post owner. Return code: " + outcome);
                }
          );
        });
      }

      //1: send email to post assignee if commenter is somebody else
      if (comment.userId !== post.assigneeId) {

          Meteor.subscribe('singleUserEmail', post.assigneeId, function () {

              var postAssignee = Meteor.users.findOne(post.assigneeId);
              //alert("Post owner: " + postOwner.emails.map(function(obj){return obj.address;}));//postOwner.emails.shift().address);

              Meteor.call('sendEmail',
                  postAssignee.emails.map(function(obj){return obj.address;}),
                  "HTP Forum post '" + post.title + "' - new comment",
                  "<b>" + comment.author + "</b>" + " commented on your HTP Forum post: <b>" + post.title + "</b>"
                  + "<br/>" + "<a href="+(post.shortUrl ? post.shortUrl : post.url)+">"+(post.shortUrl ? post.shortUrl : post.url)+"</a>"
                  + "<br/><br/><b>Comment body:</b><br/><br/>" + comment.body + "<br/><br/>", function (error, outcome) {
                      if (error)
                          return Errors.throw(error.reason); //return alert(error.reason);
                      console.log("Email sent to post assignee. Return code: " + outcome);
                  }
              );
          });
      }

  } 
  
  //1:*/

  //1: insert notification for post owner if commenter is somebody else
  if (comment.userId !== post.userId) {
    Notifications.insert({
      userId: post.userId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false,
    });
  }

  //1: insert notification for post assignee if commenter is somebody else
  if (comment.userId !== post.assigneeId) {
    Notifications.insert({
      userId: post.assigneeId,
      postId: post._id,
      commentId: comment._id,
      commenterName: comment.author,
      read: false,
    });
  }

}

Meteor.methods({
    postAssignmentNotificationInsert: function(assigneeId, postId, assigner) {
        check([assigneeId, postId, assigner], [String]);
        Notifications.insert({
            userId: assigneeId,
            postId: postId,
            commentId: undefined,
            assigner: assigner,
            read: false,
        });
    }
});



