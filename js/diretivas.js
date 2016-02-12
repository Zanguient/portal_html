/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.2 - 11/02/2015
 *  - inputMoney
 *
 *  Versão 1.0.1 - 16/11/2015
 *  - element[0].maxLength no firefox é igual a -1 quando não definido
 *
 *  Versão 1.0 - 03/09/2015
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
        if(element[0].maxLength && element[0].maxLength > 0 && val.length > element[0].maxLength)
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
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
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
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
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


// Agência bancária em um input text
.directive('validAgenciaBancaria', function() {
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
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
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

// Conta bancária em um input text
.directive('validContaBancaria', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
        
          var avaliaConta = function(val){
            //console.log("VAL: " + val);      
            
            var clean = val.replace( /[^0-9a-zA-Z-]+/g, '');
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
            
            var c = angular.uppercase(clean);
            if(c !== clean){ 
                clean = c;
                render = true;
            }
              
            // Altera o valor do input?
            if(render){
                ngModelCtrl.$setViewValue(clean);
                ngModelCtrl.$render(); 
            }
              
            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
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
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
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

.directive('inputMoney', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function ($scope, elem, attrs, ctrl) {
            if (!ctrl) return;
			
			(function($){$.fn.priceFormat=function(options){var defaults={prefix:'US$ ',suffix:'',centsSeparator:'.',thousandsSeparator:',',limit:false,centsLimit:2,clearPrefix:false,clearSufix:false,allowNegative:false,insertPlusSign:false};var options=$.extend(defaults,options);return this.each(function(){var obj=$(this);var is_number=/[0-9]/;var prefix=options.prefix;var suffix=options.suffix;var centsSeparator=options.centsSeparator;var thousandsSeparator=options.thousandsSeparator;var limit=options.limit;var centsLimit=options.centsLimit;var clearPrefix=options.clearPrefix;var clearSuffix=options.clearSuffix;var allowNegative=options.allowNegative;var insertPlusSign=options.insertPlusSign;if(insertPlusSign)allowNegative=true;function to_numbers(str){var formatted='';for(var i=0;i<(str.length);i++){char_=str.charAt(i);if(formatted.length==0&&char_==0)char_=false;if(char_&&char_.match(is_number)){if(limit){if(formatted.length<limit)formatted=formatted+char_}else{formatted=formatted+char_}}}return formatted}function fill_with_zeroes(str){while(str.length<(centsLimit+1))str='0'+str;return str}function price_format(str){var formatted=fill_with_zeroes(to_numbers(str));var thousandsFormatted='';var thousandsCount=0;if(centsLimit==0){centsSeparator="";centsVal=""}var centsVal=formatted.substr(formatted.length-centsLimit,centsLimit);var integerVal=formatted.substr(0,formatted.length-centsLimit);formatted=(centsLimit==0)?integerVal:integerVal+centsSeparator+centsVal;if(thousandsSeparator||$.trim(thousandsSeparator)!=""){for(var j=integerVal.length;j>0;j--){char_=integerVal.substr(j-1,1);thousandsCount++;if(thousandsCount%3==0)char_=thousandsSeparator+char_;thousandsFormatted=char_+thousandsFormatted}if(thousandsFormatted.substr(0,1)==thousandsSeparator)thousandsFormatted=thousandsFormatted.substring(1,thousandsFormatted.length);formatted=(centsLimit==0)?thousandsFormatted:thousandsFormatted+centsSeparator+centsVal}if(allowNegative&&(integerVal!=0||centsVal!=0)){if(str.indexOf('-')!=-1&&str.indexOf('+')<str.indexOf('-')){formatted='-'+formatted}else{if(!insertPlusSign)formatted=''+formatted;else formatted='+'+formatted}}if(prefix)formatted=prefix+formatted;if(suffix)formatted=formatted+suffix;return formatted}function key_check(e){var code=(e.keyCode?e.keyCode:e.which);var typed=String.fromCharCode(code);var functional=false;var str=obj.val();var newValue=price_format(str+typed);if((code>=48&&code<=57)||(code>=96&&code<=105))functional=true;if(code==8)functional=true;if(code==9)functional=true;if(code==13)functional=true;if(code==46)functional=true;if(code==37)functional=true;if(code==39)functional=true;if(allowNegative&&(code==189||code==109))functional=true;if(insertPlusSign&&(code==187||code==107))functional=true;if(!functional){e.preventDefault();e.stopPropagation();if(str!=newValue)obj.val(newValue)}}function price_it(){var str=obj.val();var price=price_format(str);if(str!=price)obj.val(price)}function add_prefix(){var val=obj.val();obj.val(prefix+val)}function add_suffix(){var val=obj.val();obj.val(val+suffix)}function clear_prefix(){if($.trim(prefix)!=''&&clearPrefix){var array=obj.val().split(prefix);obj.val(array[1])}}function clear_suffix(){if($.trim(suffix)!=''&&clearSuffix){var array=obj.val().split(suffix);obj.val(array[0])}}$(this).bind('keydown.price_format',key_check);$(this).bind('keyup.price_format',price_it);$(this).bind('focusout.price_format',price_it);if(clearPrefix){$(this).bind('focusout.price_format',function(){clear_prefix()});$(this).bind('focusin.price_format',function(){add_prefix()})}if(clearSuffix){$(this).bind('focusout.price_format',function(){clear_suffix()});$(this).bind('focusin.price_format',function(){add_suffix()})}if($(this).val().length>0){price_it();clear_prefix();clear_suffix()}})};$.fn.unpriceFormat=function(){return $(this).unbind(".price_format")};$.fn.unmask=function(){var field=$(this).val();var result="";for(var f in field){if(!isNaN(field[f])||field[f]=="-")result+=field[f]}return result}})(jQuery);

            ctrl.$formatters.unshift(function (a) {
				return $filter("currency")(ctrl.$modelValue, '')
            });


            ctrl.$parsers.unshift(function (viewValue) {
                              
				elem.priceFormat({
					prefix: '',
					centsSeparator: ',',
					thousandsSeparator: '.'
				});                
                         
                return elem[0].value;
            });
        }
    };
}])
		/*link: function(scope, element, attrs, ngModelCtrl) { 
      
          if(!ngModelCtrl) return; 
        
          var avaliaValor = function(val){
            //console.log("VAL: " + val);      
            
			// DÍGITO VEM DA DIREITA PARA A ESQUERDA
			
            var clean = val.replace( /[^0-9\,\.]+/g, '');
            var render = false;
            if (val !== clean) render = true;
            
			var idxStart = clean.indexOf(',');
			if(clean.length < 3 && idxStart > -1){
				clean = clean.substr(0, idxStart) + (clean.length > idxStart + 1 ? clean.substr(idxStart + 1) : "");
				idxStart = clean.indexOf(',');
				render = true;
			}
			
            // Só pode existir um ','
            var idxEnd = clean.lastIndexOf(',');
            while(idxEnd > -1 && idxStart !== idxEnd){
                clean = clean.substr(0, idxEnd) + clean.substr(idxEnd + 1);
                idxEnd = clean.lastIndexOf(',');  
                render = true;
            }
            
            // Após o ',' só pode existir dois dígitos no máximo
            if(idxStart > -1 && clean.length > idxStart + 3){
                clean = clean.substr(0, idxStart + 3); 
                render = true;    
            }
              
            // Altera o valor do input?
            if(render){
                ngModelCtrl.$setViewValue(clean);
                ngModelCtrl.$render(); 
            }
              
            // Retorna o valor utilizado
            // Se tiver definido maxlength, impede de entrar com um número maior
            if(element[0].maxLength && element[0].maxLength > 0 && clean.length > element[0].maxLength)
                return clean.substring(0, element[0].maxLength);
              
            return clean;   
          };
        
          // Mudança direta do ng-model
          ngModelCtrl.$formatters.push(function(val) {
              return avaliaValor(val);
          });
          // Mudança direta no input text
          ngModelCtrl.$parsers.push(function(val) {
              return avaliaValor(val);
          });
         
          element.bind('keydown', function(event) {
            if(event.keyCode === 8) backspace = true; // backspace
          });    

          element.bind('keypress', function(event) {
            if(event.keyCode === 32) event.preventDefault(); // espaço
          });
		}
    };
})*/


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
