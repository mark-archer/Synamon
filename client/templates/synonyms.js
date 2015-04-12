
selectedWord = new ReactiveVar(null);

Template.synonyms.helpers({
    selectedWord: function(){
        return selectedWord.get();
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
        getWord(word, function(wordObj){
            console.log(wordObj);
            selectedWord.set(wordObj);
        });
    }
});