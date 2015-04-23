Sessions = new Mongo.Collection('sessions');

if(Meteor.isServer) {

    Meteor.publish('userSessions', function() {
        return Sessions.find({therapist: this.userId});
    });

    Meteor.methods({
        session_add: function(session){
            var session_id = Sessions.insert(session);
            return session_id;
        },

        session_update: function(session){
            var ses_id = session._id;
            delete session._id;
            Sessions.update(ses_id,session);
        }
    });
}

if(Meteor.isClient){
    userSessions = Meteor.subscribe('userSessions');
}

