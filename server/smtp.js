Meteor.startup(function () {
});


validateUser = function (authorizedSender) {
  var errors = {};
  var currentUser = Meteor.user();

  if (currentUser.username != authorizedSender) {
    errors.description = "This user (" + currentUser.username + ") is not authorized to send emails";
  }
  return errors;
}


Meteor.methods({
  /*//1:*returnUserFields: function (userId) {
    check(userId, String);
    //var user = Meteor.users.findOne(userId);
    var user = Meteor.users.find();
    return user;
  },//1:*/
  sendEmail: function (from, to, subject, text) {
    check([from, to, subject, text], [String]);
    //check(to, [String]);
    
    if(!Meteor.settings.SMTPMailUrl)
      throw new Meteor.Error(500, 'Please provide a SMTP Mail URL in Meteor.settings');
    process.env.MAIL_URL = Meteor.settings.SMTPMailUrl; 
    
    if(!Meteor.settings.SMTPauthorizedSender)
      throw new Meteor.Error(500, 'Please provide SMTPauthorizedSender in Meteor.settings');
      
    var authorizedSender = Meteor.settings.SMTPauthorizedSender;



    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();
    
    var errors = validateUser(authorizedSender);
    if (errors.description)
      throw new Meteor.Error('not-authorized', errors.description);
    
    Email.send({
      from: from,
      to: to,      
      subject: subject,
      text: text,
    });
    
  }
});
