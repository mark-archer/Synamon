
selectedWord = new ReactiveVar(null);

Template.synonyms.helpers({
    selectedWord: function(){
        return selectedWord.get();
    },

    existingQuestions: function(){
        return [1,2];
    }

});

Template.synonyms.events({
    'submit .js-todo-new': function(evt) {
        evt.preventDefault();
        var $input = $(event.target).find('[type=text]');
        if (! $input.val())
            return;
        word = $input.val();
        $input.val('');
        word_get(word, function(wordObj){
            selectedWord.set(wordObj);
        });
    }
});

Template.synonymWord.helpers({
    randomWords: function(){
        return Words.find({},{limit:4});
    }

});

Template.synonymWord.events({
   "click #btnRefresh" : function(){
       var sw = selectedWord.get();
       selectedWord.set(null);
       selectedWord.set(sw);
   }
});