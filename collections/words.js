Words = new Mongo.Collection('words');

Word = function(){
    var w = {
              
    }
    return w;
};

if(Meteor.isServer) {

    Meteor.publish('publicWords', function() {
        return Words.find();
    });

    Meteor.methods({
        word_lookup: function(word){
            this.unblock();
            var url = "http://www.thesaurus.com/browse/" + word;
            return Meteor.http.get(url);
        },

        word_add: function(word){
            if(Words.findOne({word: word.word})){
                var errMsg = "'" + word.word + "' already exists in database";
                throw new Meteor.Error(400,errMsg);
            }
            var word_id = Words.insert(word);
            return word_id;
        }
    });
}

if(Meteor.isClient){
    publicWords= Meteor.subscribe('publicWords');

    word_get = function(word, callback){

        // check if word is already in the database
        var wordDB = Words.findOne({word: word});
        if(wordDB){
            callback(wordDB);
            return;
        }

        // use the server to lookup the word from the interweb
        Meteor.call('word_lookup', word, function(err, res){
            if(err){
                var err = new Meteor.Error(500,"We couldn't lookup that word, are you sure it's spelled correctly?",err);
                handle_error(err);
                callback(null);
                return;
            }
            var doc = $(res.content);
            var wordProper = doc.find('h1').text();
            var word = {
                word: wordProper,
                synonyms: [],
                antonyms: []
            }

            var synonyms = doc.find('.relevancy-list:first .text');
            synonyms.each(function(s){
                var w = $(synonyms[s]).text();
                word.synonyms.push(w);
            });

            var antonyms = doc.find('.container-info.antonyms:first .text');
            antonyms.each(function(s){
                var w = $(antonyms[s]).text();
                word.antonyms.push(w);
            });

            Meteor.call('word_add', word, function(err, word_id){
                if(err){
                    handle_error(err);
                    callback(null);
                    return;
                }
                var word = Words.findOne(word_id);
                callback(word);
            });
        });
    }
}

