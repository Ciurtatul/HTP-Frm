// Fixture data 



  
//1: Improve
  var setFixtureUrlShortUrl = function(postId) {
    var shortURL = Bitly.shortenURL('https://htpforum.htpassport.com/posts/'+postId);
    Posts.update(postId, {$set: {url: '/posts/'+postId, shortUrl: shortURL}}, function(error) {
        if (error)
          throw new Meteor.Error(500, error.reason);
    });
    /*
    // shorten link URL
    if(Meteor.isServer){
      var shortUrl = Bitly.shortenURL(post.url);
      if(post.url && shortUrl)
        post.shortUrl = shortUrl;
    }
    */
  }
//1: /Improve

//1: Initialize real users
if (! Meteor.users.findOne({"username" : "superUser"})) {
  console.log("Initializing accounts ...");
  if(!Meteor.settings.users || !Meteor.settings.projects)
    throw new Meteor.Error(500, 'Please provide "users" and/or "projects" array in Meteor.settings');
  Meteor.settings.users.forEach(function (user) {
    var userId = Meteor.users.insert({
      username: user.username,
      emails: user.emails,
      projects: (user.username === 'superUser') ? projectsNames : user.projects, //1: superUser should see all posts from all projects
      profile: user.profile
    });
    Accounts.setPassword(userId, user.password);
  });
}
//1:/
  

//1: Initialize some posts
if (Posts.find().count() === 0) {
  var now = new Date().getTime();
  
  // create two users
  var johnDoeId = Meteor.users.insert({
    profile: { name: 'John Doe' }
  });
  var johnDoe = Meteor.users.findOne(johnDoeId);
  var janeDoeId = Meteor.users.insert({
    profile: { name: 'Jane Doe' }
  });
  var janeDoe = Meteor.users.findOne(janeDoeId);
  
  var intrHTPForumId = Posts.insert({
    title: 'Introducing HTP Forum',
    category: 'miscellaneous',
    description: 'What is this?',
    userId: janeDoe._id,
    author: janeDoe.profile.name,
    //userUrl: '',
    submitted: new Date(now - 7 * 3600 * 1000),
    commentsCount: 2,
    upvoters: [],
    votes: 0,
  });
  
  setFixtureUrlShortUrl(intrHTPForumId);
  
  Comments.insert({
    postId: intrHTPForumId,
    userId: johnDoe._id,
    author: johnDoe.profile.name,
    submitted: new Date(now - 6 * 3600 * 1000),
    body: 'It\'s a discussion area. Members can post discussions and read and respond to posts by other forum members. It can be focused on nearly any subject.'
  });

  
  var varianVariseedId = Posts.insert({
    title: 'Varian - Variseed',    
    category: 'Varian',
    description: 'How does one activate Variseed application?',
    userId: janeDoe._id,
    author: janeDoe.profile.name,
    //userUrl: '',
    submitted: new Date(now - 10 * 3600 * 1000),
    commentsCount: 0,
    upvoters: [],
    votes: 0,
  });
  
  setFixtureUrlShortUrl(varianVariseedId);

  Comments.insert({
    postId: varianVariseedId,
    userId: johnDoe._id,
    author: johnDoe.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'You need a licensed Site Key Generator that can license any number of installed applications, provided that you have their unique site codes.'
  }); 

  
  
  Comments.insert({
    postId: varianVariseedId,
    userId: johnDoe._id,
    author: johnDoe.profile.name,
    submitted: new Date(now - 5 * 3600 * 1000),
    body: 'Interesting project, Jane Doe, can I get involved?'
  }); 
  
  Comments.insert({
    postId: varianVariseedId,
    userId: janeDoe._id,
    author: janeDoe.profile.name,
    submitted: new Date(now - 3 * 3600 * 1000),
    body: 'Sure, you can, John Doe!'
  });

  
  
  var jmpUiStringsId = Posts.insert({
    title: 'JMP - UI Strings',
    category: 'JMP',
    description: 'How can I insert comments in Transit NXT?',
    userId: johnDoe._id,
    author: johnDoe.profile.name,
    //userUrl: '',
    submitted: new Date(now - 12 * 3600 * 1000),
    commentsCount: 0,
    upvoters: [],
    votes: 0,
  });
  
  setFixtureUrlShortUrl(jmpUiStringsId);
  
  var aNossaCopaId = Posts.insert({
    title: 'ESSA É A NOSSA COPA!',
    category: 'miscellaneous',
    description: '<p>Angela Merkel\'s reaction after Germany\'s ecstatic win.<br></p><p><br></p><img  src="/images/ESSA.E.A.NOSSA.COPA.jpg" data-filename="ESSA.E.A.NOSSA.COPA.jpg"><p><br></p>',
    userId: johnDoe._id,
    author: johnDoe.profile.name,
    //userUrl: '',
    submitted: new Date(now - 13 * 3600 * 1000),
    commentsCount: 0,
    upvoters: [],
    votes: 0,
  });
  
  setFixtureUrlShortUrl(aNossaCopaId);
  
  for (var i = 0; i < 4; i++) {
    //var shortURL = Bitly.shortenURL('http://google.com/?q=test-' + i);
    var postId = Posts.insert({      
      title: 'Test post #' + i,
      category: 'miscellaneous',
      description: 'Test question #' + i,
      author: johnDoe.profile.name,
      userId: johnDoe._id,
      userUrl: 'http://google.com/?q=test-' + i,
      submitted: new Date(now - i * 3600 * 1000 + 1),
      commentsCount: 0,
      upvoters: [],
      votes: 0,
    });
    setFixtureUrlShortUrl(postId);
  }
}
//1:/
