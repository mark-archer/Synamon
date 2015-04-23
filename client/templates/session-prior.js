

Template.priorSessionDetails.helpers({

    client: function(){
        var session = this;
        console.log(session);
        var client = Clients.findOne(session.client);
        if(!client)
            Router.go('/clients');
        currentClient.set(client);
        return client;
    },

    session: function(){
        return Sessions.findOne(this.params._id);
    }
});