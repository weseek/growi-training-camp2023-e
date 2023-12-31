const debug = require('debug')('growi:events:page');
const util = require('util');
const events = require('events');

function PageEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(PageEvent, events.EventEmitter);

PageEvent.prototype.onCreate = function(page, user) {
  debug('onCreate event fired');
};
PageEvent.prototype.onUpdate = function(page, user) {
  debug('onUpdate event fired');
};
PageEvent.prototype.onCreateMany = function(pages, user) {
  debug('onCreateMany event fired');
};
PageEvent.prototype.onAddSeenUsers = function(pages, user) {
  debug('onAddSeenUsers event fired');
};
module.exports = PageEvent;
