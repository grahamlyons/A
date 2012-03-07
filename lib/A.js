/**
 * Simple implementation of Promise spec A:
 *  http://wiki.commonjs.org/wiki/Promises/A
 */

/**
 * Constructor
 */
var Promise = function() {

    this.pending = {
        success: [],
        failure: [],
        progress: []
    };

    this.returnedPromise;

    this.complete = function(fnArray, fnArg) {
        var fn;
        while(fn = fnArray.shift()) {
            fnArg = fn(fnArg);
        }
        if(this.returnedPromise) {
            this.returnedPromise.resolve(fnArg);
        }
        this.handled = fnArray;
        this.resolve = this.reject = function(){throw new Error('Promise has been resolved');};
    }

}

/**
 * Define callbacks to run when the promise is completed.
 * @param function success
 * @param function failure
 * @param function progress
 */
Promise.prototype.then = function(success, failure, progress) {
    this.returnedPromise = new Promise();
    if(typeof success === 'function') {
        this.pending.success.push(success);
    }
    if(typeof failure === 'function') {
        this.pending.failure.push(failure);
    }
    if(typeof progress === 'function') {
        this.pending.progress.push(progress);
    }
    if(this.handled) {
        this.complete(this.handled, this.value);
    }
    return this.returnedPromise;
}

/**
 * Resolve promise.
 * @param mixed arg
 */
Promise.prototype.resolve = function(arg) {
    this.value = arg;
    this.complete(this.pending.success, arg);
}

/**
 * Reject promise.
 * @param mixed arg
 */
Promise.prototype.reject = function(arg) {
    this.value = arg;
    this.complete(this.pending.failure, arg);
}

/**
 * Get progress on promise.
 * @param mixed arg
 */
Promise.prototype.progress = function(arg) {
    var index,
        fns = this.pending.progress;
    for(index in fns) {
        fns[index](arg);
    }
}

exports.Promise = Promise;
