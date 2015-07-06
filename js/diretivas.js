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
                if((clean.length === 1 && clean.charAt(0) === '/') || 
                   (clean.length > 1 && clean.charAt(clean.length - 1) === '/' && clean.charAt(clean.length - 2) === '/') || 
                   ((clean.match(/\//g) || []).length > 2)){ // máximo de 2 barras
                clean = clean.substr(0, clean.length - 1);
                render = true;
            }else if(backspace){
                // Se foi pressionado o backspace, verifica se o último caracter passou a ser uma barra
                if(clean.length > 0 && clean.charAt(clean.length - 1) === '/'){
                    // Remove a barra também
                    clean = clean.substring(0, clean.length - 1);
                    render = true;
                }
            }else // Acrescenta a barra
                if(clean.length == 3 || clean.length == 6){
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
})


// Telefone em um input text
.directive('validTelefone', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
      
          var backspace = false;
        
          ngModelCtrl.$parsers.push(function(val) {
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && val.length > element[0].maxLength)
                return val.substring(0, val.length - 1);    

            var clean = val.replace( /[^0-9\(\)]+/g, '');
            var render = false;
            if (val !== clean) render = true;
            else if(clean.length > 0){
                // Caractere ')' só pode existir na posição 3 (quarta posição) 
                if(clean.length !== 4 && clean.charAt(clean.length - 1) === ')'){
                    clean = clean.substr(0, clean.length - 1);
                    render = true; 
                }else // Caractere '(' só pode existir na posição 0 
                    if(clean.length > 1 && clean.charAt(clean.length - 1) === '('){
                    clean = clean.substr(0, clean.length - 1);
                    render = true; 
                }else if(backspace){
                    // Se foi pressionado o backspace, verifica se o último caracter passou a ser um parentesis
                    if(clean.charAt(clean.length - 1) === ')' || clean.charAt(clean.length - 1) === '('){
                        // Remove o parentesis também
                        clean = clean.substring(0, clean.length - 1);
                        render = true;
                    }
                }else // Acrescenta o parêntesis de abertura
                    if(clean.length === 1 && clean.charAt(0) !== '('){
                    clean = '(' + clean;
                    render = true;
                }else // Acrescenta o parêntesis de fechamento
                    if(clean.length === 4 && clean.charAt(3) !== ')'){
                    clean = clean.substring(0, 3) + ')' + clean.substring(3);
                    render = true;
                }
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