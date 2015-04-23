currentClient = new ReactiveVar(null);

Template.clients.helpers({

    clients: function(){
        return Clients.find({},{sort:{name: 1}});
    },

    zero_clients: function(){
        return Clients.findOne() == null;
    }

});

Template.clients.events({
    'submit .input-symbol': function(evt){
        evt.preventDefault();
        var $input = $(event.target).find('[type=text]');
        var client_name = $input.val();
        if (! client_name)
            return;
        $input.val('');

        var client = {
            name: client_name,
            therapist: Meteor.userId()
        };

        Meteor.call('client_add', client, function(err){
            if(err) handle_error(err);
        });
    },

    'click #btnStartSession':function(){
        var client = this;
        currentClient.set(client);
        Router.go('/sessions');
    }
});
