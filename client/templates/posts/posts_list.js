/*217: ... since we’re setting the data context at the route level, we can now safely get rid of the posts template helper inside the posts_list.js file. We named our data context posts (the same name as the helper), so we don’t even need to touch our postsList template!

Template.postsList.helpers({
  posts: function() {
    return Posts.find({}, {sort: {submitted: -1}});
  }
});*/

Template.postsList.helpers({
  postsWithRank: function() {
    return this.posts.map(function(post, index, cursor) {
      post._rank = index;
      return post;
    });
  }
});
