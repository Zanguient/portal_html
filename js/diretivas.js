/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

angular.module('diretivas', ['ui.bootstrap'])

// Número inteiro válido
.directive('validIntegerNumber', function() {
  return {
    require: 'ngModel',
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

/*.directive('inputNumber', function() {
  return {
    restrict: 'AE', //attribute or element
      scope: {
          model: '=',
        },
      template: '<input class="form-control" type="text" ng-model="model"/>', 
      replace: true,
      link: function($scope, element, attrs, ngModelCtrl) { 
          
        var onlyDigits = function(val){
            if(typeof val === 'undefined') return '';    

            var clean = val.replace( /[^0-9]+/g, '');

            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(typeof element[0].maxLength === 'number' && 
               element[0].maxLength > 0 && 
               clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);

            return clean;   
          };
        
          element.bind('propertychange keyup change paste', function (event) {
                // Altera o valor
                var old = element.val();
                var fix = onlyDigits(old);
                while(old !== fix){
                    element.val(fix); 
                    old = fix;
                    fix = onlyDigits(old);
                }
          });
      }
      
  };
})*/

// Data em um input text
.directive('validData', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
      
          var backspace = false;
        
          var avaliaData = function(val){   

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
            if(element[0].maxLength && clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength); 
            return clean;
          };
        
          // Mudança direta no input text
          ngModelCtrl.$parsers.push(function(val) {
              return avaliaData(val);
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
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
      
          var backspace = false;
        
          var avaliaNumeroTelefone = function(val){
            //console.log("VAL: " + val);      
            
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
            
            // Pode ser que tenha acontecido um Ctrl + C, Ctrl + V
            if(clean.length > 0){
                // Formata
                if(clean.charAt(0) !== '('){ 
                    clean = '(' + clean;
                    render = true;
                }
                if(clean.length >= 4 && clean.charAt(3) !== ')'){ 
                    clean = clean.substring(0, 3) + ')' + clean.substring(3);
                    render = true;
                }
                // Remove os '(' dos locais indevidos
                var idx = clean.lastIndexOf('(');
                while(idx > -1 && idx !== 0){
                    clean = idx < clean.length ? clean.substr(0, idx) + clean.substr(idx + 1) : clean.substr(0, idx);
                    idx = clean.lastIndexOf('(');    
                    render = true;
                }
                // Remove os ')' dos locais indevidos
                idx = clean.lastIndexOf(')');
                //if(idx === 3) clean.indexOf(')');
                while(idx > -1 && idx !== 3){
                    clean = idx < clean.length ? clean.substr(0, idx) + clean.substr(idx + 1) : clean.substr(0, idx);   
                    idx = clean.lastIndexOf(')');
                    //if(idx === 3) clean.indexOf(')');
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
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);
            return clean;   
          };
        
          // Mudança direta do ng-model
          ngModelCtrl.$formatters.push(function(val) {
              return avaliaNumeroTelefone(val);
          });
          // Mudança direta no input text
          ngModelCtrl.$parsers.push(function(val) {
              return avaliaNumeroTelefone(val);
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


// Conta bancária em um input text
.directive('validContaBancaria', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
        
          var avaliaConta = function(val){
            //console.log("VAL: " + val);      
            
            var clean = val.replace( /[^0-9-]+/g, '');
            var render = false;
            if (val !== clean) render = true;
            
            // Só pode existir um '-'
            var idxStart = clean.indexOf('-');
            var idxEnd = clean.lastIndexOf('-');
            while(idxEnd > -1 && idxStart !== idxEnd){
                clean = clean.substr(0, idxEnd) + clean.substr(idxEnd + 1);
                idxEnd = clean.lastIndexOf('-');  
                render = true;
            }
            
            // Após o '-' só pode existir um único dígito
            if(idxStart > -1 && clean.length > idxStart + 2){
                clean = clean.substr(0, idxStart + 2); 
                render = true;    
            }
              
            // Altera o valor do input?
            if(render){
                ngModelCtrl.$setViewValue(clean);
                ngModelCtrl.$render(); 
            }
              
            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);
              
            return clean;   
          };
        
          // Mudança direta do ng-model
          ngModelCtrl.$formatters.push(function(val) {
              return avaliaConta(val);
          });
          // Mudança direta no input text
          ngModelCtrl.$parsers.push(function(val) {
              return avaliaConta(val);
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


// Força exibir sugestões do typeahead on focus 
.directive('focusMe', function($timeout, $parse) {
  return {
    //scope: { trigger: '@focusMe' },
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      /*element.bind('focus', function() {
         console.log('focus');
         //scope.$apply(model.assign(scope, false));
      });*/
    }
  }
})

.directive('typeaheadFocus', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModel) {

      //trigger the popup on 'click' because 'focus'
      //is also triggered after the item selection
      element.bind('click', function () {

        var viewValue = ngModel.$viewValue;

        //restore to null value so that the typeahead can detect a change
        if (ngModel.$viewValue == ' ') {
          ngModel.$setViewValue(null);
        }

        //force trigger the popup
        ngModel.$setViewValue(' ');

        //set the actual value in case there was already a value in the input
        ngModel.$setViewValue(viewValue || ' ');
      });

      //compare function that treats the empty space as a match
      scope.emptyOrMatch = function (actual, expected) {
          if (expected == ' ') return true; 
          //return actual.indexOf(expected) > -1;
          return (''+actual).toLowerCase().indexOf((''+expected).toLowerCase()) > -1
      };
    }
  };
})


// Username válido
/*.directive('validUsername', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 

        console.log(ngModelCtrl);
        
        var avaliaUsername = function(val){
            if(typeof val === 'undefined') return '';      

            var clean = val.replace(/[^a-zA-Z0-9\.\-\_\@]/g, '');
            var render = false;
            var regex = /[a-zA-Z]/g;
            if (val !== clean) render = true;
            else if(clean.length > 0){
                // Na primeira posição só pode existir letra minúscula
                if(!regex.test(clean.charAt(0))){
                    if(clean.length > 1) clean = clean.substr(1);
                    else clean = '';
                    render = true;
                }
            }
            
            var cleanLower = angular.lowercase(clean);
            if(cleanLower !== clean){
                clean = cleanLower;
                render = true;
            }
            
            // Altera o valor do input?
            if(render){
                ngModelCtrl.$setViewValue(clean);
                ngModelCtrl.$render(); 
            }

            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);
            return clean;   
          };
        
          // Mudança direta do ng-model
          ngModelCtrl.$formatters.push(function(val) {
              return avaliaUsername(val);
          });
          // Mudança direta no input text
          ngModelCtrl.$parsers.push(function(val) {
              return avaliaUsername(val);
          });
        
          element.bind('keypress', function(event) {
            if(event.keyCode === 32) event.preventDefault(); // espaço
          });

    }
  };
})*/

// Username válido
.directive('inputUsername', function() {
  return {
      restrict: 'AE', //attribute or element
      scope: {
          model: '=',
        },
      template: '<input class="form-control" type="text" ng-model="model"/>', 
      replace: true,
      link: function($scope, element, attrs, ngModelCtrl) { 
          
        var avaliaUsername = function(val){
            if(typeof val === 'undefined') return '';    

            var clean = val.replace(/[^a-zA-Z0-9\.\-\_\@]/g, '');
            var regex = /[a-zA-Z]/g;
            if (val === clean && clean.length > 0 && !regex.test(clean.charAt(0))){
                if(clean.length > 1) clean = clean.substr(1);
                else clean = '';
            }
            
            var cleanLower = angular.lowercase(clean);
            if(cleanLower !== clean) clean = cleanLower;

            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(typeof element[0].maxLength === 'number' && 
               element[0].maxLength > 0 && 
               clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);

            return clean;   
          };
        
          element.bind('propertychange keyup change paste', function (event) {
                // Altera o valor
                var old = element.val();
                var fix = avaliaUsername(old);
                while(old !== fix){
                    element.val(fix); 
                    old = fix;
                    fix = avaliaUsername(old);
                }
          });
    }
  };
})


// Email lowercase
/*.directive('inputEmail', function() {
  return {
      restrict: 'AE', //attribute or element
      scope: {
          model: '=',
        },
      template: '<input class="form-control" type="email" ng-model="model" placeholder="email@email.com"/>', 
      replace: true,
      link: function($scope, element, attrs, ngModelCtrl) { 
          element.bind('propertychange keyup change paste', function (event) {
                // Lowercase
                element.val(angular.lowercase(element.val())); 
          });
      }
  };
})*/;
