//1: "userData" is used in "loggedInUserProjects" client's general template helper
Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
        {fields: {'projects': 1}});
  } else {
    this.ready();
  }
});

Meteor.publish('posts', function(options) {
  check(options, {
    sort: Object,
    limit: Number,
  });
  //return Posts.find({}, options); //1: before enabling private posts
  //1: enabling private posts
  var userLoggedIn = Meteor.users.findOne({_id: this.userId});
  //console.log("Is any user logged-in? " + userLoggedIn);
  if (!! userLoggedIn) {
    //1: For those users who don't have any assigned projects, allow them to see "miscellaneous" posts, but only after login.
    if ((!! userLoggedIn.projects) && (userLoggedIn.projects.length > 0)) {
      //console.log("User logged-in projects: " + userLoggedIn.projects);
      return Posts.find({category: {$in: userLoggedIn.projects}}, options);
    }
    else {
      return Posts.find({category: "miscellaneous"}, options);
    }
  }
  else {
    //1: Declare that no data is being published. If you leave this line out, Meteor will never consider the subscription ready because
    //it thinks you're using the added/changed/removed interface where you have to explicitly call this.ready().
    return [];
  }
  //1:/
});

//Meteor.publish('posts');

Meteor.publish('singlePost', function(id) {
  check(id, String);
  return Posts.find(id);
});

Meteor.publish('comments', function(postId) {
  check(postId, String);
  return Comments.find({postId: postId});
});


Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId, read: false});
});

//1:
Meteor.publish('singleUserEmail', function(id) {
  check(id, String);
  return Meteor.users.find({_id: id}, {
    fields : {
      'emails': 1,
      'username': 1,
      'profile': 1,
    }
  });
}); 

//1:*/