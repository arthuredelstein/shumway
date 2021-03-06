/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof console === 'undefined') {
  console = {
    log: print,
    info: print,
    error: print,
    warn: print,
    time: function () {},
    timeEnd: function () {}
  };
} else {
  print = console.log;
}

var dump = function (message) {
  putstr(message);
}

var addEventListener = function (type) {
  // console.log('Add listener: ' + type);
};

var microTasks = [], taskId = 0;
var setTimeout = function (fn) {
  fn = fn.bind(null);
  fn.id = ++taskId;
  microTasks.push(fn);
  return fn.id;
};
var clearTimeout = function (id) {
  for (var i = 0; i < microTasks.length; i++) {
    if (microTasks[i].id === id) {
      microTasks.splice(i, 1);
      return;
    }
  }
};

var self = this, window = this;

var navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:4.0) Gecko/20100101 Firefox/4.0'
};

// TODO remove document stub
var document = {
  createElementNS: function (ns, qname) {
    if (qname !== 'svg') {
      throw new Error('only supports svg and create SVGMatrix');
    }
    return {
      createSVGMatrix: function () {
        return {a: 0, b: 0, c: 0, d: 0, e: 0, f: 0};
      }
    };
  },
  createElement: function (name) {
    if (name !== 'canvas') {
      throw new Error('only supports canvas');
    }
    return {
      getContext: function (type) {
        if (type !== '2d') {
          throw new Error('only supports canvas 2d');
        }
        return {};
      }
    }
  }
};

var XMLHttpRequest = function () {};
XMLHttpRequest.prototype = {
  open: function (method, url, async) {
    this.url = url;
    if (async === false) {
      throw new Error('Unsupported sync');
    }
  },
  send: function (data) {
    setTimeout(function () {
      try {
        console.log('XHR: ' + this.url);
        var response = this.responseType === 'arraybuffer' ?
          read(this.url, 'binary').buffer : read(this.url);
        if (this.responseType === 'json') {
          response = JSON.parse(response);
        }
        this.response = response;
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange && this.onreadystatechange();
        this.onload && this.onload();
      } catch (e) {
        this.error = e;
        this.readyState = 4;
        this.status = 404;
        this.onreadystatechange && this.onreadystatechange();
        this.onerror && this.onerror();
      }
    }.bind(this));
  }
}

window.screen = {
  width: 1024,
  height: 1024
};

/**
 * Runs micro tasks for a certain |duration| and |count| whichever comes first. Optionally,
 * if the |clear| option is specified, the micro task queue is cleared even if not all the
 * tasks have been executed.
 */
var microTaskQueueStopped = false;
var runMicroTaskQueue = function (duration, count, clear) {
  microTaskQueueStopped = false;
  var executedTasks = 0;
  var stopAt = Date.now() + duration;
  while (microTasks.length > 0 && !microTaskQueueStopped) {
    if (duration > 0 && Date.now() >= stopAt) {
      break;
    }
    if (count > 0 && executedTasks >= count) {
      break;
    }
    var task = microTasks.shift();
    task.call(this);
    executedTasks ++;
  }
  if (clear) {
    microTasks.length = 0;
  }
  microTaskQueueStopped = true;
};

var stopMicroTaskQueue = function () {
  microTaskQueueStopped = true;
};
