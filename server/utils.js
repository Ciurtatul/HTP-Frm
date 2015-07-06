
projectsNames = function() {
    if(!Meteor.settings.projects)
        throw new Meteor.Error(500, 'Please provide "projects" array in Meteor.settings');
    return Meteor.settings.projects.map(function(element) {
        return element.name;
    });
};


projectAssignees = function (projectName) {
    if(!Meteor.settings.projects)
        throw new Meteor.Error(500, 'Please provide "projects" array in Meteor.settings');
    var projectAssigneesUsernames = _.find(Meteor.settings.projects, function(element){
        return element.name == projectName;
    }).assignees;
    return projectAssigneesUsernames.map(function(username) {
        return Meteor.users.findOne({username: username}, {fields: {'username': 1, 'profile.name': 1}});
    });
};

//1: So that it can be called on the client
// Meteor methods (http://stackoverflow.com/questions/17460123/meteor-methods-returns-undefined)
// Server method calls in Meteor are documented to be asynchronous.
// On the client, if you do not pass a callback and you are not inside a stub, call will return undefined, and you will have no way to get the return value of the method.
// Is this secure? Can anybody get email addresses associated with a project?
Meteor.methods({
    getProjectAssignees: function (projectName) {
        check(projectName, String);
        return projectAssignees(projectName);
    },
    getPostStatuses: function () {
        if(!Meteor.settings.postStatuses)
            throw new Meteor.Error(500, 'Please provide "postStatuses" array in Meteor.settings');
        return Meteor.settings.postStatuses;
    }
});
//1/