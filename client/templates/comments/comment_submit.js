Template.commentSubmit.created = function() {
  Session.set('commentSubmitErrors', {});
}

Template.commentSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('commentSubmitErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('commentSubmitErrors')[field] ? 'has-error' : '';
  }
});

Template.commentSubmit.events({
  'submit form': function(e, template) {
    e.preventDefault();
    
    var $body = $(e.target).find('[name=body]');
    var comment = {
      //body: $body.val(),
      body: $('#body').code(),
      postId: template.data._id
    };
    
    var errors = {};
    if (! comment.body) {
      errors.body = "Please write some content";
      return Session.set('commentSubmitErrors', errors);
    }
    
    Meteor.call('commentInsert', comment, function(error, commentId) {
      if (error){
        throwError(error.reason);
      } else {
        $body.val('');
      }
    });
  }
});

//1: Summernote
Template.commentSubmit.rendered = function() {
  $('#body').summernote({
  //airMode: true,
    height: 300,   //set editable area's height
});
};
//1: /Summernote