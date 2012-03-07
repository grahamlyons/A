var litmus = require('litmus'),
    Promise = require('../lib/a').Promise;

function delay(t, value) {
    var p = new Promise();

    setTimeout(function(){
        if(t%2 === 0) {
            p.resolve(value);
        } else {
            p.reject(value);
        }
    },t);
    
    return p;
}

function increment(start, finish, delta) {
    var p = new Promise(),
        i, current = start;

    for(i = start; i < finish; i += delta) {
        setTimeout(function(){
            current += delta;
            if(current === finish) {
                p.resolve(current);
            } else if(current > finish) {
                p.reject(current);
            } else {
                p.progress(current);
            }
        }, i);
    }

    return p;
}

exports.test = new litmus.Test('Test promise handling', function() {

    this.plan(12);

    var test = this,
        successDesc = 'Promise resolved',
        failureDesc = 'Promise failed',
        successWithValueDesc = 'Promise resolved with value',
        failureWithValueDesc = 'Promise failed with value',
        progressDesc = 'Promise called progress handle',
        multiProgressDesc = 'Got expected number of progress reports',
        p;

        this.async('promise success', function(handle) {
            delay(100).then(
                function() {
                    test.pass(successDesc);
                    handle.resolve();
                },
                function() {
                    test.fail(successDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise fail', function(handle) {
            delay(101).then(
                function() {
                    test.fail(failureDesc);
                    handle.resolve();
                },
                function() {
                    test.pass(failureDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise success with value', function(handle) {
            var expected = 200;
            delay(100, expected).then(
                function(returnVal) {
                    test.is(returnVal, expected, successWithValueDesc);
                    handle.resolve();
                },
                function() {
                    test.fail(successWithValueDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise failure with value', function(handle) {
            var expected = 500;
            delay(101, expected).then(
                function() {
                    test.fail(failureWithValueDesc);
                    handle.resolve();
                },
                function(returnVal) {
                    test.is(returnVal, expected, failureWithValueDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise progress callback', function(handle) {
            var start = 0,
                finish = 100,
                expectedProgress = 50;
            
            increment(start, finish, 50).then(
                function() { },
                function() { },
                function(progressValue) {
                    test.is(progressValue, expectedProgress, progressDesc);
                    handle.resolve();
                }
            );
        });

        this.async('promise with multi progress callback', function(handle) {
            var start = 0,
                finish = 100,
                delta = 10,
                progressCount = 0;
            
            increment(start, finish, delta).then(
                function() {
                    test.is(progressCount, ((finish/delta)-1), multiProgressDesc);
                    handle.resolve();
                },
                function() { },
                function(progressValue) {
                    progressCount++;
                }
            );

        });

        p = new Promise();
        p.resolve();
        this.throwsOk(function() {
            p.resolve();
        }, /error/i, 'Promise can\'t be resolved more than once');
        this.throwsOk(function() {
            p.reject();
        }, /error/i, 'Can\'t reject promise once it\'s been resolved');

        this.async('promises can be chained', function(handle) {
            var input = 10,
                expected = input*2;

            delay(100, input)
            .then(function(result){
                return result*2;
            })
            .then(function(output){
                test.is(output, expected, 'Get the result of chained promise');
                handle.resolve();
            });
        });

        this.async('promises resolved immediately can be chained', function(handle) {
            var p = new Promise(),
                test = this;

            p.resolve(42);

            newPromise = p.then(function(meaningOfLife) {
                return meaningOfLife * 2;
            })
            newPromise.then(function(twiceThat) {
                test.is(twiceThat, 84, 'Got data from chaining "then" after promise was resolved');
                handle.resolve();
            });

        });

        this.async('promise is resolved immediately', function(handle) {
            var p = new Promise(),
                test = this;

            p.resolve(42);

            p.then(function(meaningOfLife) {
                test.is(meaningOfLife, 42, 'Got data from calling "then" after promise was resolved');
                handle.resolve();
            });

        });

        this.async('promise is rejected immediately', function(handle) {
            var p = new Promise(),
                test = this;

            p.reject(41);

            p.then(
                function(){},
                function(notMeaningOfLife) {
                    test.is(notMeaningOfLife, 41, 'Got data from calling "then" after promise was rejected');
                    handle.resolve();
            });

        });
});
