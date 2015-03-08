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
  'submit form': function(e) {
    e.preventDefault();
    
    var post = {
      userUrl: $(e.target).find('[name=userUrl]').val(),
      title: $(e.target).find('[name=title]').val(),
      category: $(e.target).find('[name=category]').val(),
      //description: $(e.target).find('[name=description]').val(),
      description: $('#description').code(), /*//1:*/
      //content: function(content){$('[name=content]').html($('#summernote').code());}

    };
    
    var errors = validatePost(post);
    
    if (errors.description || errors.title || errors.category)
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
    });
  }
});

Template.postSubmit.created = function() {
  Session.set('postSubmitErrors', {});
};

Template.postSubmit.helpers({
  errorMessage: function(field) {
    return Session.get('postSubmitErrors')[field];
  },
  errorClass: function(field) {
  return !!Session.get('postSubmitErrors')[field] ? 'has-error': '';
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