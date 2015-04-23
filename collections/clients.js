Clients = new Mongo.Collection('clients');

if(Meteor.isServer) {

    Meteor.publish('userClients', function() {
        var user_id = this.userId;
        if(!user_id){
            return [];
        }
        return Clients.find({therapist: user_id});
    });

    Meteor.methods({
        client_add: function(client){
            var user_id = this.userId;
            if(!user_id){
                throw new Meteor.Error(400, 'You must be logged in to add clients');
            }
            client.therapist = user_id;
            var client_id = Clients.insert(client);
            return client_id;
        }
    });
}

if(Meteor.isClient){
    userClients = Meteor.subscribe('userClients');
}

