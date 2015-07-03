/*//1: natestrauser:x-editable-bootstrap - not rich text
//1: See also: https://github.com/mcrider/meteor-bootstrap-wysiwyg/blob/master/lib/README.md
Session.setDefault('textAreaContent', "Some text area content that is editable on click");
  
  Template.postSubmit.helpers({
    'textAreaContent': function () {
      return Session.get('textAreaContent');
    }
  });

  Template.postSubmit.rendered = function(){
    $('#textArea.editable').editable({
      placement: "auto top",
      success: function(response, newValue) {
        console.log('set new value to ' + newValue);
        Session.set('textAreaContent', newValue);
    }});
  };
//1:*/


Template.postSubmit.events({
  'change #category': function(e) {
    Meteor.call('getProjectAssignees', $(e.target).val(), function(error, result) { // or $( "#category option:selected" ).val()
      if (error)
        return Errors.throw(error.reason);
      Session.set('sessionProjectAssignees', result);
    });
  },
  'submit form': function(e) {
    e.preventDefault();
    
    var post = {
      userUrl: $(e.target).find('[name=userUrl]').val(),
      title: $(e.target).find('[name=title]').val(),
      category: $(e.target).find('[name=category]').val(),
      assigneeId: $(e.target).find('[name=assigneeId]').val(),
      sourceString: $(e.target).find('[name=sourceString]').val(),
      targetString: $(e.target).find('[name=targetString]').val(),
      //description: $(e.target).find('[name=description]').val(),
      description: $('#description').code(), /*//1:*/
      //content: function(content){$('[name=content]').html($('#summernote').code());}

    };
    
    var errors = validatePost(post);
    
    if (errors.description || errors.title || errors.category || errors.assigneeId)
      return Session.set('postSubmitErrors', errors);
    
    Meteor.call('postInsert', post, function(error, result) {
      // display the error to the user and abort
      if (error)
        //return alert(error.reason);
        return Errors.throw(error.reason);
      
      /*
      // show this result but route anyway
      if (result.postExists)
        //alert('This link has already been posted');
        Errors.throw('This link has already been posted');
      */

      Router.go('postPage', {_id: result._id});

      //1: Send email and notification to post assignee
      if (!!Session.get('sessionProjectAssignees')) {
        //var insertedPost = Posts.findOne(result._id); // this returns 'undefined' for any post, existing or not, so I had to return shortUrl and fullUrl from "postInsert" method.

        /*
        var assigneeId = _.find(Session.get('sessionProjectAssignees'), function(projectAssignee){
          return (projectAssignee.profile.name == post.assignee) || (projectAssignee.username == post.assignee);
        })._id;
        //1: not necessary anymore as we are fetching assignee _id from selected option*/

        if (!!post.assigneeId) {

          var assigner = Meteor.user();

          //1: Send notification to post assignee
          Meteor.call('postAssignmentNotificationInsert', post.assigneeId, result._id,
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
            Session.set('sessionProjectAssignees', undefined);
            Meteor.call('sendEmail',
                assignee.emails.map(function(obj){return obj.address;}),
                "HTP Forum post '" + post.title + "' has just been assigned to you",
                "<b>" + (!!assigner.profile.name ? assigner.profile.name : assigner.username)  + "</b>" + " assigned a new HTP Forum post to you: <b>" + post.title + "</b>"
                + "<br/>" + "<a href="+(result.shortUrl ? result.shortUrl : result.fullUrl)+">"+(result.shortUrl ? result.shortUrl : result.fullUrl)+"</a>"
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

    });
  }
});

Template.postSubmit.created = function() {
  Session.set('postSubmitErrors', {});
  //1: https://medium.com/@Dominus/meteor-tips-and-workarounds-b791151ce870
  // this.projectAssignees = new ReactiveVar([]); // I used Session variable after all,
  // because Template.instance().projectAssignees cannot be accessed within the method call,
  // since it's local to the template.
};

Template.postSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function(field) {
  return !!Session.get('postSubmitErrors')[field] ? 'has-error': '';
  },
  projectAssignees: function() {
    // return Template.instance().projectAssignees.get();
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


//1: Summernote
Template.postSubmit.rendered = function() {
  $('#description').summernote({
  //airMode: true,
    height: 300,   //set editable area's height
    /*onImageUpload: function(files, editor, welEditable) {
      console.log('image upload:', files, editor, welEditable);
    }*/
    /*toolbar: [
      //['style', ['style']], // no style button
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['fontsize', ['fontsize']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['height', ['height']],
      //['insert', ['picture', 'link']], // no insert buttons
      //['table', ['table']], // no table button
      //['help', ['help']] //no help button
    ]*/
});
};
//1: /Summernote