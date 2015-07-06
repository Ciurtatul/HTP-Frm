


Template.postEdit.created = function() {
  Session.set('postEditErrors', {});
  var post = Posts.findOne();
  console.log("Created, This.assignee ID: " + post.assigneeId);
  Meteor.call('getProjectAssignees', post.category, function(error, result) { // or $( "#category option:selected" ).val()
    if (error)
      return Errors.throw(error.reason);
    Session.set('sessionProjectAssignees', result);
  });
}

Template.postEdit.helpers({
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  },
  isEqual: function(valueToCompare, fieldType) {
      var post = Posts.findOne();
      if( fieldType === "assigneeId" && valueToCompare.id === post.assigneeId ) { //1: Get the current post and read assigneeId, because current post is not visible inside {{#each}}.
        return true;
      }
      else if ( fieldType === "category" && valueToCompare === post.category ) {
        return true;
      }
      else {
        return false;
      }
  },
  projectAssignee: function() {
    var post = Posts.findOne();
    /*1: Doesn't return the value in time. Subscription takes time. I had to put it as a post attribute.
    Meteor.subscribe('singleUserEmail', post.assigneeId, function () {
      var projectAssignee = Meteor.users.findOne(post.assigneeId);
      console.log("projectAssignee Helper, project assignee username: " + projectAssignee.username);
      if (!!projectAssignee.profile.name){
        return {name: projectAssignee.profile.name, id: projectAssignee._id};
      }
      else {
        return {name: projectAssignee.username, id: projectAssignee._id};
      }
    });*/
    return {name: post.assigneeName, id: post.assigneeId};
  },
  projectAssignees: function() {
    if (!!Session.get('sessionProjectAssignees')){
      return Session.get('sessionProjectAssignees').map(function(projectAssignee) {
        if (!!projectAssignee.profile.name){
          return {name: projectAssignee.profile.name, id: projectAssignee._id};
        }
        else {
          return {name: projectAssignee.username, id: projectAssignee._id};
        }
      });
    }
    else {
      return [];
    }
  }
});


Template.postEdit.events({

  'change #category': function(e) {
    Meteor.call('getProjectAssignees', $(e.target).val(), function(error, result) { // or $( "#category option:selected" ).val()
      if (error)
        return Errors.throw(error.reason);
      Session.set('sessionProjectAssignees', result);
    });
  },

  'submit form': function(e) {
    e.preventDefault();
    
    var currentPostId = this._id;

    
    var postProperties = {
      userUrl: $(e.target).find('[name=userUrl]').val(),
      title: $(e.target).find('[name=title]').val(),
      category: $(e.target).find('[name=category]').val(),
      assigneeId: $(e.target).find('[name=assigneeId]').val(),
      assigneeName: $(e.target).find('[name=assigneeId]').find('option:selected').text(),
      sourceString: $(e.target).find('[name=sourceString]').val(),
      targetString: $(e.target).find('[name=targetString]').val(),
      //description: $(e.target).find('[name=description]').val(),
      description: $('#description').code(), /*//1:*/
      //content: function(content){$('[name=content]').html($('#summernote').code());}
    }
    
    var errors = validatePost(postProperties);
    if (errors.description || errors.title || errors.category || errors.assigneeId)
      return Session.set('postEditErrors', errors);
    
    Posts.update(currentPostId, {$set: postProperties}, function(error, result) {
      if (error) {
        // display the error to the user
        //alert(error.reason);
        Errors.throw(error.reason);
      } else {
        Router.go('postPage', {_id: currentPostId});



        //1: Send email and notification to post assignee
        if (!!Session.get('sessionProjectAssignees')) {

          var post = Posts.findOne(); //1: I have to do this here and not earlier because the post needs to update first and then its attributes fetched.

          //var insertedPost = Posts.findOne(result._id); // this returns 'undefined' for any post, existing or not, so I had to return shortUrl and fullUrl from "postInsert" method.

          /*
           var assigneeId = _.find(Session.get('sessionProjectAssignees'), function(projectAssignee){
           return (projectAssignee.profile.name == post.assignee) || (projectAssignee.username == post.assignee);
           })._id;
           //1: not necessary anymore as we are fetching assignee _id from selected option*/

          if (!!post.assigneeId) {

            Session.set('sessionProjectAssignees', undefined);

            var assigner = Meteor.user();

            //1: Send notification to post assignee
            Meteor.call('postAssignmentNotificationInsert', post.assigneeId, post._id,
                (!!assigner.profile.name ? assigner.profile.name : assigner.username),
                function(error, outcome){
                  if (error)
                    return Errors.throw(error.reason);
                  console.log("Notification added. Return code: " + outcome);
                }
            );
            //1:/

            Meteor.subscribe('singleUserEmail', post.assigneeId, function () {
              var assignee = Meteor.users.findOne(post.assigneeId); //1: You have to do this here and not earlier, because otherwise you'll not get ".emails" field for assignee.
              //console.log("Post shortURL: " + result.shortUrl);
              //console.log("Inserted post ID: " + result._id + ", title: " + post.title + ", assignee: " + post.assignee);
              Meteor.call('sendEmail',
                  assignee.emails.map(function(obj){return obj.address;}),
                  "HTP Forum post '" + post.title + "' has just been assigned to you",
                  "<b>" + (!!assigner.profile.name ? assigner.profile.name : assigner.username)  + "</b>" + " assigned a new HTP Forum post to you: <b>" + post.title + "</b>"
                  + "<br/>" + "<a href="+(post.shortUrl ? post.shortUrl : post.fullUrl)+">"+(post.shortUrl ? post.shortUrl : post.fullUrl)+"</a>"
                  + "<br/><br/><b>Post description:</b><br/><br/>" + post.description + "<br/><br/>",
                  function (error, outcome) {
                    if (error)
                      return Errors.throw(error.reason);
                    console.log("Email sent. Return code: " + outcome);
                  }
              );
            });
          }
        }
        //1/




      }
    });
  },
  
  'click .delete': function(e) {
    e.preventDefault();
    
    if (confirm("Delete this post?")) {
      var currentPostId = this._id;
      Posts.remove(currentPostId);
      Router.go('home');
    }
  }
});

//1: Summernote
Template.postEdit.rendered = function() {
  $('#description').summernote({
    height: 300,   //set editable area's height
  });
  //$('#description').code(sHTML);
};
//1: /Summernote