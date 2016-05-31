'use strict';

class NewModule {};

NewModule.init = function(){
    console.log('JS is ready');
}

module.exports = NewModule;