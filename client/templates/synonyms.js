
selectedWord = new ReactiveVar(null);
newQuestion = new ReactiveVar(null);

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
        var word = $input.val();
        $input.val('');
        newQuestion.set(null);
        word_get(word, function(wordObj){
            selectedWord.set(wordObj);
        });
    }
});

Template.synonymWord.helpers({
    existingQuestions: function(){
        var w = selectedWord.get();
        if(!w)return[];
        return Questions.find({word: w.word});
    },

    newQuestion: function(){
        return newQuestion.get();
    }

});

Template.synonymWord.events({
    "click #btnRefresh" : function(){
       var sw = selectedWord.get();
       selectedWord.set(null);
       selectedWord.set(sw);
    },

    "click #btnNewQuestion": function(){
        newQuestion.set({word: selectedWord.get().word});
    }
});

Template.question_create.helpers({
    randomWords: function(){
        var w = selectedWord.get();
        var q = newQuestion.get();
        var xwords = _.union([w.word, q.synonym], w.antonyms, w.synonyms, q.distractors);
        console.log(xwords);

        return Words.find({word: {$nin: xwords}},{limit:20});
    },

    validQuestion:function(){
        var q = newQuestion.get();
        return q.word && q.synonym && q.distractors && q.distractors.length > 0;
    },

    synonym: function(){
        var q = newQuestion.get();
        return q.synonym;
    },

    distractors: function(){
        var q = newQuestion.get();
        if(q.distractors && q.distractors.length > 0){
            return q.distractors;
        }
        return false;
    }
});

Template.question_create.events({
    'click #btnCancelQuestion': function(){
        newQuestion.set(null);
    },

    'click .synonym': function(){
        var word = this.toString();
        var q = newQuestion.get();
        q.synonym = word;
        newQuestion.set(q);
    },

    'click .synonym-selected': function(evt){
        var word = $(evt.target).text().trim();
        var q = newQuestion.get();
        q.synonym = null;
        newQuestion.set(q);
    },

    'click .distractor': function(evt, tmpl){
        var word = $(evt.target).text().trim();
        var q = newQuestion.get();
        if(!q.distractors){
            q.distractors = [];
        }
        var i = q.distractors.indexOf(word);
        if(i>=0){
            q.distractors.splice(i,1);
        } else {
            q.distractors.push(word);
        }
        newQuestion.set(q);
    },

    'click #btnSaveQuestion': function(){
        var q = newQuestion.get();
        Meteor.call('question_add', q, function(){
            newQuestion.set(null);
        });
    }
});