Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('notifications')];
  }
});

/*Router.route('/', {
  name: 'postsList',
});*/

//1: Summernote
Router.route('/summernote', {
  name: 'testSummernote',
});
//1: \Summernote

Router.route('/posts/:_id', {
  name: 'postPage',
  waitOn: function() {
    return [Meteor.subscribe('comments', this.params._id),
            Meteor.subscribe('singlePost', this.params._id)];
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  waitOn: function() {
    return Meteor.subscribe('singlePost', this.params._id);
  },
  data: function() { return Posts.findOne(this.params._id); }
});

Router.route('/submit', {name: 'postSubmit'});

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5,
  postsLimit: function() {
    //1: prevent unlogged users from getting any post.
    if (!! Meteor.user()) {
      return parseInt(this.params.postsLimit) || this.increment;
    }
    else {
      return -this.increment;
    }
    //1
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.postsLimit()};
  },
  
/*
So first, we’ll have to tell Iron Router not to waitOn the subscription after all. Instead, we’ll define our subscriptions in a subscriptions hook.
Note that we’re not returning this subscriptions in the hook. Returning it (which is how the subscriptions hook is usually employed) would trigger the global loading hook, and that’s
exactly what we want to avoid in the first place. Instead we’re simply using the subscriptions hook as a convenient place to define our subscription, similar to using an onBeforeAction hook.
*/
  //"subscriptions" is case sensitive, because is a built-in hook
  // see "https://github.com/.../commit/...12-5" for some comments.
  // this is a new hook. See: "https://github.com/EventedMind/iron-router/blob/devel/Guide.md#the-subscriptions-option"
  subscriptions: function() {
    this.postsSub = Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.posts().count() === this.postsLimit();
    //var nextPath = this.route.path({postsLimit: this.postsLimit() + this.increment});
    return {
      posts: this.posts(),
      ready: this.postsSub.ready,
      nextPath: hasMore ? this.nextPath() : null,
    };
  }
});

NewPostsController = PostsListController.extend({
  sort: {submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.newPosts.path({postsLimit: this.postsLimit() + this.increment});
  },
});

BestPostsController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.bestPosts.path({postsLimit: this.postsLimit() + this.increment});
  },
});

ClickedPostsController = PostsListController.extend({
  sort: {clicks: -1, submitted: -1, _id: -1},
  nextPath: function() {
    return Router.routes.clickedPosts.path({postsLimit: this.postsLimit() + this.increment})
  }
});

Router.route('/', {
  name: 'home',
  controller: BestPostsController,
});

Router.route('/new/:postsLimit?', {name: 'newPosts'});

Router.route('/best/:postsLimit?', {name: 'bestPosts'});

Router.route('/clicked/:postsLimit?', {name: 'clickedPosts'});

/*
Router.route('/:postsLimit?', {
  name: 'postsList',
});
*/


Router.route('/feed.xml', {
  where: 'server',
  name: 'rss',
  action: function() {
    var feed = new RSS({
      title: "New HTP Query System Posts",
      description: "The latest posts from HTP Query System Posts, the smallest news aggregator.",
    });

    Posts.find({}, {sort: {submitted: -1}, limit: 20}).forEach(function(post) {
      feed.item({
        title: post.title,
        description: post.body,
        author: post.author,
        date: post.submitted,
        url: '/posts/' + post._id
      })
    });

    
    
    this.response.write(feed.xml());
    this.response.end();
  }
});

Router.route('/api/posts', {
  where: 'server',
  name: 'apiPosts',
  action: function() {
    var parameters = this.request.query,
        limit = !!parameters.limit ? parseInt(parameters.limit) : 20,
        data = Posts.find({}, {limit: limit, fields: {title: 1, author: 1, url: 1, submitted: 1, }}).fetch();
    this.response.write(JSON.stringify(data));
    this.response.end();
  }
});


Router.route('/api/posts/:_id', {
  where: 'server',
  name: 'apiPost',
  action: function() {
    var post = Posts.findOne(this.params._id);
    if(post){
      this.response.write(JSON.stringify(post));
    } else {
      this.response.writeHead(404, {'Content-Type': 'text/html'});
      this.response.write("Post not found.");
    }
    this.response.end();
  }
});


var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}

if (Meteor.isClient) {
  Router.onBeforeAction('dataNotFound', {only: 'postPage'});
  Router.onBeforeAction(requireLogin, {only: 'postSubmit'});
}
