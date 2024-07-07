// wait for visible key elements
function wfke(selector, callback) {
    var el = document.querySelector(selector);
    if (el) return callback(el);
    setTimeout(wfke, 100, selector, callback);
}