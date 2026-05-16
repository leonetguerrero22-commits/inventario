(function(){var orig=window.goTab;window.goTab=function(tab){orig(tab);if(tab==='restaurante'){setTimeout(function(){if(typeof renderRestauranteInt==='function')renderRestauranteInt();},100);}};})();
