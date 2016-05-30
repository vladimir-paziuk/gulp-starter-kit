'use strict';

function NewModule () {};

NewModule.prototype.init = function(){
    console.log('JS is ready');
}

module.exports = new NewModule();