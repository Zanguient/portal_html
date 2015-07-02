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
      
      if(!ngModelCtrl) return; 
        
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
        if(event.keyCode === 32) event.preventDefault(); // espaço
      });
    }
  };
})

// Data em um input text
.directive('inputData', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
      
          var backspace = false;
        
          ngModelCtrl.$parsers.push(function(val) {
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && val.length > element[0].maxLength)
                return val.substring(0, val.length - 1);    

            var clean = val.replace( /[^0-9/]+/g, '');
            var render = false;
            if (val !== clean) render = true;
            else // Impede que sejam colocadas barras nos locais não válidos para o formato de data 
                if((clear.length === 1 && clear.charAt(0) === '/') || 
                   (clear.length > 1 && clear.charAt(val.length - 1) === '/' && clear.charAt(val.length - 2) === '/') || 
                   ((clear.match(/\//g) || []).length > 2)){ // máximo de 2 barras
                clean = clear.substr(0, clear.length - 1);
                render = true;
            }else if(backspace){
                // Se foi pressionado o backspace, verifica se o último caracter passou a ser uma barra
                if(clear.length > 0 && clear.charAt(clear.length - 1) === '/'){
                    // Remove a barra também
                    clean = clean.substring(0, clean.length - 1);
                    render = true;
                }
            }else // Acrescenta a barra
                if(clear.length == 3 || clear.length == 6){
                clean = clean.substring(0, clean.length - 1) + '/' + clean.substring(clean.length - 1);
                render = true;
            }
              
            // Altera o valor do input?
            if(render){
                ngModelCtrl.$setViewValue(clean);
                ngModelCtrl.$render(); 
            }
            // Reajusta o valor do flag  
            backspace = false;
            // Retorna o valor utilizado
            return clean;
          });
         
          element.bind('keydown', function(event) {
            if(event.keyCode === 8) backspace = true; // backspace
          });    

          element.bind('keypress', function(event) {
            if(event.keyCode === 32) event.preventDefault(); // espaço
          });
    }
  };
});