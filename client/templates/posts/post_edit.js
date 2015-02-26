Template.postEdit.created = function() {
  Session.set('postEditErrors', {});
}
Template.postEdit.helpers({
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
},
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
}
});


Template.postEdit.events({
  'submit form': function(e) {
    e.preventDefault();
    
    var currentPostId = this._id;
    
    var postProperties = {      
      title: $(e.target).find('[name=title]').val(),
      description: $(e.target).find('[name=description]').val(),
      url: $(e.target).find('[name=url]').val()
    }
    
    var errors = validatePost(postProperties);
    if (errors.title || errors.description)
      return Session.set('postEditErrors', errors);
    
    Posts.update(currentPostId, {$set: postProperties}, function(error) {
      if (error) {
        // display the error to the user
        //alert(error.reason);
        Errors.throw(error.reason);
      } else {
        Router.go('postPage', {_id: currentPostId});
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