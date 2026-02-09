(function(){
  // Base dataLayer (GTM/GA4)
  window.dataLayer = window.dataLayer || [];
  window.dlPush = function(eventName, payload){
    window.dataLayer.push(Object.assign({ event: eventName }, payload || {}));
  };
})();
