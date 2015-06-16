/**
 * Created by ciurtatul on 6/14/15.
 */

//1: Defines a helper function which can be used from all templates.
Template.registerHelper('loggedInUserProjects', function() {
    var userLoggedIn = Meteor.user();
    //console.log("\"loggedInUserProjects\" helper: Is any user logged-in? " + userLoggedIn);
    if (!! userLoggedIn) {
        //1: http://docs.meteor.com/#/full/meteor_user
        // Like all Mongo.Collections, you can access all documents on the server, but only those specifically published by the server are available on the client.
        // By default, the current user's username, emails and profile are published to the client. You can publish additional fields for the current user with <see server/publications.js>.
        Meteor.subscribe("userData");
        //console.log("\"loggedInUserProjects\" helper: User logged-in username: " + userLoggedIn.username);
        //1: For those users who don't have any assigned projects, allow them to submit or edit "miscellaneous" posts, but only after login.
        if ((!! userLoggedIn.projects) && (userLoggedIn.projects.length > 0)) {
            //console.log("\"loggedInUserProjects\" helper: User logged-in projects: " + userLoggedIn.projects);
            return userLoggedIn.projects;
        }
        else {
            return ["miscellaneous"];
        }
    }
    else {
        return [];
    }
});

/*1: Update: It's been moved to "client/posts/post_edit.js" template handlers, and it's working now.
To be used in an #if #unless spacebars statement in "client/posts/post_edit.html" in order to prevent displaying selected option in "Projects: " more than once.
// So far it doesn't see the current post or template, because this refers to the current item of the innermost loop (i.e. project).
Template.registerHelper('isEqual', function(string) {
    console.log("Target to isEqual: " + this.category);
    //if( string.match( new RegExp(target, 'g') ) ) {
    if( string === this.category ) {
        return true;
    }
    return false;
});
//1:*/