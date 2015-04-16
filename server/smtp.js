Meteor.startup(function () {
});


validateUser = function (user) {
  var errors = {};

  console.log("Email sender: " + user);

  if(!Meteor.settings.SMTPauthorizedSenders)
    throw new Meteor.Error(500, 'Please provide SMTPauthorizedSenders in Meteor.settings');
  var authorizedSenders = Meteor.settings.SMTPauthorizedSenders;

  if (authorizedSenders.every(function(item){
        return item != user;
      })) {
    errors.description = "This user (" + user + ") is not authorized to send emails";
  }
  return errors;
}


Meteor.methods({

  sendEmail: function (to, subject, html) {

    //check([from, to, subject, text], [String]);
    check([subject, html], [String]);
    check(to, [String]);


    if(!Meteor.settings.SMTPSenderAddress)
      throw new Meteor.Error(500, 'Please provide SMTPSenderAddress in Meteor.settings');
    var from = Meteor.settings.SMTPSenderAddress;

    if(!Meteor.settings.SMTPReceiverAll)
      throw new Meteor.Error(500, 'Please provide SMTPReceiverAll in Meteor.settings');
    var receiverAll = Meteor.settings.SMTPReceiverAll;
    
    if(!Meteor.settings.SMTPMailUrl)
      throw new Meteor.Error(500, 'Please provide a SMTP Mail URL in Meteor.settings');
    process.env.MAIL_URL = Meteor.settings.SMTPMailUrl; 
    



    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    var errors = validateUser(Meteor.user().username);
    if (errors.description)
      throw new Meteor.Error('not-authorized', errors.description);

    //to.push(receiverAll);
    //console.log("Recipients: " + to);
    
    Email.send({
      from: from,
      to: to,
      bcc: receiverAll,
      subject: subject,
      html: html,
    });
    
  }
});
