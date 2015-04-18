formatDT = function(dt){
    return moment(dt).calendar();
};

currentSession = function(){
    var client = currentClient.get();
    var query = {
        endDT: {$in: [null, false]}
    };
    if (client) {
        query.client = client._id;
    }
    var cSession = Sessions.findOne(query);
    if(!client && cSession)
        currentClient.set(Clients.findOne(cSession.client));
    return cSession;
}

Template.sessions.helpers({

    currentClient: function(){
        var client = currentClient.get();
        if(!client)
            currentSession();
        return currentClient.get();
    },

    currentSession: function(){
        return currentSession();
    },

    priorSessions: function() {
        var client = currentClient.get();
        var query = {};
        if (client) {
            query.client = client._id;
        }
        return Sessions.find(query, {sort: {startDT: 1, createDT: 1}}).fetch();
    }

});

Template.sessions.events({
    'click #btnStartSession':function(){
        var client = currentClient.get();
        var session = {
            client: client._id,
            theapist: Meteor.userId(),
            createDT: new Date()
        };
        Meteor.call('session_add',session, function(err,session_id){
            if(err){
                handle_error(err);
                return;
            }
            //todo: go to lesson
        });
    }
});

Template.sessionInProgress.helpers({
    formatDT: formatDT
});

Template.sessionInProgress.events({
    'click #btnAddQuestion': function(){
        var ses = currentSession();
        if(!ses.questions){
            ses.questions = [];
        }
        ses.questions.push({
            _id: (new Mongo.ObjectID())._str,
            word:'',
            synonym:'',
            distractors:[]
        });
        Meteor.call('session_update', ses);
    }
});

Template.priorSession.helpers({
    formatDT: formatDT
});


Template.sessionQuestion.helpers({

});

Template.sessionQuestion.events({
    'change #inpWord': function(evt){
        var word = $(evt.target).val();
        var q_id = this._id;
        var ses = currentSession();
        var question = _.find(ses.questions,function(q){
            return q._id == q_id;
        });
        question.word = word;
        Meteor.call('session_update', ses);
    },

    'change #inpSynonym': function(evt){
        var synonym = $(evt.target).val();
        var q_id = this._id;
        var ses = currentSession();
        var question = _.find(ses.questions,function(q){
            return q._id == q_id;
        });
        question.synonym = synonym;
        Meteor.call('session_update', ses);
    },

    'keydown #inpAddDistractor': function(evt){
        // only add on enter
        if(evt.keyCode != 13)
            return;
        var $input = $(evt.target);
        var distractor = $input.val();
        $input.val('');
        var q_id = this._id;
        var ses = currentSession();
        var question = _.find(ses.questions,function(q){
            return q._id == q_id;
        });
        question.distractors.push(distractor);
        //question.distractors = _.unique(question.distractors);

        Meteor.call('session_update', ses);
    },

    'click #btnDeleteDistractor': function(evt, tmpl){
        var q_id = tmpl.data._id;
        var distractor = this.toString();
        var ses = currentSession();
        var question = _.find(ses.questions,function(q){
            return q._id == q_id;
        });
        question.distractors = _.filter(question.distractors,function(d){
            return d != distractor;
        });
        Meteor.call('session_update', ses);
    },

    'click #btnDelete': function(){
        var question = this;
        var ses = currentSession();
        ses.questions = _.filter(ses.questions, function(q){
            return question._id != q._id;
        });
        Meteor.call('session_update', ses);
    }
});