Questions = new Mongo.Collection('questions');

if(Meteor.isServer) {

    Meteor.publish('publicQuestions', function() {
        return Questions.find({is_private: {$in: [null, false]}});
    });

    Meteor.methods({
        question_add: function(question){
            if(!Meteor.user()){
                question.is_private = false;
            }
            var question_id = Questions.insert(question);
            return question_id;
        }
    });
}

if(Meteor.isClient){
    publicQuestions = Meteor.subscribe('publicQuestions');
}

