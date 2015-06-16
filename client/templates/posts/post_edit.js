Template.postEdit.created = function() {
  Session.set('postEditErrors', {});
}
Template.postEdit.helpers({
  errorMessage: function(field) {
    return Session.get('postEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
  },
  isEqual: function(string) {
      if( string === Posts.findOne().category ) { //1: Get the current post and read the category, because current post is not visible inside {{#each}}.
        return true;
      }
      return false;
  }
});


Template.postEdit.events({
  'submit form': function(e) {
    e.preventDefault();
    
    var currentPostId = this._id;
    
    var postProperties = {      
      userUrl: $(e.target).find('[name=userUrl]').val(),
      title: $(e.target).find('[name=title]').val(),
      category: $(e.target).find('[name=category]').val(),
      //description: $(e.target).find('[name=description]').val(),  
      description: $('#description').code(),
    }
    
    var errors = validatePost(postProperties);
    if (errors.title || errors.description || errors.category)
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

//1: Summernote
Template.postEdit.rendered = function() {
  $('#description').summernote({
    height: 300,   //set editable area's height
  });
  //$('#description').code(sHTML);
};
//1: /Summernote