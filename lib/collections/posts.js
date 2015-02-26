Posts = new Mongo.Collection('posts');

validatePost = function (post) {
  var errors = {};
  if (!post.title)
    errors.title = "Please, fill in a headline";
  if (!post.description)
    errors.description = "Please, fill in a message/question";
  return errors;
}

Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following three fields:
    return (_.without(fieldNames, 'url', 'title', 'description').length > 0);
  },
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.description;
  },
});

Meteor.methods({
  upvote: function(postId) {
    check(this.userId, String);
    check(postId, String);
    
    /*
    var post = Posts.findOne(postId);
    if (!post)
      throw new Meteor.Error('invalid', 'Post not found');
    
    if (_.include(post.upvoters, this.userId))
      throw new Meteor.Error('invalid', 'Already upvoted this post');
    
    Posts.update(post._id, {
      $addToSet: {upvoters: this.userId},
      $inc: {votes: 1}
    });*/
    
    
    //$ne selects the documents where the value of the field is not equal (i.e. !=) to the specified value. This includes documents that do not contain the field.
    var affected = Posts.update(
      {
        _id: postId,
        upvoters: {$ne: this.userId},
      },
      {
        $addToSet: {upvoters: this.userId},
        $inc: {votes: 1},
      }
    );
    
    if (!affected) {
      throw new Meteor.Error('invalid', 'You weren\'t able to upvote that post');
    }
  },
  
  
  postInsert: function(postAttributes) {
    check(this.userId, String);
    check(postAttributes, {
      title: String,
      description: String,
      url: String
    });
    
    var errors = validatePost(postAttributes);
    if (errors.title || errors.description)
      throw new Meteor.Error('invalid-post', "You must set a title and a message/question for your post");
    
    /*
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }
    */
    
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id, 
      author: user.username, 
      submitted: new Date(),
      commentsCount: 0,
      upvoters: [],
      votes: 0,
    });
    
    // shorten link URL
    if(Meteor.isServer && post.url){
      var shortUrl = Bitly.shortenURL(post.url);
      if(shortUrl)
        post.shortUrl = shortUrl;
    }
    
    var postId = Posts.insert(post);
    
    return {
      _id: postId
    };
  }
});
