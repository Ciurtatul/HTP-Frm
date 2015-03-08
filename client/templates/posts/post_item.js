var POST_HEIGHT = 100;
var Positions = new Meteor.Collection(null);

Template.postItem.helpers({
  ownPost: function() {
    return this.userId == Meteor.userId();
  },
  domain: function() {
    var a = document.createElement('a');
    a.href = this.url;
    return a.hostname;
  },
  upvotedClass: function() {
    var userId = Meteor.userId();
    if(userId && ! _.include(this.upvoters, userId)) {
      return 'btn-primary upvotable';
    }
    else {
      return 'disabled';
    }
  },
  postUrl: function(){
    return this.shortUrl ? this.shortUrl : this.url;
  },
  
  /*
  commentsCount: function() {
    //Meteor.subscribe('comments', this._id); // Mine - to display comments count on "/" page
    return Comments.find({postId: this._id}).count();
  },*/
  
  //Corneliu: The idea here is that having "top: 0px" is just letting the "best posts" ordering take over, because all posts eventually, at the end of each animation will have "top: 0px", but right before the animation begings, because the offset/delta is not 0, you'll see that each affected post jumps instantly to the position defined by a non-zero offset/delta. It's not perceivable unless you change the delay parameter of Meteor.setTimeout to something like 3000ms. Increase "POST_HEIGHT" to a bigger value so you can see a bigger jump.
  
  attributes: function() {
    var post = _.extend({}, Positions.findOne({postId: this._id}), this);
    var newPosition = post._rank * POST_HEIGHT;
    var attributes = {};
    
    if (_.isUndefined(post.position)) {
      attributes.class = 'post invisible';
    } else {
      var delta = post.position - newPosition;      
      attributes.style = "top: " + delta + "px";
      if (delta === 0)
        attributes.class = "post animate";
    }
    
    Meteor.setTimeout(function() {
      Positions.upsert({postId: post._id}, {$set: {position: newPosition}})
    }, 100);
    
    return attributes;
  }  
});

Template.postItem.events({
  'click .upvotable': function(e) {
    e.preventDefault();
    Meteor.call('upvote', this._id);
  },
});

