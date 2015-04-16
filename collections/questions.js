Questions = new Mongo.Collection('questions');

if(Meteor.isServer) {

    Meteor.publish('publicQuestions', function() {
        return Questions.find({is_public: true});
    });

    Meteor.methods({
        question_add: function(question){
            var question_id = Questions.insert(question);
            return question_id;
        }
    });
}

if(Meteor.isClient){
    publicQuestions = Meteor.subscribe('publicQuestions');
}

