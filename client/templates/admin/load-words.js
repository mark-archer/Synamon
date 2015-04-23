Router.route('/admin/loadWords',function(){
    this.render("loadWords");
});

Template.loadWords.events({
   "click #go": function(){
       getWord('borrow', function(word){
           console.log(word);
       });
   }
});

