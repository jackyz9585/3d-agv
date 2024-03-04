export function debounce(fn, delay, isImmediate) {
  var timer = null;
  return function() {
    var context = this;
    var args = arguments;
    clearTimeout(timer);
    if (isImmediate && timer === null) {
      fn.apply(context, args);
      timer = 0;
      return;
    }
    timer = setTimeout(function() {
      fn.apply(context, args);
      timer = null;
    }, delay);
  };
}
