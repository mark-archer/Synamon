Synonyms = new Mongo.Collection('synonyms');

if(Meteor.isServer) {

    Meteor.publish('publicSynonyms', function() {
        return Synonyms.find({public: true});
    });

    Meteor.publish('privateSynonyms', function(){
        // TODO: fill this in
        return [];
    })
}

if(Meteor.isClient){
    publicSynonyms = Meteor.subscribe('publicSynonyms');
    privateSynonyms = Meteor.subscribe('privateSynonyms');
}