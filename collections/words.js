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
        lookupWord: function(word){
            this.unblock();
            var url = "http://www.thesaurus.com/browse/" + word;
            return Meteor.http.get(url);
        }

    });
}

if(Meteor.isClient){
    publicWords= Meteor.subscribe('publicWords');

    getWord = function(word, callback){

        // todo: check if word is already in the database
        var wordDB = Words.findOne({word: word});
        if(wordDB){
            callback(wordDB);
            return;
        }

        // use the server to lookup the word from the interweb
        Meteor.call('lookupWord', word, function(err, res){
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

            callback(word);
        });
    }
}

