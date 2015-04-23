var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

var errors = new ReactiveVar([]);

var menu_commands = new ReactiveVar([]);

handle_error = function(err, callback){
    console.error(err);
    // add the error to the reactive var
    var errs = errors.get();
    errs.splice(0,0,err);
    errors.set(errs);
    // then remove it after a little bit of time
    setTimeout(function(){
        var errs = errors.get();
        errs = _.filter(errs,function(e){
           return e != err;
        });
        errors.set(errs);
    },4000);
    // if a callback was given execute it
    if(callback)
        callback();
}

Meteor.startup(function () {
    // set up a swipe left / right handler
    $(document.body).touchwipe({
        wipeLeft: function () {
            Session.set(MENU_KEY, false);
        },
        wipeRight: function () {
            Session.set(MENU_KEY, true);
        },
        preventDefaultEvents: false
    });

    // Only show the connection error box if it has been 5 seconds since
    // the app started
    setTimeout(function () {
        // Launch screen handle created in lib/router.js
        dataReadyHold.release();

        // Show the connection error box
        Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
    }, CONNECTION_ISSUE_TIMEOUT);
});

Template.appBody.onRendered(function () {
    this.find('#content-container')._uihooks = {
        insertElement: function (node, next) {
            $(node)
                .hide()
                .insertBefore(next)
                .fadeIn(function () {
                    //listFadeInHold.release();
                });
        },
        removeElement: function (node) {
            $(node).fadeOut(function () {
                $(this).remove();
            });
        }
    };
});

Template.appBody.helpers({
    // We use #each on an array of one item so that the "list" template is
    // removed and a new copy is added when changing lists, which is
    // important for animation purposes. #each looks at the _id property of it's
    // items to know when to insert a new item and when to update an old one.
    thisArray: function () {
        return [this];
    },
    menuOpen: function () {
        return Session.get(MENU_KEY) && 'menu-open';
    },
    cordova: function () {
        return Meteor.isCordova && 'cordova';
    },
    emailLocalPart: function () {
        if(!Meteor.user()){
            return "";
        }
        var email = Meteor.user().emails[0].address;
        return email.substring(0, email.indexOf('@'));
    },
    userMenuOpen: function () {
        return Session.get(USER_MENU_KEY);
    },
    lists: function () {
        return [];
        //return Lists.find();
    },
    activeListClass: function () {
        var current = Router.current();
        if (current.route.name === 'listsShow' && current.params._id === this._id) {
            return 'active';
        }
    },
    connected: function () {
        if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
            return Meteor.status().connected;
        } else {
            return true;
        }
    },
    errorsExist: function(){
        return errors.get().length > 0;
    },
    errors: function(){
        return errors.get();
    },
    commands: function(){
        if(!Meteor.user()){
            return [
                {
                    text:"Join",
                    title: "Create an account",
                    href: "/join"
                },
                {
                    text:"Sign In",
                    title: "Sign in with an existing account",
                    href: "/signin"
                }
            ]
        }

        var cmds = [];

        if(cmds.length)
            cmds.push({is_divider: true});

        cmds.push({
            text: "Sign Out",
            cmd: function(){
                Meteor.logout();
                Router.go('/signin');
            }
        });

        return cmds;
    }

});

Template.appBody.events({
    'click .js-menu': function () {
        Session.set(MENU_KEY, !Session.get(MENU_KEY));
    },

    'click .content-overlay': function (event) {
        Session.set(MENU_KEY, false);
        event.preventDefault();
    },

    'click .js-user-menu': function (event) {
        Session.set(USER_MENU_KEY, !Session.get(USER_MENU_KEY));
        // stop the menu from closing
        event.stopImmediatePropagation();
    },

    'click #menu a': function () {
        Session.set(MENU_KEY, false);
    },

    'click .js-logout': function () {
        Meteor.logout();

        // if we are on a private list, we'll need to go to a public one
        var current = Router.current();
        if (current.route.name === 'listsShow' && current.data().userId) {
            Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
        }
    },

    'click .js-new-list': function () {
        var list = {name: Lists.defaultName(), incompleteCount: 0};
        list._id = Lists.insert(list);

        Router.go('listsShow', list);
    }
});

//Template

Template.command.events({
    'click a':function(){
        var cmd = this;
        if(cmd.cmd){
            cmd.cmd();
        }
    }
})
