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
        client = currentClient.get();
        if(!client)
            Router.go('/clients');
        return client;
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
        return Sessions.find(query, {sort: {createDT: -1}}).fetch();
    },

    askingQuestions:function(){
        var ses = currentSession();
        if(ses.startDT && !ses.endDT && !ses.pauseDT){
            return true;
        }
        return false;
    }

});

Template.sessions.events({
    'click #btnNewSession':function(){
        var client = currentClient.get();
        var session = {
            client: client._id,
            therapist: Meteor.userId(),
            createDT: new Date()
        };
        Meteor.call('session_add',session, function(err,session_id){
            if(err){
                handle_error(err);
            }
        });
    }
});

Template.sessionInProgress.helpers({
   askingQuestions:function(){
       var ses = currentSession();
       if(ses.startDT && !ses.endDT && !ses.pauseDT){
           return true;
       }
       return false;
   }
});

Template.sessionManage.helpers({
    formatDT: formatDT
});

Template.sessionManage.events({
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
    },

    'click #btnStartSession': function(){
        var ses = currentSession();
        if(ses.pauseDT){
            ses.pauseDT = null;
        } else {
            ses.startDT = new Date();
        }
        Meteor.call('session_update', ses);
    },

    'click #btnEndSession': function(){
        var ses = currentSession();
        ses.endDT = new Date();
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

currentQuestion = function(){
    var session = currentSession();
    return _.find(session.questions, function(q){
        return !q.answered_correctDT && !q.cancledDT;
    });
}

Template.sessionAskQuestions.helpers({
    currentQuestion: currentQuestion,

    word: function(){
        return currentQuestion().word;
    },

    answer_options: function(){
        var question = currentQuestion();
        var options = _.shuffle(question.distractors);

        options.push(question.synonym);
        options = _.shuffle(options);
        return options;
    }
});

answerInProgress = false;
Template.sessionAskQuestions.events({

    'click #btnPause': function(){
        var session = this;
        session.pauseDT = new Date();
        Meteor.call('session_update',session);
    },

    'click .answer': function(evt){
        if(answerInProgress) return;
        answerInProgress = true;
        // get data we need
        var session = currentSession();
        var question = currentQuestion();
        question = _.find(session.questions,function(q){
            return q._id == question._id;
        });
        var word = this.toString();
        var div = $(evt.target);

        // record answer given
        if(!question.answers)
            question.answers = [];
        question.answers.push(word);

        // decide if correct or incorrect
        var backgroundcolor_original = div.css('background-color');
        var backgroundcolor_answer = 'red';
        if(word == question.synonym) {
            backgroundcolor_answer = 'green';
            question.answered_correctDT = new Date();
        }

        // respond to answer
        div.animate({opacity: '0'}, "slow", null, function(){
            div.css('background-color', backgroundcolor_answer);
        });
        div.animate({opacity: '1'}, "slow", null, function(){
            $('.question-container').fadeOut('slow', function(){
                div.css('background-color', backgroundcolor_original);
                Meteor.call('session_update', session, function(){
                    $('.question-container').fadeIn('slow');
                    answerInProgress = false;
                });
            });
        });
    }

});

