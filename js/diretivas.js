/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('diretivas', [ ])

// Número inteiro válido
.directive('validIntegerNumber', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      if(!ngModelCtrl) {
        return; 
      }
        
      ngModelCtrl.$parsers.push(function(val) {
        // Se tiver definido maxlength, impede de entrar com um número maior
        if(element[0].maxLength && val.length > element[0].maxLength)
            return val.substring(0, val.length - 1);    
        
        var clean = val.replace( /[^0-9]+/g, '');
        if (val !== clean) {
          ngModelCtrl.$setViewValue(clean);
          ngModelCtrl.$render();
        }
        return clean;
      });
      
      element.bind('keypress', function(event) {
        if(event.keyCode === 32) {
          event.preventDefault();
        }
      });
    }
  };
})

// Data em um input text
.directive('inputData', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      if(!ngModelCtrl) {
        return; 
      }
        
      ngModelCtrl.$parsers.push(function(val) {
        // Se tiver definido maxlength, impede de entrar com um número maior
        if(element[0].maxLength && val.length > element[0].maxLength)
            return val.substring(0, val.length - 1);    
        
        var clean = val.replace( /[^0-9/]+/g, '');
        if (val !== clean) {      
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
        }else if((val.length === 1 && val.charAt(0) === '/') || (val.length > 1 && val.charAt(val.length - 1) === '/' && val.charAt(val.length - 2) === '/') || ((val.match(/\//g) || []).length > 2)){ // analisa as barras
            clean = val.substr(0, val.length - 1);
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
        }/*else if(val.length == 3 || val.length == 6){
            clean = clean.substring(0, clean.length - 1) + '/' + clean.substring(clean.length - 1);
            ngModelCtrl.$setViewValue(clean);
            ngModelCtrl.$render();
        }*/
        return clean;
      });
      
      element.bind('keypress', function(event) {
        if(event.keyCode === 32) {      
          event.preventDefault();
        }
      });
    }
  };
});