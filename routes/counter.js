var Counter = module.exports = {
    count: 1,
    add: function() {
        if(Counter.count<1024){Counter.count += 10;}
        else{Counter.count = 0;}
    }
}