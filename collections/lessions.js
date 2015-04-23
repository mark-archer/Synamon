Lessons = new Mongo.Collection('lessons');

if(Meteor.isServer) {

    Meteor.publish('publicLessons', function() {
        return Lessons.find({is_private: {$in: [null, false]}});
    });

    Meteor.methods({
        lesson_add: function(lesson){
            if(!Meteor.user()){
                lesson.is_private = false;
            }
            var lesson_id = Lessons.insert(lesson);
            return lesson_id;
        }
    });
}

if(Meteor.isClient){
    publicLessons = Meteor.subscribe('publicLessons');
}

